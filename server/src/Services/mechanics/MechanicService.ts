import { IMechanicService } from '../../Domain/services/mechanics/IMechanicService';
import { IMechanicRepository } from '../../Domain/repositories/mechanics/IMechanicRepository';
import { Mechanic } from '../../Domain/models/Mechanic';

export class MechanicService implements IMechanicService {
  private mechanicRepo: IMechanicRepository;

  constructor(mechanicRepo: IMechanicRepository) {
    this.mechanicRepo = mechanicRepo;
  }

  // Dohvatanje svih mehanika
  async getAll(): Promise<Mechanic[]> {
    return await this.mechanicRepo.getAll();
  }

  // Dodavanje nove mehanike sa validacijom
  async add(name: string): Promise<Mechanic | null> {
    // Validacija: ime ne sme biti prazno ili samo razmaci
    if (!name || name.trim().length === 0) return null;
    return await this.mechanicRepo.add(name.trim());
  }

  // Brisanje mehanike
  async delete(id: number): Promise<{ success: boolean; message: string }> {
    // Proverava da li se mehanika koristi u veznoj tabeli pre brisanja
    const uUpotrebi = await this.mechanicRepo.isAssignedToGame(id);
    if (uUpotrebi) {
      return { success: false, message: 'Mehanika se ne može obrisati jer je dodeljena jednoj ili više igara.' };
    }

    const uspesno = await this.mechanicRepo.delete(id);
    if (uspesno) {
      return { success: true, message: 'Mehanika uspešno obrisana.' };
    } else {
      return { success: false, message: 'Mehanika nije pronađena.' };
    }
  }
}