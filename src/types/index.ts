export interface IGoCometQuote {
    enquiry_number: string;
    display_number: string;
    rank: number | string;
    status: string;
    origin: string;
    destination: string;
    transport_type: string;
    cargo_quantity: string[];
    closing_time: string | null;
    closing_timestamp: string | null;
    company_name: string;
    contact_person: string;
    quotes_sent: number;
    unit_details: any; // Complex object for multi-cargo
    bid_amounts: any;  // Saved bids
    bidding_active: boolean;
    bidding_data: any;
}

export interface IBidMonitorConfig {
    enquiryKey: string;
    enquiryNumber: string;
    closingTimestamp: string;
    bids: {
        high?: number;
        medium?: number;
        low?: number;
        cargo?: any[];
    };
    authToken: string;
    userFullName: string;
    startedBy: string;
    isPublicSubmission?: boolean;
}