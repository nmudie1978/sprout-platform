# Youth Platform - Modern Architecture Documentation

## ✅ Modern Best Practices Implementation

### 🎯 Technical Stack

#### Core Technologies
- ✅ **Next.js 14.2** with App Router
- ✅ **React 18.3** with Server Components
- ✅ **TypeScript 5.5** in strict mode
- ✅ **Tailwind CSS 3.4** for styling
- ✅ **shadcn/ui** (Radix UI primitives)
- ✅ **Prisma 5.18** ORM
- ✅ **NextAuth.js 4.24** for authentication
- ✅ **TanStack Query 5.51** for data fetching
- ✅ **Framer Motion 11.3** for animations
- ✅ **next-themes** for dark mode support

### 📁 Project Structure

```
youth-platform/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/        # Protected routes layout
│   │   │   ├── dashboard/
│   │   │   ├── jobs/
│   │   │   ├── explore/
│   │   │   ├── ask-a-pro/
│   │   │   ├── profile/
│   │   │   ├── employer/
│   │   │   └── admin/
│   │   ├── auth/              # Auth pages
│   │   ├── api/               # API routes & Server Actions
│   │   ├── p/                 # Public profiles
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── theme-provider.tsx # Dark mode provider
│   │   ├── theme-toggle.tsx   # Theme switcher
│   │   ├── providers.tsx      # Client providers
│   │   └── navigation.tsx     # App navigation
│   ├── lib/
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── prisma.ts          # Prisma client
│   │   ├── utils.ts           # Utility functions
│   │   ├── rate-limit.ts      # Rate limiting
│   │   └── sanitize.ts        # Input sanitization
│   └── hooks/                 # Custom React hooks
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Database seeding
│   └── migrations/            # Database migrations
└── public/                    # Static assets
```

### 🏗️ Architecture Principles

#### 1. Server-First Architecture
- **Server Components by default** - Most components are Server Components
- **Client Components only when needed** - Marked with `"use client"` directive
- **Server Actions for mutations** - Used in forms and data updates
- **Edge-compatible APIs** - Ready for edge deployment

#### 2. Type Safety
```typescript
// TypeScript strict mode enabled
{
  "compilerOptions": {
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true
  }
}
```

#### 3. Component Organization

**Server Components** (Default):
- Page components
- Layouts
- Static content
- Data fetching components

**Client Components** (`"use client"`):
- Interactive forms
- Event handlers
- Browser APIs (localStorage, window)
- Third-party libraries requiring browser context
- React hooks (useState, useEffect, etc.)

### 🎨 Design System

#### Dark Mode Support
```tsx
// Theme Provider with system preference detection
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
  {children}
</ThemeProvider>
```

#### Tailwind Configuration
- **Mobile-first responsive design**
- **Custom color system** with HSL variables
- **Dark mode** via class strategy
- **Custom animations** (blob, shimmer, fade-in, slide-up)
- **Gradient utilities** for modern UI effects

#### CSS Custom Properties
```css
:root {
  /* Light mode */
  --background: 240 10% 98%;
  --foreground: 240 10% 3.9%;
  --primary: 262 80% 58%;
  /* ... */
}

.dark {
  /* Dark mode */
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  /* ... */
}
```

### 🔐 Authentication & Security

#### NextAuth.js Configuration
- **Magic link authentication** via email
- **Session management** with database strategy
- **Role-based access control** (YOUTH, EMPLOYER, ADMIN)
- **Protected API routes**
- **Secure session handling**

#### Security Features
- ✅ **Input sanitization** - All user inputs sanitized
- ✅ **Rate limiting** - API endpoints protected
- ✅ **CSRF protection** - Built into NextAuth
- ✅ **SQL injection prevention** - Prisma ORM parameterized queries
- ✅ **XSS prevention** - React's built-in escaping
- ✅ **Security headers** - CSP, HSTS, etc.

### 📊 Data Management

#### Prisma ORM
```typescript
// Efficient database queries with Prisma
const jobs = await prisma.microJob.findMany({
  where: { status: 'POSTED' },
  include: {
    postedBy: {
      select: {
        employerProfile: {
          select: { companyName: true }
        }
      }
    }
  },
  orderBy: { createdAt: 'desc' }
});
```

#### TanStack Query (React Query)
- **Client-side caching** for optimal performance
- **Automatic refetching** on focus/reconnect
- **Optimistic updates** for better UX
- **Loading and error states** built-in

```typescript
const { data, isLoading } = useQuery({
  queryKey: ['jobs'],
  queryFn: async () => {
    const response = await fetch('/api/jobs');
    return response.json();
  },
  staleTime: 60 * 1000,
});
```

### ♿ Accessibility

#### ARIA Best Practices
- ✅ Semantic HTML throughout
- ✅ ARIA labels for interactive elements
- ✅ Keyboard navigation support
- ✅ Screen reader announcements
- ✅ Focus management
- ✅ Color contrast ratios meet WCAG AA

#### Radix UI Primitives
All shadcn/ui components built on Radix UI:
- Built-in accessibility features
- Keyboard navigation
- Focus management
- ARIA attributes
- Screen reader support

### 🎯 CORE PRODUCT INVARIANT: Career Goals

**CRITICAL: Sprout is fundamentally driven by CAREER GOALS.**

Every user can have:
- **EXACTLY ONE Primary Career Goal** - The anchor, default lens for all personalisation
- **AT MOST ONE Secondary Career Goal** - Backup/alternative, always lower priority

**This is NOT flexible:**
- NO third, fourth, or unlimited goals
- NO "goal lists" or "career tracking arrays"
- NO ambiguous language ("your goals" plural without context)

#### Primary-First Behaviour
- Primary goal is the default lens for recommendations
- Primary goal appears first in all displays
- Primary goal is the "current focus" for insights
- If only one goal exists, it is ALWAYS the Primary

#### Visual Hierarchy
- Primary: Dominant, larger, more prominent
- Secondary: Lighter, smaller, clearly subordinate

#### API Contract
```typescript
// /api/goals - Single source of truth
interface GoalsResponse {
  primaryGoal: CareerGoal | null;  // The anchor goal
  secondaryGoal: CareerGoal | null; // Backup/alternative
}

interface CareerGoal {
  title: string;
  status: "exploring" | "committed" | "paused";
  confidence: "low" | "medium" | "high";
  timeframe: "this-year" | "1-2-years" | "3-plus-years";
  why: string;
  nextSteps: NextStep[];
  skills: string[];
  updatedAt: string;
}
```

#### Goal Setting Flow
1. User browses careers on `/careers`
2. User clicks "Learn More" on a career to open CareerDetailSheet
3. User clicks "Set as Primary Goal" or "Set as Secondary Goal"
4. If both slots full, SwapGoalModal prompts user to choose which to replace
5. Goal appears on `/goals` page (My Goals)

#### Files
- **API**: `/api/goals/route.ts` - GET/PUT/DELETE for goals
- **Types**: `/lib/goals/types.ts` - Goal type definitions
- **UI**: `/components/career-detail-sheet.tsx` - Goal setting with swap modal
- **Page**: `/app/(dashboard)/goals/page.tsx` - My Goals page

#### Deprecated (DO NOT USE)
- `/api/profile/career-goals` - Legacy 4-goal array system
- `/components/goal-manager-modal.tsx` - Legacy multi-goal selector

### 🚀 Performance Optimizations

#### Bundle Optimization
- **Code splitting** - Automatic with Next.js App Router
- **Dynamic imports** - For heavy components
- **Image optimization** - Next.js Image component
- **Font optimization** - Next.js Font optimization

#### Database Optimization
- **Connection pooling** - Supabase pooler (port 6543)
- **Direct connections** - For migrations (port 5432)
- **Efficient queries** - Prisma query optimization
- **Indexes** - Strategic database indexes

#### Caching Strategy
- **React Server Components** - Automatic caching
- **TanStack Query** - Client-side caching
- **Static Generation** - Where applicable
- **Revalidation** - On-demand and time-based

### 🎭 User Experience

#### Modern UI Patterns
- ✅ **Loading states** - Skeleton screens
- ✅ **Error boundaries** - Graceful error handling
- ✅ **Toast notifications** - User feedback
- ✅ **Optimistic updates** - Instant UI updates
- ✅ **Smooth animations** - Framer Motion & Tailwind
- ✅ **Responsive design** - Mobile-first approach

#### Animation System
```css
/* Custom animations */
@keyframes blob {
  0%, 100% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

/* Utility classes */
.hover-lift { transition: all 0.3s ease-out; }
.hover-lift:hover { transform: translateY(-4px); box-shadow: 0 20px 25px; }
.gradient-text { background-clip: text; color: transparent; }
```

### 🧪 Development Experience

#### Developer Tools
- ✅ **TypeScript** - Type safety and IntelliSense
- ✅ **ESLint** - Code linting
- ✅ **Prettier** (recommended) - Code formatting
- ✅ **Prisma Studio** - Database GUI
- ✅ **Hot Module Replacement** - Fast development

#### Scripts
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "db:generate": "prisma generate",
  "db:push": "prisma db push",
  "db:migrate": "prisma migrate dev",
  "db:seed": "tsx prisma/seed.ts",
  "db:studio": "prisma studio"
}
```

### 📦 Dependencies

#### Production Dependencies
- `next` - React framework
- `react` & `react-dom` - UI library
- `@prisma/client` - Database ORM
- `next-auth` - Authentication
- `@tanstack/react-query` - Data fetching
- `framer-motion` - Animations
- `next-themes` - Dark mode
- `tailwindcss` - Styling
- `@radix-ui/*` - UI primitives
- `zod` - Schema validation
- `ai` - AI SDK for OpenAI integration

#### Development Dependencies
- `typescript` - Type checking
- `@types/*` - Type definitions
- `prisma` - Database toolkit
- `tsx` - TypeScript execution
- `tailwindcss-animate` - Animation utilities
- `eslint` - Code linting

### 🔄 Data Flow

#### Request Flow
```
User Request
    ↓
Next.js App Router
    ↓
Server Component (RSC) ← Server Actions
    ↓
Prisma ORM
    ↓
Supabase PostgreSQL
    ↓
Response (Streaming/Static)
    ↓
Client Component (if needed)
    ↓
TanStack Query (caching)
    ↓
User sees result
```

### 🌐 API Design

#### RESTful API Routes
```typescript
// /api/jobs/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  const jobs = await prisma.microJob.findMany({
    where: category ? { category } : {},
  });

  return Response.json(jobs);
}
```

#### Server Actions
```typescript
// app/actions.ts
'use server'

export async function createJob(formData: FormData) {
  const data = Object.fromEntries(formData);

  await prisma.microJob.create({
    data: {
      title: data.title as string,
      // ...
    },
  });

  revalidatePath('/jobs');
}
```

### 🎯 Future Enhancements

#### Potential Improvements
- [ ] Edge runtime for API routes
- [ ] Progressive Web App (PWA)
- [ ] Image uploads with next/image
- [ ] Real-time features with WebSockets
- [ ] E2E testing with Playwright
- [ ] Storybook for component documentation
- [ ] Performance monitoring with Vercel Analytics
- [ ] Error tracking with Sentry

### 📝 Best Practices Checklist

#### Code Quality
- ✅ TypeScript strict mode
- ✅ ESLint configuration
- ✅ Consistent naming conventions
- ✅ Component composition over inheritance
- ✅ Custom hooks for reusable logic
- ✅ Proper error handling

#### Performance
- ✅ Server Components by default
- ✅ Client Components only when needed
- ✅ Code splitting
- ✅ Image optimization
- ✅ Database query optimization
- ✅ Caching strategies

#### Security
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ XSS prevention
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Secure authentication

#### Accessibility
- ✅ Semantic HTML
- ✅ ARIA attributes
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Color contrast
- ✅ Focus indicators

#### User Experience
- ✅ Loading states
- ✅ Error handling
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Smooth animations
- ✅ Toast notifications

---

## 🚀 Getting Started

1. Install dependencies:
```bash
npm install next-themes
```

2. Set up environment variables in `.env`:
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXTAUTH_SECRET="..."
EMAIL_SERVER_HOST="smtp.gmail.com"
# ...
```

3. Run database migrations:
```bash
npm run db:migrate
npm run db:seed
```

4. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000` with full dark mode support and modern best practices! 🎉
