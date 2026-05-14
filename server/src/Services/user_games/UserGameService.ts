import { IUserGameService } from "../../Domain/services/user_games/IUserGameService";
import { IUserGameRepository } from "../../Domain/repositories/user_games/IUserGameRepository";
import { UserGame } from "../../Domain/models/UserGame";

export class UserGameService implements IUserGameService {
  private userGameRepo: IUserGameRepository;

  constructor(userGameRepo: IUserGameRepository) {
    this.userGameRepo = userGameRepo;
  }

  // Dodavanje igre u kolekciju
  async dodajIgru(userId: number, gameId: number, status: string, rating: number | null, note: string | null): Promise<boolean> {
    const userGame = new UserGame(userId, gameId, status, rating, note);
    return await this.userGameRepo.dodajUKolekciju(userGame);
  }

  // Dohvatanje kolekcije korisnika
  async dohvatiKolekciju(userId: number): Promise<UserGame[]> {
    return await this.userGameRepo.dohvatiKolekcijuKorisnika(userId);
  }

  // Izmena igre
  async izmeniIgru(userId: number, gameId: number, status: string, rating: number | null, note: string | null): Promise<boolean> {
    return await this.userGameRepo.izmeniIgru(userId, gameId, status, rating, note);
  }

  // Brisanje igre
  async obrisiIgru(userId: number, gameId: number): Promise<boolean> {
    return await this.userGameRepo.obrisiIgru(userId, gameId);
  }
}