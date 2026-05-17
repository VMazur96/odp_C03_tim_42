import axios from 'axios';
import { procitajVrednostPoKljucu } from '../../helpers/local_storage';
import type { AuditLogDto } from '../../models/audits/AuditLogDto';

const API_URL = import.meta.env.VITE_API_URL + 'audits/logs';

export const auditApi = {
  getAllLogs: async (): Promise<AuditLogDto[]> => {
    try {
      const token = procitajVrednostPoKljucu("authToken");
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      console.error("Greška pri dohvatanju logova", error);
      return [];
    }
  }
};