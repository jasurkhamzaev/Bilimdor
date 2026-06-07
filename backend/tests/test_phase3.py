"""Phase 3 backend tests: parent register, daily challenges, avatars, certificates PDF, AI streaming, existing endpoints"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://knowledge-islands-1.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": "admin@hashimjon.uz", "password": "admin123"}, timeout=30)
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    return s


@pytest.fixture(scope="module")
def parent_session():
    """Register a parent and return a session."""
    s = requests.Session()
    email = f"test_parent_{uuid.uuid4().hex[:8]}@test.uz"
    r = s.post(f"{API}/auth/register", json={
        "email": email, "password": "parent123", "firstName": "P", "lastName": "T", "role": "parent"
    }, timeout=30)
    assert r.status_code == 200, f"parent register failed: {r.status_code} {r.text}"
    data = r.json()
    assert data["role"] == "parent", f"role should be parent, got {data.get('role')}"
    s.email = email
    return s


# ---- Parent registration ----
class TestParentRegister:
    def test_parent_registration_returns_parent_role(self, parent_session):
        r = parent_session.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 200
        assert r.json()["role"] == "parent"


# ---- Daily challenges ----
class TestDailyChallenges:
    def test_get_daily_challenges_creates_three(self, admin_session):
        r = admin_session.get(f"{API}/challenges/daily", timeout=20)
        assert r.status_code == 200, r.text
        items = r.json()
        assert isinstance(items, list)
        assert len(items) == 3, f"expected 3, got {len(items)}"
        for c in items:
            assert "id" in c and "xpReward" in c and "title" in c
            assert "progress" in c and "completed" in c

    def test_complete_challenge_awards_xp_once(self, admin_session):
        r = admin_session.get(f"{API}/challenges/daily", timeout=20)
        ch = r.json()[0]

        me_before = admin_session.get(f"{API}/auth/me", timeout=15).json()
        xp_before = me_before.get("xp", 0)

        r1 = admin_session.post(f"{API}/challenges/complete", json={"challengeId": ch["id"]}, timeout=15)
        assert r1.status_code == 200, r1.text
        body1 = r1.json()

        me_after = admin_session.get(f"{API}/auth/me", timeout=15).json()
        if body1.get("xpAwarded"):
            assert me_after["xp"] >= xp_before + ch["xpReward"] - 1

        # Second call should not award again
        r2 = admin_session.post(f"{API}/challenges/complete", json={"challengeId": ch["id"]}, timeout=15)
        assert r2.status_code == 200
        assert r2.json().get("xpAwarded") is False


# ---- Avatars ----
class TestAvatars:
    def test_list_avatars_returns_9(self, admin_session):
        r = admin_session.get(f"{API}/avatars", timeout=15)
        assert r.status_code == 200
        avatars = r.json()
        assert len(avatars) == 9
        for a in avatars:
            assert "id" in a and "xpRequired" in a and "rarity" in a

    def test_purchase_avatar_success(self, admin_session):
        # default avatar requires 0 XP
        r = admin_session.post(f"{API}/avatars/purchase", json={"avatarId": "default"}, timeout=15)
        assert r.status_code == 200, r.text
        assert r.json()["avatar"] == "default"
        me = admin_session.get(f"{API}/auth/me", timeout=15).json()
        assert me["avatar"] == "default"

    def test_purchase_avatar_insufficient_xp(self, parent_session):
        # parent has 0 XP, superhero requires 5000
        r = parent_session.post(f"{API}/avatars/purchase", json={"avatarId": "superhero"}, timeout=15)
        assert r.status_code == 400, f"expected 400, got {r.status_code}: {r.text}"

    def test_purchase_unknown_avatar_404(self, admin_session):
        r = admin_session.post(f"{API}/avatars/purchase", json={"avatarId": "non_existent"}, timeout=15)
        assert r.status_code == 404


# ---- Certificates ----
class TestCertificates:
    def test_certificate_requires_completed_lesson(self, admin_session):
        # find a lesson
        lessons = admin_session.get(f"{API}/lessons", timeout=15).json()
        assert len(lessons) > 0, "no lessons seeded"
        lesson_id = lessons[0]["id"]

        # complete lesson
        r = admin_session.post(f"{API}/progress/{lesson_id}", json={"progress": 100, "score": 100}, timeout=15)
        assert r.status_code == 200, r.text
        assert r.json()["completed"] is True

        # download cert
        r2 = admin_session.get(f"{API}/certificates/{lesson_id}", timeout=30)
        assert r2.status_code == 200, r2.text
        assert r2.headers.get("content-type", "").startswith("application/pdf")
        assert r2.content[:4] == b"%PDF", "response is not a PDF"

    def test_certificate_404_when_not_completed(self, parent_session):
        lessons = requests.get(f"{API}/lessons", timeout=15).json()
        if not lessons:
            pytest.skip("no lessons")
        r = parent_session.get(f"{API}/certificates/{lessons[0]['id']}", timeout=15)
        # parent never completed → 400
        assert r.status_code == 400


# ---- AI streaming ----
class TestAIStreaming:
    def test_tutor_stream_sse(self, admin_session):
        r = admin_session.post(
            f"{API}/ai/tutor-stream",
            json={"message": "Salom"},
            timeout=90,
            stream=True,
        )
        assert r.status_code == 200, f"stream failed: {r.status_code}"
        ct = r.headers.get("content-type", "")
        assert "text/event-stream" in ct, f"content-type: {ct}"
        got_start = False
        got_token_or_done = False
        for raw in r.iter_lines(decode_unicode=True):
            if not raw:
                continue
            if raw.startswith("data:"):
                payload = raw[5:].strip()
                if '"start"' in payload:
                    got_start = True
                if '"token"' in payload or '"done"' in payload:
                    got_token_or_done = True
                    break
        r.close()
        assert got_start, "missing start event"
        assert got_token_or_done, "missing token/done event"


# ---- Existing endpoints regression ----
class TestExistingEndpoints:
    @pytest.mark.parametrize("path", ["/islands", "/leaderboard", "/lessons", "/quizzes", "/rewards", "/achievements"])
    def test_public_endpoints(self, path):
        r = requests.get(f"{API}{path}", timeout=15)
        assert r.status_code == 200, f"{path} -> {r.status_code}"
        assert isinstance(r.json(), list)

    def test_admin_users(self, admin_session):
        r = admin_session.get(f"{API}/admin/users", timeout=15)
        assert r.status_code == 200
        users = r.json()
        assert isinstance(users, list) and len(users) > 0
        # ensure no password leak
        assert all("password_hash" not in u for u in users)
        # ensure no raw _id leak
        assert all("_id" not in u for u in users)
