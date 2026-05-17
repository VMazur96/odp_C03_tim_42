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

  // Dohvatanje routera za povezivanje sa glavnim routerom
  public getRouter(): Router {
    return this.router;
  }

  // Inicijalizacija ruta i povezivanje sa metodama
  private initializeRoutes() {
    this.router.get('/ping', (req: Request, res: Response) => {
        res.status(200).json({ poruka: "Kontroler je ziv i povezan!" });
    });

    this.router.post('/', authenticate, this.dodajIgru.bind(this));
    this.router.get('/', authenticate, this.dohvatiKolekciju.bind(this));

    this.router.put('/:gameId', authenticate, this.izmeniIgru.bind(this));
    this.router.delete('/:gameId', authenticate, this.obrisiIgru.bind(this));
  }

  // Dodavanje igre u kolekciju korisnika
  private async dodajIgru(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id; 
      const { gameId, status, rating, note } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Niste prijavljeni.' });
        return;
      }

      if (!gameId || !status) {
        res.status(400).json({ success: false, message: 'Nedostaju podaci o igri ili statusu.' });
        return;
      }

      const uspesno = await this.userGameService.dodajIgru(userId, gameId, status, rating || null, note || null);
      
      if (uspesno) {
        res.status(200).json({ success: true, message: 'Igra uspesno dodata u kolekciju.' });
      } else {
        res.status(400).json({ success: false, message: 'Nije moguce dodati igru u kolekciju.' });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Serverska greska.' });
      }
    }
  }

  // Dohvatanje kolekcije igara korisnika
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

  // Izmena igre u kolekciji
  private async izmeniIgru(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const gameId = parseInt(req.params.gameId as string, 10);
      const { status, rating, note } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Niste prijavljeni.' });
        return;
      }

      const uspesno = await this.userGameService.izmeniIgru(userId, gameId, status, rating || null, note || null);
      if (uspesno) {
        res.status(200).json({ success: true, message: 'Igra izmenjena.' });
      } else {
        res.status(400).json({ success: false, message: 'Greška pri izmeni.' });
      }
    } catch (error: unknown) {
      // PAMETNI CATCH:
      if (error instanceof Error) {
        res.status(400).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Serverska greska.' });
      }
    }
  }

  // Brisanje igre iz kolekcije
  private async obrisiIgru(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const gameId = parseInt(req.params.gameId as string, 10);

      if (!userId) {
        res.status(401).json({ success: false, message: 'Niste prijavljeni.' });
        return;
      }

      const uspesno = await this.userGameService.obrisiIgru(userId, gameId);
      if (uspesno) res.status(200).json({ success: true, message: 'Igra obrisana.' });
      else res.status(400).json({ success: false, message: 'Greška pri brisanju.' });

    } catch (error) {
      res.status(500).json({ success: false, message: 'Serverska greska.' });
    }
  }
}