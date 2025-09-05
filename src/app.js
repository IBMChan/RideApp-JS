import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/mongo.js';
import pool from './config/mysql.js';
import userRoutes from './routes/user-routes.js';
// import rideRoutes from './routes/ride-routes.js';
import bodyParser from "body-parser";
import riderRoutes from "./routes/rider-routes.js"; 
import "./config/mongo.js";
import driverRoutes from "./routes/driver-routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

pool.getConnection()
    .then(connection => {
        console.log('MySQL Connected...');
        connection.release();
    })
    .catch(err => {
        console.error('MySQL Connection Error:', err.message);
        process.exit(1);
    });

app.use(express.json());
app.use(bodyParser.json());

// harshit's part
app.use('/api/users', userRoutes);
// app.use('/api/rides', rideRoutes);


app.use("/driver", driverRoutes);
app.use("/api/rider", riderRoutes);

app.listen(PORT, () => {
  console.log(`RiderApp server running on port ${PORT}`);
});
