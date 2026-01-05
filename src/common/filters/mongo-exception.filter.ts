import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpStatus,
} from '@nestjs/common';
import { MongoError } from 'mongodb';

/**
 * A filter to handle MongoDB exceptions and provide appropriate HTTP responses.
 * 
 * This filter catches exceptions of type `MongoError` and maps them to specific
 * HTTP status codes and response messages based on the error code.
 * 
 * - If the error code is `11000` (duplicate key error), it responds with
 *   HTTP status `409 Conflict` and a message indicating a duplicate resource.
 * - For all other MongoDB errors, it responds with HTTP status `500 Internal Server Error`
 *   and a generic database error message.
 * 
 * @example
 * // Usage in a NestJS application
 * @UseFilters(MongoExceptionFilter)
 * 
 * @implements {ExceptionFilter}
 */
@Catch(MongoError)
export class MongoExceptionFilter implements ExceptionFilter {
    catch(exception: MongoError, host: ArgumentsHost) {
        const response = host.switchToHttp().getResponse();

        if (exception.code === 11000) {
            return response.status(HttpStatus.CONFLICT).json({
                message: 'Duplicate resource',
            });
        }

        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Database error',
        });
    }
}
