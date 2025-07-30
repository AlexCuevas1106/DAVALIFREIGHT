import { db } from "./db";
import {
  drivers,
  vehicles,
  trailers,
  shipments,
  hoursOfService,
  inspectionReports,
  documents,
  activityLogs,
  documentFiles,
  routes,
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import bcrypt from "bcrypt";
import type { InsertDriver, InsertVehicle, InsertTrailer, InsertShipment, InsertInspectionReport, InsertDocument, InsertActivityLog, InsertDocumentFile, InsertRoute, RegisterRequest } from "@shared/schema";
import type {
  Driver,
  Vehicle,
  Trailer,
  Shipment,
  HoursOfService,
  InspectionReport,
  Document,
  ActivityLog,
  DocumentFile,
  Route,
} from "@shared/schema";

export interface IStorage {
  // Driver operations
  getDriver(id: number): Promise<Driver | undefined>;
  getDriverByUsername(username: string): Promise<Driver | undefined>;
  getAllDrivers(): Promise<Driver[]>;
  createDriver(driver: InsertDriver): Promise<Driver>;
  updateDriver(id: number, updates: Partial<Driver>): Promise<Driver | undefined>;

  // Vehicle operations
  getVehicle(id: number): Promise<Vehicle | undefined>;
  getAllVehicles(): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, updates: Partial<Vehicle>): Promise<Vehicle | undefined>;

  // Trailer operations
  getTrailer(id: number): Promise<Trailer | undefined>;
  getAllTrailers(): Promise<Trailer[]>;
  createTrailer(trailer: InsertTrailer): Promise<Trailer>;

  // Shipment operations
  getShipment(id: number): Promise<Shipment | undefined>;
  getShipmentByShippingId(shippingId: string): Promise<Shipment | undefined>;
  getAllShipments(): Promise<Shipment[]>;
  getShipmentsByDriver(driverId: number): Promise<Shipment[]>;
  createShipment(shipment: InsertShipment): Promise<Shipment>;
  updateShipment(id: number, updates: Partial<Shipment>): Promise<Shipment | undefined>;

  // Hours of Service operations
  getHoSByDriver(driverId: number): Promise<HoursOfService | undefined>;
  updateHoS(driverId: number, hos: Partial<HoursOfService>): Promise<HoursOfService>;

  // Inspection operations
  getInspectionReports(driverId?: number): Promise<InspectionReport[]>;
  createInspectionReport(report: InsertInspectionReport): Promise<InspectionReport>;
  updateInspectionReport(id: number, updates: Partial<InspectionReport>): Promise<InspectionReport | undefined>;

  // Document operations
  getDocuments(shipmentId?: number, driverId?: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;

  // Activity log operations
  getActivityLogs(driverId: number, limit?: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;

  // Document file operations
  getDocumentFiles(driverId?: number, fileType?: string): Promise<DocumentFile[]>;
  createDocumentFile(document: InsertDocumentFile): Promise<DocumentFile>;
  getDocumentFile(id: number): Promise<DocumentFile | undefined>;
  deleteDocumentFile(id: number): Promise<boolean>;

  // Route operations
  getRoutes(driverId?: number): Promise<Route[]>;
  createRoute(route: InsertRoute): Promise<Route>;
  getRoute(id: number): Promise<Route | undefined>;
  updateRoute(id: number, updates: Partial<Route>): Promise<Route | undefined>;
  deleteRoute(id: number): Promise<boolean>;

  // Expense Report operations
  createExpenseReport(reportData: any): Promise<any>;
  getExpenseReports(driverId?: number): Promise<any[]>;

  // Authentication methods
  authenticateUser(username: string, password: string): Promise<Driver | null>;
  registerUser(userData: RegisterRequest): Promise<Driver>;
  getUserById(id: number): Promise<Driver | undefined>;
}



export class DatabaseStorage implements IStorage {
  async getDriver(id: number): Promise<Driver | undefined> {
    const [driver] = await db.select().from(drivers).where(eq(drivers.id, id));
    return driver || undefined;
  }

  async getDriverByUsername(username: string): Promise<Driver | undefined> {
    const [driver] = await db.select().from(drivers).where(eq(drivers.username, username));
    return driver || undefined;
  }

  async getAllDrivers(): Promise<Driver[]> {
    return await db.select().from(drivers).where(eq(drivers.isActive, true));
  }

  async createDriver(insertDriver: InsertDriver): Promise<Driver> {
    const [driver] = await db
      .insert(drivers)
      .values(insertDriver)
      .returning();
    return driver;
  }

  async getVehicles(): Promise<Vehicle[]> {
    return await db.select().from(vehicles);
  }

  async getTrailers(): Promise<Trailer[]> {
    return await db.select().from(trailers);
  }

  async updateDriver(id: number, updates: Partial<Driver>): Promise<Driver | undefined> {
    const [driver] = await db
      .update(drivers)
      .set(updates)
      .where(eq(drivers.id, id))
      .returning();
    return driver || undefined;
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle || undefined;
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    return await db.select().from(vehicles).where(eq(vehicles.isActive, true));
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const [vehicle] = await db
      .insert(vehicles)
      .values(insertVehicle)
      .returning();
    return vehicle;
  }

  async updateVehicle(id: number, updates: Partial<Vehicle>): Promise<Vehicle | undefined> {
    const [vehicle] = await db
      .update(vehicles)
      .set(updates)
      .where(eq(vehicles.id, id))
      .returning();
    return vehicle || undefined;
  }

  async getTrailer(id: number): Promise<Trailer | undefined> {
    const [trailer] = await db.select().from(trailers).where(eq(trailers.id, id));
    return trailer || undefined;
  }

  async getAllTrailers(): Promise<Trailer[]> {
    return await db.select().from(trailers).where(eq(trailers.isActive, true));
  }

  async createTrailer(insertTrailer: InsertTrailer): Promise<Trailer> {
    const [trailer] = await db
      .insert(trailers)
      .values(insertTrailer)
      .returning();
    return trailer;
  }

  async getShipment(id: number): Promise<Shipment | undefined> {
    const [shipment] = await db.select().from(shipments).where(eq(shipments.id, id));
    return shipment || undefined;
  }

  async getShipmentByShippingId(shippingId: string): Promise<Shipment | undefined> {
    const [shipment] = await db.select().from(shipments).where(eq(shipments.shippingId, shippingId));
    return shipment || undefined;
  }

  async getAllShipments(): Promise<Shipment[]> {
    return await db.select().from(shipments).where(eq(shipments.isActive, true));
  }

  async getShipmentsByDriver(driverId: number): Promise<Shipment[]> {
    return await db.select().from(shipments)
      .where(eq(shipments.assignedDriverId, driverId));
  }

  async createShipment(insertShipment: InsertShipment): Promise<Shipment> {
    const [shipment] = await db
      .insert(shipments)
      .values(insertShipment)
      .returning();
    return shipment;
  }

  async updateShipment(id: number, updates: Partial<Shipment>): Promise<Shipment | undefined> {
    const [shipment] = await db
      .update(shipments)
      .set(updates)
      .where(eq(shipments.id, id))
      .returning();
    return shipment || undefined;
  }

  async getHoSByDriver(driverId: number): Promise<HoursOfService | undefined> {
    const [hos] = await db.select().from(hoursOfService).where(eq(hoursOfService.driverId, driverId));
    return hos || undefined;
  }

  async updateHoS(driverId: number, hosUpdates: Partial<HoursOfService>): Promise<HoursOfService> {
    const existing = await this.getHoSByDriver(driverId);

    if (existing) {
      const [hos] = await db
        .update(hoursOfService)
        .set(hosUpdates)
        .where(eq(hoursOfService.driverId, driverId))
        .returning();
      return hos;
    } else {
      const [hos] = await db
        .insert(hoursOfService)
        .values({
          driverId,
          drivingHours: 0,
          onDutyHours: 0,
          remainingDriveTime: 11,
          remainingDutyTime: 14,
          isCompliant: true,
          ...hosUpdates,
        })
        .returning();
      return hos;
    }
  }

  async getInspectionReports(driverId?: number): Promise<InspectionReport[]> {
    const inspections = await db.select().from(inspectionReports)
      .where(driverId ? eq(inspectionReports.driverId, driverId) : undefined)
      .orderBy(desc(inspectionReports.createdAt));

    return inspections;
  }

  async createExpenseReport(reportData: any): Promise<any> {
    const report = {
      id: Date.now(),
      driverId: reportData.driverId || 1,
      tripRecord: JSON.stringify(reportData.tripRecord),
      fuelEntries: JSON.stringify(reportData.fuelEntries),
      miscEntries: JSON.stringify(reportData.miscEntries),
      mileageEntries: JSON.stringify(reportData.mileageEntries),
      createdAt: new Date().toISOString(),
    };

    // Store in documents table as a PDF report
    const document = await this.createDocument({
      name: `expense-report-${report.id}.json`,
      type: 'expense_report',
      driverId: report.driverId
    });

    return { ...report, documentId: document.id };
  }

  async getExpenseReports(driverId?: number): Promise<any[]> {
    const docs = await this.getDocuments(undefined, driverId);
    const expenseReports = docs.filter(doc => doc.type === 'expense_report');

    return expenseReports.map(doc => ({
      id: doc.id,
      name: doc.name,
      type: doc.type,
      driverId: doc.driverId,
      uploadedAt: doc.uploadedAt
    }));
  }

  async createInspectionReport(insertReport: InsertInspectionReport): Promise<InspectionReport> {
    const [report] = await db
      .insert(inspectionReports)
      .values(insertReport)
      .returning();
    return report;
  }

  async updateInspectionReport(id: number, updates: Partial<InspectionReport>): Promise<InspectionReport | undefined> {
    const [report] = await db
      .update(inspectionReports)
      .set(updates)
      .where(eq(inspectionReports.id, id))
      .returning();
    return report || undefined;
  }

  async getDocuments(shipmentId?: number, driverId?: number): Promise<Document[]> {
    if (shipmentId && driverId) {
      return await db.select().from(documents)
        .where(and(eq(documents.shipmentId, shipmentId), eq(documents.driverId, driverId), eq(documents.isActive, true)));
    } else if (shipmentId) {
      return await db.select().from(documents)
        .where(and(eq(documents.shipmentId, shipmentId), eq(documents.isActive, true)));
    } else if (driverId) {
      return await db.select().from(documents)
        .where(and(eq(documents.driverId, driverId), eq(documents.isActive, true)));
    }

    return await db.select().from(documents).where(eq(documents.isActive, true));
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db
      .insert(documents)
      .values(insertDocument)
      .returning();
    return document;
  }

  async getActivityLogs(driverId: number, limit = 10): Promise<ActivityLog[]> {
    return await db.select().from(activityLogs)
      .where(eq(activityLogs.driverId, driverId))
      .orderBy(desc(activityLogs.timestamp))
      .limit(limit);
  }

  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const [log] = await db
      .insert(activityLogs)
      .values(insertLog)
      .returning();
    return log;
  }

  // Document file operations
  async getDocumentFiles(driverId?: number, fileType?: string): Promise<DocumentFile[]> {
    if (driverId && fileType) {
      return await db.select().from(documentFiles)
        .where(and(eq(documentFiles.driverId, driverId), eq(documentFiles.fileType, fileType as any)));
    } else if (driverId) {
      return await db.select().from(documentFiles)
        .where(eq(documentFiles.driverId, driverId));
    } else if (fileType) {
      return await db.select().from(documentFiles)
        .where(eq(documentFiles.fileType, fileType as any));
    }
    
    return await db.select().from(documentFiles);
  }

  async createDocumentFile(insertDocumentFile: InsertDocumentFile): Promise<DocumentFile> {
    const [documentFile] = await db
      .insert(documentFiles)
      .values(insertDocumentFile)
      .returning();
    return documentFile;
  }

  async getDocumentFile(id: number): Promise<DocumentFile | undefined> {
    const [documentFile] = await db.select().from(documentFiles).where(eq(documentFiles.id, id));
    return documentFile || undefined;
  }

  async deleteDocumentFile(id: number): Promise<boolean> {
    const result = await db.delete(documentFiles).where(eq(documentFiles.id, id));
    return result.count > 0;
  }

  // Route operations
  async getRoutes(driverId?: number): Promise<Route[]> {
    if (driverId) {
      return await db.select().from(routes).where(eq(routes.driverId, driverId));
    }
    return await db.select().from(routes);
  }

  async createRoute(insertRoute: InsertRoute): Promise<Route> {
    const [route] = await db
      .insert(routes)
      .values(insertRoute)
      .returning();
    return route;
  }

  async getRoute(id: number): Promise<Route | undefined> {
    const [route] = await db.select().from(routes).where(eq(routes.id, id));
    return route || undefined;
  }

  async updateRoute(id: number, updates: Partial<Route>): Promise<Route | undefined> {
    const [route] = await db
      .update(routes)
      .set(updates)
      .where(eq(routes.id, id))
      .returning();
    return route || undefined;
  }

  async deleteRoute(id: number): Promise<boolean> {
    const result = await db.delete(routes).where(eq(routes.id, id));
    return result.count > 0;
  }

  // Authentication methods
  async authenticateUser(username: string, password: string): Promise<Driver | null> {
    const [user] = await db.select().from(drivers).where(eq(drivers.username, username));

    if (!user) {
      return null;
    }

    // Compare hashed password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (isValidPassword) {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword as Driver;
    }

    return null;
  }

  async registerUser(userData: RegisterRequest): Promise<Driver> {
    // Hash the password before storing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    const [user] = await db
      .insert(drivers)
      .values({
        ...userData,
        password: hashedPassword,
      })
      .returning();

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as Driver;
  }

  async getUserById(id: number): Promise<Driver | undefined> {
    const [user] = await db.select().from(drivers).where(eq(drivers.id, id));
    if (!user) return undefined;

    // Don't return password in the result
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as Driver;
  }
}

// Temporarily use MemStorage while database connection is being resolved
export class MemStorage implements IStorage {
  protected drivers: Map<number, Driver> = new Map();
  protected vehicles: Map<number, Vehicle> = new Map();
  protected trailers: Map<number, Trailer> = new Map();
  protected shipments: Map<number, Shipment> = new Map();
  protected hoursOfService: Map<number, HoursOfService> = new Map();
  protected inspectionReports: Map<number, InspectionReport> = new Map();
  protected documents: Map<number, Document> = new Map();
  protected activityLogs: Map<number, ActivityLog> = new Map();
  protected documentFiles: Map<number, DocumentFile> = new Map();
  protected routes: Map<number, Route> = new Map();

  protected currentDriverId = 1;
  protected currentVehicleId = 1;
  protected currentTrailerId = 1;
  protected currentShipmentId = 1;
  protected currentHoSId = 1;
  protected currentInspectionId = 1;
  protected currentDocumentId = 1;
  protected currentActivityId = 1;
  protected currentDocumentFileId = 1;
  protected currentRouteId = 1;

  constructor() {
    // Only seed data synchronously if we're not being extended by AsyncMemStorage
    if (this.constructor === MemStorage) {
      this.seedData();
    }
  }

  protected async seedData() {
    // Create sample driver with properly hashed password
    const saltRounds = 10;
    const hashedDriverPassword = await bcrypt.hash("password123", saltRounds);
    const hashedAdminPassword = await bcrypt.hash("admin123", saltRounds);

    const driver: Driver = {
      id: this.currentDriverId++,
      username: "skyler.droubay",
      password: hashedDriverPassword,
      name: "Skyler Droubay",
      email: "skyler@davalifreight.com",
      phone: "+1-555-0123",
      licenseNumber: "CDL-123456789",
      role: "driver",
      status: "off_duty",
      dutyStartTime: new Date(Date.now() - 21 * 60 * 1000),
      currentVehicleId: 1,
      currentTrailerId: null,
      isActive: true,
      createdAt: new Date(),
    };
    this.drivers.set(driver.id, driver);

    // Create sample admin user
    const admin: Driver = {
      id: this.currentDriverId++,
      username: "admin",
      password: hashedAdminPassword,
      name: "Admin User",
      email: "admin@davalifreight.com",
      phone: "+1-555-0100",
      licenseNumber: null,
      role: "admin",
      status: "off_duty",
      dutyStartTime: null,
      currentVehicleId: null,
      currentTrailerId: null,
      isActive: true,
      createdAt: new Date(),
    };
    this.drivers.set(admin.id, admin);

    // Create sample vehicle
    const vehicle: Vehicle = {
      id: this.currentVehicleId++,
      vehicleNumber: "25",
      make: "Peterbilt",
      model: "579",
      year: 2022,
      vin: "1XPWD40X1ED123456",
      licensePlate: "DVL-025",
      fuelLevel: 78,
      mileage: 125000,
      status: "in_use",
      lastInspectionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      isActive: true,
    };
    this.vehicles.set(vehicle.id, vehicle);

    // Create sample trailer
    const trailer: Trailer = {
      id: this.currentTrailerId++,
      trailerNumber: "00",
      type: "Dry Van",
      capacity: 53,
      status: "available",
      lastInspectionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      isActive: true,
    };
    this.trailers.set(trailer.id, trailer);

    // Update driver with assignments
    driver.currentVehicleId = vehicle.id;
    driver.currentTrailerId = trailer.id;

    // Create sample shipment
    const shipment: Shipment = {
      id: this.currentShipmentId++,
      shippingId: "3-86539",
      origin: "Los Angeles, CA",
      destination: "Phoenix, AZ",
      status: "in_transit",
      assignedDriverId: driver.id,
      assignedVehicleId: vehicle.id,
      assignedTrailerId: trailer.id,
      estimatedDistance: 400,
      actualDistance: 347,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      isActive: true,
    };
    this.shipments.set(shipment.id, shipment);

    // Create HoS record
    const hos: HoursOfService = {
      id: this.currentHoSId++,
      driverId: driver.id,
      date: new Date(),
      drivingHours: 2.3,
      onDutyHours: 5.5,
      remainingDriveTime: 8.7,
      remainingDutyTime: 8.5,
      isCompliant: true,
    };
    this.hoursOfService.set(driver.id, hos);

    // Create sample inspection reports
    const inspection1: InspectionReport = {
      id: this.currentInspectionId++,
      driverId: driver.id,
      vehicleId: vehicle.id,
      trailerId: trailer.id,
      type: "pre_trip",
      status: "completed",
      defectsFound: false,
      notes: "All systems operational",
      inspectionData: null,
      createdAt: new Date(Date.now() - 2 * 60 * 1000),
      completedAt: new Date(Date.now() - 1 * 60 * 1000),
    };
    this.inspectionReports.set(inspection1.id, inspection1);

    const inspection2: InspectionReport = {
      id: this.currentInspectionId++,
      driverId: driver.id,
      vehicleId: vehicle.id,
      trailerId: null,
      type: "post_trip",
      status: "pending",
      defectsFound: false,
      notes: null,
      inspectionData: null,
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      completedAt: null,
    };
    this.inspectionReports.set(inspection2.id, inspection2);

    // Create sample documents
    for (let i = 0; i < 12; i++) {
      const doc: Document = {
        id: this.currentDocumentId++,
        name: `Bill of Lading ${i + 1}`,
        type: "bill_of_lading",
        shipmentId: shipment.id,
        driverId: driver.id,
        filePath: `/documents/bol_${i + 1}.pdf`,
        uploadedAt: new Date(Date.now() - i * 60 * 60 * 1000),
        isActive: true,
      };
      this.documents.set(doc.id, doc);
    }

    // Create activity logs
    const activities = [
      {
        activity: "Vehicle inspection completed",
        description: "Vehicle #25 - Pre-trip inspection completed successfully",
        relatedEntityType: "vehicle",
        relatedEntityId: vehicle.id,
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
      },
      {
        activity: "Route updated",
        description: "Route updated for delivery #3-86539",
        relatedEntityType: "shipment",
        relatedEntityId: shipment.id,
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
      },
      {
        activity: "Documents uploaded",
        description: "Documents uploaded for shipment",
        relatedEntityType: "shipment",
        relatedEntityId: shipment.id,
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
      },
    ];

    activities.forEach((activity) => {
      const log: ActivityLog = {
        id: this.currentActivityId++,
        driverId: driver.id,
        ...activity,
      };
      this.activityLogs.set(log.id, log);
    });
  }

  // Driver operations
  async getDriver(id: number): Promise<Driver | undefined> {
    return this.drivers.get(id);
  }

  async getDriverByUsername(username: string): Promise<Driver | undefined> {
    return Array.from(this.drivers.values()).find(d => d.username === username);
  }

  async getAllDrivers(): Promise<Driver[]> {
    return Array.from(this.drivers.values()).filter(d => d.isActive);
  }

  async createDriver(insertDriver: InsertDriver): Promise<Driver> {
    const driver: Driver = {
      ...insertDriver,
      id: this.currentDriverId++,
      licenseNumber: insertDriver.licenseNumber || null,
      role: insertDriver.role || "driver",
      status: insertDriver.status || "off_duty",
      dutyStartTime: null,
      currentVehicleId: insertDriver.currentVehicleId || null,
      currentTrailerId: insertDriver.currentTrailerId || null,
      isActive: true,
      createdAt: new Date(),
    };
    this.drivers.set(driver.id, driver);
    return driver;
  }

  async updateDriver(id: number, updates: Partial<Driver>): Promise<Driver | undefined> {
    const driver = this.drivers.get(id);
    if (!driver) return undefined;

    const updated = { ...driver, ...updates };
    this.drivers.set(id, updated);
    return updated;
  }

  // Vehicle operations
  async getVehicle(id: number): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values()).filter(v => v.isActive);
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const vehicle: Vehicle = {
      ...insertVehicle,
      id: this.currentVehicleId++,
      fuelLevel: 100,
      mileage: 0,
      status: "available",
      lastInspectionDate: null,
      isActive: true,
    };
    this.vehicles.set(vehicle.id, vehicle);
    return vehicle;
  }

  async updateVehicle(id: number, updates: Partial<Vehicle>): Promise<Vehicle | undefined> {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) return undefined;

    const updated = { ...vehicle, ...updates };
    this.vehicles.set(id, updated);
    return updated;
  }

  // Trailer operations
  async getTrailer(id: number): Promise<Trailer | undefined> {
    return this.trailers.get(id);
  }

  async getAllTrailers(): Promise<Trailer[]> {
    return Array.from(this.trailers.values()).filter(t => t.isActive);
  }

  async createTrailer(insertTrailer: InsertTrailer): Promise<Trailer> {
    const trailer: Trailer = {
      ...insertTrailer,
      id: this.currentTrailerId++,
      status: "available",
      lastInspectionDate: null,
      isActive: true,
    };
    this.trailers.set(trailer.id, trailer);
    return trailer;
  }

  // Shipment operations
  async getShipment(id: number): Promise<Shipment | undefined> {
    return this.shipments.get(id);
  }

  async getShipmentByShippingId(shippingId: string): Promise<Shipment | undefined> {
    return Array.from(this.shipments.values()).find(s => s.shippingId === shippingId);
  }

  async getAllShipments(): Promise<Shipment[]> {
    return Array.from(this.shipments.values()).filter(s => s.isActive);
  }

  async getShipmentsByDriver(driverId: number): Promise<Shipment[]> {
    return Array.from(this.shipments.values()).filter(s => s.assignedDriverId === driverId && s.isActive);
  }

  async createShipment(insertShipment: InsertShipment): Promise<Shipment> {
    const shipment: Shipment = {
      ...insertShipment,
      id: this.currentShipmentId++,
      assignedDriverId: insertShipment.assignedDriverId || null,
      assignedVehicleId: insertShipment.assignedVehicleId || null,
      assignedTrailerId: insertShipment.assignedTrailerId || null,
      estimatedDistance: insertShipment.estimatedDistance || null,
      status: "pending",
      actualDistance: null,
      createdAt: new Date(),
      deliveryDate: null,
      isActive: true,
    };
    this.shipments.set(shipment.id, shipment);
    return shipment;
  }

  async updateShipment(id: number, updates: Partial<Shipment>): Promise<Shipment | undefined> {
    const shipment = this.shipments.get(id);
    if (!shipment) return undefined;

    const updated = { ...shipment, ...updates };
    this.shipments.set(id, updated);
    return updated;
  }

  // Hours of Service operations
  async getHoSByDriver(driverId: number): Promise<HoursOfService | undefined> {
    return this.hoursOfService.get(driverId);
  }

  async updateHoS(driverId: number, hosUpdates: Partial<HoursOfService>): Promise<HoursOfService> {
    const existing = this.hoursOfService.get(driverId);
    const hos: HoursOfService = existing ? { ...existing, ...hosUpdates } : {
      id: this.currentHoSId++,
      driverId,
      date: new Date(),
      drivingHours: 0,
      onDutyHours: 0,
      remainingDriveTime: 11,
      remainingDutyTime: 14,
      isCompliant: true,
      ...hosUpdates,
    };
    this.hoursOfService.set(driverId, hos);
    return hos;
  }

  // Inspection operations
  async getInspectionReports(driverId?: number): Promise<InspectionReport[]> {
    const reports = Array.from(this.inspectionReports.values());
    return driverId ? reports.filter(r => r.driverId === driverId) : reports;
  }

  async createInspectionReport(insertReport: InsertInspectionReport): Promise<InspectionReport> {
    const report: InspectionReport = {
      ...insertReport,
      id: this.currentInspectionId++,
      trailerId: insertReport.trailerId || null,
      defectsFound: insertReport.defectsFound || false,
      notes: insertReport.notes || null,
      inspectionData: insertReport.inspectionData || null,
      status: "pending",
      createdAt: new Date(),
      completedAt: null,
    };
    this.inspectionReports.set(report.id, report);
    return report;
  }

  async updateInspectionReport(id: number, updates: Partial<InspectionReport>): Promise<InspectionReport | undefined> {
    const report = this.inspectionReports.get(id);
    if (!report) return undefined;

    const updated = { ...report, ...updates };
    this.inspectionReports.set(id, updated);
    return updated;
  }

  // Document operations
  async getDocuments(shipmentId?: number, driverId?: number): Promise<Document[]> {
    let docs = Array.from(this.documents.values()).filter(d => d.isActive);
    if (shipmentId) docs = docs.filter(d => d.shipmentId === shipmentId);
    if (driverId) docs = docs.filter(d => d.driverId === driverId);
    return docs;
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const document: Document = {
      ...insertDocument,
      id: this.currentDocumentId++,
      shipmentId: insertDocument.shipmentId || null,
      driverId: insertDocument.driverId || null,
      filePath: insertDocument.filePath || null,
      uploadedAt: new Date(),
      isActive: true,
    };
    this.documents.set(document.id, document);
    return document;
  }

  // Activity log operations
  async getActivityLogs(driverId: number, limit = 10): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .filter(log => log.driverId === driverId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const log: ActivityLog = {
      ...insertLog,
      id: this.currentActivityId++,
      relatedEntityType: insertLog.relatedEntityType || null,
      relatedEntityId: insertLog.relatedEntityId || null,
      timestamp: new Date(),
    };
    this.activityLogs.set(log.id, log);
    return log;
  }

  async getDocumentFiles(driverId?: number, fileType?: string): Promise<DocumentFile[]> {
    const allFiles = Array.from(this.documentFiles.values());
    return allFiles.filter(file => {
      const matchesDriver = !driverId || file.driverId === driverId;
      const matchesType = !fileType || file.fileType === fileType;
      return matchesDriver && matchesType;
    });
  }

  async createDocumentFile(insertDocument: InsertDocumentFile): Promise<DocumentFile> {
    const document: DocumentFile = {
      id: this.currentDocumentFileId++,
      fileName: insertDocument.fileName,
      originalName: insertDocument.originalName,
      fileType: insertDocument.fileType as any,
      uploadDate: new Date(),
      driverId: insertDocument.driverId,
      vehicleId: insertDocument.vehicleId || null,
      fileSize: insertDocument.fileSize,
      filePath: insertDocument.filePath,
      fileData: insertDocument.fileData || null,
    };
    this.documentFiles.set(document.id, document);
    return document;
  }

  async getDocumentFile(id: number): Promise<DocumentFile | undefined> {
    return this.documentFiles.get(id);
  }

  async deleteDocumentFile(id: number): Promise<boolean> {
    return this.documentFiles.delete(id);
  }

  // Route operations
  async getRoutes(driverId?: number): Promise<Route[]> {
    const allRoutes = Array.from(this.routes.values());
    return driverId ? allRoutes.filter(route => route.driverId === driverId) : allRoutes;
  }

  async createRoute(insertRoute: InsertRoute): Promise<Route> {
    const route: Route = {
      id: this.currentRouteId++,
      name: insertRoute.name,
      origin: insertRoute.origin,
      destination: insertRoute.destination,
      originLat: insertRoute.originLat,
      originLng: insertRoute.originLng,
      destinationLat: insertRoute.destinationLat,
      destinationLng: insertRoute.destinationLng,
      distance: insertRoute.distance || null,
      totalMiles: insertRoute.totalMiles || null,
      estimatedDuration: insertRoute.estimatedDuration || null,
      stateBreakdown: insertRoute.stateBreakdown || null,
      driverId: insertRoute.driverId || null,
      shipmentId: insertRoute.shipmentId || null,
      status: insertRoute.status || "planned",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.routes.set(route.id, route);
    return route;
  }

  async getRoute(id: number): Promise<Route | undefined> {
    return this.routes.get(id);
  }

  async updateRoute(id: number, updates: Partial<Route>): Promise<Route | undefined> {
    const route = this.routes.get(id);
    if (!route) return undefined;

    const updatedRoute = { ...route, ...updates, updatedAt: new Date() };
    this.routes.set(id, updatedRoute);
    return updatedRoute;
  }

  async deleteRoute(id: number): Promise<boolean> {
    return this.routes.delete(id);
  }

  // Expense Report operations
  async createExpenseReport(reportData: any): Promise<any> {
    const report = {
      id: Date.now(),
      driverId: reportData.driverId || 1,
      tripRecord: JSON.stringify(reportData.tripRecord || {}),
      fuelEntries: JSON.stringify(reportData.fuelEntries || []),
      miscEntries: JSON.stringify(reportData.miscEntries || []),
      mileageEntries: JSON.stringify(reportData.mileageEntries || []),
      createdAt: new Date().toISOString(),
    };

    // Store in documents table as a PDF report
    const document = await this.createDocument({
      name: `expense-report-${report.id}.json`,
      type: 'expense_report',
      driverId: report.driverId
    });

    return { ...report, documentId: document.id };
  }

  async getExpenseReports(driverId?: number): Promise<any[]> {
    const docs = await this.getDocuments(undefined, driverId);
    const expenseReports = docs.filter(doc => doc.type === 'expense_report');

    return expenseReports.map(doc => ({
      id: doc.id,
      name: doc.name,
      type: doc.type,
      driverId: doc.driverId,
      uploadedAt: doc.uploadedAt
    }));
  }

  // Authentication methods
  async authenticateUser(username: string, password: string): Promise<Driver | null> {
    const user = await this.getDriverByUsername(username);
    
    if (!user) {
      return null;
    }

    // Compare hashed password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (isValidPassword) {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword as Driver;
    }

    return null;
  }

  async registerUser(userData: RegisterRequest): Promise<Driver> {
    // Hash the password before storing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    const driver = await this.createDriver({
      ...userData,
      password: hashedPassword,
    });

    const { password: _, ...userWithoutPassword } = driver;
    return userWithoutPassword as Driver;
  }

  async getUserById(id: number): Promise<Driver | undefined> {
    const user = await this.getDriver(id);
    if (!user) return undefined;

    // Don't return password in the result
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as Driver;
  }
}

// Create and initialize storage instance
class AsyncMemStorage extends MemStorage {
  private initialized = false;

  constructor() {
    // Call super() but with a flag to prevent sync seedData
    super();
    // Clear the maps to prevent sync seeding from affecting us
    this.drivers.clear();
    this.vehicles.clear();
    this.trailers.clear();
    this.shipments.clear();
    this.hoursOfService.clear();
    this.inspectionReports.clear();
    this.documents.clear();
    this.activityLogs.clear();
    this.documentFiles.clear();
    this.routes.clear();
    
    // Reset counters
    this.currentDriverId = 1;
    this.currentVehicleId = 1;
    this.currentTrailerId = 1;
    this.currentShipmentId = 1;
    this.currentHoSId = 1;
    this.currentInspectionId = 1;
    this.currentDocumentId = 1;
    this.currentActivityId = 1;
    this.currentDocumentFileId = 1;
    this.currentRouteId = 1;
  }

  private async initialize() {
    if (!this.initialized) {
      await this.seedData();
      this.initialized = true;
    }
  }

  async authenticateUser(username: string, password: string): Promise<Driver | null> {
    await this.initialize();
    return super.authenticateUser(username, password);
  }

  async getDriverByUsername(username: string): Promise<Driver | undefined> {
    await this.initialize();
    return super.getDriverByUsername(username);
  }

  async getAllDrivers(): Promise<Driver[]> {
    await this.initialize();
    return super.getAllDrivers();
  }

  async registerUser(userData: RegisterRequest): Promise<Driver> {
    await this.initialize();
    return super.registerUser(userData);
  }

  async getUserById(id: number): Promise<Driver | undefined> {
    await this.initialize();
    return super.getUserById(id);
  }
}

// Export storage instance
export const storage = new AsyncMemStorage();