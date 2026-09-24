export interface CreateChatSession {
    topic: string
}

export interface UpdateChatSession {
    topic: string
}

export interface ChatSessionResponse {
    id: string,
    userId: string,
    createdAt: string,
    topic: string
}
