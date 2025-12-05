import React from 'react';

interface KazakhPlayerProps {
  team: 'team1' | 'team2';
  pose: 'pulling' | 'standing';
}

export const KazakhPlayer: React.FC<KazakhPlayerProps> = ({ team, pose }) => {
  const isBlue = team === 'team1';
  const colorPrimary = isBlue ? '#2563EB' : '#DC2626'; // Blue-600 : Red-600
  const colorDark = isBlue ? '#1E40AF' : '#991B1B';
  
  // Simple rotation for "pulling" effect
  const rotation = pose === 'pulling' 
    ? (isBlue ? -15 : 15) 
    : 0;

  return (
    <svg
      width="60"
      height="100"
      viewBox="0 0 60 100"
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: 'transform 0.3s ease-out',
        overflow: 'visible' 
      }}
    >
      {/* Legs */}
      <path d="M20,70 L10,100 M40,70 L50,100" stroke="#1f2937" strokeWidth="8" strokeLinecap="round" />
      
      {/* Body / Chapan Base */}
      <rect x="15" y="30" width="30" height="45" rx="5" fill={colorPrimary} />
      
      {/* Ornament / Vest Detail - Stylized */}
      <path d="M15,30 L30,50 L45,30" fill="none" stroke="white" strokeWidth="3" />
      <path d="M15,75 L45,75" stroke="#FFD700" strokeWidth="4" /> {/* Gold belt */}

      {/* Arms - Pulling rope */}
      {isBlue ? (
         <path d="M20,35 L5,50 L30,50" fill="none" stroke={colorDark} strokeWidth="6" strokeLinecap="round" />
      ) : (
         <path d="M40,35 L55,50 L30,50" fill="none" stroke={colorDark} strokeWidth="6" strokeLinecap="round" />
      )}

      {/* Head */}
      <circle cx="30" cy="20" r="12" fill="#F3E5AB" />
      
      {/* Hat (Takir/Kalpak stylized) */}
      {isBlue ? (
        // Tall Hat (Kalpak style)
        <path d="M18,14 L30,-5 L42,14 L18,14 Z" fill="white" stroke="#1f2937" strokeWidth="1" />
      ) : (
        // Rounded Hat (Takir style)
        <path d="M16,12 Q30,-2 44,12 Z" fill={colorDark} stroke="#1f2937" strokeWidth="1" />
      )}
      
      {/* Face */}
      <circle cx="26" cy="18" r="1" fill="#000" />
      <circle cx="34" cy="18" r="1" fill="#000" />
    </svg>
  );
};