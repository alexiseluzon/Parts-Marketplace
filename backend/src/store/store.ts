// In-memory store. No DB per JD scope — resets on server restart.

export interface User {
  id: string;
  email: string;
  passwordHash: string;
}

export interface Part {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  ownerId: string;
}

export const users: User[] = [];
export const parts: Part[] = [];

let userSeq = 1;
let partSeq = 1;

export const nextUserId = () => String(userSeq++);
export const nextPartId = () => String(partSeq++);
