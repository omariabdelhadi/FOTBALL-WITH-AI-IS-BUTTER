import React, { useEffect, useState } from 'react';
import TeamLogo from '../components/TeamLogo';
import { api } from '../api/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, ResponsiveContainer
} from 'recharts';
import './Pages.css';

const POSITIONS = ['Toutes', 'Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

const posColor = {
  Goalkeeper: '#f59e0b', Defender: '#60a5fa',
  Midfielder: '#00d4aa', Forward:  '#f87171',
  Attacker:   '#f87171', Toutes:   '#00d4aa'
};

const posLabel = {
  Goalkeeper: 'Gardien',
  Defender:   'Défenseur',
  Midfielder: 'Milieu',
  Forward:    'Attaquant'
};

function Ranking() {
  const [leagues, setLeagues]     = useState([]);
  const [metrics, setMetrics]     = useState([]);
  const [league, setLeague]       = useState('');
  const [position, setPosition]   = useState('');
  const [metric, setMetric]       = useState('rating');
  const [topN, setTopN]           = useState(10);
  const [result, setResult]       = useState(null);
  const [bestPos, setBestPos]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [loadingBest, setLoadingB]= useState(true);
  const [error, setError]         = useState('');
  const [view, setView]           = useState('table');

  useEffect(() => {
    api.getLeagues().then(data => setLeagues(data.leagues || []));
    api.getRankingMetrics().then(data => setMetrics(data.metrics || []));
    api.getBestByPosition()
      .then(data => {
        setBestPos(data.best_by_position || []);
        setLoadingB(false);
      })
      .catch(() => setLoadingB(false));
  }, []);

  const handleRank = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getTopPlayers(
        position === 'Toutes' ? '' : position,
        league, metric, topN
      );
      if (data.detail) throw new Error(data.detail);
      setResult(data);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const metricLabel = metrics.find(m => m.key === metric)?.label || metric;

  const chartData = result?.players.map(p => ({
    name:  p.name.split(' ').pop(),
    value: p[metric] || 0,
    color: posColor[p.position] || '#00d4aa'
  })) || [];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-main-title">Classement des Joueurs</h1>
        <p className="page-main-subtitle">
          Top joueurs par position, ligue et métrique
        </p>
      </div>

      {/* Meilleur par position — affiché par défaut */}
      {loadingBest && (
        <div style={{ color: '#6b7280', marginBottom: '24px' }}>
          Chargement...
        </div>
      )}

      {bestPos && !result && (
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            fontSize: '0.8rem', fontWeight: 600, color: '#00d4aa',
            textTransform: 'uppercase', letterSpacing: '0.5px',
            marginBottom: '16px'
          }}>
            🌟 Meilleur Joueur par Position — Toutes Ligues
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px'
          }}>
            {bestPos.map((p, i) => (
              <div key={i} className="page-table-card">
                <div className="page-table-header"
                  style={{ borderLeftColor: posColor[p.position] }}>
                  <span style={{ color: posColor[p.position] }}>
                    {posLabel[p.position] || p.position}
                  </span>
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{
                    fontSize: '1.1rem', fontWeight: 700,
                    color: '#ffffff', marginBottom: '4px'
                  }}>
                    {p.name}
                  </div>
                  <div style={{
                    color: '#6b7280', fontSize: '0.85rem', marginBottom: '16px'
                  }}>
                    <TeamLogo teamName={p.team} size={24} showName={true} /> — {p.league}
                    {p.age ? ` — ${p.age} ans` : ''}
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px'
                  }}>
                    {[
                      { label: 'Rating',  value: p.rating,  color: '#f59e0b' },
                      { label: 'Buts',    value: p.goals,   color: '#00d4aa' },
                      { label: 'Assists', value: p.assists, color: '#60a5fa' },
                    ].map(m => (
                      <div key={m.label} style={{ textAlign: 'center' }}>
                        <div style={{
                          color: m.color, fontWeight: 800, fontSize: '1.4rem'
                        }}>
                          {m.value}
                        </div>
                        <div style={{
                          color: '#6b7280', fontSize: '0.75rem',
                          textTransform: 'uppercase'
                        }}>
                          {m.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulaire */}
      <div className="page-filters">
        <div className="page-filters-title">Paramètres du classement</div>
        <div className="page-filters-grid cols-2">
          <div className="page-field">
            <label>Ligue</label>
            <select value={league} onChange={e => setLeague(e.target.value)}>
              <option value="">Toutes les ligues</option>
              {leagues.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="page-field">
            <label>Position</label>
            <select value={position} onChange={e => setPosition(e.target.value)}>
              {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="page-field">
            <label>Métrique</label>
            <select value={metric} onChange={e => setMetric(e.target.value)}>
              {metrics.map(m => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>
          </div>
          <div className="page-field">
            <label>Nombre de joueurs</label>
            <select value={topN} onChange={e => setTopN(parseInt(e.target.value))}>
              {[5, 10, 20, 30].map(n => (
                <option key={n} value={n}>Top {n}</option>
              ))}
            </select>
          </div>
        </div>
        <button className="page-btn" onClick={handleRank} disabled={loading}>
          {loading ? 'Chargement...' : 'Afficher le Classement'}
        </button>
        {error && <div className="page-error">{error}</div>}
      </div>

      {/* Résultat */}
      {result && (
        <div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '16px'
          }}>
            <button
              className="page-btn"
              style={{
                background: 'transparent',
                border: '1px solid rgba(0,212,170,0.4)',
                color: '#00d4aa',
              }}
              onClick={() => setResult(null)}
            >
              ← Retour à l'affichage par défaut
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              {['table', 'chart'].map(v => (
                <button key={v}
                  onClick={() => setView(v)}
                  className={`page-filter-tab ${view === v ? 'active' : ''}`}>
                  {v === 'table' ? 'Tableau' : 'Graphique'}
                </button>
              ))}
            </div>
          </div>

          {/* Tableau */}
          {view === 'table' && (
            <div className="page-table-card">
              <div className="page-table-header">
                Top {topN} — {metricLabel}
              </div>
              <div className="table-responsive">
                <table className="page-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Joueur</th>
                      <th>Équipe</th>
                      <th>Ligue</th>
                      <th>Position</th>
                      <th>Âge</th>
                      <th>Rating</th>
                      <th>Buts</th>
                      <th>Assists</th>
                      <th>{metricLabel}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.players.map((p, i) => (
                      <tr key={i}>
                        <td>
                          <span style={{
                            fontWeight: 700,
                            color: i === 0 ? '#FFD700'
                                 : i === 1 ? '#C0C0C0'
                                 : i === 2 ? '#CD7F32' : '#6b7280'
                          }}>
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : p.rank}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                        <td>
                            <TeamLogo teamName={p.team} size={24} showName={true} />
                        </td>
                        <td style={{ color: '#6b7280', fontSize: '0.82rem' }}>
                          {p.league}
                        </td>
                        <td>
                          <span style={{
                            color: posColor[p.position] || '#888',
                            fontWeight: 600, fontSize: '0.82rem'
                          }}>
                            {p.position}
                          </span>
                        </td>
                        <td style={{ color: '#6b7280' }}>{p.age}</td>
                        <td style={{ color: '#f59e0b', fontWeight: 600 }}>
                          {p.rating}
                        </td>
                        <td>{p.goals}</td>
                        <td>{p.assists}</td>
                        <td style={{ color: '#00d4aa', fontWeight: 700 }}>
                          {p[metric]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Graphique */}
          {view === 'chart' && (
            <div className="page-table-card">
              <div className="page-table-header">
                Top {topN} — {metricLabel}
              </div>
              <div style={{ padding: '20px' }} className="chart-responsive">
                <ResponsiveContainer width="100%" height={400} minWidth={500}>
                  <BarChart data={chartData} layout="vertical"
                    margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis type="number" stroke="#6b7280" fontSize={11} />
                    <YAxis type="category" dataKey="name"
                      stroke="#6b7280" fontSize={11} width={80} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#108e6c',
                        border: '1px solid #374151', borderRadius: '8px' }}
                      formatter={v => [v, metricLabel]} />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                      {chartData.map((e, i) => (
                        <Cell key={i} fill={e.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Ranking;