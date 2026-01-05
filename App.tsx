import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
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

  // Initial Load
  useEffect(() => {
    const data = getProjects();
    setProjects(data);
  }, []);

  // Save on Change
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
    // If it was the selected one, update that reference too so the modal shows new data
    if (selectedProject?.id === updated.id) {
        setSelectedProject(updated);
    }
  };

  const handleDeleteProject = (id: string) => {
      setProjects(projects.filter(p => p.id !== id));
      setSelectedProject(null);
  };

  const handleMoveProject = (id: string, newStage: Stage) => {
    const p = projects.find(proj => proj.id === id);
    if (!p) return;
    const updated = { ...p, stage: newStage, updatedAt: new Date().toISOString() };
    handleUpdateProject(updated);
  };

  return (
    <div className="flex h-screen bg-background text-zinc-100 overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-16 lg:w-64 border-r border-border flex flex-col bg-surface">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-border">
            <div className="bg-primary/20 p-2 rounded-lg">
                <Video className="text-primary w-5 h-5" />
            </div>
            <span className="hidden lg:block ml-3 font-bold tracking-tight text-white">CreatorFlow</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
            <button 
                onClick={() => setView('board')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'board' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
            >
                <LayoutDashboard size={18} />
                <span className="hidden lg:block">Dashboard</span>
            </button>
            <button 
                onClick={() => setView('calendar')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'calendar' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
            >
                <CalendarIcon size={18} />
                <span className="hidden lg:block">Calendar</span>
            </button>
        </nav>

        <div className="p-4 border-t border-border">
             <button 
                onClick={handleCreateProject}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-2 rounded-lg transition-all font-medium shadow-lg shadow-indigo-900/20 active:scale-95"
            >
                <Plus size={18} />
                <span className="hidden lg:block">New Video</span>
             </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-background/50 backdrop-blur-sm z-10">
            <h2 className="text-lg font-semibold">
                {view === 'board' ? 'Production Pipeline' : 'Content Calendar'}
            </h2>
            <div className="flex items-center gap-4">
                <span className="text-sm text-zinc-500 hidden sm:block">
                   {projects.filter(p => p.stage === Stage.PUBLISHED).length} videos published
                </span>
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold border-2 border-zinc-900">
                    ME
                </div>
            </div>
        </header>

        <div className="flex-1 overflow-x-auto p-8">
            <StreakTracker projects={projects} />
            
            {view === 'board' ? (
                <KanbanBoard 
                    projects={projects} 
                    onMoveProject={handleMoveProject}
                    onSelectProject={setSelectedProject}
                    onNewProject={handleCreateProject}
                />
            ) : (
                 <div className="flex items-center justify-center h-64 border border-dashed border-zinc-800 rounded-xl text-zinc-500">
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
