import axios from "axios";
import type { SessionDto } from "../../models/sessions/SessionDto";

const API_URL = import.meta.env.VITE_API_URL + "sessions";

export const sessionApi = {
  // Dohvata sve sesije prijavljenog korisnika
  async dohvatiMojeSesije(): Promise<SessionDto[]> {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get<{ success: boolean; data: SessionDto[] }>(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data.data;
    } catch (error) {
      console.error("Greška pri dohvatanju sesija:", error);
      return [];
    }
  },

  // Dohvata detalje jedne konkretne sesije
  async dohvatiSesiju(id: number): Promise<SessionDto | null> {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get<{ success: boolean; data: SessionDto }>(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data.data;
    } catch (error) {
      console.error("Greška pri dohvatanju sesije:", error);
      return null;
    }
  },

  // Kreira novu sesiju
  async kreirajSesiju(gameId: number, date: string, durationMin: number, note: string | null, playerIds: number[]): Promise<number | null> {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.post<{ success: boolean; sessionId: number }>(API_URL, 
        { gameId, date, durationMin, note, playerIds }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data.sessionId;
    } catch (error) {
      console.error("Greška pri kreiranju sesije:", error);
      return null;
    }
  },

  // Brise sesiju
  async obrisiSesiju(id: number): Promise<boolean> {
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return true;
    } catch (error) {
      console.error("Greška pri brisanju sesije:", error);
      return false;
    }
  },

  // Azurira osnovne informacije o sesiji (datum, trajanje, napomene)
  async azurirajSesiju(id: number, date: string, durationMin: number, note: string | null): Promise<boolean> {
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(`${API_URL}/${id}`, 
        { date, durationMin, note },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return true;
    } catch (error) {
      console.error("Greška pri ažuriranju sesije:", error);
      return false;
    }
  },

  // Azurira poene i pobednika unutar sesije
  async azurirajIgraca(sessionId: number, userId: number, score: number | null, winner: boolean): Promise<boolean> {
    try {
      const token = localStorage.getItem("authToken");
      await axios.patch(`${API_URL}/${sessionId}/players/${userId}`, 
        { score, winner },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return true;
    } catch (error) {
      console.error("Greška pri ažuriranju igrača:", error);
      return false;
    }
  },

  // Izbacuje igraca iz sesije
  async ukloniIgraca(sessionId: number, userId: number): Promise<boolean> {
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`${API_URL}/${sessionId}/players/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return true;
    } catch (error) {
      console.error("Greška pri brisanju igrača:", error);
      return false;
    }
  }
};