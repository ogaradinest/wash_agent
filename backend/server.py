from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============ MODELS ============

class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str

class Contact(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    status: str = "pending"  # pending, called, scheduled
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CallLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    contact_id: str
    contact_name: str
    contact_phone: str
    status: str = "completed"  # in_progress, completed, failed
    duration_seconds: int = 0
    transcript: List[dict] = []
    timeline_response: Optional[str] = None
    summary: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ScheduledEvent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    contact_id: str
    contact_name: str
    event_type: str = "follow_up"
    title: str
    description: str = ""
    scheduled_date: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ScheduleCreate(BaseModel):
    contact_id: str
    title: str
    description: Optional[str] = ""
    scheduled_date: datetime

class InitiateCallRequest(BaseModel):
    contact_id: str

class LogCallRequest(BaseModel):
    contact_id: str
    transcript: List[dict]
    duration_seconds: Optional[int] = 0

# ============ MOCK AI CONVERSATION ============

def generate_mock_ai_conversation(contact_name: str, contact_phone: str) -> dict:
    """Generate a realistic mock AI phone conversation"""
    
    timeline_responses = [
        "As soon as possible, maybe this week",
        "Within the next 2 weeks",
        "Next month would work best",
        "I'm just gathering quotes for now",
        "Looking to start a regular service"
    ]
    
    selected_timeline = random.choice(timeline_responses)
    
    transcript = [
        {
            "speaker": "AI Agent",
            "message": f"Hello! This is Crystal Clear Windows calling. Am I speaking with {contact_name}?",
            "timestamp": "00:00"
        },
        {
            "speaker": "Customer",
            "message": "Yes, this is them.",
            "timestamp": "00:03"
        },
        {
            "speaker": "AI Agent",
            "message": f"Great! I'm calling to confirm your recent inquiry about our window washing services. I have your phone number as {contact_phone[-4:].rjust(len(contact_phone), '*')}. Is that correct?",
            "timestamp": "00:06"
        },
        {
            "speaker": "Customer",
            "message": "Yes, that's correct.",
            "timestamp": "00:12"
        },
        {
            "speaker": "AI Agent",
            "message": "Perfect! Thank you for your interest in our services. We offer professional window cleaning for both residential and commercial properties. Could you tell me what timeline you're looking at for getting your windows cleaned?",
            "timestamp": "00:15"
        },
        {
            "speaker": "Customer",
            "message": selected_timeline,
            "timestamp": "00:22"
        },
        {
            "speaker": "AI Agent",
            "message": "That sounds great! I've noted that down. One of our team members will follow up with you shortly to discuss specific details and provide a quote. Is there anything else you'd like to know about our services?",
            "timestamp": "00:28"
        },
        {
            "speaker": "Customer",
            "message": "No, that's all for now. Thank you!",
            "timestamp": "00:35"
        },
        {
            "speaker": "AI Agent",
            "message": "Wonderful! Thank you for choosing Crystal Clear Windows. Have a great day!",
            "timestamp": "00:38"
        }
    ]
    
    duration = random.randint(35, 60)
    
    summary = f"Successfully contacted {contact_name}. Phone number confirmed. Customer timeline: {selected_timeline}. Follow-up scheduled."
    
    return {
        "transcript": transcript,
        "timeline_response": selected_timeline,
        "duration_seconds": duration,
        "summary": summary
    }

# ============ ROUTES ============

@api_router.get("/")
async def root():
    return {"message": "Crystal Clear Windows AI Agent API"}

# Contact endpoints
@api_router.post("/contacts", response_model=Contact)
async def create_contact(input: ContactCreate):
    """Create a new contact from the contact form"""
    contact = Contact(
        name=input.name,
        email=input.email,
        phone=input.phone
    )
    
    doc = contact.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.contacts.insert_one(doc)
    logger.info(f"New contact created: {contact.name}")
    return contact

@api_router.get("/contacts", response_model=List[Contact])
async def get_contacts():
    """Get all contacts"""
    contacts = await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for contact in contacts:
        if isinstance(contact.get('created_at'), str):
            contact['created_at'] = datetime.fromisoformat(contact['created_at'])
    
    return contacts

@api_router.get("/contacts/{contact_id}", response_model=Contact)
async def get_contact(contact_id: str):
    """Get a specific contact"""
    contact = await db.contacts.find_one({"id": contact_id}, {"_id": 0})
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    if isinstance(contact.get('created_at'), str):
        contact['created_at'] = datetime.fromisoformat(contact['created_at'])
    
    return contact

# Call endpoints (MOCKED)
@api_router.post("/calls/initiate", response_model=CallLog)
async def initiate_call(request: InitiateCallRequest):
    """Initiate an AI call to a contact (MOCKED)"""
    contact = await db.contacts.find_one({"id": request.contact_id}, {"_id": 0})
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    # Generate mock conversation
    conversation = generate_mock_ai_conversation(contact['name'], contact['phone'])
    
    call_log = CallLog(
        contact_id=request.contact_id,
        contact_name=contact['name'],
        contact_phone=contact['phone'],
        status="completed",
        duration_seconds=conversation['duration_seconds'],
        transcript=conversation['transcript'],
        timeline_response=conversation['timeline_response'],
        summary=conversation['summary']
    )
    
    doc = call_log.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.call_logs.insert_one(doc)
    
    # Update contact status
    await db.contacts.update_one(
        {"id": request.contact_id},
        {"$set": {"status": "called"}}
    )
    
    # Auto-schedule follow-up (MOCKED)
    follow_up_date = datetime.now(timezone.utc) + timedelta(days=random.randint(1, 3))
    scheduled_event = ScheduledEvent(
        contact_id=request.contact_id,
        contact_name=contact['name'],
        title=f"Follow-up call with {contact['name']}",
        description=f"Timeline: {conversation['timeline_response']}",
        scheduled_date=follow_up_date
    )
    
    event_doc = scheduled_event.model_dump()
    event_doc['created_at'] = event_doc['created_at'].isoformat()
    event_doc['scheduled_date'] = event_doc['scheduled_date'].isoformat()
    
    await db.scheduled_events.insert_one(event_doc)
    
    # Update contact status to scheduled
    await db.contacts.update_one(
        {"id": request.contact_id},
        {"$set": {"status": "scheduled"}}
    )
    
    logger.info(f"Call completed for contact: {contact['name']}")
    return call_log

@api_router.get("/calls", response_model=List[CallLog])
async def get_call_logs():
    """Get all call logs"""
    calls = await db.call_logs.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for call in calls:
        if isinstance(call.get('created_at'), str):
            call['created_at'] = datetime.fromisoformat(call['created_at'])
    
    return calls

@api_router.get("/calls/{call_id}", response_model=CallLog)
async def get_call_log(call_id: str):
    """Get a specific call log"""
    call = await db.call_logs.find_one({"id": call_id}, {"_id": 0})
    if not call:
        raise HTTPException(status_code=404, detail="Call log not found")
    
    if isinstance(call.get('created_at'), str):
        call['created_at'] = datetime.fromisoformat(call['created_at'])
    
    return call

# Schedule endpoints (MOCKED Google Calendar)
@api_router.post("/schedule", response_model=ScheduledEvent)
async def create_scheduled_event(input: ScheduleCreate):
    """Create a scheduled event (MOCKED Google Calendar)"""
    contact = await db.contacts.find_one({"id": input.contact_id}, {"_id": 0})
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    event = ScheduledEvent(
        contact_id=input.contact_id,
        contact_name=contact['name'],
        title=input.title,
        description=input.description or "",
        scheduled_date=input.scheduled_date
    )
    
    doc = event.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['scheduled_date'] = doc['scheduled_date'].isoformat()
    
    await db.scheduled_events.insert_one(doc)
    logger.info(f"Event scheduled for contact: {contact['name']}")
    return event

@api_router.get("/schedule", response_model=List[ScheduledEvent])
async def get_scheduled_events():
    """Get all scheduled events"""
    events = await db.scheduled_events.find({}, {"_id": 0}).sort("scheduled_date", 1).to_list(1000)
    
    for event in events:
        if isinstance(event.get('created_at'), str):
            event['created_at'] = datetime.fromisoformat(event['created_at'])
        if isinstance(event.get('scheduled_date'), str):
            event['scheduled_date'] = datetime.fromisoformat(event['scheduled_date'])
    
    return events

# Dashboard stats
@api_router.get("/stats")
async def get_dashboard_stats():
    """Get dashboard statistics"""
    total_contacts = await db.contacts.count_documents({})
    total_calls = await db.call_logs.count_documents({})
    pending_contacts = await db.contacts.count_documents({"status": "pending"})
    scheduled_followups = await db.scheduled_events.count_documents({})
    
    return {
        "total_contacts": total_contacts,
        "total_calls": total_calls,
        "pending_contacts": pending_contacts,
        "scheduled_followups": scheduled_followups,
        "conversion_rate": round((total_calls / total_contacts * 100) if total_contacts > 0 else 0, 1)
    }

# Mock Google Sheets logging endpoint
@api_router.post("/sheets/log")
async def log_to_sheets(data: dict):
    """Log data to Google Sheets (MOCKED)"""
    logger.info(f"[MOCKED] Logging to Google Sheets: {data}")
    return {
        "status": "success",
        "message": "Data logged to Google Sheets (MOCKED)",
        "spreadsheet_id": "mock_spreadsheet_123",
        "row": random.randint(2, 100)
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
