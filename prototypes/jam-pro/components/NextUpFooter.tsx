
import React from 'react';
import { Song } from '../types';

interface NextUpFooterProps {
  song: Song | null;
  index: number;
}

const NextUpFooter: React.FC<NextUpFooterProps> = ({ song, index }) => {
  if (!song) {
    return <span className="text-gray-700 font-oswald italic text-sm md:text-2xl uppercase tracking-widest font-bold w-full text-center">FIM DA LISTA</span>;
  }

  const badgeLabel = index === 0 ? 'PRÓXIMA' : `#${index + 2}`;

  return (
    <>
      <div id="next-song-container" className="flex items-center gap-2 md:gap-10 flex-grow min-w-0 overflow-hidden">
        <div className="bg-blue-600 px-4 md:px-10 py-2 md:py-3 shrink-0 skew-x-[-15deg] shadow-[0_4px_15px_rgba(37,99,235,0.4)]">
          <span className="text-white font-oswald font-black text-[12px] md:text-2xl skew-x-[15deg] block leading-none tracking-tighter uppercase">{badgeLabel}</span>
        </div>
        <div className="flex flex-col flex-grow min-w-0 pr-1 md:pr-4">
          <span className="text-white font-black text-base md:text-4xl lg:text-5xl uppercase font-oswald italic tracking-tight leading-none overflow-hidden text-ellipsis whitespace-nowrap block">
            {song.title}
          </span>
          <span className="text-gray-500 text-[8px] md:text-base uppercase tracking-[0.2em] font-bold mt-0.5 md:mt-1">
            {song.artist}
          </span>
        </div>
      </div>
      <div className="flex -space-x-3 md:-space-x-4 items-center shrink-0 ml-2 md:ml-4">
        {song.singers.map((s, i) => (
          <div key={i} className="w-10 h-10 md:w-20 md:h-20 rounded-full border-2 border-white/20 overflow-hidden ring-2 ring-black shadow-xl shrink-0">
            <img src={s.image} className="w-full h-full object-cover" alt={s.name} />
          </div>
        ))}
      </div>
    </>
  );
};

export default NextUpFooter;
