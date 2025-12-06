import mongoose, { Schema, Document } from 'mongoose';

export interface IRfqDocument extends Document {
    enquiryKey: string;
    platform: 'GoComet';
    status: string;
    currentRank: number;
    closingTime: Date;
    lastKnownServerTime: Date;
    biddingHistory: Array<{
        amount: number;
        rank: number;
        timestamp: Date;
        type: 'HIGH' | 'MEDIUM' | 'LOW';
    }>;
}

const RfqSchema = new Schema({
    enquiryKey: { type: String, required: true, unique: true, index: true },
    platform: { type: String, default: 'GoComet' },
    status: { type: String, required: true },
    currentRank: { type: Number },
    closingTime: { type: Date, required: true }, //
    lastKnownServerTime: { type: Date },
    biddingHistory: [{
        amount: Number,
        rank: Number,
        timestamp: { type: Date, default: Date.now },
        type: String
    }]
}, { timestamps: true });

export default mongoose.model<IRfqDocument>('RFQ', RfqSchema);