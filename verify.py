import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        print("Opening app...")
        page.goto("http://localhost:8000/gst-trip-bill-maker/index.html")
        page.wait_for_load_state("networkidle")

        # Test tab navigation
        print("Testing tabs...")
        page.click("button[data-tab='saved-invoices']")
        time.sleep(1)
        assert page.locator("#saved-invoices").is_visible()

        page.click("button[data-tab='settings']")
        time.sleep(1)
        assert page.locator("#settings").is_visible()

        page.click("button[data-tab='new-invoice']")
        time.sleep(1)
        assert page.locator("#new-invoice").is_visible()

        # Test Invoice Creation & Calculation
        print("Creating invoice...")
        page.fill("#client-name", "Rahul & Priya")
        page.fill("#destination", "Maldives")

        # Add item details
        page.fill(".item-desc", "Honeymoon Package")
        page.fill("input[type='number']", "50000")

        # Trigger calculation
        page.click("body")
        time.sleep(1)

        # Check totals
        subtotal = page.text_content("#subtotal-display")
        assert "50000.00" in subtotal

        cgst = page.text_content("#cgst-display")
        assert "4500.00" in cgst # 9% of 50k

        total = page.text_content("#total-display")
        assert "59000.00" in total

        # Setup dialog handler to dismiss alerts automatically
        page.on("dialog", lambda dialog: dialog.accept())

        # Test saving invoice
        print("Saving invoice...")
        page.click("#save-invoice-btn")
        time.sleep(1)

        assert page.locator("#saved-invoices").is_visible()

        # Take a screenshot
        print("Taking screenshot...")
        page.screenshot(path="screenshot.png")
        print("Done!")

        browser.close()

if __name__ == "__main__":
    run()