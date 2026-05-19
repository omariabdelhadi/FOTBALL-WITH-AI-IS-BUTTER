# backend/routers/ranking.py

from fastapi import APIRouter, HTTPException
from pymongo import MongoClient
import pandas as pd
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), "../.."))
from dotenv import load_dotenv
load_dotenv()

router    = APIRouter()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")


def load_players():
    client = MongoClient(MONGO_URI)
    db     = client["smartlineup"]
    return pd.DataFrame(list(db["players"].find({}, {"_id": 0})))


@router.get("/top")
def get_top_players(
    position: str  = None,
    league:   str  = None,
    metric:   str  = "rating",
    top_n:    int  = 10
):
    """
    Retourne les meilleurs joueurs selon une métrique.

    Exemple : GET /api/ranking/top?position=Forward&league=Ligue 1&metric=goals
    """
    try:
        df = load_players()
        df = df[df["rating"] > 0].copy()

        if position:
            df = df[df["position"] == position]
        if league:
            df = df[df["league"] == league]

        valid_metrics = [
            "rating", "goals", "assists", "pass_accuracy",
            "defensive_impact", "performance_score", "minutes"
        ]

        if metric not in valid_metrics:
            metric = "rating"

        df = df.nlargest(top_n, metric)

        return {
            "position": position or "Toutes",
            "league":   league   or "Toutes",
            "metric":   metric,
            "players": [
                {
                    "rank":              i + 1,
                    "name":              row["player_name"],
                    "team":              row["team"],
                    "league":            row["league"],
                    "position":          row["position"],
                    "age":               int(row.get("age", 0) or 0),
                    "rating":            round(float(row["rating"]), 3),
                    "goals":             int(row.get("goals", 0) or 0),
                    "assists":           int(row.get("assists", 0) or 0),
                    "pass_accuracy":     float(row.get("pass_accuracy", 0) or 0),
                    "defensive_impact":  round(float(row.get("defensive_impact", 0) or 0), 2),
                    "performance_score": round(float(row.get("performance_score", 0) or 0), 4),
                    "minutes":           int(row.get("minutes", 0) or 0),
                }
                for i, (_, row) in enumerate(df.iterrows())
            ]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/leagues")
def get_leagues():
    df = load_players()
    return {"leagues": sorted(df["league"].unique().tolist())}


@router.get("/metrics")
def get_metrics():
    return {
        "metrics": [
            { "key": "rating",            "label": "Rating" },
            { "key": "goals",             "label": "Buts" },
            { "key": "assists",           "label": "Passes Décisives" },
            { "key": "pass_accuracy",     "label": "Précision Passes" },
            { "key": "defensive_impact",  "label": "Impact Défensif" },
            { "key": "performance_score", "label": "Performance Score" },
            { "key": "minutes",           "label": "Minutes Jouées" },
        ]
    }

@router.get("/best_by_position")
def best_by_position():
    """
    Retourne le meilleur joueur par position dans toutes les ligues.
    """
    try:
        df = load_players()
        df = df[df["rating"] > 0].copy()

        positions = ["Goalkeeper", "Defender", "Midfielder", "Forward"]
        result    = []

        for pos in positions:
            sub = df[df["position"] == pos]
            if sub.empty:
                continue
            best = sub.nlargest(1, "rating").iloc[0]
            result.append({
                "position":          pos,
                "name":              best["player_name"],
                "team":              best["team"],
                "league":            best["league"],
                "age":               int(best.get("age", 0) or 0),
                "rating":            round(float(best["rating"]), 3),
                "goals":             int(best.get("goals", 0) or 0),
                "assists":           int(best.get("assists", 0) or 0),
                "pass_accuracy":     float(best.get("pass_accuracy", 0) or 0),
                "defensive_impact":  round(float(best.get("defensive_impact", 0) or 0), 2),
                "performance_score": round(float(best.get("performance_score", 0) or 0), 4),
                "minutes":           int(best.get("minutes", 0) or 0),
            })

        return {"best_by_position": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))