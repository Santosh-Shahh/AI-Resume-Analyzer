# AI Resume Analyzer

A full-stack web application that acts as an AI Applicant Tracking System (ATS). It analyzes PDF resumes against job descriptions using Natural Language Processing (via the Groq API) to provide ATS scores, keyword matching, and actionable improvement suggestions.

![AI Resume Analyzer Demo](https://ai-resume-analyzer-gamma-smoky.vercel.app/og-image.png)

## 🌐 Live Demo
- **Frontend**: [https://ai-resume-analyzer-gamma-smoky.vercel.app](https://ai-resume-analyzer-gamma-smoky.vercel.app)
- **Backend (API)**: [https://ai-resume-analyzer-1-wng2.onrender.com](https://ai-resume-analyzer-1-wng2.onrender.com)
- **NLP Service**: [https://ai-resume-analyzer-r3r8.onrender.com](https://ai-resume-analyzer-r3r8.onrender.com)

## 🚀 Features

- **Resume Upload**: Fast PDF extraction and processing.
- **Job Matching**: Intelligent comparison of resume content against provided Job Descriptions.
- **ATS Scoring**: Accurate "Resume Health" score out of 100 based on keyword density and relevance.
- **Keyword Analysis**: Visual breakdown of matched vs. missing keywords.
- **AI Suggestions**: Detailed feedback on how to improve the resume using Llama-3 via the Groq API.
- **Secure Authentication**: Traditional Email/Password (bcrypt hashed) + Google Sign-In (Credential Flow).
- **History Tracking**: All previous resume uploads and scores are saved to the user's dashboard.

## 🏗️ Architecture

The application is built using a modern microservices architecture, separating front-end rendering, core API logic, and heavy AI workloads.

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   React     │◄────►│   Node.js   │◄────►│   Python    │
│  Frontend   │ REST │   Backend   │ HTTP │ NLP Service │
│  (Vercel)   │      │  (Render)   │      │  (Render)   │
└─────────────┘      └──────┬──────┘      └─────────────┘
                            │
                      ┌─────▼─────┐
                      │  MongoDB  │
                      │  (Atlas)  │
                      └───────────┘
```

## 📦 Tech Stack

### Frontend (`frontend/`)
- **React 18** with Vite
- **Tailwind CSS** for UI styling
- **Axios** (Centralized API client)
- **@react-oauth/google** (Google Sign-In Credential Flow)
- Deployed on **Vercel**

### Backend (`backend/`)
- **Node.js** & **Express**
- **MongoDB** via Mongoose (Deployed on MongoDB Atlas)
- **Multer** (Memory storage for file uploads)
- **JWT** (JSON Web Tokens for session management)
- **Nodemailer** (SMTP integration for Password Reset)
- Deployed on **Render** (Web Service)

### NLP Service (`nlp_service/`)
- **Python 3.11** & **Flask**
- **PyPDF2** (PDF text extraction)
- **Groq API** (Llama 3 8B model for fast NLP analysis)
- **Gunicorn** (Production WSGI server)
- Deployed on **Render** (Web Service)

## 🛠️ Local Development Setup

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- MongoDB connection string (Atlas or Local)
- Groq API Key

### 1. Clone the repository
```bash
git clone https://github.com/Santosh-Shahh/AI-Resume-Analyzer.git
cd AI-Resume-Analyzer
```

### 2. Backend Setup (Node.js)
```bash
cd backend
npm install
```
Create a `.env` file in `backend/`:
```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
NLP_SERVICE_URL=http://127.0.0.1:8001
GOOGLE_CLIENT_ID=your_google_client_id

# Optional: For Password Reset
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```
Run the backend:
```bash
npm start
```

### 3. NLP Service Setup (Python)
Open a new terminal:
```bash
cd nlp_service
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```
Create a `.env` file in `nlp_service/`:
```env
GROQ_API_KEY=your_groq_api_key
```
Run the Python service:
```bash
flask run --port=8001
```

### 4. Frontend Setup (React/Vite)
Open a third terminal:
```bash
cd frontend
npm install
```
Create a `.env.local` file in `frontend/`:
```env
# Point to the local backend during development
VITE_API_URL=http://localhost:5001
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```
Start the Vite dev server:
```bash
npm run dev
```

## 🔐 Google OAuth Configuration (ID Token Flow)

Unlike the implicit flow, the Credential/ID Token flow used in this project does **NOT** require configuring authorized redirect URIs. 

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create/Select your project and go to **APIs & Services > Credentials**.
3. Create an **OAuth 2.0 Client ID** (Type: Web application).
4. Add your **Authorized JavaScript Origins**:
   - `http://localhost:5173` (Local dev)
   - `https://ai-resume-analyzer-gamma-smoky.vercel.app` (Production)
5. Save the generated Client ID and add it to your `.env` files (`backend/.env` and `frontend/.env.production`).

## ☁️ Deployment Strategy

This project handles file uploads in a serverless/cloud environment using **Base64 encoding**:
1. User uploads a PDF to React (Vercel).
2. React posts the file to Node.js (Render) `upload.js` via `multipart/form-data`.
3. Node.js intercepts the file into a pure RAM memory buffer.
4. Node.js converts the buffer to a Base64 string and posts it via HTTP to the Python microservice (Render).
5. Python decodes the Base64 back into a PDF, runs extraction, requests the Groq LLM, and returns the JSON analysis.

## 📄 License
MIT

## 👤 Author
Santosh Shah
