import mongoose from 'mongoose';

export class Database {
    static async connect(): Promise<void> {
        try {
            const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/autopilot';
            await mongoose.connect(uri);
            console.log('Connected to MongoDB Cluster');
        } catch (error) {
            console.error('Database Connection Error:', error);
            process.exit(1);
        }
    }
}