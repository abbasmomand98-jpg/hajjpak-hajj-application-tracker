// HajjPak — Hajj Application & Package Tracker (UX Concept).
// IMPORTANT: every scheme, price, licence, application, agent and
// checklist item below is SAMPLE data invented for this UX concept demo.
// These are NOT real schemes, real agents, real applicants or real
// prices. The government-scheme figure (Rs 10,75,000 per person) is a
// sample figure for this concept, not the official 2026 package cost.
// No real CNIC numbers and no phone numbers appear anywhere.

// PERSONA: Haji Muhammad Rafiq, 58, Peshawar, applying with his wife
// Amina, 52, for Hajj 2026 under the government scheme.
// Illustrative proto-persona — a design hypothesis, not an interviewed
// participant.
var PERSONA = { name: "Haji Muhammad Rafiq", age: 58, city: "Peshawar",
  wife: "Amina", wifeAge: 52, scheme: "Government scheme \u2014 long package",
  applicationNo: "HAJ-2026-4812", people: 2,
  perPerson: 1075000, familyTotal: 2150000 };

// APPLICATION — Rafiq's sample application for Hajj 2026.
var APPLICATION = { no: "HAJ-2026-4812", applicant: "Haji Muhammad Rafiq",
  wifeNo: "HAJ-2026-4813", wife: "Amina", scheme: "Government scheme \u2014 long",
  status: "IN BALLOTING", submittedOn: "18 Nov 2026",
  drawDate: "2026-12-05", drawLabel: "5 Dec 2026",
  city: "Peshawar", bank: "Bank of Khyber \u2014 University Road branch" };

// SCHEMES — 6 sample Hajj 2026 packages. Government schemes go through
// balloting; private schemes go through a licensed operator (HGO licence).
//   Govt long: Rs 10,75,000 per person, 38-40 days — cheapest verified.
//   Govt short: Rs 11,75,000 per person, 20-25 days.
//   Private verified: Rs 11,50,000 to Rs 14,50,000 per person.
//   HGO-2026-077 "Quick Hajj Deals" at Rs 8,50,000 is flagged FRAUD:
//   far below the government scheme, no verified licence.
var SCHEMES = [
  { id: "GOV-2026-LONG", kind: "Government", operator: "Government of Pakistan \u2014 Ministry of Religious Affairs",
    name: "Government scheme \u2014 long package", price: 1075000, days: "38\u201340 days",
    city: "Peshawar", status: "VERIFIED", balloting: true,
    stay: "Makkah + Madinah \u00b7 shared room \u00b7 meals included",
    note: "Cheapest verified package \u2014 balloting draw 5 Dec 2026." },
  { id: "GOV-2026-SHORT", kind: "Government", operator: "Government of Pakistan \u2014 Ministry of Religious Affairs",
    name: "Government scheme \u2014 short package", price: 1175000, days: "20\u201325 days",
    city: "Peshawar", status: "VERIFIED", balloting: true,
    stay: "Makkah + Madinah \u00b7 shared room \u00b7 meals included",
    note: "Same government scheme, fewer days away from home." },
  { id: "HGO-2026-118", kind: "Private", operator: "Makkah Travels",
    name: "Makkah Travels \u2014 30-day package", price: 1150000, days: "30 days",
    city: "Lahore", status: "VERIFIED", balloting: false,
    stay: "Makkah + Madinah \u00b7 4-star hotel \u00b7 meals included",
    note: "Cheapest verified private package." },
  { id: "HGO-2026-114", kind: "Private", operator: "Al-Noor Hajj Services",
    name: "Al-Noor Hajj Services \u2014 28-day package", price: 1250000, days: "28 days",
    city: "Peshawar", status: "VERIFIED", balloting: false,
    stay: "Makkah + Madinah \u00b7 4-star hotel \u00b7 meals included",
    note: "Rafiq's local operator in Peshawar \u2014 licence verified." },
  { id: "HGO-2026-121", kind: "Private", operator: "Rahbar Hajj Group",
    name: "Rahbar Hajj Group \u2014 21-day package", price: 1450000, days: "21 days",
    city: "Karachi", status: "VERIFIED", balloting: false,
    stay: "Makkah + Madinah \u00b7 5-star hotel \u00b7 meals included",
    note: "Premium private package \u2014 shortest stay, highest price." },
  { id: "HGO-2026-077", kind: "Private", operator: "Quick Hajj Deals",
    name: "Quick Hajj Deals \u2014 25-day package", price: 850000, days: "25 days",
    city: "Islamabad", status: "FRAUD", balloting: false,
    stay: "No hotel named \u00b7 no meals named \u00b7 cash in advance",
    note: "FLAGGED FRAUD \u2014 Rs 8,50,000 is far below the government scheme. Do not pay." }
];

// AGENTS — the licence register behind the verifier. Only the three
// VERIFIED licences and the one FRAUD licence are in this sample list;
// any other well-formed licence is "not found" in the sample register.
var AGENTS = [
  { licence: "HGO-2026-114", operator: "Al-Noor Hajj Services", city: "Peshawar",
    status: "VERIFIED", since: "2019", packages: 3,
    note: "Licence verified \u00b7 registered Hajj group organiser." },
  { licence: "HGO-2026-118", operator: "Makkah Travels", city: "Lahore",
    status: "VERIFIED", since: "2017", packages: 4,
    note: "Licence verified \u00b7 registered Hajj group organiser." },
  { licence: "HGO-2026-121", operator: "Rahbar Hajj Group", city: "Karachi",
    status: "VERIFIED", since: "2021", packages: 2,
    note: "Licence verified \u00b7 registered Hajj group organiser." },
  { licence: "HGO-2026-077", operator: "Quick Hajj Deals", city: "Islamabad",
    status: "FRAUD", since: "\u2014", packages: 0,
    note: "FLAGGED FRAUD \u2014 reported for taking advance cash and disappearing. Do not pay." }
];

// APPLICATIONS — 5 sample applications for Hajj 2026, to show the
// balloting tracker with more than one status.
var APPLICATIONS = [
  { no: "HAJ-2026-4812", applicant: "Haji Muhammad Rafiq", city: "Peshawar",
    scheme: "Government \u2014 long", status: "IN BALLOTING" },
  { no: "HAJ-2026-4813", applicant: "Amina", city: "Peshawar",
    scheme: "Government \u2014 long", status: "IN BALLOTING" },
  { no: "HAJ-2026-2091", applicant: "Abdul Qadir", city: "Lahore",
    scheme: "Government \u2014 short", status: "SELECTED" },
  { no: "HAJ-2026-3320", applicant: "Gul Bibi", city: "Karachi",
    scheme: "Government \u2014 long", status: "NOT SELECTED" },
  { no: "HAJ-2026-4105", applicant: "Imran Yousaf", city: "Islamabad",
    scheme: "Private \u2014 HGO-2026-118", status: "WAITLISTED" }
];

// HIDDEN COSTS — what the package price does NOT include, per person.
//   Qurbani Rs 45,000 + extra meals Rs 25,000 + airport transfers
//   Rs 8,000 + SIM & data Rs 3,500 + laundry Rs 6,000 + tips Rs 10,000
//   = Rs 97,500 per person. Family of 2: Rs 1,95,000 hidden.
//   Real total per person: Rs 11,72,500; family of 2: Rs 23,45,000.
var HIDDEN_COSTS = [
  { id: "qurbani", label: "Qurbani (sacrifice)", amount: 45000,
    note: "Not in the package \u2014 paid in Makkah." },
  { id: "meals", label: "Extra meals & snacks", amount: 25000,
    note: "Two meals a day are included; the third is yours." },
  { id: "transfers", label: "Airport transfers in Pakistan", amount: 8000,
    note: "Peshawar to Islamabad airport, both ways." },
  { id: "sim", label: "SIM & data in Saudi Arabia", amount: 3500,
    note: "So the family can reach you every day." },
  { id: "laundry", label: "Laundry for 40 days", amount: 6000,
    note: "Small amounts, every few days, for 40 days." },
  { id: "tips", label: "Tips & small help", amount: 10000,
    note: "Porters, guides and helpers along the way." }
];

// CHECKLIST — the document and vaccination checklist for Rafiq & Amina.
// 5 of 8 done on 25 Nov 2026; flu vaccination, COVID booster and the
// payment receipt are still pending.
var CHECKLIST = [
  { id: "passport", label: "Passport valid 8+ months", done: true,
    note: "Both passports valid until 2027." },
  { id: "cnic", label: "CNIC (both applicants)", done: true,
    note: "Rafiq and Amina \u2014 both verified." },
  { id: "photos", label: "Passport photos (8 each)", done: true,
    note: "White background, as required." },
  { id: "meningococcal", label: "Meningococcal vaccination", done: true,
    note: "Done at the Peshawar health camp, 12 Nov 2026." },
  { id: "flu", label: "Flu vaccination", done: false,
    note: "Booked at the health camp, 6 Dec 2026." },
  { id: "covid", label: "COVID booster", done: false,
    note: "Booked at the health camp, 6 Dec 2026." },
  { id: "mahram", label: "Mahram proof (wife travels with husband)", done: true,
    note: "Nikah nama attached to the application." },
  { id: "receipt", label: "Payment receipt / bank draft", done: false,
    note: "Due only if selected in the balloting draw." }
];

// TRAINING — sample Hajj training sessions in Peshawar.
var TRAINING = [
  { date: "2026-11-29", label: "29 Nov 2026", title: "Hajj rites briefing",
    place: "Peshawar \u2014 Haji Camp, University Road", time: "10:00 AM",
    note: "Ihram, Tawaf, Sa'i and the days of Hajj, step by step." },
  { date: "2026-12-06", label: "6 Dec 2026", title: "Health & vaccination camp",
    place: "Peshawar \u2014 Haji Camp, University Road", time: "9:00 AM",
    note: "Flu vaccination and COVID booster for both applicants." },
  { date: "2026-12-13", label: "13 Dec 2026", title: "Travel & packing briefing",
    place: "Peshawar \u2014 Haji Camp, University Road", time: "10:00 AM",
    note: "What to pack for 40 days, and what to leave at home." }
];

// SCAM SPOTTER — six statements. Four are red flags, two are safe signs.
// The demo asks the user to call each one FLAG or SAFE.
var SCAM_FLAGS = [
  { id: "cash", text: "The agent asks for cash in advance, with no receipt.",
    answer: "flag", why: "No receipt means no proof you ever paid. A real operator gives a receipt for every rupee." },
  { id: "cheap", text: "The package costs Rs 8,50,000 \u2014 far below the government scheme.",
    answer: "flag", why: "Rs 8,50,000 is Rs 2,25,000 below the government scheme. A package that cheap cannot cover the real costs \u2014 it is the classic fake-agent price." },
  { id: "guarantee", text: "The agent promises your name is guaranteed in the balloting.",
    answer: "flag", why: "Nobody can guarantee balloting \u2014 the draw is run by the government. A guarantee is a lie told to take your advance." },
  { id: "nolicence", text: "There is no licence number on the office board.",
    answer: "flag", why: "A registered Hajj group organiser must display its HGO licence number. No number means no registration \u2014 walk away." },
  { id: "verified", text: "The licence number checks out on the official list.",
    answer: "safe", why: "HGO-2026-114, HGO-2026-118 and HGO-2026-121 all verify in this demo. A licence that checks out is the first good sign." },
  { id: "contract", text: "You get a written contract with refund terms.",
    answer: "safe", why: "A written contract that says what happens if you are not selected is what a real operator offers. Always get it in writing." }
];

// BALLOTING NOTE — the draw note shown on the tracker.
var BALLOTING_NOTE = "The balloting draw for Hajj 2026 is on 5 Dec 2026 \u2014 10 days from today, 25 Nov 2026. Rafiq and Amina applied together under the government scheme, application HAJ-2026-4812.";

if (typeof module !== "undefined") {
  module.exports = { PERSONA: PERSONA, APPLICATION: APPLICATION,
    SCHEMES: SCHEMES, AGENTS: AGENTS, APPLICATIONS: APPLICATIONS,
    HIDDEN_COSTS: HIDDEN_COSTS, CHECKLIST: CHECKLIST,
    TRAINING: TRAINING, SCAM_FLAGS: SCAM_FLAGS,
    BALLOTING_NOTE: BALLOTING_NOTE };
}
