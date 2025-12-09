export interface Question {
  id: string;
  text: string;
  answer: string;
}

export interface QuestionSet {
  id: string;
  name: string;
  questions: Question[];
}

export interface GameState {
  ropePosition: number; // Range from -5 to 5
  winner: 'team1' | 'team2' | null;
}

export type Language = 'kz' | 'ru' | 'en';