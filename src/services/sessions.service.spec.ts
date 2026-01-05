import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { ConversationSession } from '../schemas/conversation-session.schema';
import { ConversationEvent } from '../schemas/conversation-event.schema';

describe('SessionsService', () => {
    let service: SessionsService;

    let sessionModel: any;
    let eventModel: any;

    beforeEach(async () => {
        sessionModel = {
            findOneAndUpdate: jest.fn(),
            findOne: jest.fn(),
            exists: jest.fn(),
        };

        eventModel = {
            create: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SessionsService,
                {
                    provide: getModelToken(ConversationSession.name),
                    useValue: sessionModel,
                },
                {
                    provide: getModelToken(ConversationEvent.name),
                    useValue: eventModel,
                },
            ],
        }).compile();

        service = module.get<SessionsService>(SessionsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // =============================
    // Create / Get Session
    // =============================
    it('should create or return existing session', async () => {
        const mockSession = { sessionId: 's1', language: 'en' };

        sessionModel.findOneAndUpdate.mockResolvedValue(mockSession);

        const result = await service.createOrGetSession({
            sessionId: 's1',
            language: 'en',
        });

        expect(sessionModel.findOneAndUpdate).toHaveBeenCalled();
        expect(result).toEqual(mockSession);
    });

    // =============================
    // Add Event
    // =============================
    it('should add event to existing session', async () => {
        sessionModel.findOne.mockResolvedValue({ sessionId: 's1', status: 'active' });

        const mockEvent = { eventId: 'e1' };
        eventModel.create.mockResolvedValue(mockEvent);

        const result = await service.addEvent({
            eventId: 'e1',
            type: 'user_speech',
            payload: {},
            timestamp: new Date(),
        }, 's1');

        expect(eventModel.create).toHaveBeenCalledWith({
            sessionId: 's1',
            eventId: 'e1',
            type: 'user_speech',
            payload: {},
            timestamp: expect.any(Date),
        });
        expect(result).toEqual(mockEvent);
    });

    it('should return existing event if duplicate eventId is sent', async () => {
        sessionModel.findOne.mockResolvedValue({ sessionId: 's1', status: 'active' });

        const duplicateError = { code: 11000 };
        eventModel.create.mockRejectedValue(duplicateError);

        const existingEvent = { eventId: 'e1', sessionId: 's1', type: 'user_speech', timestamp: new Date() };
        eventModel.findOne.mockResolvedValue(existingEvent);

        const result = await service.addEvent({
            eventId: 'e1',
            type: 'user_speech',
            payload: {},
            timestamp: new Date(),
        }, 's1');

        expect(eventModel.create).toHaveBeenCalledWith({
            sessionId: 's1',
            eventId: 'e1',
            type: 'user_speech',
            payload: {},
            timestamp: expect.any(Date),
        });
        expect(eventModel.findOne).toHaveBeenCalledWith({
            sessionId: 's1',
            eventId: 'e1',
        });
        expect(result).toEqual(existingEvent);
    });

    it('should throw NotFoundException when session does not exist', async () => {
        sessionModel.exists.mockResolvedValue(false);

        await expect(
            service.addEvent({
                eventId: 'e1',
                type: 'user_speech',
                payload: {},
                timestamp: new Date(),
            }, 'invalid-session'),
        ).rejects.toThrow(NotFoundException);
    });

    // =============================
    // Get Session with Events
    // =============================
    it('should return session with paginated events', async () => {
        const mockSession = { sessionId: 's1' };
        const mockEvents = [{ eventId: 'e1' }];

        sessionModel.findOne.mockResolvedValue(mockSession);
        eventModel.limit.mockResolvedValue(mockEvents);

        const result = await service.getSessionById('s1', 1, 10);

        expect(result.session).toEqual(mockSession);
        expect(result.events).toEqual(mockEvents);
    });

    it('should throw NotFoundException if session not found', async () => {
        sessionModel.findOne.mockResolvedValue(null);

        await expect(
            service.getSessionById('s1', 1, 10),
        ).rejects.toThrow(NotFoundException);
    });

    // =============================
    // Complete Session
    // =============================
    it('should complete session', async () => {
        const completedSession = { sessionId: 's1', status: 'completed' };

        sessionModel.findOneAndUpdate.mockResolvedValue(completedSession);

        const result = await service.completeSession('s1');

        expect(result?.status).toBe('completed');
    });

    it('should return existing session if already completed', async () => {
        sessionModel.findOneAndUpdate.mockResolvedValue(null);
        sessionModel.findOne.mockResolvedValue({
            sessionId: 's1',
            status: 'completed',
        });

        const result = await service.completeSession('s1');

        expect(result?.status).toBe('completed');
    });
});
