# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Nuxt 4 billing application for tracking and invoicing VoIP/SIP telephony usage. It processes Call Detail Records (CDRs) from Sewan API, aggregates call costs by customer with configurable markup percentages, and generates PDF invoices.

## Common Commands

```bash
# Development
npm run dev              # Start dev server on localhost:3000
npm run build           # Build for production
npm run preview         # Preview production build

# Database
npx prisma generate     # Generate Prisma client
npx prisma migrate dev  # Run migrations in development
npx prisma studio       # Open Prisma Studio GUI
```

## Architecture

### Tech Stack
- **Framework**: Nuxt 4 with Vue 3 composition API
- **Database**: MySQL via Prisma ORM
- **UI**: Nuxt UI (v3) with Tailwind CSS v4
- **State**: Pinia stores with persistence
- **Auth**: JWT tokens stored in localStorage (server validates via Bearer tokens)
- **PDF Generation**: PDFKit for invoice generation

### Directory Structure
- `app/` - Nuxt 4 application root
  - `pages/` - File-based routing (auth/, customer/)
  - `components/` - Vue components
  - `store/` - Pinia stores (auth.ts)
  - `middleware/` - Route middleware (protected.ts, guest.ts)
  - `composables/` - Vue composables
  - `layouts/` - Layout components
- `server/` - Nitro server
  - `api/` - API endpoints organized by domain (auth/, customer/, cdr/)
  - `tasks/` - Scheduled tasks (cdr-monthly.ts)
- `prisma/` - Prisma schema and migrations
- `lib/` - Shared utilities (prisma.ts singleton)

### Data Model (Prisma)

**Core entities:**
- `Customer` - Client with pricing markup percentages (natioMobPourcent, natioFixPourcent, interMobPourcent, interFixPourcent) and relationships to subscriptions, SIP lines, DDI names, and monthly summaries
- `SipLine` - Maps Sewan SIP user descriptions to customers
- `DdiName` - DDI (Direct Dial-In) numbers assigned to customers
- `Subscription` - Fixed monthly services
- `MonthlyCdrSummary` - Aggregated call data per customer per month with cost breakdown by call type (national/international × mobile/fixed)

**Call type categories:**
- `natio_mob` - National mobile
- `natio_fix` - National fixed
- `inter_mob` - International mobile
- `inter_fix` - International fixed

### CDR Processing Flow

1. **Authentication**: Login to Sewan API (`sewanLogin`)
2. **Export Request**: Request CDR export for date range (`sewanRequestExport`)
3. **Polling**: Wait for file generation (`sewanPollForFile`)
4. **Processing**: Stream JSON, match SIP users to customers via `SipLine.descriptionName`
5. **Cost Calculation**:
   - Base cost from operator (field `cost`)
   - Calculate rate-based cost: `ceil(duration_sec/60) × rate_per_minute`
   - Apply customer markup percentage based on call type
6. **Aggregation**: Store in `MonthlyCdrSummary` with breakdown by call type
7. **Invoice Generation**: PDF with customer details, call breakdowns, subscriptions, and DDI charges

**Key file**: `server/api/cdr/generate.post.ts` - 460+ lines containing the entire CDR processing logic with BigInt-based monetary arithmetic (micro-units for precision).

### Authentication Flow

- Login stores JWT in localStorage and Pinia store
- `protected.ts` middleware checks token via `/api/auth/me`
- `guest.ts` middleware redirects authenticated users away from login/signup
- Server APIs validate `Authorization: Bearer {token}` header

### Environment Variables Required

```
DB_URI=mysql://...
SEWAN_USER=...
SEWAN_PASSWORD=...
SEWAN_LOGIN_URL=https://sbcng.sewan.be/api/login
SEWAN_CDR_URL=https://sbcng.sewan.be/api/cdr/
SEWAN_BASE_URL=https://sbcng.sewan.be
```

### Scheduled Tasks (Commented Out)

The `nuxt.config.ts` has commented Nitro scheduled tasks for automatic monthly CDR processing:
- `0 3 1 * *` - Read CDRs (1st of month, 3am)
- `0 4 1 * *` - Generate PDFs (1st of month, 4am)

### Pricing Logic

The application applies customer-specific markup percentages to operator rates. Each customer has 4 percentage fields that are added to the base rate (e.g., 15% markup = multiply by 1.15). The system:
1. Reads base rate from CDR (`rate.rate` field)
2. Classifies call type based on `category` (national/international) and `NumberType` (mobile/fixed)
3. Applies corresponding customer percentage
4. Stores both base cost (what operator charges) and billed cost (what customer pays)

### PDF Invoice Structure

Generated invoices include:
- Customer information (name, address)
- Monthly subscriptions with prices
- DDI charges (number of DDIs × ddiPrice)
- Call summary breakdown by type (count, duration, base cost, markup %, billed cost)
- Total amounts