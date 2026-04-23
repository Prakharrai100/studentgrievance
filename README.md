# 🎓 GrieveEase — Student Grievance Management System

A full-stack **MERN** web application that allows students to register, log in, and manage academic, hostel, transport, or other grievances. Built with security-first principles using JWT authentication and bcrypt password hashing.

---

## 📁 Folder Structure

```
Student_Grievance/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── middleware/
│   │   └── auth.js             # JWT verification middleware
│   ├── models/
│   │   ├── Student.js          # Student schema (with bcrypt)
│   │   └── Grievance.js        # Grievance schema
│   ├── routes/
│   │   ├── auth.js             # /register + /login
│   │   └── grievances.js       # Full CRUD + search
│   ├── .env                    # Environment variables
│   ├── server.js               # Express entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js         # Axios instance + interceptors
    │   ├── components/
    │   │   ├── GrievanceCard.jsx
    │   │   ├── GrievanceForm.jsx
    │   │   └── Navbar.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx  # Global auth state + localStorage
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Login.jsx
    │   │   └── Register.jsx
    │   ├── App.jsx              # Routes + route guards
    │   ├── index.css            # Global dark glassmorphism design
    │   └── main.jsx             # React entry point
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Step-by-Step Setup Guide

### Prerequisites
- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **MongoDB** (local or Atlas) — [mongodb.com](https://www.mongodb.com)
- **Git** — [git-scm.com](https://git-scm.com)

---

### 1. Clone / Enter Project

```bash
cd Student_Grievance
```

---

### 2. Configure the Backend

```bash
cd backend
npm install
```

Edit the `.env` file with your values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/student_grievance
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_2024
```

> **MongoDB Atlas users:** Replace `MONGO_URI` with your Atlas connection string:
> `mongodb+srv://username:password@cluster.mongodb.net/student_grievance?retryWrites=true&w=majority`

Start the backend:
```bash
npm run dev     # Development (auto-restarts on change)
# OR
npm start       # Production
```

✅ You should see:
```
✅ Server running on port 5000
✅ MongoDB Connected: localhost
```

---

### 3. Configure the Frontend

```bash
cd ../frontend
npm install
npm run dev
```

✅ Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔌 Backend API Reference

### Auth Endpoints

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/register` | `{ name, email, password }` | Register a new student |
| POST | `/api/login` | `{ email, password }` | Login and receive JWT |

### Grievance Endpoints (🔐 JWT Required)

All grievance endpoints require:
```
Authorization: Bearer <your_jwt_token>
```

| Method | Endpoint | Body/Query | Description |
|--------|----------|-----------|-------------|
| POST | `/api/grievances` | `{ title, description, category }` | Submit a grievance |
| GET | `/api/grievances` | — | Get all user's grievances |
| GET | `/api/grievances/:id` | — | Get a single grievance |
| PUT | `/api/grievances/:id` | `{ title?, description?, category?, status? }` | Update a grievance |
| DELETE | `/api/grievances/:id` | — | Delete a grievance |
| GET | `/api/grievances/search?title=` | `?title=xyz` | Search by title |

---

## 📬 Postman API Testing Examples

### 1. Register
```http
POST http://localhost:5000/api/register
Content-Type: application/json

{
  "name": "Rahul Sharma",
  "email": "rahul@university.edu",
  "password": "secret123"
}
```
**Response:**
```json
{
  "_id": "663abc123...",
  "name": "Rahul Sharma",
  "email": "rahul@university.edu",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Registration successful!"
}
```

---

### 2. Login
```http
POST http://localhost:5000/api/login
Content-Type: application/json

{
  "email": "rahul@university.edu",
  "password": "secret123"
}
```

---

### 3. Submit Grievance
```http
POST http://localhost:5000/api/grievances
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Library books not available",
  "description": "Required textbooks for Computer Networks are not stocked in the library.",
  "category": "Academic"
}
```

---

### 4. Get All Grievances
```http
GET http://localhost:5000/api/grievances
Authorization: Bearer <token>
```

---

### 5. Search Grievances
```http
GET http://localhost:5000/api/grievances/search?title=library
Authorization: Bearer <token>
```

---

### 6. Update Status to Resolved
```http
PUT http://localhost:5000/api/grievances/663abc456...
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "Resolved"
}
```

---

### 7. Delete Grievance
```http
DELETE http://localhost:5000/api/grievances/663abc456...
Authorization: Bearer <token>
```

---

## 🎨 Feature Walkthrough / Screenshot Descriptions

### 📸 1. Login Page
- Dark glassmorphism card centered on screen
- GrieveEase logo with gradient text
- Email + Password fields with glowing focus state
- "Sign In" button with gradient background
- Link to Register page

### 📸 2. Register Page
- Similar glassmorphism design to Login
- Additional "Full Name" field
- Instant error feedback (e.g., "Email already registered")
- Auto-redirects to Dashboard on success

### 📸 3. Dashboard — Stats Bar
- Three stat cards: Total / Pending / Resolved
- Gradient number typography
- Updates automatically after submit/delete

### 📸 4. Dashboard — Submit Form (Left Panel)
- Title input, Category dropdown (Academic/Hostel/Transport/Other)
- Description textarea
- Purple gradient Submit button
- Success/error toast messages

### 📸 5. Dashboard — Grievance List (Right Panel)
- Each card has a left purple border accent
- Category badge (purple), Status badge (amber=Pending, green=Resolved)
- Date shown on the right
- Edit, Delete, Mark Resolved action buttons

### 📸 6. Edit Modal
- Modal overlay with blur backdrop
- Editable Title, Category, Status, Description
- Save Changes + Cancel buttons

### 📸 7. Search Feature
- Search bar with magnifier icon
- Real-time search via API call
- "Clear" button reloads all grievances

---

## ☁️ Deployment Guide

### Backend → Render

1. Push `backend/` to a GitHub repository
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Add Environment Variables:
   - `MONGO_URI` = your Atlas URI
   - `JWT_SECRET` = your secret key
   - `NODE_ENV` = production
7. Deploy!

Your backend will be at: `https://your-service.onrender.com`

---

### Frontend → Vercel

1. Push `frontend/` to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import the `frontend` folder
4. Framework: **Vite**
5. Add Environment Variable:
   - `VITE_API_URL` = `https://your-backend.onrender.com`
6. Update `frontend/src/api/axios.js`:
   ```js
   baseURL: import.meta.env.VITE_API_URL + '/api',
   ```
7. Also update the backend's `cors` origin to allow your Vercel URL.
8. Deploy!

---

## 🔒 Security Notes

- Passwords are **never** stored in plain text — bcrypt with salt factor 10
- JWT tokens expire in **7 days** — implement refresh tokens for production
- Each student can only see and manage **their own** grievances (userId filter)
- All sensitive routes are protected by the `protect` middleware
- CORS is restricted to known frontend origins

---

## 🛠 Technologies Used

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Auth State | React Context API + localStorage |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) |
| Password | bcryptjs |
| Dev Server | Nodemon |
| Styling | Vanilla CSS (Glassmorphism) |

---

## 👨‍💻 Author

Built with ❤️ as a MERN Stack full-stack project.
