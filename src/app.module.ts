import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionsController } from './controllers/sessions.controller';
import { SessionsService } from './services/sessions.service';
import {
  ConversationSession,
  ConversationSessionSchema,
} from './schemas/conversation-session.schema';
import {
  ConversationEvent,
  ConversationEventSchema,
} from './schemas/conversation-event.schema';

/**
 * The main application module for the Conversation Session Service.
 * 
 * This module is responsible for configuring the application, including:
 * - Loading environment variables globally using `ConfigModule`.
 * - Connecting to a MongoDB database using `MongooseModule` with the URI specified in the `MONGODB_URI` environment variable or a default URI.
 * - Defining Mongoose schemas for `ConversationSession` and `ConversationEvent` models.
 * - Registering the `SessionsController` to handle incoming requests.
 * - Providing the `SessionsService` for business logic and data handling.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/conversation-sessions'),
    MongooseModule.forFeature([
      {
        name: ConversationSession.name,
        schema: ConversationSessionSchema,
      },
      {
        name: ConversationEvent.name,
        schema: ConversationEventSchema,
      },
    ]),
  ],
  controllers: [SessionsController],
  providers: [SessionsService],
})
export class AppModule { }
