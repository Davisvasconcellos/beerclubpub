
import React, { useState, useCallback } from 'react';
import { INITIAL_SONGS, BACKGROUND_IMAGES } from './constants';
import { Song } from './types';
import NowPlaying from './components/NowPlaying';
import NextUpFooter from './components/NextUpFooter';
import BottomNav from './components/BottomNav';
import UserDashboard from './components/UserDashboard';
import Sidebar from './components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [playlist] = useState<Song[]>(INITIAL_SONGS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'playlist' | 'dashboard'>('playlist');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentSong = playlist[currentIndex];
  const nextSong = playlist[currentIndex + 1] || null;

  const handleNext = useCallback(() => {
    if (currentIndex < playlist.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, playlist.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const isDashboard = viewMode === 'dashboard';

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col bg-[#050505]">
      
      {/* Background Layer - Somente se não for Dashboard */}
      {!isDashboard && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center bg-transition z-0 opacity-30"
            style={{ backgroundImage: `url(${currentSong.image || BACKGROUND_IMAGES[currentIndex % BACKGROUND_IMAGES.length]})` }}
          />
          <div className="absolute inset-0 soccer-overlay z-10"></div>
        </>
      )}

      {/* Broadcast Header */}
      {!isDashboard && (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4 md:p-6 pointer-events-none">
          <div className="flex items-center gap-2 md:gap-4 pointer-events-auto">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex p-2.5 md:p-3 bg-black/60 border border-white/10 rounded-full backdrop-blur-md hover:bg-white/10 transition-all shadow-lg"
            >
              {sidebarOpen ? (
                <svg width="20" height="20" fill="#60a5fa" viewBox="0 0 24 24"><path d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 15h10v2H7v-2z"/></svg>
              ) : (
                <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
              )}
            </button>

            <div className={currentIndex === 0 
              ? "bg-black/60 backdrop-blur-md border border-white/10 px-3 md:px-4 py-1.5 md:py-2 rounded-full flex items-center gap-2 md:gap-3 transition-all duration-500"
              : "flex items-center transition-all duration-500"
            }>
              {currentIndex === 0 ? (
                <>
                  <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-red-600 rounded-full live-dot"></div>
                  <span className="text-[8px] md:text-xs font-black tracking-[0.2em] uppercase italic text-white">JAM AO VIVO</span>
                </>
              ) : (
                <span className="text-yellow-500 font-oswald font-black italic text-4xl md:text-6xl leading-none drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]">
                  #{currentIndex + 1}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Layout Central */}
      <div className="relative flex-grow flex flex-row overflow-hidden">
        
        {/* Conteúdo Principal */}
        <div className="relative flex-grow flex flex-col overflow-hidden">
          <main className={`relative z-20 flex-grow flex flex-col overflow-hidden ${isDashboard ? '' : 'justify-center items-center px-4 md:px-12 text-center'}`}>
            <AnimatePresence mode="wait">
              {isDashboard ? (
                <UserDashboard 
                  key="dash"
                  currentSong={currentSong} 
                  userQueue={playlist.slice(currentIndex + 1)} 
                />
              ) : (
                <div key="playing" className="w-full h-full flex flex-col items-center justify-center py-2 md:py-4 overflow-y-auto scrollbar-hide">
                  <NowPlaying song={currentSong} isSidebarOpen={sidebarOpen} index={currentIndex} />
                </div>
              )}
            </AnimatePresence>
          </main>

          {/* Footer (Próxima Música) */}
          <AnimatePresence>
            {!isDashboard && (!sidebarOpen || window.innerWidth >= 768) && (
              <motion.footer 
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="relative z-30 h-24 md:h-32 w-full border-t border-white/10 bg-black/95 backdrop-blur-xl flex items-stretch overflow-hidden shrink-0"
              >
                <button onClick={handlePrev} className="h-full flex items-center justify-center px-4 md:px-8 border-r border-white/5 hover:bg-white/5 transition-colors">
                  <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                </button>
                <div className="flex-grow flex items-center justify-between px-2 md:px-12 overflow-hidden">
                  <NextUpFooter song={nextSong} index={currentIndex} />
                </div>
                <button onClick={handleNext} className="h-full flex items-center justify-center px-4 md:px-8 border-l border-white/5 bg-blue-600/5 hover:bg-blue-600/20 transition-colors">
                  <svg width="20" height="20" fill="#60a5fa" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                </button>
              </motion.footer>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Playlist */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          playlist={playlist} 
          currentIndex={currentIndex}
          onSelectSong={(idx) => {
            setCurrentIndex(idx);
            if (window.innerWidth < 768) setSidebarOpen(false);
          }}
        />
      </div>

      {/* Barra Nav Footer Fixa */}
      <BottomNav activeView={viewMode} onViewChange={setViewMode} isSidebarOpen={sidebarOpen} />
    </div>
  );
};

export default App;
