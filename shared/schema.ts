import { sql } from "drizzle-orm";
import { pgTable, text, varchar, bigint } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const quoteTypeEnum = z.enum(["Teacher", "Student", "None"]);
export type QuoteType = z.infer<typeof quoteTypeEnum>;

export const quotes = pgTable("quotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  text: text("text").notNull(),
  type: text("type").notNull(),
  timestamp: bigint("timestamp", { mode: "number" }).notNull(),
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
}).extend({
  type: quoteTypeEnum.default("None"),
});

export const updateQuoteSchema = z.object({
  name: z.string().min(1).optional(),
  text: z.string().min(1).optional(),
  type: quoteTypeEnum.optional(),
});

export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type UpdateQuote = z.infer<typeof updateQuoteSchema>;
export type Quote = typeof quotes.$inferSelect;
