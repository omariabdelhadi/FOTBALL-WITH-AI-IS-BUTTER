import React, { useEffect, useState } from 'react';
import TeamLogo from '../components/TeamLogo';
import { api } from '../api/api';
import './Pages.css';

const posStyle = (pos) => ({
  Goalkeeper: { color: '#f59e0b' }, Defender: { color: '#60a5fa' },
  Midfielder: { color: '#00d4aa' }, Forward:  { color: '#f87171' },
  Attacker:   { color: '#f87171' },
}[pos] || { color: '#9ca3af' });

const formationColor = (f) => {
  const colors = {
    '4-3-3':   '#00d4aa',
    '4-4-2':   '#60a5fa',
    '3-5-2':   '#f59e0b',
    '4-2-3-1': '#f87171',
    '5-3-2':   '#a78bfa',
  };
  return colors[f] || '#6b7280';
};

function Tactical() {
  const [leagues, setLeagues]         = useState([]);
  const [teams, setTeams]             = useState([]);
  const [formations, setFormations]   = useState([]);
  const [selectedLeague, setLeague]   = useState('');
  const [selectedTeam, setTeam]       = useState('');
  const [resultTeam, setResultTeam]   = useState('');
  const [selectedForm, setForm]       = useState('4-3-3');
  const [result, setResult]           = useState(null);
  const [popular, setPopular]         = useState(null);
  const [loading, setLoading]         = useState(false);
  const [loadingPop, setLoadingPop]   = useState(true);
  const [error, setError]             = useState('');

  useEffect(() => {
    api.getLeagues().then(data => setLeagues(data.leagues || []));
    api.getFormations().then(data => setFormations(data.formations || []));
    api.getPopularFormations()
      .then(data => { setPopular(data.leagues || []); setLoadingPop(false); })
      .catch(() => setLoadingPop(false));
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      api.getTeams(selectedLeague).then(data => {
        setTeams(data.teams || []);
        setTeam('');
        setResult(null);
      });
    }
  }, [selectedLeague]);

  const handleAnalyze = async () => {
    if (!selectedTeam) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.analyzeTactical(selectedTeam, selectedForm);
      if (data.detail) throw new Error(data.detail);
      setResult(data);
      setResultTeam(selectedTeam);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-main-title">Analyse Tactique</h1>
        <p className="page-main-subtitle">
          Trouvez la meilleure formation pour votre équipe
        </p>
      </div>

      {/* Formations populaires par ligue — affiché par défaut */}
      {!result && (
        <>
          {loadingPop && (
            <div style={{ color: '#6b7280', marginBottom: '24px' }}>
              Chargement des formations...
            </div>
          )}

          {popular && popular.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <div style={{
                fontSize: '0.75rem', fontWeight: 600, color: '#00d4aa',
                textTransform: 'uppercase', letterSpacing: '0.5px',
                marginBottom: '16px'
              }}>
                Formation Optimale par Ligue
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '16px'
              }}>
                {popular.map((item, i) => (
                  <div key={i} style={{
                    background:   '#111827',
                    border:       `1px solid ${formationColor(item.best_formation)}33`,
                    borderLeft:   `3px solid ${formationColor(item.best_formation)}`,
                    borderRadius: '12px',
                    padding:      '20px'
                  }}>
                    {/* Ligue */}
                    <div style={{
                      color: '#6b7280', fontSize: '0.78rem',
                      textTransform: 'uppercase', letterSpacing: '0.5px',
                      marginBottom: '12px'
                    }}>
                      {item.league}
                    </div>

                    {/* Formation */}
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      gap: '12px', marginBottom: '16px'
                    }}>
                      <div style={{
                        width: '52px', height: '52px',
                        background: `${formationColor(item.best_formation)}15`,
                        border:     `2px solid ${formationColor(item.best_formation)}`,
                        borderRadius: '10px',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem', fontWeight: 800,
                        color: formationColor(item.best_formation),
                        flexShrink: 0
                      }}>
                        {item.best_formation}
                      </div>
                      <div>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>
                          Formation Recommandée
                        </div>
                        <div style={{
                          color: formationColor(item.best_formation),
                          fontSize: '0.8rem', fontWeight: 600
                        }}>
                          TacticalFit : {item.score}
                        </div>
                      </div>
                    </div>

                    {/* Top équipe */}
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      gap: '10px', padding: '10px',
                      background: '#0d1117', borderRadius: '8px'
                    }}>
                      <TeamLogo teamName={item.top_team} size={28} />
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#e5e7eb', fontWeight: 600,
                          fontSize: '0.85rem' }}>
                          {item.top_team}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                          Meilleure équipe de la ligue
                        </div>
                      </div>
                      <div style={{ color: '#f59e0b', fontWeight: 800 }}>
                        {item.top_team_rating}
                      </div>
                    </div>

                    {/* Mini scores formations */}
                    {item.formation_scores && (
                      <div style={{ marginTop: '12px' }}>
                        {Object.entries(item.formation_scores)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 3)
                          .map(([f, score]) => (
                            <div key={f} style={{
                              display: 'flex', justifyContent: 'space-between',
                              alignItems: 'center', marginBottom: '4px'
                            }}>
                              <span style={{
                                fontSize: '0.78rem',
                                color: f === item.best_formation
                                  ? formationColor(f) : '#6b7280',
                                fontWeight: f === item.best_formation ? 700 : 400
                              }}>
                                {f}
                              </span>
                              <div style={{
                                display: 'flex', alignItems: 'center', gap: '6px'
                              }}>
                                <div style={{
                                  width: '60px', height: '4px',
                                  background: '#1f2937', borderRadius: '2px',
                                  overflow: 'hidden'
                                }}>
                                  <div style={{
                                    height: '100%',
                                    width: `${score * 100}%`,
                                    background: formationColor(f),
                                    borderRadius: '2px'
                                  }} />
                                </div>
                                <span style={{
                                  fontSize: '0.75rem', color: '#6b7280', width: '36px'
                                }}>
                                  {score}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Formulaire */}
      <div className="page-filters">
        <div className="page-filters-title">Analyser une équipe</div>
        <div className="page-filters-grid cols-3">
          <div className="page-field">
            <label>Ligue</label>
            <select value={selectedLeague} onChange={e => setLeague(e.target.value)}>
              <option value="">Choisir une ligue</option>
              {leagues.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="page-field">
            <label>Équipe</label>
            <select value={selectedTeam} onChange={e => setTeam(e.target.value)}
              disabled={!selectedLeague}>
              <option value="">Choisir une équipe</option>
              {teams.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="page-field">
            <label>Formation</label>
            <select value={selectedForm} onChange={e => setForm(e.target.value)}>
              {formations.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>
        <button className="page-btn" onClick={handleAnalyze}
          disabled={!selectedTeam || loading}>
          {loading ? 'Analyse en cours...' : 'Analyser'}
        </button>
        {error && <div className="page-error">{error}</div>}
      </div>

      {/* Résultat */}
      {result && (
        <div>
          <button
            className="page-btn"
            style={{
              marginBottom: '16px', background: 'transparent',
              border: '1px solid rgba(0,212,170,0.4)', color: '#00d4aa',
            }}
            onClick={() => setResult(null)}
          >
            ← Retour aux formations par ligue
          </button>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            background: '#111827', border: '1px solid #1f2937',
            borderRadius: '12px', padding: '16px 20px', marginBottom: '20px'
          }}>
            <TeamLogo teamName={resultTeam} size={52} />
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>
                {resultTeam}
              </div>
              <div style={{ color: '#00d4aa', fontWeight: 600, fontSize: '0.85rem' }}>
                Meilleure formation : {result.best_formation}
              </div>
            </div>
          </div>

          <div className="page-table-card" style={{ marginBottom: '20px' }}>
            <div className="page-table-header">Comparaison des Formations</div>
            <div className="table-responsive">
              <table className="page-table">
                <thead>
                  <tr><th>Formation</th><th>TacticalFit</th><th>Statut</th></tr>
                </thead>
                <tbody>
                  {Object.entries(result.formation_scores)
                    .sort((a, b) => b[1] - a[1])
                    .map(([f, score]) => (
                      <tr key={f}>
                        <td style={{ fontWeight: 600,
                          color: formationColor(f) }}>{f}</td>
                        <td style={{ color: '#00d4aa', fontWeight: 600 }}>{score}</td>
                        <td>
                          {f === result.best_formation && (
                            <span className="page-badge green">Recommandée</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="page-grid-2">
            <div className="page-table-card">
              <div className="page-table-header">
                Lineup Optimal — {result.formation}
              </div>
              <table className="page-table">
                <thead>
                  <tr><th>#</th><th>Joueur</th><th>Position</th><th>Rating</th></tr>
                </thead>
                <tbody>
                  {result.optimal_lineup.map((p, i) => (
                    <tr key={i}>
                      <td style={{ color: '#6b7280' }}>{i + 1}</td>
                      <td>{p.name}</td>
                      <td style={{ fontWeight: 600, ...posStyle(p.position) }}>
                        {p.position}
                      </td>
                      <td style={{ color: '#f59e0b', fontWeight: 600 }}>
                        {p.rating}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="page-table-card">
              <div className="page-table-header">
                TacticalFit — {result.formation}
              </div>
              <table className="page-table">
                <thead>
                  <tr><th>Joueur</th><th>Position</th><th>TacticalFit</th></tr>
                </thead>
                <tbody>
                  {result.tactical_fit.slice(0, 11).map((p, i) => (
                    <tr key={i}>
                      <td>{p.name}</td>
                      <td style={{ fontWeight: 600, ...posStyle(p.position) }}>
                        {p.position}
                      </td>
                      <td style={{ color: '#00d4aa', fontWeight: 600 }}>
                        {p.tactical_fit}
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
  );
}

export default Tactical;