import mongoose from 'mongoose';
import { User } from './src/models/User';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/autopilot')
    .then(async () => {
        console.log('Connected to DB. Creating Admin User...');

        // Check if admin exists
        const exists = await User.findOne({ username: 'admin' });
        if (exists) {
            console.log('Admin already exists.');
        } else {
            await User.create({
                username: 'admin',
                password: 'admin123', // Change this!
                name: 'System Administrator',
                isAdmin: true,
                role: 'Super Admin'
            });
            console.log('✅ Admin user created: admin / admin123');
        }
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });