import dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

dotenv.config();

const model = new ChatOpenAI({
  model: "gpt-4",
  temperature: 0,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const resumeSchema = z.object({
  title: z.string().describe("Current job title of the candidate"),
  location: z.string().describe("Preferred job location (Country Code)"),
  workFromHomePreference: z
    .boolean()
    .describe("Does the candidate prefer to work from home?"),
  degree: z.boolean().describe("Does the candidate have a degree?"),
});

const structuredLlm = model.withStructuredOutput(resumeSchema);

/**
 * Extract structured details from resume text.
 *
 * @param {string} extractedText - Text extracted from the PDF.
 * @returns {Promise<object>} - Structured data.
 */
export async function extractResumeDetails(extractedText) {
  try {
    const structuredData = await structuredLlm.invoke(
      `Extract the following details from the resume text: ${extractedText}`
    );
    console.log("Extracted Data: ", structuredData)
    return structuredData;
  } catch (error) {
    console.error("Error extracting resume details:", error);
    throw error;
  }
}
