import type { GameDto } from "../../models/games/GameDto";

export interface IGameAPIService {
  getAllGames(): Promise<GameDto[]>;
}