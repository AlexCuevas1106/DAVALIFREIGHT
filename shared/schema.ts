import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const drivers = sqliteTable("drivers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  licenseNumber: text("license_number"),
  role: text("role").notNull().default("driver"), // "admin" or "driver"
  status: text("status").notNull().default("off_duty"), // off_duty, on_duty, driving, sleeper
  dutyStartTime: integer("duty_start_time", { mode: "timestamp" }),
  currentVehicleId: integer("current_vehicle_id"),
  currentTrailerId: integer("current_trailer_id"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const vehicles = sqliteTable("vehicles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  vehicleNumber: text("vehicle_number").notNull().unique(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  vin: text("vin").notNull(),
  licensePlate: text("license_plate").notNull(),
  fuelLevel: real("fuel_level").notNull().default(100),
  mileage: integer("mileage").notNull().default(0),
  status: text("status").notNull().default("available"), // available, in_use, maintenance
  lastInspectionDate: integer("last_inspection_date", { mode: "timestamp" }),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

export const trailers = sqliteTable("trailers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  trailerNumber: text("trailer_number").notNull().unique(),
  type: text("type").notNull(),
  capacity: real("capacity").notNull(),
  status: text("status").notNull().default("available"), // available, in_use, maintenance
  lastInspectionDate: integer("last_inspection_date", { mode: "timestamp" }),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

export const shipments = sqliteTable("shipments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  shippingId: text("shipping_id").notNull().unique(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  status: text("status").notNull().default("pending"), // pending, in_transit, delivered, cancelled
  assignedDriverId: integer("assigned_driver_id"),
  assignedVehicleId: integer("assigned_vehicle_id"),
  assignedTrailerId: integer("assigned_trailer_id"),
  estimatedDistance: integer("estimated_distance"),
  actualDistance: integer("actual_distance"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  deliveryDate: integer("delivery_date", { mode: "timestamp" }),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

export const hoursOfService = sqliteTable("hours_of_service", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  driverId: integer("driver_id").notNull(),
  date: integer("date", { mode: "timestamp" }).notNull(),
  drivingHours: real("driving_hours").notNull().default(0),
  onDutyHours: real("on_duty_hours").notNull().default(0),
  remainingDriveTime: real("remaining_drive_time").notNull().default(11), // 11 hours max
  remainingDutyTime: real("remaining_duty_time").notNull().default(14), // 14 hours max
  isCompliant: integer("is_compliant", { mode: "boolean" }).notNull().default(true),
});

export const inspectionReports = sqliteTable("inspection_reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  driverId: integer("driver_id").notNull(),
  vehicleId: integer("vehicle_id").notNull(),
  trailerId: integer("trailer_id"),
  type: text("type").notNull(), // pre_trip, post_trip
  status: text("status").notNull().default("pending"), // pending, completed, failed
  defectsFound: integer("defects_found", { mode: "boolean" }).notNull().default(false),
  notes: text("notes"),
  inspectionData: text("inspection_data"), // JSON string containing detailed inspection data
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});

export const documents = sqliteTable("documents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type").notNull(), // bill_of_lading, manifest, permit, etc.
  shipmentId: integer("shipment_id"),
  driverId: integer("driver_id"),
  filePath: text("file_path"),
  uploadedAt: integer("uploaded_at", { mode: "timestamp" }).notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

export const activityLogs = sqliteTable("activity_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  driverId: integer("driver_id").notNull(),
  activity: text("activity").notNull(),
  description: text("description").notNull(),
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
  relatedEntityType: text("related_entity_type"), // vehicle, shipment, etc.
  relatedEntityId: integer("related_entity_id"),
});

export const documentFiles = sqliteTable("document_files", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  fileType: text("file_type").notNull(), // "bill_of_lading", "fuel_receipt", "pdf_report"
  uploadDate: integer("upload_date", { mode: "timestamp" }).notNull(),
  driverId: integer("driver_id").notNull(),
  vehicleId: integer("vehicle_id"),
  fileSize: integer("file_size").notNull(),
  filePath: text("file_path").notNull(),
  fileData: text("file_data"), // Base64 encoded file data
});

// Tabla para rutas de transporte
export const routes = sqliteTable("routes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  originLat: real("origin_lat").notNull(),
  originLng: real("origin_lng").notNull(),
  destinationLat: real("destination_lat").notNull(),
  destinationLng: real("destination_lng").notNull(),
  distance: real("distance"), // en kilómetros (legacy field)
  totalMiles: real("total_miles"), // Total distance in miles
  estimatedDuration: integer("estimated_duration"), // en minutos
  stateBreakdown: text("state_breakdown"), // JSON string with state-by-state miles
  driverId: integer("driver_id"),
  shipmentId: integer("shipment_id"),
  status: text("status").notNull().default("planned"), // 'planned', 'active', 'completed'
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

// Insert schemas
export const insertDriverSchema = createInsertSchema(drivers).omit({
  id: true,
  dutyStartTime: true,
  isActive: true,
  createdAt: true,
});

export const insertInspectionSchema = createInsertSchema(inspectionReports).omit({
  id: true,
  createdAt: true,
});

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Registration schema
export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(1, "Phone is required"),
  role: z.enum(["admin", "driver"]).default("driver"),
  licenseNumber: z.string().optional(),
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

export const insertDocumentFileSchema = createInsertSchema(documentFiles).omit({
  id: true,
  uploadDate: true,
});

export const insertRouteSchema = createInsertSchema(routes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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
export type DocumentFile = typeof documentFiles.$inferSelect;
export type InsertDocumentFile = z.infer<typeof insertDocumentFileSchema>;
export type Route = typeof routes.$inferSelect;
export type InsertRoute = z.infer<typeof insertRouteSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;