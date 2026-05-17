import { Request, Response, Router } from "express";
import { ISessionService } from "../../Domain/services/sessions/ISessionService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";

export class SessionController {
  public router: Router;

  constructor(private sessionService: ISessionService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", authenticate, this.getMojeSesije.bind(this));
    this.router.post("/", authenticate, this.create.bind(this));
    this.router.get("/:id", authenticate, this.getById.bind(this));
    this.router.delete("/:id", authenticate, this.delete.bind(this));
    this.router.put("/:id", authenticate, this.updateSession.bind(this));
    this.router.post("/:id/players", authenticate, this.addPlayer.bind(this));
    
    // Rute za upravljanje ucesnicima
    this.router.patch("/:id/players/:userId", authenticate, this.updatePlayer.bind(this));
    this.router.delete("/:id/players/:userId", authenticate, this.removePlayer.bind(this));
  }

  // Kreiranje nove sesije
  private async create(req: Request, res: Response) {
    try {
      const { gameId, date, durationMin, note, playerIds } = req.body;
      const creatorId = req.user?.id;

      if (!creatorId) return res.status(401).json({ success: false, message: "Neautorizovan pristup" });

      const id = await this.sessionService.napraviSesiju(creatorId, gameId, new Date(date), durationMin, note, playerIds || []);
      
      if (id > 0) res.status(201).json({ success: true, sessionId: id });
      else res.status(400).json({ success: false, message: "Greška pri kreiranju sesije" });
    } catch (e) {
      res.status(500).json({ success: false, message: "Serverska greška" });
    }
  }

  // Dohvatanje sesija koje je kreirao trenutni korisnik
  private async getMojeSesije(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) return res.status(401).send();
    const sesije = await this.sessionService.dohvatiSveSesijeKorisnika(userId);
    res.json({ success: true, data: sesije });
  }

  // Dohvatanje detalja sesije po ID-u
  private async getById(req: Request, res: Response) {
    const sesija = await this.sessionService.dohvatiDetaljeSesije(Number(req.params.id));
    if (sesija) res.json({ success: true, data: sesija });
    else res.status(404).json({ success: false, message: "Sesija nije pronađena" });
  }

  // Brisanje sesije (samo kreator može obrisati)
  private async delete(req: Request, res: Response) {
    const uspeh = await this.sessionService.obrisiSesiju(Number(req.params.id), req.user!.id);
    if (uspeh) res.json({ success: true });
    else res.status(403).json({ success: false, message: "Samo kreator može obrisati sesiju" });
  }

  // Ažuriranje rezultata igrača u sesiji
  private async updatePlayer(req: Request, res: Response) {
    const { score, winner } = req.body;
    const uspeh = await this.sessionService.azurirajIgraca(Number(req.params.id), Number(req.params.userId), score, winner);
    res.json({ success: uspeh });
  }

  // Uklanjanje igrača iz sesije
  private async removePlayer(req: Request, res: Response) {
    const uspeh = await this.sessionService.ukloniIgraca(Number(req.params.id), Number(req.params.userId));
    res.json({ success: uspeh });
  }

  // Ažuriranje sesije
  private async updateSession(req: Request, res: Response) {
    try {
      const { date, durationMin, note } = req.body;
      const uspeh = await this.sessionService.azurirajSesiju(Number(req.params.id), req.user!.id, new Date(date), durationMin, note);
      if (uspeh) res.json({ success: true, message: "Sesija uspešno izmenjena" });
      else res.status(403).json({ success: false, message: "Samo kreator može izmeniti sesiju ili sesija ne postoji" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Serverska greška" });
    }
  }

  // Dodavanje igrača u sesiju
  private async addPlayer(req: Request, res: Response) {
    try {
      const { userId } = req.body; // ID korisnika kojeg dodaje
      const uspeh = await this.sessionService.dodajIgracaUSesiju(Number(req.params.id), userId);
      if (uspeh) res.status(201).json({ success: true, message: "Igrač dodat u sesiju" });
      else res.status(400).json({ success: false, message: "Greška pri dodavanju igrača" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Serverska greška" });
    }
  }
}