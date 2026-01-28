/**
 * useMoltyChat - React hook for Molty AI chat
 * 
 * Handles:
 * - Message state management
 * - SSE streaming from agent-chat edge function
 * - Loading/error states
 * - Quick actions
 */

import { useState, useCallback, useRef, useEffect } from 'react'

// Types
export interface ChatMessage {
    role: 'user' | 'assistant'
    content: string
    timestamp?: number
}

interface UseMoltyChatOptions {
    venueId?: string
    tableNo?: string
}

interface ChatState {
    messages: ChatMessage[]
    isLoading: boolean
    isStreaming: boolean
    error: string | null
    currentResponse: string
}

/**
 * Custom hook for Molty AI chat functionality
 */
export function useMoltyChat(options: UseMoltyChatOptions = {}) {
    const { venueId, tableNo } = options

    const [state, setState] = useState<ChatState>({
        messages: [],
        isLoading: false,
        isStreaming: false,
        error: null,
        currentResponse: '',
    })

    const abortControllerRef = useRef<AbortController | null>(null)

    // Get Supabase URL from environment
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

    // Initialize with welcome message
    useEffect(() => {
        if (state.messages.length === 0) {
            setState(prev => ({
                ...prev,
                messages: [{
                    role: 'assistant',
                    content: "Hi! I'm Molty, your AI waiter 🍽️ How can I help you today?",
                    timestamp: Date.now(),
                }],
            }))
        }
    }, [])

    /**
     * Send a message and stream the response
     */
    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim() || state.isLoading) return

        const userMessage: ChatMessage = {
            role: 'user',
            content: content.trim(),
            timestamp: Date.now(),
        }

        // Add user message immediately
        setState(prev => ({
            ...prev,
            messages: [...prev.messages, userMessage],
            isLoading: true,
            isStreaming: false,
            error: null,
            currentResponse: '',
        }))

        try {
            abortControllerRef.current = new AbortController()

            // Prepare messages for API (exclude timestamps)
            const apiMessages = [...state.messages, userMessage].map(m => ({
                role: m.role,
                content: m.content,
            }))

            const response = await fetch(`${supabaseUrl}/functions/v1/agent-chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${supabaseAnonKey}`,
                },
                body: JSON.stringify({
                    messages: apiMessages,
                    context: {
                        agent_type: 'guest',
                        venue_id: venueId,
                        table_no: tableNo,
                    },
                    stream: true,
                }),
                signal: abortControllerRef.current.signal,
            })

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(errorText || `Request failed: ${response.status}`)
            }

            // Handle SSE streaming
            const reader = response.body?.getReader()
            if (!reader) {
                throw new Error('No response body')
            }

            setState(prev => ({ ...prev, isStreaming: true }))

            const decoder = new TextDecoder()
            let buffer = ''
            let fullResponse = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                buffer += decoder.decode(value, { stream: true })
                const lines = buffer.split('\n')
                buffer = lines.pop() || ''

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim()
                        if (data === '[DONE]') continue

                        try {
                            const parsed = JSON.parse(data)
                            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                                fullResponse += parsed.delta.text
                                setState(prev => ({
                                    ...prev,
                                    currentResponse: fullResponse,
                                }))
                            }
                        } catch {
                            // Non-JSON line, could be text chunk directly
                            if (data && data !== '[DONE]') {
                                fullResponse += data
                                setState(prev => ({
                                    ...prev,
                                    currentResponse: fullResponse,
                                }))
                            }
                        }
                    }
                }
            }

            // Finalize message
            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: fullResponse || 'Sorry, I couldn\'t process that request.',
                timestamp: Date.now(),
            }

            setState(prev => ({
                ...prev,
                messages: [...prev.messages, assistantMessage],
                isLoading: false,
                isStreaming: false,
                currentResponse: '',
            }))

        } catch (error) {
            if ((error as Error).name === 'AbortError') {
                // Cancelled, keep what we have
                if (state.currentResponse) {
                    setState(prev => ({
                        ...prev,
                        messages: [...prev.messages, {
                            role: 'assistant',
                            content: prev.currentResponse,
                            timestamp: Date.now(),
                        }],
                        isLoading: false,
                        isStreaming: false,
                        currentResponse: '',
                    }))
                } else {
                    setState(prev => ({
                        ...prev,
                        isLoading: false,
                        isStreaming: false,
                    }))
                }
                return
            }

            setState(prev => ({
                ...prev,
                isLoading: false,
                isStreaming: false,
                error: error instanceof Error ? error.message : 'Chat failed',
                currentResponse: '',
            }))
        }
    }, [state.messages, state.isLoading, state.currentResponse, venueId, tableNo, supabaseUrl, supabaseAnonKey])

    /**
     * Cancel ongoing stream
     */
    const cancelStream = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            abortControllerRef.current = null
        }
    }, [])

    /**
     * Clear chat history
     */
    const clearChat = useCallback(() => {
        cancelStream()
        setState({
            messages: [{
                role: 'assistant',
                content: "Hi! I'm Molty, your AI waiter 🍽️ How can I help you today?",
                timestamp: Date.now(),
            }],
            isLoading: false,
            isStreaming: false,
            error: null,
            currentResponse: '',
        })
    }, [cancelStream])

    // Quick actions
    const showMenu = useCallback(() => {
        sendMessage('What\'s on the menu?')
    }, [sendMessage])

    const showPopularItems = useCallback(() => {
        sendMessage('What are your most popular items?')
    }, [sendMessage])

    const showVegetarianOptions = useCallback(() => {
        sendMessage('What vegetarian options do you have?')
    }, [sendMessage])

    const viewCart = useCallback(() => {
        sendMessage('What\'s in my cart?')
    }, [sendMessage])

    const placeOrder = useCallback(() => {
        sendMessage('I\'d like to place my order')
    }, [sendMessage])

    return {
        ...state,
        sendMessage,
        cancelStream,
        clearChat,
        // Quick actions
        showMenu,
        showPopularItems,
        showVegetarianOptions,
        viewCart,
        placeOrder,
    }
}
