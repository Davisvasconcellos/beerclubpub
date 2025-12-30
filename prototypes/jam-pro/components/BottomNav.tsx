
import React from 'react';

interface BottomNavProps {
  activeView: 'playlist' | 'dashboard';
  onViewChange: (view: 'playlist' | 'dashboard') => void;
  isSidebarOpen: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, onViewChange, isSidebarOpen }) => {
  const isMobile = window.innerWidth < 768;
  if (isMobile && isSidebarOpen && activeView === 'playlist') return null;

  return (
    <nav className="relative z-[60] h-20 w-full bg-black border-t-2 border-white/10 flex items-stretch shrink-0">
      <button 
        onClick={() => onViewChange('dashboard')}
        className={`flex-1 flex items-center justify-center border-r border-white/5 hover:bg-white/5 transition-colors group ${activeView === 'dashboard' ? 'bg-blue-600/10' : ''}`}
      >
        <div className="flex flex-col items-center">
          <span className="text-white font-oswald font-black italic text-2xl md:text-3xl leading-none">D</span>
          <span className="text-blue-500 font-oswald font-bold text-[9px] uppercase tracking-[0.2em] mt-1 opacity-60 group-hover:opacity-100">Dashboard</span>
        </div>
      </button>
      <button 
        onClick={() => onViewChange('playlist')}
        className={`flex-1 flex items-center justify-center hover:bg-white/5 transition-colors group ${activeView === 'playlist' ? 'bg-blue-600/10' : ''}`}
      >
        <div className="flex flex-col items-center">
          <span className="text-white font-oswald font-black italic text-2xl md:text-3xl leading-none">P</span>
          <span className="text-blue-500 font-oswald font-bold text-[9px] uppercase tracking-[0.2em] mt-1 opacity-60 group-hover:opacity-100">Playlist</span>
        </div>
      </button>
    </nav>
  );
};

export default BottomNav;
