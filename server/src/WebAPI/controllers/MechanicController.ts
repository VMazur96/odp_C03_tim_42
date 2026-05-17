import { Request, Response, Router } from 'express';
import { IMechanicService } from '../../Domain/services/mechanics/IMechanicService';
import { authenticate } from '../../Middlewares/authentification/AuthMiddleware';
import { authorize } from '../../Middlewares/authorization/AuthorizeMiddleware';

export class MechanicController {
  private router: Router;
  private mechanicService: IMechanicService;

  constructor(mechanicService: IMechanicService) {
    this.router = Router();
    this.mechanicService = mechanicService;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Javno:
    this.router.get('/', this.getAll.bind(this));

    // Admin rute: 
    this.router.post('/', authenticate, authorize('admin'), this.add.bind(this));
    this.router.delete('/:id', authenticate, authorize('admin'), this.delete.bind(this));
  }

  // Dohvatanje svih mehanika
  private async getAll(req: Request, res: Response): Promise<void> {
    try {
      const mehanike = await this.mechanicService.getAll();
      res.json(mehanike);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Greška pri dohvatanju mehanika.' });
    }
  }

  // Dodavanje nove mehanike
  private async add(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.body;
      const novaMehanika = await this.mechanicService.add(name);
      
      if (novaMehanika) {
        res.status(201).json({ success: true, data: novaMehanika });
      } else {
        res.status(400).json({ success: false, message: 'Mehanika već postoji ili je naziv nevažeći.' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Greška na serveru.' });
    }
  }

  // Brisanje mehanike
  private async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      const rezultat = await this.mechanicService.delete(id);
      
      if (rezultat.success) {
        res.json(rezultat);
      } else {
        res.status(400).json(rezultat);
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Greška na serveru.' });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}