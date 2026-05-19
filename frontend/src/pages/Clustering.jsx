// frontend/src/pages/Clustering.jsx

import React, { useEffect, useState } from 'react';
import TeamLogo from '../components/TeamLogo';
import { api } from '../api/api';
import './Pages.css';

const POSITIONS = ['', 'Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

const posColor = {
  Goalkeeper: '#f59e0b', Defender: '#60a5fa',
  Midfielder: '#00d4aa', Forward:  '#f87171', Attacker: '#f87171'
};

function Clustering() {
  const [leagues, setLeagues]   = useState([]);
  const [league, setLeague]     = useState('');
  const [position, setPosition] = useState('');
  const [maxAge, setMaxAge]     = useState(23);
  const [talents, setTalents]   = useState(null);
  const [clusters, setClusters] = useState(null);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [error1, setError1]     = useState('');
  const [error2, setError2]     = useState('');
  const [tab, setTab]           = useState('talents');

  useEffect(() => {
    api.getLeagues().then(data => setLeagues(data.leagues || []));
  }, []);

  const handleTalents = async () => {
    setLoading1(true);
    setError1('');
    try {
      const data = await api.detectTalents(league, position, maxAge);
      if (data.detail) throw new Error(data.detail);
      setTalents(data);
    } catch (e) { setError1(e.message); }
    setLoading1(false);
  };

  const handleClusters = async () => {
    setLoading2(true);
    setError2('');
    try {
      const data = await api.getClusters(league, position);
      if (data.detail) throw new Error(data.detail);
      setClusters(data);
    } catch (e) { setError2(e.message); }
    setLoading2(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-main-title">Talents & Clusters</h1>
        <p className="page-main-subtitle">
          Détection de jeunes talents et regroupement des joueurs par profil
        </p>
      </div>

      {/* Tabs */}
      <div className="page-filter-tabs" style={{ marginBottom: '24px' }}>
        {[
          { key: 'talents',  label: 'Détection de Talents' },
          { key: 'clusters', label: 'Clustering de Joueurs' }
        ].map(t => (
          <button key={t.key}
            className={`page-filter-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TALENTS ── */}
      {tab === 'talents' && (
        <div>
          <div className="page-filters">
            <div className="page-filters-title">
              Trouver les jeunes talents sous-évalués
            </div>
            <div className="page-filters-grid cols-3">
              <div className="page-field">
                <label>Ligue</label>
                <select value={league} onChange={e => setLeague(e.target.value)}>
                  <option value="">Toutes</option>
                  {leagues.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="page-field">
                <label>Position</label>
                <select value={position} onChange={e => setPosition(e.target.value)}>
                  <option value="">Toutes</option>
                  {POSITIONS.filter(p => p).map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="page-field">
                <label>Âge maximum : {maxAge} ans</label>
                <input type="range" min="18" max="30" step="1"
                  value={maxAge}
                  onChange={e => setMaxAge(parseInt(e.target.value))} />
              </div>
            </div>
            <button className="page-btn" onClick={handleTalents}
              disabled={loading1}>
              {loading1 ? 'Analyse en cours...' : 'Détecter les Talents'}
            </button>
            {error1 && <div className="page-error">{error1}</div>}
          </div>

          {talents && (
            <div>
              <div className="page-metrics cols-3">
                <div className="page-metric">
                  <div className="page-metric-label">Joueurs analysés</div>
                  <div className="page-metric-value">{talents.total}</div>
                </div>
                <div className="page-metric">
                  <div className="page-metric-label">Talents détectés</div>
                  <div className="page-metric-value" style={{ color: '#00d4aa' }}>
                    {talents.n_talents}
                  </div>
                </div>
                <div className="page-metric">
                  <div className="page-metric-label">Âge max</div>
                  <div className="page-metric-value">{talents.max_age} ans</div>
                </div>
              </div>

              <div className="page-table-card">
                <div className="page-table-header">
                  Jeunes Talents Prometteurs
                </div>
                <div className="table-responsive">
                  <table className="page-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Joueur</th>
                        <th>Équipe</th>
                        <th>Position</th>
                        <th>Âge</th>
                        <th>Rating</th>
                        <th>Perf. Score</th>
                        <th>Talent Score</th>
                        <th>Buts</th>
                        <th>Assists</th>
                        <th>Profil</th>
                      </tr>
                    </thead>
                    <tbody>
                      {talents.talents.map((p, i) => (
                        <tr key={i}>
                          <td style={{
                            color: i === 0 ? '#FFD700'
                                 : i === 1 ? '#C0C0C0'
                                 : i === 2 ? '#CD7F32' : '#6b7280',
                            fontWeight: 700
                          }}>
                            {i < 3 ? ['🥇','🥈','🥉'][i] : p.rank}
                          </td>
                          <td style={{ fontWeight: 600 }}>{p.name}</td>
                          <td style={{ color: '#6b7280' }}><TeamLogo teamName={p.team} size={24} showName={true} /></td>
                          <td style={{
                            color: posColor[p.position] || '#888',
                            fontWeight: 600, fontSize: '0.82rem'
                          }}>
                            {p.position}
                          </td>
                          <td style={{ color: '#f59e0b', fontWeight: 700 }}>
                            {p.age}
                          </td>
                          <td style={{ color: '#f59e0b', fontWeight: 600 }}>
                            {p.rating}
                          </td>
                          <td style={{ color: '#00d4aa', fontWeight: 600 }}>
                            {p.performance_score}
                          </td>
                          <td style={{ color: '#60a5fa', fontWeight: 700 }}>
                            {p.talent_score}
                          </td>
                          <td>{p.goals}</td>
                          <td>{p.assists}</td>
                          <td>
                            <span className="page-badge green">
                              {p.cluster_label}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── CLUSTERS ── */}
      {tab === 'clusters' && (
        <div>
          <div className="page-filters">
            <div className="page-filters-title">
              Regrouper les joueurs par profil de performance
            </div>
            <div className="page-filters-grid cols-2">
              <div className="page-field">
                <label>Ligue</label>
                <select value={league} onChange={e => setLeague(e.target.value)}>
                  <option value="">Toutes</option>
                  {leagues.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="page-field">
                <label>Position</label>
                <select value={position} onChange={e => setPosition(e.target.value)}>
                  <option value="">Toutes</option>
                  {POSITIONS.filter(p => p).map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
            <button className="page-btn" onClick={handleClusters}
              disabled={loading2}>
              {loading2 ? 'Clustering en cours...' : 'Analyser les Clusters'}
            </button>
            {error2 && <div className="page-error">{error2}</div>}
          </div>

          {clusters && (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px',
                marginBottom: '20px'
              }}>
                {clusters.clusters.map((c, i) => (
                  <div key={i} className="page-table-card">
                    <div className="page-table-header"
                      style={{ borderLeftColor: c.color }}>
                      <span style={{ color: c.color }}>{c.label}</span>
                      <span style={{ color: '#6b7280', fontWeight: 400,
                        marginLeft: '8px', fontSize: '0.82rem' }}>
                        {c.count} joueurs
                      </span>
                    </div>
                    <div style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '20px',
                        marginBottom: '16px' }}>
                        {[
                          { label: 'Rating moy.',  value: c.avg_rating, color: '#f59e0b' },
                          { label: 'Perf. Score',  value: c.avg_perf,   color: '#00d4aa' },
                          { label: 'Âge moy.',     value: c.avg_age,    color: '#60a5fa' },
                        ].map(m => (
                          <div key={m.label} style={{ textAlign: 'center' }}>
                            <div style={{ color: m.color, fontWeight: 800,
                              fontSize: '1.3rem' }}>
                              {m.value}
                            </div>
                            <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                              {m.label}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ fontSize: '0.8rem', color: '#6b7280',
                        marginBottom: '8px', fontWeight: 600 }}>
                        TOP 5 JOUEURS
                      </div>
                      {c.top_players.map((p, j) => (
                        <div key={j} style={{
                          display: 'flex', justifyContent: 'space-between',
                          padding: '6px 0',
                          borderBottom: j < 4 ? '1px solid #1f2937' : 'none'
                        }}>
                          <div>
                            <span style={{ color: '#e5e7eb', fontWeight: 500 }}>
                              {p.name}
                            </span>
                            <span style={{ color: '#6b7280', fontSize: '0.8rem',
                              marginLeft: '8px' }}>
                              <TeamLogo teamName={p.team} size={24} showName={true} />
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px',
                            alignItems: 'center' }}>
                            <span style={{
                              color: posColor[p.position] || '#888',
                              fontSize: '0.75rem', fontWeight: 600
                            }}>
                              {p.position}
                            </span>
                            <span style={{ color: '#f59e0b', fontWeight: 700 }}>
                              {p.rating}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Clustering;