# Course Material Repository (CMR)

A complete web application for storing and sharing course materials, featuring role-based access for Admins and Students.

## 🚀 Features
- **Role-based Auth**: Admin & Student portals with strict access control.
- **Admin Dashboard**: Manage courses, add/edit/delete content, upload materials.
- **Student Dashboard**: View courses, download materials, track progress.
- **Soft UI Design**: Modern, clean interface with smooth animations.
- **Secure**: JWT authentication, password hashing, protected API routes.

## 🛠 Tech Stack
- **Frontend**: React (Vite), Plain CSS (Variables, Soft UI Theme)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)

## 📂 Project Structure
```
/client       # React Frontend
/server       # Express Backend
```

## ⚙️ Setup Instructions

### 1. Prerequisites
- Node.js installed
- MongoDB installed and running locally

### 2. Backend Setup
```bash
cd server
npm install
# Seed the database with initial data (Admin & Courses)
npm run seed
# Start the server (runs on port 5000)
npm start
```

### 3. Frontend Setup
```bash
cd client
npm install
# Start the development server (runs on port 5173)
npm run dev
```

### 4. Login Credentials (Seed Data)
| Role    | Email              | Password    |
|---------|--------------------|-------------|
| Admin   | admin@cmr.com      | Admin@123   |
| Student | student1@cmr.com   | Student@123 |
| Student | student2@cmr.com   | Student@123 |

## 🔗 API Endpoints

### Auth
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get single course
- `POST /api/courses` - Create course (Admin)
- `PUT /api/courses/:id` - Update course (Admin)
- `DELETE /api/courses/:id` - Delete course (Admin)
- `POST /api/courses/:id/materials` - Add material (Admin)
- `POST /api/courses/:id/complete` - Mark complete (Student)

## 🎨 Design System
The application uses a "Soft UI" design system with:
- Primary Color: `#2c3e50`
- Secondary Color: `#3498db`
- Accent Color: `#1abc9c`

---
*Built for Course Material Repository Project Submission.*
