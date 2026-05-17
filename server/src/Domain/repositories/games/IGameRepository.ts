import { Game } from "../../models/Game";

export interface IGameRepository {
  create(game: Game, mechanicIds: number[]): Promise<Game>
  getById(id: number): Promise<Game | null>;
  getAll(): Promise<Game[]>;
  update(game: Game, mechanicIds: number[]): Promise<Game>;
  delete(id: number): Promise<boolean>;
  isGameInUse(id: number): Promise<boolean>;
}