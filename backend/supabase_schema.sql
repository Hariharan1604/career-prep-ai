-- Users table (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    full_name VARCHAR,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Assessments (each time user runs analysis)
CREATE TABLE assessments (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    target_role VARCHAR NOT NULL,
    job_description_text TEXT,
    resume_filename VARCHAR,
    readiness_score FLOAT,
    profile_json JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Skills extracted per assessment
CREATE TABLE assessment_skills (
    id UUID PRIMARY KEY,
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    skill_name VARCHAR NOT NULL,
    status VARCHAR CHECK (status IN ('present', 'missing')),
    is_required BOOLEAN DEFAULT TRUE,
    confidence FLOAT
);

-- Questions generated per assessment
CREATE TABLE assessment_questions (
    id UUID PRIMARY KEY,
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    category VARCHAR CHECK (category IN ('technical', 'project', 'scenario')),
    skill VARCHAR,
    source VARCHAR CHECK (source IN ('retrieved', 'generated')),
    relevance_score FLOAT,
    is_gap BOOLEAN DEFAULT FALSE,
    ai_answer TEXT,
    ai_key_points JSON,
    ai_intent TEXT
);

-- Course recommendations per assessment
CREATE TABLE assessment_courses (
    id UUID PRIMARY KEY,
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    skill_gap VARCHAR NOT NULL,
    course_title VARCHAR,
    platform VARCHAR,
    course_url VARCHAR,
    is_free BOOLEAN DEFAULT FALSE,
    thumbnail VARCHAR
);

-- User's ongoing progress tracking
CREATE TABLE user_progress (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    skill_name VARCHAR NOT NULL,
    status VARCHAR CHECK (status IN ('not_started', 'learning', 'completed')),
    course_url VARCHAR,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Roadmap milestones
CREATE TABLE roadmap (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    milestone_title VARCHAR NOT NULL,
    description TEXT,
    target_date DATE,
    status VARCHAR CHECK (status IN ('pending', 'in_progress', 'completed')),
    order_index INT,
    course_url VARCHAR,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) CONFIGURATION
-- ==========================================
-- Disabling RLS for all tables to allow easy development and testing.
-- If you are moving to production, you should ENABLE RLS and create appropriate policies.

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessments DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_skills DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap DISABLE ROW LEVEL SECURITY;
