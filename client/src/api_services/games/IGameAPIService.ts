import type { GameDto } from "../../models/games/GameDto";

export interface IGameAPIService {
  getAllGames(): Promise<GameDto[]>;
  getGameById(id: number): Promise<GameDto | null>;
}