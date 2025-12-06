import axios, { AxiosInstance } from 'axios';
import { SystemConfig } from '../models/Schemas';

export class GoCometService {
    private static API_URL = 'https://enquiry.gocomet.com/api/v1/vendor';

    // Helper to get headers dynamically
    private static async getHeaders() {
        const config = await SystemConfig.findOne({ key: 'global' });
        const token = config?.globalAuthToken || '';
        return {
            'authorization': token,
            'accept': 'application/json',
            'ops-client-schema': 'app',
            'schema': 'app',
            'origin': 'https://app.gocomet.com',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        };
    }

    // Fetch and Transform Quotes for Dashboard
    static async fetchQuotesForDashboard() {
        const headers = await this.getHeaders();
        // - Fetch Spot Enquiries
        const url = `${this.API_URL}/enquiries/spot?page=1&size=15&reset_filter=false&filter[enquiry_type]=spot`;

        try {
            const response = await axios.get(url, { headers });
            const enquiries = response.data.enquiries || [];

            // Filter Open Enquiries
            return enquiries.filter((e: any) => e.status === 'Open' || e.status === 'open');
        } catch (error) {
            console.error('GoComet API Error:', error);
            throw new Error('Failed to fetch from GoComet');
        }
    }

    // Fetch detailed unit breakdown (Critical for Multi-Cargo)
    static async fetchQuoteDetails(enquiryKey: string) {
        const headers = await this.getHeaders();
        //
        const url = `${this.API_URL}/enquiries/${enquiryKey}/quotes`;
        const res = await axios.get(url, { headers });
        const quote = res.data[0];

        if (!quote) return null;

        // Parse Unit Details logic from original Node code
        let unitDetails = null;
        if (quote.charges_list?.['11_freight_charges']) {
            const freight = quote.charges_list['11_freight_charges'];
            const keys = Object.keys(freight).filter(k => k.startsWith('freight_charges_custom') && k !== 'display_name');

            if (keys.length > 0) {
                const charges = keys.map(k => ({
                    type: freight[k].display_name || k,
                    units: Number(freight[k].units) || 0,
                    unitName: freight[k].unit_name || 'UNIT',
                    description: `${freight[k].units} × ${freight[k].unit_name}`
                }));
                unitDetails = {
                    totalUnits: charges.reduce((sum, c) => sum + c.units, 0),
                    charges,
                    description: charges.map(c => c.description).join(' + ')
                };
            }
        }
        return { quoteData: quote, unitDetails };
    }

    // Submit a Bid
    static async submitBid(quoteId: string, payload: any) {
        const headers = await this.getHeaders();
        //
        await axios.put(`${this.API_URL}/quotes/${quoteId}/submit`, payload, { headers });
    }

    // Get Bidding Data (Timer/Rank)
    static async getBiddingData(enquiryKey: string) {
        const headers = await this.getHeaders();
        //
        const res = await axios.get(`${this.API_URL}/enquiries/${enquiryKey}/bidding-data`, { headers });
        return res.data;
    }
}