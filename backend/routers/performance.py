# backend/routers/performance.py

from fastapi import APIRouter, HTTPException # type: ignore[import]
from pymongo import MongoClient # type: ignore[import]
import pandas as pd # type: ignore[import]
import pickle
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), "../.."))

from dotenv import load_dotenv # type: ignore[import]
load_dotenv()

router = APIRouter()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")


def load_players():
    client = MongoClient(MONGO_URI)
    db     = client["smartlineup"]
    return pd.DataFrame(list(db["players"].find({}, {"_id": 0})))


BASE_DIR = os.path.join(os.path.dirname(__file__), "..")

def load_model():
    with open(os.path.join(BASE_DIR, "models/performance_model.pkl"), "rb") as f:
        model = pickle.load(f)
    with open(os.path.join(BASE_DIR, "models/performance_scaler.pkl"), "rb") as f:
        scaler = pickle.load(f)
    return model, scaler


@router.get("/players")
def get_players(league: str = None, team: str = None):
    """Retourne la liste des joueurs filtrés"""
    df = load_players()
    df = df[df["rating"] > 0]

    if league:
        df = df[df["league"] == league]
    if team:
        df = df[df["team"] == team]

    players = sorted(df["player_name"].unique().tolist())
    return {"players": players}


@router.get("/predict")
def predict_performance(player_name: str):
    """
    Prédit le rating futur d'un joueur.

    Exemple : GET /api/performance/predict?player_name=Mbappé
    """
    try:
        df = load_players()
        df = df[df["rating"] > 0].copy()

        player = df[df["player_name"] == player_name]

        if player.empty:
            raise HTTPException(status_code=404,
                                detail=f"Joueur '{player_name}' introuvable")

        model, scaler = load_model()

        feature_cols = [
            "goals", "assists", "minutes", "appearances",
            "pass_accuracy", "duels_won_pct", "defensive_impact",
            "fatigue_index", "match_importance", "recent_form",
            "is_goalkeeper", "is_defender", "is_midfielder", "is_forward"
        ]

        df["is_goalkeeper"] = (df["position"] == "Goalkeeper").astype(int)
        df["is_defender"]   = (df["position"] == "Defender").astype(int)
        df["is_midfielder"] = (df["position"] == "Midfielder").astype(int)
        df["is_forward"]    = (df["position"].isin(["Forward", "Attacker"])).astype(int)

        for col in ["match_importance", "recent_form"]:
            if col not in df.columns:
                df[col] = 0.5

        row      = df[df["player_name"] == player_name].iloc[0]
        X        = df[df["player_name"] == player_name][feature_cols].fillna(0)
        X_scaled = scaler.transform(X)
        predicted = float(model.predict(X_scaled)[0])

        return {
            "player":          player_name,
            "team":            row["team"],
            "league":          row["league"],
            "position":        row["position"],
            "current_rating":  round(float(row["rating"]), 3),
            "predicted_rating": round(predicted, 3),
            "ecart":           round(predicted - float(row["rating"]), 3),
            "tendance":        "progression" if predicted >= float(row["rating"]) else "baisse",
            "goals":           int(row["goals"]),
            "assists":         int(row["assists"]),
            "minutes":         int(row["minutes"]),
            "pass_accuracy":   float(row["pass_accuracy"]),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/best_progression")
def best_progression():
    """
    Retourne le joueur avec la meilleure progression prédite
    parmi tous les joueurs de toutes les ligues.
    """
    try:
        df = load_players()
        df = df[df["rating"] > 0].copy()

        model, scaler = load_model()

        feature_cols = [
            "goals", "assists", "minutes", "appearances",
            "pass_accuracy", "duels_won_pct", "defensive_impact",
            "fatigue_index", "match_importance", "recent_form",
            "is_goalkeeper", "is_defender", "is_midfielder", "is_forward"
        ]

        df["is_goalkeeper"] = (df["position"] == "Goalkeeper").astype(int)
        df["is_defender"]   = (df["position"] == "Defender").astype(int)
        df["is_midfielder"] = (df["position"] == "Midfielder").astype(int)
        df["is_forward"]    = (df["position"].isin(["Forward","Attacker"])).astype(int)

        for col in ["match_importance", "recent_form"]:
            if col not in df.columns:
                df[col] = 0.5

        X        = df[feature_cols].fillna(0)
        X_scaled = scaler.transform(X)
        df["predicted_rating"] = model.predict(X_scaled)
        df["ecart"]            = df["predicted_rating"] - df["rating"]

        best = df.nlargest(1, "ecart").iloc[0]

        return {
            "player":           best["player_name"],
            "team":             best["team"],
            "league":           best["league"],
            "position":         best["position"],
            "age":              int(best.get("age", 0) or 0),
            "current_rating":   round(float(best["rating"]), 3),
            "predicted_rating": round(float(best["predicted_rating"]), 3),
            "ecart":            round(float(best["ecart"]), 3),
            "tendance":         "progression",
            "goals":            int(best.get("goals", 0) or 0),
            "assists":          int(best.get("assists", 0) or 0),
            "minutes":          int(best.get("minutes", 0) or 0),
            "pass_accuracy":    float(best.get("pass_accuracy", 0) or 0),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))