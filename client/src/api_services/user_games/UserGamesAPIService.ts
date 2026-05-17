import axios from "axios";
import { procitajVrednostPoKljucu } from "../../helpers/local_storage";
import type { IUserGamesAPIService } from "./IUserGamesAPIService";
import type { UserGameDto } from "../../models/user_games/UserGameDto";
import type { GameStatus } from '../../models/enums/GameStatus';

const API_URL = import.meta.env.VITE_API_URL + "collection";

export const userGamesApi: IUserGamesAPIService = {
  
  // Dodaje igru u kolekciju korisnika
  async dodajUKolekciju(gameId: number, status: GameStatus, rating: number | null = null, note: string | null = null): Promise<boolean> {
    try {
      const token = procitajVrednostPoKljucu("authToken");
      if (!token) {
        console.error("Nema tokena, korisnik nije prijavljen.");
        return false;
      }

      const res = await axios.post(API_URL, 
        { gameId, status, rating, note }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      return res.data.success;
    } catch (error: unknown) { 
      if (axios.isAxiosError(error)) {
        const serverMessage = error.response?.data?.message || error.message;
        const statusCode = error.response?.status || "Nema statusa";
        console.error(`Greška [${statusCode}] sa backenda pri dodavanju:`, serverMessage);
      } else {
        console.error("Nepoznata greška pri dodavanju u kolekciju", error);
      }
      return false;
    }
  },

  // Dohvata kolekciju igara korisnika
  async dohvatiMojuKolekciju(): Promise<UserGameDto[]> {
    try {
      const token = procitajVrednostPoKljucu("authToken");
      if (!token) return [];

      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return res.data.data || [];
    } catch (error: unknown) { 
      if (axios.isAxiosError(error)) {
        const serverMessage = error.response?.data?.message || error.message;
        console.error("Greška pri dohvatanju kolekcije:", serverMessage);
      } else {
        console.error("Nepoznata greška pri dohvatanju kolekcije", error);
      }
      return [];
    }
  },

  // Izmenjuje status, ocenu ili belešku o igri u kolekciji
  async izmeniIgru(gameId: number, status: GameStatus, rating: number | null, note: string | null): Promise<boolean> {
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(`${API_URL}/${gameId}`, 
        { status, rating, note }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return true;
    } catch (error) {
      console.error("Greška pri izmeni:", error);
      return false;
    }
  },

  // Brise igru iz kolekcije korisnika
  async obrisiIgru(gameId: number): Promise<boolean> {
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`${API_URL}/${gameId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return true;
    } catch (error) {
      console.error("Greška pri brisanju:", error);
      return false;
    }
  }
};