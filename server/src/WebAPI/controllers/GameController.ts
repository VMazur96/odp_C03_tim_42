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

  private initializeRoutes(): void {
    // Javno dostupne rute (Gosti i prijavljeni igraci)
    this.router.get("/games", this.getAll.bind(this));
    this.router.get("/games/:id", this.getById.bind(this));

    // Zasticene rute (Samo Administratori)
    this.router.post("/games", authenticate, authorize("admin"), this.create.bind(this));
    this.router.put("/games/:id", authenticate, authorize("admin"), this.update.bind(this));
    this.router.delete("/games/:id", authenticate, authorize("admin"), this.delete.bind(this));
  }

  private async getAll(req: Request, res: Response): Promise<void> {
    try {
      const games = await this.gameService.getAllGames();
      res.status(200).json({ success: true, data: games });
    } catch (error) {
      res.status(500).json({ success: false, message: "Greska servera" });
    }
  }

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

  private async create(req: Request, res: Response): Promise<void> {
    try {
      // Mapiranje podataka iz body-ja u Game objekat
      const newGame = new Game(
        0, req.body.name, req.body.description, req.body.min_players, 
        req.body.max_players, req.body.duration_min, req.body.weight, 
        req.body.release_year, req.body.publisher, req.body.cover_image
      );
      const createdGame = await this.gameService.createGame(newGame);
      
      if (createdGame.id !== 0) {
        res.status(201).json({ success: true, message: "Igra uspesno dodata", data: createdGame });
      } else {
        res.status(400).json({ success: false, message: "Neuspesno dodavanje igre" });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Greska servera" });
    }
  }

  private async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id as string);
      const updatedGame = new Game(
        id, req.body.name, req.body.description, req.body.min_players, 
        req.body.max_players, req.body.duration_min, req.body.weight, 
        req.body.release_year, req.body.publisher, req.body.cover_image
      );
      const result = await this.gameService.updateGame(updatedGame);
      
      if (result.id !== 0) {
        res.status(200).json({ success: true, message: "Igra uspesno azurirana", data: result });
      } else {
        res.status(400).json({ success: false, message: "Neuspesno azuriranje igre" });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Greska servera" });
    }
  }

  private async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id as string);
      const success = await this.gameService.deleteGame(id);
      if (success) {
        res.status(200).json({ success: true, message: "Igra uspesno obrisana" });
      } else {
        res.status(400).json({ success: false, message: "Neuspesno brisanje igre" });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Greska servera" });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}