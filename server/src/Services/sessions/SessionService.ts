import { ISessionService } from "../../Domain/services/sessions/ISessionService";
import { ISessionRepository } from "../../Domain/repositories/sessions/ISessionRepository";
import { SessionDto } from "../../Domain/DTOs/sessions/SessionDto";
import { Session } from "../../Domain/models/Session";
import { SessionPlayer } from "../../Domain/models/SessionPlayer";

export class SessionService implements ISessionService {
  constructor(private sessionRepo: ISessionRepository) {}

  async napraviSesiju(creatorId: number, gameId: number, date: Date, durationMin: number, note: string | null, playerIds: number[]): Promise<number> {
    const novaSesija = new Session(0, creatorId, gameId, date, durationMin, note);
    const sessionId = await this.sessionRepo.createSession(novaSesija);

    if (sessionId > 0) {
      // ISPRAVKA: Spajamo kreatora i ostale igrače u jedan niz (Set sprečava duplikate)
      const sviIgraci = Array.from(new Set([creatorId, ...playerIds]));

      for (const pId of sviIgraci) {
        await this.sessionRepo.addPlayer(new SessionPlayer(sessionId, pId, null, false));
      }
      return sessionId;
    }
    return 0;
  }
  
  async dohvatiSveSesijeKorisnika(userId: number): Promise<SessionDto[]> {
    return await this.sessionRepo.getUserSessions(userId);
  }

  async dohvatiDetaljeSesije(id: number): Promise<SessionDto | null> {
    return await this.sessionRepo.getSessionById(id);
  }

  async obrisiSesiju(id: number, creatorId: number): Promise<boolean> {
    return await this.sessionRepo.deleteSession(id, creatorId);
  }

  async azurirajIgraca(sessionId: number, userId: number, score: number | null, winner: boolean): Promise<boolean> {
    return await this.sessionRepo.updatePlayer(new SessionPlayer(sessionId, userId, score, winner));
  }

  async ukloniIgraca(sessionId: number, userId: number): Promise<boolean> {
    return await this.sessionRepo.removePlayer(sessionId, userId);
  }

  async azurirajSesiju(id: number, creatorId: number, date: Date, durationMin: number, note: string | null): Promise<boolean> {
    const sesijaZaIzmenu = new Session(id, creatorId, 0, date, durationMin, note);
    return await this.sessionRepo.updateSession(sesijaZaIzmenu);
  }

  async dodajIgracaUSesiju(sessionId: number, userId: number): Promise<boolean> {
    return await this.sessionRepo.addPlayer(new SessionPlayer(sessionId, userId, null, false));
  }
}