export type Role = "user" | "assistant" | "system";

export interface TextContent {
    type: "text";
    text: string;
}

export interface WidgetContent {
    type: "widget";
    widget: {
        type: string;
        props: Record<string, unknown>;
    };
}

export type MessageContent = TextContent | WidgetContent;

export interface Message {
    id: string;
    role: Role;
    content: MessageContent[];
    createdAt: string;
}

export interface ChatState {
    messages: Message[];
    isLoading: boolean;
    threadId: string | null;
}

// Events
export interface ChatEvent {
    type: string;
    [key: string]: unknown;
}
