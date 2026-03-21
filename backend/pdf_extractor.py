import sys
import pdfplumber

if len(sys.argv) < 2:
    print("Usage: python pdf_extractor.py <file_path>")
    sys.exit(1)

file_path = sys.argv[1]
text = ""

try:
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
    print(text)
except Exception as e:
    print(f"Error: {str(e)}", file=sys.stderr)
    sys.exit(1)
