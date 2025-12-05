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
  ropePosition: number; // -5 to +5
  team1Score: number;
  team2Score: number;
  winner: 'team1' | 'team2' | null;
}

export type Team = 'team1' | 'team2';