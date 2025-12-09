import React from 'react';

interface Props {
  color: string;
  isFlipped?: boolean;
}

export const KazakhPlayer: React.FC<Props> = ({ color, isFlipped }) => {
  return (
    <svg 
      width="40" 
      height="60" 
      viewBox="0 0 100 150" 
      className={`player-svg ${isFlipped ? 'scale-x-[-1]' : ''}`}
      style={{ overflow: 'visible' }}
    >
      {/* Head */}
      <circle cx="50" cy="25" r="20" fill={color} stroke="black" strokeWidth="2" />
      
      {/* Body */}
      <path 
        d="M50 45 L50 100 L20 145 M50 100 L80 145" 
        stroke={color} 
        strokeWidth="12" 
        strokeLinecap="round" 
        fill="none" 
      />
      
      {/* Arms Pulling */}
      <path 
        d="M50 55 L20 80 L80 80" 
        stroke={color} 
        strokeWidth="10" 
        strokeLinecap="round" 
        fill="none" 
      />
      
      {/* Headgear/Takiya details */}
      <path d="M30 25 Q50 10 70 25" fill="none" stroke="white" strokeWidth="2" />
    </svg>
  );
};