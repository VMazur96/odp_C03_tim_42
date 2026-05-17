import { Request, Response, Router } from "express";
import { IUserService } from "../../Domain/services/users/IUserService";
import { UserDto } from "../../Domain/DTOs/users/UserDto";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";

export class UserController {
  private router: Router;
  private userService: IUserService;

  constructor(userService: IUserService) {
    this.router = Router();
    this.userService = userService;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // ostale metode, npr. /api/v1/user/1 <--- user po ID-ju 1
    //  HTTP method, path,    middlewares,...                   connected method
    this.router.get("/users/me", authenticate, this.trenutniKorisnik.bind(this));
    this.router.get("/users/all", authenticate, authorize("admin"), this.korisnici.bind(this));
    this.router.get("/users/search", authenticate, this.pretraga.bind(this));
    this.router.put("/users/me", authenticate, this.azurirajProfil.bind(this));
    this.router.get("/users/:id", this.javniProfil.bind(this));
    this.router.put("/users/:id/role", authenticate, authorize("admin"), this.promeniUloguKorisnika.bind(this));
  }

  // Dohvatanje profila trenutnog korisnika
  private async trenutniKorisnik(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Niste prijavljeni." });
        return;
      }
      const korisnik = await this.userService.getTrenutniKorisnik(userId);
      res.status(200).json({ success: true, data: korisnik });
    } catch (error) {
      res.status(500).json({ success: false, message: "Serverska greska." });
    }
  }

  // Dohvatanje javnog profila korisnika po ID-ju
  private async javniProfil(req: Request, res: Response): Promise<void> {
    try {
      if (req.params.id === 'me' || req.params.id === 'search') return; 

      const id = parseInt(req.params.id as string, 10);
      const korisnik = await this.userService.getTrenutniKorisnik(id); 
      
      if (korisnik) {
        res.status(200).json({ success: true, data: korisnik });
      } else {
        res.status(404).json({ success: false, message: "Korisnik nije pronađen." });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Serverska greška." });
    }
  }
  /**
   * GET /api/v1/users
   * Svi korisnici
   */
  private async korisnici(req: Request, res: Response): Promise<void> {
    try {
      const korisniciPodaci: UserDto[] =
        await this.userService.getSviKorisnici();

      res.status(200).json(korisniciPodaci);
      return;
    } catch (error) {
      res.status(500).json({ success: false, message: error });
    }
  }

  // Pretraga korisnika po imenu
  private async pretraga(req: Request, res: Response): Promise<void> {
    try {
      const q = req.query.q as string;
      if (!q) {
        res.status(400).json({ success: false, message: "Unesite parametar za pretragu" });
        return;
      }
      const korisnici = await this.userService.pretragaKorisnika(q);
      res.status(200).json({ success: true, data: korisnici });
    } catch (error) {
      res.status(500).json({ success: false, message: "Serverska greska." });
    }
  }

  // Azuriranje profila
  private async azurirajProfil(req: Request, res: Response): Promise<void> {
    try {
      // Ocekuje da salje staraLozinka, novaLozinka i novaSlika
      const { oldPassword, password, profileImage } = req.body; 
      const userId = req.user!.id;

      if (profileImage) {
        // Validacija velicine slike (maks 2MB)
        const base64Data = profileImage.split(',')[1];
        if (base64Data) {
          const velicinaUBajtovima = Buffer.from(base64Data, 'base64').length;
          const dvaMegabajta = 2 * 1024 * 1024;

          if (velicinaUBajtovima > dvaMegabajta) {
            res.status(400).json({ success: false, message: "Slika premašuje maksimalnu veličinu od 2MB." });
            return;
          }
        }
      }
      
      const uspeh = await this.userService.azurirajProfil(userId, oldPassword, password, profileImage);
      res.json({ success: uspeh });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: "Greška na serveru." });
      }
    }
  }

  // Promena uloge korisnika (samo admin može menjati uloge)
  private async promeniUloguKorisnika(req: Request, res: Response): Promise<void> {
    try {
      const targetUserId = parseInt(req.params.id as string, 10);
      const { role } = req.body; 
      
      if (req.user?.id === targetUserId) {
        res.status(400).json({ success: false, message: "Ne možete sami sebi promeniti ulogu!" });
        return;
      }

      const success = await this.userService.promeniUlogu(targetUserId, role);
      
      if (success) {
        res.status(200).json({ success: true, message: "Uloga uspešno promenjena." });
      } else {
        res.status(404).json({ success: false, message: "Korisnik nije pronađen." });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: "Greška servera." });
      }
    }
  }

  /**
   * Getter za router
   */
  public getRouter(): Router {
    return this.router;
  }
}
