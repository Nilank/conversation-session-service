import { Controller, Post, Get, Param, Body, Query, NotFoundException, BadRequestException } from '@nestjs/common';
import { SessionsService } from '../services/sessions.service';
import { CreateSessionDto, AddEventDto, PaginationDto } from '../dtos';
import { SessionsTransform } from '../transforms/sessions.transform';

@Controller('sessions')
export class SessionsController {
    constructor(private readonly sessionsService: SessionsService) { }

    @Post()
    /**
     * Handles the creation of a new session or retrieves an existing one based on the provided data.
     *
     * @param createSessionDto - The data transfer object containing the details required to create or retrieve a session.
     * @returns A transformed session response object.
     */
    async createSession(@Body() createSessionDto: CreateSessionDto) {
        const session = await this.sessionsService.createOrGetSession(createSessionDto);
        return SessionsTransform.toResponse(session);
    }

    @Post(':sessionId/events')
    /**
     * Adds an event to the specified session.
     *
     * @param sessionId - The unique identifier of the session to which the event will be added.
     * @param addEventDto - The data transfer object containing the details of the event to be added.
     * @returns The newly added event.
     */
    async addEvent(
        @Param('sessionId') sessionId: string,
        @Body() addEventDto: AddEventDto
    ) {
        const event = await this.sessionsService.addEvent(addEventDto, sessionId)
        return event;
    }

    @Get(':sessionId')
    /**
     * Retrieves a session by its ID and applies pagination to the result.
     *
     * @param sessionId - The unique identifier of the session to retrieve.
     * @param paginationDto - An object containing pagination parameters:
     *   - `page`: The page number to retrieve.
     *   - `limit`: The number of items per page.
     * @returns A detailed response of the session, transformed into the desired format.
     * @throws Will throw an error if the session cannot be found or if there is an issue with the service.
     */
    async getSession(
        @Param('sessionId') sessionId: string,
        @Query() paginationDto: PaginationDto
    ) {
        const result = await this.sessionsService.getSessionById(sessionId, paginationDto.page, paginationDto.limit);
        return SessionsTransform.toDetailResponse(result);
    }

    @Post(':sessionId/complete')
    /**
     * Marks a session as complete based on the provided session ID.
     *
     * @param sessionId - The unique identifier of the session to be completed.
     * @returns The transformed response of the completed session.
     * @throws NotFoundException - If no session is found with the given ID.
     */
    async completeSession(@Param('sessionId') sessionId: string) {
        const session = await this.sessionsService.completeSession(sessionId);
        if (!session) {
            throw new NotFoundException(`Session with ID ${sessionId} not found`);
        }
        return SessionsTransform.toResponse(session);
    }

}


