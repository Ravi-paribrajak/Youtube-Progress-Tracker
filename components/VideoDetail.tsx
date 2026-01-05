import React, { useState } from 'react';
import { VideoProject, ChecklistItem, Stage } from '../types';
import { X, Wand2, CheckSquare, Save, ChevronLeft, LayoutTemplate, FileText } from 'lucide-react';
import { generateTitleIdeas, refineScript } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';

interface Props {
  project: VideoProject;
  onClose: () => void;
  onUpdate: (updated: VideoProject) => void;
  onDelete: (id: string) => void;
}

export const VideoDetail: React.FC<Props> = ({ project, onClose, onUpdate, onDelete }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'script' | 'checklist'>('overview');
  const [localProject, setLocalProject] = useState<VideoProject>({ ...project });
  const [aiLoading, setAiLoading] = useState(false);
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  const { toast } = useToast();

  const handleSave = () => {
    onUpdate({
        ...localProject,
        updatedAt: new Date().toISOString()
    });
    toast('Project changes saved successfully', 'success');
  };

  const handleGenerateTitles = async () => {
    setAiLoading(true);
    const titles = await generateTitleIdeas(localProject);
    
    if (titles.length === 0 || titles[0].startsWith("Error")) {
        toast("Failed to generate titles. Check API Key.", "error");
    } else {
        setGeneratedTitles(titles);
        toast("5 Fresh title ideas generated!", "magic");
    }
    setAiLoading(false);
  };

  const handleRefineScript = async () => {
    setAiLoading(true);
    const refined = await refineScript(localProject.metadata.scriptContent, "Engaging and punchy");
    setLocalProject(prev => ({
        ...prev,
        metadata: { ...prev.metadata, scriptContent: refined }
    }));
    toast("Script refined using Gemini", "magic");
    setAiLoading(false);
  };

  const toggleChecklist = (id: string) => {
    const updated = localProject.checklist.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
    );
    setLocalProject({ ...localProject, checklist: updated });
  };

  const completionPercentage = Math.round(
      (localProject.checklist.filter((i) => i.completed).length /
      localProject.checklist.length) *
      100
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[2px]">
        <motion.div 
            initial={{ x: "100%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full max-w-2xl glass-panel h-full shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] flex flex-col"
        >
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex flex-col gap-1">
                        <input 
                            className="bg-transparent text-xl font-bold text-white outline-none placeholder-zinc-600 w-full tracking-tight"
                            value={localProject.title}
                            onChange={(e) => setLocalProject({...localProject, title: e.target.value})}
                        />
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                                {localProject.stage}
                            </span>
                            <span className="text-[10px] text-zinc-500">
                                Due {new Date(localProject.dueDate).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => onDelete(project.id)}
                        className="px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors"
                    >
                        Delete
                    </button>
                    <button 
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-500/80 hover:bg-indigo-500 text-white text-sm font-medium rounded-md shadow-[0_0_15px_-3px_rgba(99,102,241,0.4)] transition-all"
                    >
                        <Save size={16} /> Save
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/5 px-6">
                {[
                    { id: 'overview', icon: LayoutTemplate, label: 'Overview' },
                    { id: 'script', icon: FileText, label: 'Script' },
                    { id: 'checklist', icon: CheckSquare, label: 'Checklist' }
                ].map((tab) => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`relative px-4 py-4 text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === tab.id ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <tab.icon size={16} /> {tab.label}
                        {activeTab === tab.id && (
                            <motion.div 
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-[1px] bg-indigo-500 shadow-[0_-1px_6px_rgba(99,102,241,0.5)]" 
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
                
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-8"
                    >
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500">A/B Title Ideas</label>
                                <button 
                                    onClick={handleGenerateTitles}
                                    disabled={aiLoading}
                                    className="text-xs flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 disabled:opacity-50 transition-colors"
                                >
                                    <Wand2 size={12} /> {aiLoading ? 'Dreaming...' : 'Auto-Generate'}
                                </button>
                            </div>
                            <div className="space-y-3">
                                {localProject.metadata.abTitles.map((t, idx) => (
                                    <input 
                                        key={idx}
                                        className="w-full bg-black/20 border border-white/5 rounded-lg px-4 py-3 text-sm text-zinc-200 outline-none focus:border-indigo-500/50 focus:bg-black/40 transition-all placeholder-zinc-700"
                                        value={t}
                                        onChange={(e) => {
                                            const newTitles = [...localProject.metadata.abTitles];
                                            newTitles[idx] = e.target.value;
                                            setLocalProject({...localProject, metadata: {...localProject.metadata, abTitles: newTitles}});
                                        }}
                                        placeholder={`Variation ${idx + 1}`}
                                    />
                                ))}
                                {localProject.metadata.abTitles.length < 3 && (
                                    <button 
                                        onClick={() => setLocalProject({...localProject, metadata: {...localProject.metadata, abTitles: [...localProject.metadata.abTitles, '']}})}
                                        className="text-xs text-zinc-600 hover:text-zinc-400 ml-1"
                                    >
                                        + Add Title Variant
                                    </button>
                                )}
                            </div>
                            <AnimatePresence>
                                {generatedTitles.length > 0 && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg overflow-hidden"
                                    >
                                        <h4 className="text-xs font-bold text-indigo-300 mb-3 flex items-center gap-2"><Wand2 size={12}/> AI Suggestions</h4>
                                        <ul className="space-y-2">
                                            {generatedTitles.map((t, i) => (
                                                <li key={i} className="text-sm text-zinc-300 cursor-pointer hover:text-white flex justify-between group py-1 border-b border-indigo-500/5 last:border-0">
                                                    {t}
                                                    <button 
                                                        onClick={() => setLocalProject({
                                                            ...localProject, 
                                                            metadata: { 
                                                                ...localProject.metadata, 
                                                                abTitles: [...localProject.metadata.abTitles, t] 
                                                            }
                                                        })}
                                                        className="opacity-0 group-hover:opacity-100 text-[10px] uppercase font-bold tracking-wider text-indigo-400"
                                                    >
                                                        Use
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Description</label>
                            <textarea 
                                className="w-full h-40 bg-black/20 border border-white/5 rounded-lg px-4 py-3 text-sm text-zinc-200 outline-none focus:border-indigo-500/50 focus:bg-black/40 transition-all resize-none leading-relaxed"
                                value={localProject.metadata.description}
                                onChange={(e) => setLocalProject({...localProject, metadata: {...localProject.metadata, description: e.target.value}})}
                            />
                        </div>
                    </motion.div>
                )}

                {/* SCRIPT TAB */}
                {activeTab === 'script' && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="h-full flex flex-col"
                    >
                        <div className="flex justify-end mb-4">
                            <button 
                                onClick={handleRefineScript}
                                disabled={aiLoading}
                                className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors border border-white/5"
                            >
                                <Wand2 size={12} /> {aiLoading ? 'Refining...' : 'Refine Script'}
                            </button>
                        </div>
                        <textarea 
                            className="flex-1 w-full bg-black/20 border border-white/5 rounded-lg p-6 text-sm text-zinc-300 outline-none focus:border-indigo-500/50 transition-colors font-mono leading-7"
                            placeholder="# Video Script&#10;&#10;**Intro**&#10;Hook the audience here..."
                            value={localProject.metadata.scriptContent}
                            onChange={(e) => setLocalProject({...localProject, metadata: {...localProject.metadata, scriptContent: e.target.value}})}
                        />
                    </motion.div>
                )}

                {/* CHECKLIST TAB */}
                {activeTab === 'checklist' && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                            <div className="flex justify-between text-xs text-zinc-400 mb-2 font-medium">
                                <span>Completion</span>
                                <span>{completionPercentage}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${completionPercentage}%` }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            {localProject.checklist.map((item) => (
                                <motion.div 
                                    layout
                                    key={item.id}
                                    onClick={() => toggleChecklist(item.id)}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.03)" }}
                                    whileTap={{ scale: 0.99 }}
                                    className={`group flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                                        item.completed 
                                            ? 'bg-indigo-500/5 border-indigo-500/10' 
                                            : 'bg-black/20 border-white/5 hover:border-white/10'
                                    }`}
                                >
                                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all duration-300 ${
                                        item.completed 
                                            ? 'bg-indigo-500 border-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]' 
                                            : 'border-zinc-700 group-hover:border-zinc-500'
                                    }`}>
                                        {item.completed && <CheckSquare size={12} className="text-white" />}
                                    </div>
                                    <span className={`text-sm transition-colors ${item.completed ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                                        {item.label}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

            </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};