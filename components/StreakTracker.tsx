import React, { useMemo } from 'react';
import { VideoProject, Stage } from '../types';
import { Zap } from 'lucide-react';

interface Props {
  projects: VideoProject[];
}

export const StreakTracker: React.FC<Props> = ({ projects }) => {
  // Generate last 52 weeks
  const weeks = useMemo(() => {
    const today = new Date();
    const result = [];
    // Start 51 weeks ago
    for (let i = 51; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - (i * 7));
        // Normalize to start of week (Sunday)
        const day = d.getDay();
        const diff = d.getDate() - day;
        const sunday = new Date(d.setDate(diff));
        result.push(sunday);
    }
    return result;
  }, []);

  const getIntensity = (weekStart: Date) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const uploadsInWeek = projects.filter(p => {
        if (p.stage !== Stage.PUBLISHED) return false;
        const pDate = new Date(p.updatedAt); // Using updatedAt as proxy for publish date
        return pDate >= weekStart && pDate <= weekEnd;
    });

    if (uploadsInWeek.length === 0) return 'bg-zinc-800';
    if (uploadsInWeek.length === 1) return 'bg-indigo-900';
    if (uploadsInWeek.length === 2) return 'bg-indigo-600';
    return 'bg-indigo-400';
  };

  const currentStreak = useMemo(() => {
      // simplified streak logic
      let streak = 0;
      // ... logic would go here to check consecutive weeks
      return projects.filter(p => p.stage === Stage.PUBLISHED).length; 
  }, [projects]);

  return (
    <div className="flex items-center gap-6 p-4 border border-border bg-surface rounded-xl shadow-sm mb-8">
      <div className="flex flex-col items-start gap-1 min-w-[120px]">
        <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Total Uploads</span>
        <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span className="text-2xl font-bold text-white">{currentStreak}</span>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-1 h-10 items-end">
            {weeks.map((week, i) => (
                <div 
                    key={i} 
                    className={`w-3 h-3 rounded-sm ${getIntensity(week)} transition-colors duration-300`}
                    title={`Week of ${week.toLocaleDateString()}`}
                />
            ))}
        </div>
        <div className="flex justify-between text-[10px] text-zinc-500 mt-1 uppercase font-medium">
             <span>1 Year Ago</span>
             <span>Today</span>
        </div>
      </div>
    </div>
  );
};
