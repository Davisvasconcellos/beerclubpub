
import React from 'react';
import { Song } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: Song[];
  currentIndex: number;
  onSelectSong: (index: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, playlist, currentIndex, onSelectSong }) => {
  if (!isOpen) return null;

  return (
    <aside className="relative z-[100] md:z-40 w-full md:w-[25%] lg:w-[20%] bg-black/98 border-l border-white/10 backdrop-blur-3xl flex flex-col overflow-hidden shrink-0 h-full">
      <div className="p-6 pb-2 mt-8 md:mt-12 flex justify-between items-center">
        <div>
          <h2 className="font-oswald text-2xl md:text-3xl font-black italic tracking-tighter text-blue-500 uppercase">FILA DE ESPERA</h2>
          <p className="text-[9px] font-bold tracking-[0.2em] text-gray-500 uppercase mt-1">
            {playlist.length - 1} MÚSICAS EM ESPERA
          </p>
        </div>
        <button onClick={onClose} className="md:hidden p-2 bg-white/5 rounded-full">
          <svg width="24" height="24" fill="white" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
      </div>
      <div className="flex-grow overflow-y-auto px-4 pb-12 space-y-1 scrollbar-hide">
        {playlist.map((song, idx) => {
          const isNowOnStage = idx === currentIndex;
          const isActuallyNext = idx === 1 && currentIndex === 0;
          const position = idx + 1;

          const activeClass = isNowOnStage ? 'bg-emerald-500/10 border-l-4 border-emerald-500' : 'border-b border-white/5';
          const textColor = isNowOnStage ? 'text-emerald-400' : 'text-gray-200';

          return (
            <div 
              key={song.id} 
              onClick={() => onSelectSong(idx)}
              className={`flex items-center gap-3 p-4 hover:bg-white/5 transition-all group cursor-pointer ${activeClass} last:border-none`}
            >
              <div className="w-20 shrink-0 flex justify-center items-center">
                {isActuallyNext ? (
                  <div className="bg-blue-600 px-3 py-1 skew-x-[-15deg] shadow-lg">
                    <span className="text-white font-oswald font-black text-[10px] uppercase italic skew-x-[15deg] block leading-none">PRÓXIMA</span>
                  </div>
                ) : isNowOnStage ? (
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
                ) : (
                  <div className="font-oswald italic font-black text-2xl text-yellow-500/80 group-hover:text-yellow-500 transition-colors">#{position}</div>
                )}
              </div>
              <div className="flex-grow min-w-0">
                <h4 className={`${textColor} font-black text-[12px] md:text-sm truncate uppercase tracking-tight group-hover:text-white transition-colors`}>{song.title}</h4>
                <p className="text-gray-500 text-[8px] md:text-[10px] uppercase tracking-widest font-bold">{song.artist}</p>
              </div>
              <div className="flex -space-x-2 shrink-0 ml-1">
                 {song.singers.map((s, si) => (
                   <img key={si} src={s.image} className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-black shadow" alt={s.name} />
                 ))}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
