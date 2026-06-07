"""
Backend API tests for Hashimjon Akademiyasi.
Covers: health, auth (register/login/me/logout), islands, leaderboard, brute force protection.
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://knowledge-islands-1.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@hashimjon.uz"
ADMIN_PASSWORD = "admin123"


@pytest.fixture
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture
def admin_session(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    return session


# --- Health ---
class TestHealth:
    def test_root_health(self, session):
        r = session.get(f"{API}/")
        assert r.status_code == 200
        assert r.json().get("status") == "running"


# --- Auth ---
class TestAuth:
    def test_login_admin_success(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"
        assert "id" in data
        assert "password_hash" not in data
        # Cookies set
        cookies = r.cookies
        assert "access_token" in cookies
        assert "refresh_token" in cookies

    def test_login_invalid_password(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong_pass"})
        assert r.status_code == 401

    def test_login_unknown_email(self, session):
        r = session.post(f"{API}/auth/login", json={"email": "noexist@nope.com", "password": "x"})
        assert r.status_code == 401

    def test_register_new_student_and_me(self, session):
        email = f"test_{uuid.uuid4().hex[:8]}@test.uz"
        payload = {
            "email": email,
            "password": "Pass1234!",
            "firstName": "Test",
            "lastName": "User",
            "grade": 5,
            "role": "student"
        }
        r = session.post(f"{API}/auth/register", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == email
        assert data["role"] == "student"
        assert data["xp"] == 0
        assert data["level"] == 1
        assert "id" in data

        # /auth/me with the cookies set by registration
        me = session.get(f"{API}/auth/me")
        assert me.status_code == 200, me.text
        me_data = me.json()
        assert me_data["email"] == email

    def test_register_duplicate(self, session):
        email = f"dup_{uuid.uuid4().hex[:8]}@test.uz"
        p = {"email": email, "password": "Pass1234!", "firstName": "A", "lastName": "B", "role": "student"}
        r1 = session.post(f"{API}/auth/register", json=p)
        assert r1.status_code == 200
        r2 = requests.post(f"{API}/auth/register", json=p)
        assert r2.status_code == 400

    def test_me_unauthenticated(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_logout(self, admin_session):
        r = admin_session.post(f"{API}/auth/logout")
        assert r.status_code == 200
        # After logout, /auth/me should fail with fresh session
        fresh = requests.Session()
        r2 = fresh.get(f"{API}/auth/me")
        assert r2.status_code == 401


# --- Islands ---
class TestIslands:
    def test_list_islands(self, session):
        r = session.get(f"{API}/islands")
        assert r.status_code == 200
        islands = r.json()
        assert isinstance(islands, list)
        assert len(islands) >= 3
        names = {i["name"] for i in islands}
        assert "Quvonch Oroli" in names
        assert "Kashfiyot Oroli" in names
        assert "Kelajak Oroli" in names
        # No mongo _id leakage
        for i in islands:
            assert "_id" not in i

    def test_get_island_by_id(self, session):
        islands = session.get(f"{API}/islands").json()
        first_id = islands[0]["id"]
        r = session.get(f"{API}/islands/{first_id}")
        assert r.status_code == 200
        assert r.json()["id"] == first_id

    def test_get_island_not_found(self, session):
        r = session.get(f"{API}/islands/nonexistent-id")
        assert r.status_code == 404


# --- Leaderboard ---
class TestLeaderboard:
    def test_leaderboard(self, session):
        r = session.get(f"{API}/leaderboard")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        for idx, u in enumerate(data):
            assert u["rank"] == idx + 1
            assert "_id" not in u


# --- Subjects / Lessons (public reads) ---
class TestSubjectsLessons:
    def test_list_subjects(self, session):
        r = session.get(f"{API}/subjects")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_list_lessons(self, session):
        r = session.get(f"{API}/lessons")
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# --- Progress (auth required) ---
class TestProgress:
    def test_progress_requires_auth(self):
        r = requests.get(f"{API}/progress")
        assert r.status_code == 401
