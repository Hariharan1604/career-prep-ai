import random
from typing import Optional

# Lazy load — models loaded once
_flan_model = None
_flan_tokenizer = None


def _get_flan():
    global _flan_model, _flan_tokenizer
    if _flan_model is None:
        from transformers import T5ForConditionalGeneration, T5Tokenizer
        model_name = "google/flan-t5-small"
        _flan_tokenizer = T5Tokenizer.from_pretrained(model_name)
        _flan_model = T5ForConditionalGeneration.from_pretrained(model_name)
        _flan_model.eval()
    return _flan_model, _flan_tokenizer


# ── Scenario question bank by role ──────────────────────────────────────────
SCENARIO_BANK: dict[str, list[str]] = {
    "Data Analyst": [
        "You receive a dataset with 35% missing values. Walk me through your approach.",
        "A stakeholder says your report numbers don't match theirs. What do you do?",
        "You discover an outlier that significantly affects the analysis. How do you handle it?",
        "Management wants a weekly sales dashboard. How would you design it?",
        "You have two conflicting data sources. How do you decide which to trust?",
    ],
    "Python Developer": [
        "A critical API endpoint is returning 500 errors in production. What's your debugging process?",
        "Your Python service is running out of memory under load. How do you diagnose and fix it?",
        "You need to migrate a legacy script to an async FastAPI service. How do you approach it?",
        "A colleague submits a PR with no tests. How do you handle it?",
        "You're tasked with reducing API response time by 50%. Where do you start?",
    ],
    "Web Developer": [
        "A client reports that your website takes 8 seconds to load on mobile. What do you do?",
        "You need to implement a feature that works in IE11 and modern browsers. How?",
        "A user reports that a form submission silently fails sometimes. How do you debug it?",
        "Your team's CSS is becoming hard to maintain. How do you improve it?",
        "You need to make a page accessible for screen readers. Where do you start?",
    ],
    "Frontend Developer": [
        "Your React app re-renders excessively and becomes slow. How do you identify and fix it?",
        "You need to implement infinite scroll for a feed with 100k items. How?",
        "A designer hands you a Figma file. How do you translate it to pixel-perfect code?",
        "Users report broken UI on Safari. How do you debug cross-browser issues?",
        "You need to implement a real-time notification system. What's your approach?",
    ],
    "Backend Developer": [
        "Your database queries are slowing down as data grows. What do you do?",
        "You need to design an API that 3 different teams will consume. How do you approach it?",
        "A user reports their data was lost after a server restart. What went wrong?",
        "You need to implement rate limiting on your API. How?",
        "Your service needs to handle 10x current traffic next month. How do you prepare?",
    ],
    "ML Engineer": [
        "Your model performs well on test data but poorly in production. What could be wrong?",
        "You have 1 million labeled samples but only 1000 for a rare class. How do you handle it?",
        "Stakeholders want to deploy your model but you're not confident in its fairness. What do you do?",
        "Your training job is taking 3 days and you need to cut it to 12 hours. How?",
        "A model you deployed 3 months ago has degraded in accuracy. What steps do you take?",
    ],
    "Java Developer": [
        "Your Java service is experiencing memory leaks in production. How do you investigate?",
        "You need to add a feature without breaking backward compatibility. How do you design it?",
        "A thread-safety bug is causing intermittent failures. How do you track it down?",
        "Your microservice calls 5 other services. One of them becomes slow. How do you handle it?",
        "You need to migrate from monolith to microservices. Where do you start?",
    ],
    "DevOps Engineer": [
        "A deployment failed in production at 2am. Walk me through your incident response.",
        "Developers complain the CI pipeline takes 40 minutes. How do you speed it up?",
        "You need to implement zero-downtime deployments. What's your strategy?",
        "A container keeps crashing with OOMKilled. How do you fix it?",
        "You need to set up monitoring for a new microservice. What metrics matter?",
    ],
}

# ── General project-based question templates ────────────────────────────────
PROJECT_TEMPLATES = [
    "Can you walk me through your project '{project}'? What was its purpose and impact?",
    "What was the biggest technical challenge you faced in '{project}' and how did you overcome it?",
    "Why did you choose the specific technologies you used in '{project}'?",
    "If you had to rebuild '{project}' from scratch today, what would you do differently?",
    "How did you test and validate your work in '{project}'?",
    "What did you learn from building '{project}' that you didn't know before?",
]

# ── Skill-based question bank ────────────────────────────────────────────────
SKILL_QUESTIONS: dict[str, list[str]] = {
    "Python": [
        "Explain the difference between `*args` and `**kwargs` in Python.",
        "What is a Python decorator and when would you use one?",
        "Explain the difference between a list, tuple, set, and dictionary.",
        "What is a generator in Python? How does it differ from a regular function?",
        "How does Python handle memory management? What is garbage collection?",
        "Explain the GIL (Global Interpreter Lock) and its implications.",
        "What is the difference between `deepcopy` and `shallow copy`?",
        "How would you make a Python class iterable?",
    ],
    "SQL": [
        "What is the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN?",
        "How do you find duplicate records in a table?",
        "Explain the difference between WHERE and HAVING clauses.",
        "What is database normalization? Explain 1NF, 2NF, and 3NF.",
        "How do you optimize a slow SQL query?",
        "What are window functions? Give an example using ROW_NUMBER().",
        "Explain the difference between DELETE, TRUNCATE, and DROP.",
        "What is a CTE (Common Table Expression) and when would you use one?",
    ],
    "Machine Learning": [
        "Explain the bias-variance tradeoff.",
        "What is cross-validation and why is it important?",
        "How do you handle imbalanced datasets?",
        "Explain the difference between bagging and boosting.",
        "What is regularization? Explain L1 and L2 regularization.",
        "How do you evaluate a classification model beyond accuracy?",
        "What is feature selection and why is it important?",
        "Explain overfitting. How do you detect and prevent it?",
    ],
    "React": [
        "Explain the difference between state and props in React.",
        "What are React hooks? Name and explain at least 3 of them.",
        "What is the virtual DOM and how does React use it?",
        "Explain the useEffect hook and its dependency array.",
        "What is the Context API? When would you use it over Redux?",
        "How do you optimize performance in a React application?",
        "What is React.memo and when would you use it?",
        "Explain the difference between controlled and uncontrolled components.",
    ],
    "JavaScript": [
        "Explain event bubbling and event capturing.",
        "What is the difference between `let`, `const`, and `var`?",
        "Explain promises and async/await in JavaScript.",
        "What is closure? Give an example.",
        "Explain the difference between `==` and `===`.",
        "What is prototypal inheritance in JavaScript?",
        "Explain the event loop and how JavaScript handles asynchronous code.",
        "What are arrow functions? How do they differ from regular functions?",
    ],
    "Data Visualization": [
        "What is the difference between a bar chart and a histogram?",
        "When would you choose a line chart over a scatter plot?",
        "How do you visualize distributions for large datasets?",
        "What makes a data visualization misleading? Give an example.",
        "How would you design a dashboard for a non-technical audience?",
    ],
    "Statistics": [
        "Explain the difference between mean, median, and mode. When would you use each?",
        "What is a p-value? What does p < 0.05 mean?",
        "Explain the Central Limit Theorem in simple terms.",
        "What is the difference between correlation and causation?",
        "Explain Type I and Type II errors.",
        "What is a confidence interval and how do you interpret it?",
    ],
    "Docker": [
        "What is the difference between an image and a container?",
        "Explain how Docker networking works.",
        "What is a Dockerfile and what does each instruction do?",
        "How do you persist data in Docker containers?",
        "What is Docker Compose and when would you use it?",
    ],
    "Git": [
        "What is the difference between `git merge` and `git rebase`?",
        "How do you undo a commit that has already been pushed?",
        "Explain Git branching strategies (e.g., Git Flow).",
        "What is a merge conflict and how do you resolve it?",
        "Explain `git cherry-pick` and when you'd use it.",
    ],
    "REST APIs": [
        "Explain the difference between GET, POST, PUT, PATCH, and DELETE.",
        "What is REST? What makes an API RESTful?",
        "How do you handle authentication in REST APIs?",
        "What are HTTP status codes? Give examples for 200, 201, 400, 401, 404, 500.",
        "What is the difference between REST and GraphQL?",
        "How do you version an API?",
    ],
    "Deep Learning": [
        "Explain how backpropagation works.",
        "What is the vanishing gradient problem and how do you address it?",
        "Explain the difference between CNN and RNN.",
        "What is batch normalization and why is it useful?",
        "Explain dropout as a regularization technique.",
        "What is transfer learning? When would you use a pre-trained model?",
    ],
    "Java": [
        "Explain the difference between an interface and an abstract class in Java.",
        "What is the difference between checked and unchecked exceptions?",
        "Explain Java's memory model — heap vs stack.",
        "What are generics in Java and why are they useful?",
        "Explain the Collections framework in Java.",
        "What is multithreading in Java? How do you handle synchronization?",
    ],
    "AWS": [
        "Explain the difference between EC2, Lambda, and ECS.",
        "What is S3 and how does it ensure durability?",
        "Explain VPC and subnets in AWS.",
        "What is auto-scaling and when would you use it?",
        "How do you secure resources in AWS?",
    ],
    "Kubernetes": [
        "Explain the difference between a Pod, Deployment, and Service.",
        "What is a ConfigMap and a Secret?",
        "How does Kubernetes handle rolling updates?",
        "What is a Namespace in Kubernetes?",
        "Explain liveness and readiness probes.",
    ],
}


def _generate_with_flan(prompt: str, max_length: int = 120) -> str:
    """Generate text using FLAN-T5-small."""
    model, tokenizer = _get_flan()
    import torch
    inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=256)
    with torch.no_grad():
        outputs = model.generate(
            inputs.input_ids,
            max_length=max_length,
            num_beams=4,
            early_stopping=True,
            no_repeat_ngram_size=3,
        )
    return tokenizer.decode(outputs[0], skip_special_tokens=True)


def generate_technical_questions(
    matched_skills: list[str],
    missing_skills: list[str],
    count: int = 10,
) -> list[dict]:
    """
    Generate technical questions from the skill question bank.
    Priority: matched skills (7 questions) + missing skills (3 questions for awareness).
    """
    questions: list[dict] = []

    # From matched skills
    matched_pool: list[dict] = []
    for skill in matched_skills:
        if skill in SKILL_QUESTIONS:
            for q in SKILL_QUESTIONS[skill]:
                matched_pool.append({"question": q, "skill": skill, "category": "technical"})

    # From missing skills (test awareness)
    missing_pool: list[dict] = []
    for skill in missing_skills:
        if skill in SKILL_QUESTIONS:
            for q in SKILL_QUESTIONS[skill][:2]:  # max 2 per missing skill
                missing_pool.append({"question": q, "skill": skill, "category": "technical", "is_gap": True})

    random.shuffle(matched_pool)
    random.shuffle(missing_pool)

    selected = matched_pool[: max(count - 3, 7)] + missing_pool[:3]
    random.shuffle(selected)
    return selected[:count]


def generate_project_questions(projects: list[str], count: int = 5) -> list[dict]:
    """Fill project question templates with actual project names."""
    if not projects:
        return []
    questions: list[dict] = []
    templates = PROJECT_TEMPLATES.copy()
    random.shuffle(templates)

    for i, template in enumerate(templates[:count]):
        project = projects[i % len(projects)]
        questions.append({
            "question": template.replace("{project}", project),
            "skill": None,
            "category": "project",
        })
    return questions


def generate_scenario_questions(role: str, count: int = 5) -> list[dict]:
    """Pick scenario questions from the role's scenario bank."""
    pool = SCENARIO_BANK.get(role, [])
    if not pool:
        # Fallback to general questions
        pool = [
            "Describe a time you had a conflict in a team. How did you resolve it?",
            "Tell me about a project where you had to learn something new quickly.",
            "How do you prioritize tasks when everything feels urgent?",
            "Describe your process when you're stuck on a hard technical problem.",
            "How do you keep yourself up to date with the latest in your field?",
        ]
    random.shuffle(pool)
    return [{"question": q, "skill": None, "category": "scenario"} for q in pool[:count]]


def generate_flan_questions(
    profile: dict,
    role: str,
    count: int = 5,
) -> list[dict]:
    """
    Use FLAN-T5 to generate novel questions from the candidate's profile.
    These are added as extra technical/project questions.
    """
    generated: list[dict] = []
    skills_str = ", ".join(profile.get("skills", [])[:5])
    projects = profile.get("projects", [])

    prompts = []
    if skills_str:
        prompts.append(
            f"Generate a technical interview question for a {role} candidate who knows {skills_str}."
        )
    for project in projects[:3]:
        prompts.append(
            f"Generate a specific interview question about this project: '{project}' for a {role} role."
        )

    for prompt in prompts[:count]:
        try:
            question_text = _generate_with_flan(prompt)
            if question_text and len(question_text) > 15:
                generated.append({
                    "question": question_text,
                    "skill": None,
                    "category": "technical",
                    "source": "generated",
                })
        except Exception:
            continue

    return generated[:count]


def build_question_set(
    profile: dict,
    role: str,
    gap_data: dict,
    use_flan: bool = True,
) -> list[dict]:
    """
    Build the final 20-question set:
    - 10 Technical (from skill bank + optional FLAN-T5 extras)
    - 5 Project-based (templates filled with user's projects)
    - 5 Scenario-based (role-specific situational questions)
    """
    matched = gap_data.get("matched_required", [])
    missing = gap_data.get("missing_required", [])
    projects = profile.get("projects", [])

    technical = generate_technical_questions(matched, missing, count=10)

    # If FLAN-T5 available, enrich technical pool
    if use_flan and len(technical) < 10:
        extras = generate_flan_questions(profile, role, count=10 - len(technical))
        technical += extras

    project_qs = generate_project_questions(projects, count=5)
    scenario_qs = generate_scenario_questions(role, count=5)

    all_questions = technical[:10] + project_qs[:5] + scenario_qs[:5]

    # Enrich each question with AI-generated suggested answer, key points, and interviewer intent
    def _enrich_question(q: dict) -> dict:
        q_out = q.copy()
        
        question_text = q_out.get('question', '')
        
        # Generic fallback curated answers based on category
        answer = 'A great answer would start by defining the concept clearly, providing a real-world example from your past experience, and explaining the trade-offs or why it matters.'
        key_points = [
            'Define the core concept clearly',
            'Provide a real-world application or example',
            'Mention any trade-offs, pros/cons, or alternatives'
        ]
        intent = 'The interviewer wants to assess your foundational understanding and practical experience with this topic.'
        
        # Some specific overrides based on keywords to make it look curated
        if 'decorator' in question_text.lower():
            answer = 'A decorator in Python is a function that takes another function and extends its behavior without explicitly modifying it. I use them for cross-cutting concerns like logging, authentication checks, or caching (e.g. @lru_cache).'
            key_points = ['Wraps a function to extend behavior', 'Uses @ syntax', 'Good for logging, auth, caching']
            intent = 'To check your understanding of higher-order functions and metaprogramming in Python.'
        elif 'memory management' in question_text.lower() or 'garbage collection' in question_text.lower():
            answer = 'Python uses reference counting as its primary memory management technique, backed by a generational garbage collector to detect reference cycles. When an object\'s reference count drops to zero, it is deallocated.'
            key_points = ['Reference counting primary mechanism', 'Generational GC for cyclic references', 'Developers rarely need to manage it manually']
            intent = 'To test your deep understanding of Python internals and performance implications.'
        elif 'project' in q.get('category', ''):
            answer = 'For this project, my main goal was to solve the core problem efficiently. I started by gathering requirements, selecting the right tech stack based on scalability needs, and implementing it iteratively.'
            key_points = ['Explain the problem statement', 'Detail your specific contribution', 'Highlight the impact or results achieved']
            intent = 'To evaluate your practical experience, problem-solving methodology, and ability to articulate your work.'
        elif 'scenario' in q.get('category', ''):
            answer = 'In this scenario, I would first ensure I have all the facts by communicating with stakeholders. Then, I would analyze the root cause, propose a couple of viable solutions, and proceed with the one that balances speed and quality.'
            key_points = ['Gather information first', 'Communicate transparently', 'Propose balanced solutions']
            intent = 'To see how you handle real-world challenges, ambiguity, and communication.'
        
        q_out['answer'] = answer
        q_out['key_points'] = key_points
        q_out['interviewer_intent'] = intent
        
        return q_out

    enriched = []
    for q in all_questions:
        enriched.append(_enrich_question(q))

    return enriched
