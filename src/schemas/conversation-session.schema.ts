import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConversationSessionDocument = ConversationSession & Document;

@Schema({ timestamps: true })
export class ConversationSession {
    @Prop({ required: true, unique: true })
    sessionId: string;

    @Prop({
        enum: ['initiated', 'active', 'completed', 'failed'],
        default: 'initiated',
    })
    status: string;

    @Prop({ required: true })
    language: string;

    @Prop({ required: true })
    startedAt: Date;

    @Prop({ default: null })
    endedAt?: Date;

    @Prop({ type: Object })
    metadata?: Record<string, any>;
}

export const ConversationSessionSchema =
    SchemaFactory.createForClass(ConversationSession);


ConversationSessionSchema.index(
    { sessionId: 1 },
    { unique: true },
);
