import type { Express, Request, Response, NextFunction } from "express";
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
  insertRouteSchema,
  loginSchema,
  registerSchema,
} from "@shared/schema";

// Middleware to check if user is authenticated
const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  const user = await storage.getUserById(req.session.userId);
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }
  
  (req as any).user = user;
  next();
};

// Middleware to check if user is admin
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Auth endpoints
  app.post('/api/auth/login', async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const user = await storage.authenticateUser(validatedData.username, validatedData.password);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      res.json({ user, message: "Login successful" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getDriverByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.registerUser(validatedData);
      req.session.userId = user.id;
      res.status(201).json({ user, message: "Registration successful" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.get('/api/auth/user', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.post('/api/auth/logout', async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error("Logout error:", err);
          return res.status(500).json({ message: "Failed to logout" });
        }
        res.json({ message: "Logout successful" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Failed to logout" });
    }
  });

  // Document management endpoints
  app.get("/api/documents", requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const { driverId, fileType } = req.query;
      
      let targetDriverId: number | undefined;
      
      if (user.role === 'admin') {
        // Admin can see all documents or filter by driverId
        targetDriverId = driverId ? parseInt(driverId as string) : undefined;
      } else {
        // Drivers can only see their own documents
        targetDriverId = user.id;
      }
      
      const documents = await storage.getDocumentFiles(targetDriverId, fileType as string);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.post("/api/documents/upload", requireAuth, async (req, res) => {
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

  app.get("/api/documents/:id/download", requireAuth, async (req, res) => {
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

  app.delete("/api/documents/:id", requireAuth, async (req, res) => {
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
  app.get("/api/drivers", requireAuth, requireAdmin, async (req, res) => {
    try {
      const drivers = await storage.getAllDrivers();
      res.json(drivers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch drivers" });
    }
  });

  app.get("/api/drivers/:id", requireAuth, async (req, res) => {
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

  app.post("/api/drivers", requireAuth, requireAdmin, async (req, res) => {
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

  app.patch("/api/drivers/:id", requireAuth, async (req, res) => {
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
  app.get("/api/vehicles", requireAuth, async (req, res) => {
    try {
      const vehicles = await storage.getAllVehicles();
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });

  app.get("/api/vehicles/:id", requireAuth, async (req, res) => {
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

  app.post("/api/vehicles", requireAuth, requireAdmin, async (req, res) => {
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
  app.get("/api/trailers", requireAuth, async (req, res) => {
    try {
      const trailers = await storage.getAllTrailers();
      res.json(trailers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trailers" });
    }
  });

  app.get("/api/trailers/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const trailer = await storage.getTrailer(id);
      if (!trailer) {
        return res.status(404).json({ message: "Trailer not found" });
      }
      res.json(trailer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trailer" });
    }
  });

  app.post("/api/trailers", requireAuth, requireAdmin, async (req, res) => {
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
  app.get("/api/shipments", requireAuth, async (req, res) => {
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

  app.get("/api/shipments/:id", requireAuth, async (req, res) => {
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

  app.post("/api/shipments", requireAuth, requireAdmin, async (req, res) => {
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
  app.get("/api/hos/:driverId", requireAuth, async (req, res) => {
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

  app.patch("/api/hos/:driverId", requireAuth, async (req, res) => {
    try {
      const driverId = parseInt(req.params.driverId);
      const hos = await storage.updateHoS(driverId, req.body);
      res.json(hos);
    } catch (error) {
      res.status(500).json({ message: "Failed to update hours of service" });
    }
  });

  // Expense reports routes
  app.post("/api/expense-reports", requireAuth, async (req, res) => {
    try {
      const expenseReport = req.body;
      // Store expense report in storage
      const savedReport = await storage.createExpenseReport(expenseReport);
      res.status(201).json(savedReport);
    } catch (error) {
      res.status(500).json({ message: "Failed to create expense report" });
    }
  });

  app.get("/api/expense-reports", requireAuth, async (req, res) => {
    try {
      const driverId = req.query.driverId ? parseInt(req.query.driverId as string) : undefined;
      const reports = await storage.getExpenseReports(driverId);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expense reports" });
    }
  });

  // Inspection routes
  app.get("/api/inspections", requireAuth, async (req, res) => {
    try {
      const driverId = req.query.driverId ? parseInt(req.query.driverId as string) : undefined;
      const inspections = await storage.getInspectionReports(driverId);
      res.json(inspections);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inspections" });
    }
  });

  app.post("/api/inspections", requireAuth, async (req, res) => {
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

  app.patch("/api/inspections/:id", requireAuth, async (req, res) => {
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
  app.get("/api/dashboard/:driverId", requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const driverId = parseInt(req.params.driverId);
      
      console.log("Dashboard request - user:", user.id, "role:", user.role, "requesting driverId:", driverId);
      
      // Non-admin users can only access their own dashboard
      if (user.role !== 'admin' && user.id !== driverId) {
        console.log("Access denied - user trying to access different driver data");
        return res.status(403).json({ message: "Access denied" });
      }

      // If requesting user is admin, provide minimal dashboard data
      if (user.role === 'admin') {
        console.log("Providing admin dashboard data");
        return res.json({
          currentVehicle: null,
          currentTrailer: null,
          currentShipment: null,
          hos: null,
          pendingInspections: 0,
          totalDocuments: 0,
          recentActivities: [],
          metrics: {
            onTimeDeliveries: 100,
            fuelEfficiency: 0,
            safetyScore: 100,
            hosCompliance: 100
          }
        });
      }

      // For regular drivers, get the driver data and full data
      const driver = await storage.getDriver(driverId);
      if (!driver) {
        console.log("Driver not found:", driverId);
        return res.status(404).json({ message: "Driver not found" });
      }

      console.log("Getting full driver dashboard data");
      const [hos, inspections, documents, activities, shipments] = await Promise.all([
        storage.getHoSByDriver(driverId),
        storage.getInspectionReports(driverId),
        storage.getDocuments(undefined, driverId),
        storage.getActivityLogs(driverId, 5),
        storage.getShipmentsByDriver(driverId)
      ]);

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

      const dashboardData = {
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
      };

      console.log("Sending dashboard data:", dashboardData);
      res.json(dashboardData);
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Routes endpoints
  app.get("/api/routes", requireAuth, async (req, res) => {
    try {
      const driverId = req.query.driverId ? parseInt(req.query.driverId as string) : undefined;
      const routes = await storage.getRoutes(driverId);
      res.json(routes);
    } catch (error) {
      console.error("Error fetching routes:", error);
      res.status(500).json({ error: "Failed to fetch routes" });
    }
  });

  app.post("/api/routes", requireAuth, async (req, res) => {
    try {
      const validatedData = insertRouteSchema.parse(req.body);
      const route = await storage.createRoute(validatedData);
      res.json(route);
    } catch (error) {
      console.error("Error creating route:", error);
      res.status(500).json({ error: "Failed to create route" });
    }
  });

  app.get("/api/routes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const route = await storage.getRoute(id);
      if (!route) {
        return res.status(404).json({ error: "Route not found" });
      }
      res.json(route);
    } catch (error) {
      console.error("Error fetching route:", error);
      res.status(500).json({ error: "Failed to fetch route" });
    }
  });

  app.put("/api/routes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const route = await storage.updateRoute(id, updates);
      if (!route) {
        return res.status(404).json({ error: "Route not found" });
      }
      res.json(route);
    } catch (error) {
      console.error("Error updating route:", error);
      res.status(500).json({ error: "Failed to update route" });
    }
  });

  app.patch("/api/routes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const route = await storage.updateRoute(id, updates);
      if (!route) {
        return res.status(404).json({ error: "Route not found" });
      }
      res.json(route);
    } catch (error) {
      console.error("Error updating route:", error);
      res.status(500).json({ error: "Failed to update route" });
    }
  });

  app.delete("/api/routes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteRoute(id);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Route not found" });
      }
    } catch (error) {
      console.error("Error deleting route:", error);
      res.status(500).json({ error: "Failed to delete route" });
    }
  });

  return httpServer;
}