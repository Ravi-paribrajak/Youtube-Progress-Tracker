import { VideoProject, Stage, DEFAULT_CHECKLIST } from '../types';

const STORAGE_KEY = 'creatorflow_projects';

export const getProjects = (): VideoProject[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Seed data if empty
      const initialData: VideoProject[] = [
        {
          id: 'seed-1',
          title: 'My First Weekly Vlog',
          stage: Stage.PUBLISHED,
          dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Published 2 days ago
          metadata: {
            description: 'A look into the week.',
            tags: ['vlog', 'productivity'],
            abTitles: ['I quit my job', 'My daily routine'],
            scriptContent: '# Intro\n\nStart with a hook...'
          },
          checklist: [...DEFAULT_CHECKLIST]
        },
        {
          id: 'seed-2',
          title: 'Review of the Gemini API',
          stage: Stage.EDITING,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: {
            description: 'Deep dive into Google GenAI.',
            tags: ['coding', 'ai'],
            abTitles: ['Gemini vs GPT-4', 'Is Gemini Good?'],
            scriptContent: 'Testing the new vision capabilities.'
          },
          checklist: [...DEFAULT_CHECKLIST]
        }
      ];
      saveProjects(initialData);
      return initialData;
    }
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load projects", e);
    return [];
  }
};

export const saveProjects = (projects: VideoProject[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error("Failed to save projects", e);
  }
};

export const createProject = (title: string): VideoProject => {
  return {
    id: crypto.randomUUID(),
    title,
    stage: Stage.IDEA,
    dueDate: new Date().toISOString(), // Defaults to today
    updatedAt: new Date().toISOString(),
    metadata: {
      description: '',
      tags: [],
      abTitles: [],
      scriptContent: ''
    },
    checklist: DEFAULT_CHECKLIST.map(i => ({...i})) // Clone defaults
  };
};