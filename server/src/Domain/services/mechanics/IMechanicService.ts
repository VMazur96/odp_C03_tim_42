import { Mechanic } from '../../models/Mechanic';

export interface IMechanicService {
  getAll(): Promise<Mechanic[]>;
  add(name: string): Promise<Mechanic | null>;
  delete(id: number): Promise<{ success: boolean; message: string }>;
}