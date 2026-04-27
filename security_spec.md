# Firestore Security Specification - Quantum Focus

## 1. Data Invariants
- **User Ownership**: All data (tasks, habits, sessions) is stored under `/users/{userId}/`. Access is strictly limited to the authenticated user whose `uid` matches the `{userId}` path parameter.
- **Relational Integrity**:
  - `userId` field in any document must match the path variable `{userId}` and the `request.auth.uid`.
  - Tasks can be updated (completed/priority), but their `id` and `userId` are immutable.
  - Habits can track streaks and completion dates.
  - Focus Sessions are records of work and should be strictly validated upon creation.
- **Global Deny**: Any path not explicitly matched is denied. No public or shared data exists in this first version.

## 2. The "Dirty Dozen" Payloads (Deny Targets)

### User Profile Attacks
1. **Identity Spoofing**: Attempt to create a user profile for a different `uid`.
   - `setDoc(/users/target_uid, { uid: "malicious_uid", ... })`
2. **XP Inflation**: Attempt to set XP to an extremely large value or 1MB string.
3. **Ghost Field Injection**: Adding `isVerified: true` to a profile during a regular settings update.

### Task Attacks
4. **Task Hijacking**: Attempt to create a task in another user's collection.
   - `addDoc(/users/other_user/tasks, { userId: "me", ... })`
5. **Orphaned Task**: Creating a task with a `userId` that doesn't match the path.
6. **Task Escalation**: Updating a task to change its `userId` or `id`.

### Habit Attacks
7. **Streak Manipulation**: Setting a habit streak to 999999 without history.
8. **Habit Poisoning**: Injecting a 1MB string into the habit `title`.

### Session Attacks
9. **Fake Productivity**: Creating dozens of 1-second sessions to farm XP.
10. **Session Modification**: Attempting to `update` a session record (they should be immutable).

### Resource Exhaustion
11. **ID Poisoning**: Attempting to use a 1.5KB string as a document ID.
12. **Malicious Query**: Listing sessions without a limit or for a different user.

## 3. Test Runner (Draft)
The tests will verify that:
- `auth == null` results in total denial.
- `auth.uid != userId` results in total denial.
- Partial updates without `affectedKeys().hasOnly` are rejected if they touch protected fields.
- `isValidId()` is enforced on all document paths.

## 4. Conflict Report

| Collection | Identity Spoofing | State Shortcutting | Resource Poisoning |
| :--- | :--- | :--- | :--- |
| `/users` | Blocked via `isOwner()` and `isValidUser()` | Validated via `affectedKeys()` | Blocked via `.size()` and `isValidId()` |
| `/tasks` | Blocked via parent path variable | Validated via `isValidTask()` | Blocked via string size checks |
| `/habits` | Blocked via parent path variable | Validated via `isValidHabit()` | Blocked via string size checks |
| `/sessions`| Blocked via parent path variable | Immutable after creation | Blocked via strict creation schema |
