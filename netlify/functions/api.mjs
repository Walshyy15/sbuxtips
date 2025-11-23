// netlify/functions/api.ts
import express, { Router } from "express";
import serverless from "serverless-http";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  users;
  partners;
  distributions;
  userId;
  partnerId;
  distributionId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.partners = /* @__PURE__ */ new Map();
    this.distributions = /* @__PURE__ */ new Map();
    this.userId = 1;
    this.partnerId = 1;
    this.distributionId = 1;
  }
  // User methods
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.userId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  // Partner methods
  async getPartner(id) {
    return this.partners.get(id);
  }
  async getPartners() {
    return Array.from(this.partners.values());
  }
  async createPartner(insertPartner) {
    const id = this.partnerId++;
    const partner = { ...insertPartner, id };
    this.partners.set(id, partner);
    return partner;
  }
  // Distribution methods
  async getDistribution(id) {
    return this.distributions.get(id);
  }
  async getDistributions() {
    return Array.from(this.distributions.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  async createDistribution(insertDistribution) {
    const id = this.distributionId++;
    const distribution = {
      ...insertDistribution,
      id,
      date: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.distributions.set(id, distribution);
    return distribution;
  }
};
var storage = new MemStorage();

// server/routes.ts
import multer from "multer";

// client/src/lib/utils.ts
function calculatePayout(hours, rate) {
  return hours * rate;
}

// client/src/lib/billCalc.ts
function roundAndCalculateBills(amount) {
  return { rounded: Math.round(amount), billBreakdown: {} };
}

// shared/schema.ts
import { z } from "zod";
var partnerHoursSchema = z.array(z.object({
  name: z.string(),
  hours: z.number()
}));

// server/api/ocrSpace.ts
import FormData from "form-data";
import fetch from "node-fetch";
async function ocrSpaceFromImage(buffer, filename) {
  const apiKey = process.env.OCRSPACE_API_KEY;
  if (!apiKey) throw new Error("Missing OCRSPACE_API_KEY env var");
  const form = new FormData();
  form.append("file", buffer, { filename });
  form.append("language", "eng");
  form.append("isTable", "true");
  form.append("OCREngine", "2");
  form.append("apikey", apiKey);
  const response = await fetch("https://api.ocr.space/parse/image", {
    method: "POST",
    body: form,
    headers: form.getHeaders()
  });
  const data = await response.json();
  if (data.IsErroredOnProcessing) {
    const errorMessage = data.ErrorMessage?.[0] || "OCR processing failed";
    throw new Error(`OCR Error: ${errorMessage}`);
  }
  const parsedText = data.ParsedResults?.[0]?.ParsedText ?? "";
  return parsedText;
}

// server/api/parser.ts
function parseTipReportFromText(text) {
  const lines = text.split(/\r?\n/);
  const partners = [];
  const partnerRegex = /([A-Za-z\s]+?)\s+(\d{1,3}\.\d{2})/;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const match = trimmed.match(partnerRegex);
    if (match) {
      const name = match[1].trim();
      const hours = parseFloat(match[2]);
      if (name.toLowerCase().includes("total") || name.toLowerCase().includes("partner")) continue;
      if (name && !isNaN(hours)) {
        partners.push({ name, hours });
      }
    }
  }
  const totalHours = partners.reduce((sum, p) => sum + p.hours, 0);
  return { partners, totalHours };
}

// server/routes.ts
var upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB limit
  }
});
async function registerRoutes(app2, skipServer = false) {
  app2.post("/api/parseTipReport", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }
      const rawText = await ocrSpaceFromImage(req.file.buffer, req.file.originalname);
      const report = parseTipReportFromText(rawText);
      res.json({ report, rawText });
    } catch (error) {
      console.error("OCR.space processing error:", error);
      res.status(500).json({
        error: error.message || "Failed to process the image with OCR.space"
      });
    }
  });
  app2.post("/api/distributions/calculate", async (req, res) => {
    try {
      const { partnerHours, totalAmount, totalHours, hourlyRate } = req.body;
      try {
        partnerHoursSchema.parse(partnerHours);
      } catch (error) {
        return res.status(400).json({ error: "Invalid partner hours data" });
      }
      const partnerPayouts = partnerHours.map((partner) => {
        const payout = calculatePayout(partner.hours, hourlyRate);
        const { rounded, billBreakdown } = roundAndCalculateBills(payout);
        return {
          name: partner.name,
          hours: partner.hours,
          payout,
          rounded,
          billBreakdown
        };
      });
      const distributionData = {
        totalAmount,
        totalHours,
        hourlyRate,
        partnerPayouts
      };
      res.json(distributionData);
    } catch (error) {
      console.error("Distribution calculation error:", error);
      res.status(500).json({ error: "Failed to calculate distribution" });
    }
  });
  app2.post("/api/distributions", async (req, res) => {
    try {
      const { totalAmount, totalHours, hourlyRate, partnerData } = req.body;
      const distribution = await storage.createDistribution({
        totalAmount,
        totalHours,
        hourlyRate,
        partnerData
      });
      res.status(201).json(distribution);
    } catch (error) {
      console.error("Save distribution error:", error);
      res.status(500).json({ error: "Failed to save distribution" });
    }
  });
  app2.get("/api/distributions", async (req, res) => {
    try {
      const distributions = await storage.getDistributions();
      res.json(distributions);
    } catch (error) {
      console.error("Get distributions error:", error);
      res.status(500).json({ error: "Failed to retrieve distributions" });
    }
  });
  app2.post("/api/partners", async (req, res) => {
    try {
      const { name } = req.body;
      if (!name || typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({ error: "Partner name is required" });
      }
      const partner = await storage.createPartner({ name: name.trim() });
      res.status(201).json(partner);
    } catch (error) {
      console.error("Create partner error:", error);
      res.status(500).json({ error: "Failed to create partner" });
    }
  });
  app2.get("/api/partners", async (req, res) => {
    try {
      const partners = await storage.getPartners();
      res.json(partners);
    } catch (error) {
      console.error("Get partners error:", error);
      res.status(500).json({ error: "Failed to retrieve partners" });
    }
  });
  if (skipServer) {
    return null;
  }
  const httpServer = createServer(app2);
  return httpServer;
}

// netlify/functions/api.ts
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
var router = Router();
var handlerPromise;
async function init() {
  await registerRoutes(router, true);
  app.use("/.netlify/functions", router);
  return serverless(app);
}
var handler = async (event, context) => {
  if (!handlerPromise) {
    handlerPromise = init();
  }
  const handler2 = await handlerPromise;
  return handler2(event, context);
};
export {
  handler
};
