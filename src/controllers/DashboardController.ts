import { Request, Response } from 'express';
import { GoCometService } from '../services/GoCometService';
import { BiddingEngine } from '../services/BiddingEngine';
import { SavedBid, SystemConfig, User } from '../models/Schemas';

export class DashboardController {

    // GET /api/quotes
    static async getQuotes(req: Request, res: Response) {
        try {
            const rawQuotes = await GoCometService.fetchQuotesForDashboard();
            const engine = BiddingEngine.getInstance();

            // Map to dashboard.js format
            const quotes = await Promise.all(rawQuotes.map(async (q: any) => {
                // Fetch saved bids from DB
                const saved = await SavedBid.findOne({ enquiryKey: q.key });
                const details = await GoCometService.fetchQuoteDetails(q.key);
                const status = engine.getStatus(q.key);

                return {
                    enquiry_number: q.key,
                    display_number: q.name,
                    rank: q.vendor_rank || 'N/A',
                    status: q.status,
                    origin: q.origin,
                    destination: q.destination,
                    transport_type: `${q.shipment_type} ${q.mode}`,
                    cargo_quantity: q.quantity,
                    closing_time: q.bid_close_time,
                    company_name: q.client_company_name,
                    unit_details: details?.unitDetails,
                    bid_amounts: status.active ? status.bids : (saved?.bids || { low: '', medium: '', high: '' }),
                    bidding_active: status.active
                };
            }));

            res.json({ quotes });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch quotes' });
        }
    }

    // POST /api/start-bidding
    static async startBidding(req: Request, res: Response) {
        try {
            const { enquiryKey, enquiryNumber, closingTimestamp, bids } = req.body;
            const config = await SystemConfig.findOne({ key: 'global' });

            BiddingEngine.getInstance().startMonitor({
                enquiryKey,
                enquiryNumber,
                closingTimestamp,
                bids,
                authToken: config?.globalAuthToken || '',
                startedBy: 'admin', // In real app, use req.session.user
                userFullName: 'Administrator'
            });

            res.json({ success: true });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // POST /api/stop-bidding
    static async stopBidding(req: Request, res: Response) {
        const { enquiryKey } = req.body;
        BiddingEngine.getInstance().stopMonitor(enquiryKey);
        res.json({ success: true });
    }

    // GET /api/bidding-status/:key
    static async getStatus(req: Request, res: Response) {
        const status = BiddingEngine.getInstance().getStatus(req.params.key);
        res.json(status);
    }

    // GET /api/bidding-status/all (For polling)
    static async getAllStatus(req: Request, res: Response) {
        const statuses = BiddingEngine.getInstance().getAllStatuses();
        res.json({ statuses });
    }

    // POST /api/save-bids
    static async saveBids(req: Request, res: Response) {
        const { enquiryNumber, bids } = req.body;
        await SavedBid.findOneAndUpdate(
            { enquiryKey: enquiryNumber },
            { bids },
            { upsert: true }
        );
        res.json({ success: true });
    }

    // POST /api/set-auth-token
    static async setToken(req: Request, res: Response) {
        const { authToken } = req.body;
        await SystemConfig.findOneAndUpdate(
            { key: 'global' },
            { globalAuthToken: authToken },
            { upsert: true }
        );
        res.json({ success: true });
    }
}