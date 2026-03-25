import { useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SearchScreen from '@/components/screens/SearchScreen';
import SongResultsScreen from '@/components/screens/SongResultsScreen';
import LyricsScreen from '@/components/screens/LyricsScreen';
import ImageScreen from '@/components/screens/ImageScreen';

function App() {
  const { currentStep, setStep } = useAppStore();

  // Always dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (currentStep > 1) {
          setStep((currentStep - 1) as 1 | 2 | 3 | 4);
        }
      }
    },
    [currentStep, setStep]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="min-h-dvh flex flex-col bg-[#0a0a0a] text-neutral-100 transition-colors duration-300">
      <Header />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {currentStep === 1 && <SearchScreen key="search" />}
          {currentStep === 2 && <SongResultsScreen key="results" />}
          {currentStep === 3 && <LyricsScreen key="lyrics" />}
          {currentStep === 4 && <ImageScreen key="image" />}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

export default App;
