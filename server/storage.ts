import { type User, type InsertUser, type Quote, type InsertQuote, type UpdateQuote } from "@shared/schema";
import { randomUUID } from "crypto";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllQuotes(): Promise<Quote[]>;
  getQuote(id: string): Promise<Quote | undefined>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  updateQuote(id: string, data: UpdateQuote): Promise<Quote | undefined>;
  deleteQuote(id: string): Promise<boolean>;
}

const DATA_DIR = path.join(process.cwd(), "data");
const QUOTES_FILE = path.join(DATA_DIR, "quotes.json");

export class JsonFileStorage implements IStorage {
  private users: Map<string, User>;
  private quotes: Map<string, Quote>;
  private initialized: boolean = false;

  constructor() {
    this.users = new Map();
    this.quotes = new Map();
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    
    await this.loadQuotes();
    this.initialized = true;
  }

  private async loadQuotes(): Promise<void> {
    try {
      if (!existsSync(DATA_DIR)) {
        await mkdir(DATA_DIR, { recursive: true });
      }

      if (existsSync(QUOTES_FILE)) {
        const data = await readFile(QUOTES_FILE, "utf-8");
        const quotesArray: Quote[] = JSON.parse(data);
        quotesArray.forEach(quote => {
          this.quotes.set(quote.id, quote);
        });
        console.log(`Loaded ${quotesArray.length} quotes from file`);
      } else {
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
        
        await this.saveQuotes();
        console.log("Initialized with default quotes");
      }
    } catch (error) {
      console.error("Error loading quotes:", error);
    }
  }

  private async saveQuotes(): Promise<void> {
    try {
      if (!existsSync(DATA_DIR)) {
        await mkdir(DATA_DIR, { recursive: true });
      }
      
      const quotesArray = Array.from(this.quotes.values());
      await writeFile(QUOTES_FILE, JSON.stringify(quotesArray, null, 2), "utf-8");
    } catch (error) {
      console.error("Error saving quotes:", error);
      throw error;
    }
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
    await this.ensureInitialized();
    return Array.from(this.quotes.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  async getQuote(id: string): Promise<Quote | undefined> {
    await this.ensureInitialized();
    return this.quotes.get(id);
  }

  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    await this.ensureInitialized();
    const id = randomUUID();
    const quote: Quote = { ...insertQuote, id };
    this.quotes.set(id, quote);
    await this.saveQuotes();
    return quote;
  }

  async updateQuote(id: string, data: UpdateQuote): Promise<Quote | undefined> {
    await this.ensureInitialized();
    const existingQuote = this.quotes.get(id);
    
    if (!existingQuote) {
      return undefined;
    }

    const updatedQuote: Quote = {
      ...existingQuote,
      ...(data.name !== undefined && { name: data.name }),
      ...(data.text !== undefined && { text: data.text }),
      ...(data.type !== undefined && { type: data.type }),
    };

    this.quotes.set(id, updatedQuote);
    await this.saveQuotes();
    return updatedQuote;
  }

  async deleteQuote(id: string): Promise<boolean> {
    await this.ensureInitialized();
    const deleted = this.quotes.delete(id);
    if (deleted) {
      await this.saveQuotes();
    }
    return deleted;
  }
}

export const storage = new JsonFileStorage();
