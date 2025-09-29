from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/generate-questions")
async def generate_questions(request: Request):
    data = await request.json()
    category = data.get("category", "general").lower()

    questions = []
    if "laptop" in category:
        questions = [
            "What is the primary use (gaming, work, etc.)?",
            "How important is battery life for you?",
            "Do you prefer lightweight or performance models?"
        ]
    elif "phone" in category:
        questions = [
            "Do you need a high-end camera?",
            "What is your preferred screen size?",
            "Do you prefer Android or iOS?"
        ]
    else:
        questions = [
            "What are the key features you're looking for?",
            "What is your budget range?",
            "Do you value brand reputation highly?"
        ]

    return {"category": category, "questions": questions}

@app.post("/transparency-score")
async def transparency_score(request: Request):
    data = await request.json()
    description = data.get("description", "")
    ai_answers = data.get("aiAnswers", {})

    score = 50
    keywords = ["eco", "recycle", "sustainable", "warranty", "recyclable", "green", "environment"]
    for kw in keywords:
        if kw.lower() in description.lower():
            score += 10

    for ans in ai_answers.values():
        if len(ans.split()) > 3:
            score += 5

    if score > 100:
        score = 100

    return {"transparency_score": score}

@app.get("/")
async def root():
    return {"message": "AI/ML microservice is running!"}
