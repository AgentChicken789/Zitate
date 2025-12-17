import { type User, type InsertUser, type Quote, type InsertQuote, type UpdateQuote } from "@shared/schema";
import { randomUUID } from "crypto";
import { supabase } from "./supabase";

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

export class SupabaseStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
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
    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("Error fetching quotes:", error);
      return [];
    }

    return data || [];
  }

  async getQuote(id: string): Promise<Quote | undefined> {
    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching quote:", error);
      return undefined;
    }

    return data;
  }

  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const id = randomUUID();
    const quote: Quote = { ...insertQuote, id };

    const { data, error } = await supabase
      .from("quotes")
      .insert(quote)
      .select()
      .single();

    if (error) {
      console.error("Error creating quote:", error);
      throw error;
    }

    return data;
  }

  async updateQuote(id: string, data: UpdateQuote): Promise<Quote | undefined> {
    const updateData: Partial<Quote> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.text !== undefined) updateData.text = data.text;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.timestamp !== undefined) updateData.timestamp = data.timestamp;

    const { data: updatedQuote, error } = await supabase
      .from("quotes")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating quote:", error);
      return undefined;
    }

    return updatedQuote;
  }

  async deleteQuote(id: string): Promise<boolean> {
    const { error } = await supabase
      .from("quotes")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting quote:", error);
      return false;
    }

    return true;
  }
}

export const storage = new SupabaseStorage();
