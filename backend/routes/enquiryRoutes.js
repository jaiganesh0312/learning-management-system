const express = require("express");
const router = express.Router();
const enquiryController = require("../controllers/enquiryController");

// Public route to submit enquiry
router.post("/", enquiryController.createEnquiry);

// Protected routes (Assuming you might want to protect these later, but keeping open for now or you can add middleware)
// For now, I'll keep them open as per request simplicity, but typically these should be admin only.
router.get("/", enquiryController.getAllEnquiries);
router.get("/:id", enquiryController.getEnquiryById);
router.patch("/:id/status", enquiryController.updateEnquiryStatus);

module.exports = router;
