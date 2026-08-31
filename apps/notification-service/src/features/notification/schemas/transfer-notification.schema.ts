import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TransferNotificationDocument =
  HydratedDocument<TransferNotification>;

@Schema({ timestamps: true })
export class TransferNotification {
  @Prop({ required: true })
  senderId: number;

  @Prop({ required: true })
  recipientId: number;

  @Prop({ required: true })
  amount: number;
}

export const TransferNotificationSchema =
  SchemaFactory.createForClass(TransferNotification);
