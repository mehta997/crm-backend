import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { encrypt, decrypt } from '../../common/utils/encryption';
import { v4 as uuidv4 } from 'uuid';

export type UserDocument = User & Document;

@Schema({ timestamps: true, toJSON: { getters: true }, toObject: { getters: true } })
export class User {
  @Prop({ default: () => uuidv4() })
  uid: string;

  @Prop()
  fullname?: string;

  @Prop({
    set: (val: string) => (val ? encrypt(val) : undefined),
    get: (val: string) => (val ? decrypt(val) : undefined),
  })
  pan_card?: string;

  @Prop({
    set: (val: string) => (val ? encrypt(val) : undefined),
    get: (val: string) => (val ? decrypt(val) : undefined),
  })
  aadhar_card?: string;

  @Prop()
  gst_no?: string;

  @Prop()
  email?: string;

  @Prop()
  phone_number?: string;

  @Prop({ default: () => uuidv4() })
  groupId?: string;

  @Prop()
  profile_pic?: string;

  @Prop()
  otp?: string;

  @Prop()
  otp_expiration?: Date;

  @Prop({ enum: ['SMS', 'EMAIL', 'APP'], default: 'SMS' })
  otp_mode?: string;

  @Prop({ default: 0 })
  otp_attempts?: number;

  @Prop()
  createdBy?: string;

  @Prop()
  updatedBy?: string;

  @Prop({ enum: ['super-admin', 'admin', 'staff', 'user'], default: 'user' })
  role?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Role' })
  role_id?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
