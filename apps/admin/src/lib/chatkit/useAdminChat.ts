/**
 * Admin Chat Hook
 * 
 * Provides AI assistant for admin portal with platform management context.
 * Wraps base chat functionality with admin-specific features.
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/shared/services/supabase';
import { Message } from './types';

export interface PlatformSummary {
    totalVenues: number;
    pendingClaims: number;
    totalOrders: number;
    totalRevenue: number;
    currency: string;
}

interface UseAdminChatOptions {
    platformSummary?: PlatformSummary;
}

export function useAdminChat({ platformSummary }: UseAdminChatOptions = {}) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: [{ type: 'text', text: '👋 Hi! I\'m your Admin Assistant. I can help you with venue claims, platform analytics, and user management. What would you like to know?' }],
            createdAt: new Date().toISOString()
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendMessage = useCallback(async (text: string) => {
        // Build context for AI
        const contextStr = platformSummary
            ? `\n\nPlatform context: ${platformSummary.totalVenues} venues, ${platformSummary.pendingClaims} pending claims, ${platformSummary.totalOrders} orders, ${platformSummary.currency}${platformSummary.totalRevenue.toFixed(2)} total revenue.`
            : '';

        const fullText = text + contextStr;

        // Optimistic Update
        const tempId = "temp_" + Date.now();
        const userMsg: Message = {
            id: tempId,
            role: "user",
            content: [{ type: "text", text }],
            createdAt: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);
        setError(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            // Build message history for context
            const chatHistory = messages
                .filter(m => m.id !== 'welcome')
                .map(m => ({
                    role: m.role,
                    content: m.content[0]?.type === 'text' ? m.content[0].text : ''
                }));

            // Add current message
            chatHistory.push({ role: 'user', content: fullText });

            // Non-streaming request for tool handling (admin has no tools yet, but structure is ready)
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
                        messages: chatHistory,
                        context: {
                            agent_type: 'admin'
                        },
                        stream: false
                    })
                }
            );

            if (!response.ok) throw new Error('Failed to send message');

            const result = await response.json();

            // Add assistant response
            const assistantMsg: Message = {
                id: 'msg_' + Date.now(),
                role: 'assistant',
                content: [{ type: 'text', text: result.content || 'I apologize, but I couldn\'t process that request.' }],
                createdAt: new Date().toISOString()
            };

            setMessages(prev => [...prev, assistantMsg]);

        } catch (err) {
            console.error("Admin Chat Error:", err);
            setError(err instanceof Error ? err.message : 'Chat error');
        } finally {
            setIsLoading(false);
        }
    }, [messages, platformSummary]);

    const clearMessages = useCallback(() => {
        setMessages([
            {
                id: 'welcome',
                role: 'assistant',
                content: [{ type: 'text', text: '👋 Hi! I\'m your Admin Assistant. How can I help you manage the platform today?' }],
                createdAt: new Date().toISOString()
            }
        ]);
        setError(null);
    }, []);

    return {
        messages,
        sendMessage,
        isLoading,
        error,
        clearMessages
    };
}
