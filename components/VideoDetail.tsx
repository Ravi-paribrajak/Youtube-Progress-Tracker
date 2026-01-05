import React, { useState } from 'react';
import { VideoProject, ChecklistItem, Stage } from '../types';
import { X, Wand2, CheckSquare, Save, ChevronLeft, LayoutTemplate, FileText } from 'lucide-react';
import { generateTitleIdeas, refineScript } from '../services/geminiService';

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

  const handleSave = () => {
    onUpdate({
        ...localProject,
        updatedAt: new Date().toISOString()
    });
  };

  const handleGenerateTitles = async () => {
    setAiLoading(true);
    const titles = await generateTitleIdeas(localProject);
    setGeneratedTitles(titles);
    setAiLoading(false);
  };

  const handleRefineScript = async () => {
    setAiLoading(true);
    const refined = await refineScript(localProject.metadata.scriptContent, "Engaging and punchy");
    setLocalProject(prev => ({
        ...prev,
        metadata: { ...prev.metadata, scriptContent: refined }
    }));
    setAiLoading(false);
  };

  const toggleChecklist = (id: string) => {
    const updated = localProject.checklist.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
    );
    setLocalProject({ ...localProject, checklist: updated });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-2xl bg-zinc-950 border-l border-border h-full shadow-2xl flex flex-col animate-slide-in-right">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-zinc-950/50">
            <div className="flex items-center gap-4">
                <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white">
                    <ChevronLeft size={20} />
                </button>
                <div className="flex flex-col">
                    <input 
                        className="bg-transparent text-xl font-bold text-white outline-none placeholder-zinc-600 w-full"
                        value={localProject.title}
                        onChange={(e) => setLocalProject({...localProject, title: e.target.value})}
                    />
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono text-zinc-500 uppercase px-2 py-0.5 border border-zinc-800 rounded bg-zinc-900">
                            {localProject.stage}
                        </span>
                        <span className="text-xs text-zinc-500">Due: {new Date(localProject.dueDate).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={() => onDelete(project.id)}
                    className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                >
                    Delete
                </button>
                <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors"
                >
                    <Save size={16} /> Save Changes
                </button>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-6">
            <button 
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-zinc-400 hover:text-white'}`}
            >
                <LayoutTemplate size={16} /> Overview
            </button>
            <button 
                onClick={() => setActiveTab('script')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'script' ? 'border-primary text-primary' : 'border-transparent text-zinc-400 hover:text-white'}`}
            >
                <FileText size={16} /> Script
            </button>
            <button 
                onClick={() => setActiveTab('checklist')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'checklist' ? 'border-primary text-primary' : 'border-transparent text-zinc-400 hover:text-white'}`}
            >
                <CheckSquare size={16} /> Checklist
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
                <div className="space-y-8">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-zinc-300">A/B Title Ideas</label>
                            <button 
                                onClick={handleGenerateTitles}
                                disabled={aiLoading}
                                className="text-xs flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
                            >
                                <Wand2 size={12} /> {aiLoading ? 'Generating...' : 'Generate with Gemini'}
                            </button>
                        </div>
                        <div className="space-y-2">
                            {localProject.metadata.abTitles.map((t, idx) => (
                                <input 
                                    key={idx}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-indigo-500 transition-colors"
                                    value={t}
                                    onChange={(e) => {
                                        const newTitles = [...localProject.metadata.abTitles];
                                        newTitles[idx] = e.target.value;
                                        setLocalProject({...localProject, metadata: {...localProject.metadata, abTitles: newTitles}});
                                    }}
                                    placeholder={`Title Option ${idx + 1}`}
                                />
                            ))}
                            {localProject.metadata.abTitles.length < 3 && (
                                <button 
                                    onClick={() => setLocalProject({...localProject, metadata: {...localProject.metadata, abTitles: [...localProject.metadata.abTitles, '']}})}
                                    className="text-xs text-zinc-500 hover:text-zinc-300"
                                >
                                    + Add Title Variant
                                </button>
                            )}
                        </div>
                        {generatedTitles.length > 0 && (
                            <div className="mt-4 p-4 bg-indigo-900/20 border border-indigo-900/50 rounded-lg">
                                <h4 className="text-xs font-bold text-indigo-300 mb-2 flex items-center gap-2"><Wand2 size={12}/> AI Suggestions</h4>
                                <ul className="space-y-1">
                                    {generatedTitles.map((t, i) => (
                                        <li key={i} className="text-sm text-zinc-300 cursor-pointer hover:text-white flex justify-between group">
                                            {t}
                                            <button 
                                                onClick={() => setLocalProject({
                                                    ...localProject, 
                                                    metadata: { 
                                                        ...localProject.metadata, 
                                                        abTitles: [...localProject.metadata.abTitles, t] 
                                                    }
                                                })}
                                                className="opacity-0 group-hover:opacity-100 text-xs text-indigo-400"
                                            >
                                                Use
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Description</label>
                        <textarea 
                            className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-indigo-500 transition-colors resize-none"
                            value={localProject.metadata.description}
                            onChange={(e) => setLocalProject({...localProject, metadata: {...localProject.metadata, description: e.target.value}})}
                        />
                    </div>
                </div>
            )}

            {/* SCRIPT TAB */}
            {activeTab === 'script' && (
                <div className="h-full flex flex-col">
                     <div className="flex justify-end mb-2">
                        <button 
                            onClick={handleRefineScript}
                            disabled={aiLoading}
                            className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-md text-zinc-300 transition-colors"
                        >
                            <Wand2 size={12} /> {aiLoading ? 'Refining...' : 'Polish Script'}
                        </button>
                    </div>
                    <textarea 
                        className="flex-1 w-full bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-sm text-zinc-200 outline-none focus:border-indigo-500 transition-colors font-mono leading-relaxed"
                        placeholder="# Video Script&#10;&#10;**Intro**&#10;Hook the audience here..."
                        value={localProject.metadata.scriptContent}
                        onChange={(e) => setLocalProject({...localProject, metadata: {...localProject.metadata, scriptContent: e.target.value}})}
                    />
                </div>
            )}

            {/* CHECKLIST TAB */}
            {activeTab === 'checklist' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-zinc-400 text-sm mb-4">
                        <span>Progress</span>
                        <span>
                            {localProject.checklist.filter(i => i.completed).length}/{localProject.checklist.length}
                        </span>
                    </div>
                    {localProject.checklist.map((item) => (
                        <div 
                            key={item.id}
                            onClick={() => toggleChecklist(item.id)}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${item.completed ? 'bg-indigo-900/10 border-indigo-900/50' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}
                        >
                            <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${item.completed ? 'bg-indigo-500 border-indigo-500' : 'border-zinc-600'}`}>
                                {item.completed && <CheckSquare size={14} className="text-white" />}
                            </div>
                            <span className={`text-sm ${item.completed ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            )}

        </div>
      </div>
    </div>
  );
};
