-- Assessment tests (quiz sessions)
CREATE TABLE IF NOT EXISTS assessment_tests (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    total_questions INT,
    correct_answers INT DEFAULT 0,
    score FLOAT DEFAULT 0,
    status VARCHAR CHECK (status IN ('in_progress', 'completed')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Individual answers per test
CREATE TABLE IF NOT EXISTS assessment_test_answers (
    id UUID PRIMARY KEY,
    test_id UUID REFERENCES assessment_tests(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option INT NOT NULL,
    selected_option INT,
    skill_area VARCHAR,
    explanation TEXT,
    is_correct BOOLEAN,
    created_at TIMESTAMP DEFAULT NOW()
);
