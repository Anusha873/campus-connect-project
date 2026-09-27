# CampusConnect – College Management System

![CampusConnect Logo & Banner](https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80)

**CampusConnect** is a comprehensive, production-ready, full-stack college management web application that unifies **Admin**, **HOD (Head of Department)**, **Faculty**, and **Students** onto a single collaborative platform.

The system centralizes student academic information, real-time attendance tracking, dynamic timetables, internal assessment marks, semester examination results, study materials, announcements, leave request workflows, and student performance analytics.

---

## 🌟 Key Highlight: Targeted Material & Assignment Isolation

Faculty can upload study materials and assign homework directly targeted to a specific **Department + Year + Semester + Section**.
- Students only see materials, assignments, notifications, and timetables strictly relevant to their enrolled class/section.
- Strict multi-tenant isolation ensures Section A students never see Section B assignments or study notes, and vice versa.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React.js 18 + Vite
- **Routing:** React Router v6
- **Styling:** Vanilla CSS + Tailwind CSS (Responsive mobile-first design, dark-accented institutional themes)
- **Data Visualization & Analytics:** Recharts (Bar Charts, Line Charts, Radar Charts, Pie Charts)
- **HTTP Client:** Axios with JWT Bearer Token Request/Response Interceptors
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js & Express.js REST API
- **Authentication & Security:** JWT (JSON Web Tokens), bcryptjs password hashing, role-based authorization middleware
- **File Uploads:** Multer with mime-type filtering, sanitized filenames, and 25MB limits
- **Data Modeling:** Mongoose ODM (Object Data Modeling)
- **Environment Management:** dotenv

### Database
- **Primary:** MongoDB Atlas (Cloud Database)
- **Fallback / Local Dev:** Local MongoDB (`mongodb://127.0.0.1:27017/campusconnect`) with embedded memory fallback for zero setup friction.

---

## 🏛️ Project Architecture

```
                          ┌───────────────────────────┐
                          │   React 18 + Vite Client   │
                          │   (Tailwind CSS, Recharts)│
                          └─────────────┬─────────────┘
                                        │
                         HTTP REST API (JWT Bearer)
                                        │
                                        ▼
                          ┌───────────────────────────┐
                          │     Node + Express API    │
                          │  (Auth & Role Middleware) │
                          └─────────────┬─────────────┘
                                        │
                 ┌──────────────────────┼──────────────────────┐
                 │                      │                      │
                 ▼                      ▼                      ▼
        ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
        │   Multer Local  │    │  Mongoose ODM   │    │ CSV Export &    │
        │ File Storage    │    │ (Data Schemas)  │    │ Analytics Engine│
        │ (/uploads/*)    │    └────────┬────────┘    └─────────────────┘
        └─────────────────┘             │
                                        ▼
                               ┌─────────────────┐
                               │  MongoDB Atlas  │
                               │  (Cloud Clust.) │
                               └─────────────────┘
```

---

## 📂 Project Structure

```
CampusConnect/
│
├── client/                                 # React Frontend Application
│   ├── src/
│   │   ├── components/                     # Reusable UI Components
│   │   │   ├── common/                     # StatCard, Badge, Modal, ConfirmDialog, etc.
│   │   │   ├── layout/                     # Sidebar, Navbar, NotificationDropdown
│   │   │   └── routing/                    # ProtectedRoute with role authorization
│   │   ├── context/                        # AuthContext (JWT session management)
│   │   ├── pages/                          # Role-specific Page Views
│   │   │   ├── admin/                      # AdminDashboard, Students, Faculty, Timetable, etc.
│   │   │   ├── hod/                        # HODDashboard, Department Students, Faculty, Leaves
│   │   │   ├── faculty/                    # FacultyDashboard, Attendance, Assignments, Marks
│   │   │   ├── student/                    # StudentDashboard, Assignments, Materials, Results
│   │   │   ├── auth/                       # Login page with 1-click test credentials
│   │   │   └── common/                     # Profile, Unauthorized, NotFound
│   │   ├── services/                       # api.js Axios configuration
│   │   ├── App.jsx                         # Main Routing configuration
│   │   ├── main.jsx                        # React root entry point
│   │   └── index.css                       # Global styles & Tailwind directives
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
│
├── server/                                 # Node.js Express REST Backend
│   ├── config/                             # db.js (MongoDB Atlas & local connection)
│   ├── controllers/                        # Business logic controllers (18 controllers)
│   ├── middleware/                         # authMiddleware, uploadMiddleware, errorMiddleware
│   ├── models/                             # 15 Mongoose schema models
│   ├── routes/                             # 18 Express REST route files
│   ├── scripts/                            # seed.js (Full university demo seed), verify_workflow.js
│   ├── uploads/                            # Stored PDFs, assignment docs, notes
│   ├── server.js                           # Express app entry point
│   ├── .env.example
│   └── package.json
│
├── .env.example                            # Root environment template
├── .gitignore                              # Git exclusion rules
├── package.json                            # Root workspaces configuration
└── README.md                               # Project documentation
```

---

## ⚙️ Environment Variables Setup

### Backend Configuration (`server/.env`):
Create `server/.env` with the following variables:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/campusconnect?retryWrites=true&w=majority
JWT_SECRET=campusconnect_super_secure_jwt_secret_token_2026
```
*(If `MONGODB_URI` is omitted or unavailable, the server automatically connects to local MongoDB `mongodb://127.0.0.1:27017/campusconnect`)*

### Frontend Configuration (`client/.env`):
Create `client/.env` with:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB Atlas account connection string OR local MongoDB server running

### 2. Clone and Install Dependencies
From the project root:
```bash
# Install root, backend, and frontend packages:
npm run install-all
```
*Or manually:*
```bash
cd server && npm install
cd ../client && npm install
```

### 3. Seed Database with Realistic University Data
Seed 1 Admin, 2 HODs, 5 Faculty, 20 Students, timetables, courses, marks, and attendance:
```bash
cd server
npm run seed
```

### 4. Start the Application
Run both backend and frontend concurrently:
```bash
# From the project root:
npm run dev
```

Or run separately in two terminal windows:
```bash
# Terminal 1 - Backend Server:
cd server
npm run dev

# Terminal 2 - Frontend Client:
cd client
npm run dev
```

- **Frontend Client:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000/api](http://localhost:5000/api)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Demo Test Accounts

All accounts use the standard password: **`password123`**

| Role | Name | Email | Department / Notes |
| :--- | :--- | :--- | :--- |
| **Admin** | University Admin | `admin@campusconnect.edu` | Full university control, reports, and accounts |
| **HOD** | Dr. Rajesh Verma | `hod.cse@campusconnect.edu` | Computer Science & Engineering Head |
| **HOD** | Dr. Arvind Swaminathan | `hod.ece@campusconnect.edu` | Electronics & Communication Head |
| **Faculty** | Prof. Priya Sharma | `priya.sharma@campusconnect.edu` | Assistant Professor, CSE (DBMS & OS) |
| **Faculty** | Prof. Vikram Mehta | `vikram.mehta@campusconnect.edu` | Associate Professor, CSE (DSA) |
| **Faculty** | Dr. Neha Agarwal | `neha.agarwal@campusconnect.edu` | Professor, ECE |
| **Student** | Aarav Sharma | `aarav.sharma@campusconnect.edu` | **CSE Year 3, Sem 5, Section A** (Roll: 23CSE001) |
| **Student** | Kunal Trivedi | `kunal.trivedi@campusconnect.edu` | **CSE Year 3, Sem 5, Section B** (Roll: 23CSE051) |
| **Student** | Ananya Sen | `ananya.sen@campusconnect.edu` | **ECE Year 3, Sem 5, Section A** (Roll: 23ECE001) |

> 💡 **Quick Login Buttons:** The login screen at `http://localhost:5173` features 1-click test credentials to instantly sign into any of these roles!

---

## 🎯 Verification of Strict Class-Level Isolation

To verify class targeting:
1. Log in as **Aarav Sharma** (`aarav.sharma@campusconnect.edu` - **Section A**):
   - Navigate to **Assignments**: You will see Section A coursework (e.g. *Database Normalization and BCNF Design Case Study*).
   - Navigate to **Study Materials**: You will see Section A notes.
2. Log out and log in as **Kunal Trivedi** (`kunal.trivedi@campusconnect.edu` - **Section B**):
   - Navigate to **Assignments**: You will see *Section B Special Networking Assignment: Socket Programming*.
   - Section A assignments and materials are strictly hidden from Section B students!

You can also run our automated verification suite:
```bash
cd server
node scripts/verify_workflow.js
```

---

## 📡 REST API Reference

All protected endpoints require the header:
`Authorization: Bearer <jwt_token>`

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticates credentials and returns JWT token + user profile |
| `GET` | `/api/auth/me` | Private | Retrieves current logged-in user profile |
| `POST` | `/api/auth/register-student` | Admin | Registers a new student account and profile |
| `POST` | `/api/auth/register-faculty` | Admin | Registers a new faculty or HOD account and profile |

### Assignments (`/api/assignments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/assignments` | Authenticated | Lists assignments targeted to student's class, or created by faculty |
| `POST` | `/api/assignments` | Faculty, Admin | Creates a new assignment with targeted class/section and attachment |
| `GET` | `/api/assignments/:id` | Authenticated | Gets assignment details |
| `POST` | `/api/assignments/:id/submit` | Student | Submits file and notes for an assignment |
| `GET` | `/api/assignments/:id/submissions` | Faculty, Admin | Lists all student submissions for an assignment |
| `PUT` | `/api/assignments/submissions/:id/evaluate` | Faculty, Admin | Grades submission, assigns marks, and provides feedback |

### Study Materials (`/api/study-materials`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/study-materials` | Authenticated | Lists materials matching student's class/section or faculty's uploads |
| `POST` | `/api/study-materials` | Faculty, Admin | Uploads educational files (PDF, DOC, PPT) targeted to class |
| `DELETE` | `/api/study-materials/:id` | Faculty, Admin | Removes a study material record and file |

### Attendance (`/api/attendance`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/attendance/class-students` | Faculty, Admin | Loads enrolled students for a specific class to mark attendance |
| `POST` | `/api/attendance/mark` | Faculty, Admin | Bulk marks Present/Absent status for selected class and date |
| `GET` | `/api/attendance/student/:id?` | Authenticated | Fetches student attendance percentage, history, and subject breakdown |

### Reports & CSV Exports (`/api/reports`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reports/attendance/csv` | Admin, HOD | Exports complete attendance history as downloadable CSV |
| `GET` | `/api/reports/marks/csv` | Admin, HOD | Exports internal marks records as CSV |
| `GET` | `/api/reports/results/csv` | Admin, HOD | Exports examination results as CSV |
| `GET` | `/api/reports/students/csv` | Admin, HOD | Exports enrolled students directory as CSV |

### Other Core Modules
- **Timetables:** `/api/timetable` (Weekly grid schedules for students and faculty)
- **Internal Marks:** `/api/internal-marks` (Marks entry with validation against maximum marks)
- **Examinations:** `/api/results` (Semester result cards, SGPA, grades, credit weightings)
- **Leave Requests:** `/api/leaves` (Student application and HOD approval workflow)
- **Announcements:** `/api/announcements` (Targeted college, department, and class notices)
- **Notifications:** `/api/notifications` (Real-time student alerts and read status)
- **Analytics:** `/api/analytics/admin` & `/api/analytics/hod` (KPIs, distribution metrics)

---

## 🔒 Security Best Practices Implemented
1. **No Sensitive Credentials in Source Control:** Passwords and DB connection strings use environment variables (`process.env.MONGODB_URI`, `JWT_SECRET`).
2. **Password Hashing:** All passwords salted and hashed using `bcryptjs` with salt work factor 10.
3. **No Plaintext Passwords in Responses:** User models explicitly set `{ select: false }` for password hashes.
4. **Role-Based Access Control (RBAC):** Backend route middleware (`authorizeRoles('admin', 'hod', 'faculty', 'student')`) and frontend `ProtectedRoute` components prevent unauthorized URL navigation.
5. **Safe File Uploads:** Multer restricts executable files (`.exe`, `.sh`, `.bat`), limits file sizes to 25MB, and sanitizes filenames.

---

## 📄 License
This project is open-source and built for educational and institutional management purposes.
