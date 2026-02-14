const express = require('express');
const router = express.Router();
const multer = require('multer');
const Resume = require('../models/Resume');
const path = require('path');
const axios = require('axios');
const mongoose = require('mongoose');

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Upload Endpoint
router.post('/', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { jobDescription } = req.body;

        let resumeId = new mongoose.Types.ObjectId();
        if (mongoose.connection.readyState === 1) {
            const newResume = new Resume({
                _id: resumeId,
                originalName: req.file.originalname,
                filename: req.file.filename,
                path: req.file.path,
                jobDescription: jobDescription
            });
            await newResume.save();
        } else {
            console.log('MongoDB not connected. Skipping DB save.');
        }

        // Placeholder for calling NLP service
        // const nlpResponse = await axios.post(`${process.env.NLP_SERVICE_URL}/analyze`, {
        //     filePath: req.file.path,
        //     jobDescription: jobDescription
        // });

        // Update resume with analysis results (to be implemented)
        // newResume.analysis = nlpResponse.data;
        // await newResume.save();

        res.status(201).json({ message: 'Resume uploaded successfully', resumeId: resumeId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
