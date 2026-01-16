# Youth Platform - Setup Guide

## Quick Start

### Prerequisites

1. **Node.js 18+** and npm
2. **PostgreSQL database** (local or cloud)
3. **Email service** for magic links (optional for dev)

### Installation

```bash
# Navigate to project
cd youth-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and secrets
```

### Database Setup

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with career cards and demo data
npm run db:seed
```

### Run Development Server

```bash
npm run dev
```

Visit **http://localhost:3000**

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/youth_platform"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-random-secret-here"

# Email (for magic links)
EMAIL_SERVER="smtp://user:pass@smtp.example.com:587"
EMAIL_FROM="noreply@youthplatform.no"

# AI (Phase 5)
OPENAI_API_KEY="sk-..."
```

### Generate Secret

```bash
openssl rand -base64 32
```

## Development

```bash
npm run dev          # Start dev server
npm run db:studio    # Open Prisma Studio (DB GUI)
npm run lint         # Run ESLint
npm run build        # Production build
```

## Testing the Platform

### As a Youth User

1. Visit http://localhost:3000
2. Click "Get Started"
3. Enter email and select "Youth"
4. Choose age bracket (16-17 or 18-20)
5. Check email for magic link (or check console in dev)
6. Click link to authenticate
7. Browse jobs, apply, explore careers

### As an Employer

1. Visit http://localhost:3000/auth/signup?role=employer
2. Enter email and select "Employer"
3. Authenticate via magic link
4. Post a job
5. Review applications
6. Accept/reject applicants

## Database Tools

```bash
# View database in browser
npm run db:studio

# Create migration
npm run db:migrate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Re-seed data
npm run db:seed
```

## Project Structure

```
youth-platform/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── src/
│   ├── app/               # Next.js pages (App Router)
│   │   ├── (dashboard)/   # Protected routes
│   │   ├── api/           # API routes
│   │   └── auth/          # Auth pages
│   ├── components/        # React components
│   │   └── ui/            # shadcn/ui components
│   ├── lib/               # Utilities
│   │   ├── prisma.ts      # DB client
│   │   ├── auth.ts        # NextAuth config
│   │   ├── utils.ts       # Helper functions
│   │   └── validations/   # Zod schemas
│   └── types/             # TypeScript types
└── public/                # Static assets
```

## Features Implemented

### ✅ Phase 0: Foundation
- Next.js 14 + TypeScript
- PostgreSQL + Prisma
- NextAuth (magic links)
- Tailwind + shadcn/ui
- Complete DB schema

### ✅ Phase 1: Micro-Jobs Marketplace
- Job posting (employers)
- Job browsing with filters
- Job applications
- Application management
- Review system (structured ratings)
- Youth dashboard
- Employer dashboard

### 📝 Coming Next
- Phase 2: Youth profiles with skills tracking
- Phase 3: Career card swipe UI
- Phase 4: Ask a Pro Q&A
- Phase 5: AI assistant
- Phase 6: Polish & security

## Common Issues

### Database Connection Error

Check your `DATABASE_URL` in `.env` is correct. Test connection:

```bash
npx prisma db pull
```

### Magic Link Not Sending

In development, magic links appear in the console. For production, configure a real SMTP server in `EMAIL_SERVER`.

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill
```

## Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Database (Neon/Supabase/Vercel Postgres)

1. Create PostgreSQL database
2. Copy connection string
3. Add as `DATABASE_URL` environment variable
4. Run migrations via Vercel deploy or manually:

```bash
npm run db:push
npm run db:seed
```

## Support

- **Documentation**: README.md
- **API Reference**: See `/src/app/api/` folders
- **Database Schema**: `/prisma/schema.prisma`

---

**Ready to build!** Start with Phase 2 (Youth Profiles) or customize existing features.
