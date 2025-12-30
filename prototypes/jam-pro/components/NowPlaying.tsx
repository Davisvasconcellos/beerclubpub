
import React, { useEffect, useState } from 'react';
import { Song } from '../types';

interface NowPlayingProps {
  song: Song;
  isSidebarOpen: boolean;
  index: number;
}

const NowPlaying: React.FC<NowPlayingProps> = ({ song, isSidebarOpen, index }) => {
  const [visibleSingers, setVisibleSingers] = useState<number[]>([]);

  useEffect(() => {
    setVisibleSingers([]);
    song.singers.forEach((_, i) => {
      setTimeout(() => {
        setVisibleSingers(prev => [...prev, i]);
      }, 150 + (i * 100));
    });
  }, [song]);

  const isMobile = window.innerWidth < 768;
  const isSidebarColumn = isSidebarOpen && !isMobile;

  const titleSize = isMobile ? 'text-3xl' : (isSidebarColumn ? 'text-4xl md:text-5xl lg:text-6xl' : 'text-4xl md:text-6xl lg:text-7xl');
  const artistSize = isMobile ? 'text-sm' : 'text-lg md:text-2xl';
  const avatarSize = isMobile 
    ? 'w-24 h-24' 
    : (isSidebarColumn || song.singers.length > 2 ? 'w-20 h-20 md:w-32 md:h-32 lg:w-36 lg:h-36' : 'w-32 h-32 md:w-52 md:h-52 lg:w-60 lg:h-60');
  const nameSize = isMobile ? 'text-lg' : 'text-xl md:text-2xl';

  return (
    <div className="w-full flex flex-col items-center">
      <div className="animate-title w-full flex flex-col items-center mb-2 md:mb-6 shrink-0">
        {index === 0 && (
          <h2 className="text-emerald-500 font-oswald uppercase tracking-[0.5em] text-[8px] md:text-xs font-bold mb-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_emerald]"></span>
            AGORA NO PALCO
          </h2>
        )}
        <h1 className={`text-white font-oswald font-black ${titleSize} italic uppercase leading-tight tracking-tighter neon-text`}>
          {song.title}
        </h1>
        <div className="flex flex-col items-center mt-1">
          <p className={`text-gray-400 ${artistSize} font-light tracking-[0.3em] uppercase`}>{song.artist}</p>
          {!isMobile && (
            <p className="text-blue-400/50 italic text-[10px] md:text-base mt-2 font-medium">"Sinta a vibe!"</p>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap justify-center items-end gap-2 md:gap-8 w-full overflow-visible shrink pb-4 md:pb-10">
        {song.singers.map((s, i) => (
          <div 
            key={i} 
            className={`singer-card flex flex-col items-center ${visibleSingers.includes(i) ? 'visible' : ''}`}
          >
            <div className={`relative ${avatarSize} mb-1 md:mb-4`}>
              <div className="absolute inset-0 rounded-full border-[3px] md:border-[4px] border-emerald-500/20 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full overflow-hidden border border-white/40 shadow-xl bg-gray-900">
                <img src={s.image} className="w-full h-full object-cover" alt={s.name} />
              </div>
            </div>
            <div className="name-tag bg-white px-3 md:px-8 py-1 md:py-2 flex flex-col items-center min-w-[80px] md:min-w-[120px]">
              <span className={`name-text text-black font-oswald font-black ${nameSize} uppercase italic leading-none`}>
                {s.name}
              </span>
              <span className="name-text text-blue-700 font-black text-[7px] md:text-[10px] uppercase tracking-tighter mt-0.5 md:mt-1 border-t border-blue-100 pt-0.5 md:pt-1">
                {s.instrument}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NowPlaying;
