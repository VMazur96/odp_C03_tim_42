import { Session } from "../../models/Session";
import { SessionPlayer } from "../../models/SessionPlayer";
import { SessionDto } from "../../DTOs/sessions/SessionDto";

export interface ISessionRepository {
  // Upravljanje samom sesijom
  createSession(session: Session): Promise<number>; // Vraća ID tek kreirane sesije
  getSessionById(id: number): Promise<SessionDto | null>;
  getUserSessions(userId: number): Promise<SessionDto[]>;
  deleteSession(id: number, creatorId: number): Promise<boolean>;
  updateSession(session: Session): Promise<boolean>;

  // Upravljanje ucesnicima unutar sesije
  addPlayer(sessionPlayer: SessionPlayer): Promise<boolean>;
  updatePlayer(sessionPlayer: SessionPlayer): Promise<boolean>;
  removePlayer(sessionId: number, userId: number): Promise<boolean>;
}