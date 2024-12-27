import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import path from "path";
import { parsePDF } from "./processPDF.js";
import { extractResumeDetails } from "./resumeExtractor.js";
import { searchJobs } from "./jobSearch.js";

dotenv.config();

const app = express();
const upload = multer({ dest: "uploads/" });

let structuredResumeData = {};

// Middleware
app.use(express.json());
app.use(express.static("public")); // Serve static files from the "public" directory

// Serve the upload page by default
app.get("/", (req, res) => {
  res.sendFile(path.resolve("public"));
});

// Endpoint to upload PDF and extract text
app.post("/upload-pdf", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const parsedResumeText = await parsePDF(req.file.path);
    structuredResumeData = await extractResumeDetails(parsedResumeText);

    res.json({
      message: "PDF uploaded and structured data extracted successfully",
      data: structuredResumeData,
    });
  } catch (error) {
    console.error("Error processing PDF:", error.message);
    res.status(500).json({ error: "Failed to parse the PDF or extract structured data" });
  }
});

// Endpoint to find jobs based on structured resume data
app.post("/find-jobs", async (req, res) => {
  try {
    if (!structuredResumeData || !structuredResumeData.title) {
      return res.status(400).json({
        error: "Upload a resume first to extract structured data for job search.",
      });
    }

    const jobs = await searchJobs(structuredResumeData);

    res.json({ jobs });
  } catch (error) {
    console.error("Error finding jobs:", error.message);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// Serve the jobs page
app.get("/jobs", (req, res) => {
  res.sendFile(path.resolve("public/jobs.html"));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
