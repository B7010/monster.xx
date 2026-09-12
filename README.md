# MyMonitorXX - Automated College Timetable & Live Campus Monitoring

A modern web application delivering role-tailored experiences for **Admin**, **HOD**, and **Teacher** with unified real-time synchronization.

---

## 🌟 Roles & Features

### 👨💼 1. Admin (Master Timetable Controller)
- **Role**: Controls college resources, timetable generation, and version releases. (Does not monitor live status).
- **Sidebar**:
  - `Dashboard`: System stats, active timetable version, workflow overview.
  - `Teachers`: View faculty directory, workload limits, and **+ Add Teacher** modal.
  - `Subjects`: Curriculum catalog with theory vs. practical lab hours.
  - `Classes`: Student batches (IT-A, IT-B, IT-C, IT-D).
  - `Classrooms`: Lecture halls & computer labs inventory.
  - `Timetable`:
    - **Generate Timetable Studio**: Specify teacher workload caps, lab continuous blocks, Friday policies, and run the automated constraint solver.
    - **Current Timetable**: Weekly matrix grid for academic batches.
    - **Drafts & History**: Version lifecycle management (v3.2 active, v3.1 archived).
  - `Settings`: Academic term configuration.
- **Workflow**:
  $$\text{Add College Data} \longrightarrow \text{Set Constraints} \longrightarrow \text{Generate Timetable} \longrightarrow \text{Review Conflicts} \longrightarrow \text{Apply Timetable} \longrightarrow \text{Manage Versions}$$

---

### 👨🏫 2. HOD (Department & Live Monitoring)
- **Role**: Handles departmental operations, live classroom monitoring, and emergency substitute assignments.
- **Dashboard Counters**:
  - **Today's Classes**: 48
  - **Active**: 32 (🟢 Live)
  - **Scheduled**: 9 (⚪ Upcoming)
  - **Vacant**: 5 (🔴 Immediate Attention)
  - **Substitute**: 2 (🟡 Assigned)
- **Live Monitoring Grid**:
  - `CLASS` | `SUBJECT` | `TEACHER` | `ROOM` | `STATUS` | `ACTION`
  - `IT-A` | Python | Arun | C204 | 🟢 ACTIVE
  - `IT-B` | DBMS | Kumar | C205 | ⚪ SCHEDULED
  - `IT-C` | Maths | Priya | C206 | 🔴 VACANT (1-click **Assign Substitute** modal)
  - `IT-D` | Java | Suresh | C207 | 🟡 SUBSTITUTE (Assigned to Rajesh)
- **HOD Substitution Flow**:
  $$\text{See Live Status} \longrightarrow \text{See Vacant Class} \longrightarrow \text{Find Available Teacher} \longrightarrow \text{Assign Substitute}$$

---

### 📱 3. Teacher (Mobile-First / PWA)
- **Role**: Simple mobile-first interface optimized for smartphone use and PWA installation.
- **Greeting**: "Good Morning, Arun 👋"
- **NEXT CLASS Card**:
  - Time: `10:00 - 11:00`
  - Subject: `Python` (IT-A, Room C204)
  - **[ CHECK IN ] Button**: Biometric check-in that activates the class live and syncs to the HOD monitoring board.
- **Today's Schedule**:
  - `09:00` DBMS IT-A ✓ Completed
  - `10:00` Python IT-B 🟢 Active
  - `11:00` Maths IT-C Upcoming
  - `12:00` Lab IT-A Upcoming
- **Navigation Bar**: Home, Today's Classes, My Timetable, Check-In, History.

---

## 🚀 How to Run

### Option 1: Direct in Browser
Simply double-click `index.html` or open it in your browser:
```bash
open /Users/sairam/Documents/mymonıterxx/index.html
```

### Option 2: Python Local Server
Run with Python:
```bash
cd /Users/sairam/Documents/mymonıterxx
python3 server.py
# Or:
python3 -m http.server 3000
```
Then visit [http://localhost:3000](http://localhost:3000).
