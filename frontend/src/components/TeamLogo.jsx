// frontend/src/components/TeamLogo.jsx

import React, { useState, useEffect } from 'react';

// Cache pour éviter les appels répétés
const logoCache = {};

// Couleur unique basée sur le nom de l'équipe
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 60%, 35%)`;
}

// Avatar avec initiales
function TeamAvatar({ name, size = 32 }) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const color = stringToColor(name);

  return (
    <div style={{
      width:           size,
      height:          size,
      borderRadius:    '50%',
      backgroundColor: color,
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      fontSize:        size * 0.35,
      fontWeight:      700,
      color:           '#ffffff',
      flexShrink:      0,
      border:          '2px solid rgba(255,255,255,0.1)'
    }}>
      {initials}
    </div>
  );
}

// Composant principal
function TeamLogo({ teamName, size = 32, showName = false }) {
  const [logoUrl, setLogoUrl]   = useState(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!teamName) return;

    // Vérifier le cache
    if (logoCache[teamName] !== undefined) {
      setLogoUrl(logoCache[teamName]);
      return;
    }

    // Appeler l'API
    fetch(`http://localhost:8000/api/teams/logo?team_name=${encodeURIComponent(teamName)}`)
      .then(r => r.json())
      .then(data => {
        const url = data.logo || null;
        logoCache[teamName] = url;
        setLogoUrl(url);
      })
      .catch(() => {
        logoCache[teamName] = null;
        setLogoUrl(null);
      });
  }, [teamName]);

  const Logo = () => {
    if (logoUrl && !imgError) {
      return (
        <img
          src={logoUrl}
          alt={teamName}
          width={size}
          height={size}
          style={{ objectFit: 'contain', flexShrink: 0 }}
          onError={() => setImgError(true)}
        />
      );
    }
    return <TeamAvatar name={teamName || '?'} size={size} />;
  };

  if (showName) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Logo />
        <span>{teamName}</span>
      </div>
    );
  }

  return <Logo />;
}

export default TeamLogo;
export { TeamAvatar };