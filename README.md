# Course_Material_Repository

CourseHub is a full-stack web platform designed to organize and deliver structured learning resources for students through a centralized digital repository. The system enables administrators to manage courses and learning materials while allowing students to access, enroll in, and track their progress across multiple skill-based courses.

## Features

- **Student Dashboard:** Track enrolled courses, learning trajectory, and overall performance.
- **Admin Dashboard:** Manage courses, user enrollments, and upload new materials.
- **Course Discovery:** Browse available courses grouped by custom skill categories.
- **Progress Tracking:** Mark materials as read and visually track course/level completions.

## Tech Stack

- **Frontend:** React (Vite), React Router Dom, Recharts, Lucide-React
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB connection string

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/SnehaThangavel/Course_Material_Repository.git
   cd Course_Material_Repository
   ```

2. Install dependencies for server:
   ```bash
   cd server
   npm install
   ```

3. Install dependencies for client:
   ```bash
   cd ../client
   npm install
   ```

4. Setup Environment Variables:
   Create a `.env` file in the `server` directory and add:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

5. Run the Application:
   In the server directory:
   ```bash
   npm run dev
   ```
   In the client directory:
   ```bash
   npm run dev
   ```
