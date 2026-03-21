"use client";

export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    if (typeof window === "undefined") {
      throw new Error("Must run in browser");
    }

    const pdfjsLib = await import("pdfjs-dist");

    pdfjsLib.GlobalWorkerOptions.workerSrc =
      `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => item.str)
        .join(" ");
      text += pageText + "\n";
    }

    const trimmedText = text.trim();
    if (!trimmedText || trimmedText.length < 20) {
      throw new Error("Invalid or empty PDF");
    }

    return trimmedText;
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw error;
  }
};
