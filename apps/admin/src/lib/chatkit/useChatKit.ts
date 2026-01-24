import { useState, useCallback } from 'react';
import { supabase } from '@/shared/services/supabase';
import { Message } from './types';

interface UseChatKitOptions {
    threadId?: string;
    onWidget?: (widget: unknown) => void;
}

export function useChatKit({ threadId: initialThreadId }: UseChatKitOptions = {}) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [threadId] = useState<string | null>(initialThreadId || null);

    const sendMessage = useCallback(async (text: string) => {
        // 1. Optimistic Update
        const tempId = "temp_" + Date.now();
        const userMsg: Message = {
            id: tempId,
            role: "user",
            content: [{ type: "text", text }],
            createdAt: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            // 2. Fetch with SSE
            // Note: We use direct fetch because supabase.functions.invoke doesn't support streaming easily in all versions
            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-chat`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
                    },
                    body: JSON.stringify({
                        messages: [{ role: "user", content: text }],
                        threadId
                    })
                }
            );

            if (!response.ok) throw new Error('Failed to send message');
            if (!response.body) throw new Error('No response body');

            // 3. Reader Loop
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                // Parse SSE events (simple splitter)
                const lines = buffer.split('\n\n');
                buffer = lines.pop() || ""; // Keep incomplete chunk

                for (const line of lines) {
                    const eventMatch = line.match(/^event: (.*)$/m);
                    const dataMatch = line.match(/^data: (.*)$/m);

                    if (dataMatch) {
                        const eventType = eventMatch ? eventMatch[1].trim() : 'message';
                        const data = JSON.parse(dataMatch[1].trim());

                        handleEvent(eventType, data, (msgId) => {
                            // No-op or remove if unused logic
                            console.log("MsgId:", msgId);
                        });
                    }
                }
            }

        } catch (err) {
            console.error("Chat Error:", err);
            // TODO: Handle error state in UI
        } finally {
            setIsLoading(false);
        }
    }, [threadId]);

    const handleEvent = (type: string, data: unknown, setMsgId?: (id: string) => void) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payload = data as any;

        switch (type) {
            case 'thread.message.created':
                setMessages(prev => {
                    // Avoid dupes
                    if (prev.find(m => m.id === payload.id)) return prev;
                    return [...prev, {
                        id: payload.id,
                        role: payload.role,
                        content: [{ type: "text", text: "" }], // Start empty
                        createdAt: payload.created_at || new Date().toISOString()
                    }];
                });
                if (setMsgId) setMsgId(payload.id);
                break;

            case 'thread.message.delta':
                setMessages(prev => prev.map(msg => {
                    if (msg.id === payload.id) {
                        // Append content
                        // Simplified assumption: single text content
                        // In reality, could be array updates
                        const deltaText = payload.delta?.content?.[0]?.text || "";
                        const newContent = [...msg.content];
                        if (newContent[0].type === "text") {
                            newContent[0] = { ...newContent[0], text: newContent[0].text + deltaText };
                        }
                        return { ...msg, content: newContent };
                    }
                    return msg;
                }));
                break;

            case 'thread.item.created':
                // Widget handling
                if (payload.item?.type === 'tool_call' && payload.item.details) {
                    // Inject widget into the stream as a message or special item?
                    // For now, let's treat it as a message content item
                    // OR append a new system message with widget
                    const widgetMsg: Message = {
                        id: payload.item.id,
                        role: "assistant",
                        content: [{
                            type: "widget",
                            widget: payload.item.details as { type: string; props: Record<string, unknown> }
                        }],
                        createdAt: new Date().toISOString()
                    };
                    setMessages(prev => [...prev, widgetMsg]);
                }
                break;
        }
    };

    return {
        messages,
        sendMessage,
        isLoading
    };
}
