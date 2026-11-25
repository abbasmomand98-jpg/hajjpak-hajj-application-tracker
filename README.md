# HajjPak — Hajj Application & Package Tracker (UX Concept)

A working website by Muhammad Abbas Khan — a UX concept demo for the HajjPak case study. Pure HTML, CSS and JavaScript, no frameworks. Open `index.html` in a browser, or visit the live demo:

- **Live demo:** https://abbasmomand98-jpg.github.io/hajjpak-hajj-application-tracker/
- **Code:** https://github.com/abbasmomand98-jpg/hajjpak-hajj-application-tracker

## What it does

A Pakistani pilgrim pays over Rs 10,75,000 per person under the government scheme for Hajj 2026, yet applicants face balloting anxiety with no live status, private packages that hide their real cost, fake agents taking advance cash, and a long document and vaccination checklist with no single place to track it. HajjPak has four parts:

1. **Schemes** — compare 6 sample Hajj 2026 packages side by side: the government long package at Rs 10,75,000 per person (38–40 days, cheapest verified) and the government short package at Rs 11,75,000 (20–25 days), against private packages from Rs 11,50,000 to Rs 14,50,000. Search by operator, city or licence, sort by price or kind. The Rs 8,50,000 "bargain" from Quick Hajj Deals is flagged fraud — it is never the cheapest verified option.
2. **Cost Calculator** — work out the real total for a family. The government long package is Rs 10,75,000 per person, so Rafiq and Amina pay Rs 21,50,000 — but the package does not include Qurbani (Rs 45,000), extra meals (Rs 25,000), airport transfers (Rs 8,000), a SIM and data (Rs 3,500), laundry (Rs 6,000) or tips (Rs 10,000): Rs 97,500 more per person. Reveal the hidden costs and the real total for two people is Rs 23,45,000 — Rs 1,95,000 more than the quoted price.
3. **Balloting Tracker** — check an application number and see its status, with a countdown to the draw. Rafiq and Amina applied together under the government scheme, application HAJ-2026-4812, submitted 18 Nov 2026 at the Bank of Khyber, University Road branch, Peshawar. The draw is on 5 Dec 2026 — 10 days from today, 25 Nov 2026. Five sample applications show every status: in balloting, selected, not selected, waitlisted.
4. **Agent Verifier & Checklist** — check an operator's HGO licence before paying a rupee: HGO-2026-114 (Al-Noor Hajj Services, Peshawar) verifies; HGO-2026-077 (Quick Hajj Deals) is flagged fraud; an unknown licence is honestly "not in the sample register". A six-question scam spotter teaches the red flags — cash with no receipt, a price far below the government scheme, a guaranteed balloting result, no licence number on the board — against the safe signs. The document and vaccination checklist (passport valid 8+ months, CNIC, photos, meningococcal, flu, COVID booster, mahram proof, payment receipt) is 5 of 8 done and saves on the device, alongside three Hajj training sessions in Peshawar.

## How it works

Open `index.html`. The schemes tab is prefilled with the 6 sample packages, cheapest verified first. The cost tab is prefilled with the government long package at Rs 10,75,000 per person for 2 people, hidden costs revealed — the real total is Rs 23,45,000. The balloting tab counts down 10 days to the 5 Dec 2026 draw and shows Rafiq's application HAJ-2026-4812 in balloting. The verifier tab checks HGO-2026-114 as verified, runs the scam spotter, and shows the 5-of-8 checklist with the training schedule.

The fix is in the app: show the real price before anyone pays it; show the balloting status and the draw countdown instead of silence; let anyone check a licence in seconds; and keep the whole document and vaccination checklist in one place that remembers where you left off. And the hidden costs are shown as a list with a total, so the real price is never a surprise at the airport.

The code is split the way a small real app would be: `data.js` holds the sample data, `logic.js` holds the pure rules (no DOM, unit-tested in Node), and `app.js` only wires the page. The checklist, scam-spotter answers, package price, traveller count and hidden-cost toggle are saved in `localStorage`, so they survive a reload; "Reset demo data" restores the sample figures. Run the tests with `node test.js` (unit smoke test) and `node dom-smoke.js` (DOM smoke test in a fake DOM).

## What you can learn from this project

- **Separating data, logic and rendering.** `data.js` is just facts; `logic.js` is pure functions you can test without a browser; `app.js` only touches the page. Change a package price in one place and every tab agrees.
- **A lookup with five honest answers.** A licence can be verified, flagged fraud, valid but unknown, malformed, or empty — the demo answers each one differently instead of showing the same "not found" for all five. Honest edge cases make a product feel trustworthy.
- **The cheapest option is the cheapest *verified* option.** The fraud scheme at Rs 8,50,000 is cheaper than every real package — so the "cheapest" function filters by verified status first, then by price. A price comparison that ignores trust is a trap, not a feature.
- **Hidden costs as a list, not a footnote.** Six named costs with amounts add up to Rs 97,500 per person, and the calculator shows the gap (Rs 1,95,000 for a family of two) as its own number. When a cost is itemised, it can be planned for.
- **A countdown from two dates, not a ticking clock.** The draw is 10 days away because 5 Dec 2026 minus 25 Nov 2026 is 10 days, computed from ISO dates as UTC midnights — so the count is the same in every timezone and never drifts.
- **A checklist as a set of keys.** Ticking an item flips one key in a small object — `flu: true` — and the progress (5 of 8, 63%) is computed from that object, so the page, the progress line and the saved state can never disagree.
- **A quiz that explains, not just scores.** Every scam-spotter answer shows its reason right under the question, so a wrong answer teaches instead of just failing. The score is the summary; the reasons are the lesson.
- **localStorage as a tiny database.** The checklist, the scam answers, the price and the traveller count persist across reloads with a few lines of `JSON.parse` / `JSON.stringify` — no server, no account, no backend.
- **A fake DOM for testing.** `dom-smoke.js` runs the real `app.js` in Node against a stub `document`, so the page logic is tested without opening a browser.
- **Sample data, labelled everywhere.** Every scheme, price, licence, application, agent and checklist item is invented and says so on the page. A demo that looks real must never pretend to be real.

## Sample-data honesty note

All schemes, prices, licences, applications, agents and checklist items in this demo are invented for a UX concept. The government-scheme figure (Rs 10,75,000 per person) is a sample figure for this concept, not the official 2026 package cost. No real CNIC numbers and no phone numbers appear anywhere. This is an unofficial UX concept by Muhammad Abbas Khan, not a Hajj operator, not a travel agent and not the Ministry of Religious Affairs.

## Fork it and make it yours

This pattern fits any "compare the real price, check the licence, track the application" problem — Umrah packages, student visas, overseas jobs, or any government balloting scheme. Fork the repo, swap the scheme table in `data.js`, and adapt the verifier to your own local problem. If you build something with it, I would love to see it — abbasmomand98@gmail.com.
