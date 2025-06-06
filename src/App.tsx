import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, BookOpen, Sparkles, Zap, Eye, Plus, Settings, Trash2, Star, Flame, Droplets, Wind, Play, Pause, Volume2 } from 'lucide-react';

interface PixelButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
}

interface PixelPanelProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface Recipe {
  id: number;
  name: string;
  ingredients: string[];
  difficulty: string;
  effect: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  color: string;
  icon: string;
}

const getRarityGradient = (rarity: Recipe['rarity']) => {
  switch(rarity) {
    case 'Common': return 'from-gray-600/70 to-gray-800/70';
    case 'Rare': return 'from-blue-600/70 to-blue-800/70';
    case 'Epic': return 'from-purple-600/70 to-purple-800/70';
    case 'Legendary': return 'from-yellow-500/70 to-orange-600/70';
    default: return 'from-gray-600/70 to-gray-800/70';
  }
};

const getRarityBorder = (rarity: Recipe['rarity']) => {
  switch(rarity) {
    case 'Common': return 'border-gray-400';
    case 'Rare': return 'border-blue-400';
    case 'Epic': return 'border-purple-400';
    case 'Legendary': return 'border-yellow-400';
    default: return 'border-gray-400';
  }
};

const FloatingElement = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <div 
    className="animate-bounce"
    style={{ 
      animationDelay: `${delay}s`,
      animationDuration: '3s',
      animationIterationCount: 'infinite'
    }}
  >
    {children}
  </div>
);

const MagicalOrb = ({ color, size = 'w-3 h-3', delay = 0 }: { color: string, size?: string, delay?: number }) => (
  <div 
    className={`${size} rounded-full animate-pulse`}
    style={{ 
      backgroundColor: color,
      boxShadow: `0 0 20px ${color}, 0 0 40px ${color}60`,
      animationDelay: `${delay}s`,
      animationDuration: '2s'
    }}
  />
);

const PixelButton = React.memo(({ children, onClick, className = '', variant = 'primary', disabled = false }: PixelButtonProps) => {
  const variants = {
    primary: 'from-indigo-600 to-purple-700 border-indigo-400 text-white shadow-lg shadow-indigo-500/50',
    secondary: 'from-slate-600 to-slate-700 border-slate-400 text-white shadow-lg shadow-slate-500/50',
    danger: 'from-red-600 to-red-700 border-red-400 text-white shadow-lg shadow-red-500/50',
    success: 'from-emerald-600 to-emerald-700 border-emerald-400 text-white shadow-lg shadow-emerald-500/50'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-2 font-bold text-sm border-2 bg-gradient-to-b transition-all duration-300
        hover:brightness-125 hover:scale-105 active:scale-95 active:brightness-110
        hover:shadow-2xl transform
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:hover:scale-100
        ${variants[variant]} ${className}
      `}
      style={{
        clipPath: 'polygon(4px 0%, 100% 0%, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0% 100%, 0% 4px)',
        filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.3))'
      }}
    >
      {children}
    </button>
  );
});

const PixelPanel = React.memo(({ children, className = '', glow = false }: PixelPanelProps) => {
  return (
    <div 
      className={`
        bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-2 border-slate-600 
        backdrop-blur-sm transition-all duration-500
        ${glow ? 'shadow-2xl shadow-cyan-500/30 border-cyan-400/50' : 'shadow-lg shadow-black/50'}
        ${className}
      `}
      style={{
        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
        filter: glow ? 'drop-shadow(0 0 15px rgba(34, 211, 238, 0.4))' : 'none'
      }}
    >
      {children}
    </div>
  );
});

const AlchemyApp = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'ai',
      content: '🔮 Greetings, young alchemist! I am Arcanum, your mystical brewing companion. What magical concoction shall we create today? ✨',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([
    {
      id: 1,
      name: 'Crimson Healing Draught',
      ingredients: ['Moonbell Petals', 'Crystal Dewdrops', 'Phoenix Ember'],
      difficulty: 'Intermediate',
      effect: 'Restores 75 Health over 10 seconds',
      rarity: 'Rare',
      color: '#e74c3c',
      icon: '🔴'
    },
    {
      id: 2,
      name: 'Ethereal Veil Elixir',
      ingredients: ['Shadow Moss', 'Spirit Essence', 'Starlight Powder'],
      difficulty: 'Master',
      effect: 'Grants invisibility for 30 seconds',
      rarity: 'Epic',
      color: '#9b59b6',
      icon: '👻'
    },
    {
      id: 3,
      name: 'Lightning Strike Potion',
      ingredients: ['Storm Essence', 'Thunder Crystal', 'Sky Root'],
      difficulty: 'Expert',
      effect: 'Channels lightning through your spells',
      rarity: 'Legendary',
      color: '#f1c40f',
      icon: '⚡'
    }
  ]);
  const [activeTab, setActiveTab] = useState('chat');
  const [isTyping, setIsTyping] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Audio controls
  const togglePlayPause = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleVolumeClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const newVolume = Math.round((clickX / rect.width) * 100);
    handleVolumeChange(Math.max(0, Math.min(100, newVolume)));
  }, [handleVolumeChange]);

  // Initialize audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      audioRef.current.addEventListener('ended', () => setIsPlaying(false));
      audioRef.current.addEventListener('play', () => setIsPlaying(true));
      audioRef.current.addEventListener('pause', () => setIsPlaying(false));
    }
  }, [volume]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(scrollToBottom, [messages, scrollToBottom]);

  const handleSendMessage = useCallback(() => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const responses = [
        '⚗️ Fascinating! For this mystical brew, you\'ll need special ingredients from the Enchanted Forest. The combination creates powerful magical energies! ✨',
        '🔮 Ah, a classic combination! These ingredients resonate with ancient magic. Mix under moonlight for maximum potency. Success rate: 87% 🌙',
        '✨ Excellent selection! This legendary formula was discovered in the Crystal Caverns. Handle with extreme care - the magical essence is volatile! 💎',
        '🌟 Marvelous choice! This potion will channel the very essence of the elements through your being. Prepare for extraordinary magical enhancement! 🔥⚡🌊',
        '🪄 Intriguing! These components create a harmony of magical forces. The resulting elixir will grant you temporary mastery over arcane energies! ⭐'
      ];
      
      const aiMessage: Message = {
        id: Date.now() + 1,
        type: 'ai',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000);
  }, [inputMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  }, []);

  const switchToChat = useCallback(() => setActiveTab('chat'), []);
  const switchToRecipes = useCallback(() => setActiveTab('recipes'), []);

  const saveNewRecipe = useCallback(() => {
    const recipes = [
      { name: 'Mystic Fire Brew', icon: '🔥', color: '#ff4757', rarity: 'Rare' as const },
      { name: 'Frost Shield Elixir', icon: '❄️', color: '#3742fa', rarity: 'Epic' as const },
      { name: 'Wind Walker Potion', icon: '🌪️', color: '#2ed573', rarity: 'Common' as const },
      { name: 'Dragon Breath Draught', icon: '🐉', color: '#ff6b35', rarity: 'Legendary' as const }
    ];
    
    const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
    
    const newRecipe: Recipe = {
      id: Date.now(),
      name: randomRecipe.name,
      ingredients: ['Mystical Element', 'Ethereal Essence', 'Arcane Crystal'],
      difficulty: 'Unknown',
      effect: 'Channels powerful magical energies',
      rarity: randomRecipe.rarity,
      color: randomRecipe.color,
      icon: randomRecipe.icon
    };
    setSavedRecipes(prev => [...prev, newRecipe]);
  }, []);

  const deleteRecipe = useCallback((id: number) => {
    setSavedRecipes(prev => prev.filter(recipe => recipe.id !== id));
  }, []);

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white flex flex-col p-4 space-y-4 font-mono relative overflow-hidden">
      {/* Audio Element */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
      >
        <source src="/assets/music/Fantasy Background Music Celtic Relaxation Free Use.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Floating magical orbs */}
        <div className="absolute top-10 left-10">
          <MagicalOrb color="#8b5cf6" size="w-4 h-4" delay={0} />
        </div>
        <div className="absolute top-32 right-20">
          <MagicalOrb color="#06b6d4" size="w-3 h-3" delay={0.5} />
        </div>
        <div className="absolute bottom-32 left-32">
          <MagicalOrb color="#f59e0b" size="w-5 h-5" delay={1} />
        </div>
        <div className="absolute top-1/2 right-10">
          <MagicalOrb color="#ef4444" size="w-2 h-2" delay={1.5} />
        </div>
        <div className="absolute bottom-20 right-1/3">
          <MagicalOrb color="#10b981" size="w-4 h-4" delay={2} />
        </div>
        
        {/* Floating icons */}
        <div className="absolute top-20 left-1/3">
          <FloatingElement delay={0}>
            <div className="text-purple-400 text-2xl opacity-20">⚗️</div>
          </FloatingElement>
        </div>
        <div className="absolute bottom-40 left-20">
          <FloatingElement delay={1}>
            <div className="text-cyan-400 text-xl opacity-20">🔮</div>
          </FloatingElement>
        </div>
        <div className="absolute top-40 right-1/4">
          <FloatingElement delay={2}>
            <div className="text-yellow-400 text-xl opacity-20">✨</div>
          </FloatingElement>
        </div>
      </div>

      {/* Header */}
      <PixelPanel glow className="flex-shrink-0 p-4 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <FloatingElement>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 border-2 border-purple-300 flex items-center justify-center text-2xl relative" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
                ⚗️
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-30 animate-pulse rounded-full"></div>
              </div>
            </FloatingElement>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
                ✨ Mystical Alchemy Workshop ✨
              </h1>
              <div className="flex items-center space-x-2 mt-1">
                <Zap className="w-3 h-3 text-yellow-400 animate-pulse" />
                <div className="text-xs text-purple-300">AI-Powered Magical Brewing Assistant</div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Music Controls */}
            <div className="flex items-center space-x-3 bg-gradient-to-r from-purple-800 to-indigo-800 px-4 py-2 rounded-lg border-2 border-purple-400/50 backdrop-blur-sm">
              {/* Play/Pause Button */}
              <PixelButton 
                onClick={togglePlayPause}
                variant="primary" 
                className="p-2 !px-2 !py-2"
              >
                {isPlaying ? 
                  <Pause className="w-4 h-4" /> : 
                  <Play className="w-4 h-4" />
                }
              </PixelButton>
              
              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <PixelButton 
                  onClick={toggleMute}
                  variant="secondary" 
                  className="p-1.5 !px-1.5 !py-1.5"
                >
                  <Volume2 className={`w-3 h-3 ${isMuted ? 'text-red-400' : 'text-cyan-300'}`} />
                </PixelButton>
                
                <div className="flex items-center space-x-1">
                  <span className="text-xs font-bold text-purple-200">Vol:</span>
                  <div 
                    className="w-20 h-3 bg-purple-900 rounded-full overflow-hidden cursor-pointer border border-purple-500/50 hover:border-purple-400 transition-colors"
                    onClick={handleVolumeClick}
                  >
                    <div 
                      className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-300 transition-all duration-200 shadow-lg relative"
                      style={{ 
                        width: `${isMuted ? 0 : volume}%`, 
                        boxShadow: '0 0 10px rgba(168, 85, 247, 0.6)' 
                      }}
                    >
                      <div className="absolute right-0 top-0 h-full w-1 bg-white/50 animate-pulse"></div>
                    </div>
                  </div>
                  <span className="text-xs text-purple-200 min-w-8">{isMuted ? '🔇' : `${volume}%`}</span>
                </div>
              </div>
              
              {/* Music Status */}
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></div>
                <span className="text-xs text-purple-300">{isPlaying ? '🎵 Playing' : '⏸️ Paused'}</span>
              </div>
            </div>

            <PixelButton variant="secondary" className="p-2" onClick={() => console.log('Settings')}>
              <Settings className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
            </PixelButton>
          </div>
        </div>
      </PixelPanel>

      {/* Tab Navigation */}
      <div className="flex-shrink-0 flex space-x-2">
        <PixelButton
          onClick={switchToChat}
          variant={activeTab === 'chat' ? 'primary' : 'secondary'}
          className="flex-grow flex items-center justify-center space-x-2"
        >
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>🔮 AI Arcanum</span>
        </PixelButton>
        <PixelButton
          onClick={switchToRecipes}
          variant={activeTab === 'recipes' ? 'primary' : 'secondary'}
          className="flex-grow flex items-center justify-center space-x-2"
        >
          <BookOpen className="w-4 h-4" />
          <span>📚 Recipe Grimoire</span>
        </PixelButton>
      </div>

      {/* Content Area */}
      <PixelPanel className="flex-1 flex flex-col min-h-0 relative">
        {activeTab === 'chat' && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className={`max-w-xl p-4 relative transition-all duration-300 hover:scale-105 ${
                      message.type === 'user'
                        ? 'bg-gradient-to-br from-blue-800 via-blue-700 to-cyan-800 shadow-lg shadow-blue-500/30'
                        : 'bg-gradient-to-br from-purple-800 via-purple-700 to-indigo-800 shadow-lg shadow-purple-500/30'
                    }`}
                     style={{ 
                       clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
                       filter: `drop-shadow(0 0 10px ${message.type === 'user' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(147, 51, 234, 0.4)'})`
                     }}
                  >
                    {message.type === 'ai' && (
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                          🔮
                        </div>
                        <span className="text-purple-300 text-sm font-bold">Arcanum</span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <div className="text-xs text-slate-300 mt-2 text-right opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="bg-gradient-to-br from-purple-800 to-indigo-800 p-4 shadow-lg shadow-purple-500/30" style={{ 
                    clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
                    filter: 'drop-shadow(0 0 10px rgba(147, 51, 234, 0.4))'
                  }}>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                        🔮
                      </div>
                      <span className="text-purple-300 text-sm font-bold">Arcanum</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-purple-200">Consulting the ethereal archives</span>
                      <div className="flex space-x-1">
                        <MagicalOrb color="#8b5cf6" size="w-2 h-2" delay={0} />
                        <MagicalOrb color="#a855f7" size="w-2 h-2" delay={0.2} />
                        <MagicalOrb color="#c084fc" size="w-2 h-2" delay={0.4} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t-2 border-slate-600 bg-gradient-to-r from-slate-800/50 to-slate-700/50 p-4">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="🔮 Ask about magical recipes..."
                  className="flex-1 bg-gradient-to-r from-slate-700 to-slate-600 border-2 border-purple-500/50 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/30 transition-all duration-300"
                />
                <PixelButton onClick={handleSendMessage} className="px-5 relative">
                  <Send className="w-5 h-5" />
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded animate-pulse"></div>
                </PixelButton>
              </div>
            </div>
          </>
        )}

        {activeTab === 'recipes' && (
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b-2 border-slate-600 bg-gradient-to-r from-slate-800/50 to-slate-700/50">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-purple-300 flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 animate-pulse" />
                    <span>📚 Recipe Grimoire</span>
                  </h2>
                  <p className="text-sm text-slate-400">{savedRecipes.length} mystical formulas catalogued</p>
                </div>
                <PixelButton onClick={saveNewRecipe} variant="success" className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>✨ New Recipe</span>
                </PixelButton>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {savedRecipes.map((recipe, index) => (
                  <div
                    key={recipe.id}
                    className={`border-2 p-4 transition-all duration-500 shadow-xl hover:scale-105 hover:shadow-2xl animate-fadeIn ${getRarityBorder(recipe.rarity)}`}
                    style={{
                      clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                      boxShadow: `0 8px 32px ${recipe.color}30`,
                      background: `linear-gradient(135deg, ${recipe.color}20, ${recipe.color}05, transparent)`,
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl border-2 animate-pulse" style={{ backgroundColor: recipe.color + '40', borderColor: recipe.color, boxShadow: `0 0 20px ${recipe.color}60` }}>
                            {recipe.icon}
                          </div>
                          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent animate-ping" style={{ animationDuration: '3s' }}></div>
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-lg">{recipe.name}</h3>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full bg-black/40 border ${getRarityBorder(recipe.rarity)} ${getRarityBorder(recipe.rarity).replace('border-', 'text-')}`}>
                            ⭐ {recipe.rarity}
                          </span>
                        </div>
                      </div>
                      <PixelButton onClick={() => deleteRecipe(recipe.id)} variant="danger" className="p-2">
                        <Trash2 className="w-4 h-4" />
                      </PixelButton>
                    </div>
                    
                    <div className="space-y-3 text-sm mt-4">
                      <div className="bg-black/20 p-3 rounded-lg border border-white/10">
                        <div className="text-purple-300 font-semibold text-sm mb-2 flex items-center space-x-1">
                          <Droplets className="w-3 h-3" />
                          <span>Ingredients:</span>
                        </div>
                        <div className="text-slate-300 flex flex-wrap gap-2">
                          {recipe.ingredients.map(ing => 
                            <span key={ing} className="bg-purple-800/30 px-2 py-1 rounded text-xs border border-purple-600/30">
                              ✨ {ing}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-black/20 p-3 rounded-lg border border-white/10">
                        <div className="flex items-center space-x-2 mb-1">
                          <Zap className="w-3 h-3 text-green-400" />
                          <span className="text-purple-300 font-semibold text-sm">Magical Effect:</span>
                        </div>
                        <span className="text-green-300 text-sm">🌟 {recipe.effect}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 mt-4 pt-3 border-t border-white/10">
                      <PixelButton variant="secondary" className="text-xs px-3 py-2 flex items-center space-x-1" onClick={() => console.log('View recipe', recipe.id)}>
                        <Eye className="w-3 h-3" />
                        <span>👁️ Study</span>
                      </PixelButton>
                      <PixelButton variant="primary" className="text-xs px-3 py-2 flex items-center space-x-1" onClick={() => console.log('Brew recipe', recipe.id)}>
                        <Flame className="w-3 h-3 animate-pulse" />
                        <span>🔥 Brew Now</span>
                      </PixelButton>
                    </div>
                  </div>
                ))}
              </div>
          </div>
        )}
      </PixelPanel>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AlchemyApp; 