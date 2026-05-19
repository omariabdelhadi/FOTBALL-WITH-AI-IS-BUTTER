import React, { useEffect, useState } from 'react';
import { api } from '../api/api';
import TeamLogo from '../components/TeamLogo';
import './Pages.css';

const TeamBanner = ({ teamName }) => (
  <div className="anomaly-team-banner">
    <TeamLogo teamName={teamName} size={64} showName={false} />
    <span className="anomaly-team-name">{teamName}</span>
  </div>
);

function Anomaly() {
  const [leagues, setLeagues]         = useState([]);
  const [teams, setTeams]             = useState([]);
  const [selectedLeague, setLeague]   = useState('');
  const [selectedTeam, setTeam]       = useState('');
  const [displayedTeam, setDisplayedTeam] = useState(''); // ← nouveau
  const [result, setResult]           = useState(null);
  const [defaultResult, setDefault]   = useState(null);
  const [loading, setLoading]         = useState(false);
  const [loadingDefault, setLoadingD] = useState(true);
  const [error, setError]             = useState('');
  const [filter, setFilter]           = useState('Tous');

  useEffect(() => {
    api.getLeagues().then(data => setLeagues(data.leagues || []));
    api.getBestTeamAnomalies()
      .then(data => {
        setDefault(data);
        setLoadingD(false);
      })
      .catch(() => setLoadingD(false));
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      api.getTeams(selectedLeague).then(data => {
        setTeams(data.teams || []);
        setTeam('');
        setResult(null);
        setFilter('Tous');
      });
    }
  }, [selectedLeague]);

  const handleDetect = async () => {
    if (!selectedLeague) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.detectAnomalies(selectedLeague, selectedTeam);
      console.log(data);
      if (data.detail) throw new Error(data.detail);
      setResult(data);
      setDisplayedTeam(selectedTeam); // ← on fige le logo ici seulement
      setFilter('Tous');
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const anomalyStyle = (type) => ({
    'Surperformance':   { color: '#00d4aa' },
    'Sous-performance': { color: '#ef4444' },
    'Attention':        { color: '#f59e0b' },
    'Normal':           { color: '#6b7280' },
  }[type] || { color: '#6b7280' });

  const tabs = ['Tous', 'Surperformance', 'Sous-performance', 'Attention', 'Normal'];

  const AnomalyResult = ({ data, isDefault }) => {
    const filtered = data.players.filter(p =>
      filter === 'Tous' ? true : p.anomaly_type === filter
    );

    return (
      <div>
        {isDefault && (
          <div style={{
            fontSize: '0.8rem', fontWeight: 600, color: '#00d4aa',
            textTransform: 'uppercase', letterSpacing: '0.5px',
            marginBottom: '12px'
          }}>
            🌟 Équipe avec le plus de Surperformances — {data.team} ({data.league})
          </div>
        )}

        <div className="page-metrics cols-5">
          {[
            { label: 'Total',          value: data.total,            color: '#fff'    },
            { label: 'Normaux',        value: data.normal,           color: '#6b7280' },
            { label: 'Surperformance', value: data.surperformance,   color: '#00d4aa' },
            { label: 'Sous-perf.',     value: data.sous_performance, color: '#ef4444' },
            { label: 'Attention',      value: data.attention,        color: '#f59e0b' },
          ].map(m => (
            <div key={m.label} className="page-metric">
              <div className="page-metric-label">{m.label}</div>
              <div className="page-metric-value"
                style={{ color: m.color, fontSize: '1.6rem' }}>
                {m.value}
              </div>
            </div>
          ))}
        </div>

        <div className="page-table-card">
          <div className="page-table-header">Joueurs</div>
          <div style={{ padding: '16px 20px 0' }}>
            <div className="page-filter-tabs">
              {tabs.map(t => (
                <button key={t}
                  className={`page-filter-tab ${filter === t ? 'active' : ''}`}
                  onClick={() => setFilter(t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="table-responsive">
            <table className="page-table">
              <thead>
                <tr>
                  <th>Joueur</th>
                  <th>Équipe</th>
                  <th>Position</th>
                  <th>Rating</th>
                  <th>Perf. Score</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td style={{ color: '#6b7280' }}><TeamLogo teamName={p.team} size={24} showName={true} /></td>
                    <td>{p.position}</td>
                    <td style={{ color: '#f59e0b', fontWeight: 600 }}>{p.rating}</td>
                    <td>{p.performance_score}</td>
                    <td>
                      <span style={{ fontWeight: 600, ...anomalyStyle(p.anomaly_type) }}>
                        {p.anomaly_type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-main-title">Détection d'Anomalies</h1>
        <p className="page-main-subtitle">
          Joueurs qui sur/sous-performent par rapport à la moyenne
        </p>
      </div>

      {loadingDefault && (
        <div style={{ color: '#6b7280', marginBottom: '24px' }}>
          Chargement...
        </div>
      )}

      {defaultResult && !result && (
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            fontSize: '0.8rem', fontWeight: 600, color: '#00d4aa',
            textTransform: 'uppercase', letterSpacing: '0.5px',
            marginBottom: '12px'
          }}>
            🌟 Équipe avec le plus de Surperformances — {defaultResult.team} ({defaultResult.league})
          </div>
          <TeamBanner teamName={defaultResult.team} />
          <AnomalyResult data={defaultResult} isDefault={true} />
        </div>
      )}

      <div className="page-filters">
        <div className="page-filters-title">Sélectionner une équipe</div>
        <div className="page-filters-grid cols-2">
          <div className="page-field">
            <label>Ligue</label>
            <select value={selectedLeague} onChange={e => setLeague(e.target.value)}>
              <option value="">Choisir une ligue</option>
              {leagues.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="page-field">
            <label>Équipe (optionnel)</label>
            <select value={selectedTeam} onChange={e => setTeam(e.target.value)}
              disabled={!selectedLeague}>
              <option value="">Toutes les équipes</option>
              {teams.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <button className="page-btn" onClick={handleDetect}
          disabled={!selectedLeague || loading}>
          {loading ? 'Détection en cours...' : 'Détecter les Anomalies'}
        </button>
        {error && <div className="page-error">{error}</div>}
      </div>

      {result && (
        <>
          <button
            className="page-btn"
            style={{
              marginBottom: '16px',
              background: 'transparent',
              border: '1px solid rgba(0,212,170,0.4)',
              color: '#00d4aa',
            }}
            onClick={() => { setResult(null); setDisplayedTeam(''); setFilter('Tous'); }} // ← reset aussi displayedTeam
          >
            ← Retour à l'affichage par défaut
          </button>
          {displayedTeam && <TeamBanner teamName={displayedTeam} />} {/* ← utilise displayedTeam */}
          <AnomalyResult data={result} isDefault={false} />
        </>
      )}
    </div>
  );
}

export default Anomaly;