import axios from "axios";
import { PročitajVrednostPoKljuču } from "../../helpers/local_storage";
import type { IUserGamesAPIService } from "./IUserGamesAPIService";
import type { UserGameDto } from "../../models/user_games/UserGameDto";

const API_URL = import.meta.env.VITE_API_URL + "user-games";

export const userGamesApi: IUserGamesAPIService = {
  
  async dodajUKolekciju(gameId: number, status: string, rating: number | null = null): Promise<boolean> {
    try {
      const token = PročitajVrednostPoKljuču("authToken");
      if (!token) {
        console.error("Nema tokena, korisnik nije prijavljen.");
        return false;
      }

      const res = await axios.post(API_URL, 
        { gameId, status, rating }, 
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

  async dohvatiMojuKolekciju(): Promise<UserGameDto[]> {
    try {
      const token = PročitajVrednostPoKljuču("authToken");
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
  }
};