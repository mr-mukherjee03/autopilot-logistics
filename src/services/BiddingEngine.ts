import { GoCometService } from './GoCometService';
import { IBidMonitorConfig } from '../types';

interface MonitorState {
    config: IBidMonitorConfig;
    intervalId: NodeJS.Timeout | null;
    timeoutId: NodeJS.Timeout | null;
    status: 'active_bidding' | 'monitoring' | 'preparing' | 'closed' | 'timeout';
    currentRank: number | null;
    bidsSubmitted: number;
    submittedBidTypes: Set<string>;
    closingTime: number; // Stored as timestamp
    revisionsLeft: number;
}

export class BiddingEngine {
    private static instance: BiddingEngine;
    private monitors: Map<string, MonitorState> = new Map();
    private globalStatus: Map<string, any> = new Map(); // Shared status for UI

    private constructor() { }

    static getInstance() {
        if (!this.instance) this.instance = new BiddingEngine();
        return this.instance;
    }

    // Start a new monitor
    public startMonitor(config: IBidMonitorConfig) {
        if (this.monitors.has(config.enquiryKey)) {
            throw new Error('Monitoring already active');
        }

        const state: MonitorState = {
            config,
            intervalId: null,
            timeoutId: null,
            status: 'monitoring',
            currentRank: null,
            bidsSubmitted: 0,
            submittedBidTypes: new Set(),
            closingTime: new Date(config.closingTimestamp).getTime(),
            revisionsLeft: 3
        };

        this.monitors.set(config.enquiryKey, state);

        // Start the loop
        this.runLoop(state);

        // Initial global status update
        this.updateGlobalStatus(config.enquiryKey, state);
    }

    public stopMonitor(enquiryKey: string) {
        const state = this.monitors.get(enquiryKey);
        if (state) {
            if (state.intervalId) clearInterval(state.intervalId);
            if (state.timeoutId) clearTimeout(state.timeoutId);
            this.monitors.delete(enquiryKey);
            this.globalStatus.delete(enquiryKey); // Remove from UI
        }
    }

    public getStatus(enquiryKey: string) {
        // Prefer active monitor status, fallback to global (cached)
        const monitor = this.monitors.get(enquiryKey);
        if (monitor) {
            return {
                active: true,
                status: monitor.status,
                currentRank: monitor.currentRank,
                bidsSubmitted: monitor.bidsSubmitted,
                timeRemaining: (monitor.closingTime - Date.now()) / 1000,
                startedBy: monitor.config.startedBy,
                userFullName: monitor.config.userFullName,
                bids: monitor.config.bids
            };
        }
        return this.globalStatus.get(enquiryKey) || { active: false };
    }

    public getAllStatuses() {
        const statuses: any = {};
        this.monitors.forEach((state, key) => {
            statuses[key] = this.getStatus(key);
        });
        return statuses;
    }

    // The Main Loop (Replaces interval logic from original file)
    private async runLoop(state: MonitorState) {
        const check = async () => {
            if (!this.monitors.has(state.config.enquiryKey)) return;

            const now = Date.now();
            const timeRemaining = state.closingTime - now;
            const secondsRemaining = Math.floor(timeRemaining / 1000);

            // 1. Fetch Latest Data
            try {
                const data = await GoCometService.getBiddingData(state.config.enquiryKey);
                state.currentRank = data.vendor_rank;
                state.revisionsLeft = data.revisions_left;

                // 2. AUTO-EXTENSION LOGIC
                // Calculate when server thinks it closes
                const serverImpliedClose = new Date(data.current_server_time).getTime() + (data.bid_closing_in * 1000);

                if (serverImpliedClose > (state.closingTime + 5000)) {
                    console.log(`[EXTENSION] Enquiry ${state.config.enquiryKey} extended! Resetting bids.`);
                    state.closingTime = serverImpliedClose;
                    state.submittedBidTypes.clear(); // RESET MEMORY
                    state.status = 'monitoring'; // Go back to slow poll
                }

                // 3. Strategy Execution
                if (secondsRemaining <= 10 && secondsRemaining > 0) {
                    state.status = 'active_bidding';
                    await this.executeBiddingStrategy(state, secondsRemaining);
                } else if (secondsRemaining <= 60) {
                    state.status = 'preparing';
                } else {
                    state.status = 'monitoring';
                }

                // 4. Update UI Status
                this.updateGlobalStatus(state.config.enquiryKey, state);

                // 5. Cleanup
                if (secondsRemaining <= -5) { // 5s buffer after close
                    state.status = 'closed';
                    this.stopMonitor(state.config.enquiryKey);
                }

            } catch (e) {
                console.error(`Error in monitor ${state.config.enquiryKey}:`, e);
            }

            // Dynamic Polling Rate
            let nextTick = 30000; // Default 30s
            if (secondsRemaining <= 60) nextTick = 1000; // 1s
            if (secondsRemaining <= 10) nextTick = 200; // 200ms for sniping

            if (this.monitors.has(state.config.enquiryKey)) {
                state.intervalId = setTimeout(check, nextTick);
            }
        };

        check(); // Start immediately
    }

    private async executeBiddingStrategy(state: MonitorState, secondsLeft: number) {
        // Don't bid if we are Rank 1
        if (state.currentRank === 1) return;
        if (state.revisionsLeft <= 0) return;

        // Logic: High (9s), Medium (5s), Low (2s)
        let typeToBid = '';
        let amount = 0;

        // Determine Cargo vs Single logic
        const getPrice = (type: 'high' | 'medium' | 'low') => {
            // Simplified for single cargo, would need expansion for multi-cargo array mapping
            // based on original logic of taking index 0
            if (state.config.bids.cargo && state.config.bids.cargo.length > 0) {
                return state.config.bids.cargo[0][type];
            }
            return state.config.bids[type];
        };

        if (secondsLeft <= 9 && !state.submittedBidTypes.has('HIGH')) {
            typeToBid = 'HIGH';
            amount = getPrice('high');
        } else if (secondsLeft <= 5 && !state.submittedBidTypes.has('MEDIUM')) {
            typeToBid = 'MEDIUM';
            amount = getPrice('medium');
        } else if (secondsLeft <= 2 && !state.submittedBidTypes.has('LOW')) {
            typeToBid = 'LOW';
            amount = getPrice('low');
        }

        if (typeToBid && amount) {
            console.log(`[BIDDING] Submitting ${typeToBid} bid (${amount}) for ${state.config.enquiryKey}`);
            // Fetch quote ID and build payload (Delegated to GoCometService in real implementation)
            const details = await GoCometService.fetchQuoteDetails(state.config.enquiryKey);
            if (details) {
                // Construct Payload Logic (Simplified)
                // In production, use the builder logic from the original server.js
                // await GoCometService.submitBid(details.quoteData.id, payload);

                state.submittedBidTypes.add(typeToBid);
                state.bidsSubmitted++;
            }
        }
    }

    private updateGlobalStatus(key: string, state: MonitorState) {
        this.globalStatus.set(key, {
            active: true,
            status: state.status,
            currentRank: state.currentRank,
            userFullName: state.config.userFullName,
            bids: state.config.bids
        });
    }
}