import React, { useEffect, useState } from 'react';
import TeamLogo from '../components/TeamLogo';
import { api } from '../api/api';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './Performance.css';

function Performance() {
  const [leagues, setLeagues]         = useState([]);
  const [teams, setTeams]             = useState([]);
  const [players, setPlayers]         = useState([]);
  const [selectedLeague, setLeague]   = useState('');
  const [selectedTeam, setTeam]       = useState('');
  const [selectedPlayer, setPlayer]   = useState('');
  const [result, setResult]           = useState(null);
  const [resultTeam, setResultTeam]   = useState('');
  const [bestProg, setBestProg]       = useState(null);
  const [loading, setLoading]         = useState(false);
  const [loadingBest, setLoadingBest] = useState(true);
  const [error, setError]             = useState('');

  useEffect(() => {
    api.getBestProgression()
      .then(data => { setBestProg(data); setLoadingBest(false); })
      .catch(() => setLoadingBest(false));
  }, []);

  useEffect(() => {
    api.getLeagues().then(data => setLeagues(data.leagues || []));
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      api.getTeams(selectedLeague).then(data => {
        setTeams(data.teams || []);
        setTeam(''); setPlayers([]); setPlayer(''); setResult(null);
      });
    }
  }, [selectedLeague]);

  useEffect(() => {
    if (selectedLeague && selectedTeam) {
      api.getPlayers(selectedLeague, selectedTeam).then(data => {
        setPlayers(data.players || []);
        setPlayer(''); setResult(null);
      });
    }
  }, [selectedTeam]);

  const handlePredict = async () => {
    if (!selectedPlayer) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.predictPerformance(selectedPlayer);
      if (data.detail) throw new Error(data.detail);
      setResult(data);
      setResultTeam(selectedTeam);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  // Construire les données du Radar
  const buildRadarData = (data) => {
    const maxValues = {
      'Rating':           10,
      'Buts':             30,
      'Passes Déc.':      20,
      'Précision %':      100,
      'Minutes (×100)':   30,
    };

    const currentValues = {
      'Rating':           data.current_rating,
      'Buts':             data.goals,
      'Passes Déc.':      data.assists,
      'Précision %':      data.pass_accuracy,
      'Minutes (×100)':   data.minutes / 100,
    };

    // Pour le prédit on ajuste proportionnellement via l'écart de rating
    const ratio = data.predicted_rating / (data.current_rating || 1);
    const predictedValues = {
      'Rating':           data.predicted_rating,
      'Buts':             +(data.goals * ratio).toFixed(1),
      'Passes Déc.':      +(data.assists * ratio).toFixed(1),
      'Précision %':      Math.min(+(data.pass_accuracy * ratio).toFixed(1), 100),
      'Minutes (×100)':   +(data.minutes / 100 * ratio).toFixed(1),
    };

    return Object.keys(maxValues).map(key => ({
      metric:   key,
      Actuel:   Math.min(+(currentValues[key]  / maxValues[key] * 100).toFixed(1), 100),
      Prédit:   Math.min(+(predictedValues[key] / maxValues[key] * 100).toFixed(1), 100),
    }));
  };

  const TeamBanner = ({ teamName }) => (
    <div className="perf-team-banner">
      <TeamLogo teamName={teamName} size={64} showName={false} />
      <span className="perf-team-name">{teamName}</span>
    </div>
  );

  const PlayerRadar = ({ data }) => {
    const radarData = buildRadarData(data);
    return (
      <div className="perf-stats-card" style={{ marginTop: '16px' }}>
        <div className="perf-stats-header">
          <h2>Radar — Métriques Actuelles vs Prédites</h2>
        </div>
        <div style={{ padding: '16px' }} className="chart-responsive">
          <ResponsiveContainer width="100%" height={320} minWidth={320}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1f2937" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
              />
              <PolarRadiusAxis
                domain={[0, 100]}
                tick={{ fill: '#6b7280', fontSize: 9 }}
                tickCount={4}
              />
              <Radar
                name="Actuel"
                dataKey="Actuel"
                stroke="#60a5fa"
                fill="#60a5fa"
                fillOpacity={0.2}
              />
              <Radar
                name="Prédit"
                dataKey="Prédit"
                stroke="#00d4aa"
                fill="#00d4aa"
                fillOpacity={0.2}
              />
              <Legend
                wrapperStyle={{ color: '#9ca3af', fontSize: '0.85rem' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={v => `${v}%`}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const StatCard = ({ data, highlight }) => {
    const stats = [
      { label: 'Rating',           value: data.current_rating },
      { label: 'Buts',             value: data.goals },
      { label: 'Passes Décisives', value: data.assists },
      { label: 'Minutes',          value: data.minutes },
      { label: 'Précision Passes', value: `${data.pass_accuracy}%` },
    ];

    return (
      <div>
        <div className="perf-stats-card" style={
          highlight ? { border: '1px solid rgba(0,212,170,0.4)' } : {}
        }>
          <div className="perf-stats-header">
            <h2>{data.player}</h2>
            {highlight && (
              <span style={{
                fontSize: '0.78rem', color: '#00d4aa',
                fontWeight: 600, marginLeft: '10px'
              }}>
                MEILLEURE PROGRESSION
              </span>
            )}
          </div>
          <div className="perf-stats-meta">
            {data.team} — {data.league} — {data.position}
            {data.age ? ` — ${data.age} ans` : ''}
          </div>

          <div className="perf-metrics" style={{ padding: '16px' }}>
            {[
              { label: 'Rating Actuel',  value: data.current_rating,   color: '#fff'    },
              { label: 'Rating Prédit',  value: data.predicted_rating, color: '#00d4aa' },
              {
                label: 'Écart',
                value: data.ecart >= 0 ? `+${data.ecart}` : `${data.ecart}`,
                color: data.ecart >= 0 ? '#00d4aa' : '#ff4d4d'
              },
              {
                label: 'Tendance',
                value: data.ecart >= 0 ? '↑ En hausse' : '↓ En baisse',
                color: data.ecart >= 0 ? '#00d4aa' : '#ff4d4d'
              },
            ].map(m => (
              <div key={m.label} className="perf-metric">
                <div className="perf-metric-label">{m.label}</div>
                <div className="perf-metric-value" style={{ color: m.color }}>
                  {m.value}
                </div>
              </div>
            ))}
          </div>

          <table className="perf-table">
            <thead>
              <tr><th>Statistique</th><th>Valeur</th></tr>
            </thead>
            <tbody>
              {stats.map(s => (
                <tr key={s.label}>
                  <td>{s.label}</td>
                  <td className="perf-stat-value">{s.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Radar Chart */}
        <PlayerRadar data={data} />
      </div>
    );
  };

  return (
    <div>
      <div className="perf-header">
        <h1 className="perf-title">Prédiction de Performance</h1>
        <p className="perf-subtitle">Estimation du rating futur de chaque joueur</p>
      </div>

      {loadingBest && (
        <div style={{ color: '#6b7280', marginBottom: '24px' }}>
          Chargement de la meilleure progression...
        </div>
      )}

      {bestProg && !result && (
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            fontSize: '0.8rem', fontWeight: 600, color: '#00d4aa',
            textTransform: 'uppercase', letterSpacing: '0.5px',
            marginBottom: '12px'
          }}>
            🌟 Meilleure Progression du Moment
          </div>
          <TeamBanner teamName={bestProg.team} />
          <StatCard data={bestProg} highlight={true} />
        </div>
      )}

      <div className="perf-filters">
        <div className="perf-filters-title">Sélectionner un joueur</div>
        <div className="perf-filters-grid">
          <div className="perf-field">
            <label>Ligue</label>
            <select value={selectedLeague} onChange={e => setLeague(e.target.value)}>
              <option value="">Choisir une ligue</option>
              {leagues.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="perf-field">
            <label>Équipe</label>
            <select value={selectedTeam} onChange={e => setTeam(e.target.value)}
              disabled={!selectedLeague}>
              <option value="">Choisir une équipe</option>
              {teams.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="perf-field">
            <label>Joueur</label>
            <select value={selectedPlayer} onChange={e => setPlayer(e.target.value)}
              disabled={!selectedTeam}>
              <option value="">Choisir un joueur</option>
              {players.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <button className="perf-btn" onClick={handlePredict}
          disabled={!selectedPlayer || loading}>
          {loading ? 'Prédiction en cours...' : 'Prédire la Performance'}
        </button>
        {error && <div className="perf-error">{error}</div>}
      </div>

      {result && (
        <>
          <button
            className="perf-btn"
            style={{
              marginBottom: '16px',
              background: 'transparent',
              border: '1px solid rgba(0,212,170,0.4)',
              color: '#00d4aa',
            }}
            onClick={() => setResult(null)}
          >
            ← Meilleure Progression du Moment
          </button>
          <TeamBanner teamName={resultTeam} />
          <StatCard data={result} highlight={false} />
        </>
      )}
    </div>
  );
}

export default Performance;