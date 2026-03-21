const pdf = require('pdf-parse');
const fs = require('fs');

async function testExtract() {
  try {
    // We don't have a PDF file to test with easily, so we'll just mock the buffer
    const mockBuffer = Buffer.from("Mock PDF content");
    const data = await pdf(mockBuffer);
    console.log("PDF Parse Test (Mock):", data.text);
    console.log("SUCCESS: pdf-parse is working.");
  } catch (err) {
    console.error("PDF Parse Test FAILED:", err);
  }
}

testExtract();
