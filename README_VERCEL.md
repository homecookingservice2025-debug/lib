# Vercel Deployment Notes

This application is configured to run on Vercel using Serverless Functions for the API and static hosting for the frontend.

## SQLite Limitation
The application uses `better-sqlite3`. On Vercel, the filesystem is read-only. The API is configured to use `/tmp/library.db`, which is ephemeral. **Data will be lost** when the serverless function restarts (cold start).

For a production deployment with persistent data, it is highly recommended to:
1. Use a managed database like **Supabase**, **MongoDB Atlas**, or **Vercel Postgres**.
2. Deploy to a platform that supports persistent disks, such as **Render**, **Railway**, or a **VPS**.

## Blank Screen Fix
The `vercel.json` file includes rewrites to ensure that:
1. All `/api/*` requests are routed to the serverless function in `api/index.ts`.
2. All other requests are routed to `index.html` to support client-side routing (Single Page Application).
