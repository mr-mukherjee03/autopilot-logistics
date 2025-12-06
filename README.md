# Autopilot Logistics Platform

A centralized "Control Tower" for logistics bidding automation, designed to integrate with GoComet and future marketplaces.

## Architecture

- **Runtime:** Node.js (v18+)
- **Language:** TypeScript
- **Database:** MongoDB
- **Architecture:** Controller-Service-Repository (OOP)

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### Option A: Run with Docker (Recommended)

This will spin up both the backend and the database automatically.

1. **Clone the repository**
2. **Start the application:**
   ```bash
   docker-compose up --build
   ```
3. **Access the Dashboard:**
   - Open in your browser: `http://localhost:3000`

### Option B: Run Locally
1. Install Dependencies:
   ```bash
   npm install
   ```
2. Start MongoDB: Ensure you have a local MongoDB instance running on port 27017.
3. Setup Environment : Create a ```.env``` file in the root :   ```bash
    PORT=3000
    MONGO_URI=mongodb://localhost:27017/autopilot
    SESSION_SECRET=dev_secret

   ```

4. Run in Dev Mode:
    ```bash
    npm run dev
    ```

## Project Structure

```bash
src/
├── controllers/          # Controller logic
├── models/               # Mongoose models
├── routes/               # Route definitions
├── services/             # Business logic
├── utils/                # Utility functions
├── config/               # Configuration files
├── middlewares/          # Middleware functions
├── server.ts             # Main server file
└── types/                # TypeScript types
```

## Features

-   Automated Bidding: Detects GoComet auctions and places bids.
-   Auto-Extension Defense: Automatically adjusts strategy when auctions are extended.
-   Role-Based Access: Admin and Manager roles.
-   Persistent Storage: All bids and user data are stored in MongoDB.