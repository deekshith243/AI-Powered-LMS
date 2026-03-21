import sys
import pdfplumber

try:
    if len(sys.argv) < 2:
        print("Usage: python pdf_extractor.py <file_path>")
        sys.exit(1)

    file_path = sys.argv[1]

    text = ""

    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""

    print(text)

except Exception as e:
    print("ERROR:", str(e))
    sys.exit(1)
