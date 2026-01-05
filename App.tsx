import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Calendar as CalendarIcon, Plus, Box, Layers } from 'lucide-react';
import { KanbanBoard } from './components/KanbanBoard';
import { StatsHero } from './components/StatsHero';
import { VideoDetail } from './components/VideoDetail';
import { VideoProject } from './types';
import { getProjects, saveProjects, createProject } from './services/storage';
import { motion } from 'framer-motion';

const App = () => {
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<VideoProject | null>(null);
  const [view, setView] = useState<'board' | 'calendar'>('board');

  useEffect(() => {
    const data = getProjects();
    setProjects(data);
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
        saveProjects(projects);
    }
  }, [projects]);

  const handleCreateProject = () => {
    const newProject = createProject('Untitled Video Idea');
    setProjects([...projects, newProject]);
    setSelectedProject(newProject);
  };

  const handleUpdateProject = (updated: VideoProject) => {
    setProjects(projects.map(p => p.id === updated.id ? updated : p));
    if (selectedProject?.id === updated.id) {
        setSelectedProject(updated);
    }
  };

  const handleDeleteProject = (id: string) => {
      setProjects(projects.filter(p => p.id !== id));
      setSelectedProject(null);
  };

  return (
    <div className="min-h-screen text-zinc-100 flex flex-col relative overflow-hidden">
      
      {/* Top Header */}
      <header className="flex-none h-20 px-6 md:px-12 flex items-center justify-between z-10 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <Box size={16} className="text-white" />
             </div>
             <span className="font-bold tracking-tight text-lg">CreatorFlow</span>
        </div>
        <button 
            onClick={handleCreateProject}
            className="group flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-zinc-200 rounded-full text-sm font-semibold transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
        >
            <Plus size={16} className="transition-transform group-hover:rotate-90" />
            <span>New Video</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 pb-32 flex flex-col min-h-0">
         
         <StatsHero projects={projects} />

         {/* View Switching Logic */}
         {view === 'board' ? (
             <div className="flex-1 min-h-0">
                 <KanbanBoard 
                    projects={projects} 
                    onProjectsChange={setProjects}
                    onSelectProject={setSelectedProject}
                    onNewProject={handleCreateProject}
                />
             </div>
         ) : (
             <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
                <CalendarIcon className="w-16 h-16 text-zinc-800 mb-4" />
                <h2 className="text-xl font-medium text-zinc-500">Calendar View</h2>
                <p className="text-zinc-600 text-sm mt-1">Coming soon in v2.0</p>
             </div>
         )}
      </main>

      {/* Floating Dock (MacOS Style) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <div className="glass-dock flex items-center gap-2 p-2 rounded-2xl">
            <button 
                onClick={() => setView('board')}
                className={`p-3 rounded-xl transition-all duration-200 relative group ${view === 'board' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
            >
                <Layers size={20} />
                {view === 'board' && <motion.div layoutId="dock-dot" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />}
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-900 text-xs px-2 py-1 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Pipeline</span>
            </button>
            
            <div className="w-[1px] h-6 bg-white/10 mx-1" />
            
            <button 
                onClick={() => setView('calendar')}
                className={`p-3 rounded-xl transition-all duration-200 relative group ${view === 'calendar' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
            >
                <CalendarIcon size={20} />
                {view === 'calendar' && <motion.div layoutId="dock-dot" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />}
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-900 text-xs px-2 py-1 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Calendar</span>
            </button>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedProject && (
        <VideoDetail 
            project={selectedProject} 
            onClose={() => setSelectedProject(null)}
            onUpdate={handleUpdateProject}
            onDelete={handleDeleteProject}
        />
      )}
    </div>
  );
};

export default App;