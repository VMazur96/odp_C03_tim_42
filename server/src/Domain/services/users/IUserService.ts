import { UserDto } from "../../DTOs/users/UserDto";

export interface IUserService {
     /**
     * Vraca listu svih korisnika u sistemu.
     * @returns Podatke o korisnicima u vidu liste.
     */
  getSviKorisnici(): Promise<UserDto[]>;
  getTrenutniKorisnik(id: number): Promise<UserDto | null>;

  azurirajProfil(userId: number, staraLozinka?: string, novaLozinka?: string, novaSlika?: string): Promise<boolean>;

  pretragaKorisnika(query: string): Promise<{ id: number; username: string; profile_image: string | null }[]>;}