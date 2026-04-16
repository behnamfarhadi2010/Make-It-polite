export type Tone = 'friendly' | 'formal' | 'professor' | 'boss' | 'partner';

export interface Conversion {
  id: string;
  timestamp: string;
  originalText: string;
  politeText: string;
  toneInsight: string;
  editorialScore: number;
  tags: string[];
  isFavorite: boolean;
  tone: Tone;
}

export type View = 'home' | 'result' | 'history';
