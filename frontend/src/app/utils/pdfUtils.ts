import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker
// Using a CDN hosted worker for simplicity in Next.js/Vite environments
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const extractTextFromPDF = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const typedarray = new Uint8Array(reader.result as ArrayBuffer);
        const loadingTask = pdfjsLib.getDocument({ data: typedarray });
        const pdf = await loadingTask.promise;

        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const strings = textContent.items.map((item: any) => item.str);
          fullText += strings.join(' ') + '\n';
        }

        resolve(fullText);
      } catch (err) {
        console.error('Frontend PDF Extraction Error:', err);
        reject(new Error('Failed to extract text from PDF locally.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('FileReader error.'));
    };

    reader.readAsArrayBuffer(file);
  });
};
