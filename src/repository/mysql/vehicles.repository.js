//vehicle.repository.js
import pool from "../../config/mysql.js";

export class VehicleRepository {
  async getVehicleByDriver(driver_id) {
    const [rows] = await pool.query(
      "SELECT * FROM vehicles WHERE driver_id = ?",
      [driver_id]
    );
    return rows[0] || null;
  }

  async registerVehicle(driver_id, vehicleData) {
    const [existing] = await pool.query(
      "SELECT vehicle_id FROM vehicles WHERE driver_id = ?",
      [driver_id]
    );
    if (existing.length > 0) throw new Error("Driver already has a registered vehicle.");

    const result = await pool.query(
      `INSERT INTO vehicles (driver_id, model, year, reg_number,plate_number, color)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        driver_id,
        vehicleData.model,
        vehicleData.year,
        vehicleData.reg_number,
        vehicleData.plate_number,
        vehicleData.color || null,
      ]
    );
    return { vehicle_id: result[0].insertId, ...vehicleData };
  }

  async updateVehicle(driver_id, vehicleData) {
    const [existing] = await pool.query(
      "SELECT vehicle_id FROM vehicles WHERE driver_id = ?",
      [driver_id]
    );
    if (existing.length === 0) throw new Error("No vehicle registered for this driver.");

    const vehicle_id = existing[0].vehicle_id;

    await pool.query(
      `UPDATE vehicles SET model=?, year=?, reg_number=?,plate_number=?, color=? WHERE vehicle_id=?`,
      [
  
        vehicleData.model,
        vehicleData.year,
        vehicleData.reg_number,
        vehicleData.plate_number,
        vehicleData.color || null,
        vehicle_id,
      ]
    );
    return { vehicle_id, ...vehicleData };
  }
}
