import type { GameDto } from "../../models/games/GameDto";
import type { IGameAPIService } from "./IGameAPIService";
import axios from "axios";
import { procitajVrednostPoKljucu } from "../../helpers/local_storage";

// Gadja http://localhost:4000/api/v1/games
const API_URL: string = import.meta.env.VITE_API_URL + "games";

export const gameApi: IGameAPIService = {
  async getAllGames(): Promise<GameDto[]> {
    try {
      const res = await axios.get<{success: boolean, data: GameDto[]}>(API_URL);
      
      if (res.data.success) {
        return res.data.data;
      }
      return [];
    } catch (error) {
      console.error("Greska pri pronalazenju kataloga igara:", error);
      return [];
    }
  },

  async getGameById(id: number): Promise<GameDto | null> {
    try {
      const res = await axios.get<{success: boolean, data: GameDto}>(`${API_URL}/${id}`);
      
      if (res.data.success) {
        return res.data.data;
      }
      return null;
    } catch (error) {
      console.error(`Greska pri dohvatanju igre sa ID ${id}:`, error);
      return null;
    }
  },

  async createGame(gameData: Record<string, unknown>, mechanicIds: number[]): Promise<{ success: boolean; message: string }> {
    try {
      const token = procitajVrednostPoKljucu("authToken");
      
      const payload = {
        ...gameData,
        mechanicIds
      };

      const response = await axios.post(API_URL, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return { success: true, message: response.data.message };
    } catch (error: unknown) {
      let poruka = "Greška pri dodavanju igre.";
      
      if (axios.isAxiosError(error)) {
        poruka = error.response?.data?.message || poruka;
      } else if (error instanceof Error) {
        poruka = error.message;
      }
      
      return { success: false, message: poruka };
    }
  },

  async updateGame(id: number, gameData: Record<string, unknown>, mechanicIds: number[]): Promise<{ success: boolean; message: string }> {
    try {
      const token = procitajVrednostPoKljucu("authToken");
      const payload = { ...gameData, mechanicIds };
      
      const response = await axios.put(`${API_URL}/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, message: response.data.message };
    } catch (error: unknown) {
      let poruka = "Greška pri ažuriranju igre.";
      if (axios.isAxiosError(error)) {
        poruka = error.response?.data?.message || poruka;
      }
      return { success: false, message: poruka };
    }
  },

  async deleteGame(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const token = procitajVrednostPoKljucu("authToken");
      const response = await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, message: response.data.message };
    } catch (error: unknown) {
      let poruka = "Greška pri brisanju igre.";
      if (axios.isAxiosError(error)) {
        poruka = error.response?.data?.message || poruka;
      }
      return { success: false, message: poruka };
    }
  }
};