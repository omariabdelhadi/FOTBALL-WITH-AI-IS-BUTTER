import matplotlib.pyplot as plt
import numpy as np
import pickle

# Charger le modèle
with open("../models/lineup_model.pkl", "rb") as f:
    model = pickle.load(f)

feature_names = [
    "match_importance", "recent_form", "anomaly_z",
    "minutes", "performance_score", "fatigue_index",
    "defensive_impact", "rating", "pass_accuracy",
    "duels_won_pct", "goals", "assists", "appearances",
    "is_forward", "is_midfielder", "is_defender", "is_goalkeeper"
]

importances = model.feature_importances_
indices     = np.argsort(importances)

fig, ax = plt.subplots(figsize=(10, 7))
fig.patch.set_facecolor('#0d1117')
ax.set_facecolor('#111827')

bars = ax.barh(
    [feature_names[i] for i in indices],
    importances[indices],
    color='#00d4aa',
    edgecolor='none'
)

ax.set_xlabel("Importance relative", color='white')
ax.set_title("Importance des features -- Random Forest",
             color='white', fontsize=13, pad=15)
ax.tick_params(colors='white')
ax.spines['bottom'].set_color('#374151')
ax.spines['left'].set_color('#374151')
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)

plt.tight_layout()
plt.savefig("../figures/feature_importance.png",
            dpi=150, facecolor='#0d1117')
plt.close()
print("[SAUVEGARDÉ] ../figures/feature_importance.png")
