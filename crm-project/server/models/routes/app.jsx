const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

app.use(cors());
app.use(express.json());

const dashboardRoutes = require("./routes/dashboard");
app.use("/api", dashboardRoutes);

// Serve logo from client/src/assets/logo.png
app.get("/assets/logo.png", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/src/assets/logo.png"));
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://0.0.0.0:${PORT}`));