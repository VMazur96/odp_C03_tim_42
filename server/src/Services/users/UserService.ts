import { UserDto } from "../../Domain/DTOs/users/UserDto";
import { User } from "../../Domain/models/User";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { IUserService } from "../../Domain/services/users/IUserService";
import { RowDataPacket } from "mysql2";
import db from "../../Database/connection/DbConnectionPool";
import bcrypt from "bcrypt";

export class UserService implements IUserService {
  public constructor(private userRepository: IUserRepository) {}

  async getSviKorisnici(): Promise<UserDto[]> {
    const korisnici: User[] = await this.userRepository.getAll();
    const korisniciDto: UserDto[] = korisnici.map(
      (user) => new UserDto(user.id, user.username, user.role)
    );

    return korisniciDto;
  }

 async getTrenutniKorisnik(id: number): Promise<UserDto | null> {
    try {
      const [rows] = await db.execute<RowDataPacket[]>(
        "SELECT id, username, role, profile_image FROM users WHERE id = ?", 
        [id]
      );
      
      if (rows.length > 0) {
        const row = rows[0];
        // Prilagođavamo se tvom DTO-u:
        // row.username ide u korisnickoIme, row.role ide u uloga
        return new UserDto(
            row.id,
            row.username, 
            row.role,     
            row.profile_image
        );
      }
      return null;
    } catch (error) {
      console.error("Greska pri dohvatanju trenutnog korisnika:", error);
      return null;
    }
  }

  async pretragaKorisnika(query: string): Promise<{ id: number; username: string; profile_image: string | null }[]> {
    return await this.userRepository.pretragaKorisnika(query);
  }

  async azurirajProfil(userId: number, staraLozinka?: string, novaLozinka?: string, novaSlika?: string): Promise<boolean> {
    let passwordHash = undefined;

    if (novaLozinka) {
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(novaLozinka)) {
        throw new Error("Lozinka ne ispunjava uslove (min 8 karaktera, 1 veliko slovo, 1 broj).");
      }

      if (!staraLozinka) {
        throw new Error("Morate uneti staru lozinku da biste postavili novu.");
      }

      // Dohvata trenutni hash lozinke iz baze
      const trenutniHash = await this.userRepository.getPasswordHash(userId);
      if (!trenutniHash) throw new Error("Korisnik nije pronađen u bazi.");

      // Uporedjuje staraLozinka sa trenutnim hashom
      const isMatch = await bcrypt.compare(staraLozinka, trenutniHash);
      if (!isMatch) {
        throw new Error("Stara lozinka nije tačna.");
      }

      // Hash nova lozinka
      passwordHash = await bcrypt.hash(novaLozinka, 10);
    }

    return await this.userRepository.updateUser(userId, passwordHash, novaSlika);
  }

}
