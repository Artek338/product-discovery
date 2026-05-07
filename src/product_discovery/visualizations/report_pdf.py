"""
PDF Export — convert HTML report to PDF via Playwright or WeasyPrint.

Primary: Playwright (headless Chromium — full JS chart rendering)
Fallback: WeasyPrint (static, no interactive charts)
"""

import asyncio
from pathlib import Path
from typing import Optional


async def html_to_pdf_playwright(html_path: Path, pdf_path: Path) -> Path:
    """Convert HTML report to PDF using Playwright (headless Chromium)."""
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        raise ImportError(
            "playwright required for PDF export: pip install playwright && playwright install chromium"
        )

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto(f"file:///{html_path.resolve()}")
        # Wait for Plotly charts to render
        await page.wait_for_timeout(2000)
        await page.pdf(
            path=str(pdf_path),
            format="A4",
            print_background=True,
            margin={"top": "1cm", "bottom": "1cm", "left": "1cm", "right": "1cm"},
        )
        await browser.close()

    return pdf_path


def html_to_pdf_weasyprint(html_path: Path, pdf_path: Path) -> Path:
    """Fallback: convert HTML to PDF using WeasyPrint (no JS rendering)."""
    try:
        from weasyprint import HTML
    except ImportError:
        raise ImportError(
            "weasyprint required as PDF fallback: pip install weasyprint"
        )

    HTML(filename=str(html_path)).write_pdf(str(pdf_path))
    return pdf_path


def export_pdf(html_path: Path, output_dir: Optional[Path] = None) -> Path:
    """Export HTML report to PDF. Tries Playwright first, falls back to WeasyPrint."""
    if output_dir is None:
        output_dir = html_path.parent

    pdf_name = html_path.stem.replace("REPORT", "REPORT_PDF") + ".pdf"
    pdf_path = output_dir / pdf_name

    # Try Playwright first (best quality)
    try:
        asyncio.run(html_to_pdf_playwright(html_path, pdf_path))
        print(f"✅ PDF generated (Playwright): {pdf_path}")
        return pdf_path
    except ImportError:
        pass
    except Exception as e:
        print(f"⚠️ Playwright failed: {e}. Trying WeasyPrint...")

    # Fallback: WeasyPrint
    try:
        html_to_pdf_weasyprint(html_path, pdf_path)
        print(f"✅ PDF generated (WeasyPrint): {pdf_path}")
        return pdf_path
    except ImportError:
        raise ImportError(
            "No PDF renderer available. Install one:\n"
            "  pip install playwright && playwright install chromium\n"
            "  OR: pip install weasyprint"
        )
