import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Trash2 } from 'lucide-react';

export default function SereneIntervalTimer() {
  const [intervals, setIntervals] = useState([
    { id: 1, duration: 60, rest: 30 }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
  const [isRestPhase, setIsRestPhase] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [completedCycles, setCompletedCycles] = useState(0);
  
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio();
  }, []);

  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      playChime();
      
      if (isRestPhase) {
        if (currentIntervalIndex < intervals.length - 1) {
          setCurrentIntervalIndex(prev => prev + 1);
          setTimeLeft(intervals[currentIntervalIndex + 1].duration);
          setIsRestPhase(false);
        } else {
          setIsRunning(false);
          setCompletedCycles(prev => prev + 1);
          setCurrentIntervalIndex(0);
          setTimeLeft(intervals[0].duration);
          setIsRestPhase(false);
        }
      } else {
        setTimeLeft(intervals[currentIntervalIndex].rest);
        setIsRestPhase(true);
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, isRestPhase, currentIntervalIndex, intervals]);

  const playChime = () => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create a beautiful bell-like sound with harmonics
    const playNote = (frequency, startTime, duration, volume) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };
    
    // Create a resonant singing bowl effect with harmonics
    const baseFreq = 528; // Solfeggio frequency (healing/peaceful)
    const now = context.currentTime;
    
    // Fundamental tone
    playNote(baseFreq, now, 2.5, 0.3);
    // Perfect fifth harmony
    playNote(baseFreq * 1.5, now + 0.05, 2.3, 0.15);
    // Octave harmony
    playNote(baseFreq * 2, now + 0.1, 2.0, 0.1);
    // Third harmony
    playNote(baseFreq * 1.25, now + 0.15, 1.8, 0.08);
  };

  const toggleTimer = () => {
    if (!isRunning) {
      setTimeLeft(intervals[currentIntervalIndex].duration);
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setCurrentIntervalIndex(0);
    setIsRestPhase(false);
    setTimeLeft(intervals[0].duration);
  };

  const addInterval = () => {
    if (intervals.length < 7) {
      setIntervals([...intervals, { 
        id: Date.now(), 
        duration: 60, 
        rest: 30 
      }]);
    }
  };

  const removeInterval = (id) => {
    if (intervals.length > 1) {
      const newIntervals = intervals.filter(int => int.id !== id);
      setIntervals(newIntervals);
      if (isRunning) resetTimer();
    }
  };

  const updateInterval = (id, field, value) => {
    setIntervals(intervals.map(int => 
      int.id === id ? { ...int, [field]: parseInt(value) || 0 } : int
    ));
    if (isRunning) resetTimer();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = isRestPhase 
    ? (intervals[currentIntervalIndex].rest - timeLeft) / intervals[currentIntervalIndex].rest * 100
    : (intervals[currentIntervalIndex].duration - timeLeft) / intervals[currentIntervalIndex].duration * 100;

  return (
    <div className="min-h-screen relative p-4 flex flex-col overflow-hidden">
      {/* Purple nature background image */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?q=80&w=2000)',
          filter: 'brightness(0.85)'
        }}
      ></div>
      
      {/* Overlay gradient for better readability */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-purple-900/20 via-transparent to-purple-900/30"></div>
      
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col relative z-10">
        {/* Header */}
        <div className="text-center mb-8 mt-4">
          <h1 className="text-3xl font-light text-white drop-shadow-lg mb-2">Serene Timer</h1>
          <p className="text-purple-100 text-sm drop-shadow">Find your peaceful rhythm</p>
          <div className="mt-2 text-xs text-purple-200 italic font-light tracking-wide">~ Leena ~</div>
        </div>

        {/* Main Timer Display */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-8 mb-6 shadow-2xl relative overflow-hidden border border-white/40">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 to-pink-50/60 opacity-60"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-4">
              <div className="text-sm text-purple-600 mb-2">
                {isRestPhase ? '🌿 Rest Phase' : '🌸 Work Phase'}
              </div>
              <div className="text-6xl font-light text-purple-900 mb-2">
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-green-600">
                Interval {currentIntervalIndex + 1} of {intervals.length}
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-purple-100 rounded-full overflow-hidden mb-6">
              <div 
                className={`h-full transition-all duration-1000 ${isRestPhase ? 'bg-green-400' : 'bg-purple-400'}`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {/* Control buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={toggleTimer}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center"
              >
                {isRunning ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
              </button>
              <button
                onClick={resetTimer}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-300 to-orange-400 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center"
              >
                <RotateCcw size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Intervals Configuration */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-2xl flex-1 overflow-y-auto border border-white/40">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-light text-purple-900">Your Intervals</h2>
            {intervals.length < 7 && (
              <button
                onClick={addInterval}
                className="p-2 rounded-full bg-gradient-to-br from-green-300 to-green-400 text-white hover:shadow-lg transform hover:scale-105 transition-all"
              >
                <Plus size={20} />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {intervals.map((interval, index) => (
              <div 
                key={interval.id}
                className={`bg-gradient-to-br ${
                  currentIntervalIndex === index && isRunning
                    ? 'from-purple-100 to-orange-100 ring-2 ring-purple-300'
                    : 'from-white to-yellow-50'
                } rounded-2xl p-4 shadow transition-all`}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-purple-700">
                    Interval {index + 1}
                  </span>
                  {intervals.length > 1 && (
                    <button
                      onClick={() => removeInterval(interval.id)}
                      className="p-1 rounded-full hover:bg-red-100 text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-purple-600 block mb-1">
                      Work (seconds)
                    </label>
                    <input
                      type="number"
                      value={interval.duration}
                      onChange={(e) => updateInterval(interval.id, 'duration', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-white/80 text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-300"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-green-600 block mb-1">
                      Rest (seconds)
                    </label>
                    <input
                      type="number"
                      value={interval.rest}
                      onChange={(e) => updateInterval(interval.id, 'rest', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-green-200 bg-white/80 text-green-900 focus:outline-none focus:ring-2 focus:ring-green-300"
                      min="1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {completedCycles > 0 && (
          <div className="text-center mt-4 text-sm text-purple-600">
            🌺 Completed cycles: {completedCycles}
          </div>
        )}
      </div>
    </div>
  );
}