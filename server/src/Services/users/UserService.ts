import { UserDto } from "../../Domain/DTOs/users/UserDto";
import { User } from "../../Domain/models/User";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { IUserService } from "../../Domain/services/users/IUserService";
import { RowDataPacket } from "mysql2";
import db from "../../Database/connection/DbConnectionPool";
import bcrypt from "bcrypt";

export class UserService implements IUserService {
  public constructor(private userRepository: IUserRepository) {}

  // Dohvatanje svih korisnika
  async getSviKorisnici(): Promise<any[]> {
    const korisnici = await this.userRepository.getAll();
    return korisnici.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role
    }));
  }

  // Dohvatanje trenutnog korisnika po ID-u
  async getTrenutniKorisnik(id: number): Promise<UserDto | null> {
    try {
      const [rows] = await db.execute<RowDataPacket[]>(
        "SELECT id, username, role, profile_image FROM users WHERE id = ?", 
        [id]
      );
      
      if (rows.length > 0) {
        const row = rows[0];
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

  // Pretraga korisnika
  async pretragaKorisnika(query: string): Promise<{ id: number; username: string; profile_image: string | null }[]> {
    return await this.userRepository.pretragaKorisnika(query);
  }

  // Ažuriranje profila korisnika
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

  // Promena uloge korisnika
  async promeniUlogu(userId: number, novaUloga: string): Promise<boolean> {
    if (!['guest', 'player', 'admin'].includes(novaUloga)) {
        throw new Error("Dozvoljene uloge su 'guest', 'player' i 'admin'.");
    }
    return await this.userRepository.updateRole(userId, novaUloga);
  }
}
