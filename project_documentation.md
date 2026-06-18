# Career Prep AI: System Architecture & Documentation

## 1. System Overview
Career Prep AI is a full-stack platform designed to help job seekers identify skill gaps and prepare for interviews. Users upload their resume and a target role (or custom job description), and the system uses a comprehensive Machine Learning pipeline to parse the resume, compute skill gaps via semantic matching, generate tailored interview questions, and build a personalized learning roadmap.

### Tech Stack
- **Frontend**: Next.js (App Router), React, Tailwind CSS, Recharts, Lucide Icons, Axios.
- **Backend**: Python, FastAPI, Uvicorn.
- **Database / Auth**: Supabase (PostgreSQL + Supabase Auth).
- **Machine Learning**: `pdfplumber` (PDF parsing), Google Gemini API (LLM generation), `sentence-transformers` (Semantic similarity), `cross-encoder` (Ranking).
- **Exports**: `reportlab` (PDF generation).

---

## 2. The Machine Learning Pipeline
The heart of the backend is located in `backend/app/ml/` and orchestrated by `backend/app/analysis/service.py`. When a user submits a resume, the following 6-step pipeline executes:

### Step 1: Resume Parsing (`resume_parser.py`)
- The uploaded PDF is processed using `pdfplumber` to extract raw text.
- The text is sent to an LLM (Google Gemini) with a strict prompt to extract a structured JSON profile containing: Name, Contact, Education, Experience, Projects, and a raw list of Skills.

### Step 2: Semantic Skill Matching (`skill_matcher.py`)
- **Normalization:** The extracted raw skills are cleaned and normalized.
- **Extraction:** If a custom Job Description (JD) is provided, the LLM extracts the required and good-to-have skills from the JD text. If a predefined role is selected, it loads skills from a local JSON database.
- **Semantic Matching:** Instead of strict string matching, the system uses a local embedding model (`sentence-transformers/all-MiniLM-L6-v2`) to compute cosine similarity between the candidate's skills and the required skills. This ensures that synonymous skills (e.g., "React.js" and "React") are successfully matched.

### Step 3: Skill Gap Computation (`skill_matcher.py`)
- The system categorizes skills into `matched_required`, `missing_required`, and `matched_good_to_have`.
- A global **Readiness Score** is calculated based on the percentage of required skills the candidate possesses.

### Step 4: Question Generation (`question_generator.py`)
- Based on the candidate's extracted profile (especially their projects and experience) and their specific skill gaps, the LLM generates three categories of questions:
  - **Technical**: Assessing core competencies.
  - **Project-Based**: Asking the candidate to explain specific projects found on their resume.
  - **Scenario/Behavioral**: Situational questions (often targeting missing skills to see how the candidate approaches unknown problems).

### Step 5: Question Ranking (`question_ranker.py`)
- The generated questions are passed through a `cross-encoder` model (`cross-encoder/ms-marco-MiniLM-L-6-v2`).
- This scores the relevance of each question against the specific target role, ensuring only the highest-quality, most relevant questions are presented to the user.

### Step 6: Course Recommendation (`course_recommender.py`)
- For every required skill that is missing (`missing_required`), the system fetches relevant online courses (with titles, URLs, and platforms) to help the user close their gap.

---

## 3. Backend API & Routing (FastAPI)
The backend is structured into modular routers under `backend/app/`.

### `auth/`
- Handles user registration, login, and token generation via Supabase Auth.
- Issues JWT tokens used to authenticate all subsequent requests.

### `analysis/`
- **`POST /analysis/upload`**: The main entry point. Receives the PDF and target role. Orchestrates the entire ML pipeline described above, saves the structured results (Profile, Skills, Questions, Courses) to Supabase, and automatically triggers roadmap generation.
- **`GET /analysis/{id}`**: Retrieves the full details of a specific analysis session.
- **`GET /analysis/history`**: Returns a lightweight list of all past analyses for the logged-in user.

### `roadmap/`
- Automatically breaks down the user's skill gaps and recommended courses into a structured, chronologically ordered timeline (Milestones). 

### `progress/`
- Allows users to mark specific roadmap milestones, skills, or courses as "Completed" or "In Progress", storing state in Supabase to track their journey over time.

### `export/`
- **`GET /export/pdf/{id}`**: Uses the `reportlab` library to dynamically generate a multi-page, beautifully formatted PDF report of the analysis, including clickable links to recommended courses.

---

## 4. Frontend Architecture (Next.js)
The frontend uses the modern Next.js App Router (`src/app/`) to provide a fast, responsive Single Page Application (SPA) feel.

### Key Workflows & Pages
1. **Authentication (`/login`, `/signup`)**
   - Users authenticate. The JWT token is saved and automatically attached to all API requests via an Axios interceptor (`src/lib/api.ts`).

2. **Dashboard (`/` - `src/app/page.tsx`)**
   - Upon login, the Dashboard automatically fetches the most recent analysis from `/analysis/history`.
   - It displays a "Welcome Back" banner along with the **complete, full details** of their latest run—including the Readiness Score gauge, Profile Extracted, Skill Gap visualizations, Accordion-style Interview Prep questions, and Course Recommendations.
   - It includes direct buttons for **Download PDF** and **Power BI Dashboard**.

3. **New Analysis (`/analysis` - `src/app/analysis/page.tsx`)**
   - A drag-and-drop interface for uploading the PDF resume.
   - Users can choose a predefined role or paste a **Custom Job Description**. If a custom JD is pasted, they provide the specific **Job Title**, which is sent to the backend.
   - Upon successful upload and analysis, it instantly redirects the user back to the Dashboard (`/`) to view the newly generated results.

4. **History (`/history` - `src/app/history/page.tsx`)**
   - A chronological list of all past assessment sessions. Users can click into any past session to view its historical details.

5. **Power BI Dashboard (`/analysis/[id]/powerbi`)**
   - An immersive, dark-themed, full-screen analytics dashboard built using `recharts`.
   - It renders 10+ visual components (Radar charts, Donut charts, Bar graphs, and KPI cards) to provide deep insights into skill coverage, interview question distribution, and roadmap tracking.
   - Includes a **Download Dataset** feature to export raw JSON data for import into actual Microsoft Power BI Desktop.

---

## 5. Database Schema (Supabase)
Key tables linking the system together:
- **`users`**: Extended user profiles linked to Supabase Auth.
- **`assessments`**: Stores the high-level analysis run (target role, readiness score, parsed profile JSON).
- **`assessment_skills`**: Links to `assessments`. Stores individual skills, whether they are required, and their status (`present` or `missing`).
- **`assessment_questions`**: Stores the AI-generated questions, suggested answers, key points, and relevance scores.
- **`assessment_courses`**: Stores the recommended courses for skill gaps.
- **`roadmaps` & `roadmap_milestones`**: Stores the generated step-by-step learning path.
