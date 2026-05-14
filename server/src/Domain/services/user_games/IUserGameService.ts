import { UserGame } from "../../models/UserGame";

export interface IUserGameService {
  dodajIgru(userId: number, gameId: number, status: string, rating: number | null, note: string | null): Promise<boolean>;
  dohvatiKolekciju(userId: number): Promise<UserGame[]>;
  izmeniIgru(userId: number, gameId: number, status: string, rating: number | null, note: string | null): Promise<boolean>;
  obrisiIgru(userId: number, gameId: number): Promise<boolean>;
}