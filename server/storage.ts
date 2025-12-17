import { type User, type InsertUser, type Quote, type InsertQuote } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllQuotes(): Promise<Quote[]>;
  getQuote(id: string): Promise<Quote | undefined>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  deleteQuote(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private quotes: Map<string, Quote>;

  constructor() {
    this.users = new Map();
    this.quotes = new Map();
    
    const initialQuotes: Quote[] = [
      {
        id: randomUUID(),
        name: "Herr Müller",
        text: "Geschichte besteht nicht nur aus Daten und Namen, sie ist der Klatsch der Vergangenheit.",
        type: "Teacher",
        timestamp: Date.now() - 100000000,
      },
      {
        id: randomUUID(),
        name: "Sarah Jenkins",
        text: "Können wir heute bitte draußen Unterricht machen? Die Sonne ruft förmlich meinen Namen.",
        type: "Student",
        timestamp: Date.now() - 50000000,
      }
    ];
    
    initialQuotes.forEach(quote => {
      this.quotes.set(quote.id, quote);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllQuotes(): Promise<Quote[]> {
    return Array.from(this.quotes.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  async getQuote(id: string): Promise<Quote | undefined> {
    return this.quotes.get(id);
  }

  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const id = randomUUID();
    const quote: Quote = { ...insertQuote, id };
    this.quotes.set(id, quote);
    return quote;
  }

  async deleteQuote(id: string): Promise<boolean> {
    return this.quotes.delete(id);
  }
}

export const storage = new MemStorage();
