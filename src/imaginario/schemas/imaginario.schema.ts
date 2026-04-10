import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Imaginario {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  whatsapp: string;

  @Prop({ required: true, unique: true })
  documentId: string;

  @Prop()
  fullName: string;

  @Prop()
  team: string;

  @Prop({ type: [String], default: [] })
  events: string[];
}

export const ImaginarioSchema = SchemaFactory.createForClass(Imaginario);
