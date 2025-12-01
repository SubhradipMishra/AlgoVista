import mongoose, { Document, Schema } from "mongoose";

export interface ICertificate extends Document {
  userId: mongoose.Types.ObjectId;
  roadmapId: mongoose.Types.ObjectId | null;
  certificateId: string;
  issuedAt: Date;
  fileUrl: string;
}

const certificateSchema = new Schema<ICertificate>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  roadmapId: { type: Schema.Types.ObjectId, ref: "Roadmap", required: false },
  certificateId: { type: String, unique: true },
  issuedAt: { type: Date, default: Date.now },
  fileUrl: { type: String },
});

const CertificateModel = mongoose.model<ICertificate>(
  "Certificate",
  certificateSchema
);

export default CertificateModel;
