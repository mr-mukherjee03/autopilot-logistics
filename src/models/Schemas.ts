import mongoose, { Schema } from 'mongoose';

// 1. User Model (Authentication)
const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    isAdmin: { type: Boolean, default: false }
});

// 2. Saved Bids Model (Persist user inputs)
const SavedBidSchema = new Schema({
    enquiryKey: { type: String, required: true, unique: true },
    bids: { type: Schema.Types.Mixed }, // Stores high/med/low or cargo array
    updatedAt: { type: Date, default: Date.now }
});

// 3. System Config (Store Global Auth Token)
const SystemConfigSchema = new Schema({
    key: { type: String, default: 'global' },
    globalAuthToken: String,
    globalEmail: String,
    pricePercents: { type: Object, default: { high: 9, medium: 7, low: 5 } }
});

export const User = mongoose.model('User', UserSchema);
export const SavedBid = mongoose.model('SavedBid', SavedBidSchema);
export const SystemConfig = mongoose.model('SystemConfig', SystemConfigSchema);