// Based on API Doc
export interface IGoCometEnquiry {
    key: string;              // The unique ID (e.g., "25120555C2")
    name: string;             // Display Name
    status: string;           // "Open"
    origin: string;           //
    destination: string;      //
    bid_close_timestamp: string; //
    vendor_rank?: number;     //
    quotes_sent: number;      //
}

// Based on Bidding Data API
export interface IBiddingData {
    bid_close_time: string;
    bid_closing_in: number;   // Seconds remaining (Critical for extension logic)
    current_server_time: string;
    vendor_rank: number;
    revisions_left: number;
}

export interface IBidPayload {
    enquiryKey: string;
    amounts: {
        high: number;
        medium: number;
        low: number;
    };
}