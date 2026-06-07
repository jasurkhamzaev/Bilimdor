"""
Iteration 2 backend tests:
- AI endpoints (tutor, homework-helper, generate-quiz)
- Quizzes CRUD + submit (XP award)
- Rewards & Achievements
- Lessons CRUD (teacher/admin)
- Admin users CMS
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@hashimjon.uz"
ADMIN_PASSWORD = "admin123"


@pytest.fixture
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture
def admin_session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.text}"
    return s


@pytest.fixture
def student_session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    email = f"test_stud_{uuid.uuid4().hex[:8]}@test.uz"
    payload = {
        "email": email,
        "password": "Pass1234!",
        "firstName": "Test",
        "lastName": "Stud",
        "grade": 5,
        "role": "student"
    }
    r = s.post(f"{API}/auth/register", json=payload)
    assert r.status_code == 200, r.text
    return s, r.json()


# --- Seeded data sanity ---
class TestSeededData:
    def test_islands_count(self, session):
        r = session.get(f"{API}/islands")
        assert r.status_code == 200
        assert len(r.json()) >= 3

    def test_subjects_count(self, session):
        r = session.get(f"{API}/subjects")
        assert r.status_code == 200
        # spec says 8 subjects
        assert len(r.json()) >= 8

    def test_lessons_count(self, session):
        r = session.get(f"{API}/lessons")
        assert r.status_code == 200
        assert len(r.json()) >= 2

    def test_quizzes_seeded(self, session):
        r = session.get(f"{API}/quizzes")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert "questions" in data[0]
        assert len(data[0]["questions"]) > 0

    def test_rewards_count(self, session):
        r = session.get(f"{API}/rewards")
        assert r.status_code == 200
        assert len(r.json()) >= 6

    def test_achievements_count(self, session):
        r = session.get(f"{API}/achievements")
        assert r.status_code == 200
        assert len(r.json()) >= 6


# --- AI endpoints ---
class TestAIEndpoints:
    def test_ai_tutor_uzbek(self, admin_session):
        payload = {"message": "Salom! 2+2 nechiga teng?"}
        r = admin_session.post(f"{API}/ai/tutor", json=payload, timeout=90)
        assert r.status_code == 200, f"AI tutor failed: {r.status_code} {r.text}"
        data = r.json()
        assert "sessionId" in data
        assert "response" in data
        assert isinstance(data["response"], str)
        assert len(data["response"]) > 0

    def test_ai_tutor_requires_auth(self, session):
        r = session.post(f"{API}/ai/tutor", json={"message": "hi"})
        assert r.status_code == 401

    def test_ai_homework_helper(self, admin_session):
        payload = {"question": "5 + 3 nechiga teng?", "subject": "matematika", "grade": 2}
        r = admin_session.post(f"{API}/ai/homework-helper", json=payload, timeout=90)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "response" in data
        assert len(data["response"]) > 0

    def test_ai_generate_quiz_admin(self, admin_session):
        payload = {"topic": "Qo'shish amali", "grade": 2, "numQuestions": 3, "language": "uz"}
        r = admin_session.post(f"{API}/ai/generate-quiz", json=payload, timeout=120)
        assert r.status_code == 200, f"Quiz gen failed: {r.text}"
        data = r.json()
        assert "questions" in data
        assert isinstance(data["questions"], list)
        assert len(data["questions"]) >= 1
        q = data["questions"][0]
        assert "question" in q
        assert "options" in q
        assert "correctAnswer" in q

    def test_ai_generate_quiz_student_forbidden(self, student_session):
        s, _user = student_session
        payload = {"topic": "Math", "grade": 5, "numQuestions": 3}
        r = s.post(f"{API}/ai/generate-quiz", json=payload, timeout=30)
        assert r.status_code == 403


# --- Quizzes ---
class TestQuizzes:
    def test_quiz_submission_passes_awards_xp(self, student_session):
        s, user = student_session
        # Get seeded quiz
        quizzes = s.get(f"{API}/quizzes").json()
        assert len(quizzes) >= 1
        quiz = quizzes[0]
        # All correct answers
        correct_answers = [q["correctAnswer"] for q in quiz["questions"]]
        # Check initial xp
        me = s.get(f"{API}/auth/me").json()
        before_xp = me.get("xp", 0)

        r = s.post(f"{API}/quizzes/submit", json={"quizId": quiz["id"], "answers": correct_answers})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["score"] == 100
        assert data["passed"] is True
        assert data["correctCount"] == len(quiz["questions"])

        # Verify XP awarded
        me2 = s.get(f"{API}/auth/me").json()
        assert me2["xp"] > before_xp

    def test_quiz_submission_failing_no_xp(self, student_session):
        s, _ = student_session
        quizzes = s.get(f"{API}/quizzes").json()
        quiz = quizzes[0]
        # All wrong answers (use index 0 if correct != 0, else last)
        wrong = []
        for q in quiz["questions"]:
            wrong.append((q["correctAnswer"] + 1) % len(q["options"]))
        r = s.post(f"{API}/quizzes/submit", json={"quizId": quiz["id"], "answers": wrong})
        assert r.status_code == 200
        data = r.json()
        assert data["passed"] is False

    def test_create_quiz_admin(self, admin_session):
        # Need a lesson id
        lessons = admin_session.get(f"{API}/lessons").json()
        assert len(lessons) >= 1
        payload = {
            "lessonId": lessons[0]["id"],
            "title": "TEST Quiz",
            "titleUz": "TEST Quiz UZ",
            "titleRu": "TEST Quiz RU",
            "questions": [
                {"question": "1+1?", "options": ["1", "2", "3", "4"], "correctAnswer": 1, "explanation": "yes"}
            ],
            "passingScore": 70,
            "xpReward": 10
        }
        r = admin_session.post(f"{API}/quizzes", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["title"] == "TEST Quiz"
        assert "id" in data
        # Verify GET
        g = admin_session.get(f"{API}/quizzes/{data['id']}")
        assert g.status_code == 200
        assert g.json()["title"] == "TEST Quiz"

    def test_create_quiz_student_forbidden(self, student_session):
        s, _ = student_session
        lessons = s.get(f"{API}/lessons").json()
        payload = {
            "lessonId": lessons[0]["id"],
            "title": "x", "titleUz": "x", "titleRu": "x",
            "questions": [{"question": "?", "options": ["a", "b"], "correctAnswer": 0}]
        }
        r = s.post(f"{API}/quizzes", json=payload)
        assert r.status_code == 403


# --- Lessons CRUD ---
class TestLessonsCRUD:
    def test_create_lesson_admin(self, admin_session):
        subjects = admin_session.get(f"{API}/subjects").json()
        assert len(subjects) >= 1
        payload = {
            "title": "TEST Lesson",
            "titleUz": "TEST Dars",
            "titleRu": "TEST Урок",
            "description": "Test description",
            "subjectId": subjects[0]["id"],
            "content": "Test content here",
            "order": 99,
            "xpReward": 25,
            "videoUrl": "https://example.com/video",
            "isPublished": True
        }
        r = admin_session.post(f"{API}/lessons", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["title"] == "TEST Lesson"
        # Verify GET
        g = admin_session.get(f"{API}/lessons/{data['id']}")
        assert g.status_code == 200
        assert g.json()["title"] == "TEST Lesson"

    def test_create_lesson_student_forbidden(self, student_session):
        s, _ = student_session
        subjects = s.get(f"{API}/subjects").json()
        payload = {
            "title": "x", "titleUz": "x", "titleRu": "x",
            "description": "x", "subjectId": subjects[0]["id"],
            "content": "x", "order": 1
        }
        r = s.post(f"{API}/lessons", json=payload)
        assert r.status_code == 403


# --- Admin users ---
class TestAdminUsers:
    def test_admin_list_users(self, admin_session):
        r = admin_session.get(f"{API}/admin/users")
        assert r.status_code == 200, r.text
        users = r.json()
        assert isinstance(users, list)
        assert len(users) >= 1
        # No password_hash leaked
        for u in users:
            assert "password_hash" not in u
            assert "_id" not in u
            assert "id" in u

    def test_admin_list_users_student_forbidden(self, student_session):
        s, _ = student_session
        r = s.get(f"{API}/admin/users")
        assert r.status_code == 403

    def test_admin_delete_user(self, admin_session):
        # Create a user to delete via register
        email = f"test_del_{uuid.uuid4().hex[:8]}@test.uz"
        reg_session = requests.Session()
        reg_session.headers.update({"Content-Type": "application/json"})
        r = reg_session.post(f"{API}/auth/register", json={
            "email": email, "password": "Pass1234!",
            "firstName": "Del", "lastName": "Me", "role": "student"
        })
        assert r.status_code == 200
        user_id = r.json()["id"]

        # Delete via admin
        d = admin_session.delete(f"{API}/admin/users/{user_id}")
        assert d.status_code == 200

        # Verify deleted - login should fail
        bad = requests.post(f"{API}/auth/login", json={"email": email, "password": "Pass1234!"})
        assert bad.status_code == 401


# --- Rewards/Achievements user-specific ---
class TestUserRewardsAchievements:
    def test_user_rewards_requires_auth(self):
        r = requests.get(f"{API}/user-rewards")
        assert r.status_code == 401

    def test_user_achievements_requires_auth(self):
        r = requests.get(f"{API}/user-achievements")
        assert r.status_code == 401

    def test_user_rewards_for_student(self, student_session):
        s, _ = student_session
        r = s.get(f"{API}/user-rewards")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_user_achievements_for_student(self, student_session):
        s, _ = student_session
        r = s.get(f"{API}/user-achievements")
        assert r.status_code == 200
        assert isinstance(r.json(), list)
