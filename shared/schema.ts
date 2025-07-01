
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const drivers = sqliteTable("drivers", {
  id: integer("id").primaryKey(),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  licenseNumber: text("license_number").notNull(),
  role: text("role").notNull().default("driver"),
  status: text("status").notNull().default("off_duty"), // off_duty, on_duty, driving, sleeper
  dutyStartTime: text("duty_start_time"),
  currentVehicleId: integer("current_vehicle_id"),
  currentTrailerId: integer("current_trailer_id"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

export const vehicles = sqliteTable("vehicles", {
  id: integer("id").primaryKey(),
  vehicleNumber: text("vehicle_number").notNull().unique(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  vin: text("vin").notNull(),
  licensePlate: text("license_plate").notNull(),
  fuelLevel: real("fuel_level").notNull().default(100),
  mileage: integer("mileage").notNull().default(0),
  status: text("status").notNull().default("available"), // available, in_use, maintenance
  lastInspectionDate: text("last_inspection_date"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

export const trailers = sqliteTable("trailers", {
  id: integer("id").primaryKey(),
  trailerNumber: text("trailer_number").notNull().unique(),
  type: text("type").notNull(),
  capacity: real("capacity").notNull(),
  status: text("status").notNull().default("available"), // available, in_use, maintenance
  lastInspectionDate: text("last_inspection_date"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

export const shipments = sqliteTable("shipments", {
  id: integer("id").primaryKey(),
  shippingId: text("shipping_id").notNull().unique(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  status: text("status").notNull().default("pending"), // pending, in_transit, delivered, cancelled
  assignedDriverId: integer("assigned_driver_id"),
  assignedVehicleId: integer("assigned_vehicle_id"),
  assignedTrailerId: integer("assigned_trailer_id"),
  estimatedDistance: integer("estimated_distance"),
  actualDistance: integer("actual_distance"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
  deliveryDate: text("delivery_date"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

export const hoursOfService = sqliteTable("hours_of_service", {
  id: integer("id").primaryKey(),
  driverId: integer("driver_id").notNull(),
  date: text("date").notNull().default("CURRENT_TIMESTAMP"),
  drivingHours: real("driving_hours").notNull().default(0),
  onDutyHours: real("on_duty_hours").notNull().default(0),
  remainingDriveTime: real("remaining_drive_time").notNull().default(11), // 11 hours max
  remainingDutyTime: real("remaining_duty_time").notNull().default(14), // 14 hours max
  isCompliant: integer("is_compliant", { mode: "boolean" }).notNull().default(true),
});

export const inspectionReports = sqliteTable("inspection_reports", {
  id: integer("id").primaryKey(),
  driverId: integer("driver_id").notNull(),
  vehicleId: integer("vehicle_id").notNull(),
  trailerId: integer("trailer_id"),
  type: text("type").notNull(), // pre_trip, post_trip
  status: text("status").notNull().default("pending"), // pending, completed, failed
  defectsFound: integer("defects_found", { mode: "boolean" }).notNull().default(false),
  notes: text("notes"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
  completedAt: text("completed_at"),
});

export const documents = sqliteTable("documents", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // bill_of_lading, manifest, permit, etc.
  shipmentId: integer("shipment_id"),
  driverId: integer("driver_id"),
  filePath: text("file_path"),
  uploadedAt: text("uploaded_at").notNull().default("CURRENT_TIMESTAMP"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

export const activityLogs = sqliteTable("activity_logs", {
  id: integer("id").primaryKey(),
  driverId: integer("driver_id").notNull(),
  activity: text("activity").notNull(),
  description: text("description").notNull(),
  timestamp: text("timestamp").notNull().default("CURRENT_TIMESTAMP"),
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
