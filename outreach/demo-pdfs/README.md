# RE5 demo PDFs (outreach attachments)

Five 3-page demo guides, one per prospect segment, plus a one-page version of each (`RE5-OnePager-*.pdf`). Attach the matching one to each outreach email.

| File | Use for |
|---|---|
| RE5-Demo-Hair-and-Beauty.pdf | Hair, wig, extension and skincare businesses |
| RE5-Demo-Nail-Supply.pdf | Nail supply stores |
| RE5-Demo-Wholesale-and-Trade-Supply.pdf | Grocery wholesalers, janitorial, foodservice and equipment suppliers |
| RE5-Demo-Boutique-and-Retail.pdf | Craft and specialty retail |
| RE5-Demo-Fashion-Boutique.pdf | Clothing boutiques |

Screens come from the RE5 demo builds in `public/demo` and `public/digital` (fictional businesses). The nail and fashion screens are concept mocks (`src/nail-mock.html`, `src/fashion-mock.html`; re-shoot with `node shot.js` and `node shot-fashion.js`).

## Rebuild

Run inside `src/` (needs Python with Pillow and segno, plus Node with Playwright):

    node shot.js      # re-shoot the nail concept screen
    python3 build.py  # write the four HTML pages
    mkdir -p out prev && node render.js   # render 3-page PDFs to out/
    node render1p.js  # render the one-pagers into this folder

Copy is in `build.py` (`SEGMENTS`). House rules: no em dashes and no "cheap"; `build.py` checks for both.
