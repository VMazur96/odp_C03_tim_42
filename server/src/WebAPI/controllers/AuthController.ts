import { Request, Response, Router } from 'express';
import { IAuthService } from '../../Domain/services/auth/IAuthService';
import jwt from "jsonwebtoken";
import { authRegistracijaValidator } from '../../Middlewares/validation/ValidationMiddleware';
import { authenticate } from '../../Middlewares/authentification/AuthMiddleware';
import { AuditService } from '../../Services/audits/AuditService';

export class AuthController {
  private router: Router;
  private authService: IAuthService;
  private auditService: AuditService;

  constructor(authService: IAuthService, auditService: AuditService) {
    this.router = Router();
    this.authService = authService;
    this.auditService = auditService;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/auth/login', this.prijava.bind(this));
    this.router.post('/auth/register', this.registracija.bind(this));
    this.router.post('/auth/logout', authenticate, this.logout.bind(this));  
  }

  private async prijava(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ success: false, message: 'Korisničko ime i lozinka su obavezni.' });
        return;
      }

      const result = await this.authService.prijava(username, password);

      if (result.id !== 0) {
        const token = jwt.sign(
          { 
            id: result.id, 
            username: result.username, 
            role: result.role
          }, process.env.JWT_SECRET ?? "", { expiresIn: '6h' });

        await this.auditService.logAkcija(result.id, 'LOGIN', 'Korisnik se uspešno prijavio u sistem.');

        res.status(200).json({success: true, message: 'Uspešna prijava', data: token});
        return;
      } else {
        res.status(401).json({success: false, message: 'Neispravno korisničko ime ili lozinka'});
        return;
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({success: false, message: error});
    }
  }

  private async registracija(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password, fullName, profileImage } = req.body;

      const result = await this.authService.registracija(username, email, password, fullName, profileImage);
      
      if (result.id !== 0) {
        const token = jwt.sign(
          { 
            id: result.id, 
            username: result.username, 
            role: result.role
          }, process.env.JWT_SECRET ?? "", { expiresIn: '6h' });

        await this.auditService.logAkcija(result.id, 'REGISTER', 'Novi korisnik je kreirao nalog.');

        res.status(201).json({success: true, message: 'Uspesna registracija', data: token});
      } else {
        res.status(401).json({success: false, message: 'Registracija nije uspela. Korisnicko ime vec postoji.', });
      }
    } catch (error) {
      res.status(500).json({success: false, message: error});
    }
  }

  private async logout(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id; 

      if (!userId) {
        res.status(401).json({ success: false, message: 'Niste prijavljeni.' });
        return;
      }

      await this.authService.logout(userId);

      await this.auditService.logAkcija(userId, 'LOGOUT', 'Korisnik se odjavio sa sistema.');

      res.status(200).json({ success: true, message: 'Uspešna odjava.' });
      
    } catch (error) {
      console.error("Greška pri odjavi:", error);
      res.status(500).json({ success: false, message: 'Greška pri odjavi.' });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}