import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
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

export const executionStatesSynonyms = pgTable("execution_states_synonyms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: text("tenant_id").notNull(),
  defaultState: text("default_state").notNull(),
  synonym: text("synonym").notNull().unique(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertExecutionStateSynonymSchema = createInsertSchema(executionStatesSynonyms).pick({
  tenantId: true,
  defaultState: true,
  synonym: true,
});

export type InsertExecutionStateSynonym = z.infer<typeof insertExecutionStateSynonymSchema>;
export type ExecutionStateSynonym = typeof executionStatesSynonyms.$inferSelect;
