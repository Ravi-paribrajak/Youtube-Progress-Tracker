import React, { useMemo } from 'react';
import { VideoProject, Stage } from '../types';
import { Flame, Play, Trophy, CalendarClock } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  projects: VideoProject[];
}

export const StatsHero: React.FC<Props> = ({ projects }) => {
  const stats = useMemo(() => {
    // 1. Calculate Streak (Simplified: consecutive weeks with a published video)
    const publishedDates = projects
      .filter(p => p.stage === Stage.PUBLISHED && p.publishedAt)
      .map(p => new Date(p.publishedAt!).getTime())
      .sort((a, b) => b - a); // Newest first

    let streak = 0;
    if (publishedDates.length > 0) {
      // Basic logic: Check if there's a post within last 7 days, then 14, etc.
      // This is a simplified visual representation for the demo.
      streak = publishedDates.length > 0 ? 1 : 0;
      // In a real app, we'd do strict calendar math here.
      // For visual demo, we'll map length to "weeks" if consistent.
      streak = Math.min(publishedDates.length, 4); // Dummy logic to show functionality
    }

    // 2. Next Up
    const activeProjects = projects
      .filter(p => p.stage !== Stage.PUBLISHED && p.stage !== Stage.IDEA)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    
    const nextUp = activeProjects[0];

    // 3. Total Published
    const total = projects.filter(p => p.stage === Stage.PUBLISHED).length;

    return { streak, nextUp, total };
  }, [projects]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {/* Card 1: The Fire (Streak) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/5 border border-orange-500/20 p-6 flex items-center justify-between"
      >
        <div className="absolute inset-0 bg-orange-500/5 blur-3xl group-hover:bg-orange-500/10 transition-all duration-500" />
        <div className="relative z-10">
          <p className="text-orange-300 text-xs font-bold uppercase tracking-widest mb-1">Weekly Streak</p>
          <div className="flex items-baseline gap-1">
             <span className="text-4xl font-bold text-white tracking-tight">{stats.streak}</span>
             <span className="text-sm text-orange-200/60 font-medium">weeks</span>
          </div>
        </div>
        <div className="relative z-10 w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
           <Flame className="text-orange-400 fill-orange-400" size={24} />
        </div>
      </motion.div>

      {/* Card 2: The Focus (Next Up) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative group overflow-hidden rounded-2xl bg-zinc-900/40 border border-white/5 p-6 flex flex-col justify-center"
      >
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
            <CalendarClock size={12} /> Next Deadline
        </p>
        {stats.nextUp ? (
            <div>
                <h3 className="text-lg font-semibold text-white leading-snug line-clamp-1 mb-1 group-hover:text-indigo-400 transition-colors">
                    {stats.nextUp.title}
                </h3>
                <p className="text-sm text-zinc-500">
                    Due {new Date(stats.nextUp.dueDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric'})}
                </p>
            </div>
        ) : (
            <span className="text-zinc-600 italic">No active deadlines. Relax!</span>
        )}
      </motion.div>

      {/* Card 3: The Grind (Total) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden rounded-2xl bg-zinc-900/40 border border-white/5 p-6 flex items-center justify-between"
      >
        <div>
          <p className="text-emerald-400/80 text-xs font-bold uppercase tracking-widest mb-1">Published</p>
          <div className="flex items-baseline gap-1">
             <span className="text-4xl font-bold text-white tracking-tight">{stats.total}</span>
             <span className="text-sm text-zinc-500 font-medium">videos</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
           <Trophy className="text-emerald-400" size={20} />
        </div>
      </motion.div>
    </div>
  );
};