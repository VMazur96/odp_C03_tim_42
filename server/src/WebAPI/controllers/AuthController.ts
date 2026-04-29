import { Request, Response, Router } from 'express';
import { IAuthService } from '../../Domain/services/auth/IAuthService';
import jwt from "jsonwebtoken";

export class AuthController {
  private router: Router;
  private authService: IAuthService;

  constructor(authService: IAuthService) {
    this.router = Router();
    this.authService = authService;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/auth/login', this.prijava.bind(this));
    this.router.post('/auth/register', this.registracija.bind(this));
  }

  /**
   * POST /api/v1/auth/login
   * Prijava korisnika
   */
  private async prijava(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      // TODO: Provera da li su polja poslata

      if (!username || !password) {
        res.status(400).json({ success: false, message: 'Korisničko ime i lozinka su obavezni.' });
        return;
      }

      const result = await this.authService.prijava(username, password);

      // Provera da li je prijava uspesna
      if (result.id !== 0) {
        // Kreiranje jwt tokena
        const token = jwt.sign(
          { 
            id: result.id, 
            username: result.username, 
            role: result.role,
          }, process.env.JWT_SECRET ?? "", { expiresIn: '6h' });

        res.status(200).json({success: true, message: 'Uspešna prijava', data: token});
        return;
      } else {
        res.status(401).json({success: false, message: 'Неисправно корисничко име или лозинка'});
        return;
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({success: false, message: error});
    }
  }

  /**
   * POST /api/v1/auth/register
   * Registracija novog korisnika
   */
  private async registracija(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password, full_name, profile_image } = req.body;
      
      // TODO: Validator podataka za registraciju
      // const rezultat = authRegistracijaValidator(korisnickoIme, lozinka);

      if (!username || username.length < 3 || username.length > 40) {
        res.status(400).json({ success: false, message: 'Korisnicko ime nije validno (3-40 karaktera).' });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!email || !emailRegex.test(email)) {
        res.status(400).json({ success: false, message: 'Email format nije validan.' });
        return;
      }
      
     const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
     
      if (!password || !passwordRegex.test(password)) {
        res.status(400).json({ success: false, message: 'Lozinka mora imati najmanje 8 karaktera, jedno veliko slovo i jedan broj.' });
        return;
      }
      
      if (!full_name) {
        res.status(400).json({ success: false, message: 'Ime i prezime je obavezno.' });
        return;
      }

      const result = await this.authService.registracija(username, email, password, full_name, profile_image);
      
      // Proveravamo da li je registracija uspešna
      if (result.id !== 0) {
        // Kreiranje jwt tokena
        const token = jwt.sign(
          { 
            id: result.id, 
            username: result.username, 
            role: result.role,
          }, process.env.JWT_SECRET ?? "", { expiresIn: '6h' });


        res.status(201).json({success: true, message: 'Uspesna registracija', data: token});
      } else {
        res.status(401).json({success: false, message: 'Registracija nije uspela. Korisnicko ime vec postoji.', });
      }
    } catch (error) {
      res.status(500).json({success: false, message: error});
    }
  }

  /**
   * Getter za router
   */
  public getRouter(): Router {
    return this.router;
  }
}