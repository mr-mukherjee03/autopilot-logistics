import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // NOTE : hashing required
    name: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    role: {
        type: String,
        enum: ['Super Admin', 'Manager', 'Analyst'],
        default: 'Manager'
    }
});

export const User = mongoose.model('User', UserSchema);