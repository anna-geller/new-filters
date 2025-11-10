import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Execution State Synonyms routes
  app.get("/api/tenants/:tenantId/execution-states", async (req, res) => {
    try {
      const { tenantId } = req.params;
      const synonyms = await storage.getExecutionStateSynonyms(tenantId);
      res.json(synonyms);
    } catch (error) {
      console.error("Error fetching execution state synonyms:", error);
      res.status(500).json({ error: "Failed to fetch execution state synonyms" });
    }
  });

  app.post("/api/tenants/:tenantId/execution-states", async (req, res) => {
    try {
      const { tenantId } = req.params;
      const { defaultState, synonym } = req.body;

      if (!defaultState || !synonym) {
        return res.status(400).json({ error: "defaultState and synonym are required" });
      }

      const newSynonym = await storage.createExecutionStateSynonym(tenantId, defaultState, synonym);
      res.status(201).json(newSynonym);
    } catch (error) {
      console.error("Error creating execution state synonym:", error);
      if (error instanceof Error && error.message.includes("already exists")) {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to create execution state synonym" });
    }
  });

  app.delete("/api/tenants/:tenantId/execution-states/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteExecutionStateSynonym(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting execution state synonym:", error);
      res.status(500).json({ error: "Failed to delete execution state synonym" });
    }
  });

  // Flow Canvas routes
  app.get("/api/flows/:namespace/:flowId/canvas", async (req, res) => {
    try {
      const { namespace, flowId } = req.params;
      const canvasData = await storage.getFlowCanvas(namespace, flowId);
      
      if (!canvasData) {
        return res.status(404).json({ error: "Canvas data not found" });
      }
      
      res.json(canvasData);
    } catch (error) {
      console.error("Error fetching flow canvas:", error);
      res.status(500).json({ error: "Failed to fetch flow canvas" });
    }
  });

  app.post("/api/flows/:namespace/:flowId/canvas", async (req, res) => {
    try {
      const { namespace, flowId } = req.params;
      const canvasData = req.body;

      if (!canvasData) {
        return res.status(400).json({ error: "Canvas data is required" });
      }

      await storage.saveFlowCanvas(namespace, flowId, canvasData);
      res.status(200).json({ message: "Canvas saved successfully" });
    } catch (error) {
      console.error("Error saving flow canvas:", error);
      res.status(500).json({ error: "Failed to save flow canvas" });
    }
  });

  app.delete("/api/flows/:namespace/:flowId/canvas", async (req, res) => {
    try {
      const { namespace, flowId } = req.params;
      await storage.deleteFlowCanvas(namespace, flowId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting flow canvas:", error);
      res.status(500).json({ error: "Failed to delete flow canvas" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
