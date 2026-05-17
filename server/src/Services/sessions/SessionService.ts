import { ISessionService } from "../../Domain/services/sessions/ISessionService";
import { ISessionRepository } from "../../Domain/repositories/sessions/ISessionRepository";
import { IUserGameRepository } from "../../Domain/repositories/user_games/IUserGameRepository"; // DODATO
import { SessionDto } from "../../Domain/DTOs/sessions/SessionDto";
import { Session } from "../../Domain/models/Session";
import { SessionPlayer } from "../../Domain/models/SessionPlayer";

export class SessionService implements ISessionService {
  constructor(
    private sessionRepo: ISessionRepository,
    private userGameRepo: IUserGameRepository
  ) {}

  // Kreiranje nove sesije sa validacijom
  async napraviSesiju(creatorId: number, gameId: number, date: Date, durationMin: number, note: string | null, playerIds: number[]): Promise<number> {
    
    // Validacija datuma - ne može biti u budućnosti
    const danas = new Date();
    if (date > danas) {
      throw new Error("Datum sesije ne može biti u budućnosti.");
    }

    // Validacija vlasoništva igre - korisnik mora imati igru u kolekciji sa statusom 'owned'
    const kolekcija = await this.userGameRepo.dohvatiKolekcijuKorisnika(creatorId);
    const igraUKolekciji = kolekcija.find(g => g.gameId === gameId);
    
    if (!igraUKolekciji || igraUKolekciji.status !== 'owned') {
      throw new Error("Igra nije u vašoj kolekciji (mora imati status 'owned').");
    }

    const novaSesija = new Session(0, creatorId, gameId, date, durationMin, note);
    const sessionId = await this.sessionRepo.createSession(novaSesija);

    if (sessionId > 0) {
      const sviIgraci = Array.from(new Set([creatorId, ...playerIds]));

      for (const pId of sviIgraci) {
        await this.sessionRepo.addPlayer(new SessionPlayer(sessionId, pId, null, false));
      }
      return sessionId;
    }
    return 0;
  }
  
  // Dohvatanje svih sesija korisnika
  async dohvatiSveSesijeKorisnika(userId: number): Promise<SessionDto[]> {
    return await this.sessionRepo.getUserSessions(userId);
  }

  // Dohvatanje detalja sesije po ID-u
  async dohvatiDetaljeSesije(id: number): Promise<SessionDto | null> {
    return await this.sessionRepo.getSessionById(id);
  }

  // Brisanje sesije
  async obrisiSesiju(id: number, creatorId: number): Promise<boolean> {
    return await this.sessionRepo.deleteSession(id, creatorId);
  }

  // Ažuriranje rezultata igrača u sesiji
  async azurirajIgraca(sessionId: number, userId: number, score: number | null, winner: boolean): Promise<boolean> {
    return await this.sessionRepo.updatePlayer(new SessionPlayer(sessionId, userId, score, winner));
  }

  // Uklanjanje igrača iz sesije
  async ukloniIgraca(sessionId: number, userId: number): Promise<boolean> {
    return await this.sessionRepo.removePlayer(sessionId, userId);
  }

  // Ažuriranje sesije
  async azurirajSesiju(id: number, creatorId: number, date: Date, durationMin: number, note: string | null): Promise<boolean> {
    const sesijaZaIzmenu = new Session(id, creatorId, 0, date, durationMin, note);
    return await this.sessionRepo.updateSession(sesijaZaIzmenu);
  }

  //
  async dodajIgracaUSesiju(sessionId: number, userId: number): Promise<boolean> {
    return await this.sessionRepo.addPlayer(new SessionPlayer(sessionId, userId, null, false));
  }
}