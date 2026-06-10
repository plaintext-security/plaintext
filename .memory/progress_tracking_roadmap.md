---
name: progress-tracking-roadmap
description: Future roadmap for opt-in user progress tracking with GitHub auth
metadata: 
  node_type: memory
  type: project
  originSessionId: 889251c3-57b2-4f9e-8fab-1f2d5fc6d25c
---

## Progress Tracking System Roadmap

**Phase 1 (Current):** Local browser storage only
- localStorage/IndexedDB for client-side progress
- Export/import JSON for portability
- No backend required

**Phase 2 (Future):** Central database + GitHub auth
- **Why:** Enable cross-device sync, community progress visibility, opt-in analytics
- **Auth:** GitHub OAuth (leverage existing giscus integration)
- **Database:** Store user progress, completion timestamps, public/private sharing
- **UX features:**
  - Progress sync across devices
  - Optional public profile (e.g., "completed 12/15 modules")
  - Leaderboard/community insights (opt-in)
  - Resume-generation from completed modules
  - Certificate of completion (if desired)

**Implementation notes:**
- Giscus already uses GitHub auth, so infrastructure is there
- Lightweight API for progress CRUD operations
- Progress data remains user-owned and can be deleted
- Opt-in by default; local storage works without account
- Could extend to: completion badges, module recommendations, peer groups

**Related:** [[project_mission|Project mission]] — This supports the self-paced learning model by allowing learners to track their own progress.
