"""
Full End-to-End Test Script for Career Prep AI
Tests every backend API endpoint that the frontend calls.
"""
import sys
import os
os.environ['PYTHONIOENCODING'] = 'utf-8'
import json
import time
import urllib.request
import urllib.error
import uuid

BASE = "http://localhost:8000/api"
PASS_EMOJI = "[PASS]"
FAIL_EMOJI = "[FAIL]"
results = []

def log(test_name, passed, detail=""):
    status = PASS_EMOJI if passed else FAIL_EMOJI
    results.append((test_name, passed, detail))
    print(f"  {status}  {test_name}" + (f"  ->  {detail}" if detail else ""))


def api_call(method, path, data=None, token=None, content_type="application/json"):
    url = BASE + path
    if data and content_type == "application/json":
        body = json.dumps(data).encode("utf-8")
    elif data:
        body = data
    else:
        body = None

    req = urllib.request.Request(url, data=body, method=method)
    if content_type:
        req.add_header("Content-Type", content_type)
    if token:
        req.add_header("Authorization", f"Bearer {token}")

    try:
        resp = urllib.request.urlopen(req)
        return resp.getcode(), json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        try:
            body_text = e.read().decode("utf-8")
            detail = json.loads(body_text) if body_text else {}
        except:
            detail = body_text if body_text else str(e)
        return e.code, detail


# ============================================================
print("=" * 60)
print("  CAREER PREP AI - FULL END-TO-END TEST")
print("=" * 60)

# ── 1. Health Check ──────────────────────────────────────────
print("\n--- 1. Backend Health Check ---")
try:
    code, body = api_call("GET", "/")
    log("Root endpoint reachable", code == 200, f"status={code}")
except Exception as e:
    log("Root endpoint reachable", False, str(e))

# ── 2. Auth: Signup ──────────────────────────────────────────
print("\n--- 2. Auth: Signup ---")
test_email = f"fulltest_{uuid.uuid4().hex[:8]}@example.com"
code, body = api_call("POST", "/auth/signup", {
    "email": test_email,
    "password": "password123",
    "full_name": "Hariharan Sankar"
})
log("Signup returns 200", code == 200, f"status={code}")
token = body.get("access_token", "") if isinstance(body, dict) else ""
log("Signup returns access_token", bool(token), f"token_len={len(token)}")
user_id = body.get("user", {}).get("id", "") if isinstance(body, dict) else ""
log("Signup returns user object", bool(user_id), f"user_id={user_id[:20]}...")

# ── 3. Auth: Login ───────────────────────────────────────────
print("\n--- 3. Auth: Login ---")
code, body = api_call("POST", "/auth/login", {
    "email": test_email,
    "password": "password123"
})
log("Login returns 200", code == 200, f"status={code}")
login_token = body.get("access_token", "") if isinstance(body, dict) else ""
log("Login returns access_token", bool(login_token))

# ── 4. Auth: /me ─────────────────────────────────────────────
print("\n--- 4. Auth: Get Current User (/me) ---")
code, body = api_call("GET", "/auth/me", token=token)
log("/me returns 200", code == 200, f"status={code}")
if isinstance(body, dict):
    log("/me returns full_name", body.get("full_name") == "Hariharan Sankar", f"name={body.get('full_name')}")
    log("/me returns email", body.get("email") == test_email)

# ── 5. Auth: Unauthorized access ─────────────────────────────
print("\n--- 5. Auth: Unauthorized Access ---")
code, body = api_call("GET", "/auth/me")
log("No token -> 403", code == 403, f"status={code}")

# ── 6. Roles endpoint ───────────────────────────────────────
print("\n--- 6. Analysis: Get Supported Roles ---")
code, body = api_call("GET", "/analysis/roles", token=token)
log("Roles returns 200", code == 200, f"status={code}")
log("Roles returns list", isinstance(body, list), f"roles={body}")
expected_roles = ["Data Analyst", "Python Developer", "Web Developer", "Frontend Developer", 
                  "Backend Developer", "ML Engineer", "Java Developer", "DevOps Engineer"]
log("All 8 roles present", body == expected_roles if isinstance(body, list) else False)

# ── 7. Analysis: Upload Resume ───────────────────────────────
print("\n--- 7. Analysis: Upload Resume (ML Engineer) ---")
print("    (This runs the full ML pipeline - may take ~10s)")

boundary = uuid.uuid4().hex
with open("resume.pdf", "rb") as f:
    file_content = f.read()

multipart_body = b""
multipart_body += f"--{boundary}\r\n".encode()
multipart_body += b'Content-Disposition: form-data; name="target_role"\r\n\r\n'
multipart_body += b"ML Engineer\r\n"
multipart_body += f"--{boundary}\r\n".encode()
multipart_body += b'Content-Disposition: form-data; name="file"; filename="HARIHARAN_RESUME.pdf"\r\n'
multipart_body += b"Content-Type: application/pdf\r\n\r\n"
multipart_body += file_content
multipart_body += b"\r\n"
multipart_body += f"--{boundary}--\r\n".encode()

start = time.time()
code, body = api_call(
    "POST", "/analysis/upload",
    data=multipart_body,
    token=token,
    content_type=f"multipart/form-data; boundary={boundary}"
)
elapsed = time.time() - start
log("Upload returns 200", code == 200, f"status={code}, took {elapsed:.1f}s")

if code == 200 and isinstance(body, dict):
    assessment_id = body.get("id", "")
    log("Returns assessment ID", bool(assessment_id), f"id={assessment_id[:20]}...")
    
    score = body.get("readiness_score")
    log("Returns readiness_score", score is not None, f"score={score}")
    
    profile = body.get("profile", {})
    log("Returns parsed profile.name", profile.get("name") == "HARIHARAN SANKAR", f"name={profile.get('name')}")
    log("Returns profile.education", len(profile.get("education", [])) > 0, f"count={len(profile.get('education', []))}")
    log("Returns profile.skills", len(profile.get("skills", [])) > 0, f"skills={profile.get('skills', [])}")
    log("Returns profile.projects", len(profile.get("projects", [])) > 0, f"count={len(profile.get('projects', []))}")
    
    skills = body.get("skills", [])
    matched = [s for s in skills if s["status"] == "present"]
    missing = [s for s in skills if s["status"] == "missing"]
    log("Returns skills breakdown", len(skills) > 0, f"matched={len(matched)}, missing={len(missing)}")
    
    questions = body.get("questions", [])
    log("Returns interview questions", len(questions) > 0, f"count={len(questions)}")
    categories = set(q.get("category") for q in questions)
    log("Questions have multiple categories", len(categories) > 1, f"categories={categories}")
    
    courses = body.get("courses", {})
    log("Returns course recommendations", len(courses) > 0, f"skills_covered={list(courses.keys())}")
    
    roadmap = body.get("roadmap_generated")
    log("Roadmap auto-generated", roadmap == True)
else:
    assessment_id = ""
    log("ANALYSIS FAILED - cannot continue", False, f"response={body}")

# ── 8. Analysis: Get Assessment by ID ────────────────────────
print("\n--- 8. Analysis: Get Assessment by ID ---")
if assessment_id:
    code, body = api_call("GET", f"/analysis/{assessment_id}", token=token)
    log("Get assessment returns 200", code == 200, f"status={code}")
    if isinstance(body, dict):
        log("Assessment has skills", len(body.get("skills", [])) > 0)
        log("Assessment has questions", len(body.get("questions", [])) > 0)
        log("Assessment has courses", len(body.get("courses", {})) > 0)

# ── 9. Analysis: History ─────────────────────────────────────
print("\n--- 9. Analysis: History ---")
code, body = api_call("GET", "/analysis/history", token=token)
log("History returns 200", code == 200, f"status={code}")
log("History has entries", isinstance(body, list) and len(body) > 0, f"count={len(body) if isinstance(body, list) else 0}")
if isinstance(body, list) and len(body) > 0:
    entry = body[0]
    log("History entry has readiness_score", "readiness_score" in entry)
    log("History entry has skills_matched", "skills_matched" in entry)
    log("History entry has skills_missing", "skills_missing" in entry)

# ── 10. Roadmap ──────────────────────────────────────────────
print("\n--- 10. Roadmap ---")
code, body = api_call("GET", "/roadmap", token=token)
log("Roadmap returns 200", code == 200, f"status={code}")
if isinstance(body, list):
    log("Roadmap has milestones", len(body) > 0, f"count={len(body)}")
    if body:
        m = body[0]
        log("Milestone has title", "milestone_title" in m, f"title={m.get('milestone_title', '')[:40]}")
        log("Milestone has target_date", "target_date" in m)
        log("Milestone has status", "status" in m, f"status={m.get('status')}")

# ── 11. Progress ─────────────────────────────────────────────
print("\n--- 11. Progress ---")
code, body = api_call("GET", "/progress/summary", token=token)
log("Progress returns 200", code == 200, f"status={code}")

# ── 12. Export ───────────────────────────────────────────────
print("\n--- 12. Export ---")
if assessment_id:
    export_url = BASE + f"/export/pdf/{assessment_id}"
    req = urllib.request.Request(export_url)
    req.add_header("Authorization", f"Bearer {token}")
    try:
        resp = urllib.request.urlopen(req)
        content_type = resp.headers.get("Content-Type", "")
        pdf_bytes = resp.read()
        log("Export PDF returns 200", resp.getcode() == 200)
        log("Export returns PDF content-type", "pdf" in content_type.lower(), f"ct={content_type}")
        log("Export PDF has content", len(pdf_bytes) > 100, f"size={len(pdf_bytes)} bytes")
    except urllib.error.HTTPError as e:
        log("Export PDF endpoint", False, f"status={e.code}, {e.read().decode('utf-8')[:100]}")

# ── 13. Frontend Serving ─────────────────────────────────────
print("\n--- 13. Frontend Serving ---")
try:
    req = urllib.request.Request("http://localhost:5173")
    resp = urllib.request.urlopen(req, timeout=5)
    html = resp.read().decode("utf-8")
    log("Frontend serves HTML", resp.getcode() == 200 and "<html" in html.lower())
    has_root = 'id="root"' in html
    log("HTML references React app", "root" in html, f"has_root_div={has_root}")
except Exception as e:
    log("Frontend serves HTML", False, str(e))


# ═══════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════
print("\n" + "=" * 60)
passed = sum(1 for _, p, _ in results if p)
failed = sum(1 for _, p, _ in results if not p)
total = len(results)
print(f"  RESULTS: {passed}/{total} passed, {failed} failed")

if failed > 0:
    print("\n  FAILURES:")
    for name, p, detail in results:
        if not p:
            print(f"    {FAIL_EMOJI}  {name}: {detail}")

print("=" * 60)
sys.exit(0 if failed == 0 else 1)
