import { Request, Response } from 'express';
import { User } from '../models/User';

export class AuthController {

    // POST /api/login
    static async login(req: Request, res: Response) {
        const { username, password } = req.body;

        try {
            const user = await User.findOne({ username });

            if (user && user.password === password) {
                // Save session
                (req.session as any).user = {
                    id: user._id,
                    username: user.username,
                    name: user.name,
                    isAdmin: user.isAdmin
                };
                return res.json({ success: true, user: (req.session as any).user });
            }

            return res.status(401).json({ error: 'Invalid credentials' });
        } catch (error) {
            return res.status(500).json({ error: 'Login failed' });
        }
    }

    // POST /api/logout
    static async logout(req: Request, res: Response) {
        req.session.destroy((err) => {
            if (err) return res.status(500).json({ error: 'Logout failed' });
            res.json({ success: true });
        });
    }

    // GET /api/user
    static async getCurrentUser(req: Request, res: Response) {
        const user = (req.session as any).user;
        if (user) {
            res.json({ user });
        } else {
            // Dashboard.js expects this to redirect if 401
            res.status(200).json({ user: null });
        }
    }
}