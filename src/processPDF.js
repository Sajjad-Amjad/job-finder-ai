import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pdfjs from "pdfjs-dist/build/pdf.js";

const { getDocument } = pdfjs;

// __dirname hack for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to extract text from a PDF
export async function parsePDF(pdfPath) {
  try {
    // Read the PDF file into a buffer
    const data = fs.readFileSync(pdfPath);

    // Parse the PDF using pdfjs-dist
    const pdf = await getDocument({ data }).promise;

    let allText = "";
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");
      allText += `Page ${pageNumber}:\n${pageText}\n\n`;
    }

    if (!allText.trim()) {
      throw new Error("No text found in the PDF. Ensure the file is not empty or scanned as an image.");
    }

    return allText;
  } catch (err) {
    console.error("Error extracting PDF text:", err);
    throw new Error("Failed to extract text from the PDF. Please upload a valid PDF.");
  }
}
