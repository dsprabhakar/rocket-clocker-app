# Rocket Clocker — Instructor Guide (Boardroom Demo)

## People in the Room

| Person | Role | Device | Login |
|--------|------|--------|-------|
| You | Superuser | Laptop (web) | dsprabhakar@yahoo.com (magic link) |
| Prem | HQ Admin | Laptop (web) | Tap "Demo Login" → Prem |
| Suresh | General Manager | Laptop (web) | Tap "Demo Login" → Suresh |
| Rajendran | CEO | Phone (APK) | Tap "Demo Login" → Rajendran |
| Ravi Teja | Supervisor 1 | Phone (APK) | Tap "Demo Login" → Ravi Teja |
| Lakshmi Devi | Supervisor 2 | Phone (APK) | Tap "Demo Login" → Lakshmi Devi |
| Srinivas Rao | Worker 1 | Phone (APK) | Tap "Demo Login" → Srinivas Rao |
| Ramesh Babu | Worker 2 | Phone (APK) | Tap "Demo Login" → Ramesh Babu |
| Anjali Kumari | Worker 3 | Phone (APK) | Tap "Demo Login" → Anjali Kumari |

---

## Pre-Demo Setup (Do this BEFORE the meeting)

### 1. Run the demo SQL
- Log in to Supabase (dsprabhakar@gmail.com)
- SQL Editor → New query → paste contents of `demo_users.sql` → Run
- Verify: `SELECT full_name, role FROM profiles WHERE email LIKE '%@rocket.demo' OR email IN ('rayaldemohq@gmail.com','rayaldemogm@gmail.com','ceorayal@gmail.com');`
- Should show 8 rows

### 2. Deploy the app
- Push code to GitHub (the Demo Login button must be deployed)
- Vercel auto-deploys, wait for green checkmark
- Verify: open https://rocket-clocker-app.vercel.app — you should see the "Demo Login" button

### 3. Install APK on 5 phones
- Copy `app-debug.apk` to each phone (WhatsApp/Bluetooth/USB)
- Location: `rocket-clocker-app\android\app\build\outputs\apk\debug\app-debug.apk`
- Install on each phone (may need to allow "Install from unknown sources")
- Open the app on each phone — do NOT log in yet

### 4. Set up 2-3 laptops
- Open https://rocket-clocker-app.vercel.app in browser
- One laptop for Prem (HQ), one for Suresh (GM)
- Your laptop for Superuser view

### 5. Log yourself in
- On YOUR laptop, go to the web app
- Log in with dsprabhakar@yahoo.com (magic link)
- You should see the Superuser dashboard

---

## Demo Script — Read Aloud, Step by Step

### Opening (1 min)

**SAY:**
> "Good morning everyone. Today I'm going to show you Rocket Clocker — our new attendance and site management system for RAYAL Constructions.
>
> Each of you has a device in front of you. You'll be playing a real role — worker, supervisor, HQ, CEO, or GM. Everything you do will be live. Let's start."

---

### Step 1: Everyone Logs In (3 min)

**SAY:**
> "Open the app on your device. You'll see the Rocket Clocker login page.
> Tap the orange **Demo Login** button at the bottom.
> Find your name in the list and tap it. You'll be logged in immediately."

**INSTRUCT each person:**

| Person | Do this |
|--------|---------|
| Prem | Open web app → Demo Login → tap "Prem" |
| Suresh | Open web app → Demo Login → tap "Suresh" |
| Rajendran | Open APK → Demo Login → tap "Rajendran" |
| Ravi Teja | Open APK → Demo Login → tap "Ravi Teja" |
| Lakshmi Devi | Open APK → Demo Login → tap "Lakshmi Devi" |
| Srinivas Rao | Open APK → Demo Login → tap "Srinivas Rao" |
| Ramesh Babu | Open APK → Demo Login → tap "Ramesh Babu" |
| Anjali Kumari | Open APK → Demo Login → tap "Anjali Kumari" |

**WAIT** until everyone confirms they see their dashboard.

**SAY:**
> "Notice how each person sees a different screen. Workers see their assignments. Supervisors see their sites. The CEO sees the whole company. That's role-based access — each person sees only what they need."

---

### Step 2: HQ Assigns Workers to Sites (3 min)

**SAY:**
> "Prem, you're the HQ coordinator. Every morning, your job is to assign workers to construction sites. Let's do that now."

**INSTRUCT Prem (HQ):**
1. Go to **Assignments** (or **Sites**)
2. Create a new assignment:
   - Site: **Demo: Vijayawada Metro Station**
   - Workers: **Srinivas Rao, Ramesh Babu**
   - Date: **today**
3. Create another assignment:
   - Site: **Demo: Hyderabad IT Tower**
   - Workers: **Anjali Kumari**
   - Date: **today**

**SAY to Workers:**
> "Srinivas, Ramesh, Anjali — refresh your app. Do you see your assignment?"

**WAIT** for workers to confirm they see their site assignment.

**SAY:**
> "One click by HQ, and workers know exactly where to go. No phone calls. No confusion."

---

### Step 3: Workers Check In (3 min)

**SAY:**
> "Now imagine the workers have arrived at the construction site. Time to check in."

**INSTRUCT Workers:**
> "Srinivas, Ramesh, Anjali — tap the **Check In** button on your screen."

- GPS location will be captured
- Selfie camera will open — take a photo of yourself
- After check-in, you'll see a green status with the time

**WAIT** until all 3 workers confirm they see "Checked In."

**SAY:**
> "Three things just happened automatically:
> 1. GPS confirmed they're at the construction site
> 2. The selfie confirmed it's really them — no buddy punching
> 3. The exact time was recorded
>
> Ravi Teja, Lakshmi Devi — as supervisors, can you see who just checked in on your screen?"

**INSTRUCT Supervisors:**
> "Check your dashboard — you should see the workers who just checked in."

---

### Step 4: Supervisor Awards a Star (2 min)

**SAY:**
> "Ravi Teja, you're the site supervisor. Srinivas did excellent work today. Let's reward him."

**INSTRUCT Ravi Teja (Supervisor 1):**
1. Go to **Workers** or tap on Srinivas Rao
2. Tap **Award Star**
3. Reason: "Excellent masonry work on foundation"
4. Confirm

**SAY:**
> "Srinivas — check your app. Do you see the star?"

**WAIT** for confirmation.

**SAY:**
> "Stars motivate workers. It's instant recognition, right from the site. No paperwork."

---

### Step 5: CEO Sends a Broadcast (2 min)

**SAY:**
> "Rajendran sir — you're the CEO. You want to send a message to all workers. Try it."

**INSTRUCT Rajendran (CEO):**
1. Go to **Broadcasts**
2. Tap **New Broadcast**
3. Type: "Great work today team! Keep it up!"
4. Target: All employees
5. Send

**SAY to Workers:**
> "Workers — do you see the CEO's message on your screen?"

**WAIT** for confirmation.

**SAY:**
> "One tap — Rajendran sir's message reaches every single worker instantly. No WhatsApp groups, no missed messages."

---

### Step 6: Workers Check Out (2 min)

**SAY:**
> "End of the work day. Workers, tap **Check Out** now."

**INSTRUCT Workers:**
> "Srinivas, Ramesh, Anjali — tap the **Check Out** button."

**WAIT** until all confirm.

**SAY:**
> "Full workday recorded. Check-in time, check-out time, GPS location, selfie — everything."

---

### Step 7: GM Views Reports (2 min)

**SAY:**
> "Suresh, you're the General Manager. You can see attendance across all sites."

**INSTRUCT Suresh (GM):**
1. Check the **Dashboard** — attendance summary
2. Go to **Sites** — see all 5 sites
3. Go to **Workers** — see who worked today

**SAY:**
> "The GM has the same view as HQ — full visibility across all sites without being physically present."

---

### Step 8: Superuser Shows Audit Trail (2 min)

**SAY:**
> "Finally, let me show you the admin view."

**On YOUR laptop (Superuser):**
1. Show **Profiles** — all users, roles, wages
2. Show **Audit Log** — every single action is logged
3. Point out: "Every check-in, every star, every broadcast — it's all here. Nothing can be hidden."

---

### Closing (2 min)

**SAY:**
> "Let me summarize what we just saw:
>
> - **HQ** assigned workers in one click
> - **Workers** checked in with GPS and selfie — no fake attendance possible
> - **Supervisors** tracked their team and awarded stars
> - **CEO** reached all workers with one message
> - **GM** saw reports across all sites
> - **Every action was logged** in the audit trail
>
> This system:
> - Works on any Android phone
> - Works offline — syncs when internet comes back
> - Runs for free — no monthly fees
> - Supports Telugu and English
> - Handles 100+ workers across multiple sites
>
> Any questions?"

---

## Troubleshooting During Demo

| Problem | Fix |
|---------|-----|
| Demo Login button not showing | App not deployed yet. Push to GitHub and wait for Vercel deploy |
| "Invalid login credentials" | demo_users.sql was not run. Run it in Supabase SQL Editor |
| App shows blank screen | Refresh the page (F5 on web, close & reopen APK) |
| GPS not working on phone | Allow location permission when prompted |
| Camera not opening | Allow camera permission when prompted |
| Worker doesn't see assignment | Ask worker to pull-to-refresh their dashboard |

---

## After the Demo

The demo accounts and "Demo Login" button can be removed later:
1. Delete demo users: `DELETE FROM auth.users WHERE email LIKE '%@rocket.demo';`
2. Remove the Demo Login button from the code (revert LoginPage.tsx)
3. Push to GitHub → Vercel redeploys without the button
