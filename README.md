# AI-Powered Learning Management System

## 🚀 Overview
A full-stack LMS platform with AI-powered features including summaries, chatbot tutor, quizzes, and personalized recommendations.

## 🧠 Features
* User Authentication (JWT)
* Subjects, Sections, Videos
* YouTube video integration
* Resume playback & progress tracking
* Strict learning path (lock/unlock system)
* AI Tutor (chatbot)
* AI Summaries
* AI Quiz Generator
* AI Recommendations

## 🏗️ Tech Stack
**Frontend:**
* Next.js 14
* Tailwind CSS
* Zustand
* react-youtube

**Backend:**
* Node.js
* Express
* mysql2

**Database:**
* MySQL

**AI:**
* Hugging Face Inference API (`@huggingface/inference`)

## 📦 Installation

### Backend
```sh
cd backend
npm install
npm run dev
```

### Frontend
```sh
cd frontend
npm install
npm run dev
```

## 🔑 Environment Variables

**Backend (`.env`):**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=lms_db
DB_PORT=3306

JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

HF_TOKEN=your_huggingface_access_token
```

## 🌐 API Endpoints

### Auth
* `POST /api/auth/login`
* `POST /api/auth/register`
* `POST /api/auth/refresh`

### Subjects & Videos
* `GET /api/subjects`
* `GET /api/subjects/:id/tree`
* `GET /api/videos/:videoId`

### Progress
* `GET /api/progress/videos/:videoId`
* `POST /api/progress/videos/:videoId`
* `GET /api/progress/subjects/:subjectId`

### AI
* `POST /api/ai/summary`
* `POST /api/ai/chat`
* `POST /api/ai/quiz`
* `GET /api/ai/recommendations/:userId`

## 📊 Future Enhancements
* Certificates
* Notes system
* AI semantic search
* Voice-based tutor

## 👨‍💻 Author
* Venkat
