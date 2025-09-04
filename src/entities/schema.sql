-- users---> MYSQL
CREATE TABLE users (
    user_id VARCHAR(20) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(15),
    password VARCHAR(255) NOT NULL,
    role ENUM('driver', 'rider') NOT NULL,
    license_number VARCHAR(50),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_li CHECK (
        (role = 'driver' AND license_number IS NOT NULL) 
        OR (role = 'rider')
    )
);



-- vehicles--->MYSQL
CREATE TABLE vehicles (
    vehicle_id INT PRIMARY KEY,
    driver_id VARCHAR(20) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year YEAR NOT NULL,
    reg_number VARCHAR(20) NOT NULL UNIQUE,
    plate_number VARCHAR(20) NOT NULL,
    color VARCHAR(50),
    CONSTRAINT fk_dr FOREIGN KEY (driver_id) REFERENCES users(user_id)
);



-- rides--->MONGODB
{
  "_id": {
    "$oid": "68b9673f685d8497e1dba685"
  },
  "ride_id": 1,
  "rider_id": 1,
  "driver_id": 2,
  "vehicle_id": 1,
  "pickup_location": "Whites Road, Chennai",
  "drop_location": "Abids, Hyderabad",
  "r_status": "completed",
  "r_date": {
    "$date": "2024-05-05T04:51:00.000Z"
  },
  "payment": {
    "payment_id": 1,
    "fare": 300,
    "mode": "upi",
    "p_status": "completed",
    "p_date": {
      "$date": "2025-08-13T09:33:15.788Z"
    }
  },
  "ratings": {
    "rate_id": 1,
    "r_to_d": {
      "rate": 5,
      "comment": "Driver was polite and punctual"
    },
    "d_to_r": {
      "rate": 4,
      "comment": "Rider was cooperative and friendly"
    }
  }
}