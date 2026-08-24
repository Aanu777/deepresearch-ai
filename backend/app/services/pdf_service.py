from pathlib import Path
from uuid import uuid4

from pypdf import PdfReader


class PDFService:

    UPLOAD_DIR = Path("uploads/research")

    def __init__(self):
        self.UPLOAD_DIR.mkdir(
            parents=True,
            exist_ok=True,
        )

    def save_pdf(self, pdf_bytes: bytes, filename: str) -> Path:
        """
        Save an uploaded PDF to disk and return its path.
        """

        safe_name = Path(filename).name

        unique_name = (
            f"{uuid4().hex}_{safe_name}"
        )

        file_path = (
            self.UPLOAD_DIR / unique_name
        )

        file_path.write_bytes(pdf_bytes)

        return file_path

    def extract_text(self, file_path: Path) -> str:
        """
        Extract readable text from every page of a PDF.
        """

        reader = PdfReader(str(file_path))

        pages = []

        for page in reader.pages:

            text = page.extract_text()

            if text:
                pages.append(text.strip())

        return "\n\n".join(pages).strip()


pdf_service = PDFService()