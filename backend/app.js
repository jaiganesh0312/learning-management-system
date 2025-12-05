const express = require("express");
const morgan = require("morgan");
const http = require("http");
const path = require("path");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const cors = require("cors");

const { sequelize } = require("./config/database");

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cors({
  origin: ["http://localhost:5173", "https://btp9hpfw-5173.inc1.devtunnels.ms"],
  credentials: true,
}));
app.use(morgan("dev"));
app.use(cookieParser());

//Handle content disposition, uploads folder available
console.log("Static path:", path.join(__dirname, "uploads"));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const authRoutes = require("./routes/authRoutes");
const roleRoutes = require("./routes/roleRoutes");
const courseRoutes = require("./routes/courseRoutes");
const learningPathRoutes = require("./routes/learningPathRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const assessmentRoutes = require("./routes/assessmentRoutes");
const reportingRoutes = require("./routes/reportingRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");
const auditLogRoutes = require("./routes/auditLogRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const systemSettingsRoutes = require("./routes/systemSettingsRoutes");
const complianceRoutes = require("./routes/complianceRoutes");


app.use("/auth", authRoutes);
app.use("/roles", roleRoutes);
app.use("/courses", courseRoutes);
app.use("/learning-paths", learningPathRoutes);
app.use("/enrollments", enrollmentRoutes);
app.use("/assessments", assessmentRoutes);
app.use("/reports", reportingRoutes);
app.use("/departments", departmentRoutes);
app.use("/certificates", certificateRoutes);
app.use("/enquiries", enquiryRoutes);
app.use("/audit-logs", auditLogRoutes);
app.use("/notifications", notificationRoutes);
app.use("/settings", systemSettingsRoutes);
app.use("/compliance", complianceRoutes);


// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = 5000;

if (require.main === module) {
  app.listen(PORT, async () => {
    await sequelize.authenticate();
    console.log("Database connected successfully");
    await sequelize.sync({ alter: true });
    console.log("Database synced successfully");

    // Seed roles
    
    const seedRoles = require('./seeders/seedRoles');
    await seedRoles();

    console.log("Server Running on localhost 5000");
  });
}

module.exports = app;
