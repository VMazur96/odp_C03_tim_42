import { Request, Response, Router } from "express";
import { AuditService } from "../../Services/audits/AuditService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";

export class AuditController {
  private router: Router;

  constructor(private auditService: AuditService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Samo admin sme da gleda logove
    this.router.get("/logs", authenticate, authorize("admin"), this.getLogs.bind(this));
  }

  private async getLogs(req: Request, res: Response): Promise<void> {
    try {
      const logovi = await this.auditService.dohvatiSveLogove();
      res.status(200).json({ success: true, data: logovi });
    } catch (error) {
      res.status(500).json({ success: false, message: "Greška na serveru." });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}