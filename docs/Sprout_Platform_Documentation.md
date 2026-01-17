# Sprout Youth Job Platform

## Comprehensive Platform Documentation

**Version:** 1.0
**Date:** January 2026
**Classification:** Internal & Stakeholder Use

---

# 1. Executive Summary

## 1.1 What is Sprout?

Sprout is a purpose-built digital platform connecting young people aged 15–20 in Norway with local, legal micro-jobs. The platform facilitates safe, age-appropriate work opportunities such as dog walking, babysitting, snow clearing, and tech assistance, while providing integrated career guidance through an AI-powered assistant.

## 1.2 Who Sprout Serves

### Primary User Groups

- **Youth Workers (Ages 15–20):** Young people seeking flexible, local work opportunities to gain experience, earn money, and explore career paths
- **Job Posters (Adults 18+):** Local employers, families, and community members needing help with small tasks and micro-jobs

### Secondary Stakeholders

- **Parents/Guardians:** Providing consent and oversight for minor workers
- **Educational Institutions:** Potential partners for career development integration
- **Municipalities:** Community engagement and youth employment support

## 1.3 Core Value Proposition

| For Youth | For Employers |
|-----------|---------------|
| Safe, legal work opportunities matched to age | Access to reliable young workers |
| Built-in compliance with labor laws | Verified worker profiles and ratings |
| AI-powered career guidance | Simple job posting and management |
| Earnings tracking and badges | Trust signals and review system |
| Profile building for future employment | Legal compliance handled automatically |

---

# 2. Target Audience

## 2.1 Teen Users (Ages 15–20)

### Demographics & Context

- Norwegian residents aged 15–20
- Two distinct age brackets with different legal permissions:
  - **Minors (15–17):** Subject to stricter labor regulations
  - **Young Adults (18–20):** Standard youth employment rules

### Goals & Motivations

- **Earn Money:** Flexible income for personal expenses
- **Gain Experience:** Build work history and references
- **Explore Careers:** Discover interests through practical work
- **Build Skills:** Develop professional soft skills (reliability, communication)
- **Independence:** Take responsibility and build confidence

### Key Needs

- Easy-to-use mobile interface
- Jobs that fit around school schedules
- Clear expectations and fair pay
- Safe working environments
- Recognition through badges and reviews
- Career guidance and mentorship

## 2.2 Adults / Job Posters

### Demographics & Context

- Adults aged 18+ in Norway
- Includes: families, local businesses, elderly residents, property managers
- Need help with tasks too small for traditional employment

### Goals & Motivations

- Find reliable help for household tasks
- Support youth in the community
- Flexible, on-demand workforce
- Cost-effective assistance for small jobs

### Key Needs

- Simple job posting process
- Verified, trustworthy workers
- Clear legal compliance
- Easy payment confirmation
- Two-way review system
- Repeat hiring capability

---

# 3. Core Features by User Role

## 3.1 Features for Youth

### Job Discovery
- Browse jobs by category (8 types: Babysitting, Dog Walking, Snow Clearing, Cleaning, DIY Help, Tech Help, Errands, Other)
- Filter by location, date, and pay
- Multiple view modes: Grid, List, and Map
- Age-appropriate filtering (only see eligible jobs)

### Applications & Tracking
- One-click apply with custom message
- Track application status (Pending, Accepted, Rejected, Withdrawn)
- Receive notifications on status changes
- View job history and upcoming work

### Profile Management
- Customizable display name and avatar
- Bio and skill tags
- Interest tags for job matching
- Availability status (Available, Busy, Not Looking)
- Public profile URL for sharing
- Career aspiration setting

### Earnings Dashboard
- View total and pending earnings
- Filter by period (monthly, yearly, all-time)
- Category-wise breakdown
- Payment confirmation tracking

### Ratings & Reviews
- Receive ratings from employers (1-5 stars)
- Four rating dimensions: Punctuality, Communication, Reliability, Overall
- Earn positive tags and written feedback
- Build reputation over time

### Achievement Badges
- 15 badge types recognizing milestones and behaviors
- Includes: First Job, Five Jobs, Quick Responder, Reliable, Category Master
- Visible on profile to employers

### AI Career Guide
- Ask questions about careers and next steps
- Get help drafting job applications
- Explore career cards with detailed information
- Personalized advice based on stated aspirations

### Ask a Pro
- Submit questions to industry professionals
- Get real-world career insights
- Browse published Q&A

### Recommendations
- Recommend friends for jobs
- Build community connections
- Help others find opportunities

## 3.2 Features for Employers

### Job Posting
- Create detailed job listings with:
  - Title and description
  - Category and required traits
  - Pay amount (fixed or hourly)
  - Location (with map coordinates)
  - Date/time and duration
  - Images and application deadline
- Automatic compliance validation
- Job templates for repeat postings

### Application Management
- View all applications with applicant profiles
- See completed jobs count and ratings
- Accept or reject applications
- Send messages to applicants

### Talent Discovery
- Browse youth worker profiles
- Search by skills and availability
- View ratings and reviews
- Send "pokes" to encourage applications

### Favorites & Notes
- Star preferred workers for quick rehiring
- Keep private notes on workers

### Payment & Completion
- Mark jobs as completed
- Confirm payment to worker
- Generate earnings records

### Analytics Dashboard
- Jobs posted and completed
- Spending by category
- Calendar view of schedules
- Application statistics

### Employer Profile
- Company name and logo
- Bio and website
- Verification badges (Age, EID)
- Public rating and reviews

## 3.3 Common Features

### Messaging
- Universal messaging between any users
- Conversation threads by job or general
- Read status tracking
- Do Not Disturb setting

### Trust Signals
- Verified employer badges
- Trust tiers (Bronze, Silver, Gold)
- Guardian consent indicators
- Review counts and averages

### Notifications
- Real-time notifications for key events
- Application updates
- New messages and pokes
- Review notifications
- System announcements

### Job Status Tracking
- Clear status workflow:
  - Draft → Posted → Assigned → In Progress → Completed → Reviewed
- Status reasons for changes
- Cancellation support at any stage

---

# 4. User Flow Overview

## 4.1 Youth Sign-up & Onboarding

```
1. REGISTRATION
   └── Enter email and password
   └── Provide date of birth (required)
   └── System calculates age bracket

2. PROFILE CREATION
   └── Choose display name
   └── Select avatar
   └── Add bio and skills (optional)
   └── Set career aspiration (optional)

3. VERIFICATION (if under 18)
   └── Enter guardian email
   └── System sends consent request
   └── Account status: PENDING_VERIFICATION
   └── Guardian clicks secure link
   └── Guardian approves consent
   └── Account status: ACTIVE

4. READY TO WORK
   └── Browse age-appropriate jobs
   └── Apply to opportunities
   └── Receive notifications
```

## 4.2 Posting a Job as an Employer

```
1. CREATE JOB
   └── Fill in job details (title, description, pay)
   └── Select category
   └── Set location and schedule
   └── Add required traits and images

2. COMPLIANCE CHECK (Automatic)
   └── System validates against labor laws
   └── Determines eligible age groups
   └── Shows warnings if issues found
   └── Rejects non-compliant jobs

3. PUBLISH
   └── Job goes live
   └── Visible to eligible youth
   └── Appears in search and browse

4. MANAGE APPLICATIONS
   └── Review incoming applications
   └── View applicant profiles
   └── Accept or reject candidates
   └── Message applicants
```

## 4.3 Job Application & Acceptance Flow

```
YOUTH APPLIES
   └── Finds interesting job
   └── Clicks "Apply"
   └── Writes application message
   └── System checks safety gates
   └── Application submitted
   └── Status: PENDING

EMPLOYER REVIEWS
   └── Receives notification
   └── Views application and profile
   └── Checks ratings and reviews
   └── Decides to accept/reject

ACCEPTANCE
   └── Employer clicks "Accept"
   └── Youth notified
   └── Job status: ASSIGNED
   └── Both parties can message

JOB EXECUTION
   └── Status: IN_PROGRESS
   └── Work completed
   └── Status: COMPLETED
```

## 4.4 Payment & Feedback Process

```
JOB COMPLETION
   └── Youth marks work done
   └── Employer confirms completion
   └── Employer confirms payment amount

PAYMENT RECORDING
   └── Earning record created
   └── Status: PENDING → CONFIRMED
   └── Added to youth earnings dashboard

MUTUAL REVIEW
   └── Both parties can leave reviews
   └── Rate: Punctuality, Communication, Reliability, Overall
   └── Add positive tags
   └── Write optional feedback

PROFILE UPDATES
   └── Ratings recalculated
   └── Trust tier updated
   └── Badges awarded if earned
```

---

# 5. Legal and Compliance Considerations (Norwegian Context)

## 5.1 Age-Based Restrictions

### Minors (Ages 15–17)

| Restriction Area | Rule |
|-----------------|------|
| Working Hours (School Term) | Max 12 hours/week, Max 2 hours on school days |
| Working Hours (Holidays) | Max 35 hours/week, Max 7 hours/day |
| Time of Day | 6:00 AM – 8:00 PM (age 15), 6:00 AM – 9:00 PM (ages 16-17) |
| Rest Between Shifts | Minimum 14 hours |
| Consecutive Work Days | Maximum 5 days |

### Young Adults (Ages 18–20)

| Restriction Area | Rule |
|-----------------|------|
| Working Hours | Max 40 hours/week, Max 9 hours/day |
| Time of Day | No restrictions |
| Rest Between Shifts | Minimum 11 hours |

## 5.2 Legal Working Hours for Minors

| Scenario | Maximum Duration |
|----------|-----------------|
| School day during term | 2 hours |
| Non-school day during term | 7 hours |
| Any day during school holidays | 7 hours |
| Weekly total (school term) | 12 hours |
| Weekly total (school holidays) | 35 hours |

## 5.3 Prohibited Job Types for Under-18s

The following work categories are **prohibited** for minors:

- Heavy machinery operation (forklifts, cranes, tractors)
- Construction, demolition, or roofing
- Work at heights
- Hazardous materials or chemical handling
- Alcohol or tobacco-related environments
- Heavy goods handling (over 12kg)
- Financial or cash handling responsibilities
- Passenger transport or driving requirements
- Industrial cleaning with dangerous chemicals

### Restricted Categories (Allowed with Conditions)

| Category | Conditions for Minors |
|----------|----------------------|
| Babysitting | Not alone after 8 PM, adult must be reachable |
| Snow Clearing | Manual only, no heavy machinery |
| Cleaning | No industrial chemicals, no work at heights |
| DIY Help | Light tasks only, no electrical/plumbing |
| Errands | No alcohol purchases, no items over 12kg, no driving |

## 5.4 Payment Minimums and Traceability

### Minimum Wage Guidelines

| Age Group | Minimum Hourly Rate |
|-----------|-------------------|
| Youth (15-17) | 130 NOK/hour |
| Young Adults (18-20) | 175 NOK/hour |

### Payment Traceability

- All earnings recorded with job reference
- Payment status tracked (Pending, Confirmed)
- Earnings history exportable
- Employer spending logged
- Audit trail maintained

## 5.5 Parental Consent Features

### Guardian Consent Flow

1. Youth under 18 registers account
2. Account status set to PENDING_VERIFICATION
3. Youth enters guardian email address
4. Secure consent token generated (32-byte cryptographic token)
5. Email sent to guardian with consent link
6. Guardian reviews and approves via secure page
7. Token invalidated (one-time use)
8. Account status changed to ACTIVE
9. Both parties notified

### Consent Records

- Consent type and version tracked
- Grant/revoke timestamps recorded
- IP address and user agent logged
- Audit log entry created

## 5.6 Compliance Enforcement via App Logic

### Automatic Validation at Job Posting

```
1. Employer submits job
2. System runs compliance check for age 16 (minor) and age 19 (adult)
3. Checks performed:
   - Category restrictions
   - Working hours limits
   - Time of day restrictions
   - Payment adequacy
   - Prohibited keywords in description
4. Result:
   - PASS: Job posted with eligible age groups tagged
   - FAIL: Job rejected with specific violations listed
5. Warnings provided for borderline issues
6. Suggestions offered for improvements
```

### Age-Based Job Filtering

- Jobs tagged with `eligibleAgeGroups` array
- Youth only see jobs matching their age bracket
- System automatically filters at query time
- Prevents exposure to ineligible opportunities

### Safety Gates

All critical actions require safety gate checks:

| Action | Requirements |
|--------|-------------|
| Apply to Job | Active account + Guardian consent (if under 18) |
| Post Job | Active account + Age verified + Age ≥ 18 |
| Send Message | Active account + Guardian consent (if under 18) |
| Accept Application | Active account + Employer role |

---

# 6. Trust & Safety Systems

## 6.1 Rating & Review System

### Bidirectional Reviews
- Both youth and employers can review each other
- Reviews only possible after job completion
- One review per party per job (prevents duplicates)

### Rating Dimensions
| Dimension | Description |
|-----------|-------------|
| Punctuality | Timeliness and schedule adherence |
| Communication | Responsiveness and clarity |
| Reliability | Consistency and dependability |
| Overall | General experience rating |

### Positive Tags
Users can select from curated positive tags:
- Polite, Problem Solver, Hard Worker
- Great Communicator, On Time, Goes Above and Beyond
- Professional, Friendly, Trustworthy

### Trust Tiers

| Tier | Requirements |
|------|-------------|
| None | Less than 2 reviews OR average below 3.5 |
| Bronze | ≥2 reviews with ≥3.5 average |
| Silver | ≥5 reviews with ≥4.0 average |
| Gold | ≥10 reviews with ≥4.5 average |

## 6.2 Reporting and Moderation

### Report System
- Users can report: other users, jobs, questions, answers
- Structured report reasons with text explanations
- Status tracking: Pending → Reviewed → Resolved/Dismissed

### Moderation Queue
- Admin review for all reports
- Resolution notes required
- Dismissal reasoning tracked
- Full audit trail maintained

### Content Moderation
- AI-assisted keyword detection
- Manual review for flagged content
- Appeal process available

## 6.3 User Verification for Job Posters

### Two-Level Verification System

| Level | Requirement | Badge |
|-------|-------------|-------|
| Age Verified | Confirm age ≥ 18 via date of birth | ✓ Age Verified |
| EID Verified | Norwegian BankID or Vipps verification | ✓ EID Verified |

### Verification Process

1. **Age Verification (Required)**
   - Date of birth collected at registration
   - System calculates and validates age ≥ 18
   - Timestamp recorded

2. **EID Verification (Optional in MVP)**
   - Integration with Norwegian BankID/Vipps
   - Real identity confirmation
   - Highest trust level for employers

### Verification Benefits
- Verified badge visible on profile
- Increased trust from youth workers
- Higher application rates
- Priority in search results (future feature)

## 6.4 Terms and Community Rules Enforcement

### Consent Recording
- Terms of Service acceptance tracked
- Privacy policy consent logged
- Version control for policy updates
- Timestamp and IP recorded

### Account Status Management

| Status | Description | Allowed Actions |
|--------|-------------|-----------------|
| ONBOARDING | Just registered | Complete profile |
| PENDING_VERIFICATION | Awaiting consent/verification | Limited browsing |
| ACTIVE | Fully verified | All features |
| SUSPENDED | Temporarily restricted | View only |
| BANNED | Permanently removed | None |

### Suspension/Ban Process
1. Violation detected (report or automated)
2. Admin review
3. Warning issued (first offense)
4. Suspension with reason
5. Ban for repeat/severe violations
6. Audit log entry created

---

# 7. AI Assistant Role

## 7.1 Types of Questions It Can Help With

### Platform Navigation
- "How do I apply for a job?"
- "Where can I see my earnings?"
- "How do reviews work?"
- "How do I update my profile?"

### Career Information
- "What does a software developer do?"
- "What skills do I need for marketing?"
- "What's a typical day like for a nurse?"
- "How much do electricians earn in Norway?"

### Next Steps Advice
- "How do I become a veterinarian?"
- "What should I study for game development?"
- "What certifications help in IT?"
- "How do I build a portfolio?"

### Application Help
- "Help me write an application message"
- "How should I describe my experience?"
- "What should I include in my bio?"

## 7.2 Career Exploration Guidance

### Career Cards
The AI references a database of career cards containing:
- Role name and summary
- Day-in-life descriptions
- Required skills and traits
- Reality check (challenges)
- Salary information for Norway
- Example companies
- Recommended next steps
- Relevant certifications

### Personalization
- References user's stated career aspiration
- Tailors advice to interests
- Connects current jobs to career paths
- Suggests relevant skill development

### Retrieval-Augmented Generation (RAG)
- Pulls 3 most relevant career cards
- Retrieves 2 relevant help articles
- Includes 2 relevant Q&A entries
- Enhances responses with accurate data

## 7.3 Limitations and Safeguarding

### What the AI Does NOT Do

| Limitation | Reason |
|------------|--------|
| No mental health counseling | Directs to professional resources |
| No medical advice | Outside platform scope |
| No legal advice | Requires professional consultation |
| No financial investment advice | Beyond career guidance |
| No personal relationship advice | Not a life coach |

### Safety Guardrails

1. **Input Safety Check**
   - Detects crisis keywords (suicide, self-harm, etc.)
   - Immediately redirects to Mental Helse: 116 111
   - Does not attempt to counsel

2. **Intent Classification**
   - Off-topic requests politely redirected
   - Blocks: weather, sports, politics, jokes, dating
   - Focuses conversation on career topics

3. **Response Safety Check**
   - Scans output before sending
   - Blocks therapy language (diagnose, medication, clinical)
   - Blocks inappropriate content
   - Falls back to safe response if issues detected

4. **Rate Limiting**
   - Maximum 20 messages per hour
   - Prevents abuse and excessive costs

### Crisis Protocol
When crisis indicators detected:
```
"I'm concerned about what you're sharing. Please reach out to
Mental Helse at 116 111 – they're available 24/7 and can help.
You can also chat at mentalhelse.no. Your wellbeing matters."
```

## 7.4 Integration Flow in the App

### Access Points
- Dedicated "AI Advisor" section in navigation
- Contextual help buttons throughout app
- Career exploration integration
- Application drafting assistance

### Conversation Flow
1. User opens AI Advisor
2. System loads last 4 messages for context
3. User types question
4. Intent classification determines response type
5. RAG retrieves relevant context (if needed)
6. Response generated with personalization
7. Safety check applied
8. Response displayed with formatting

### Technical Implementation
- Model: GPT-4o-mini (fast, cost-effective)
- Temperature: 0.7 (balanced creativity)
- Max tokens: 300 (concise responses)
- Context window: 5 messages total

---

# 8. Data Privacy & Security

## 8.1 Personal Data Collected

### Required Data

| Data Type | Purpose | Legal Basis |
|-----------|---------|-------------|
| Email | Authentication, notifications | Contract performance |
| Password (hashed) | Authentication | Contract performance |
| Date of Birth | Age verification, legal compliance | Legal obligation |

### Optional Data

| Data Type | Purpose | Legal Basis |
|-----------|---------|-------------|
| Display Name | Profile identification | Legitimate interest |
| Phone Number | Employer contact | Consent |
| Location | Job matching | Consent |
| Avatar | Personalization | Consent |
| Bio | Profile enhancement | Consent |
| Skills/Interests | Job matching | Consent |
| Career Aspiration | AI personalization | Consent |

### System-Generated Data

| Data Type | Purpose | Retention |
|-----------|---------|-----------|
| Job History | Platform functionality | Account lifetime |
| Messages | Communication | Account lifetime |
| Reviews | Trust system | Account lifetime |
| Audit Logs | Legal compliance | Indefinite |
| Consent Records | GDPR compliance | Indefinite |

## 8.2 How Data is Stored and Protected

### Database Security
- PostgreSQL database with encryption at rest
- Prisma ORM with parameterized queries (SQL injection prevention)
- Connection pooling with secure credentials
- Regular automated backups

### Application Security
- JWT session tokens with 30-day expiry
- Bcrypt password hashing (10 salt rounds)
- HTTPS enforced for all connections
- Secure cookie settings (httpOnly, sameSite)

### Access Control
- Role-based access (Youth, Employer, Admin)
- Row-level security policies in database
- Safety gates on all critical actions
- Audit logging for sensitive operations

### Infrastructure
- Hosted on secure cloud infrastructure
- Environment variables for secrets
- No credentials in source code
- Regular security updates

## 8.3 GDPR Compliance for Youth Users

### Article 7 - Conditions for Consent
- Explicit consent collection for under-18s
- Guardian consent required for minors
- Clear, specific consent language
- Easy consent withdrawal

### Article 13/14 - Information Rights
- Privacy policy accessible at /legal/privacy
- Terms of service at /legal/terms
- Cookie policy at /legal/cookies
- Clear data usage explanations

### Article 15 - Right of Access
- Data export endpoint: GET /api/account/export
- Comprehensive JSON export including:
  - Profile data
  - Applications and jobs
  - Reviews given and received
  - Messages (recent 500)
  - Notifications (recent 100)
  - Consent records

### Article 17 - Right to Erasure
- Account deletion available
- Data removal process
- Retention for legal obligations

### Article 20 - Data Portability
- Machine-readable JSON format
- Downloadable export file
- Importable structure

### Special Protections for Minors
- Enhanced consent requirements
- Guardian oversight capability
- Age-appropriate privacy settings
- Restricted data sharing

## 8.4 Data Handling for Communications and Payments

### Messaging Data
- Messages stored encrypted
- Conversation IDs normalized (privacy)
- Access limited to participants
- Exportable in data request
- Retained for dispute resolution

### Payment Data
- No direct payment processing (MVP)
- Earnings records stored for tracking
- Payment confirmation logs
- Employer spending analytics
- Audit trail for all transactions

### Third-Party Integrations
- OpenAI: Message content for AI responses (no storage by OpenAI)
- Geocoding: Address to coordinates (anonymized)
- File Storage: Profile images only

---

# 9. Optional Future Features

## 9.1 Certification Badges

### Proposed Badge Types
- **First Aid Certified**: Verified first aid training
- **Food Safety**: Food handling certification
- **Child Care Basics**: Babysitting course completion
- **Digital Skills**: IT competency verification
- **Language Proficiency**: Verified language skills

### Implementation Approach
- Integration with certification providers
- Manual verification upload option
- Expiry tracking and renewal reminders
- Visible on profile with verification date

## 9.2 Micro-Learning / Career Courses

### Course Categories
- Soft skills (communication, time management)
- Job-specific skills (customer service, basic IT)
- Career exploration modules
- Financial literacy for youth
- Safety and first aid basics

### Gamification Elements
- Progress tracking
- Completion certificates
- Badges for course completion
- Leaderboards (optional)

### Integration with Platform
- Course recommendations based on interests
- Skill badges from completed courses
- Enhanced profile visibility
- Employer preference for trained workers

## 9.3 Integration with Schools or Municipalities

### School Partnerships
- Bulk student onboarding
- Career guidance integration with school counselors
- Work experience tracking for transcripts
- Parent notification systems
- School-approved job categories

### Municipality Integration
- Local job board partnerships
- Community volunteer opportunities
- Youth employment programs
- Subsidy or grant programs
- Safety oversight collaboration

### Data Sharing Framework
- GDPR-compliant data agreements
- Minimal data sharing (anonymized where possible)
- Parent/guardian consent for school integration
- Clear purpose limitation

## 9.4 Expansion Roadmap

### Phase 1: Norway Nationwide (Current → Q2 2026)
- Expand from pilot regions to all of Norway
- Regional employer partnerships
- Norwegian language optimization
- Local municipality collaborations

### Phase 2: Nordic Expansion (2027)
- **Sweden**: Adapt labor law compliance
- **Denmark**: Localized content and regulations
- **Finland**: Market research and launch

### Phase 3: European Expansion (2028+)
- Evaluate EU markets with similar youth employment frameworks
- Build modular compliance engine for different jurisdictions
- Partner with pan-European youth organizations

### Age Bracket Considerations
- Evaluate 21-25 age bracket for "young professional" tier
- Different feature set for older users
- Transition support from youth to adult employment

---

# 10. Conclusion

## 10.1 Summary of Sprout's Mission and User Value

Sprout exists to **empower young people in Norway** to take their first steps into the workforce through safe, legal, and rewarding micro-job opportunities. By combining:

- **Smart Matching**: Connecting youth with age-appropriate local jobs
- **Legal Compliance**: Automatically enforcing Norwegian labor laws
- **Trust Systems**: Building reputations through verified reviews
- **Career Guidance**: AI-powered exploration of future possibilities
- **Community Safety**: Guardian consent and employer verification

Sprout creates a **protected environment** where young people can earn money, build skills, and explore careers—while employers gain access to a reliable, verified pool of young workers.

### Value Delivered

| Stakeholder | Key Value |
|-------------|-----------|
| Youth (15-17) | Safe first jobs with parental oversight, legal compliance automatic |
| Youth (18-20) | Flexible work, career exploration, reputation building |
| Employers | Verified workers, easy job posting, compliance handled |
| Parents | Visibility into child's work, consent controls |
| Community | Youth employment support, local economic activity |

## 10.2 Legal and Ethical Commitment

Sprout is committed to operating with the **highest standards** of legal compliance and ethical conduct:

### Legal Compliance
- Full adherence to **Arbeidsmiljøloven** (Norwegian Working Environment Act)
- **GDPR compliance** with enhanced protections for minors
- Regular legal review and policy updates
- Transparent terms of service and privacy policies

### Ethical Principles
- **Youth Safety First**: All features designed with minor protection in mind
- **Fair Treatment**: Minimum wage enforcement and payment transparency
- **Privacy by Design**: Minimal data collection, maximum protection
- **Transparency**: Clear communication about data use and platform rules
- **Accessibility**: Inclusive design for all young people

### Continuous Improvement
- Regular safety audits
- User feedback integration
- Compliance monitoring and updates
- Stakeholder engagement

---

*This document is confidential and intended for internal and stakeholder use only.*

**Sprout Youth Job Platform**
*Empowering Norway's Next Generation*

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 2026 | Sprout Team | Initial comprehensive documentation |

