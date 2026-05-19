// frontend/src/api/api.js

const BASE_URL = "http://localhost:8000/api";

export const api = {

  // ── LINEUP ──────────────────────────────
  getLeagues: () =>
    fetch(`${BASE_URL}/lineup/leagues`).then(r => r.json()),

  getTeams: (league) =>
    fetch(`${BASE_URL}/lineup/teams?league=${encodeURIComponent(league)}`).then(r => r.json()),

  predictLineup: (team) =>
    fetch(`${BASE_URL}/lineup/predict?team=${encodeURIComponent(team)}`).then(r => r.json()),

  // ── PERFORMANCE ─────────────────────────
  getPlayers: (league, team) =>
    fetch(`${BASE_URL}/performance/players?league=${encodeURIComponent(league)}&team=${encodeURIComponent(team)}`).then(r => r.json()),

  predictPerformance: (playerName) =>
    fetch(`${BASE_URL}/performance/predict?player_name=${encodeURIComponent(playerName)}`).then(r => r.json()),

  // ── SIMULATION ──────────────────────────
  getSimulationTeams: () =>
    fetch(`${BASE_URL}/simulation/teams`).then(r => r.json()),

  simulateMatch: (team, opponent, strength, home, nSims) =>
    fetch(`${BASE_URL}/simulation/predict?team=${encodeURIComponent(team)}&opponent=${encodeURIComponent(opponent)}&opponent_strength=${strength}&home=${home}&n_simulations=${nSims}`).then(r => r.json()),

  // ── ANOMALY ─────────────────────────────
  detectAnomalies: (league, team) =>
    fetch(`${BASE_URL}/anomaly/detect?league=${encodeURIComponent(league)}&team=${encodeURIComponent(team)}`).then(r => r.json()),

  // ── TRANSFER ────────────────────────────
  getSimilarPlayers: (playerName, topN = 5) =>
    fetch(`${BASE_URL}/transfer/similar?player_name=${encodeURIComponent(playerName)}&top_n=${topN}`).then(r => r.json()),

  recommendTransfer: (position, minRating, budget, league) =>
    fetch(`${BASE_URL}/transfer/recommend?position=${encodeURIComponent(position)}&min_rating=${minRating}&budget=${budget}&league=${encodeURIComponent(league)}`).then(r => r.json()),

  // ── TACTICAL ────────────────────────────
  getFormations: () =>
    fetch(`${BASE_URL}/tactical/formations`).then(r => r.json()),

  analyzeTactical: (team, formation) =>
    fetch(`${BASE_URL}/tactical/analyze?team=${encodeURIComponent(team)}&formation=${encodeURIComponent(formation)}`).then(r => r.json()),
  // ── PASS NETWORK ────────────────────────────

  analyzePassNetwork: (team) =>
    fetch(`${BASE_URL}/pass_network/analyze?team=${encodeURIComponent(team)}`).then(r=>r.json()),
  // ── COMPARISON ───────────────────────────
  getComparisonPlayers: (league, team) =>
    fetch(`${BASE_URL}/comparison/players?league=${encodeURIComponent(league)}&team=${encodeURIComponent(team)}`).then(r => r.json()),

  comparePlayers: (player1, player2) =>
    fetch(`${BASE_URL}/comparison/compare?player1=${encodeURIComponent(player1)}&player2=${encodeURIComponent(player2)}`).then(r => r.json()),
  // ── RANKING ─────────────────────────────
  getTopPlayers: (position, league, metric, topN) =>
    fetch(`${BASE_URL}/ranking/top?position=${encodeURIComponent(position)}&league=${encodeURIComponent(league)}&metric=${encodeURIComponent(metric)}&top_n=${topN}`).then(r => r.json()),

  getRankingMetrics: () =>
    fetch(`${BASE_URL}/ranking/metrics`).then(r => r.json()),
  // ── CLUSTERING ───────────────────────────
  detectTalents: (league, position, maxAge) =>
    fetch(`${BASE_URL}/clustering/talents?league=${encodeURIComponent(league)}&position=${encodeURIComponent(position)}&max_age=${maxAge}`).then(r => r.json()),

  getClusters: (league, position) =>
    fetch(`${BASE_URL}/clustering/clusters?league=${encodeURIComponent(league)}&position=${encodeURIComponent(position)}`).then(r => r.json()),
  getBestProgression: () =>
    fetch(`${BASE_URL}/performance/best_progression`).then(r => r.json()),
  
  getBestTeamAnomalies: () =>
    fetch(`${BASE_URL}/anomaly/best_team`).then(r => r.json()),
  getBestByPosition: () =>
    fetch(`${BASE_URL}/ranking/best_by_position`).then(r => r.json()),
  getLineupStats: () =>
    fetch(`${BASE_URL}/lineup/stats`).then(r => r.json()),
  getFeaturedMatch: () =>
    fetch(`${BASE_URL}/simulation/featured`).then(r => r.json()),
  getPopularFormations: () =>
    fetch(`${BASE_URL}/tactical/popular_formations`).then(r => r.json()),
};