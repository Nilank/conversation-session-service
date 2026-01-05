import {
    IsOptional,
    IsInt,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Data Transfer Object (DTO) for pagination parameters.
 * This class is used to validate and transform pagination-related query parameters.
 * 
 * Properties:
 * - `page` (optional): The page number to retrieve. Defaults to `1` if not provided.
 *   - Must be an integer greater than or equal to `1`.
 * - `limit` (optional): The number of items per page. Defaults to `20` if not provided.
 *   - Must be an integer greater than or equal to `1`.
 * 
 * Decorators:
 * - `@IsOptional()`: Marks the property as optional.
 * - `@Type(() => Number)`: Ensures the property is transformed to a number.
 * - `@IsInt()`: Validates that the property is an integer.
 * - `@Min(1)`: Ensures the property value is at least `1`.
 */
export class PaginationDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit = 20;
}
