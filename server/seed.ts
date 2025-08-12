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
} from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export async function seedDatabase() {
  console.log("Seeding database...");

  // Check if data already exists
  const existingDrivers = await db.select().from(drivers).limit(1);
  if (existingDrivers.length > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  try {
    // Hash passwords for seed data
    const saltRounds = 10;
    const hashedDriverPassword = await bcrypt.hash("password123", saltRounds);
    const hashedAdminPassword = await bcrypt.hash("admin123", saltRounds);

    // Create sample driver
    const [driver] = await db
      .insert(drivers)
      .values({
        username: "skyler.droubay",
        password: hashedDriverPassword,
        name: "Skyler Droubay",
        email: "skyler@davalifreight.com",
        phone: "+1-555-0123",
        licenseNumber: "CDL-123456789",
        role: "driver",
        status: "off_duty",
        dutyStartTime: new Date(Date.now() - 21 * 60 * 1000), // 21 minutes ago
        currentVehicleId: null,
        currentTrailerId: null,
        createdAt: new Date(),
      })
      .returning();

    // Create sample admin user
    await db
      .insert(drivers)
      .values({
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
        createdAt: new Date(),
      });

    // Create sample vehicle
    const [vehicle] = await db
      .insert(vehicles)
      .values({
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
      })
      .returning();

    // Create sample trailer
    const [trailer] = await db
      .insert(trailers)
      .values({
        trailerNumber: "00",
        type: "Dry Van",
        capacity: 53,
        status: "available",
        lastInspectionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      })
      .returning();

    // Update driver with vehicle assignments
    await db
      .update(drivers)
      .set({
        currentVehicleId: vehicle.id,
        currentTrailerId: trailer.id,
      })
      .where(eq(drivers.id, driver.id));

    // Create sample shipment
    const [shipment] = await db
      .insert(shipments)
      .values({
        shippingId: "3-86539",
        origin: "Los Angeles, CA",
        destination: "Phoenix, AZ",
        status: "in_transit",
        assignedDriverId: driver.id,
        assignedVehicleId: vehicle.id,
        assignedTrailerId: trailer.id,
        estimatedDistance: 400,
        actualDistance: 347,
        deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      })
      .returning();

    // Create HoS record
    await db.insert(hoursOfService).values({
      driverId: driver.id,
      drivingHours: 2.3,
      onDutyHours: 5.5,
      remainingDriveTime: 8.7,
      remainingDutyTime: 8.5,
      isCompliant: true,
      date: new Date(),
    });

    // Create sample inspection reports
    await db.insert(inspectionReports).values([
      {
        driverId: driver.id,
        vehicleId: vehicle.id,
        trailerId: trailer.id,
        type: "pre_trip",
        status: "completed",
        defectsFound: false,
        notes: "All systems operational",
        completedAt: new Date(Date.now() - 1 * 60 * 1000),
        createdAt: new Date(Date.now() - 2 * 60 * 1000),
      },
      {
        driverId: driver.id,
        vehicleId: vehicle.id,
        trailerId: null,
        type: "post_trip",
        status: "pending",
        defectsFound: false,
        notes: null,
        completedAt: null,
        createdAt: new Date(Date.now() - 1 * 60 * 1000),
      },
    ]);

    // Create sample documents
    const documentValues = [];
    for (let i = 0; i < 12; i++) {
      documentValues.push({
        name: `Bill of Lading ${i + 1}`,
        type: "bill_of_lading",
        shipmentId: shipment.id,
        driverId: driver.id,
        filePath: `/documents/bol_${i + 1}.pdf`,
        uploadedAt: new Date(Date.now() - i * 60 * 1000),
      });
    }
    await db.insert(documents).values(documentValues);

    // Create activity logs
    const activities = [
      {
        driverId: driver.id,
        activity: "Vehicle inspection completed",
        description: "Vehicle #25 - Pre-trip inspection completed successfully",
        relatedEntityType: "vehicle" as string,
        relatedEntityId: vehicle.id,
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
      },
      {
        driverId: driver.id,
        activity: "Route updated",
        description: "Route updated for delivery #3-86539",
        relatedEntityType: "shipment" as string,
        relatedEntityId: shipment.id,
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
      },
      {
        driverId: driver.id,
        activity: "Documents uploaded",
        description: "Documents uploaded for shipment",
        relatedEntityType: "shipment" as string,
        relatedEntityId: shipment.id,
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
      },
    ];

    await db.insert(activityLogs).values(activities);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}