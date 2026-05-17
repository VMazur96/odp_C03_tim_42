import axios from 'axios';
import type { AdminUserDto } from '../../models/users/AdminUserDto';
import { procitajVrednostPoKljucu } from '../../helpers/local_storage';

const API_URL = import.meta.env.VITE_API_URL + 'users';

// API servis za administraciju korisnika
export const adminKorisniciApi = {
  getAllUsers: async (): Promise<AdminUserDto[]> => {
    try {
      const token = procitajVrednostPoKljucu("authToken");
      const response = await axios.get(`${API_URL}/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error("Greška pri dohvatanju korisnika", error);
      return [];
    }
  },

  // Promena uloge
  promeniUlogu: async (id: number, novaUloga: string): Promise<{ success: boolean; message: string }> => {
    try {
      const token = procitajVrednostPoKljucu("authToken");
      const response = await axios.put(`${API_URL}/${id}/role`, { role: novaUloga }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true, message: response.data.message };
    } catch (error: unknown) {
      let poruka = "Greška pri promeni uloge.";
      if (axios.isAxiosError(error)) {
        poruka = error.response?.data?.message || poruka;
      }
      return { success: false, message: poruka };
    }
  }
};