from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Header, Query, File, UploadFile, Depends, WebSocket, WebSocketDisconnect
from fastapi.responses import Response as FastAPIResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from bson import ObjectId
import os
import logging
import uuid
import bcrypt
import jwt
import secrets
import requests
from openai import AsyncOpenAI

# Kimi AI Client (OpenAI-compatible)
kimi_client = AsyncOpenAI(
    api_key=os.environ.get("KIMI_API_KEY", ""),
    base_url=os.environ.get("KIMI_BASE_URL", "https://api.moonshot.ai/v1")
)
KIMI_MODEL = os.environ.get("KIMI_MODEL", "kimi-k2-0905-preview")

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Constants
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
APP_NAME = "hashimjon-akademiyasi"
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")

# Global storage key
storage_key = None

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Password hashing utilities
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

# JWT utilities
def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=15),
        "type": "access"
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh"
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

# Storage utilities
def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    try:
        resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
        resp.raise_for_status()
        storage_key = resp.json()["storage_key"]
        return storage_key
    except Exception as e:
        logging.error(f"Storage init failed: {e}")
        raise

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data,
        timeout=120
    )
    resp.raise_for_status()
    return resp.json()

def get_object(path: str) -> tuple[bytes, str]:
    key = init_storage()
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key},
        timeout=60
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# Auth dependency
async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        user["_id"] = str(user["_id"])
        user["id"] = user["_id"]
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Pydantic Models
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    firstName: str
    lastName: str
    phone: Optional[str] = None
    grade: Optional[int] = None
    parentPhone: Optional[str] = None
    role: str = "student"
    avatar: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    firstName: str
    lastName: str
    role: str
    grade: Optional[int] = None
    phone: Optional[str] = None
    parentPhone: Optional[str] = None
    avatar: Optional[str] = None
    xp: int = 0
    level: int = 1
    streak: int = 0
    lastLoginDate: Optional[str] = None
    createdAt: str

class IslandResponse(BaseModel):
    id: str
    name: str
    nameUz: str
    nameRu: str
    description: str
    descriptionUz: str
    descriptionRu: str
    gradeMin: int
    gradeMax: int
    imageUrl: str
    color: str
    order: int

class SubjectResponse(BaseModel):
    id: str
    name: str
    nameUz: str
    nameRu: str
    islandId: str
    icon: str
    color: str
    order: int

class LessonResponse(BaseModel):
    id: str
    title: str
    titleUz: str
    titleRu: str
    description: str
    subjectId: str
    videoUrl: Optional[str] = None
    content: str
    order: int
    xpReward: int
    isPublished: bool

class QuizResponse(BaseModel):
    id: str
    lessonId: str
    title: str
    questions: List[Dict[str, Any]]

class UserProgressResponse(BaseModel):
    id: str
    userId: str
    lessonId: str
    progress: int
    completed: bool
    completedAt: Optional[str] = None
    score: Optional[int] = None

class CreateSubjectRequest(BaseModel):
    name: str
    nameUz: str
    nameRu: str
    islandId: str
    icon: str
    color: str
    order: int

class CreateLessonRequest(BaseModel):
    title: str
    titleUz: str
    titleRu: str
    description: str
    subjectId: str
    content: str
    order: int
    xpReward: int = 10
    videoUrl: Optional[str] = None
    isPublished: bool = False

class UpdateProgressRequest(BaseModel):
    progress: int
    score: Optional[int] = None

class AchievementResponse(BaseModel):
    id: str
    name: str
    nameUz: str
    nameRu: str
    description: str
    icon: str
    rarity: str
    xpReward: int

class LeaderboardResponse(BaseModel):
    userId: str
    firstName: str
    lastName: str
    avatar: Optional[str] = None
    xp: int
    level: int
    rank: int

# Seed admin user
async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@hashimjon.uz")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        hashed = hash_password(admin_password)
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hashed,
            "firstName": "Admin",
            "lastName": "User",
            "role": "admin",
            "xp": 0,
            "level": 1,
            "streak": 0,
            "createdAt": datetime.now(timezone.utc).isoformat()
        })
        logging.info(f"Admin user created: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}}
        )
        logging.info(f"Admin password updated: {admin_email}")

# Seed initial islands and subjects
async def seed_data():
    # Check if islands exist
    island_count = await db.islands.count_documents({})
    if island_count == 0:
        islands = [
            {
                "id": str(uuid.uuid4()),
                "name": "Quvonch Oroli",
                "nameUz": "Quvonch Oroli",
                "nameRu": "Остров Радости",
                "description": "Ilk bilimlar va asosiy ko'nikmalar oroli",
                "descriptionUz": "Ilk bilimlar va asosiy ko'nikmalar oroli",
                "descriptionRu": "Остров первых знаний и базовых навыков",
                "gradeMin": 1,
                "gradeMax": 4,
                "imageUrl": "https://images.unsplash.com/photo-1674836979239-6356712d5365?q=85",
                "color": "#FFD6E8",
                "order": 1
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Kashfiyot Oroli",
                "nameUz": "Kashfiyot Oroli",
                "nameRu": "Остров Открытий",
                "description": "Yangi fanlarga sarguzasht va kashfiyot",
                "descriptionUz": "Yangi fanlarga sarguzasht va kashfiyot",
                "descriptionRu": "Приключения и открытия в новых предметах",
                "gradeMin": 5,
                "gradeMax": 8,
                "imageUrl": "https://images.unsplash.com/photo-1674836979239-6356712d5365?q=85",
                "color": "#A8E6CF",
                "order": 2
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Kelajak Oroli",
                "nameUz": "Kelajak Oroli",
                "nameRu": "Остров Будущего",
                "description": "Ilg'or bilimlar va kelajak kasblar",
                "descriptionUz": "Ilg'or bilimlar va kelajak kasblar",
                "descriptionRu": "Передовые знания и будущие профессии",
                "gradeMin": 9,
                "gradeMax": 11,
                "imageUrl": "https://images.unsplash.com/photo-1674836979239-6356712d5365?q=85",
                "color": "#C9B3FF",
                "order": 3
            }
        ]
        await db.islands.insert_many(islands)
        logging.info(f"Seeded {len(islands)} islands")
    
    # Seed achievements
    ach_count = await db.achievements.count_documents({})
    if ach_count == 0:
        achievements = [
            {"id": str(uuid.uuid4()), "name": "First Step", "nameUz": "Birinchi qadam", "nameRu": "Первый шаг",
             "description": "Birinchi darsni tugating", "icon": "footprints", "rarity": "common", "xpReward": 50, "order": 1},
            {"id": str(uuid.uuid4()), "name": "Week Warrior", "nameUz": "Haftalik jangchi", "nameRu": "Воин недели",
             "description": "7 kun ketma-ket o'qing", "icon": "fire", "rarity": "rare", "xpReward": 100, "order": 2},
            {"id": str(uuid.uuid4()), "name": "Quiz Master", "nameUz": "Test ustasi", "nameRu": "Мастер тестов",
             "description": "10 ta testni a'lo bahoga toping", "icon": "trophy", "rarity": "epic", "xpReward": 200, "order": 3},
            {"id": str(uuid.uuid4()), "name": "Knowledge Seeker", "nameUz": "Bilim izlovchi", "nameRu": "Искатель знаний",
             "description": "1000 XP toplang", "icon": "star", "rarity": "rare", "xpReward": 150, "order": 4},
            {"id": str(uuid.uuid4()), "name": "Island Explorer", "nameUz": "Orol kashfiyotchi", "nameRu": "Исследователь островов",
             "description": "Barcha 3 orolni o'rganing", "icon": "compass", "rarity": "epic", "xpReward": 300, "order": 5},
            {"id": str(uuid.uuid4()), "name": "Legendary Scholar", "nameUz": "Afsonaviy olim", "nameRu": "Легендарный учёный",
             "description": "10000 XP toplang", "icon": "crown", "rarity": "legendary", "xpReward": 1000, "order": 6}
        ]
        await db.achievements.insert_many(achievements)
        logging.info(f"Seeded {len(achievements)} achievements")
    
    # Seed rewards
    rew_count = await db.rewards.count_documents({})
    if rew_count == 0:
        rewards = [
            {"id": str(uuid.uuid4()), "name": "Bronze Badge", "nameUz": "Bronza nishon", "nameRu": "Бронзовый знак",
             "type": "badge", "rarity": "common", "icon": "medal-bronze", "xpRequired": 100, "order": 1},
            {"id": str(uuid.uuid4()), "name": "Silver Badge", "nameUz": "Kumush nishon", "nameRu": "Серебряный знак",
             "type": "badge", "rarity": "rare", "icon": "medal-silver", "xpRequired": 500, "order": 2},
            {"id": str(uuid.uuid4()), "name": "Gold Badge", "nameUz": "Oltin nishon", "nameRu": "Золотой знак",
             "type": "badge", "rarity": "epic", "icon": "medal-gold", "xpRequired": 1500, "order": 3},
            {"id": str(uuid.uuid4()), "name": "Diamond Badge", "nameUz": "Olmos nishon", "nameRu": "Алмазный знак",
             "type": "badge", "rarity": "legendary", "icon": "diamond", "xpRequired": 5000, "order": 4},
            {"id": str(uuid.uuid4()), "name": "Robot Avatar", "nameUz": "Robot avatar", "nameRu": "Аватар робот",
             "type": "avatar", "rarity": "rare", "icon": "robot", "xpRequired": 800, "order": 5},
            {"id": str(uuid.uuid4()), "name": "Wizard Title", "nameUz": "Sehrgar unvoni", "nameRu": "Титул волшебник",
             "type": "title", "rarity": "epic", "icon": "wand", "xpRequired": 2000, "order": 6}
        ]
        await db.rewards.insert_many(rewards)
        logging.info(f"Seeded {len(rewards)} rewards")
    
    # Seed sample subjects and lessons for Quvonch island
    subj_count = await db.subjects.count_documents({})
    if subj_count == 0:
        all_islands = await db.islands.find({}).sort("order", 1).to_list(10)
        if all_islands:
            quvonch_id = all_islands[0]["id"]
            kashfiyot_id = all_islands[1]["id"] if len(all_islands) > 1 else None
            kelajak_id = all_islands[2]["id"] if len(all_islands) > 2 else None
            
            subjects = [
                {"id": str(uuid.uuid4()), "name": "Matematika", "nameUz": "Matematika", "nameRu": "Математика",
                 "islandId": quvonch_id, "icon": "calculator", "color": "#E879A8", "order": 1},
                {"id": str(uuid.uuid4()), "name": "Ona tili", "nameUz": "Ona tili", "nameRu": "Родной язык",
                 "islandId": quvonch_id, "icon": "book", "color": "#9B59F5", "order": 2},
                {"id": str(uuid.uuid4()), "name": "Tabiatshunoslik", "nameUz": "Tabiatshunoslik", "nameRu": "Природоведение",
                 "islandId": quvonch_id, "icon": "leaf", "color": "#22C55E", "order": 3}
            ]
            
            if kashfiyot_id:
                subjects.extend([
                    {"id": str(uuid.uuid4()), "name": "Algebra", "nameUz": "Algebra", "nameRu": "Алгебра",
                     "islandId": kashfiyot_id, "icon": "function", "color": "#5B8DEF", "order": 1},
                    {"id": str(uuid.uuid4()), "name": "Fizika", "nameUz": "Fizika", "nameRu": "Физика",
                     "islandId": kashfiyot_id, "icon": "atom", "color": "#9B59F5", "order": 2},
                    {"id": str(uuid.uuid4()), "name": "Biologiya", "nameUz": "Biologiya", "nameRu": "Биология",
                     "islandId": kashfiyot_id, "icon": "dna", "color": "#22C55E", "order": 3}
                ])
            
            if kelajak_id:
                subjects.extend([
                    {"id": str(uuid.uuid4()), "name": "Programming", "nameUz": "Dasturlash", "nameRu": "Программирование",
                     "islandId": kelajak_id, "icon": "code", "color": "#5B8DEF", "order": 1},
                    {"id": str(uuid.uuid4()), "name": "AI Asoslari", "nameUz": "AI Asoslari", "nameRu": "Основы ИИ",
                     "islandId": kelajak_id, "icon": "brain", "color": "#9B59F5", "order": 2}
                ])
            
            await db.subjects.insert_many(subjects)
            logging.info(f"Seeded {len(subjects)} subjects")
            
            # Sample lessons
            math_subj = next((s for s in subjects if s["name"] == "Matematika"), None)
            if math_subj:
                lessons = [
                    {"id": str(uuid.uuid4()), "title": "Sonlar bilan tanishuv", "titleUz": "Sonlar bilan tanishuv", "titleRu": "Знакомство с числами",
                     "description": "1 dan 10 gacha sonlarni o'rganamiz",
                     "subjectId": math_subj["id"],
                     "videoUrl": "https://www.youtube.com/embed/D0Ajq682yrA",
                     "content": "Bu darsda biz 1 dan 10 gacha bo'lgan sonlarni o'rganamiz. Sonlarni qanday yozish va o'qishni bilib olamiz.\n\n**1, 2, 3, 4, 5, 6, 7, 8, 9, 10**\n\nHar bir son o'zining nomi va belgisiga ega. Sonlarni hisoblash juda qiziqarli!",
                     "order": 1, "xpReward": 50, "isPublished": True, "createdAt": datetime.now(timezone.utc).isoformat()},
                    {"id": str(uuid.uuid4()), "title": "Qo'shish amali", "titleUz": "Qo'shish amali", "titleRu": "Операция сложения",
                     "description": "Sonlarni qo'shishni o'rganamiz",
                     "subjectId": math_subj["id"],
                     "videoUrl": "https://www.youtube.com/embed/AuX7nPBqDts",
                     "content": "Qo'shish - bu ikki yoki undan ortiq sonlarni birlashtirib, ularning yig'indisini topish.\n\n**Misol:** 2 + 3 = 5\n\nBu yerda 2 va 3 sonlari qo'shilib, 5 sonini hosil qiladi.",
                     "order": 2, "xpReward": 60, "isPublished": True, "createdAt": datetime.now(timezone.utc).isoformat()}
                ]
                await db.lessons.insert_many(lessons)
                logging.info(f"Seeded {len(lessons)} sample lessons")
                
                # Sample quiz for first lesson
                quiz = {
                    "id": str(uuid.uuid4()),
                    "lessonId": lessons[0]["id"],
                    "title": "Sonlar testi",
                    "titleUz": "Sonlar testi",
                    "titleRu": "Тест чисел",
                    "questions": [
                        {"id": str(uuid.uuid4()), "question": "1 dan keyin qaysi son keladi?",
                         "options": ["0", "2", "3", "10"], "correctAnswer": 1,
                         "explanation": "1 dan keyin 2 keladi"},
                        {"id": str(uuid.uuid4()), "question": "Necha barmoq bor bir qo'lda?",
                         "options": ["3", "4", "5", "6"], "correctAnswer": 2,
                         "explanation": "Bir qo'lda 5 ta barmoq bor"},
                        {"id": str(uuid.uuid4()), "question": "Eng katta son qaysi?",
                         "options": ["3", "7", "5", "9"], "correctAnswer": 3,
                         "explanation": "9 - 3, 7 va 5 dan katta"}
                    ],
                    "passingScore": 60,
                    "xpReward": 30,
                    "createdAt": datetime.now(timezone.utc).isoformat()
                }
                await db.quizzes.insert_one(quiz)
                logging.info("Seeded sample quiz")

# Startup event
@app.on_event("startup")
async def startup():
    try:
        init_storage()
        logging.info("Storage initialized")
    except Exception as e:
        logging.warning(f"Storage init failed: {e}")
    
    await seed_admin()
    await seed_data()
    
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.password_reset_tokens.create_index("expiresAt", expireAfterSeconds=0)
    await db.login_attempts.create_index("identifier")
    await db.islands.create_index("order")
    await db.subjects.create_index([("islandId", 1), ("order", 1)])
    await db.lessons.create_index([("subjectId", 1), ("order", 1)])
    
    logging.info("Database indexes created")

# Auth endpoints
@api_router.post("/auth/register")
async def register(req: RegisterRequest, response: Response):
    email = req.email.lower()
    
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_doc = {
        "email": email,
        "password_hash": hash_password(req.password),
        "firstName": req.firstName,
        "lastName": req.lastName,
        "phone": req.phone,
        "grade": req.grade,
        "parentPhone": req.parentPhone,
        "role": req.role if req.role in ["student", "teacher", "parent"] else "student",
        "avatar": req.avatar,
        "xp": 0,
        "level": 1,
        "streak": 0,
        "lastLoginDate": None,
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=900,
        path="/"
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=604800,
        path="/"
    )
    
    user_doc["id"] = user_id
    user_doc.pop("password_hash")
    user_doc.pop("_id", None)
    
    return user_doc

@api_router.post("/auth/login")
async def login(req: LoginRequest, request: Request, response: Response):
    email = req.email.lower()
    
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=900,
        path="/"
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=604800,
        path="/"
    )
    
    # Update last login date and streak
    today = datetime.now(timezone.utc).date().isoformat()
    last_login = user.get("lastLoginDate")
    
    if last_login:
        last_date = datetime.fromisoformat(last_login).date()
        today_date = datetime.now(timezone.utc).date()
        days_diff = (today_date - last_date).days
        
        if days_diff == 1:
            await db.users.update_one(
                {"_id": user["_id"]},
                {"$inc": {"streak": 1}, "$set": {"lastLoginDate": today}}
            )
            user["streak"] = user.get("streak", 0) + 1
        elif days_diff > 1:
            await db.users.update_one(
                {"_id": user["_id"]},
                {"$set": {"streak": 1, "lastLoginDate": today}}
            )
            user["streak"] = 1
        else:
            await db.users.update_one(
                {"_id": user["_id"]},
                {"$set": {"lastLoginDate": today}}
            )
    else:
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"streak": 1, "lastLoginDate": today}}
        )
        user["streak"] = 1
    
    user["id"] = user_id
    user.pop("password_hash")
    user.pop("_id")
    
    return user

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")
    return {"message": "Logged out successfully"}

@api_router.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    refresh = request.cookies.get("refresh_token")
    if not refresh:
        raise HTTPException(status_code=401, detail="No refresh token")
    
    try:
        payload = jwt.decode(refresh, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        new_access = create_access_token(str(user["_id"]), user["email"])
        response.set_cookie(
            key="access_token",
            value=new_access,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=900,
            path="/"
        )
        return {"message": "Token refreshed"}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

# Islands endpoints
@api_router.get("/islands")
async def get_islands():
    islands = await db.islands.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return islands

@api_router.get("/islands/{island_id}")
async def get_island(island_id: str):
    island = await db.islands.find_one({"id": island_id}, {"_id": 0})
    if not island:
        raise HTTPException(status_code=404, detail="Island not found")
    return island

# Subjects endpoints
@api_router.get("/subjects")
async def get_subjects(island_id: Optional[str] = None):
    query = {"islandId": island_id} if island_id else {}
    subjects = await db.subjects.find(query, {"_id": 0}).sort("order", 1).to_list(100)
    return subjects

@api_router.post("/subjects")
async def create_subject(
    req: CreateSubjectRequest,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    subject = {
        "id": str(uuid.uuid4()),
        "name": req.name,
        "nameUz": req.nameUz,
        "nameRu": req.nameRu,
        "islandId": req.islandId,
        "icon": req.icon,
        "color": req.color,
        "order": req.order
    }
    
    await db.subjects.insert_one(subject)
    subject.pop("_id", None)
    return subject

# Lessons endpoints
@api_router.get("/lessons")
async def get_lessons(subject_id: Optional[str] = None):
    query = {"subjectId": subject_id, "isPublished": True} if subject_id else {"isPublished": True}
    lessons = await db.lessons.find(query, {"_id": 0}).sort("order", 1).to_list(100)
    return lessons

@api_router.get("/lessons/{lesson_id}")
async def get_lesson(lesson_id: str):
    lesson = await db.lessons.find_one({"id": lesson_id}, {"_id": 0})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson

@api_router.post("/lessons")
async def create_lesson(
    req: CreateLessonRequest,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    lesson = {
        "id": str(uuid.uuid4()),
        "title": req.title,
        "titleUz": req.titleUz,
        "titleRu": req.titleRu,
        "description": req.description,
        "subjectId": req.subjectId,
        "videoUrl": req.videoUrl,
        "content": req.content,
        "order": req.order,
        "xpReward": req.xpReward,
        "isPublished": req.isPublished,
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    
    await db.lessons.insert_one(lesson)
    lesson.pop("_id", None)
    return lesson

# User progress endpoints
@api_router.get("/progress")
async def get_user_progress(current_user: dict = Depends(get_current_user)):
    progress_list = await db.user_progress.find(
        {"userId": current_user["id"]},
        {"_id": 0}
    ).to_list(1000)
    return progress_list

@api_router.post("/progress/{lesson_id}")
async def update_progress(
    lesson_id: str,
    req: UpdateProgressRequest,
    current_user: dict = Depends(get_current_user)
):
    lesson = await db.lessons.find_one({"id": lesson_id})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    completed = req.progress >= 100
    update_data = {
        "userId": current_user["id"],
        "lessonId": lesson_id,
        "progress": req.progress,
        "completed": completed,
        "score": req.score,
        "updatedAt": datetime.now(timezone.utc).isoformat()
    }
    
    if completed:
        update_data["completedAt"] = datetime.now(timezone.utc).isoformat()
        
        # Award XP
        xp_reward = lesson.get("xpReward", 10)
        await db.users.update_one(
            {"_id": ObjectId(current_user["id"])},
            {"$inc": {"xp": xp_reward}}
        )
    
    existing = await db.user_progress.find_one({
        "userId": current_user["id"],
        "lessonId": lesson_id
    })
    
    if existing:
        await db.user_progress.update_one(
            {"userId": current_user["id"], "lessonId": lesson_id},
            {"$set": update_data}
        )
        update_data["id"] = existing.get("id", str(uuid.uuid4()))
    else:
        update_data["id"] = str(uuid.uuid4())
        update_data["createdAt"] = datetime.now(timezone.utc).isoformat()
        await db.user_progress.insert_one(update_data)
    
    update_data.pop("_id", None)
    return update_data

# Leaderboard endpoint
@api_router.get("/leaderboard")
async def get_leaderboard(limit: int = 100):
    users = await db.users.find(
        {"role": "student"},
        {"_id": 0, "id": 1, "firstName": 1, "lastName": 1, "avatar": 1, "xp": 1, "level": 1}
    ).sort("xp", -1).limit(limit).to_list(limit)
    
    for idx, user in enumerate(users):
        user["rank"] = idx + 1
    
    return users

# File upload endpoint
@api_router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
    path = f"{APP_NAME}/uploads/{current_user['id']}/{uuid.uuid4()}.{ext}"
    data = await file.read()
    
    try:
        result = put_object(path, data, file.content_type or "application/octet-stream")
        
        file_doc = {
            "id": str(uuid.uuid4()),
            "userId": current_user["id"],
            "storagePath": result["path"],
            "originalFilename": file.filename,
            "contentType": file.content_type,
            "size": result["size"],
            "isDeleted": False,
            "createdAt": datetime.now(timezone.utc).isoformat()
        }
        
        await db.files.insert_one(file_doc)
        file_doc.pop("_id", None)
        
        return file_doc
    except Exception as e:
        logging.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail="Upload failed")

@api_router.get("/files/{file_id}")
async def download_file(
    file_id: str,
    authorization: str = Header(None),
    auth: str = Query(None)
):
    file_record = await db.files.find_one({"id": file_id, "isDeleted": False})
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        data, content_type = get_object(file_record["storagePath"])
        return FastAPIResponse(
            content=data,
            media_type=file_record.get("contentType", content_type)
        )
    except Exception as e:
        logging.error(f"Download failed: {e}")
        raise HTTPException(status_code=500, detail="Download failed")

# Health check
@api_router.get("/")
async def root():
    return {"message": "Hashimjon Akademiyasi API", "status": "running"}

# ============ QUIZZES ============
class QuizQuestion(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question: str
    options: List[str]
    correctAnswer: int
    explanation: Optional[str] = None

class CreateQuizRequest(BaseModel):
    lessonId: str
    title: str
    titleUz: str
    titleRu: str
    questions: List[QuizQuestion]
    passingScore: int = 70
    xpReward: int = 20

class SubmitQuizRequest(BaseModel):
    quizId: str
    answers: List[int]

@api_router.get("/quizzes")
async def get_quizzes(lesson_id: Optional[str] = None):
    query = {"lessonId": lesson_id} if lesson_id else {}
    quizzes = await db.quizzes.find(query, {"_id": 0}).to_list(100)
    return quizzes

@api_router.get("/quizzes/{quiz_id}")
async def get_quiz(quiz_id: str):
    quiz = await db.quizzes.find_one({"id": quiz_id}, {"_id": 0})
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz

@api_router.post("/quizzes")
async def create_quiz(req: CreateQuizRequest, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    quiz = {
        "id": str(uuid.uuid4()),
        "lessonId": req.lessonId,
        "title": req.title,
        "titleUz": req.titleUz,
        "titleRu": req.titleRu,
        "questions": [q.model_dump() for q in req.questions],
        "passingScore": req.passingScore,
        "xpReward": req.xpReward,
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    
    await db.quizzes.insert_one(quiz)
    quiz.pop("_id", None)
    return quiz

@api_router.post("/quizzes/submit")
async def submit_quiz(req: SubmitQuizRequest, current_user: dict = Depends(get_current_user)):
    quiz = await db.quizzes.find_one({"id": req.quizId})
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    correct_count = 0
    questions = quiz["questions"]
    
    for idx, answer in enumerate(req.answers):
        if idx < len(questions) and questions[idx]["correctAnswer"] == answer:
            correct_count += 1
    
    score = int((correct_count / len(questions)) * 100) if questions else 0
    passed = score >= quiz.get("passingScore", 70)
    
    # Check if user already passed this quiz before
    already_passed = await db.quiz_submissions.find_one({
        "userId": current_user["id"],
        "quizId": req.quizId,
        "passed": True
    })
    
    submission = {
        "id": str(uuid.uuid4()),
        "userId": current_user["id"],
        "quizId": req.quizId,
        "answers": req.answers,
        "score": score,
        "passed": passed,
        "submittedAt": datetime.now(timezone.utc).isoformat()
    }
    
    await db.quiz_submissions.insert_one(submission)
    
    # Award XP only on first pass
    if passed and not already_passed:
        xp_reward = quiz.get("xpReward", 20)
        await db.users.update_one(
            {"_id": ObjectId(current_user["id"])},
            {"$inc": {"xp": xp_reward}}
        )
    
    submission.pop("_id", None)
    submission["correctCount"] = correct_count
    submission["totalQuestions"] = len(questions)
    submission["xpAwarded"] = passed and not already_passed
    return submission

# ============ ASSIGNMENTS / HOMEWORK ============
class CreateAssignmentRequest(BaseModel):
    lessonId: str
    title: str
    description: str
    dueDate: Optional[str] = None
    maxScore: int = 100

class SubmitAssignmentRequest(BaseModel):
    assignmentId: str
    content: str
    fileId: Optional[str] = None

@api_router.get("/assignments")
async def get_assignments(lesson_id: Optional[str] = None):
    query = {"lessonId": lesson_id} if lesson_id else {}
    assignments = await db.assignments.find(query, {"_id": 0}).to_list(100)
    return assignments

@api_router.post("/assignments")
async def create_assignment(req: CreateAssignmentRequest, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    assignment = {
        "id": str(uuid.uuid4()),
        "lessonId": req.lessonId,
        "title": req.title,
        "description": req.description,
        "dueDate": req.dueDate,
        "maxScore": req.maxScore,
        "createdBy": current_user["id"],
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    
    await db.assignments.insert_one(assignment)
    assignment.pop("_id", None)
    return assignment

@api_router.post("/assignments/submit")
async def submit_assignment(req: SubmitAssignmentRequest, current_user: dict = Depends(get_current_user)):
    assignment = await db.assignments.find_one({"id": req.assignmentId})
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    submission = {
        "id": str(uuid.uuid4()),
        "userId": current_user["id"],
        "assignmentId": req.assignmentId,
        "content": req.content,
        "fileId": req.fileId,
        "score": None,
        "feedback": None,
        "status": "submitted",
        "submittedAt": datetime.now(timezone.utc).isoformat()
    }
    
    await db.submissions.insert_one(submission)
    submission.pop("_id", None)
    return submission

# ============ ACHIEVEMENTS ============
@api_router.get("/achievements")
async def get_achievements():
    achievements = await db.achievements.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return achievements

@api_router.get("/user-achievements")
async def get_user_achievements(current_user: dict = Depends(get_current_user)):
    earned = await db.user_achievements.find(
        {"userId": current_user["id"]}, {"_id": 0}
    ).to_list(100)
    return earned

# ============ REWARDS ============
@api_router.get("/rewards")
async def get_rewards():
    rewards = await db.rewards.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return rewards

@api_router.get("/user-rewards")
async def get_user_rewards(current_user: dict = Depends(get_current_user)):
    earned = await db.user_rewards.find(
        {"userId": current_user["id"]}, {"_id": 0}
    ).to_list(100)
    return earned

# ============ AI ENDPOINTS (Kimi K2) ============
class AITutorRequest(BaseModel):
    message: str
    sessionId: Optional[str] = None
    context: Optional[str] = None

class AIQuizGenRequest(BaseModel):
    topic: str
    grade: int
    numQuestions: int = 5
    language: str = "uz"

class AIHomeworkRequest(BaseModel):
    question: str
    subject: Optional[str] = None
    grade: Optional[int] = None

@api_router.post("/ai/tutor")
async def ai_tutor(req: AITutorRequest, current_user: dict = Depends(get_current_user)):
    """AI Tutor - O'qituvchi yordamchisi"""
    session_id = req.sessionId or str(uuid.uuid4())
    
    system_msg = (
        "Sen Hashimjon - o'zbek bolalar uchun do'st va aqlli o'qituvchisan. "
        "Sen 6-18 yoshdagi bolalarga matematika, fizika, kimyo, biologiya, til va boshqa fanlarda yordam berasan. "
        "Tushuntirishlaringni juda sodda, qiziqarli va do'stona qilib bering. "
        "Misollar keltirib tushuntiring. Bolaning savoliga to'g'ridan-to'g'ri javob bermay, "
        "ularni o'ylashga undash. O'zbek tilida javob bering."
    )
    
    if req.context:
        system_msg += f"\n\nDars konteksti: {req.context}"
    
    # Save user message
    await db.ai_chat_history.insert_one({
        "id": str(uuid.uuid4()),
        "userId": current_user["id"],
        "sessionId": session_id,
        "role": "user",
        "content": req.message,
        "createdAt": datetime.now(timezone.utc).isoformat()
    })
    
    try:
        # Get chat history for context
        history = await db.ai_chat_history.find(
            {"userId": current_user["id"], "sessionId": session_id},
            {"_id": 0}
        ).sort("createdAt", 1).limit(20).to_list(20)
        
        messages = [{"role": "system", "content": system_msg}]
        for msg in history[-10:]:
            messages.append({"role": msg["role"], "content": msg["content"]})
        
        response = await kimi_client.chat.completions.create(
            model=KIMI_MODEL,
            messages=messages,
            temperature=1
        )
        
        ai_response = response.choices[0].message.content
        
        # Save AI response
        await db.ai_chat_history.insert_one({
            "id": str(uuid.uuid4()),
            "userId": current_user["id"],
            "sessionId": session_id,
            "role": "assistant",
            "content": ai_response,
            "createdAt": datetime.now(timezone.utc).isoformat()
        })
        
        return {
            "sessionId": session_id,
            "response": ai_response
        }
    except Exception as e:
        logging.error(f"AI Tutor error: {e}")
        raise HTTPException(status_code=500, detail=f"AI xatolik: {str(e)}")

@api_router.get("/ai/chat-history/{session_id}")
async def get_chat_history(session_id: str, current_user: dict = Depends(get_current_user)):
    history = await db.ai_chat_history.find(
        {"userId": current_user["id"], "sessionId": session_id},
        {"_id": 0}
    ).sort("createdAt", 1).to_list(100)
    return history

@api_router.post("/ai/generate-quiz")
async def ai_generate_quiz(req: AIQuizGenRequest, current_user: dict = Depends(get_current_user)):
    """AI Quiz Generator - Test yaratish"""
    if current_user["role"] not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    lang_name = "o'zbek" if req.language == "uz" else "rus"
    
    system_msg = (
        f"Sen test yaratuvchi mutaxassissan. {req.grade}-sinf o'quvchilari uchun {lang_name} tilida "
        f"'{req.topic}' mavzusida {req.numQuestions} ta variantli test savollarini tayyorla. "
        "Har bir savolda 4 ta variant bo'lsin. Faqat JSON formatda javob ber:\n"
        '{"questions": [{"question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": 0, "explanation": "..."}]}'
    )
    
    try:
        response = await kimi_client.chat.completions.create(
            model=KIMI_MODEL,
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": f"Mavzu: {req.topic}, Sinf: {req.grade}, Savollar soni: {req.numQuestions}"}
            ],
            temperature=1,
            response_format={"type": "json_object"}
        )
        
        import json
        result = json.loads(response.choices[0].message.content)
        return result
    except Exception as e:
        logging.error(f"AI Quiz Gen error: {e}")
        raise HTTPException(status_code=500, detail=f"Test yaratishda xatolik: {str(e)}")

@api_router.post("/ai/homework-helper")
async def ai_homework_helper(req: AIHomeworkRequest, current_user: dict = Depends(get_current_user)):
    """AI Homework Helper - Uy vazifasi yordamchisi"""
    system_msg = (
        "Sen uy vazifalari uchun yordamchi o'qituvchisan. "
        "O'zbek bolaga uy vazifasini hal qilishda yordam ber. "
        "Javobni to'g'ridan-to'g'ri bermay, bola o'zi tushunishi uchun bosqichma-bosqich tushuntir. "
        "Misollar bilan tushuntir. O'zbek tilida javob ber."
    )
    
    if req.subject:
        system_msg += f"\nFan: {req.subject}"
    if req.grade:
        system_msg += f"\nSinf: {req.grade}"
    
    try:
        response = await kimi_client.chat.completions.create(
            model=KIMI_MODEL,
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": req.question}
            ],
            temperature=1
        )
        
        return {"response": response.choices[0].message.content}
    except Exception as e:
        logging.error(f"AI Homework error: {e}")
        raise HTTPException(status_code=500, detail=f"AI xatolik: {str(e)}")

# ============ DAILY CHALLENGES ============
@api_router.get("/challenges/daily")
async def get_daily_challenges(current_user: dict = Depends(get_current_user)):
    today = datetime.now(timezone.utc).date().isoformat()
    challenges = await db.daily_challenges.find({"date": today}, {"_id": 0}).to_list(10)
    
    if not challenges:
        challenges = [
            {"id": str(uuid.uuid4()), "date": today, "title": "3 ta darsni tugatish",
             "description": "Bugun 3 ta yangi darsni tugatib XP yutib oling",
             "type": "lessons", "target": 3, "xpReward": 100, "icon": "📚"},
            {"id": str(uuid.uuid4()), "date": today, "title": "AI bilan suhbat",
             "description": "AI o'qituvchi bilan kamida 5 ta savol bo'yicha suhbatlashing",
             "type": "ai_chat", "target": 5, "xpReward": 50, "icon": "🤖"},
            {"id": str(uuid.uuid4()), "date": today, "title": "Test yechish",
             "description": "Bitta testni 70%+ natija bilan yeching",
             "type": "quiz", "target": 1, "xpReward": 75, "icon": "✅"}
        ]
        await db.daily_challenges.insert_many(challenges)
    
    user_progress_list = await db.user_challenges.find(
        {"userId": current_user["id"], "date": today},
        {"_id": 0}
    ).to_list(100)
    progress_map = {p["challengeId"]: p for p in user_progress_list}
    
    for ch in challenges:
        up = progress_map.get(ch["id"], {})
        ch["progress"] = up.get("progress", 0)
        ch["completed"] = up.get("completed", False)
    
    return challenges

class CompleteChallengeRequest(BaseModel):
    challengeId: str

@api_router.post("/challenges/complete")
async def complete_challenge(req: CompleteChallengeRequest, current_user: dict = Depends(get_current_user)):
    challenge = await db.daily_challenges.find_one({"id": req.challengeId})
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    existing = await db.user_challenges.find_one({
        "userId": current_user["id"],
        "challengeId": req.challengeId
    })
    
    if existing and existing.get("completed"):
        return {"message": "Already completed", "xpAwarded": False}
    
    data = {
        "userId": current_user["id"],
        "challengeId": req.challengeId,
        "date": challenge["date"],
        "progress": challenge["target"],
        "completed": True,
        "completedAt": datetime.now(timezone.utc).isoformat()
    }
    
    if existing:
        await db.user_challenges.update_one({"_id": existing["_id"]}, {"$set": data})
    else:
        data["id"] = str(uuid.uuid4())
        await db.user_challenges.insert_one(data)
    
    await db.users.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$inc": {"xp": challenge["xpReward"]}}
    )
    
    return {"message": "Challenge completed", "xpAwarded": True, "xpAdded": challenge["xpReward"]}

# ============ AVATARS ============
AVAILABLE_AVATARS = [
    {"id": "default", "name": "Standart", "emoji": "👤", "xpRequired": 0, "rarity": "common"},
    {"id": "boy", "name": "Bolakay", "emoji": "👦", "xpRequired": 100, "rarity": "common"},
    {"id": "girl", "name": "Qizaloq", "emoji": "👧", "xpRequired": 100, "rarity": "common"},
    {"id": "wizard", "name": "Sehrgar", "emoji": "🧙", "xpRequired": 500, "rarity": "rare"},
    {"id": "scientist", "name": "Olim", "emoji": "🧑‍🔬", "xpRequired": 800, "rarity": "rare"},
    {"id": "astronaut", "name": "Kosmonavt", "emoji": "🧑‍🚀", "xpRequired": 1500, "rarity": "epic"},
    {"id": "robot", "name": "Robot", "emoji": "🤖", "xpRequired": 2000, "rarity": "epic"},
    {"id": "ninja", "name": "Ninja", "emoji": "🥷", "xpRequired": 3000, "rarity": "legendary"},
    {"id": "superhero", "name": "Qahramon", "emoji": "🦸", "xpRequired": 5000, "rarity": "legendary"}
]

@api_router.get("/avatars")
async def list_avatars():
    return AVAILABLE_AVATARS

class PurchaseAvatarRequest(BaseModel):
    avatarId: str

@api_router.post("/avatars/purchase")
async def purchase_avatar(req: PurchaseAvatarRequest, current_user: dict = Depends(get_current_user)):
    avatar = next((a for a in AVAILABLE_AVATARS if a["id"] == req.avatarId), None)
    if not avatar:
        raise HTTPException(status_code=404, detail="Avatar not found")
    
    user_xp = current_user.get("xp", 0)
    if user_xp < avatar["xpRequired"]:
        raise HTTPException(status_code=400, detail=f"Yetarli XP yo'q. Kerakli: {avatar['xpRequired']}, sizda: {user_xp}")
    
    await db.users.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": {"avatar": req.avatarId}}
    )
    
    return {"message": "Avatar tanlandi", "avatar": req.avatarId}

# ============ CERTIFICATES PDF ============
@api_router.get("/certificates/{lesson_id}")
async def generate_certificate(lesson_id: str, current_user: dict = Depends(get_current_user)):
    from reportlab.lib.pagesizes import landscape, A4
    from reportlab.pdfgen import canvas as pdf_canvas
    from reportlab.lib import colors as rl_colors
    from io import BytesIO
    
    progress = await db.user_progress.find_one({
        "userId": current_user["id"],
        "lessonId": lesson_id,
        "completed": True
    })
    if not progress:
        raise HTTPException(status_code=400, detail="Dars hali tugatilmagan")
    
    lesson = await db.lessons.find_one({"id": lesson_id})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    buffer = BytesIO()
    pdf = pdf_canvas.Canvas(buffer, pagesize=landscape(A4))
    width, height = landscape(A4)
    
    pdf.setFillColor(rl_colors.HexColor("#F5F0FF"))
    pdf.rect(0, 0, width, height, fill=1, stroke=0)
    
    pdf.setStrokeColor(rl_colors.HexColor("#9B59F5"))
    pdf.setLineWidth(8)
    pdf.rect(20, 20, width-40, height-40)
    
    pdf.setStrokeColor(rl_colors.HexColor("#E879A8"))
    pdf.setLineWidth(2)
    pdf.rect(40, 40, width-80, height-80)
    
    pdf.setFillColor(rl_colors.HexColor("#9B59F5"))
    pdf.setFont("Helvetica-Bold", 48)
    pdf.drawCentredString(width/2, height-120, "CERTIFICATE")
    
    pdf.setFillColor(rl_colors.HexColor("#5B8DEF"))
    pdf.setFont("Helvetica-Bold", 24)
    pdf.drawCentredString(width/2, height-160, "Hashimjon Akademiyasi")
    
    pdf.setFillColor(rl_colors.HexColor("#4B4554"))
    pdf.setFont("Helvetica", 18)
    pdf.drawCentredString(width/2, height-220, "Awarded to:")
    
    pdf.setFillColor(rl_colors.HexColor("#E879A8"))
    pdf.setFont("Helvetica-Bold", 36)
    full_name = f"{current_user.get('firstName', '')} {current_user.get('lastName', '')}"
    pdf.drawCentredString(width/2, height-270, full_name)
    
    pdf.setFillColor(rl_colors.HexColor("#4B4554"))
    pdf.setFont("Helvetica", 16)
    lesson_title = lesson.get('titleUz') or lesson.get('title', '')
    pdf.drawCentredString(width/2, height-310, f'for completing "{lesson_title}"')
    
    pdf.setFont("Helvetica", 14)
    pdf.drawCentredString(width/2, height-360, f"Date: {datetime.now(timezone.utc).strftime('%d.%m.%Y')}")
    
    pdf.setFillColor(rl_colors.HexColor("#22C55E"))
    pdf.setFont("Helvetica-Bold", 20)
    pdf.drawCentredString(width/2, height-410, f"+{lesson.get('xpReward', 0)} XP earned")
    
    pdf.setStrokeColor(rl_colors.HexColor("#9B59F5"))
    pdf.line(width/2 - 100, 90, width/2 + 100, 90)
    pdf.setFillColor(rl_colors.HexColor("#4B4554"))
    pdf.setFont("Helvetica", 12)
    pdf.drawCentredString(width/2, 75, "Hashimjon Akademiyasi")
    
    pdf.showPage()
    pdf.save()
    
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return FastAPIResponse(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": 'inline; filename="certificate.pdf"'}
    )

# ============ STREAMING AI ============
from fastapi.responses import StreamingResponse
import json as json_lib

@api_router.post("/ai/tutor-stream")
async def ai_tutor_stream(req: AITutorRequest, current_user: dict = Depends(get_current_user)):
    session_id = req.sessionId or str(uuid.uuid4())
    
    system_msg = (
        "Sen Hashimjon - o'zbek bolalar uchun do'st va aqlli o'qituvchisan. "
        "Tushuntirishlaringni juda sodda, qiziqarli va do'stona qilib bering. "
        "Misollar keltirib tushuntiring. O'zbek tilida javob bering."
    )
    
    await db.ai_chat_history.insert_one({
        "id": str(uuid.uuid4()),
        "userId": current_user["id"],
        "sessionId": session_id,
        "role": "user",
        "content": req.message,
        "createdAt": datetime.now(timezone.utc).isoformat()
    })
    
    async def event_generator():
        try:
            history = await db.ai_chat_history.find(
                {"userId": current_user["id"], "sessionId": session_id},
                {"_id": 0}
            ).sort("createdAt", 1).limit(20).to_list(20)
            
            messages = [{"role": "system", "content": system_msg}]
            for msg in history[-10:]:
                messages.append({"role": msg["role"], "content": msg["content"]})
            
            yield f"data: {json_lib.dumps({'sessionId': session_id, 'type': 'start'})}\n\n"
            
            stream = await kimi_client.chat.completions.create(
                model=KIMI_MODEL,
                messages=messages,
                temperature=1,
                stream=True
            )
            
            full_text = ""
            async for chunk in stream:
                delta = chunk.choices[0].delta.content if chunk.choices else None
                if delta:
                    full_text += delta
                    yield f"data: {json_lib.dumps({'type': 'token', 'content': delta})}\n\n"
            
            await db.ai_chat_history.insert_one({
                "id": str(uuid.uuid4()),
                "userId": current_user["id"],
                "sessionId": session_id,
                "role": "assistant",
                "content": full_text,
                "createdAt": datetime.now(timezone.utc).isoformat()
            })
            
            yield f"data: {json_lib.dumps({'type': 'done'})}\n\n"
        except Exception as e:
            yield f"data: {json_lib.dumps({'type': 'error', 'message': str(e)})}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no", "Connection": "keep-alive"}
    )

# ============ ADMIN ENDPOINTS ============
@api_router.get("/admin/users")
async def admin_list_users(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    users = await db.users.find({}, {"password_hash": 0}).to_list(1000)
    for u in users:
        u["id"] = str(u.pop("_id"))
    return users

@api_router.delete("/admin/users/{user_id}")
async def admin_delete_user(user_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = await db.users.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}

# Include router
app.include_router(api_router)

# ============ WEBSOCKET CHAT ============
class ConnectionManager:
    def __init__(self):
        self.active: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, ws: WebSocket, room_id: str):
        await ws.accept()
        if room_id not in self.active:
            self.active[room_id] = []
        self.active[room_id].append(ws)
    
    def disconnect(self, ws: WebSocket, room_id: str):
        if room_id in self.active:
            try:
                self.active[room_id].remove(ws)
            except ValueError:
                pass
            if not self.active[room_id]:
                del self.active[room_id]
    
    async def broadcast(self, room_id: str, message: dict):
        if room_id in self.active:
            for connection in list(self.active[room_id]):
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

manager = ConnectionManager()

@app.websocket("/api/ws/chat/{room_id}")
async def websocket_chat(websocket: WebSocket, room_id: str, token: str = Query(None)):
    # Verify token
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload["sub"]
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            await websocket.close(code=1008)
            return
    except Exception:
        await websocket.close(code=1008)
        return
    
    user_name = f"{user.get('firstName', '')} {user.get('lastName', '')}"
    await manager.connect(websocket, room_id)
    
    try:
        # Send recent history
        history = await db.chat_messages.find({"roomId": room_id}, {"_id": 0}).sort("createdAt", -1).limit(50).to_list(50)
        for msg in reversed(history):
            await websocket.send_json({"type": "history", **msg})
        
        # Notify others
        await manager.broadcast(room_id, {"type": "join", "user": user_name})
        
        while True:
            data = await websocket.receive_json()
            content = data.get("content", "").strip()
            if not content:
                continue
            
            message = {
                "id": str(uuid.uuid4()),
                "roomId": room_id,
                "userId": user_id,
                "userName": user_name,
                "content": content,
                "createdAt": datetime.now(timezone.utc).isoformat()
            }
            await db.chat_messages.insert_one(message.copy())
            message.pop("_id", None)
            await manager.broadcast(room_id, {"type": "message", **message})
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
        await manager.broadcast(room_id, {"type": "leave", "user": user_name})
    except Exception as e:
        logging.error(f"WS error: {e}")
        manager.disconnect(websocket, room_id)

# CORS - Allow frontend + localhost for dev
cors_origins = [
    os.environ.get("FRONTEND_URL", "http://localhost:3000"),
    "http://localhost:3000"
]
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
