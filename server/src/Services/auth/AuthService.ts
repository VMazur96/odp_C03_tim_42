import { UserAuthDataDto } from "../../Domain/DTOs/auth/UserAuthDataDto";
import { User } from "../../Domain/models/User";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { IAuthService } from "../../Domain/services/auth/IAuthService";
import db from "../../Database/connection/DbConnectionPool";
import bcrypt from "bcryptjs";

export class AuthService implements IAuthService {
  private readonly saltRounds: number = parseInt(process.env.SALT_ROUNDS || "10", 10);

  public constructor(private userRepository: IUserRepository) {}

  async prijava(username: string, lozinka: string): Promise<UserAuthDataDto> {
    const user = await this.userRepository.getByUsername(username);

    if (user.id !== 0 && await bcrypt.compare(lozinka, user.password_hash)) {
      return new UserAuthDataDto(user.id, user.username, user.role, user.profile_image);
    }

    return new UserAuthDataDto();
  }

  async registracija(username: string, email: string, lozinka: string, fullName: string, profileImage?: string): Promise<UserAuthDataDto> {

    const existingUser = await this.userRepository.getByUsername(username);
    if (existingUser.id !== 0) {
      throw new Error("Korisničko ime nije validno ili je zauzeto.");
    }

    const existingEmail = await this.userRepository.getByEmail(email);
    if (existingEmail.id !== 0){ 
      throw new Error("Email je već zauzet.");
    }
    
    const hashedPassword = await bcrypt.hash(lozinka, this.saltRounds);

    const newUser = await this.userRepository.create(
      new User(0, username, email, hashedPassword, fullName, profileImage, 'player')
    );

    if (newUser.id !== 0) {
      return new UserAuthDataDto(newUser.id, newUser.username, newUser.role, newUser.profile_image);
    }

    throw new Error("Greška pri upisu u bazu.");
  }

  async logout(userId: number): Promise<boolean> {
    try {
      const query = `
        INSERT INTO audit_logs (user_id, action, details) 
        VALUES (?, 'LOGOUT', 'Korisnik se uspesno odjavio.')
      `;
      await db.execute(query, [userId]);
      return true;
    } catch (error) {
      console.error("Greska pri upisu u audit log:", error);
      return false;
    }
  }
}
