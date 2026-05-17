import { Mechanic } from '../../models/Mechanic';

export interface IMechanicRepository {
  getAll(): Promise<Mechanic[]>;
  add(name: string): Promise<Mechanic | null>;
  delete(id: number): Promise<boolean>;
  isAssignedToGame(id: number): Promise<boolean>;
}