import { Request, Response } from 'express';
import { BiddingService } from '../services/BiddingService';
import { RfqRepository } from '../repositories/RfqRepository';

// Dependency Injection
const rfqRepo = new RfqRepository();
const biddingService = new BiddingService(rfqRepo);

export class WebhookController {
    static async handleGoComet(req: Request, res: Response) {
        try {
            const result = await biddingService.processMarketUpdate(req.body);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    }
}