import React, { useState } from 'react';
import { VideoProject, Stage, STAGE_LABELS } from '../types';
import { Plus, GripVertical, Calendar, CheckCircle2 } from 'lucide-react';

interface Props {
  projects: VideoProject[];
  onMoveProject: (id: string, newStage: Stage) => void;
  onSelectProject: (project: VideoProject) => void;
  onNewProject: () => void;
}

export const KanbanBoard: React.FC<Props> = ({ projects, onMoveProject, onSelectProject, onNewProject }) => {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('projectId', id);
    setDraggingId(id);
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggingId(null);
    e.currentTarget.classList.remove('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
  };

  const handleDrop = (e: React.DragEvent, stage: Stage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('projectId');
    if (id) {
      onMoveProject(id, stage);
    }
    setDraggingId(null);
  };

  const getStatusColor = (stage: Stage) => {
    switch (stage) {
        case Stage.PUBLISHED: return 'bg-green-500/10 text-green-400 border-green-500/20';
        case Stage.READY: return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
        default: return 'bg-zinc-800/50 text-zinc-400 border-zinc-800';
    }
  };

  return (
    <div className="flex h-[calc(100vh-180px)] overflow-x-auto gap-4 pb-4">
      {Object.values(Stage).map((stage) => {
        const stageProjects = projects.filter(p => p.stage === stage);
        
        return (
          <div 
            key={stage}
            className={`min-w-[300px] flex flex-col rounded-xl transition-colors ${draggingId ? 'bg-zinc-900/30' : 'bg-transparent'}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-2 mb-3">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-zinc-300">{STAGE_LABELS[stage]}</h3>
                    <span className="text-xs text-zinc-500 font-mono px-1.5 py-0.5 rounded bg-zinc-800/50">
                        {stageProjects.length}
                    </span>
                </div>
                {stage === Stage.IDEA && (
                    <button onClick={onNewProject} className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-white transition-colors">
                        <Plus size={16} />
                    </button>
                )}
            </div>

            {/* Droppable Area */}
            <div className="flex-1 bg-zinc-900/20 border border-zinc-800/50 rounded-xl p-2 space-y-3 overflow-y-auto">
                {stageProjects.map((project) => {
                    const progress = Math.round((project.checklist.filter(i => i.completed).length / project.checklist.length) * 100);

                    return (
                        <div
                            key={project.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, project.id)}
                            onDragEnd={handleDragEnd}
                            onClick={() => onSelectProject(project)}
                            className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-lg p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all relative"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getStatusColor(project.stage)}`}>
                                    {STAGE_LABELS[project.stage]}
                                </span>
                                <GripVertical size={14} className="text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            
                            <h4 className="text-sm font-medium text-zinc-100 mb-3 leading-snug">
                                {project.title}
                            </h4>

                            <div className="flex items-center justify-between text-xs text-zinc-500">
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={12} />
                                    <span>{new Date(project.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 size={12} className={progress === 100 ? 'text-green-500' : ''} />
                                    <span>{progress}%</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {stageProjects.length === 0 && (
                    <div className="h-24 flex items-center justify-center border-2 border-dashed border-zinc-800/50 rounded-lg">
                        <span className="text-xs text-zinc-600">Drop here</span>
                    </div>
                )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
