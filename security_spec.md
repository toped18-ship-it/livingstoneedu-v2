# Security Specification: LivingstoneEdu LMS

This document details the Zero-Trust security model designed to govern the Firestore data layers for LivingstoneEdu (LMS/School Management System).

---

## 1. Data Invariants

- **Identity Sync**: A user can only register or modify self profile configurations where the document ID matches `request.auth.uid`. No user can claim another's UID or escalate their database role on their own.
- **Progress Tracking Bounds**: Students can write lesson progress milestones only for their own tracker records (`incoming().userId == request.auth.uid`), preventing progress spoofing.
- **Roster Controls**: Students are strictly forbidden from writing or altering teacher configurations, grade sheets (caScore/examScore), or attendance logs inside `teacherSetups`.
- **System Integrity Isolation**: `createdAt` remains strictly immutable once written, enforcing audit integrity.

---

## 2. Threat Vector Payloads (The "Dirty Dozen")

Below are 12 malicious payload patterns that must be rejected by the security rules:

1. **Self-Appointed Administrator**: A student attempts to write a user profile document with `"role": "admin"`.
2. **Identity Hijacking**: User `student_A` tries to update `users/student_B` profile data.
3. **Spoofed Progress Logs**: User `student_A` signs off a lesson completed document under `lessonProgress/xxxx` with `userId: "student_B"`.
4. **Altering Grade Records**: A student attempts to write/mod a graded sheet in `teacherSetups/XXXX` to override lower test scores.
5. **Deleting Global Exams**: An unauthorized user attempts to issue `deleteDoc` on custom examination collections under `aiExams`.
6. **Bypassing Character Sanitization**: Injecting a 1MB string or high-charset malicious path variables as a document ID (e.g. `users/[malicious_overflow_bytes]`).
7. **Bypassing Timestamp Controls**: Setting a custom client clock timestamp for `joinDate` or progress updates instead of relying on `request.time`.
8. **Malicious Email Spoofing**: Submitting a registration document with an unverified email claiming `email_verified == true` without actual Google provider validation checks.
9. **Spamming Support Inbox**: Issuing unbounded updates on `contactMessages` to jam the parent/back-office queue.
10. **Shadow Key Exploit**: Attempting to inject unmapped, arbitrary keys (e.g. `isBanned`, `freeLifetimePass`) into standard schemas when updating academic profiles.
11. **Immutability Violation**: Attempting to alter or update the initial `joinDate` or `createdAt` values on an existing profile.
12. **Blanket Query Scraping**: Triggering a broad query over `users/*` without specifying strict filter constraints, aiming to scrape all registered emails.

---

## 3. Threat Model Evaluation Roster

| Collection Name | Threat: Identity Spoofing | Threat: State Shortcutting | Threat: Value Poisoning & Denial/Wallet | Preventative Guard Pattern |
| :--- | :--- | :--- | :--- | :--- |
| `users` | Block user from setting others' UIDs | Role keys locked; can't self-promote to admin | Max name size bounded; immutable `joinDate` | Strict `isValidUser` function + `hasOnly()` checks |
| `lessonProgress` | Lock tracker `userId` to matching caller auth UID | Block modification of related lesson completion metrics | Cap maximum grade integers to valid percentage scopes | Bound size of strings; validate relational keys |
| `contactMessages` | Lock caller details or mark as read-only | Prevent updating a ticket marked `Replied` to trigger re-reads | Limit message content character length bounds | Public write-only; Admin read/update only |
| `teacherSetups` | Fully restrict access from student accounts | Block setting invalid class ranges | Restrict grading metrics to safe bounds | Only `teacher` role can write or list rosters |
| `aiExams` | Prevent students from altering active exam keys | Block modifying exam answers list in bank | Standardize quiz lengths and option indexing | Only `teacher` or `admin` roles can create or modify exams |
