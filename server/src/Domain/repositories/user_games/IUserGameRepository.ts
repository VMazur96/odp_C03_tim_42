import { UserGame } from "../../models/UserGame";

export interface IUserGameRepository {
  dodajUKolekciju(userGame: UserGame): Promise<boolean>;
  dohvatiKolekcijuKorisnika(userId: number): Promise<UserGame[]>;
}