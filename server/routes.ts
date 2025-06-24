import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertDriverSchema,
  insertVehicleSchema,
  insertTrailerSchema,
  insertShipmentSchema,
  insertInspectionReportSchema,
  insertDocumentSchema,
  insertActivityLogSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Document management endpoints
  app.get("/api/documents", async (req, res) => {
    try {
      const { driverId, fileType } = req.query;
      const documents = await storage.getDocumentFiles(
        driverId ? parseInt(driverId as string) : undefined,
        fileType as string
      );
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.post("/api/documents/upload", async (req, res) => {
    try {
      const { fileName, fileType, driverId, vehicleId, fileData, fileSize, originalName } = req.body;
      
      const document = await storage.createDocumentFile({
        fileName,
        originalName: originalName || fileName,
        fileType,
        driverId: parseInt(driverId),
        vehicleId: vehicleId ? parseInt(vehicleId) : undefined,
        fileSize: parseInt(fileSize),
        filePath: `/uploads/${fileName}`,
        fileData
      });

      res.json(document);
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ error: "Failed to upload document" });
    }
  });

  app.get("/api/documents/:id/download", async (req, res) => {
    try {
      const document = await storage.getDocumentFile(parseInt(req.params.id));
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      if (document.fileData) {
        const buffer = Buffer.from(document.fileData, 'base64');
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
        res.send(buffer);
      } else {
        res.status(404).json({ error: "File data not found" });
      }
    } catch (error) {
      console.error("Error downloading document:", error);
      res.status(500).json({ error: "Failed to download document" });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const success = await storage.deleteDocumentFile(parseInt(req.params.id));
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Document not found" });
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  // Driver routes
  app.get("/api/drivers", async (req, res) => {
    try {
      const drivers = await storage.getAllDrivers();
      res.json(drivers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch drivers" });
    }
  });

  app.get("/api/drivers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const driver = await storage.getDriver(id);
      if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
      }
      res.json(driver);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch driver" });
    }
  });

  app.post("/api/drivers", async (req, res) => {
    try {
      const validatedData = insertDriverSchema.parse(req.body);
      const driver = await storage.createDriver(validatedData);
      res.status(201).json(driver);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create driver" });
    }
  });

  app.patch("/api/drivers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const driver = await storage.updateDriver(id, req.body);
      if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
      }
      res.json(driver);
    } catch (error) {
      res.status(500).json({ message: "Failed to update driver" });
    }
  });

  // Vehicle routes
  app.get("/api/vehicles", async (req, res) => {
    try {
      const vehicles = await storage.getAllVehicles();
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });

  app.get("/api/vehicles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vehicle = await storage.getVehicle(id);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicle" });
    }
  });

  app.post("/api/vehicles", async (req, res) => {
    try {
      const validatedData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(validatedData);
      res.status(201).json(vehicle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create vehicle" });
    }
  });

  // Trailer routes
  app.get("/api/trailers", async (req, res) => {
    try {
      const trailers = await storage.getAllTrailers();
      res.json(trailers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trailers" });
    }
  });

  app.post("/api/trailers", async (req, res) => {
    try {
      const validatedData = insertTrailerSchema.parse(req.body);
      const trailer = await storage.createTrailer(validatedData);
      res.status(201).json(trailer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create trailer" });
    }
  });

  // Shipment routes
  app.get("/api/shipments", async (req, res) => {
    try {
      const driverId = req.query.driverId ? parseInt(req.query.driverId as string) : undefined;
      const shipments = driverId 
        ? await storage.getShipmentsByDriver(driverId)
        : await storage.getAllShipments();
      res.json(shipments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shipments" });
    }
  });

  app.get("/api/shipments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const shipment = await storage.getShipment(id);
      if (!shipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }
      res.json(shipment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shipment" });
    }
  });

  app.post("/api/shipments", async (req, res) => {
    try {
      const validatedData = insertShipmentSchema.parse(req.body);
      const shipment = await storage.createShipment(validatedData);
      res.status(201).json(shipment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create shipment" });
    }
  });

  // Hours of Service routes
  app.get("/api/hos/:driverId", async (req, res) => {
    try {
      const driverId = parseInt(req.params.driverId);
      const hos = await storage.getHoSByDriver(driverId);
      if (!hos) {
        // Create default HoS record if none exists
        const newHos = await storage.updateHoS(driverId, {});
        return res.json(newHos);
      }
      res.json(hos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hours of service" });
    }
  });

  app.patch("/api/hos/:driverId", async (req, res) => {
    try {
      const driverId = parseInt(req.params.driverId);
      const hos = await storage.updateHoS(driverId, req.body);
      res.json(hos);
    } catch (error) {
      res.status(500).json({ message: "Failed to update hours of service" });
    }
  });

  // Inspection routes
  app.get("/api/inspections", async (req, res) => {
    try {
      const driverId = req.query.driverId ? parseInt(req.query.driverId as string) : undefined;
      const inspections = await storage.getInspectionReports(driverId);
      res.json(inspections);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inspections" });
    }
  });

  app.post("/api/inspections", async (req, res) => {
    try {
      const validatedData = insertInspectionReportSchema.parse(req.body);
      const inspection = await storage.createInspectionReport(validatedData);
      res.status(201).json(inspection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create inspection" });
    }
  });

  app.patch("/api/inspections/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const inspection = await storage.updateInspectionReport(id, req.body);
      if (!inspection) {
        return res.status(404).json({ message: "Inspection not found" });
      }
      res.json(inspection);
    } catch (error) {
      res.status(500).json({ message: "Failed to update inspection" });
    }
  });

  // Document routes
  app.get("/api/documents", async (req, res) => {
    try {
      const shipmentId = req.query.shipmentId ? parseInt(req.query.shipmentId as string) : undefined;
      const driverId = req.query.driverId ? parseInt(req.query.driverId as string) : undefined;
      const documents = await storage.getDocuments(shipmentId, driverId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const validatedData = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(validatedData);
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  // Activity log routes
  app.get("/api/activity/:driverId", async (req, res) => {
    try {
      const driverId = parseInt(req.params.driverId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getActivityLogs(driverId, limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });

  app.post("/api/activity", async (req, res) => {
    try {
      const validatedData = insertActivityLogSchema.parse(req.body);
      const activity = await storage.createActivityLog(validatedData);
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create activity log" });
    }
  });

  // Dashboard data route
  app.get("/api/dashboard/:driverId", async (req, res) => {
    try {
      const driverId = parseInt(req.params.driverId);
      
      const [driver, hos, inspections, documents, activities, shipments] = await Promise.all([
        storage.getDriver(driverId),
        storage.getHoSByDriver(driverId),
        storage.getInspectionReports(driverId),
        storage.getDocuments(undefined, driverId),
        storage.getActivityLogs(driverId, 5),
        storage.getShipmentsByDriver(driverId)
      ]);

      if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
      }

      let currentVehicle = null;
      let currentTrailer = null;
      let currentShipment = null;

      if (driver.currentVehicleId) {
        currentVehicle = await storage.getVehicle(driver.currentVehicleId);
      }

      if (driver.currentTrailerId) {
        currentTrailer = await storage.getTrailer(driver.currentTrailerId);
      }

      if (shipments.length > 0) {
        currentShipment = shipments.find(s => s.status === "in_transit") || shipments[0];
      }

      const pendingInspections = inspections.filter(i => i.status === "pending");

      res.json({
        driver,
        currentVehicle,
        currentTrailer,
        currentShipment,
        hos,
        pendingInspections: pendingInspections.length,
        totalDocuments: documents.length,
        recentActivities: activities,
        metrics: {
          onTimeDeliveries: 94,
          fuelEfficiency: 8.7,
          safetyScore: 98,
          hosCompliance: 100
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  return httpServer;
}
