"use client";

import * as pdfjsLib from "pdfjs-dist";

// Worker from CDN for Vercel/Next.js compatibility
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const strings = textContent.items.map((item: any) => item.str);
        fullText += strings.join(" ") + "\n";
    }

    return fullText;
  } catch (err) {
    console.error("PDF extraction failed", err);
    throw new Error("PDF extraction failed");
  }
};
