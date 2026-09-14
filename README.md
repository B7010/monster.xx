# MyMonitorXX - Campus Timetable & Live Monitoring Portal

Automated college timetable generator, departmental live attendance monitoring, and teacher check-in PWA with role-based authentication and hierarchical user provisioning.

---

## 🔐 Authentication & Access Credentials

The login screen supports auto-role routing based on the registered Gmail address:

| Role | Login ID / Email | Password | Access Rights |
|---|---|---|---|
| **👨💼 Admin (Hulk)** | `hulk@pluto.in` | `HULK@123` | Master control: Full campus administrative privileges. |
| **👨💼 Admin (System)** | `canvaonly322@gmail.com` | `123BALASELVARAJA123` | Master control: Generates timetables, sets campus rules, **provisions HOD accounts**. |
| **👨🏫 HOD (IT Dept)** | `hod.it@college.edu` | `hodpassword123` | Department control: Live monitoring, vacant class substitution, **provisions Teacher accounts**. |
| **📱 Teacher (Arun)** | `arun@college.edu` | `teacherpass123` | Mobile PWA check-in: View daily schedule, 1-tap class check-in to activate live classroom status. |

> **Tip**: The login page includes **1-Click Quick Login buttons** for instant testing without typing.

---

## 👑 Hierarchical User Provisioning

1. **Admin adds HODs**:
   - Go to Admin Panel $\rightarrow$ **Department Heads (HODs)** $\rightarrow$ Click **+ Add HOD**.
   - Input Name, Department, Gmail Address, and set an Access Password.
   - The HOD can immediately sign in using those credentials.

2. **HOD adds Teachers**:
   - Go to HOD Desk $\rightarrow$ **Department Teachers** $\rightarrow$ Click **+ Add Teacher**.
   - Input Name, Subject, Department, Gmail Address, and set an Access Password.
   - The teacher can immediately sign in using those credentials into their mobile PWA.

---

## 🌟 Portals & Workflow

### 1. 👨💼 Admin Portal
- **Main Workflow**:
  $$\text{Add College Data} \longrightarrow \text{Set Constraints} \longrightarrow \text{Generate Timetable} \longrightarrow \text{Review Conflicts} \longrightarrow \text{Apply Timetable} \longrightarrow \text{Manage Versions}$$
- **Features**: Autonomous Timetable Generator with constraint solver simulation, Faculty Directory, HOD Provisioning, Room allocation, and Version history.

### 2. 👨🏫 HOD Portal (Live Monitoring)
- **Counters**: Today's Classes (48) • Active (32 🟢) • Scheduled (9 ⚪) • Vacant (5 🔴) • Substitute (2 🟡).
- **Substitution Flow**:
  $$\text{Live Status} \longrightarrow \text{Vacant Class Alert} \longrightarrow \text{Find Free Teacher} \longrightarrow \text{1-Click Assign Substitute}$$

### 3. 📱 Teacher Portal (PWA)
- **Greeting**: "Good Morning, Arun 👋" with campus WiFi geo-verification.
- **NEXT CLASS Card**: 10:00 - 11:00 Python IT-A (Room C204) with **[ CHECK IN NOW ]** button.
- **Schedule**:
  - `09:00` DBMS IT-A ✓ Completed
  - `10:00` Python IT-B 🟢 Active
  - `11:00` Maths IT-C Upcoming
  - `12:00` Lab IT-A Upcoming

### 4. 🤖 AI Timetable Studio & Document Generator
- **Autonomous Scheduling Engine**: Constraint satisfaction solver respecting 2-3 period contiguous lab blocks, theory distribution, and faculty workloads.
- **1-Tap Period Swapping**: Click any period cell (turns amber) and tap any second cell to swap them instantly with live conflict checking.
- **Official SCAD College Document Engine**: Generates publication-grade 300 DPI SSAA A4 document images (`timetable.png`) and vector printable PDFs (`timetable.html`).
- **Campus-Wide Publishing**: 1-click apply button pushes the newly generated timetable to the active schedule across Admin, HOD, and Teacher portals.

---

## 🚀 How to Run Locally

### Start Local Server
```bash
python server.py
```
Then visit:
- **Main Portal**: `http://localhost:3000`
- **Dedicated AI Timetable Studio**: `http://localhost:3000/ai_timetable_studio.html`
- **Official 300 DPI Document Image**: `http://localhost:3000/api/image`
- **Vector PDF / Print View**: `http://localhost:3000/api/html`
