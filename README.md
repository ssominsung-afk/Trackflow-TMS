# TrackFlow TMS

A modern, web-based trucking shipment visibility and load tracking platform built with Next.js 14, Supabase, and Google Maps.

## Features

- **Dispatcher Dashboard**: Real-time load monitoring, exception feed, and quick-action summaries.
- **Load Management**: End-to-end load creation, dispatching, and lifecycle tracking.
- **Driver Tracking (MVP)**: Browser-based Geolocation API tracking that requires no app installation. Generates secure SMS-friendly tracking links.
- **Live Map**: Centralized Google Maps interface showing all active drivers, loads, and geofence radii.
- **Geofencing**: Automated status updates (`at_pickup`, `at_delivery`) when a driver enters facility radii.
- **Document Management**: Drag-and-drop BOL/POD uploading straight into Supabase Storage.
- **Carrier Compliance**: Mock compliance scoring and directory for managing active carrier partners.
- **Customer Portal**: Public tracking views for customers to see active and completed shipments.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Custom Design Tokens (Vanilla CSS)
- **Database/Auth**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Maps**: Google Maps JS API (`@react-google-maps/api`)
- **Icons**: Lucide React

## Getting Started

1. Clone repository
2. Install dependencies: `npm install`
3. Copy environment variables: `cp .env.example .env.local`
4. Fill in `.env.local` with your Supabase URL, Anon Key, Service Role Key, and Google Maps API Key.
5. Initialize Database: Run the contents of `supabase/schema.sql` and `supabase/seed.sql` in your Supabase SQL editor.
6. Run local server: `npm run dev`

## Architecture Highlights

- **RLS (Row Level Security)**: Highly secure Postgres policies ensure users only see data corresponding to their assigned `role` and `company_id`.
- **Realtime**: Leverages Supabase Realtime channels to push new location pings and notifications to the frontend without polling.
- **Server Actions**: Uses Next.js Server Actions and Route Handlers for secure data mutation.

## License

MIT
