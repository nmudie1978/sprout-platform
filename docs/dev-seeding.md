# Development Data Seeding

This document explains how to seed the development database with realistic test data for local testing and development.

## Quick Start

```bash
# Seed scale data (100 youth, 100 employers, 300+ jobs, messages)
npm run db:seed-scale

# Reset and re-seed (clears existing scale data first)
npm run db:reset-scale

# Seed and start dev server
npm run dev:seed-and-start
```

## Seed Scripts Overview

| Script | Description |
|--------|-------------|
| `npm run db:seed` | Core seed data (categories, templates, etc.) |
| `npm run db:seed-demo` | Demo accounts for presentations |
| `npm run db:seed-scale` | Large-scale test data (100+ users) |
| `npm run db:reset-scale` | Reset scale data and re-seed |
| `npm run dev:seed-and-start` | Seed scale data then start dev server |

## Scale Data Seeding

The scale seed script (`prisma/seed-scale-data.ts`) creates:

- **100 youth users** (ages 15-23, mixed locations)
- **100 employer users** (verified adults, mixed companies)
- **250-400 jobs** (40% open, 30% assigned/in-progress, 30% completed)
- **400-800 messages** (conversations between youth and employers)
- **Shadow requests** (about 30% of youth have 1-3 requests)

### Deterministic Seeding

The seed script uses deterministic random generation. Running with the same seed produces identical data:

```bash
# Default seed (123)
npm run db:seed-scale

# Custom seed
SEED=456 npm run db:seed-scale

# Different seed = different data
SEED=789 npm run db:seed-scale
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SEED` | `123` | Random seed for deterministic data |
| `SCALE_DATA_RESET` | `false` | Set to `true` to wipe scale data before seeding |

### Email Domain

All scale test accounts use the email domain `@scale.sprout.test`. This makes it easy to identify and clean up test data:

```sql
-- Find all scale test users
SELECT * FROM "User" WHERE email LIKE '%@scale.sprout.test';

-- Delete all scale test data (handled by reset script)
DELETE FROM "User" WHERE email LIKE '%@scale.sprout.test';
```

## Test Credentials

After running `npm run db:seed-scale`, you can log in with these accounts:

### Youth Users (5 known accounts)

| Email | Password | Name | City |
|-------|----------|------|------|
| youth1@scale.sprout.test | Test1234! | Alex Thompson | Oslo |
| youth2@scale.sprout.test | Test1234! | Jordan Smith | Bergen |
| youth3@scale.sprout.test | Test1234! | Taylor Williams | Trondheim |
| youth4@scale.sprout.test | Test1234! | Morgan Davis | Stavanger |
| youth5@scale.sprout.test | Test1234! | Casey Brown | Oslo |

### Employer Users (5 known accounts)

| Email | Password | Company | City |
|-------|----------|---------|------|
| employer1@scale.sprout.test | Test1234! | Tech Solutions AS | Oslo |
| employer2@scale.sprout.test | Test1234! | Green Gardens | Bergen |
| employer3@scale.sprout.test | Test1234! | Family Services | Trondheim |
| employer4@scale.sprout.test | Test1234! | Nordic Consulting | Stavanger |
| employer5@scale.sprout.test | Test1234! | Local Market | Oslo |

## Career Shadows Mock API

The Career Shadows feature uses a mock provider in development that returns realistic shadow opportunities.

### Provider Configuration

Set the provider type via environment variable:

```bash
# Use mock provider (default in development)
CAREER_SHADOWS_PROVIDER=mock

# Use database provider (when opportunity table exists)
CAREER_SHADOWS_PROVIDER=db
```

### API Endpoints

#### Search Opportunities
```
GET /api/career-shadows/opportunities
```

Query parameters:
- `q` - Search keyword (title, category, description)
- `category` - Filter by category (Technology, Healthcare, etc.)
- `city` - Filter by city
- `remote` - Include remote opportunities (true/false)
- `age` - User's age for eligibility filtering
- `format` - WALKTHROUGH | HALF_DAY | FULL_DAY
- `limit` - Results per page (default 20)
- `offset` - Pagination offset

Example:
```bash
curl "http://localhost:3000/api/career-shadows/opportunities?q=developer&city=Oslo&limit=10"
```

#### Get Opportunity by ID
```
GET /api/career-shadows/opportunities/[id]
```

Example:
```bash
curl "http://localhost:3000/api/career-shadows/opportunities/opp_001"
```

#### Get Metadata (categories, cities)
```
GET /api/career-shadows/metadata
```

Returns available categories, cities, and format options for filtering UI.

### Mock Data

The mock provider generates 30-50 opportunities across these categories:
- Technology (Software Developer, Data Analyst, UX Designer)
- Healthcare (Nurse, Physical Therapist, Veterinarian)
- Design (Architect, Graphic Designer)
- Engineering (Civil Engineer, Mechanical Engineer)
- Finance (Accountant, Financial Analyst)
- Trades (Electrician, Plumber)
- Education (Teacher)
- Hospitality (Chef, Hotel Manager)
- Media (Journalist, Photographer)

## Data Integrity

The seed script ensures:

1. **No orphan records** - All foreign keys reference valid records
2. **Realistic timestamps** - Data created over the past 90 days
3. **Age eligibility** - Youth only apply to age-appropriate jobs
4. **Valid statuses** - Applications match job statuses logically
5. **English content** - All generated content is in English

## Troubleshooting

### Duplicate Key Errors

If you see duplicate key errors, run reset first:

```bash
npm run db:reset-scale
```

### Missing Dependencies

Ensure faker is installed:

```bash
npm install @faker-js/faker
```

### Database Connection Issues

Check your `.env` file has valid database URLs:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

## Extending the Seed Script

To add more seed data types, edit `prisma/seed-scale-data.ts`:

1. Add a generator function (e.g., `generateReviews()`)
2. Add a seeder function (e.g., `seedReviews()`)
3. Call from `main()` in the correct order (respect foreign keys)
4. Update counts in configuration section

## Related Documentation

- [Prisma Documentation](https://www.prisma.io/docs)
- [Faker.js Documentation](https://fakerjs.dev/)
