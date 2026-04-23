const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extract text from a resume file (PDF or DOCX)
 */
async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }

  try {
    if (ext === '.pdf') {
      return await extractFromPDF(absolutePath);
    } else if (ext === '.docx') {
      return await extractFromDOCX(absolutePath);
    } else if (ext === '.txt') {
      return fs.readFileSync(absolutePath, 'utf-8');
    } else {
      throw new Error(`Unsupported file format: ${ext}`);
    }
  } catch (error) {
    console.error(`Error extracting text from ${filePath}:`, error.message);
    throw error;
  }
}

/**
 * Extract text from PDF
 */
async function extractFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return cleanText(data.text);
}

/**
 * Extract text from DOCX
 */
async function extractFromDOCX(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return cleanText(result.value);
}

/**
 * Clean and normalize extracted text
 */
function cleanText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/ {2,}/g, ' ')
    .trim();
}

/**
 * Extract candidate name (best-effort heuristic)
 */
function extractName(text) {
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  // First non-empty line is often the name
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    // Filter out common non-name patterns
    if (firstLine.length < 60 && !firstLine.includes('@') && !/^\d/.test(firstLine)) {
      return firstLine;
    }
  }
  return 'Unknown Candidate';
}

/**
 * Extract email from text
 */
function extractEmail(text) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const match = text.match(emailRegex);
  return match ? match[0] : '';
}

/**
 * Extract phone number from text
 */
function extractPhone(text) {
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const match = text.match(phoneRegex);
  return match ? match[0] : '';
}

module.exports = {
  extractText,
  extractName,
  extractEmail,
  extractPhone,
  cleanText
};
