import { AuthorChat } from './EnumTypes';

export interface CreateChatMessage {
    sessionId: string,
    content: string,
    author: AuthorChat
}

export interface ChatMessageResponse {
    id: string,
    sessionId: string,
    content: string,
    time: string,
    author: AuthorChat
}
