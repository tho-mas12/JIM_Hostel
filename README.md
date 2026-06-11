# JIM Hostel Attendance Management System

A production-ready, highly responsive, and feature-rich **Hostel Attendance Management System** tailored for student attendance tracking, leave clearances, and administrative reports.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite), TailwindCSS, Chart.js, Lucide Icons
- **Backend**: Python Flask REST API
- **Database**: Cloud MongoDB Atlas (with a local JSON file-based fallback)
- **Security**: JWT-based Authentication & Role Guards

---

## 🔑 Demo Credentials

| Role | Username | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin` | `admin123` | Create users/students/rooms, view logs, reset passwords. |
| **Assistant Director** | `ad_boys` | `ad123` | Mark attendance, edit same-day lists, log late curfew entries, download reports. |
| **Hostel Director** | `director` | `director123` | Monitor attendance trends, inspect defaulters, download reports. |

---

## 🌟 Key Features & Customizations

1. **Cloud Database Migration**: 
   - Shifted from a mock file-based database to a cloud MongoDB Atlas instance (`mongodb+srv://darwinthomas205_db_user:thomasDarwin12@cluster0.vmpo19j.mongodb.net/`).
   - Synced all pre-seeded collections (Users, Students, Rooms, Attendance history, and Late Curfew entries) to the cloud.

2. **Register Number Visual Cleanups**:
   - Removed all display elements of "Register Number" (and duplicate Student IDs) from the student table views, defaulters list, profiles, and reports to maintain a clean, distraction-free interface.
   - Kept under-the-hood Student ID indexing for database integrity.
   - Simplified forms by removing redundant fields like parent emails and phone numbers.

3. **Responsive Layout & Branding Footer**:
   - Designed a full-width premium dark-themed footer (`#0A1128`) featuring project navigation links and the `FWT | FrontierWox Tech Private Limited` branding and logo badge.
   - Positioned the footer at the bottom of the page flow (beneath the sidebar and main viewport), making it fully responsive on mobile layout screens.

4. **Dynamic Attendance Tools**:
   - AD portal automatically hides remarks input boxes when students are marked **Present** or **Leave**, showing them *only* for **Absent** or **Late Entry** statuses.
   - Added late-entry curfew logs for assistant directors.

5. **Director Defaulters Registry & Reports**:
   - Real-time analytics charts and attendance percentage warning flags.
   - Multi-format (PDF & Excel) report exporter for Daily Attendance, Defaulters, Leaves, and Room Occupancy.

---

## 🚀 Getting Started

### 1. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Boot the Flask API Server:
   ```bash
   python app.py
   ```
The server will run on `http://localhost:5000` with active MongoDB Atlas cloud database connection.

### 2. Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install package dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
Open `http://localhost:5173` in your browser.