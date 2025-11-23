import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";

import { partnerHoursSchema } from "@shared/schema";
import { ocrSpaceFromImage } from "./api/ocrSpace";
import { parseTipReportFromText } from "./api/parser";

// Setup file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export async function registerRoutes(app: Express, skipServer = false): Promise<Server | null> {
  // API routes



  // Parse Tip Report from Image using OCR.space
  app.post("/api/parseTipReport", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      // Call OCR.space helper
      const rawText = await ocrSpaceFromImage(req.file.buffer, req.file.originalname);

      // Parse the text
      const report = parseTipReportFromText(rawText);

      res.json({ report, rawText });
    } catch (error: any) {
      console.error("OCR.space processing error:", error);
      res.status(500).json({
        error: error.message || "Failed to process the image with OCR.space",
      });
    }
  });

  // Calculate and save tip distribution
  app.post("/api/distributions", async (req, res) => {
    try {
      const {
        partners: partnerHours,
        totalTips,
        reportDate,
        hasUnevenBills,
        billOnes,
        billFives,
        billTens,
        billTwenties,
        reportText
      } = req.body;

      if (!partnerHours || !Array.isArray(partnerHours) || partnerHours.length === 0) {
        return res.status(400).json({ error: "Partner hours are required" });
      }

      if (!totalTips || totalTips <= 0) {
        return res.status(400).json({ error: "Total tips amount is required" });
      }

      const totalHours = partnerHours.reduce((sum, p) => sum + p.hours, 0);
      const hourlyRate = totalTips / totalHours;

      const distribution = await storage.createTipDistribution({
        report_date: reportDate || new Date().toISOString().split('T')[0],
        total_tips: totalTips,
        total_hours: totalHours,
        has_uneven_bills: hasUnevenBills || false,
        bill_ones: billOnes || 0,
        bill_fives: billFives || 0,
        bill_tens: billTens || 0,
        bill_twenties: billTwenties || 0,
        report_text: reportText || ''
      });

      const payouts = partnerHours.map(partner => {
        const tipAmount = partner.hours * hourlyRate;
        return {
          distribution_id: distribution.id,
          partner_name: partner.name,
          tippable_hours: partner.hours,
          tip_amount: tipAmount
        };
      });

      const createdPayouts = await storage.createBulkPartnerPayouts(payouts);

      res.status(201).json({
        distribution,
        payouts: createdPayouts,
        hourlyRate
      });
    } catch (error) {
      console.error("Distribution creation error:", error);
      res.status(500).json({ error: "Failed to create distribution" });
    }
  });

  // Get distribution history with payouts
  app.get("/api/distributions", async (req, res) => {
    try {
      const distributions = await storage.getTipDistributions();

      const distributionsWithPayouts = await Promise.all(
        distributions.map(async (dist) => {
          const payouts = await storage.getPartnerPayouts(dist.id);
          return { ...dist, payouts };
        })
      );

      res.json(distributionsWithPayouts);
    } catch (error) {
      console.error("Get distributions error:", error);
      res.status(500).json({ error: "Failed to retrieve distributions" });
    }
  });

  // Get single distribution with payouts
  app.get("/api/distributions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const distribution = await storage.getTipDistribution(id);

      if (!distribution) {
        return res.status(404).json({ error: "Distribution not found" });
      }

      const payouts = await storage.getPartnerPayouts(id);
      res.json({ ...distribution, payouts });
    } catch (error) {
      console.error("Get distribution error:", error);
      res.status(500).json({ error: "Failed to retrieve distribution" });
    }
  });

  // Partners endpoints
  app.post("/api/partners", async (req, res) => {
    try {
      const { name } = req.body;

      if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: "Partner name is required" });
      }

      const partner = await storage.createPartner({ name: name.trim() });
      res.status(201).json(partner);
    } catch (error) {
      console.error("Create partner error:", error);
      res.status(500).json({ error: "Failed to create partner" });
    }
  });

  app.get("/api/partners", async (req, res) => {
    try {
      const partners = await storage.getPartners();
      res.json(partners);
    } catch (error) {
      console.error("Get partners error:", error);
      res.status(500).json({ error: "Failed to retrieve partners" });
    }
  });

  // Skip HTTP server creation for serverless functions
  if (skipServer) {
    return null;
  }

  const httpServer = createServer(app);
  return httpServer;
}
