# Rocket Clocker — Client Demo Walkthrough

## Prerequisites
1. Run `demo_data.sql` in Supabase SQL Editor (creates 16 profiles + 5 sites)
2. Your account (`dsprabhakar@yahoo.com`) is role=superuser and can see all views

## How to Switch Roles for the Demo

Since magic link auth requires email delivery, the easiest way to demo different roles
is to change YOUR profile's role in Supabase SQL Editor:

```sql
-- Switch to Employee view
UPDATE profiles SET role = 'employee' WHERE email = 'dsprabhakar@yahoo.com';

-- Switch to Supervisor view
UPDATE profiles SET role = 'supervisor' WHERE email = 'dsprabhakar@yahoo.com';

-- Switch to HQ view
UPDATE profiles SET role = 'hq' WHERE email = 'dsprabhakar@yahoo.com';

-- Switch to GM view
UPDATE profiles SET role = 'gm' WHERE email = 'dsprabhakar@yahoo.com';

-- Switch to CEO view
UPDATE profiles SET role = 'ceo' WHERE email = 'dsprabhakar@yahoo.com';

-- Switch back to Superuser (see everything)
UPDATE profiles SET role = 'superuser' WHERE email = 'dsprabhakar@yahoo.com';
```

After each role change: **refresh the app** (pull-to-refresh on phone, F5 on web).

---

## Demo Script (5 Scenarios, ~20 minutes total)

### Scenario 1: HQ Assigns Workers to Sites (3 min)
**Role: HQ** | **App: Web** (rocket-clocker-app.vercel.app)

```sql
UPDATE profiles SET role = 'hq' WHERE email = 'dsprabhakar@yahoo.com';
```

1. Open web app → You're in HQ Dashboard
2. Go to **Sites** → Show 5 active sites across AP & Telangana
3. Go to **Assignments** → Create new assignment:
   - Pick "Demo: Vijayawada Metro Station"
   - Select workers: Srinivas Rao, Ramesh Babu
   - Date: today
4. Create another assignment:
   - Pick "Demo: Hyderabad IT Tower"
   - Select workers: Anjali Kumari, Nagaraju M
   - Date: today
5. Show the assignment list — workers now have today's assignments

**What to say:** "HQ assigns workers to sites each morning. Workers see their assignment on their phone."

---

### Scenario 2: Worker Checks In & Out (3 min)
**Role: Employee** | **App: APK on phone OR web**

```sql
UPDATE profiles SET role = 'employee' WHERE email = 'dsprabhakar@yahoo.com';
```

1. Refresh → You're now in Worker Dashboard
2. Show **today's assignment** (the one HQ just created)
3. Tap **Check In**:
   - GPS location captured automatically
   - Selfie camera opens (take a photo)
   - Shows "Checked in at [time]" with green indicator
4. Show **History** tab — attendance calendar
5. Tap **Check Out**:
   - GPS + selfie again
   - Shows full workday: check-in → check-out times

**What to say:** "Workers check in with GPS + selfie. We know WHO was WHERE and WHEN. No buddy punching possible."

---

### Scenario 3: Supervisor Reviews & Awards Stars (3 min)
**Role: Supervisor** | **App: APK on phone OR web**

```sql
UPDATE profiles SET role = 'supervisor' WHERE email = 'dsprabhakar@yahoo.com';
```

1. Refresh → Supervisor Dashboard
2. Show **Site Overview** — see which workers checked in today
3. Go to **Workers** tab → see worker list with attendance status
4. Select a worker (e.g., Srinivas Rao) → **Award Star**:
   - Reason: "Excellent masonry work on foundation"
5. Show **Reports** tab → you can file worker reports here
6. Go to **Tasks** → Create a task:
   - Title: "Foundation concrete pouring - Block A"
   - Assign to: Srinivas Rao

**What to say:** "Supervisors manage their site from the phone. They award stars, report issues, and track tasks."

---

### Scenario 4: CEO Views Company Dashboard (3 min)
**Role: CEO** | **App: APK on phone**

```sql
UPDATE profiles SET role = 'ceo' WHERE email = 'dsprabhakar@yahoo.com';
```

1. Refresh → CEO Dashboard
2. Show **company-wide stats**: total workers, attendance %, active sites
3. Go to **Sites** → overview of all 5 sites
4. Go to **Broadcasts** → Send a broadcast message:
   - Message: "Great work this week team! Keep it up!"
   - Target: All employees
5. Show the broadcast appears in the feed

**What to say:** "The CEO sees the whole company at a glance. One tap to send a message to all 100+ workers."

---

### Scenario 5: Superuser Full Access (3 min)
**Role: Superuser** | **App: Web**

```sql
UPDATE profiles SET role = 'superuser' WHERE email = 'dsprabhakar@yahoo.com';
```

1. Refresh → Superuser Dashboard (all tabs visible)
2. Show **Profiles** → all 16 users, their roles, wages, skills
3. Show **Audit Log** → every action tracked
4. Show **Sites** → can manage any site
5. Show **Assignments** → cross-site view
6. Show **Stars & Strikes** → employee performance tracking

**What to say:** "The Superuser sees everything. Full audit trail. No data can be lost or hidden."

---

## Key Talking Points for the Client

| Feature | Benefit |
|---------|---------|
| GPS + Selfie punch | No fake attendance, no buddy punching |
| Geofencing | Workers must be at the site to check in |
| Offline mode | Works even without internet, syncs later |
| Star/Strike system | Motivate good work, track issues fairly |
| Broadcast messages | CEO can reach all workers in one tap |
| Audit trail | Every action logged — full accountability |
| Multi-language | Telugu + English for AP/Telangana workers |
| Free to run | Supabase free tier, Vercel free hosting |
| 6 role-based apps | Each person sees only what they need |

## After the Demo

Reset your role back:
```sql
UPDATE profiles SET role = 'superuser' WHERE email = 'dsprabhakar@yahoo.com';
```
