import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { VideoProject, Stage, STAGE_LABELS } from '../types';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useToast } from '../context/ToastContext';

interface Props {
  projects: VideoProject[];
  onProjectsChange: (projects: VideoProject[]) => void;
  onSelectProject: (project: VideoProject) => void;
  onNewProject: () => void;
}

// Generate a consistent gradient based on string ID
const getGradient = (id: string) => {
    const gradients = [
        'from-pink-500/20 to-rose-500/20',
        'from-indigo-500/20 to-blue-500/20',
        'from-emerald-500/20 to-teal-500/20',
        'from-amber-500/20 to-orange-500/20',
        'from-purple-500/20 to-fuchsia-500/20',
    ];
    const index = id.charCodeAt(0) % gradients.length;
    return gradients[index];
};

export const KanbanBoard: React.FC<Props> = ({ projects, onProjectsChange, onSelectProject, onNewProject }) => {
  const [enabled, setEnabled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const columns: Record<string, VideoProject[]> = {};
    Object.values(Stage).forEach(stage => {
        columns[stage] = projects.filter(p => p.stage === stage);
    });

    const sourceStage = source.droppableId as Stage;
    const destStage = destination.droppableId as Stage;
    const sourceList = Array.from(columns[sourceStage]);
    let destList = sourceStage === destStage ? sourceList : Array.from(columns[destStage]);

    const [movedProject] = sourceList.splice(source.index, 1);
    
    // Status Logic
    if (sourceStage !== destStage) {
        movedProject.stage = destStage;
        movedProject.updatedAt = new Date().toISOString();
        if (destStage === Stage.PUBLISHED) {
            movedProject.publishedAt = new Date().toISOString();
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#6366f1', '#a855f7', '#ffffff'] });
            toast(`"${movedProject.title}" is live!`, 'success');
        } else if (sourceStage === Stage.PUBLISHED) {
            movedProject.publishedAt = undefined;
        }
    }
    
    destList.splice(destination.index, 0, movedProject);
    columns[sourceStage] = sourceList;
    columns[destStage] = destList;
    const newProjects = Object.values(Stage).flatMap(stage => columns[stage]);
    onProjectsChange(newProjects);
  };

  if (!enabled) return null;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-full overflow-x-auto gap-8 px-2 pb-24">
        {Object.values(Stage).map((stage) => {
          const stageProjects = projects.filter(p => p.stage === stage);
          
          return (
            <div key={stage} className="min-w-[280px] w-[280px] flex flex-col">
                {/* Minimal Header */}
                <div className="flex items-center justify-between mb-6 px-1">
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        {STAGE_LABELS[stage]}
                        {stageProjects.length > 0 && <span className="ml-2 opacity-50">({stageProjects.length})</span>}
                    </h3>
                    {stage === Stage.IDEA && (
                        <button onClick={onNewProject} className="text-zinc-500 hover:text-white transition-colors">
                            <Plus size={14} />
                        </button>
                    )}
                </div>

                <Droppable droppableId={stage}>
                {(provided, snapshot) => (
                    <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 rounded-xl transition-colors duration-300 min-h-[200px] ${
                        snapshot.isDraggingOver ? 'bg-white/[0.02]' : ''
                    }`}
                    >
                    {stageProjects.map((project, index) => {
                        const progress = Math.round((project.checklist.filter(i => i.completed).length / project.checklist.length) * 100);
                        const gradient = getGradient(project.id);

                        return (
                            <Draggable key={project.id} draggableId={project.id} index={index}>
                                {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    onClick={() => onSelectProject(project)}
                                    style={{
                                        ...provided.draggableProps.style,
                                        transform: snapshot.isDragging 
                                            ? `${provided.draggableProps.style?.transform} rotate(3deg) scale(1.02)` 
                                            : provided.draggableProps.style?.transform,
                                    }}
                                    className="mb-4 group outline-none"
                                >
                                    <div className={`relative overflow-hidden bg-zinc-900 border rounded-lg transition-all duration-200 ${
                                        snapshot.isDragging 
                                            ? 'border-indigo-500/50 shadow-2xl z-50' 
                                            : 'border-white/5 hover:border-white/10 hover:shadow-lg'
                                    }`}>
                                        
                                        {/* Thumbnail Area (16:9 Aspect Ratio) */}
                                        <div className={`aspect-video w-full bg-gradient-to-br ${gradient} flex items-center justify-center relative`}>
                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                                            {/* Play Icon Overlay on Hover */}
                                            <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 border border-white/20">
                                                <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[8px] border-l-white border-b-[4px] border-b-transparent ml-0.5" />
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-3">
                                            <h4 className="text-sm font-medium text-zinc-200 leading-snug line-clamp-2 mb-2 group-hover:text-white transition-colors">
                                                {project.title}
                                            </h4>
                                            
                                            {/* Hover Metadata */}
                                            <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <span className="text-[10px] text-zinc-500 font-mono">
                                                    {new Date(project.dueDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Bottom Progress Line */}
                                        <div className="h-[2px] w-full bg-zinc-800 mt-2">
                                            <div 
                                                className={`h-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                                                style={{ width: `${progress}%` }} 
                                            />
                                        </div>
                                    </div>
                                </div>
                                )}
                            </Draggable>
                        );
                    })}
                    {provided.placeholder}
                    </div>
                )}
                </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};