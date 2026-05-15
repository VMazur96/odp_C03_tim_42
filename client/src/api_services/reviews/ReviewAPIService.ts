import axios from "axios";
import type { ReviewDto } from "../../models/reviews/ReviewDto";

const API_URL: string = import.meta.env.VITE_API_URL + "reviews";

export const reviewApi = {
  // Dohvata sve recenzije za jednu igru (Javno)
  async dohvatiZaIgru(gameId: number): Promise<ReviewDto[]> {
    try {
      const res = await axios.get<{success: boolean, data: ReviewDto[]}>(`${API_URL}/game/${gameId}`);
      if (res.data && res.data.success) {
        return res.data.data;
      }
      return [];
    } catch {
      return [];
    }
  },

  // Dodavanje recenzije (Samo za ulogovane koji imaju igru)
  async dodajRecenziju(gameId: number, title: string, body: string, rating: number): Promise<boolean> {
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(API_URL, 
        { gameId, title, body, rating }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return true;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Greška pri dodavanju recenzije.");
      } else {
        alert("Dogodila se neočekivana greška.");
      }
      return false;
    }
  },

  // Izmena sopstvene recenzije
  async izmeniRecenziju(id: number, title: string, body: string, rating: number): Promise<boolean> {
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(`${API_URL}/${id}`, 
        { title, body, rating }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return true;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Greška pri izmeni recenzije.");
      } else {
        alert("Dogodila se neočekivana greška.");
      }
      return false;
    }
  },

  // Brisanje sopstvene recenzije
  async obrisiRecenziju(id: number): Promise<boolean> {
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return true;
    } catch {
      alert("Greška pri brisanju recenzije.");
      return false;
    }
  },

  // Dohvata recenzije ulogovanog korisnika
  async dohvatiMojeRecenzije(): Promise<ReviewDto[]> {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get<{success: boolean, data: ReviewDto[]}>(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.success) {
        return res.data.data;
      }
      return [];
    } catch {
      return [];
    }
  }
};