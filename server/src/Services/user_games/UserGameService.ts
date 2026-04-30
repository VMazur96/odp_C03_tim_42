import { IUserGameService } from "../../Domain/services/user_games/IUserGameService";
import { IUserGameRepository } from "../../Domain/repositories/user_games/IUserGameRepository";
import { UserGame } from "../../Domain/models/UserGame";

export class UserGameService implements IUserGameService {
  private userGameRepo: IUserGameRepository;

  constructor(userGameRepo: IUserGameRepository) {
    this.userGameRepo = userGameRepo;
  }

  async dodajIgru(userId: number, gameId: number, status: string, rating: number | null): Promise<boolean> {
    const userGame = new UserGame(userId, gameId, status, rating);
    return await this.userGameRepo.dodajUKolekciju(userGame);
  }

  async dohvatiKolekciju(userId: number): Promise<UserGame[]> {
    return await this.userGameRepo.dohvatiKolekcijuKorisnika(userId);
  }
}