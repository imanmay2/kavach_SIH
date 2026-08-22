# Quick Start

This guide provides a straight-to-the-point setup for running the AI Governance platform using **Google Cloud Vertex AI**.

---

## 🔑 1. Quick Config (`.env` files)

You must create three `.env` files. Copy-paste these templates:

### 📁 Frontend: `frontend/.env`
```env
VITE_BACKEND_URL=http://localhost:3001
VITE_API_URL=http://localhost:3001
VITE_AGENT_URL=http://localhost:8000
VITE_APP_NAME="AI Governance"
```

### 📁 Backend: `backend/.env`
```env
MONGODB_URI=mongodb://admin:password123@localhost:27017/governance_db?authSource=admin
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your_jwt_secret_key_at_least_32_characters
AGENT_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=your_session_secret_key
```
### for the gcloud login
gcloud auth application-default login 

### 📁 Python Agent: `backend/Agents/.env`
```env
GENAI_PROVIDER=vertexai
GEMINI_CHAT_MODEL=gemini-3.5-flash
GEMINI_EMBED_MODEL=text-embedding-004

# Google Cloud Project Details
GOOGLE_CLOUD_PROJECT_ID=bionic-mercury-455722-g1
GOOGLE_CLOUD_LOCATION=us-central1

# Google Application Credentials (Point to your service account JSON file)
GOOGLE_APPLICATION_CREDENTIALS=C:/path/to/your/service-account.json

# Database
MONGODB_URI=mongodb://admin:password123@localhost:27017/governance_db?authSource=admin
MONGODB_DB=AI-Governance
MONGODB_UPLOADS_COL=rag_uploads
MONGODB_CHATS_COL=rag_chats
```
> **Vertex AI Auth Note:** Ensure you either:
> 1. Set `GOOGLE_APPLICATION_CREDENTIALS` in `backend/Agents/.env` to point to a valid service account JSON file.
> 2. Or, run `gcloud auth application-default login` on your machine before running the agent.

---

## ⚡ 2. One-Click Run (Windows)

We have created an automated script **`setup_and_run.bat`** in the root directory.
* **Double-click `setup_and_run.bat`** to automatically set up environment files, install dependencies, optionally seed libraries, and start all three services in separate console windows.

---

## 🏃 3. Manual Start (If not using the runner)

Open 3 terminals:

* **Terminal 1 (Backend)**:
  ```bash
  cd backend
  npm install
  npm run dev
  ```

* **Terminal 2 (Agent)**:
  ```bash
  cd backend/Agents
  python -m venv .venv
  .\.venv\Scripts\activate.bat
  pip install -r requirements.txt
  python main.py
  ```

* **Terminal 3 (Frontend)**:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```

---

## 🗄️ 4. One-Time Database Init (Run in another terminal)

1. **Start MongoDB and Redis (Docker)**:
   ```bash
   cd backend
   docker-compose -f docker-compose.dev.yml up -d
   ```
2. **Seed Questionnaire Templates**:
   ```bash
   cd backend
   npm run seed
   ```
3. **Seed Agent Risks & Controls**:
   ```bash
   cd backend/Agents
   # Ensure .venv is activated
   python import_libraries.py
   ```
4. **Create Admin User**:
   ```bash
   cd backend
   node createDemoUser.js
   ```

* **Frontend URL**: http://localhost:5173
* **Admin Login**: `demo@kavach.com` / `governance.demo@Kavach`
