import React, { useEffect, useState } from 'react';
import { api } from '../api/api';
import TeamLogo from '../components/TeamLogo';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import './Pages.css';

function Simulation() {
  const [teams, setTeams]               = useState([]);
  const [team, setTeam]                 = useState('');
  const [opponent, setOpponent]         = useState('');
  const [resultTeam, setResultTeam]     = useState('');
  const [resultOpponent, setResultOpp]  = useState('');
  const [strength, setStrength]         = useState(0.5);
  const [home, setHome]                 = useState(true);
  const [nSims, setNSims]               = useState(10000);
  const [result, setResult]             = useState(null);
  const [featured, setFeatured]         = useState(null);
  const [loading, setLoading]           = useState(false);
  const [loadingFeat, setLoadingFeat]   = useState(true);
  const [error, setError]               = useState('');

  useEffect(() => {
    api.getSimulationTeams().then(data => setTeams(data.teams || []));
    api.getFeaturedMatch()
      .then(data => { setFeatured(data); setLoadingFeat(false); })
      .catch(() => setLoadingFeat(false));
  }, []);

  const handleSimulate = async () => {
    if (!team || !opponent) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.simulateMatch(team, opponent, strength, home, nSims);
      if (data.detail) throw new Error(data.detail);
      setResult(data);
      setResultTeam(team);
      setResultOpp(opponent);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const chartData = result ? [
    { name: 'Victoire', value: parseFloat(result.prob_win),  color: '#00d4aa' },
    { name: 'Nul',      value: parseFloat(result.prob_draw), color: '#f59e0b' },
    { name: 'Défaite',  value: parseFloat(result.prob_loss), color: '#ef4444' },
  ] : [];

  const MatchBanner = ({ t1, t2, l1, l2, r1, r2, pw, pd, pl }) => (
    <div style={{
      background:   '#111827',
      border:       '1px solid #1f2937',
      borderRadius: '12px',
      padding:      '24px',
      marginBottom: '24px'
    }}>
      <div style={{
        fontSize: '0.75rem', color: '#00d4aa', fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '20px'
      }}>
        Match Vedette du Moment
      </div>

      {/* Deux équipes */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: '24px'
      }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <TeamLogo teamName={t1} size={64} showName={false} />
          <div style={{ color: '#fff', fontWeight: 700,
            fontSize: '1rem', marginTop: '8px' }}>{t1}</div>
          <div style={{ color: '#6b7280', fontSize: '0.78rem' }}>{l1}</div>
          <div style={{ color: '#f59e0b', fontWeight: 800,
            fontSize: '1.3rem', marginTop: '4px' }}>{r1}</div>
          <div style={{ color: '#6b7280', fontSize: '0.72rem' }}>rating moy.</div>
        </div>

        <div style={{ textAlign: 'center', padding: '0 20px' }}>
          <div style={{ color: '#374151', fontWeight: 800,
            fontSize: '1.5rem' }}>VS</div>
        </div>

        <div style={{ textAlign: 'center', flex: 1 }}>
          <TeamLogo teamName={t2} size={64} showName={false} />
          <div style={{ color: '#fff', fontWeight: 700,
            fontSize: '1rem', marginTop: '8px' }}>{t2}</div>
          <div style={{ color: '#6b7280', fontSize: '0.78rem' }}>{l2}</div>
          <div style={{ color: '#f59e0b', fontWeight: 800,
            fontSize: '1.3rem', marginTop: '4px' }}>{r2}</div>
          <div style={{ color: '#6b7280', fontSize: '0.72rem' }}>rating moy.</div>
        </div>
      </div>

      {/* Probabilités estimées */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        gap: '12px', marginBottom: '16px'
      }}>
        {[
          { label: `Victoire ${t1}`, value: pw, color: '#00d4aa' },
          { label: 'Nul',            value: pd, color: '#f59e0b' },
          { label: `Victoire ${t2}`, value: pl, color: '#ef4444' },
        ].map(m => (
          <div key={m.label} style={{
            background: '#0d1117', borderRadius: '8px',
            padding: '12px', textAlign: 'center'
          }}>
            <div style={{ color: m.color, fontWeight: 800, fontSize: '1.4rem' }}>
              {m.value}
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '2px' }}>
              {m.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ color: '#6b7280', fontSize: '0.8rem', textAlign: 'center' }}>
        Probabilités estimées basées sur les ratings moyens des équipes
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-main-title">Simulation Monte Carlo</h1>
        <p className="page-main-subtitle">
          Simulez le résultat d'un match en milliers de simulations
        </p>
      </div>

      {/* Match vedette par défaut */}
      {!result && (
        <>
          {loadingFeat && (
            <div style={{ color: '#6b7280', marginBottom: '24px' }}>
              Chargement du match vedette...
            </div>
          )}
          {featured && (
            <MatchBanner
              t1={featured.team1}   t2={featured.team2}
              l1={featured.league1} l2={featured.league2}
              r1={featured.rating1} r2={featured.rating2}
              pw={featured.prob_win} pd={featured.prob_draw} pl={featured.prob_loss}
            />
          )}
        </>
      )}

      {/* Formulaire */}
      <div className="page-filters">
        <div className="page-filters-title">Paramètres du match</div>
        <div className="page-filters-grid cols-2">
          <div className="page-field">
            <label>Équipe</label>
            <select value={team} onChange={e => setTeam(e.target.value)}>
              <option value="">Choisir une équipe</option>
              {teams.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="page-field">
            <label>Adversaire</label>
            <select value={opponent} onChange={e => setOpponent(e.target.value)}>
              <option value="">Choisir un adversaire</option>
              {teams.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="page-field">
            <label>Force adversaire : {strength}</label>
            <input type="range" min="0" max="1" step="0.1"
              value={strength}
              onChange={e => setStrength(parseFloat(e.target.value))} />
            <div className="range-value">
              {strength < 0.4 ? 'Faible' : strength < 0.7 ? 'Moyen' : 'Fort'}
            </div>
          </div>
          <div className="page-field">
            <label>Nombre de simulations</label>
            <select value={nSims} onChange={e => setNSims(parseInt(e.target.value))}>
              {[1000, 5000, 10000, 50000].map(n => (
                <option key={n} value={n}>{n.toLocaleString()}</option>
              ))}
            </select>
          </div>
        </div>
        <label className="page-checkbox-label">
          <input type="checkbox" checked={home}
            onChange={e => setHome(e.target.checked)} />
          Joue à domicile
        </label>
        <br /><br />
        <button className="page-btn" onClick={handleSimulate}
          disabled={!team || !opponent || loading}>
          {loading ? 'Simulation en cours...' : 'Lancer la Simulation'}
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
            ← Retour au match vedette
          </button>

          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            background: '#111827', border: '1px solid #1f2937',
            borderRadius: '12px', padding: '20px 24px', marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <TeamLogo teamName={resultTeam} size={52} />
              <div style={{ color: '#fff', fontWeight: 700 }}>{resultTeam}</div>
            </div>
            <div style={{ color: '#374151', fontWeight: 800, fontSize: '1.2rem' }}>VS</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ color: '#fff', fontWeight: 700 }}>{resultOpponent}</div>
              <TeamLogo teamName={resultOpponent} size={52} />
            </div>
          </div>

          <div className="page-metrics cols-3">
            {[
              { label: 'Victoire', value: result.prob_win,  color: '#00d4aa' },
              { label: 'Nul',      value: result.prob_draw, color: '#f59e0b' },
              { label: 'Défaite',  value: result.prob_loss, color: '#ef4444' },
            ].map(m => (
              <div key={m.label} className="page-metric">
                <div className="page-metric-label">{m.label}</div>
                <div className="page-metric-value" style={{ color: m.color }}>
                  {m.value}
                </div>
              </div>
            ))}
          </div>

          <div className="page-table-card">
            <div className="page-table-header">
              Résultats — {result.n_simulations.toLocaleString()} simulations
            </div>
            <div style={{ padding: '20px' }}>
              <div className={result.favori === team ? 'page-success' : 'page-error'}
                style={{ marginBottom: '16px' }}>
                {result.favori === team
                  ? `${team} est favori`
                  : `${resultOpponent} est favori`}
              </div>
              <div className="chart-responsive">
                <BarChart width={500} height={280} data={chartData}
                  margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} tickFormatter={v => `${v}%`} />
                  <Tooltip formatter={v => `${v}%`}
                    contentStyle={{ backgroundColor: '#111827',
                      border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Simulation;