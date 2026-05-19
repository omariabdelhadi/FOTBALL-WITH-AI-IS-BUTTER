# backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.lineup      import router as lineup_router
from routers.performance import router as performance_router
from routers.simulation  import router as simulation_router
from routers.anomaly     import router as anomaly_router
from routers.transfer    import router as transfer_router
from routers.tactical    import router as tactical_router
from routers.pass_network import router as pass_network_router
from routers.ranking import router as ranking_router
from routers.clustering import router as clustering_router
from routers.comparison import router as comparison_router
from routers.teams import router as teams_router

app = FastAPI(
    title="SmartLineup API",
    description="API pour la prédiction des performances et compositions en football",
    version="1.0.0"
)

# ─────────────────────────────────────────
# CORS — permet à React de communiquer avec FastAPI
# ─────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # adresse React
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"]
)

# ─────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────

app.include_router(lineup_router,      prefix="/api/lineup",      tags=["Lineup"])
app.include_router(performance_router, prefix="/api/performance", tags=["Performance"])
app.include_router(simulation_router,  prefix="/api/simulation",  tags=["Simulation"])
app.include_router(anomaly_router,     prefix="/api/anomaly",     tags=["Anomalie"])
app.include_router(transfer_router,    prefix="/api/transfer",    tags=["Transfert"])
app.include_router(clustering_router, prefix="/api/clustering", tags=["Clustering"])
app.include_router(tactical_router,    prefix="/api/tactical",    tags=["Tactique"])
app.include_router(pass_network_router,    prefix="/api/pass_network",    tags=["Pass Network"])
app.include_router(comparison_router, prefix="/api/comparison", tags=["Comparaison"])
app.include_router(ranking_router, prefix="/api/ranking", tags=["Classement"])
app.include_router(teams_router, prefix="/api/teams", tags=["Teams"])


# ─────────────────────────────────────────
# ROUTE DE BASE
# ─────────────────────────────────────────

@app.get("/")
def root():
    return {
        "message": "SmartLineup API",
        "version": "1.0.0",
        "status":  "running",
        "docs":    "http://localhost:8000/docs"
    }


@app.get("/api/health")
def health():
    return {"status": "ok"}