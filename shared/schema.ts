import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  licenseNumber: text("license_number").notNull(),
  role: text("role").notNull().default("driver"),
  status: text("status").notNull().default("off_duty"), // off_duty, on_duty, driving, sleeper
  dutyStartTime: timestamp("duty_start_time"),
  currentVehicleId: integer("current_vehicle_id"),
  currentTrailerId: integer("current_trailer_id"),
  isActive: boolean("is_active").notNull().default(true),
});

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  vehicleNumber: text("vehicle_number").notNull().unique(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  vin: text("vin").notNull(),
  licensePlate: text("license_plate").notNull(),
  fuelLevel: real("fuel_level").notNull().default(100),
  mileage: integer("mileage").notNull().default(0),
  status: text("status").notNull().default("available"), // available, in_use, maintenance
  lastInspectionDate: timestamp("last_inspection_date"),
  isActive: boolean("is_active").notNull().default(true),
});

export const trailers = pgTable("trailers", {
  id: serial("id").primaryKey(),
  trailerNumber: text("trailer_number").notNull().unique(),
  type: text("type").notNull(),
  capacity: real("capacity").notNull(),
  status: text("status").notNull().default("available"), // available, in_use, maintenance
  lastInspectionDate: timestamp("last_inspection_date"),
  isActive: boolean("is_active").notNull().default(true),
});

export const shipments = pgTable("shipments", {
  id: serial("id").primaryKey(),
  shippingId: text("shipping_id").notNull().unique(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  status: text("status").notNull().default("pending"), // pending, in_transit, delivered, cancelled
  assignedDriverId: integer("assigned_driver_id"),
  assignedVehicleId: integer("assigned_vehicle_id"),
  assignedTrailerId: integer("assigned_trailer_id"),
  estimatedDistance: integer("estimated_distance"),
  actualDistance: integer("actual_distance"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  deliveryDate: timestamp("delivery_date"),
  isActive: boolean("is_active").notNull().default(true),
});

export const hoursOfService = pgTable("hours_of_service", {
  id: serial("id").primaryKey(),
  driverId: integer("driver_id").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  drivingHours: real("driving_hours").notNull().default(0),
  onDutyHours: real("on_duty_hours").notNull().default(0),
  remainingDriveTime: real("remaining_drive_time").notNull().default(11), // 11 hours max
  remainingDutyTime: real("remaining_duty_time").notNull().default(14), // 14 hours max
  isCompliant: boolean("is_compliant").notNull().default(true),
});

export const inspectionReports = pgTable("inspection_reports", {
  id: serial("id").primaryKey(),
  driverId: integer("driver_id").notNull(),
  vehicleId: integer("vehicle_id").notNull(),
  trailerId: integer("trailer_id"),
  type: text("type").notNull(), // pre_trip, post_trip
  status: text("status").notNull().default("pending"), // pending, completed, failed
  defectsFound: boolean("defects_found").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // bill_of_lading, manifest, permit, etc.
  shipmentId: integer("shipment_id"),
  driverId: integer("driver_id"),
  filePath: text("file_path"),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
});

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  driverId: integer("driver_id").notNull(),
  activity: text("activity").notNull(),
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  relatedEntityType: text("related_entity_type"), // vehicle, shipment, etc.
  relatedEntityId: integer("related_entity_id"),
});

// Insert schemas
export const insertDriverSchema = createInsertSchema(drivers).omit({
  id: true,
  dutyStartTime: true,
  isActive: true,
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  fuelLevel: true,
  mileage: true,
  status: true,
  lastInspectionDate: true,
  isActive: true,
});

export const insertTrailerSchema = createInsertSchema(trailers).omit({
  id: true,
  status: true,
  lastInspectionDate: true,
  isActive: true,
});

export const insertShipmentSchema = createInsertSchema(shipments).omit({
  id: true,
  status: true,
  actualDistance: true,
  createdAt: true,
  deliveryDate: true,
  isActive: true,
});

export const insertInspectionReportSchema = createInsertSchema(inspectionReports).omit({
  id: true,
  status: true,
  createdAt: true,
  completedAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
  isActive: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  timestamp: true,
});

// Types
export type Driver = typeof drivers.$inferSelect;
export type InsertDriver = z.infer<typeof insertDriverSchema>;
export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Trailer = typeof trailers.$inferSelect;
export type InsertTrailer = z.infer<typeof insertTrailerSchema>;
export type Shipment = typeof shipments.$inferSelect;
export type InsertShipment = z.infer<typeof insertShipmentSchema>;
export type HoursOfService = typeof hoursOfService.$inferSelect;
export type InspectionReport = typeof inspectionReports.$inferSelect;
export type InsertInspectionReport = z.infer<typeof insertInspectionReportSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
