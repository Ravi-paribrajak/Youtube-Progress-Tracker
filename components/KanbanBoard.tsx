import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { VideoProject, Stage, STAGE_LABELS } from '../types';
import { 
  Plus, GripVertical, Calendar, 
  Lightbulb, FileText, Camera, Scissors, Image as ImageIcon, CheckCircle, Globe, Ghost 
} from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useToast } from '../context/ToastContext';

interface Props {
  projects: VideoProject[];
  onProjectsChange: (projects: VideoProject[]) => void;
  onSelectProject: (project: VideoProject) => void;
  onNewProject: () => void;
}

const STAGE_ICONS: Record<Stage, React.ElementType> = {
  [Stage.IDEA]: Lightbulb,
  [Stage.SCRIPTING]: FileText,
  [Stage.FILMING]: Camera,
  [Stage.EDITING]: Scissors,
  [Stage.THUMBNAIL]: ImageIcon,
  [Stage.READY]: CheckCircle,
  [Stage.PUBLISHED]: Globe,
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
    
    // Status Change Logic
    if (sourceStage !== destStage) {
        movedProject.stage = destStage;
        movedProject.updatedAt = new Date().toISOString();
        
        // Handle publishedAt logic
        if (destStage === Stage.PUBLISHED) {
            movedProject.publishedAt = new Date().toISOString();
            
            // Celebration Logic!
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#6366f1', '#a855f7', '#ffffff']
            });
            toast(`"${movedProject.title}" is live! Great job!`, 'success');
        } else if (sourceStage === Stage.PUBLISHED) {
            // If moved OUT of published, reset the publishedAt date
            movedProject.publishedAt = undefined;
        }
    }
    
    destList.splice(destination.index, 0, movedProject);
    columns[sourceStage] = sourceList;
    columns[destStage] = destList;

    const newProjects = Object.values(Stage).flatMap(stage => columns[stage]);
    onProjectsChange(newProjects);
  };

  const getStatusColor = (stage: Stage) => {
    switch (stage) {
        case Stage.PUBLISHED: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        case Stage.READY: return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
        default: return 'bg-white/5 text-zinc-400 border-white/5';
    }
  };

  if (!enabled) return null;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-[calc(100vh-180px)] overflow-x-auto gap-6 pb-4 px-2">
        {Object.values(Stage).map((stage) => {
          const stageProjects = projects.filter(p => p.stage === stage);
          const EmptyIcon = STAGE_ICONS[stage] || Ghost;
          
          return (
            <div key={stage} className="min-w-[320px] flex flex-col">
                {/* Column Header */}
                <div className="flex items-center justify-between px-1 mb-4">
                    <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{STAGE_LABELS[stage]}</h3>
                        <span className="text-[10px] text-zinc-500 font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                            {stageProjects.length}
                        </span>
                    </div>
                    {stage === Stage.IDEA && (
                        <button onClick={onNewProject} className="p-1.5 hover:bg-white/10 rounded-md text-zinc-500 hover:text-white transition-colors">
                            <Plus size={14} />
                        </button>
                    )}
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={stage}>
                {(provided, snapshot) => (
                    <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`relative flex-1 rounded-2xl p-2 space-y-3 overflow-y-auto transition-all duration-300 min-h-[150px] ${
                        snapshot.isDraggingOver ? 'bg-white/[0.02]' : 'bg-transparent'
                    }`}
                    >
                    {/* Subtle Column Glow on Drag Over */}
                    {snapshot.isDraggingOver && (
                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent rounded-2xl pointer-events-none" />
                    )}

                    {/* Empty State */}
                    {stageProjects.length === 0 && !snapshot.isDraggingOver && (
                        <div className="flex flex-col items-center justify-center h-full min-h-[140px] border-2 border-dashed border-white/5 rounded-xl gap-3 text-zinc-700 select-none">
                            <EmptyIcon size={24} className="opacity-40" />
                            <span className="text-xs font-medium opacity-60">No videos in {STAGE_LABELS[stage].toLowerCase()}</span>
                        </div>
                    )}

                    {stageProjects.map((project, index) => {
                        const progress = Math.round((project.checklist.filter(i => i.completed).length / project.checklist.length) * 100);
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
                                            ? `${provided.draggableProps.style?.transform} rotate(2deg) scale(1.05)` 
                                            : provided.draggableProps.style?.transform,
                                    }}
                                    className="outline-none"
                                >
                                    <motion.div 
                                        initial={false}
                                        whileHover={{ y: -2 }}
                                        className={`group relative overflow-hidden backdrop-blur-md rounded-xl p-4 border transition-all duration-200 cursor-grab active:cursor-grabbing ${
                                            snapshot.isDragging 
                                                ? 'bg-zinc-800/90 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border-indigo-500/50 ring-1 ring-indigo-500/40 z-50' 
                                                : 'bg-zinc-900/40 border-white/5 hover:border-white/10 hover:bg-zinc-900/60 shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${getStatusColor(project.stage)}`}>
                                                {STAGE_LABELS[project.stage]}
                                            </span>
                                            <GripVertical size={14} className="text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        
                                        <h4 className="text-sm font-medium text-zinc-100 mb-4 leading-normal tracking-tight">
                                            {project.title}
                                        </h4>

                                        <div className="flex items-center justify-between text-[11px] text-zinc-500 font-medium">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={12} className="text-zinc-600" />
                                                <span>{new Date(project.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                                                        style={{ width: `${progress}%` }} 
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
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