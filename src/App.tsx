import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, CloudRain, Leaf, Snowflake, Wand2, RefreshCw, Download, Loader2, Key } from 'lucide-react';
import { generateSeasonImage, editSeasonImage } from './services/geminiService';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

const SEASONS: { name: Season; icon: React.ReactNode; color: string; description: string }[] = [
  { 
    name: 'Spring', 
    icon: <CloudRain className="w-6 h-6" />, 
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    description: 'Cherry blossoms at a traditional Hanok village or Gyeongbokgung palace.'
  },
  { 
    name: 'Summer', 
    icon: <Sun className="w-6 h-6" />, 
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    description: 'Lush green mountains and traditional pavilions by the lotus pond.'
  },
  { 
    name: 'Autumn', 
    icon: <Leaf className="w-6 h-6" />, 
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    description: 'Fiery maple leaves covering ancient stone walls and mountain trails.'
  },
  { 
    name: 'Winter', 
    icon: <Snowflake className="w-6 h-6" />, 
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    description: 'Serene snow-covered tiled roofs and frozen mountain peaks.'
  },
];

export default function App() {
  const [selectedSeason, setSelectedSeason] = useState<Season>('Spring');
  const [images, setImages] = useState<Record<Season, string | null>>({
    Spring: null,
    Summer: null,
    Autumn: null,
    Winter: null,
  });
  const [loading, setLoading] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    };
    checkKey();
  }, []);

  const handleOpenKeySelector = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const fetchImage = async (season: Season) => {
    if (!hasApiKey) return;
    setLoading(true);
    try {
      const url = await generateSeasonImage(season);
      setImages(prev => ({ ...prev, [season]: url }));
    } catch (error) {
      console.error("Failed to generate image:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!images[selectedSeason] || !editPrompt) return;
    setIsEditing(true);
    try {
      const url = await editSeasonImage(images[selectedSeason]!, editPrompt);
      setImages(prev => ({ ...prev, [selectedSeason]: url }));
      setEditPrompt('');
    } catch (error) {
      console.error("Failed to edit image:", error);
    } finally {
      setIsEditing(false);
    }
  };

  useEffect(() => {
    if (!images[selectedSeason] && hasApiKey) {
      fetchImage(selectedSeason);
    }
  }, [selectedSeason, hasApiKey]);

  if (hasApiKey === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-8">
        <div className="max-w-md w-full bg-white rounded-3xl p-12 shadow-xl border border-stone-200 text-center">
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <Key className="w-10 h-10 text-stone-400" />
          </div>
          <h2 className="text-3xl font-serif italic mb-4">API Key Required</h2>
          <p className="text-stone-500 mb-8 leading-relaxed">
            To generate high-quality, realistic images using the latest Gemini models, you need to select a paid API key.
          </p>
          <button
            onClick={handleOpenKeySelector}
            className="w-full bg-stone-900 text-white py-4 rounded-2xl font-medium hover:bg-stone-800 transition-all flex items-center justify-center gap-2"
          >
            Select API Key
          </button>
          <p className="mt-6 text-[10px] text-stone-400 uppercase tracking-widest">
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline">Learn about billing</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-8 md:p-12 border-b border-stone-200 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl md:text-7xl font-serif italic tracking-tight text-stone-900">
              Seasons of Korea
            </h1>
            <p className="mt-4 text-stone-500 font-sans uppercase tracking-widest text-xs font-semibold">
              AI-Generated Korean Atmospheric Landscapes
            </p>
          </div>
          
          <nav className="flex flex-wrap gap-2">
            {SEASONS.map((season) => (
              <button
                key={season.name}
                onClick={() => setSelectedSeason(season.name)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 border ${
                  selectedSeason === season.name 
                    ? season.color 
                    : 'bg-white text-stone-400 border-stone-200 hover:border-stone-400 hover:text-stone-600'
                }`}
              >
                {season.icon}
                {season.name}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-8 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Image Display */}
          <div className="lg:col-span-2 space-y-8">
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-stone-200 shadow-2xl group">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div 
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-stone-100"
                  >
                    <Loader2 className="w-12 h-12 text-stone-400 animate-spin mb-4" />
                    <p className="text-stone-500 font-serif italic">Searching for real-life {selectedSeason} photos in Korea...</p>
                  </motion.div>
                ) : images[selectedSeason] ? (
                  <motion.div
                    key={images[selectedSeason]}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute inset-0"
                  >
                    <img 
                      src={images[selectedSeason]!} 
                      alt={selectedSeason}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 season-card-gradient opacity-60" />
                    <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                      <div className="text-white">
                        <h2 className="text-4xl font-serif italic">{selectedSeason}</h2>
                        <p className="text-white/80 text-sm max-w-md mt-2">
                          {SEASONS.find(s => s.name === selectedSeason)?.description}
                        </p>
                      </div>
                      <button 
                        onClick={() => fetchImage(selectedSeason)}
                        className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors"
                        title="Regenerate"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Wand2 className="w-5 h-5 text-stone-400" />
                <h3 className="text-lg font-serif italic">Transform the Season</h3>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <input 
                  type="text"
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="e.g., 'Add a small cabin in the distance' or 'Make it look like a watercolor painting'"
                  className="flex-1 bg-stone-50 border border-stone-200 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                />
                <button 
                  onClick={handleEdit}
                  disabled={isEditing || !editPrompt || loading}
                  className="bg-stone-900 text-white px-8 py-4 rounded-2xl text-sm font-medium hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {isEditing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  Apply Transformation
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar / Info */}
          <div className="space-y-12">
            <section>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-6">About this collection</h4>
              <p className="text-stone-600 leading-relaxed font-serif text-lg italic">
                Each image is unique, generated in real-time by Gemini AI to reflect the fleeting beauty of nature's cycles.
              </p>
            </section>

            <section className="space-y-6">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-stone-400">Gallery Status</h4>
              <div className="space-y-3">
                {SEASONS.map((s) => (
                  <div key={s.name} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-stone-100">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${images[s.name] ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-50 text-stone-300'}`}>
                        {s.icon}
                      </div>
                      <span className={`text-sm font-medium ${images[s.name] ? 'text-stone-900' : 'text-stone-400'}`}>
                        {s.name}
                      </span>
                    </div>
                    {images[s.name] && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                        Generated
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <div className="pt-8 border-t border-stone-200">
              <p className="text-[10px] text-stone-400 uppercase tracking-widest leading-loose">
                Powered by Gemini 2.5 Flash Image<br/>
                Crafted for Atmospheric Exploration
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
