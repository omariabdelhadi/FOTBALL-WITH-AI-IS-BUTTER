# backend/routers/clustering.py

from fastapi import APIRouter, HTTPException
from pymongo import MongoClient
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
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


@router.get("/talents")
def detect_talents(
    league:   str = None,
    position: str = None,
    max_age:  int = 23
):
    """
    Détecte les jeunes talents cachés :
    joueurs jeunes avec un performance_score élevé
    mais un rating encore sous-évalué.

    Exemple : GET /api/clustering/talents?league=Ligue 1&max_age=23
    """
    try:
        df = load_players()
        df = df[df["rating"] > 0].copy()

        if league:
            df = df[df["league"] == league]
        if position:
            df = df[df["position"] == position]

        # Filtrer par âge
        df = df[df["age"] <= max_age].copy()

        if df.empty:
            return {"talents": [], "message": "Aucun joueur trouvé"}

        # Features pour clustering
        features = [
            "rating", "performance_score", "goals",
            "assists", "pass_accuracy", "minutes"
        ]
        df_feat = df[features].fillna(0)

        # Normaliser
        scaler   = StandardScaler()
        X_scaled = scaler.fit_transform(df_feat)

        # K-Means avec 3 clusters
        n_clusters = min(3, len(df))
        kmeans     = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        df["cluster"] = kmeans.fit_predict(X_scaled)

        # Identifier le cluster des talents
        # (cluster avec le plus haut performance_score moyen)
        cluster_scores = df.groupby("cluster")["performance_score"].mean()
        talent_cluster = cluster_scores.idxmax()

        df["is_talent"] = (df["cluster"] == talent_cluster).astype(int)

        # Calculer le score de talent
        # talent_score = performance_score élevé + rating encore bas = sous-évalué
        df["talent_score"] = (
            df["performance_score"] * 2 -
            df["rating"] / 10
        ).round(4)

        # Trier par talent_score
        talents = df[df["is_talent"] == 1]\
            .sort_values("talent_score", ascending=False)\
            .head(20)

        # Labels des clusters
        cluster_labels = {}
        for c in range(n_clusters):
            avg_score = cluster_scores[c]
            if c == talent_cluster:
                cluster_labels[c] = "Talent Prometteur"
            elif avg_score == cluster_scores.min():
                cluster_labels[c] = "En Développement"
            else:
                cluster_labels[c] = "Confirmé"

        return {
            "league":     league   or "Toutes",
            "position":   position or "Toutes",
            "max_age":    max_age,
            "total":      len(df),
            "n_talents":  len(talents),
            "talents": [
                {
                    "rank":              i + 1,
                    "name":              row["player_name"],
                    "team":              row["team"],
                    "league":            row["league"],
                    "position":          row["position"],
                    "age":               int(row["age"]),
                    "rating":            round(float(row["rating"]), 3),
                    "performance_score": round(float(row["performance_score"]), 4),
                    "talent_score":      round(float(row["talent_score"]), 4),
                    "goals":             int(row.get("goals", 0) or 0),
                    "assists":           int(row.get("assists", 0) or 0),
                    "minutes":           int(row.get("minutes", 0) or 0),
                    "cluster_label":     cluster_labels[int(row["cluster"])],
                }
                for i, (_, row) in enumerate(talents.iterrows())
            ]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/clusters")
def get_clusters(league: str = None, position: str = None):
    """
    Regroupe tous les joueurs en clusters selon leurs stats.
    Exemple : GET /api/clustering/clusters?league=Premier League
    """
    try:
        df = load_players()
        df = df[df["rating"] > 0].copy()

        if league:
            df = df[df["league"] == league]
        if position:
            df = df[df["position"] == position]

        if len(df) < 3:
            raise HTTPException(status_code=400,
                                detail="Pas assez de joueurs pour le clustering")

        features = [
            "rating", "performance_score", "goals",
            "assists", "pass_accuracy", "defensive_impact", "minutes"
        ]
        df_feat  = df[features].fillna(0)
        scaler   = StandardScaler()
        X_scaled = scaler.fit_transform(df_feat)

        n_clusters   = 4
        kmeans       = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        df["cluster"] = kmeans.fit_predict(X_scaled)

        # Nommer les clusters automatiquement
        cluster_info = []
        for c in range(n_clusters):
            sub      = df[df["cluster"] == c]
            avg_rat  = sub["rating"].mean()
            avg_perf = sub["performance_score"].mean()
            avg_age  = sub["age"].mean() if "age" in sub.columns else 0

            if avg_rat >= 7.5:
                label = "Elite"
                color = "#FFD700"
            elif avg_rat >= 7.2:
                label = "Confirmé"
                color = "#00d4aa"
            elif avg_rat >= 7.0:
                label = "Prometteur"
                color = "#60a5fa"
            else:
                label = "En Développement"
                color = "#f59e0b"

            cluster_info.append({
                "cluster":     c,
                "label":       label,
                "color":       color,
                "count":       len(sub),
                "avg_rating":  round(avg_rat, 3),
                "avg_perf":    round(avg_perf, 4),
                "avg_age":     round(avg_age, 1),
                "top_players": [
                    {
                        "name":     row["player_name"],
                        "team":     row["team"],
                        "rating":   round(float(row["rating"]), 3),
                        "position": row["position"]
                    }
                    for _, row in sub.nlargest(5, "rating").iterrows()
                ]
            })

        return {
            "league":   league   or "Toutes",
            "position": position or "Toutes",
            "total":    len(df),
            "clusters": sorted(cluster_info,
                               key=lambda x: x["avg_rating"], reverse=True)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))