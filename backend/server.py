from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Header, Query, File, UploadFile, Depends
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
        "role": req.role if req.role in ["student", "teacher"] else "student",
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
    name: str,
    nameUz: str,
    nameRu: str,
    islandId: str,
    icon: str,
    color: str,
    order: int,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    subject = {
        "id": str(uuid.uuid4()),
        "name": name,
        "nameUz": nameUz,
        "nameRu": nameRu,
        "islandId": islandId,
        "icon": icon,
        "color": color,
        "order": order
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
    title: str,
    titleUz: str,
    titleRu: str,
    description: str,
    subjectId: str,
    content: str,
    order: int,
    xpReward: int = 10,
    videoUrl: Optional[str] = None,
    isPublished: bool = False,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    lesson = {
        "id": str(uuid.uuid4()),
        "title": title,
        "titleUz": titleUz,
        "titleRu": titleRu,
        "description": description,
        "subjectId": subjectId,
        "videoUrl": videoUrl,
        "content": content,
        "order": order,
        "xpReward": xpReward,
        "isPublished": isPublished,
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
    progress: int,
    score: Optional[int] = None,
    current_user: dict = Depends(get_current_user)
):
    lesson = await db.lessons.find_one({"id": lesson_id})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    completed = progress >= 100
    update_data = {
        "userId": current_user["id"],
        "lessonId": lesson_id,
        "progress": progress,
        "completed": completed,
        "score": score,
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

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[os.environ.get("FRONTEND_URL", "http://localhost:3000")],
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
