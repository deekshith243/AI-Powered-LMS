"use client";

export const extractTextFromPDF = async (file: File): Promise<string> => {
  if (typeof window === "undefined") {
    throw new Error("PDF extraction must run in browser");
  }

  // Dynamic import to prevent 'DOMMatrix is not defined' error during build/SSR
  const pdfjsLib = await import("pdfjs-dist");

  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

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
};
