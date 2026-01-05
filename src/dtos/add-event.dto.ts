import {
    IsString,
    IsObject,
    IsIn,
    IsDateString,
    IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Data Transfer Object (DTO) for adding an event.
 * This class is used to validate and structure the data
 * required to create a new event in the conversation session service.
 */
export class AddEventDto {
    @IsString()
    eventId: string;

    @IsIn(['user_speech', 'bot_speech', 'system'])
    type: 'user_speech' | 'bot_speech' | 'system';

    @IsObject()
    payload: Record<string, any>;

    @IsOptional()
    @IsDateString()
    @Type(() => Date)
    timestamp?: Date;
}
