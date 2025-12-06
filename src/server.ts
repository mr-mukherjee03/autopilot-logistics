import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import cors from 'cors';
import session from 'express-session';
import router from './routes';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(session({
    secret: 'gocomet-secret',
    resave: false,
    saveUninitialized: true
}));

// Serve Static Frontend Files (The "same html js files")
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api', router);

// Serve HTML for specific paths
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../public/dashboard.html')));
app.get('/enquiry/:key', (req, res) => res.sendFile(path.join(__dirname, '../public/enquiry.html')));
app.get('/settings', (req, res) => res.sendFile(path.join(__dirname, '../public/settings.html')));

// Connect DB & Start
mongoose.connect('mongodb://localhost:27017/autopilot')
    .then(() => {
        app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
    })
    .catch(err => console.error(err));