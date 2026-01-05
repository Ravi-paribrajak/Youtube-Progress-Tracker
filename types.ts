export enum Stage {
  IDEA = 'IDEA',
  SCRIPTING = 'SCRIPTING',
  FILMING = 'FILMING',
  EDITING = 'EDITING',
  THUMBNAIL = 'THUMBNAIL',
  READY = 'READY',
  PUBLISHED = 'PUBLISHED',
}

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface VideoMetadata {
  description: string;
  tags: string[];
  abTitles: string[];
  scriptContent: string;
}

export interface VideoProject {
  id: string;
  title: string;
  stage: Stage;
  dueDate: string; // ISO Date string
  updatedAt: string;
  metadata: VideoMetadata;
  checklist: ChecklistItem[];
}

export const STAGE_LABELS: Record<Stage, string> = {
  [Stage.IDEA]: 'Idea Backlog',
  [Stage.SCRIPTING]: 'Scripting',
  [Stage.FILMING]: 'Filming',
  [Stage.EDITING]: 'Editing',
  [Stage.THUMBNAIL]: 'Thumbnail',
  [Stage.READY]: 'Ready to Publish',
  [Stage.PUBLISHED]: 'Published',
};

export const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: '1', label: 'Keyword Research', completed: false },
  { id: '2', label: 'Draft Thumbnail Concepts', completed: false },
  { id: '3', label: 'Write Pinned Comment', completed: false },
  { id: '4', label: 'Add End Screens', completed: false },
  { id: '5', label: 'Check Copyright', completed: false },
];
