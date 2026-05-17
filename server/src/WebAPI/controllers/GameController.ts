import { Request, Response, Router } from "express";
import { IGameService } from "../../Domain/services/games/IGameService";
import { Game } from "../../Domain/models/Game";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";

export class GameController {
  private router: Router;
  private gameService: IGameService;

  constructor(gameService: IGameService) {
    this.router = Router();
    this.gameService = gameService;
    this.initializeRoutes();
  }

  // Inicijalizacija ruta
  private initializeRoutes(): void {
    // Javno dostupne rute (Gosti i prijavljeni igraci)
    this.router.get("/games", this.getAll.bind(this));
    this.router.get("/games/:id", this.getById.bind(this));

    // Zasticene rute (Samo Administratori)
    this.router.post("/games", authenticate, authorize("admin"), this.create.bind(this));
    this.router.put("/games/:id", authenticate, authorize("admin"), this.update.bind(this));
    this.router.delete("/games/:id", authenticate, authorize("admin"), this.delete.bind(this));
  }

  // Dohvatanje svih igara
  private async getAll(req: Request, res: Response): Promise<void> {
    try {
      const games = await this.gameService.getAllGames();
      res.status(200).json({ success: true, data: games });
    } catch (error) {
      res.status(500).json({ success: false, message: "Greska servera" });
    }
  }

  // Dohvatanje igre po ID-u
  private async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id as string);
      const game = await this.gameService.getGameById(id);
      if (game) {
        res.status(200).json({ success: true, data: game });
      } else {
        res.status(404).json({ success: false, message: "Igra nije pronadjena" });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Greska servera" });
    }
  }

  // Kreiranje nove igre
  private async create(req: Request, res: Response): Promise<void> {
    try {
      const newGame = new Game(
        0, req.body.name, req.body.description, req.body.min_players, 
        req.body.max_players, req.body.duration_min, req.body.weight, 
        req.body.release_year, req.body.publisher, req.body.cover_image
      );
      const mechanicIds: number[] = req.body.mechanicIds || [];
      
      const createdGame = await this.gameService.createGame(newGame, mechanicIds);
      
      if (createdGame && createdGame.id !== 0) {
        res.status(201).json({ success: true, message: "Igra uspešno dodata", data: createdGame });
      } else {
        res.status(400).json({ success: false, message: "Neuspešno dodavanje igre" });
      }
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || "Greška servera" });
    }
  }

  // Ažuriranje postojeće igre
  private async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id as string);
      const updatedGame = new Game(
        id, req.body.name, req.body.description, req.body.min_players, 
        req.body.max_players, req.body.duration_min, req.body.weight, 
        req.body.release_year, req.body.publisher, req.body.cover_image
      );
      
      const mechanicIds: number[] = req.body.mechanicIds || [];

      const result = await this.gameService.updateGame(updatedGame, mechanicIds);
      
      if (result && result.id !== 0) {
        res.status(200).json({ success: true, message: "Igra uspešno ažurirana", data: result });
      } else {
        res.status(404).json({ success: false, message: "Igra nije pronađena." });
      }
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || "Greška servera" });
    }
  }

  // Brisanje igre
  private async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id as string);
      const success = await this.gameService.deleteGame(id);
      
      if (success) {
        res.status(200).json({ success: true, message: "Igra uspešno obrisana" });
      } else {
        res.status(400).json({ success: false, message: "Neuspešno brisanje igre (Igra možda ne postoji)" });
      }
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || "Greška servera" });
    }
  }

  // Getter za router
  public getRouter(): Router {
    return this.router;
  }
}