// Home.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/api';
import TeamLogo from '../components/TeamLogo';
import imgLineup      from '../assets/icons/lineup.jpg';
import imgPerformance from '../assets/icons/p.png';
import imgSimulation  from '../assets/icons/simulation.png';
import imgAnomalies   from '../assets/icons/anomalies.png';
import imgTransferts  from '../assets/icons/trans.png';
import imgTactique    from '../assets/icons/tactique.png';
import backgroundImage from '../assets/icons/background-football.png';
import './Home.css';

const features = [
  {
    title: "Lineup Prédit",
    desc: "Prédit les 11 titulaires via Machine Learning",
    img: imgLineup,
    path: "/lineup",
  },
  {
    title: "Performance",
    desc: "Estime le rating futur d'un joueur",
    img: imgPerformance,
    path: "/performance",
  },
  {
    title: "Simulation",
    desc: "Monte Carlo sur 10 000 matchs simulés",
    img: imgSimulation,
    path: "/simulation",
  },
  {
    title: "Anomalies",
    desc: "Détecte les joueurs qui sur/sous-performent",
    img: imgAnomalies,
    path: "/anomalies",
  },
  {
    title: "Transferts",
    desc: "Recommande les meilleures recrues par budget",
    img: imgTransferts,
    path: "/transfer",
  },
  {
    title: "Tactique",
    desc: "Analyse la meilleure formation pour l'équipe",
    img: imgTactique,
    path: "/tactical",
  },
];

const stats = [
  { value: "2689", label: "Joueurs" },
  { value: "98",   label: "Équipes" },
  { value: "5",    label: "Ligues" },
  { value: "3",    label: "Modèles ML" },
];

const upcomingMatches = [
  {
    id: 1,
    team1: "Manchester United",
    team2: "Liverpool",
    date: "16 Mai 2026",
    time: "20:00",
    stadium: "Old Trafford",
    league: "Premier League",
  },
  {
    id: 2,
    team1: "Paris Saint-Germain",
    team2: "Marseille",
    date: "17 Mai 2026",
    time: "19:45",
    stadium: "Parc des Princes",
    league: "Ligue 1",
  },
  {
    id: 3,
    team1: "Real Madrid",
    team2: "Barcelona",
    date: "18 Mai 2026",
    time: "21:00",
    stadium: "Santiago Bernabéu",
    league: "La Liga",
  },
  {
    id: 4,
    team1: "Bayern Munich",
    team2: "Borussia Dortmund",
    date: "19 Mai 2026",
    time: "17:30",
    stadium: "Allianz Arena",
    league: "Bundesliga",
  },
];

function Home() {
  const navigate = useNavigate();
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLeagues()
      .then(data => {
        setLeagues(data.leagues || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
    <div className="home-background-blur" style={{backgroundImage: `url(${backgroundImage})`}}></div>
    <div className="home-container">
      {/* Hero */}
      <div className="home-hero">
        <h1 className="home-hero-title">
          Smart<span>Lineup</span>
        </h1>
        <p className="home-hero-subtitle">
          Plateforme intelligente d'analyse et de prédiction en football
        </p>
        <div className="home-hero-features">
          <div className="home-hero-feature-item">
            <span className="home-hero-feature-label">Intelligence Artificielle</span>
            <span className="home-hero-feature-value">Algorithmes ML avancés</span>
          </div>
          <div className="home-hero-feature-item">
            <span className="home-hero-feature-label">Données Réel</span>
            <span className="home-hero-feature-value">2689 joueurs analysés</span>
          </div>
          <div className="home-hero-feature-item">
            <span className="home-hero-feature-label">Précision</span>
            <span className="home-hero-feature-value">Prédictions data-driven</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="home-stats">
        {stats.map(s => (
          <div key={s.label} className="home-stat">
            <div className="home-stat-value">{s.value}</div>
            <div className="home-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Matchs à Venir */}
      <div className="home-matches">
        <div className="home-section-title">Matchs à Venir</div>
        <div className="home-matches-grid">
          {upcomingMatches.map(match => (
            <div key={match.id} className="home-match-card">
              <div className="home-match-header">
                <span className="home-match-league">{match.league}</span>
                <span className="home-match-date">{match.date}</span>
              </div>
              
              <div className="home-match-teams">
                <div className="home-match-team">
                  <TeamLogo teamName={match.team1} size={40} />
                  <div className="home-match-team-info">
                    <div className="home-match-team-name">{match.team1}</div>
                  </div>
                </div>

                <div className="home-match-vs">
                  <div className="home-match-time">{match.time}</div>
                </div>

                <div className="home-match-team">
                  <TeamLogo teamName={match.team2} size={40} />
                  <div className="home-match-team-info">
                    <div className="home-match-team-name">{match.team2}</div>
                  </div>
                </div>
              </div>

              <div className="home-match-footer">
                <span className="home-match-stadium">{match.stadium}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ligues */}
      <div className="home-leagues">
        <div className="home-section-title">Ligues Disponibles</div>
        {loading ? (
          <div className="home-loading">Chargement...</div>
        ) : (
          <div className="home-leagues-list">
            {leagues.map(league => (
              <span key={league} className="home-league-tag">{league}</span>
            ))}
          </div>
        )}
      </div>

      {/* Features */}
      <div className="home-features">
        <div className="home-section-title">les Fonctionnalités principales</div>
        <div className="home-features-grid">
          {features.map(f => (
            <div 
              key={f.title} 
              className="home-feature-card"
              onClick={() => navigate(f.path)}
              style={{ cursor: 'pointer' }}>
              <img className="home-feature-img" src={f.img} alt={f.title} />
              <div className="home-feature-body">
                <div className="home-feature-title">{f.title}</div>
                <div className="home-feature-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Avantages */}
      <div className="home-benefits">
  <div className="home-section-title">Pourquoi SmartLineup ?</div>
  <div className="home-benefits-grid">
    <div className="home-benefit-card">
      <div className="home-benefit-number">01</div>
      <div className="home-benefit-title">Prédictions ML</div>
      <div className="home-benefit-desc">
        Modèles Machine Learning — Random Forest et Gradient Boosting —
        entraînés sur des données réelles pour prédire les compositions
        et les performances des joueurs.
      </div>
    </div>
    <div className="home-benefit-card">
      <div className="home-benefit-number">02</div>
      <div className="home-benefit-title">Données Complètes</div>
      <div className="home-benefit-desc">
        Analyse de 2689 joueurs à travers 98 équipes et 5 ligues
        européennes — Premier League, Ligue 1, Bundesliga, Serie A
        et La Liga.
      </div>
    </div>
    <div className="home-benefit-card">
      <div className="home-benefit-number">03</div>
      <div className="home-benefit-title">Analyses Avancées</div>
      <div className="home-benefit-desc">
        Du clustering K-Means à la simulation Monte Carlo, explorez
        des insights statistiques approfondis sur chaque joueur
        et chaque équipe.
      </div>
    </div>
    <div className="home-benefit-card">
      <div className="home-benefit-number">04</div>
      <div className="home-benefit-title">Interface Moderne</div>
      <div className="home-benefit-desc">
        Tableaux de bord interactifs avec visualisations — radar charts,
        graphiques comparatifs et réseau de passes — pour explorer
        facilement les données complexes.
      </div>
    </div>
    <div className="home-benefit-card">
      <div className="home-benefit-number">05</div>
      <div className="home-benefit-title">Recommandations Stratégiques</div>
      <div className="home-benefit-desc">
        Suggestions basées sur les données pour les transferts,
        les compositions optimales et l'analyse tactique par formation.
      </div>
    </div>
    <div className="home-benefit-card">
      <div className="home-benefit-number">06</div>
      <div className="home-benefit-title">Détection de Talents</div>
      <div className="home-benefit-desc">
        Identifiez les jeunes joueurs prometteurs et détectez
        les anomalies de performance — surperformance ou
        sous-performance — par rapport à la moyenne de leur ligue.
      </div>
    </div>
  </div>
</div>

      <Footer />
    </div>
    </>
  );
}

/* ── FOOTER ── */
function Footer() {
  return (
    <footer className="home-footer">
      <div className="home-footer-container">
        
        <div className="home-footer-top">
          <div className="home-footer-section">
            <h4 className="home-footer-title">SmartLineup</h4>
            <p className="home-footer-tagline">Plateforme d'analyse et de prédiction intelligente pour le football moderne</p>
          </div>

          <div className="home-footer-section">
            <h4 className="home-footer-subtitle">Fonctionnalités</h4>
            <ul className="home-footer-links">
              <li><a href="#lineup">Lineup Prédit</a></li>
              <li><a href="#performance">Performance</a></li>
              <li><a href="#simulation">Simulation</a></li>
              <li><a href="#anomalies">Anomalies</a></li>
            </ul>
          </div>

          <div className="home-footer-section">
            <h4 className="home-footer-subtitle">Outils</h4>
            <ul className="home-footer-links">
              <li><a href="#transfer">Analyse Transferts</a></li>
              <li><a href="#tactical">Stratégie Tactique</a></li>
              <li><a href="#network">Réseau de Passes</a></li>
              <li><a href="#clustering">Clustering Joueurs</a></li>
            </ul>
          </div>

          <div className="home-footer-section">
            <h4 className="home-footer-subtitle">À Propos</h4>
            <ul className="home-footer-links">
              <li><a href="#about">Qui sommes-nous</a></li>
              <li><a href="#tech">Technologie</a></li>
              <li><a href="#data">Données & API</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="home-footer-divider"></div>

        <div className="home-footer-bottom">
          <div className="home-footer-info">
            <p>SmartLineup est une plateforme intelligente développée avec des algorithmes de Machine Learning avancés. Nous analysons les données de 98 équipes dans 5 ligues majeures pour fournir des insights prédictifs uniques.</p>
          </div>
          
          <div className="home-footer-stats">
            <span className="home-footer-stat">2689 Joueurs</span>
            <span className="home-footer-stat-sep">•</span>
            <span className="home-footer-stat">98 Équipes</span>
            <span className="home-footer-stat-sep">•</span>
            <span className="home-footer-stat">5 Ligues</span>
            <span className="home-footer-stat-sep">•</span>
            <span className="home-footer-stat">3 Modèles ML</span>
          </div>

          <div className="home-footer-copyright">
            <p>&copy; 2026 SmartLineup. Tous droits réservés. Créé avec la donnée et la technologie.</p>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Home;