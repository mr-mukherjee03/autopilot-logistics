import { Router } from 'express';
import { DashboardController } from './controllers/DashboardController';
import { AuthController } from './controllers/AuthController'; // (Assume implemented similar to Dashboard)

const router = Router();

// Dashboard Endpoints
router.get('/quotes', DashboardController.getQuotes);
router.post('/start-bidding', DashboardController.startBidding);
router.post('/stop-bidding', DashboardController.stopBidding);
router.get('/bidding-status/all', DashboardController.getAllStatus);
router.get('/bidding-status/:key', DashboardController.getStatus);
router.post('/save-bids', DashboardController.saveBids);
router.post('/set-auth-token', DashboardController.setToken);

// Auth & User Endpoints
router.get('/user', (req, res) => res.json({ user: { name: 'Admin', username: 'admin', isAdmin: true } })); // Mocked for simplicity
router.get('/check-global-token', async (req, res) => {
    // Check DB
    res.json({ hasGlobalToken: true });
});

// Logs (Empty implementation for now)
router.get('/logs/bids', (req, res) => res.json({ bids: [] }));
router.get('/logs/errors', (req, res) => res.json({ errors: [] }));

export default router;