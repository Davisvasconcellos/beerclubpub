
import React from 'react';
import { motion } from 'framer-motion';
import { Singer } from '../types';

interface SingerCircleProps {
  singer: Singer;
  index: number;
  size?: 'small' | 'large';
}

const SingerCircle: React.FC<SingerCircleProps> = ({ singer, index, size = 'large' }) => {
  const isLarge = size === 'large';
  
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0, rotateY: 90 }}
      animate={{ scale: 1, opacity: 1, rotateY: 0 }}
      transition={{ 
        delay: 0.5 + (index * 0.3), 
        duration: 0.8, 
        type: "spring",
        stiffness: 100 
      }}
      className="flex flex-col items-center group"
    >
      <div className={`relative ${isLarge ? 'w-48 h-48 md:w-64 md:h-64' : 'w-24 h-24'} mb-4`}>
        {/* Glowing ring effect */}
        <div className="absolute inset-0 rounded-full border-4 border-blue-500/50 animate-pulse" />
        <div className="absolute inset-2 rounded-full border border-white/30" />
        
        {/* Profile Image */}
        <div className="absolute inset-0 rounded-full overflow-hidden shadow-2xl border-2 border-white/50 bg-gray-800">
          <img 
            src={singer.image} 
            alt={singer.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        {/* Glossy overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
      </div>

      {/* Singer Name Label with Instrument */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 + (index * 0.3) }}
        className="bg-white px-6 py-2 rounded skew-x-[-10deg] shadow-lg relative overflow-hidden flex flex-col items-center"
      >
        {/* Animated sheen on name tag */}
        <motion.div 
           initial={{ x: '-100%' }}
           animate={{ x: '200%' }}
           transition={{ repeat: Infinity, duration: 3, delay: 2 }}
           className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-200/40 to-transparent skew-x-[10deg]" 
        />
        <span className="text-black font-oswald font-bold text-2xl md:text-3xl skew-x-[10deg] uppercase leading-none">
          {singer.name}
        </span>
        <span className="text-blue-600 font-bold text-[10px] md:text-xs skew-x-[10deg] uppercase tracking-widest mt-1">
          {singer.instrument}
        </span>
      </motion.div>
    </motion.div>
  );
};

export default SingerCircle;
