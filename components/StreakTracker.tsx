import React, { useMemo } from 'react';
import { VideoProject, Stage } from '../types';
import { Zap, Info } from 'lucide-react';

interface Props {
  projects: VideoProject[];
}

export const StreakTracker: React.FC<Props> = ({ projects }) => {
  // Generate last 52 weeks
  const weeks = useMemo(() => {
    const today = new Date();
    // Reset to Sunday
    const day = today.getDay();
    const diff = today.getDate() - day;
    const currentWeekStart = new Date(today.setDate(diff));
    currentWeekStart.setHours(0,0,0,0);

    const result = [];
    // Start 51 weeks ago
    for (let i = 51; i >= 0; i--) {
        const d = new Date(currentWeekStart);
        d.setDate(d.getDate() - (i * 7));
        result.push(d);
    }
    return result;
  }, []);

  const getIntensity = (weekStart: Date) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const uploadsInWeek = projects.filter(p => {
        if (p.stage !== Stage.PUBLISHED) return false;
        const pDate = new Date(p.updatedAt); 
        return pDate >= weekStart && pDate <= weekEnd;
    });

    return { count: uploadsInWeek.length, hasUpload: uploadsInWeek.length > 0 };
  };

  const streakStats = useMemo(() => {
      // Calculate current streak backwards from today
      const today = new Date();
      let streak = 0;
      let currentWeekIdx = 51; // The last index in our weeks array is "this week"
      
      while (currentWeekIdx >= 0) {
        const week = weeks[currentWeekIdx];
        const { hasUpload } = getIntensity(week);
        
        // If it's the current week, we count it if there is an upload, 
        // but if there isn't one YET, we don't break the streak from last week.
        if (currentWeekIdx === 51) {
             if (hasUpload) streak++;
        } else {
             if (hasUpload) streak++;
             else break;
        }
        currentWeekIdx--;
      }
      return streak;
  }, [projects, weeks]);

  return (
    <div className="flex items-center gap-6 p-4 border border-white/5 bg-zinc-900/40 backdrop-blur-md rounded-xl shadow-sm mb-8 relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none" />

      <div className="relative flex flex-col items-start gap-1 min-w-[140px]">
        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Current Streak</span>
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${streakStats > 0 ? 'bg-yellow-500/20' : 'bg-zinc-800'}`}>
                <Zap className={`w-5 h-5 ${streakStats > 0 ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600'}`} />
            </div>
            <div>
                <span className="text-2xl font-bold text-white leading-none">{streakStats}</span>
                <span className="text-xs text-zinc-500 font-medium ml-1">weeks</span>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-1 relative z-10">
        <div className="flex gap-[3px] h-10 items-end">
            {weeks.map((week, i) => {
                const { count } = getIntensity(week);
                const isCurrentWeek = i === 51;
                let bgClass = 'bg-zinc-800/50';
                
                if (count >= 1) bgClass = 'bg-indigo-500';
                if (count >= 2) bgClass = 'bg-indigo-400';
                if (count >= 3) bgClass = 'bg-indigo-300';
                
                return (
                    <div 
                        key={i} 
                        className={`
                            relative w-2.5 rounded-sm transition-all duration-300 group/block
                            ${bgClass}
                            ${isCurrentWeek && count > 0 ? 'animate-pulse-glow shadow-[0_0_10px_rgba(99,102,241,0.5)] z-10' : ''}
                            ${count > 0 ? 'hover:scale-y-110 hover:bg-indigo-400' : 'hover:bg-zinc-700'}
                        `}
                        style={{ height: count > 0 ? '24px' : '12px' }}
                    >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/block:block z-50 whitespace-nowrap">
                             <div className="bg-zinc-900 text-[10px] text-zinc-200 px-2 py-1 rounded border border-white/10 shadow-xl">
                                {new Date(week).toLocaleDateString(undefined, {month:'short', day:'numeric'})}: {count} videos
                             </div>
                        </div>
                    </div>
                );
            })}
        </div>
        <div className="flex justify-between text-[10px] text-zinc-600 mt-2 uppercase font-bold tracking-wider">
             <span>1 Year Ago</span>
             {streakStats >= 2 && (
                 <span className="text-indigo-400 animate-pulse">
                     Keep it up! 🔥
                 </span>
             )}
             <span>Today</span>
        </div>
      </div>
    </div>
  );
};