# Munawwara Care - Admin Frontend

This is the Admin Dashboard for Munawwara Care, built with **Next.js 14**, **Tailwind CSS**, and **Shadcn UI**.

## Features

- **Authentication**: Admin Login.
- **Dashboard Overview**: System statistics.
- **Moderator Management**: Create, View, and Delete moderators.
- **Request Management**: Approve or Reject moderator requests.
- **God Mode**: View all users and perform Soft/Hard deletes.

## Getting Started

### 1. Prerequisites
Ensure the **Admin Backend** is running on port `5001`.
```bash
cd ../mc_admin_backend
npm run dev
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Configuration
The API URL is configured in `src/lib/api.ts`. Default is `http://localhost:5001/api/admin`.
