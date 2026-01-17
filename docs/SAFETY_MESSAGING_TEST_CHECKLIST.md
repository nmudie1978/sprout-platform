# Phase 1 Safety Messaging - Test Checklist

## Overview
This document provides a comprehensive test checklist for verifying the Phase 1 Safety Messaging implementation.

---

## Pre-Test Setup

### Database Setup
- [ ] Run database migration: `npx prisma db push`
- [ ] Seed message templates: `npx prisma db seed`
- [ ] Verify MessageTemplate table has 16+ templates
- [ ] Verify RLS policies are applied (check Supabase dashboard)

### Test Users Needed
1. Youth user (age 16-17) - Minor
2. Youth user (age 18+) - Adult youth
3. Employer user (verified with EID)
4. Employer user (NOT verified)
5. Admin user
6. Community Guardian user

---

## Core Safety Gate Tests

### 1. Conversation Creation - Job Required
- [ ] **FAIL**: Create conversation without jobId -> Should return 400 "Job ID is required"
- [ ] **PASS**: Create conversation with valid jobId -> Should succeed

### 2. Adult-to-Minor Verification
- [ ] **FAIL**: Unverified employer messages 16-17 year old -> Should return 403 "Verification required"
- [ ] **PASS**: Verified employer messages 16-17 year old -> Should succeed
- [ ] **PASS**: Any user messages 18+ youth -> Should succeed (no verification needed)

### 3. Block System
- [ ] **PASS**: User can block another user
- [ ] **FAIL**: Blocked user tries to create conversation -> Should return 403 "User blocked"
- [ ] **FAIL**: Blocked user tries to send message -> Should return 403 "User blocked"
- [ ] **PASS**: User can unblock a blocked user
- [ ] **PASS**: After unblock, messaging works again

### 4. Do Not Disturb
- [ ] **FAIL**: Message user with doNotDisturb=true -> Should return 403 "Not accepting messages"
- [ ] **PASS**: Existing conversations still work when doNotDisturb is enabled

---

## Structured Messaging Tests

### 5. No Free-Text
- [ ] **FAIL**: Send message without templateKey -> Should return 400 "Template key required"
- [ ] **FAIL**: UI has no free-text input field (only template selector)

### 6. Template Validation
- [ ] **PASS**: Send message with valid template + payload -> Should succeed
- [ ] **FAIL**: Send message with invalid templateKey -> Should return 400 "Invalid template"
- [ ] **FAIL**: Send message with missing required field -> Should return 400 "Required field missing"

### 7. Template Direction Restrictions
- [ ] **FAIL**: Youth uses ADULT_TO_YOUTH template -> Should return 403 "For employers only"
- [ ] **FAIL**: Employer uses YOUTH_TO_ADULT template -> Should return 403 "For youth only"
- [ ] **PASS**: Youth uses YOUTH_TO_ADULT template -> Should succeed
- [ ] **PASS**: Employer uses ADULT_TO_YOUTH template -> Should succeed
- [ ] **PASS**: Any user uses ANY direction template -> Should succeed

---

## Dangerous Content Detection

### 8. URL Detection
- [ ] **FAIL**: Payload contains "www.example.com" -> Should reject
- [ ] **FAIL**: Payload contains "https://..." -> Should reject
- [ ] **FAIL**: Payload contains "example.no" -> Should reject

### 9. Phone Number Detection
- [ ] **FAIL**: Payload contains "+47 123 45 678" -> Should reject
- [ ] **FAIL**: Payload contains "12345678" (8+ digits) -> Should reject

### 10. Email Detection
- [ ] **FAIL**: Payload contains "email@example.com" -> Should reject

### 11. Social Media Detection
- [ ] **FAIL**: Payload contains "@username" -> Should reject
- [ ] **FAIL**: Payload contains "snapchat: myname" -> Should reject
- [ ] **FAIL**: Payload contains "add me on insta" -> Should reject

---

## Report & Freeze System

### 12. Report Creation
- [ ] **PASS**: User can report conversation with category
- [ ] **PASS**: Report auto-freezes the conversation
- [ ] **PASS**: Audit log entry created for report

### 13. Frozen Conversation
- [ ] **PASS**: UI shows "Frozen" badge on frozen conversation
- [ ] **FAIL**: Cannot send messages in frozen conversation -> Should return 403
- [ ] **PASS**: Can still read existing messages

### 14. Report Review (Admin/Guardian)
- [ ] **PASS**: Guardian can see message reports in dashboard
- [ ] **PASS**: Guardian can claim a report
- [ ] **PASS**: Guardian can resolve report with action taken
- [ ] **PASS**: Guardian can dismiss report (unfreezes conversation)

---

## UI/UX Tests

### 15. Chat UI
- [ ] **PASS**: Template selector shows categories with icons
- [ ] **PASS**: Selecting template shows appropriate input fields
- [ ] **PASS**: Required fields marked with asterisk
- [ ] **PASS**: Send button disabled until payload valid
- [ ] **PASS**: Messages show template label/category
- [ ] **PASS**: Safety notice visible in chat

### 16. Block/Report UI
- [ ] **PASS**: Three-dot menu accessible in chat header
- [ ] **PASS**: "Report Conversation" option works
- [ ] **PASS**: Report dialog shows category options
- [ ] **PASS**: "Block User" option works
- [ ] **PASS**: Block confirmation dialog shows consequences

### 17. Guardian Dashboard
- [ ] **PASS**: "Message Reports" tab visible
- [ ] **PASS**: Open reports show count badge
- [ ] **PASS**: Reports show reporter/reported names
- [ ] **PASS**: Reports show related job title
- [ ] **PASS**: Claim button works for open reports

---

## API Response Format Tests

### 18. Conversation List
- [ ] **PASS**: Response includes `status` field (ACTIVE/FROZEN/CLOSED)
- [ ] **PASS**: Last message shows rendered text

### 19. Conversation Detail
- [ ] **PASS**: Response includes `status`, `frozenAt`, `frozenReason`
- [ ] **PASS**: Messages include `templateKey`, `templateLabel`, `templateCategory`

### 20. Message Send
- [ ] **PASS**: Response includes rendered `content`
- [ ] **PASS**: Response includes `templateKey` and `templateLabel`

---

## Audit Logging Tests

### 21. Audit Entries Created
- [ ] **PASS**: CONVERSATION_CREATED logged when conversation starts
- [ ] **PASS**: MESSAGE_SENT logged for each message
- [ ] **PASS**: USER_BLOCKED logged when blocking
- [ ] **PASS**: CONVERSATION_REPORTED logged when reporting
- [ ] **PASS**: CONVERSATION_FROZEN logged when freezing

---

## Edge Cases

### 22. Concurrent Actions
- [ ] **PASS**: Blocking mid-conversation prevents further messages
- [ ] **PASS**: Reporting while other user typing freezes on next send

### 23. Data Integrity
- [ ] **PASS**: Cannot modify existing message content
- [ ] **PASS**: Cannot delete messages (soft delete only if implemented)
- [ ] **PASS**: Template changes don't affect existing messages

---

## Performance Tests

### 24. Response Times
- [ ] **PASS**: Template list loads in < 500ms
- [ ] **PASS**: Send message completes in < 1s
- [ ] **PASS**: Conversation load with 100 messages < 2s

---

## Test Commands

```bash
# Run database seed
npx prisma db seed

# Check templates exist
npx prisma studio
# Navigate to MessageTemplate table

# Build verification
npm run build

# Start dev server
npm run dev
```

---

## Sign-Off

| Tester | Date | Environment | Status |
|--------|------|-------------|--------|
| | | | |

---

## Notes
- All "FAIL" tests verify that the safety system correctly REJECTS unsafe actions
- All "PASS" tests verify that legitimate actions work correctly
- Tests should be run in both development and production builds
