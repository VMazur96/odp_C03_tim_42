import { IGameService } from "../../Domain/services/games/IGameService";
import { IGameRepository } from "../../Domain/repositories/games/IGameRepository";
import { Game } from "../../Domain/models/Game";

export class GameService implements IGameService {
  public constructor(private gameRepository: IGameRepository) {}

  async createGame(game: Game): Promise<Game> {
    return await this.gameRepository.create(game);
  }

  async getGameById(id: number): Promise<Game | null> {
    return await this.gameRepository.getById(id);
  }

  async getAllGames(): Promise<Game[]> {
    return await this.gameRepository.getAll();
  }

  async updateGame(game: Game): Promise<Game> {
    return await this.gameRepository.update(game);
  }

  async deleteGame(id: number): Promise<boolean> {
    return await this.gameRepository.delete(id);
  }
}