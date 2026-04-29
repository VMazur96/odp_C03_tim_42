import { Game } from "../../models/Game";

export interface IGameService {
  createGame(game: Game): Promise<Game>;
  getGameById(id: number): Promise<Game | null>;
  getAllGames(): Promise<Game[]>;
  updateGame(game: Game): Promise<Game>;
  deleteGame(id: number): Promise<boolean>;
}