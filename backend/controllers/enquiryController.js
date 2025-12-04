const Enquiry = require("../models/enquiry.model");

// Create a new enquiry
exports.createEnquiry = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, company, subject, message, enquiryType } = req.body;

        const newEnquiry = await Enquiry.create({
            firstName,
            lastName,
            email,
            phone,
            company,
            subject,
            message,
            enquiryType
        });

        res.status(201).json({
            success: true,
            message: "Enquiry submitted successfully",
            data: newEnquiry
        });
    } catch (error) {
        console.error("Error creating enquiry:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit enquiry",
            error: error.message
        });
    }
};

// Get all enquiries
exports.getAllEnquiries = async (req, res) => {
    try {
        const enquiries = await Enquiry.findAll({
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: enquiries
        });
    } catch (error) {
        console.error("Error fetching enquiries:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch enquiries",
            error: error.message
        });
    }
};

// Get single enquiry by ID
exports.getEnquiryById = async (req, res) => {
    try {
        const { id } = req.params;
        const enquiry = await Enquiry.findByPk(id);

        if (!enquiry) {
            return res.status(404).json({
                success: false,
                message: "Enquiry not found"
            });
        }

        res.status(200).json({
            success: true,
            data: enquiry
        });
    } catch (error) {
        console.error("Error fetching enquiry:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch enquiry",
            error: error.message
        });
    }
};

// Update enquiry status
exports.updateEnquiryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const enquiry = await Enquiry.findByPk(id);

        if (!enquiry) {
            return res.status(404).json({
                success: false,
                message: "Enquiry not found"
            });
        }

        enquiry.status = status;
        await enquiry.save();

        res.status(200).json({
            success: true,
            message: "Enquiry status updated successfully",
            data: enquiry
        });
    } catch (error) {
        console.error("Error updating enquiry status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update enquiry status",
            error: error.message
        });
    }
};
