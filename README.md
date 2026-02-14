# AI Resume Analyzer

A full-stack web application that analyzes resumes against job descriptions using AI to provide ATS scores, keyword matching, and improvement suggestions.

## 🚀 Features

- **Resume Upload**: Drag-and-drop PDF resume upload
- **Job Matching**: Compare resume against job descriptions
- **ATS Scoring**: Calculate applicant tracking system compatibility score
- **Keyword Analysis**: Identify matched and missing keywords
- **AI Suggestions**: Get improvement recommendations (OpenAI/Gemini integration ready)

## 🏗️ Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   React     │◄────►│   Node.js   │◄────►│   Python    │
│  Frontend   │      │   Backend   │      │ NLP Service │
│  (Port 5173)│      │ (Port 5000) │      │ (Port 8001) │
└─────────────┘      └──────┬──────┘      └─────────────┘
                            │
                      ┌─────▼─────┐
                      │  MongoDB  │
                      │           │
                      └───────────┘
```

## 📦 Tech Stack

### Frontend
- React 19 with Vite
- Tailwind CSS for styling
- Axios for API calls
- React Dropzone for file uploads

### Backend
- Node.js with Express
- Multer for file handling
- Mongoose for MongoDB
- CORS enabled

### NLP Service
- Python Flask
- PyPDF2 for text extraction
- OpenAI/Gemini API ready

## 🛠️ Installation

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- MongoDB (optional, app works without it)

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo>
   cd Resume
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Configure your environment variables
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

4. **NLP Service Setup**
   ```bash
   cd nlp_service
   pip install -r requirements.txt
   ```

## 🚦 Running the Application

### Start Backend
```bash
cd backend
npm start
```

### Start NLP Service
```bash
cd nlp_service
python app.py
```

### Start Frontend
```bash
cd frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **NLP Service**: http://localhost:8001

## ⚙️ Configuration

### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/resume_analyzer
NLP_SERVICE_URL=http://localhost:8001
```

### API Keys (Optional)
To enable AI-powered suggestions, add your API key:
- OpenAI: Set `OPENAI_API_KEY` in `nlp_service/.env`
- Gemini: Set `GEMINI_API_KEY` in `nlp_service/.env`

## 📁 Project Structure

```
Resume/
├── backend/
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes
│   ├── uploads/         # Uploaded files
│   ├── server.js        # Main server file
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
└── nlp_service/
    ├── app.py           # Flask server
    └── requirements.txt
```

## 🧪 Testing

1. Open http://localhost:5173
2. Enter a job description
3. Upload a resume PDF
4. View the analysis results

## 📝 API Endpoints

### POST /api/upload
Upload a resume and get analysis

**Request:**
- `resume`: PDF file (multipart/form-data)
- `jobDescription`: String

**Response:**
```json
{
  "message": "Resume uploaded successfully",
  "resumeId": "..."
}
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy the dist/ folder
```

### Backend (Heroku/Railway)
```bash
cd backend
# Push to your platform
```

### NLP Service (Docker)
```dockerfile
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]
```

## 🐛 Known Issues

- MongoDB connection is optional - app runs without database
- File upload works via CORS (configured for all origins in development)
- NLP analysis uses mock data until API keys are configured

## 📄 License

MIT

## 👤 Author

Your Name
