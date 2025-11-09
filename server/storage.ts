import { type User, type InsertUser, type ExecutionStateSynonym, type InsertExecutionStateSynonym } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getExecutionStateSynonyms(tenantId: string): Promise<ExecutionStateSynonym[]>;
  createExecutionStateSynonym(tenantId: string, defaultState: string, synonym: string): Promise<ExecutionStateSynonym>;
  deleteExecutionStateSynonym(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private executionStateSynonyms: Map<string, ExecutionStateSynonym>;

  constructor() {
    this.users = new Map();
    this.executionStateSynonyms = new Map();
    this.seedExecutionStateSynonyms();
  }

  private seedExecutionStateSynonyms() {
    // Demo tenant - Loan Origination scenario
    const demoSynonyms = [
      { tenantId: "demo", defaultState: "CREATED", synonym: "APPLICATION_SUBMITTED" },
      { tenantId: "demo", defaultState: "RUNNING", synonym: "UNDER_REVIEW" },
      { tenantId: "demo", defaultState: "RUNNING", synonym: "CREDIT_CHECK_IN_PROGRESS" },
      { tenantId: "demo", defaultState: "PAUSED", synonym: "PENDING_APPROVAL" },
      { tenantId: "demo", defaultState: "SUCCESS", synonym: "APPROVED" },
      { tenantId: "demo", defaultState: "KILLED", synonym: "REJECTED" },
      { tenantId: "demo", defaultState: "CANCELLED", synonym: "WITHDRAWN_BY_APPLICANT" },
    ];

    // Stage tenant - Trading/Order Management scenario
    const stageSynonyms = [
      { tenantId: "stage", defaultState: "CREATED", synonym: "TRADE_SUBMITTED" },
      { tenantId: "stage", defaultState: "QUEUED", synonym: "AWAITING_MARKET_OPEN" },
      { tenantId: "stage", defaultState: "RUNNING", synonym: "ORDER_EXECUTING" },
      { tenantId: "stage", defaultState: "SUCCESS", synonym: "TRADE_EXECUTED" },
      { tenantId: "stage", defaultState: "CANCELLED", synonym: "CANCELLED_BY_TRADER" },
      { tenantId: "stage", defaultState: "KILLED", synonym: "SETTLEMENT_PROCESSING" },
    ];

    // Seed all synonyms
    [...demoSynonyms, ...stageSynonyms].forEach((data) => {
      const id = randomUUID();
      const synonym: ExecutionStateSynonym = {
        id,
        tenantId: data.tenantId,
        defaultState: data.defaultState,
        synonym: data.synonym,
        createdAt: new Date(),
      };
      this.executionStateSynonyms.set(id, synonym);
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

  async getExecutionStateSynonyms(tenantId: string): Promise<ExecutionStateSynonym[]> {
    return Array.from(this.executionStateSynonyms.values()).filter(
      (synonym) => synonym.tenantId === tenantId,
    );
  }

  async createExecutionStateSynonym(tenantId: string, defaultState: string, synonym: string): Promise<ExecutionStateSynonym> {
    // Check for duplicate synonym globally
    const existingSynonym = Array.from(this.executionStateSynonyms.values()).find(
      (s) => s.synonym.toLowerCase() === synonym.toLowerCase(),
    );
    if (existingSynonym) {
      throw new Error(`Synonym "${synonym}" already exists`);
    }

    const id = randomUUID();
    const newSynonym: ExecutionStateSynonym = {
      id,
      tenantId,
      defaultState,
      synonym,
      createdAt: new Date(),
    };
    this.executionStateSynonyms.set(id, newSynonym);
    return newSynonym;
  }

  async deleteExecutionStateSynonym(id: string): Promise<void> {
    this.executionStateSynonyms.delete(id);
  }
}

export const storage = new MemStorage();
