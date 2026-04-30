import type { UserGameDto } from "../../models/user_games/UserGameDto";

export interface IUserGamesAPIService {
  dodajUKolekciju(gameId: number, status: string, rating?: number | null): Promise<boolean>;
  dohvatiMojuKolekciju(): Promise<UserGameDto[]>; 
}