import mongoose, { Document, Schema } from "mongoose";
import { ProviderEnum, ProviderEnumType } from "../enums/account-provider.enum";

export interface AccountDocument extends Document {
  provider: ProviderEnumType;
  providerId: string;
  userId: mongoose.Types.ObjectId;
  refreshToken: string | null;
  tokenExpiry: Date | null;
  createdAt: Date;
}

const accountSchema = new Schema<AccountDocument>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  provider: {
    type: String,
    enum: Object.values(ProviderEnum),
    required: true
  },
  providerId: {
    type: String,
    required: true,
    unique: true
  },
  refreshToken: {
    type: String,
    default: null
  },
  tokenExpiry: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.refreshToken

    }
  }
})


const Account = mongoose.model<AccountDocument>("Account", accountSchema);

export default Account
