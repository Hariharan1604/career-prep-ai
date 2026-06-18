# Career Prep AI

Career Prep AI is a full-stack, AI-powered platform designed to help job seekers identify skill gaps and prepare for interviews. Users can upload their resume and target a specific role or custom Job Description. The platform then uses a comprehensive Machine Learning pipeline to parse the resume, compute skill gaps via semantic matching, generate tailored interview questions, and build a personalized learning roadmap.

![Dashboard Preview](https://via.placeholder.com/1000x500?text=Career+Prep+AI+Dashboard)

## 🚀 Key Features

* **Instant Resume Parsing:** Extracts structured profile data (Experience, Projects, Education, Skills) from PDF resumes.
* **Semantic Skill Gap Analysis:** Uses NLP (`sentence-transformers`) to compute cosine similarity between a candidate's skills and the required skills for a role—handling synonyms perfectly.
* **AI Interview Generation:** Google Gemini generates technical, project-based, and behavioral interview questions tailored to your exact skill gaps.
* **Smart Ranking:** Uses a Cross-Encoder model to rank generated interview questions by relevance.
* **Personalized Roadmap:** Automatically recommends courses to fill in your missing skills.
* **Power BI Integration:** Includes an immersive, dark-themed analytics dashboard built with Recharts (10+ interactive charts) and a dataset exporter for actual Power BI desktop usage.
* **Automated PDF Reports:** Generates professional, multi-page career analysis reports via `reportlab`.

## 🛠️ Tech Stack

### Frontend
* **Framework:** Next.js (App Router), React, TypeScript
* **Styling:** Tailwind CSS, CSS Variables for seamless Dark Mode
* **Data Viz:** Recharts
* **State & API:** React Hooks, Axios

### Backend
* **Framework:** FastAPI, Python, Uvicorn
* **Database & Auth:** Supabase (PostgreSQL + Supabase Auth)
* **ML Libraries:** `pdfplumber`, `sentence-transformers`, `cross-encoder`, Google Gemini AI API
* **Exports:** `reportlab` (PDF generation)

## 📦 Getting Started

### Prerequisites
* Node.js (v18+)
* Python (3.10+)
* A Supabase project
* A Google Gemini API Key

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file and configure your keys:
   ```env
   SUPABASE_URL=your-supabase-url
   SUPABASE_KEY=your-supabase-anon-key
   GEMINI_API_KEY=your-google-gemini-key
   ```
5. Run the server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend-next
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 🧠 Machine Learning Architecture

1. **Extraction:** The user's PDF is processed by `pdfplumber` and Gemini to output strict JSON.
2. **Matching:** `all-MiniLM-L6-v2` compares candidate skills against JD skills.
3. **Question Gen:** Gemini prompts construct context-aware questions.
4. **Ranking:** `ms-marco-MiniLM-L-6-v2` scores the generated questions based on the target role context to filter out hallucinations or low-relevance questions.
