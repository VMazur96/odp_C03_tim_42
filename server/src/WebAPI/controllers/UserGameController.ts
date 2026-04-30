import { Request, Response, Router } from 'express';
import { IUserGameService } from '../../Domain/services/user_games/IUserGameService';
import { authenticate } from '../../Middlewares/authentification/AuthMiddleware';

export class UserGameController {
  public router: Router;
  private userGameService: IUserGameService;

  constructor(userGameService: IUserGameService) {
    this.router = Router();
    this.userGameService = userGameService;
    this.initializeRoutes();
  }

  public getRouter(): Router {
    return this.router;
  }

  private initializeRoutes() {
    this.router.get('/ping', (req: Request, res: Response) => {
        res.status(200).json({ poruka: "Bravo! Kontroler je ziv i povezan!" });
    });

    this.router.post('/', authenticate, this.dodajIgru.bind(this));
    this.router.get('/', authenticate, this.dohvatiKolekciju.bind(this));
  }

  private async dodajIgru(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id; // ID se automatski cita iz tokena
      const { gameId, status, rating } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Niste prijavljeni.' });
        return;
      }

      if (!gameId || !status) {
        res.status(400).json({ success: false, message: 'Nedostaju podaci o igri ili statusu.' });
        return;
      }

      const uspesno = await this.userGameService.dodajIgru(userId, gameId, status, rating || null);
      
      if (uspesno) {
        res.status(200).json({ success: true, message: 'Igra uspesno dodata/azurirana u kolekciji.' });
      } else {
        res.status(400).json({ success: false, message: 'Nije moguce dodati igru u kolekciju.' });
      }
    } catch (error) {
      console.error("Greska u kontroleru pri dodavanju igre:", error);
      res.status(500).json({ success: false, message: 'Serverska greska.' });
    }
  }

  private async dohvatiKolekciju(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Niste prijavljeni.' });
        return;
      }

      const kolekcija = await this.userGameService.dohvatiKolekciju(userId);
      res.status(200).json({ success: true, data: kolekcija });
    } catch (error) {
      console.error("Greska u kontroleru pri dohvatanju kolekcije:", error);
      res.status(500).json({ success: false, message: 'Serverska greska.' });
    }
  }
}