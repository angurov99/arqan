import React from 'react';
import { motion } from 'framer-motion';
import { KazakhPlayer } from './KazakhPlayer';

interface GameVisualsProps {
  ropePosition: number; // -5 to 5
}

export const GameVisuals: React.FC<GameVisualsProps> = ({ ropePosition }) => {
  // Convert logic position (-5 to 5) to pixel offset
  // -5 (Team 1 wins) means shifting LEFT (negative X)
  // Team 1 is on the LEFT, so if they win, the rope moves towards them (Negative X).
  // Team 2 is on the RIGHT, so if they win, the rope moves towards them (Positive X).
  const stepSize = 40;
  const xOffset = ropePosition * stepSize; 

  return (
    <div className="relative w-full h-64 bg-gray-50 border-y border-gray-200 overflow-hidden flex items-center justify-center">
      
      {/* Static Ground Line */}
      <div className="absolute bottom-10 w-full h-1 bg-gray-300"></div>
      
      {/* Center Marker Line (Static) */}
      <div className="absolute h-full w-0.5 bg-gray-300 border-dashed border-l-2 z-0"></div>
      <div className="absolute top-4 bg-gray-800 text-white text-xs px-2 py-1 rounded z-10 font-bold tracking-wider">
        START
      </div>

      {/* Moving Container (Rope + Players) */}
      <motion.div
        className="flex items-center justify-center relative z-10"
        animate={{ x: xOffset }}
        transition={{ type: "spring", stiffness: 120, damping: 15 }}
      >
        {/* TEAM 1 (Left) */}
        <div className="flex space-x-[-15px] mr-2">
           <KazakhPlayer team="team1" pose="pulling" />
           <KazakhPlayer team="team1" pose="pulling" />
           <KazakhPlayer team="team1" pose="pulling" />
        </div>

        {/* ROPE */}
        <div className="relative w-96 h-3 bg-amber-800 rounded flex items-center justify-center shadow-sm">
            {/* Rope texture */}
            <div className="absolute w-full h-full opacity-30" 
                 style={{backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, #000 5px, #000 6px)'}}>
            </div>
            
            {/* Center Flag on Rope */}
            <div className="w-4 h-12 bg-red-600 border-2 border-white shadow-md absolute -top-4"></div>
        </div>

        {/* TEAM 2 (Right) */}
        <div className="flex space-x-[-15px] ml-2 flex-row-reverse">
           <KazakhPlayer team="team2" pose="pulling" />
           <KazakhPlayer team="team2" pose="pulling" />
           <KazakhPlayer team="team2" pose="pulling" />
        </div>
      </motion.div>
    </div>
  );
};