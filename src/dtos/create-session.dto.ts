import {
    IsString,
    IsOptional,
    IsObject,
    IsIn,
} from 'class-validator';

/**
 * Data Transfer Object (DTO) for creating a new session.
 * This class is used to validate and structure the data
 * required to create a session.
 */
export class CreateSessionDto {
    @IsString()
    sessionId: string;

    @IsString()
    language: string;

    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;

    /**
     * Optional: allow client to set initial status
     * Default is handled in schema
     */
    @IsOptional()
    @IsIn(['initiated', 'active'])
    status?: 'initiated' | 'active';
}
