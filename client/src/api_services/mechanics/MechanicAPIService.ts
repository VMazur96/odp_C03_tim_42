import axios from 'axios';
import type { MechanicDto } from '../../models/mechanics/MechanicDto';
import { procitajVrednostPoKljucu } from '../../helpers/local_storage';

const API_URL = import.meta.env.VITE_API_URL + 'mechanics';

export const mechanicApi = {
  // Dohvatanje svih mehanika
  getAll: async (): Promise<MechanicDto[]> => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error: unknown) {
      console.error("Greška pri dohvatanju mehanika", error);
      return [];
    }
  },

  // Dodavanje nove mehanike (Samo Admin)
  add: async (name: string): Promise<{ success: boolean; data?: MechanicDto; message?: string }> => {
    try {
      const token = procitajVrednostPoKljucu("authToken");
      const response = await axios.post(API_URL, { name }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, data: response.data.data };
    } catch (error: unknown) {
      let poruka = "Greška pri dodavanju mehanike.";
      
      if (axios.isAxiosError(error)) {
        poruka = error.response?.data?.message || poruka;
      } else if (error instanceof Error) {
        poruka = error.message;
      }

      return { success: false, message: poruka };
    }
  },

  // Brisanje mehanike (Samo Admin)
  delete: async (id: number): Promise<{ success: boolean; message?: string }> => {
    try {
      const token = procitajVrednostPoKljucu("authToken");
      const response = await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, message: response.data.message };
    } catch (error: unknown) {
      let poruka = "Greška pri brisanju mehanike.";
      
      if (axios.isAxiosError(error)) {
        poruka = error.response?.data?.message || poruka;
      } else if (error instanceof Error) {
        poruka = error.message;
      }

      return { success: false, message: poruka };
    }
  }
};