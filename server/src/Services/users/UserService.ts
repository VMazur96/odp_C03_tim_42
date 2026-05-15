import { UserDto } from "../../Domain/DTOs/users/UserDto";
import { User } from "../../Domain/models/User";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { IUserService } from "../../Domain/services/users/IUserService";
import { RowDataPacket } from "mysql2";
import db from "../../Database/connection/DbConnectionPool";

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

}
