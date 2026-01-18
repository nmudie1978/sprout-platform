# Demo Data Seeding

This script creates realistic demo data for development and testing of the Sprout platform.

## Quick Start

```bash
# 1. Enable demo data in your .env
ENABLE_DEMO_DATA=true

# 2. Run the seed script
npm run db:seed-demo

# 3. To reset and reseed from scratch
DEMO_DATA_RESET=true npm run db:seed-demo
```

## Safety Controls

- **Production blocked**: Script refuses to run if `NODE_ENV=production`
- **Explicit opt-in**: Requires `ENABLE_DEMO_DATA=true` to run
- **Identifiable data**: All demo users use `@demo.sprout.local` email domain
- **Clean reset**: `DEMO_DATA_RESET=true` removes all demo data before reseeding
- **Idempotent**: Running multiple times won't create duplicates

## What Gets Seeded

### Demo Users (12 total)

**8 Teen Workers:**
| Email | Name | North Star Career | City |
|-------|------|------------------|------|
| emma.berg@demo.sprout.local | Emma B. | Lawyer | Oslo |
| noah.hansen@demo.sprout.local | Noah H. | Software Developer | Bergen |
| sofia.larsen@demo.sprout.local | Sofia L. | Nurse | Trondheim |
| oliver.johansen@demo.sprout.local | Oliver J. | Electrician | Stavanger |
| mia.olsen@demo.sprout.local | Mia O. | UX Designer | Oslo |
| lucas.nilsen@demo.sprout.local | Lucas N. | Teacher | Drammen |
| ella.pedersen@demo.sprout.local | Ella P. | Accountant | Fredrikstad |
| william.kristiansen@demo.sprout.local | William K. | Network Engineer | Sandnes |

**4 Job Posters:**
| Email | Name |
|-------|------|
| kari.nordmann@demo.sprout.local | Kari Nordmann |
| erik.svendsen@demo.sprout.local | Erik Svendsen |
| marie.haug@demo.sprout.local | Marie Haug |
| torstein.berg@demo.sprout.local | Berg Family |

**Password for all demo users:** `demo123`

### My Growth Data

- **Skills**: Core skills (communication, reliability, etc.) + career-aligned skills
- **Trust Signals**: ON_TIME, GOOD_COMMS, POSITIVE_TREND
- **Vault Items**: Saved careers, saved learning resources (courses)
- **Job Completions**: 4 completed jobs with structured feedback

### Messaging Data

- **Jobs**: 12 demo jobs (8 posted, 4 completed)
- **Conversations**: 6 conversation threads
- **Messages**: ~50 messages with realistic scheduling/confirmation content
- **Timestamps**: Messages span the last 14 days

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ENABLE_DEMO_DATA` | `false` | Must be `true` to run seeding |
| `DEMO_DATA_RESET` | `false` | Set `true` to delete existing demo data first |
| `NODE_ENV` | - | Must NOT be `production` |

## Cleanup

To remove all demo data without reseeding:

```bash
# In your code, the cleanup function can be called directly
# Or run reset without ENABLE_DEMO_DATA to trigger cleanup only
DEMO_DATA_RESET=true ENABLE_DEMO_DATA=true npm run db:seed-demo
```

Demo data is identified by the `@demo.sprout.local` email domain pattern.

## Testing My Growth

After seeding, sign in as any demo teen to see:

1. **North Star Banner**: Shows their career aspiration
2. **Skills Progress**: Career-aligned skills with progress indicators
3. **Vault**: Saved careers and learning resources
4. **Insights**: Generated from skill signals and completions

Recommended demo user for full experience: `emma.berg@demo.sprout.local`

## Testing Messaging

Sign in as a demo teen or employer to see:

1. **Inbox**: Multiple conversation threads
2. **Messages**: Realistic scheduling and confirmation messages
3. **Job Context**: Messages tied to specific job postings

## Notes

- Demo data uses legacy `content` field for messages (not templates) for readability
- All guardian consents are pre-approved for demo teens
- All employers are pre-verified for demo purposes
- No real email addresses are used
