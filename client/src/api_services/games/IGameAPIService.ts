import type { GameDto } from "../../models/games/GameDto";

export interface IGameAPIService {
  getAllGames(): Promise<GameDto[]>;
  getGameById(id: number): Promise<GameDto | null>;
  createGame(gameData: Record<string, unknown>, mechanicIds: number[]): Promise<{ success: boolean; message: string }>;
  updateGame(id: number, gameData: Record<string, unknown>, mechanicIds: number[]): Promise<{ success: boolean; message: string }>;
  deleteGame(id: number): Promise<{ success: boolean; message: string }>;
}