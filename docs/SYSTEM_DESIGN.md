# System Design: Inventário

## Overview
This system is a robust inventory and infrastructure management platform designed for serious, real-world operation. It provides high-level visibility into assets, documentation, backup routines, and network diagrams.

## Technology Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: Prisma with SQLite (Development) / PostgreSQL (Production ready)
- **Authentication**: NextAuth.js with JWT Strategy
- **Styling**: Modern Vanilla CSS (Global & Module-based)
- **UI Components**: Lucide-React, Framer Motion, Recharts, Konva
- **Data Fetching**: SWR (Stale-While-Revalidate)

## Key Concepts
- **Asset Management**: Tracking lifecycle and status of physical and virtual assets.
- **Documentation**: Secure repository for technical procedures and credentials.
- **Infrastructure Visibility**: Real-time (simulated) monitoring and status alerts.
- **Security**: "Secure by Design" philosophy, ensuring all data access is authenticated and audited.

## Implementation Standards
1. **Clean Code**: Zero dead code, meaningful naming, and modular architecture.
2. **Secure by Design**: Input validation, encrypted credentials, and strict session management.
3. **Performance**: Optimized rendering, efficient data transfer, and smart caching.
4. **Reliability**: No prototypes; every feature is production-ready.
