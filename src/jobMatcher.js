import dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

dotenv.config();

const model = new ChatOpenAI({
  model: "gpt-4",
  temperature: 0,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const matchScoreSchema = z.object({
  score: z.number().describe("Matching score between 0 and 100 as a float"),
});

const structuredLlm = model.withStructuredOutput(matchScoreSchema);

/**
 * Calculate the match score between the resume and job details.
 *
 * @param {string} resumeText - The text of the resume.
 * @param {string} jobDetails - The job description and details.
 * @returns {Promise<number>} - Matching score as a float.
 */
export async function calculateMatchScore(resumeText, jobDetails) {
  try {
    const prompt = `
      Evaluate the match between a candidate's resume and a job description.
      - Use the candidate's skills, experience, and preferences from the resume.
      - Match them against the job title, description, and requirements in detail.
      - Return a single float score between 0 and 100, where 100 indicates a perfect match and 0 indicates no match.
      - Output the result as a JSON object with the "score" key.

      Resume Text: ${resumeText}
      Job Details: ${jobDetails}
    `;

    const { score } = await structuredLlm.invoke(prompt);
    console.log("Calculated Match Score:", score);
    return score;
  } catch (error) {
    console.error("Error calculating match score:", error);
    throw error;
  }
}
