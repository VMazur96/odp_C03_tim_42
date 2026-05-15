import type { GameStatus } from '../enums/GameStatus';

export interface UserGameDto {
  userId: number;
  gameId: number;
  status: GameStatus;
  rating: number | null;
  note: string | null;
  gameName: string;
  coverImage: string;
  mechanics?: string[];
}