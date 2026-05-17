import { Game } from "../../models/Game";

export interface IGameService {
  createGame(game: Game, mechanicIds: number[]): Promise<Game>;  getGameById(id: number): Promise<Game | null>;
  getAllGames(): Promise<Game[]>;
  updateGame(game: Game, mechanicIds: number[]): Promise<Game>;
  deleteGame(id: number): Promise<boolean>;
}