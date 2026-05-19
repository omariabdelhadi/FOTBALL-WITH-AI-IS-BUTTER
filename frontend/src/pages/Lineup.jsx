import React, { useEffect, useState } from 'react';
import TeamLogo from '../components/TeamLogo';
import { api } from '../api/api';
import './Lineup.css';
import './Pages.css';

function Lineup() {
  const [leagues, setLeagues]       = useState([]);
  const [teams, setTeams]           = useState([]);
  const [selectedLeague, setLeague] = useState('');
  const [selectedTeam, setTeam]     = useState('');
  const [resultTeam, setResultTeam] = useState('');
  const [result, setResult]         = useState(null);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    api.getLeagues().then(data => setLeagues(data.leagues || []));
    api.getLineupStats().then(data => setStats(data)).catch(() => {});
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

  const handlePredict = async () => {
    if (!selectedTeam) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.predictLineup(selectedTeam);
      if (data.detail) throw new Error(data.detail);
      setResult(data);
      setResultTeam(selectedTeam);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const positionStyle = (pos) => {
    const map = {
      Goalkeeper: { color: '#f59e0b', background: 'rgba(245,158,11,0.1)' },
      Defender:   { color: '#60a5fa', background: 'rgba(96,165,250,0.1)' },
      Midfielder: { color: '#00d4aa', background: 'rgba(0,212,170,0.1)'  },
      Forward:    { color: '#f87171', background: 'rgba(248,113,113,0.1)' },
      Attacker:   { color: '#f87171', background: 'rgba(248,113,113,0.1)' },
    };
    return map[pos] || { color: '#9ca3af', background: 'rgba(156,163,175,0.1)' };
  };

  const posLabel = {
    Goalkeeper: 'Gardiens',
    Defender:   'Défenseurs',
    Midfielder: 'Milieux',
    Forward:    'Attaquants',
    Attacker:   'Attaquants'
  };

  const posColor = {
    Goalkeeper: '#f59e0b',
    Defender:   '#60a5fa',
    Midfielder: '#00d4aa',
    Forward:    '#f87171',
    Attacker:   '#f87171'
  };

  const PlayerTable = ({ players, isStarter }) => (
    <div className="lineup-table-card">
      <div className={`lineup-table-header ${isStarter ? 'starters' : 'subs'}`}>
        {isStarter ? 'Titulaires — 11 joueurs' : 'Remplaçants'}
      </div>
      <div className="table-responsive">
        <table className="lineup-table">
          <thead>
            <tr>
              <th>#</th><th>Joueur</th><th>Position</th>
              <th>Rating</th><th>Proba</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p, i) => {
              const ps = positionStyle(p.position);
              return (
                <tr key={i}>
                  <td className="lineup-rank">{i + 1}</td>
                  <td className="lineup-player-name">{p.name}</td>
                  <td>
                    <span className="lineup-position" style={ps}>
                      {p.position}
                    </span>
                  </td>
                  <td className="lineup-rating">{p.rating}</td>
                  <td className={isStarter ? 'lineup-proba-starter' : 'lineup-proba-sub'}>
                    {p.proba}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div>
      <div className="lineup-header">
        <h1 className="lineup-title">Lineup Prédit</h1>
        <p className="lineup-subtitle">
          Prédiction des 11 titulaires basée sur le Machine Learning
        </p>
      </div>

      {/* Formulaire */}
      <div className="lineup-filters">
        <div className="lineup-filters-title">Sélectionner une équipe</div>
        <div className="lineup-filters-grid">
          <div className="lineup-field">
            <label>Ligue</label>
            <select value={selectedLeague} onChange={e => setLeague(e.target.value)}>
              <option value="">Choisir une ligue</option>
              {leagues.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="lineup-field">
            <label>Équipe</label>
            <select value={selectedTeam} onChange={e => setTeam(e.target.value)}
              disabled={!selectedLeague}>
              <option value="">Choisir une équipe</option>
              {teams.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <button className="lineup-btn" onClick={handlePredict}
          disabled={!selectedTeam || loading}>
          {loading ? 'Prédiction en cours...' : 'Prédire le Lineup'}
        </button>
        {error && <div className="lineup-error">{error}</div>}
      </div>

      {/* Résultat */}
      {result && (
        <>
          <button
            className="lineup-btn"
            style={{
              marginBottom: '16px',
              background: 'transparent',
              border: '1px solid rgba(0,212,170,0.4)',
              color: '#00d4aa',
            }}
            onClick={() => setResult(null)}
          >
            ← Retour
          </button>
          <div className="lineup-results">
            <div className="lineup-team-banner">
              <TeamLogo teamName={resultTeam} size={64} showName={false} />
              <span className="lineup-team-name">{resultTeam}</span>
            </div>
            <PlayerTable players={result.titulaires}  isStarter={true} />
            <PlayerTable players={result.remplacants} isStarter={false} />
          </div>
        </>
      )}

      {/* Contenu par défaut — affiché quand pas de résultat */}
      {!result && stats && (
        <div>

          {/* Meilleur joueur */}
          <div style={{
            background:    'linear-gradient(135deg, rgba(0,212,170,0.08), rgba(96,165,250,0.08))',
            border:        '1px solid rgba(0,212,170,0.2)',
            borderRadius:  '12px',
            padding:       '20px 24px',
            marginBottom:  '20px',
            display:       'flex',
            alignItems:    'center',
            gap:           '16px'
          }}>
            <div style={{
              width: '48px', height: '48px',
              background: 'rgba(255,215,0,0.15)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '1.4rem',
              flexShrink: 0
            }}>
              🏆
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '0.75rem', color: '#6b7280',
                textTransform: 'uppercase', letterSpacing: '0.5px',
                marginBottom: '4px'
              }}>
                Meilleur joueur actuellement
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <TeamLogo teamName={stats.best_player.team} size={28} />
                <div>
                  <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '1rem' }}>
                    {stats.best_player.name}
                  </span>
                  <span style={{ color: '#6b7280', fontSize: '0.85rem', marginLeft: '8px' }}>
                    {stats.best_player.team} — {stats.best_player.league}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#FFD700', fontWeight: 800, fontSize: '1.8rem' }}>
                {stats.best_player.rating}
              </div>
              <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>Rating</div>
            </div>
          </div>

          {/* Distribution positions + Top équipes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

            {/* Distribution positions */}
            <div className="page-table-card">
              <div className="page-table-header">
                Distribution par Position
              </div>
              <div style={{ padding: '20px' }}>
                {Object.entries(stats.pos_dist)
                  .filter(([pos]) => pos !== 'Unknown')
                  .map(([pos, count]) => {
                    const total = Object.values(stats.pos_dist).reduce((a, b) => a + b, 0);
                    const pct   = Math.round(count / total * 100);
                    return (
                      <div key={pos} style={{ marginBottom: '14px' }}>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          marginBottom: '6px'
                        }}>
                          <span style={{
                            color: posColor[pos] || '#888',
                            fontWeight: 600, fontSize: '0.85rem'
                          }}>
                            {posLabel[pos] || pos}
                          </span>
                          <span style={{ color: '#6b7280', fontSize: '0.82rem' }}>
                            {count} joueurs ({pct}%)
                          </span>
                        </div>
                        <div style={{
                          height: '6px', background: '#1f2937',
                          borderRadius: '3px', overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${pct}%`,
                            background: posColor[pos] || '#888',
                            borderRadius: '3px',
                            transition: 'width 0.5s ease'
                          }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Top 3 équipes */}
            <div className="page-table-card">
              <div className="page-table-header">
                Top 3 Équipes — Rating Moyen
              </div>
              <div style={{ padding: '20px' }}>
                {stats.top_teams.map((t, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center',
                    gap: '14px', padding: '12px 0',
                    borderBottom: i < 2 ? '1px solid #1f2937' : 'none'
                  }}>
                    <div style={{
                      width: '32px', height: '32px',
                      background: i === 0 ? 'rgba(255,215,0,0.15)'
                                : i === 1 ? 'rgba(192,192,192,0.15)'
                                : 'rgba(205,127,50,0.15)',
                      borderRadius: '50%',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem', flexShrink: 0
                    }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                    </div>
                    <TeamLogo teamName={t.team} size={32} />
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem' }}>
                        {t.team}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '0.78rem' }}>
                        {t.league}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#f59e0b', fontWeight: 800, fontSize: '1.2rem' }}>
                        {t.rating}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '0.72rem' }}>
                        moy. rating
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Message d'invitation */}
          <div style={{
            textAlign: 'center', padding: '32px 20px',
            color: '#6b7280', fontSize: '0.9rem', marginTop: '8px'
          }}>
            Sélectionnez une ligue et une équipe pour prédire le lineup
          </div>

        </div>
      )}
    </div>
  );
}

export default Lineup;