import { UserAuthDataDto } from "../../Domain/DTOs/auth/UserAuthDataDto";
import { User } from "../../Domain/models/User";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { IAuthService } from "../../Domain/services/auth/IAuthService";
import bcrypt from "bcryptjs";

export class AuthService implements IAuthService {
  private readonly saltRounds: number = parseInt(process.env.SALT_ROUNDS || "10", 10);

  public constructor(private userRepository: IUserRepository) {}

  async prijava(username: string, lozinka: string): Promise<UserAuthDataDto> {
    const user = await this.userRepository.getByUsername(username);

    // Proveravamo da li korisnik postoji i da li se lozinka poklapa sa hash-om iz baze
    if (user.id !== 0 && await bcrypt.compare(lozinka, user.password_hash)) {
      return new UserAuthDataDto(user.id, user.username, user.role);
    }

    return new UserAuthDataDto(); // Neispravno korisničko ime ili lozinka
  }

  async registracija(username: string, email: string, lozinka: string, fullName: string, profileImage?: string): Promise<UserAuthDataDto> {
    //Proveravamo da li je username vec zauzet
    const existingUser = await this.userRepository.getByUsername(username);
    
    if (existingUser.id !== 0) {
      return new UserAuthDataDto(); // Korisnik vec postoji
    }

    // Proveravamo da li je email vec zauzet
    const existingEmail = await this.userRepository.getByEmail(email);

    if (existingEmail.id !== 0){ 
      return new UserAuthDataDto(); // Korisnik vec postoji
    }
    
    // Hash-ujemo lozinku pre cuvanja
    const hashedPassword = await bcrypt.hash(lozinka, this.saltRounds);

    const newUser = await this.userRepository.create(
      new User(0, username, email, hashedPassword, fullName, profileImage, 'player')
    );

    if (newUser.id !== 0) {
      return new UserAuthDataDto(newUser.id, newUser.username, newUser.role);
    }

    return new UserAuthDataDto(); // Registracija nije uspela
  }
}
