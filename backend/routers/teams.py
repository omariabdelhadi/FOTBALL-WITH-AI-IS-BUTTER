# backend/routers/teams.py

from fastapi import APIRouter, HTTPException
from pymongo import MongoClient
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), "../.."))
from dotenv import load_dotenv
load_dotenv()

router    = APIRouter()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")


@router.get("/logos")
def get_all_logos():
    """Retourne tous les logos des équipes"""
    try:
        client = MongoClient(MONGO_URI)
        db     = client["smartlineup"]
        logos  = list(db["teams_logos"].find({}, {"_id": 0}))
        return {"logos": logos}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/logo")
def get_logo(team_name: str):
    """Retourne le logo d'une équipe spécifique"""
    try:
        client = MongoClient(MONGO_URI)
        db     = client["smartlineup"]

        # Cherche par nom exact ou approximatif
        team = db["teams_logos"].find_one(
            {"team_name": {"$regex": team_name, "$options": "i"}},
            {"_id": 0}
        )

        if not team:
            return {"logo": None, "team_name": team_name}

        return {
            "team_id":   team["team_id"],
            "team_name": team["team_name"],
            "logo":      team["logo"],
            "league":    team["league"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))