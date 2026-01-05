import { metadata } from "reflect-metadata/no-conflict";
import { ConversationSession } from "../schemas/conversation-session.schema";

export class SessionsTransform {
    /**
     * Transforms a ConversationSession object into a response object.
     *
     * @param session - The ConversationSession instance to be transformed.
     * @returns An object containing the session's details, including:
     * - `sessionId`: The unique identifier of the session.
     * - `status`: The current status of the session.
     * - `language`: The language associated with the session.
     * - `startedAt`: The timestamp when the session started.
     * - `endedAt`: The timestamp when the session ended.
     * - `metadata`: Additional metadata related to the session.
     */
    static toResponse(session: ConversationSession) {
        return {
            sessionId: session?.sessionId,
            status: session?.status,
            language: session?.language,
            startedAt: session?.startedAt,
            endedAt: session?.endedAt,
            metadata: session?.metadata,
        };
    }

    /**
     * Transforms a session and its associated events into a detailed response object.
     *
     * @param params - An object containing the session and its associated events.
     * @param params.session - The session object to be transformed.
     * @param params.events - The events associated with the session.
     * @returns A detailed response object that includes the transformed session and its events.
     */
    static toDetailResponse({ session, events }) {
        return {
            ...this.toResponse(session),
            events
        };
    }
}