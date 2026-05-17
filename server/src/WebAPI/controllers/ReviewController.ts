import { Request, Response, Router } from "express";
import { IReviewService } from "../../Domain/services/reviews/IReviewService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";

export class ReviewController {
  public router: Router;

  constructor(private reviewService: IReviewService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/game/:gameId", this.getByGame.bind(this));
    this.router.post("/", authenticate, this.create.bind(this));
    this.router.put("/:id", authenticate, this.update.bind(this));
    this.router.delete("/:id", authenticate, this.delete.bind(this));
    this.router.get("/me", authenticate, this.getMoje.bind(this));
  }

  // Dohvatanje recenzija za određenu igru
  private async getByGame(req: Request, res: Response): Promise<void> {
    const reviews = await this.reviewService.dohvatiZaIgru(Number(req.params.gameId));
    res.json({ success: true, data: reviews });
  }

  // Dodavanje nove recenzije
  private async create(req: Request, res: Response): Promise<void> {
    try {
      const { gameId, title, body, rating } = req.body;
      const userId = req.user!.id;

      if (body.length < 50 || body.length > 3000) {
        res.status(400).json({ success: false, message: "Recenzija mora imati između 50 i 3000 karaktera." });
        return;
      }

      const uspeh = await this.reviewService.dodajRecenziju(userId, gameId, title, body, rating);
      if (uspeh) res.status(201).json({ success: true });
      else res.status(400).json({ success: false, message: "Već imate recenziju ili igra nije u kolekciji." });
    } catch {
      res.status(500).json({ success: false, message: "Serverska greška" });
    }
  }

  // Izmena postojeće recenzije
  private async update(req: Request, res: Response): Promise<void> {
    const { title, body, rating } = req.body;
    if (body.length < 50 || body.length > 3000) {
      res.status(400).json({ success: false, message: "Recenzija mora imati između 50 i 3000 karaktera." });
      return;
    }
    const uspeh = await this.reviewService.izmeniRecenziju(Number(req.params.id), req.user!.id, title, body, rating);
    res.json({ success: uspeh });
  }

  // Brisanje recenzije
  private async delete(req: Request, res: Response): Promise<void> {
    const uspeh = await this.reviewService.obrisiRecenziju(Number(req.params.id), req.user!.id);
    res.json({ success: uspeh });
  }

  // Dohvatanje recenzija koje je napisao trenutni korisnik
  private async getMoje(req: Request, res: Response): Promise<void> {
    const reviews = await this.reviewService.dohvatiMojeRecenzije(req.user!.id);
    res.json({ success: true, data: reviews });
  }
}