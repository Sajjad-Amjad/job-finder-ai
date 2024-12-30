import axios from "axios";
import dotenv from "dotenv";
import { calculateMatchScore } from "./jobMatcher.js";

dotenv.config();

/**
 * Search jobs using structured resume data.
 *
 * @param {object} params - Structured data with title, location, work-from-home preference, and degree information.
 * @param {string} resumeText - Full extracted resume text.
 * @returns {Promise<object[]>} - Filtered job results.
 */
export async function searchJobs({
  title,
  location,
  workFromHomePreference,
  degree,
  resumeText,
}) {
  try {
    const apiKey = process.env.SERPAPI_API_KEY;

    if (!apiKey) {
      throw new Error("API key is missing. Set SERPAPI_API_KEY in your .env file.");
    }

    const queryParams = {
      engine: "google_jobs",
      q: title,
      hl: "en",
      api_key: apiKey,
    };

    // Add filter for work-from-home if applicable
    if (workFromHomePreference) {
      queryParams.ltype = "1";
    }

    const response = await axios.get("https://serpapi.com/search.json", {
      params: queryParams,
    });

    let jobs = response.data?.jobs_results || [];

    // Filter out jobs requiring a degree if the candidate doesn't have one
    if (!degree) {
      jobs = jobs.filter(
        (job) =>
          !job.detected_extensions?.qualifications?.toLowerCase().includes("degree")
      );
    }

    // Calculate match scores for each job
    const scoredJobs = await Promise.all(
      jobs.map(async (job) => {
        const jobDetails = `${job.title} ${job.company_name} ${job.location} ${
          job.description || ""
        }`;
        const score = await calculateMatchScore(resumeText, jobDetails);
        return { ...job, score };
      })
    );

    // Filter jobs with score >= 50
    const filteredJobs = scoredJobs.filter((job) => job.score >= 50);

    // Return structured results
    return filteredJobs.map((job) => ({
      title: job.title,
      company: job.company_name,
      location: job.location,
      postedAt: job.detected_extensions?.posted_at,
      workFromHome: job.detected_extensions?.work_from_home || false,
      applyLink: job.apply_options?.[0]?.link,
      thumbnail: job.thumbnail,
    }));
  } catch (error) {
    console.error("Error fetching job results:", error.message);
    throw error;
  }
}
