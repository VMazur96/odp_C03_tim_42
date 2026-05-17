import { IGameService } from "../../Domain/services/games/IGameService";
import { IGameRepository } from "../../Domain/repositories/games/IGameRepository";
import { Game } from "../../Domain/models/Game";

export class GameService implements IGameService {
  public constructor(private gameRepository: IGameRepository) {}

  // Kreiranje nove igre
  async createGame(game: Game, mechanicIds: number[]): Promise<Game> {
    if (!game.name || game.name.trim().length < 1 || game.name.length > 120) {
      throw new Error("Naziv igre je obavezan.");
    }
    if (game.weight < 1.0 || game.weight > 5.0) {
      throw new Error("Težina mora biti između 1.0 i 5.0.");
    }
    if (game.min_players < 1) {
      throw new Error("Minimalan broj igrača mora biti bar 1.");
    }
    if (game.max_players < game.min_players) {
      throw new Error("Maks. broj igrača mora biti veći od min.");
    }
    if (game.duration_min < 5) {
      throw new Error("Trajanje igre mora biti bar 5 minuta.");
    }

    return await this.gameRepository.create(game, mechanicIds);
  }

  // Dohvatanje igre po ID-u
  async getGameById(id: number): Promise<Game | null> {
    return await this.gameRepository.getById(id);
  }

  // Dohvatanje svih igara
  async getAllGames(): Promise<Game[]> {
    return await this.gameRepository.getAll();
  }

  // Izmena igre
  async updateGame(game: Game, mechanicIds: number[]): Promise<Game> {
    if (!game.name || game.name.trim().length < 1 || game.name.length > 120) {
      throw new Error("Naziv igre je obavezan.");
    }
    if (game.weight < 1.0 || game.weight > 5.0) {
      throw new Error("Težina mora biti između 1.0 i 5.0.");
    }
    if (game.min_players < 1) {
      throw new Error("Minimalan broj igrača mora biti bar 1.");
    }
    if (game.max_players < game.min_players) {
      throw new Error("Maks. broj igrača mora biti veći od min.");
    }
    if (game.duration_min < 5) {
      throw new Error("Trajanje igre mora biti bar 5 minuta.");
    }

    return await this.gameRepository.update(game, mechanicIds);
  }

  // Brisanje igre
  async deleteGame(id: number): Promise<boolean> {
    const uUpotrebi = await this.gameRepository.isGameInUse(id);
    if (uUpotrebi) {
      throw new Error("Igra se ne može obrisati jer je barem jedan korisnik ima u svojoj kolekciji.");
    }

    return await this.gameRepository.delete(id);
  }
}