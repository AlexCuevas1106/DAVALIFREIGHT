import {
  drivers,
  vehicles,
  trailers,
  shipments,
  hoursOfService,
  inspectionReports,
  documents,
  activityLogs,
  type Driver,
  type InsertDriver,
  type Vehicle,
  type InsertVehicle,
  type Trailer,
  type InsertTrailer,
  type Shipment,
  type InsertShipment,
  type HoursOfService,
  type InspectionReport,
  type InsertInspectionReport,
  type Document,
  type InsertDocument,
  type ActivityLog,
  type InsertActivityLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

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
  getDocumentById(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: number): Promise<void>;
  
  // Activity log operations
  getActivityLogs(driverId: number, limit?: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
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
    if (driverId) {
      return await db.select().from(inspectionReports).where(eq(inspectionReports.driverId, driverId));
    }
    return await db.select().from(inspectionReports);
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

  async getDocumentById(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db
      .insert(documents)
      .values(insertDocument)
      .returning();
    return document;
  }

  async deleteDocument(id: number): Promise<void> {
    await db
      .update(documents)
      .set({ isActive: false })
      .where(eq(documents.id, id));
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
}

export const storage = new DatabaseStorage();
