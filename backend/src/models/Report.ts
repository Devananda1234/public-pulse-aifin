import mongoose, { Schema, Document } from 'mongoose';
import { generateTrackingId } from '../utils/trackingId';

export interface IReport extends Document {
  id: string; // The PPAI tracking ID used by frontend
  title: string;
  description: string;
  category: string;
  severity: string;
  status: string;
  department?: string;
  location: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema: Schema = new Schema({
  id: { type: String, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  severity: { type: String, required: true },
  status: { type: String, default: 'Submitted' },
  department: { type: String },
  location: { type: String, required: true },
  image: { type: String }
}, { timestamps: true });

ReportSchema.pre('save', function(this: any) {
  if (!this.id) {
    this.id = generateTrackingId();
  }
});

ReportSchema.index({ id: 1 });

export default mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
