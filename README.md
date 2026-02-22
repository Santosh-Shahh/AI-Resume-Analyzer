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

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/resume_analyzer
NLP_SERVICE_URL=http://127.0.0.1:8001
JWT_SECRET=resume_analyzer_jwt_secret_2026
FRONTEND_URL=http://localhost:5173

# OAuth Configuration (optional)
GOOGLE_CLIENT_ID=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
```

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_GOOGLE_CLIENT_ID=
```

### OAuth Setup (Optional)

The application supports multiple authentication methods:
- **Email/Password** (always available)
- **Google OAuth** (requires setup)
- **GitHub OAuth** (requires setup)
- **LinkedIn OAuth** (requires setup)

#### Google OAuth Setup

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/apis/credentials
   - Create a new project or select an existing one

2. **Configure OAuth Consent Screen**
   - Click "OAuth consent screen" in the left sidebar
   - Select "External" user type
   - Fill in required fields:
     - App name: `AI Resume Analyzer`
     - User support email: Your email
     - Developer contact: Your email
   - Click "Save and Continue"

3. **Create OAuth 2.0 Client ID**
   - Click "Credentials" in the left sidebar
   - Click "+ CREATE CREDENTIALS" → "OAuth client ID"
   - Application type: "Web application"
   - Name: `AI Resume Analyzer - Web`
   - Authorized JavaScript origins:
     - `http://localhost:5173`
     - `http://127.0.0.1:5173`
   - Authorized redirect URIs:
     - `http://localhost:5173`
   - Click "Create"

4. **Copy and Configure**
   - Copy the generated Client ID
   - Paste it in `frontend/.env`:
     ```env
     VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
     ```
   - **Restart the frontend server** for changes to take effect

#### GitHub OAuth Setup

1. **Go to GitHub Settings**
   - Visit: https://github.com/settings/developers
   - Click "New OAuth App"

2. **Register Application**
   - Application name: `AI Resume Analyzer`
   - Homepage URL: `http://localhost:5173`
   - Authorization callback URL: `http://localhost:5001/api/auth/github/callback`
   - Click "Register application"

3. **Copy Credentials**
   - Copy the Client ID
   - Generate a new client secret
   - Add to `backend/.env`:
     ```env
     GITHUB_CLIENT_ID=your-client-id
     GITHUB_CLIENT_SECRET=your-client-secret
     ```

#### LinkedIn OAuth Setup

1. **Go to LinkedIn Developers**
   - Visit: https://www.linkedin.com/developers/apps
   - Click "Create app"

2. **Create Application**
   - App name: `AI Resume Analyzer`
   - Company: Your company/name
   - Logo: Upload a logo (optional)
   - Accept the terms and create

3. **Configure Auth**
   - In the "Auth" tab, add redirect URLs:
     - `http://localhost:5001/api/auth/linkedin/callback`
   - Copy Client ID and Client Secret
   - Add to `backend/.env`:
     ```env
     LINKEDIN_CLIENT_ID=your-client-id
     LINKEDIN_CLIENT_SECRET=your-client-secret
     ```

> **Note**: OAuth is optional. The app works without it using email/password authentication.

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
