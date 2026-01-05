import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Calendar as CalendarIcon, Plus, Video } from 'lucide-react';
import { KanbanBoard } from './components/KanbanBoard';
import { StreakTracker } from './components/StreakTracker';
import { VideoDetail } from './components/VideoDetail';
import { VideoProject, Stage } from './types';
import { getProjects, saveProjects, createProject } from './services/storage';

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

  const handleProjectsChange = (newProjects: VideoProject[]) => {
      setProjects(newProjects);
  };

  return (
    <div className="flex h-screen overflow-hidden text-zinc-100">
      
      {/* Sidebar */}
      <aside className="w-16 lg:w-64 flex flex-col glass border-r-0 z-20">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-white/5">
            <div className="bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <Video className="text-indigo-400 w-5 h-5" />
            </div>
            <span className="hidden lg:block ml-3 font-bold tracking-tight text-white/90">CreatorFlow</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
            <button 
                onClick={() => setView('board')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${view === 'board' ? 'bg-white/5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border border-white/5' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
            >
                <LayoutDashboard size={18} />
                <span className="hidden lg:block">Dashboard</span>
            </button>
            <button 
                onClick={() => setView('calendar')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${view === 'calendar' ? 'bg-white/5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border border-white/5' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
            >
                <CalendarIcon size={18} />
                <span className="hidden lg:block">Calendar</span>
            </button>
        </nav>

        <div className="p-4 border-t border-white/5">
             <button 
                onClick={handleCreateProject}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white py-2.5 rounded-lg transition-all font-medium shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] border border-white/10 active:scale-95"
            >
                <Plus size={18} />
                <span className="hidden lg:block">New Video</span>
             </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-8 bg-transparent z-10">
            <h2 className="text-sm font-medium text-zinc-400 tracking-wide uppercase">
                {view === 'board' ? 'Production Pipeline' : 'Content Calendar'}
            </h2>
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-purple-500/20 ring-2 ring-white/10">
                    ME
                </div>
            </div>
        </header>

        <div className="flex-1 overflow-x-auto p-8 pt-2">
            <StreakTracker projects={projects} />
            
            {view === 'board' ? (
                <KanbanBoard 
                    projects={projects} 
                    onProjectsChange={handleProjectsChange}
                    onSelectProject={setSelectedProject}
                    onNewProject={handleCreateProject}
                />
            ) : (
                 <div className="flex items-center justify-center h-64 border border-dashed border-white/10 bg-white/5 rounded-xl text-zinc-500 backdrop-blur-sm">
                    <div className="text-center">
                        <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p>Calendar View Coming Soon</p>
                        <p className="text-xs mt-1">Focus on the Kanban for now.</p>
                    </div>
                </div>
            )}
        </div>

        {/* Modal Overlay */}
        {selectedProject && (
            <VideoDetail 
                project={selectedProject} 
                onClose={() => setSelectedProject(null)}
                onUpdate={handleUpdateProject}
                onDelete={handleDeleteProject}
            />
        )}
      </main>
    </div>
  );
};

export default App;
