# RE5 demo PDFs (outreach attachments)

Four 3-page demo guides, one per prospect segment. Attach the matching one to each outreach email.

| File | Use for |
|---|---|
| RE5-Demo-Hair-and-Beauty.pdf | Hair, wig, extension and skincare businesses |
| RE5-Demo-Nail-Supply.pdf | Nail supply stores |
| RE5-Demo-Wholesale-and-Trade-Supply.pdf | Grocery wholesalers, janitorial, foodservice and equipment suppliers |
| RE5-Demo-Boutique-and-Retail.pdf | Boutiques, craft and specialty retail |

Screens come from the RE5 demo builds in `public/demo` and `public/digital` (fictional businesses). The nail screen is a concept mock (`src/nail-mock.html`).

## Rebuild

Run inside `src/` (needs Python with Pillow and segno, plus Node with Playwright):

    node shot.js      # re-shoot the nail concept screen
    python3 build.py  # write the four HTML pages
    mkdir -p out prev && node render.js   # render PDFs to out/

Copy is in `build.py` (`SEGMENTS`). House rules: no em dashes and no "cheap"; `build.py` checks for both.
