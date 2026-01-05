import { Test, TestingModule } from '@nestjs/testing';
import { SessionsController } from './sessions.controller';
import { SessionsService } from '../services/sessions.service';
import { NotFoundException } from '@nestjs/common';

describe('SessionsController', () => {
    let controller: SessionsController;
    let service: SessionsService;

    const mockSessionsService = {
        createOrGetSession: jest.fn(),
        addEvent: jest.fn(),
        getSessionById: jest.fn(),
        completeSession: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [SessionsController],
            providers: [
                {
                    provide: SessionsService,
                    useValue: mockSessionsService,
                },
            ],
        }).compile();

        controller = module.get<SessionsController>(SessionsController);
        service = module.get<SessionsService>(SessionsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // =============================
    // Create / Get Session
    // =============================
    it('should create or return existing session', async () => {
        const session = { sessionId: 's1', language: 'en' };
        mockSessionsService.createOrGetSession.mockResolvedValue(session);

        const result = await controller.createSession({
            sessionId: 's1',
            language: 'en',
        });

        expect(service.createOrGetSession).toHaveBeenCalledWith({
            sessionId: 's1',
            language: 'en',
        });
        expect(result.sessionId).toBe('s1');
    });

    // =============================
    // Add Event
    // =============================
    it('should add event to session', async () => {
        const event = { eventId: 'e1' };
        mockSessionsService.addEvent.mockResolvedValue(event);

        const dto = {
            eventId: 'e1',
            type: 'user_speech',
            payload: {},
            timestamp: new Date(),
        };

        const result = await controller.addEvent('s1', dto as any);

        expect(service.addEvent).toHaveBeenCalledWith(dto, 's1');
        expect(result).toEqual(event);
    });

    it('should propagate NotFoundException when session does not exist', async () => {
        mockSessionsService.addEvent.mockRejectedValue(
            new NotFoundException('Session not found'),
        );

        await expect(
            controller.addEvent('invalid', {
                eventId: 'e1',
                type: 'user_speech',
                payload: {},
                timestamp: new Date(),
            } as any),
        ).rejects.toThrow(NotFoundException);
    });

    // =============================
    // Get Session with Events
    // =============================
    it('should return session with events', async () => {
        const response = {
            sessionId: undefined,
            language: undefined,
            status: undefined,
            startedAt: undefined,
            endedAt: undefined,
            metadata: undefined,
            events: [
                {
                    eventId: 'e1',
                    type: 'user_speech',
                    timestamp: new Date('2026-01-05T13:47:02.154Z'),
                },
            ],
        };

        mockSessionsService.getSessionById.mockResolvedValue(response);

        const paginationDto = { page: 1, limit: 10 };
        const result = await controller.getSession('s1', paginationDto);

        expect(service.getSessionById).toHaveBeenCalledWith('s1', paginationDto.page, paginationDto.limit);
        expect(result).toEqual(response);
    });

    // =============================
    // Complete Session
    // =============================
    it('should complete session', async () => {
        const completedSession = { sessionId: 's1', status: 'completed' };
        mockSessionsService.completeSession.mockResolvedValue(completedSession);

        const result = await controller.completeSession('s1');

        expect(service.completeSession).toHaveBeenCalledWith('s1');
        expect(result.status).toBe('completed');
    });
});
