import React from 'react';
import { KazakhPlayer } from './KazakhPlayer';

interface Props {
  ropePosition: number;
}

export const GameVisuals: React.FC<Props> = ({ ropePosition }) => {
  // ropePosition goes from -5 (Left/Blue wins) to 5 (Right/Red wins)
  // We translate the rope container. 
  // Let's say max translation is +/- 40% of the screen width or 200px.
  // Using Tailwind translate classes is tricky for dynamic values, so we use style.
  
  // Calculate offset in pixels (approx)
  const offset = ropePosition * 50; 

  return (
    <div className="relative w-full h-64 bg-gray-50 border-y border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
        {/* Static Ground */}
        <div className="absolute bottom-10 w-full h-1 bg-gray-300"></div>
        {/* Center Line */}
        <div className="absolute h-full w-0.5 bg-gray-300 border-dashed border-l-2 z-0"></div>
        <div className="absolute top-4 bg-gray-800 text-white text-xs px-2 py-1 rounded z-10 font-bold tracking-wider">START</div>

        {/* MOVING CONTAINER (Players + Rope) */}
        <div 
          id="rope-assembly" 
          className="flex items-center justify-center relative z-10"
          style={{ transform: `translateX(${offset}px)`, transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
            {/* TEAM 1 (Left - Blue) */}
            <div className="flex space-x-[-15px] mr-2">
                {[1,2,3].map(i => (
                  <KazakhPlayer key={`t1-${i}`} color="#2563EB" />
                ))}
            </div>

            {/* ROPE */}
            <div className="relative w-96 h-3 bg-amber-800 rounded flex items-center justify-center shadow-sm">
                <div className="absolute w-full h-full opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, #000 5px, #000 6px)' }}></div>
                {/* Center Flag */}
                <div className="w-4 h-12 bg-red-600 border-2 border-white shadow-md absolute -top-4"></div>
            </div>

            {/* TEAM 2 (Right - Red) */}
            <div className="flex space-x-[-15px] ml-2 flex-row-reverse">
                {[1,2,3].map(i => (
                  <KazakhPlayer key={`t2-${i}`} color="#DC2626" isFlipped />
                ))}
            </div>
        </div>
    </div>
  );
};