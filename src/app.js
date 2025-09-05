import express from "express";
import bodyParser from "body-parser";
import riderRoutes from "./routes/ride-routes.js"; 
import "./config/mongo.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(bodyParser.json());

// Rider functionalities routing
app.use("/riders", riderRoutes);

app.listen(PORT, () => {
  console.log(`🚖 RiderApp server running on port ${PORT}`);
});
