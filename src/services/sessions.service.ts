import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ConversationSession, ConversationSessionDocument } from '../schemas/conversation-session.schema';
import { ConversationEvent, ConversationEventDocument } from '../schemas/conversation-event.schema';

import { CreateSessionDto, AddEventDto } from '../dtos';

@Injectable()
export class SessionsService {
    constructor(
        @InjectModel(ConversationSession.name)
        private sessionModel: Model<ConversationSessionDocument>,
        @InjectModel(ConversationEvent.name)
        private eventModel: Model<ConversationEventDocument>,
    ) { }

    /**
     * Creates a new session or retrieves an existing one based on the provided session ID.
     * If a session with the given session ID does not exist, a new session is created with the
     * specified details. If a session already exists, it is returned without modification.
     *
     * @param createSessionDto - An object containing the details of the session to create or retrieve.
     * @returns A promise that resolves to the session document, either newly created or retrieved.
     */
    async createOrGetSession(createSessionDto: CreateSessionDto) {
        return this.sessionModel.findOneAndUpdate(
            { sessionId: createSessionDto.sessionId },
            {
                $setOnInsert: {
                    sessionId: createSessionDto.sessionId,
                    language: createSessionDto.language,
                    metadata: createSessionDto.metadata,
                    status: createSessionDto.status || 'initiated',
                    startedAt: new Date(),
                }
            },
            { new: true, upsert: true }
        );
    }

    /**
     * Adds an event to a session. If the session does not exist, a `NotFoundException` is thrown.
     * If an event with the same `eventId` already exists for the session, the existing event is returned
     * to ensure idempotent behavior.
     *
     * @param addEventDto - The data transfer object containing the event details.
     * @param sessionId - The ID of the session to which the event belongs.
     * @returns A promise that resolves to the created event document, or the existing event document
     *          if a duplicate event is detected.
     * @throws NotFoundException - If the session with the given `sessionId` does not exist.
     * @throws Error - If an error occurs during event creation that is not related to duplicate events.
     */
    async addEvent(addEventDto: AddEventDto, sessionId: string) {
        const sessionExists = await this.sessionModel.findOne({ sessionId });
        if (!sessionExists) {
            throw new NotFoundException(`Session with ID ${sessionId} not found`);
        }
        if (sessionExists?.status === 'completed') {
            throw new BadRequestException(`Cannot add events to a completed session`);
        }

        try {
            return await this.eventModel.create({
                sessionId,
                eventId: addEventDto.eventId,
                type: addEventDto.type,
                payload: addEventDto.payload,
                timestamp: addEventDto.timestamp ?? new Date(),
            });
        } catch (error) {
            // Duplicate event → idempotent behavior
            if (error.code === 11000) {
                return this.eventModel.findOne({
                    sessionId,
                    eventId: addEventDto.eventId,
                })
            }
            throw error;
        }

    }

    /**
     * Retrieves a session by its ID along with its associated events, with pagination support.
     *
     * @param sessionId - The unique identifier of the session to retrieve.
     * @param page - The page number for paginated event results (default is 1).
     * @param limit - The maximum number of events to retrieve per page (default is 10).
     * @returns An object containing the session details and a paginated list of associated events.
     * @throws NotFoundException - If no session is found with the given ID.
     */
    async getSessionById(sessionId: string, page: number = 1, limit: number = 10) {
        const session = await this.sessionModel.findOne({ sessionId });
        if (!session) {
            throw new NotFoundException(`Session with ID ${sessionId} not found`);
        }

        const events = await this.eventModel.find({ sessionId }).sort({ timestamp: 1 }).skip((page - 1) * limit).limit(limit);

        return {
            session,
            events,
        };

    }

    /**
     * Marks a session as completed by updating its status and setting the `endedAt` timestamp.
     * If the session is already completed or not found, it retrieves the session without updating it.
     *
     * @param sessionId - The unique identifier of the session to be completed.
     * @returns A promise that resolves to the updated session document if the status was changed,
     *          or the existing session document if no update was performed.
     */
    async completeSession(sessionId: string) {
        const updatedSession = await this.sessionModel.findOneAndUpdate(
            { sessionId, status: { $ne: 'completed' } },
            {
                $set: {
                    status: 'completed',
                    endedAt: new Date(),
                }
            },
            { new: true }
        );

        if (!updatedSession) {
            return this.sessionModel.findOne({ sessionId });
        }
        return updatedSession;
    }
}
