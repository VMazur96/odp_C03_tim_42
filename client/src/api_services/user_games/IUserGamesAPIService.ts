import type { UserGameDto } from "../../models/user_games/UserGameDto";

export interface IUserGamesAPIService {
  dodajUKolekciju(gameId: number, status: string, rating?: number | null, note?: string | null): Promise<boolean>;
  dohvatiMojuKolekciju(): Promise<UserGameDto[]>;
  izmeniIgru(gameId: number, status: string, rating: number | null, note: string | null): Promise<boolean> ; 
  obrisiIgru(gameId: number): Promise<boolean>;
}