# Development Memory: Inventário

## Status Map
- **[x] Initialization**: Repo connected and environment assessed.
- **[x] Documentation**: System design and memory layer established.
- **[x] Core Hardening**: Refactored authentication and database patterns.
- **[x] Dashboard**: Optimized performance, decoupled logic, and modernized UI.
- **[x] Backup Management**: Implemented secure deletion and monitoring flow.
- **[ ] Asset Management**: Reviewing and enhancing inventory logic.
- **[ ] Documentation Module**: Securing and refining documentation storage.

## Architectural Decisions
1. **Prisma Singleton**: Implementing a strict singleton pattern to ensure resource efficiency and prevent connection leaks.
2. **JWT Session Strategy**: Using NextAuth JWT for stateless, high-performance session management.
3. **Module Pattern**: Organising business logic in `modules/` to separate concerns from the Next.js routing layer.

## Pending Actions
- [ ] Refactor `lib/prisma.ts` for singleton pattern.
- [ ] Enhance `lib/auth.ts` with detailed error handling.
- [ ] Decouple mock data from `Dashboard.tsx`.
