import { Game } from "../../models/Game";

export interface IGameRepository {
  create(game: Game): Promise<Game>;
  getById(id: number): Promise<Game | null>;
  getAll(): Promise<Game[]>;
  update(game: Game): Promise<Game>;
  delete(id: number): Promise<boolean>;
}