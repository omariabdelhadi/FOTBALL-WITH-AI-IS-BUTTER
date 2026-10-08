# SmartLineup

Application web de prédiction des **11 titulaires probables** et du **résultat des matchs** de football, à partir de données historiques de performances de joueurs.

## Objectif

Analyser les performances passées des footballeurs pour :

- prédire la composition probable d'une équipe ;
- estimer les performances individuelles attendues de chaque joueur ;
- prédire le résultat d'un match.

## Technologies

| Domaine | Technologies |
|---|---|
| Backend | Python, FastAPI |
| Base de données | MongoDB |
| Frontend | React |
| Traitement des données | Pandas, NumPy |
| Machine Learning | Scikit-learn (Random Forest, régression linéaire), simulation de Monte Carlo |
| Source des données | API-Football |

## Structure du projet

```
smartlineup/
├── backend/    API FastAPI, modèles de prédiction (point d'entrée : app/main.py)
└── frontend/   Interface React
```

## Aperçu


<img width="1919" height="894" alt="image" src="https://github.com/user-attachments/assets/6ccb2967-c814-4022-89f9-e60e0d17375a" />

<img width="1919" height="942" alt="image" src="https://github.com/user-attachments/assets/10f53f55-5660-433c-9cfa-fb61b63d857f" />


## Lancer le projet

### Prérequis

- Python 3
- Node.js et npm
- MongoDB installé et démarré

### 1. Récupérer le projet

```bash
git clone https://github.com/omariabdelhadi/smartlineup.git
cd smartlineup
```

### 2. Démarrer le backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Sous Linux ou macOS, remplace `venv\Scripts\activate` par `source venv/bin/activate`.

L'API est disponible sur `http://localhost:8000`, et sa documentation interactive sur `http://localhost:8000/docs`.

### 3. Démarrer le frontend

Dans un second terminal :

```bash
cd frontend
npm install
npm run dev
```

Ouvre l'adresse affichée dans le terminal.
