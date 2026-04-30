import { UserGame } from "../../models/UserGame";

export interface IUserGameService {
  dodajIgru(userId: number, gameId: number, status: string, rating: number | null): Promise<boolean>;
  dohvatiKolekciju(userId: number): Promise<UserGame[]>;
}