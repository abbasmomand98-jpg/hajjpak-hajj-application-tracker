// HajjPak smoke tests — run with: node test.js
// Every canonical figure used in the mockups, slides and copy is asserted here.
var assert = require("assert");
var fs = require("fs");
var data = require("./data.js");
var L = require("./logic.js");

var n = 0;

function eq(a, b, msg) { assert.strictEqual(a, b, msg); n++; }
function ok(v, msg) { assert.ok(v, msg); n++; }
function deep(a, b, msg) { assert.deepStrictEqual(a, b, msg); n++; }

// 1. Data shape: 6 schemes, 4 agents, 5 applications, 6 hidden costs,
//    8 checklist items, 3 training sessions, 6 scam statements.
eq(data.SCHEMES.length, 6, "there are 6 sample schemes");
eq(data.AGENTS.length, 4, "there are 4 sample agents");
eq(data.APPLICATIONS.length, 5, "there are 5 sample applications");
eq(data.HIDDEN_COSTS.length, 6, "there are 6 hidden costs");
eq(data.CHECKLIST.length, 8, "there are 8 checklist items");
eq(data.TRAINING.length, 3, "there are 3 training sessions");
eq(data.SCAM_FLAGS.length, 6, "there are 6 scam-spotter statements");
eq(data.PERSONA.people, 2, "Rafiq applies with his wife — 2 people");
eq(data.PERSONA.applicationNo, "HAJ-2026-4812", "Rafiq's application is HAJ-2026-4812");
eq(data.APPLICATION.drawDate, "2026-12-05", "the balloting draw is 5 Dec 2026");
eq(data.APPLICATION.drawLabel, "5 Dec 2026", "the draw label is 5 Dec 2026");

// 2. PKR formatting (Indian-system grouping).
eq(L.formatPKR(1075000), "10,75,000", "Rs 10,75,000 formats as 10,75,000");
eq(L.formatPKR(2150000), "21,50,000", "Rs 21,50,000 formats as 21,50,000");
eq(L.formatPKR(97500), "97,500", "Rs 97,500 formats as 97,500");
eq(L.formatPKR(2345000), "23,45,000", "Rs 23,45,000 formats as 23,45,000");
eq(L.formatPKR(1150000), "11,50,000", "Rs 11,50,000 formats as 11,50,000");
eq(L.formatPKR(1450000), "14,50,000", "Rs 14,50,000 formats as 14,50,000");
eq(L.formatPKR(850000), "8,50,000", "Rs 8,50,000 formats as 8,50,000");
eq(L.formatPKR(0), "0", "zero formats as 0");

// 3. Cheapest verified — fraud never wins.
var cheapest = L.cheapestVerified(data.SCHEMES);
eq(cheapest.id, "GOV-2026-LONG", "cheapest verified is the government long package");
eq(cheapest.price, 1075000, "cheapest verified costs Rs 10,75,000");
var cheapestPrivate = L.cheapestVerifiedPrivate(data.SCHEMES);
eq(cheapestPrivate.id, "HGO-2026-118", "cheapest verified private is Makkah Travels");
eq(cheapestPrivate.price, 1150000, "cheapest verified private costs Rs 11,50,000");
eq(L.verifiedSchemes(data.SCHEMES).length, 5, "5 schemes are verified");
eq(L.fraudSchemes(data.SCHEMES).length, 1, "1 scheme is flagged fraud");
eq(L.fraudSchemes(data.SCHEMES)[0].id, "HGO-2026-077", "the fraud scheme is Quick Hajj Deals");
eq(L.findScheme(data.SCHEMES, "hgo-2026-114").operator, "Al-Noor Hajj Services", "lookup is case-insensitive");
eq(L.findScheme(data.SCHEMES, "GOV-2026-999"), null, "an unknown scheme finds nothing");

// 4. Scheme search.
eq(L.filterSchemes(data.SCHEMES, "peshawar").length, 3, "3 schemes are in Peshawar");
eq(L.filterSchemes(data.SCHEMES, "private").length, 4, "4 schemes are private");
eq(L.filterSchemes(data.SCHEMES, "government").length, 2, "2 schemes are government");
eq(L.filterSchemes(data.SCHEMES, "HGO-2026-114").length, 1, "searching the licence finds 1 scheme");
eq(L.filterSchemes(data.SCHEMES, "").length, 6, "an empty search returns all 6 schemes");
eq(L.filterSchemes(data.SCHEMES, "karachi").length, 1, "1 scheme is in Karachi");
eq(L.filterSchemes(data.SCHEMES, "zzz").length, 0, "a nonsense search finds nothing");

// 5. Scheme sorting and counts.
var byCheap = L.sortSchemes(data.SCHEMES, "cheapest");
eq(byCheap[0].id, "GOV-2026-LONG", "cheapest first is the government long package");
eq(byCheap[1].id, "HGO-2026-118", "second cheapest is Makkah Travels at Rs 11,50,000");
eq(byCheap[byCheap.length - 1].id, "HGO-2026-077", "the fraud scheme sorts last, never first, however cheap");
var byExp = L.sortSchemes(data.SCHEMES, "expensive");
eq(byExp[0].id, "HGO-2026-121", "most expensive first is Rahbar at Rs 14,50,000");
eq(byExp[byExp.length - 1].id, "HGO-2026-077", "cheapest last is the fraud scheme at Rs 8,50,000");
var byKind = L.sortSchemes(data.SCHEMES, "kind");
eq(byKind[0].kind, "Government", "government schemes sort first");
eq(byKind[2].kind, "Private", "private schemes sort after government");
var counts = L.countByKind(data.SCHEMES);
eq(counts.total, 6, "6 schemes in total");
eq(counts["Government"], 2, "2 government schemes");
eq(counts["Private"], 4, "4 private schemes");

// 6. Hidden costs add up.
eq(L.hiddenCostTotal(data.HIDDEN_COSTS), 97500, "hidden costs total Rs 97,500 per person");
eq(L.hiddenCostTotal([]), 0, "no hidden costs means Rs 0");

// 7. Family cost — Rafiq and Amina's canonical figures.
var family = L.familyCost(1075000, 2, 97500, true);
eq(family.base, 2150000, "family of 2: package price Rs 21,50,000");
eq(family.hidden, 195000, "family of 2: hidden costs Rs 1,95,000");
eq(family.total, 2345000, "family of 2: real total Rs 23,45,000");
eq(family.perPersonTotal, 1172500, "real total per person is Rs 11,72,500");
eq(L.hiddenGap(family), 195000, "the hidden gap for a family of 2 is Rs 1,95,000");
var hiddenOff = L.familyCost(1075000, 2, 97500, false);
eq(hiddenOff.total, 2150000, "hidden costs off: total is the package price Rs 21,50,000");
eq(hiddenOff.hidden, 0, "hidden costs off: hidden is Rs 0");
var one = L.familyCost(1075000, 1, 97500, true);
eq(one.total, 1172500, "1 person with hidden costs is Rs 11,72,500");
var none = L.familyCost(1075000, 0, 97500, true);
eq(none.total, 0, "0 people cost nothing");
var priv = L.familyCost(1150000, 2, 97500, true);
eq(priv.total, 2495000, "cheapest private for 2, real total Rs 24,95,000");

// 8. Balloting countdown.
eq(L.daysUntilDraw("2026-11-25", "2026-12-05"), 10, "25 Nov to 5 Dec is 10 days");
eq(L.daysUntilDraw("2026-12-05", "2026-12-05"), 0, "draw day is 0 days away");
eq(L.daysUntilDraw("2026-12-06", "2026-12-05"), -1, "the day after the draw is -1");
eq(L.daysUntilDraw("2026-11-18", "2026-12-05"), 17, "application day 18 Nov to the draw is 17 days");

// 9. Application IDs and lookup.
ok(L.validApplicationId("HAJ-2026-4812"), "HAJ-2026-4812 is a valid application number");
ok(L.validApplicationId("haj-2026-4812"), "a lowercase application number is valid");
ok(!L.validApplicationId("4812"), "'4812' is not an application number");
ok(!L.validApplicationId("HAJ-2026-481"), "a three-digit number is not an application number");
ok(!L.validApplicationId(""), "an empty string is not an application number");
var rafiq = L.findApplication(data.APPLICATIONS, "HAJ-2026-4812");
eq(rafiq.applicant, "Haji Muhammad Rafiq", "HAJ-2026-4812 belongs to Rafiq");
eq(rafiq.status, "IN BALLOTING", "Rafiq is in balloting");
eq(L.findApplication(data.APPLICATIONS, "haj-2026-2091").status, "SELECTED", "lookup is case-insensitive");
eq(L.findApplication(data.APPLICATIONS, "HAJ-2026-9999"), null, "HAJ-2026-9999 finds no application");
eq(L.lookupApplication(data.APPLICATIONS, "HAJ-2026-4812").kind, "found", "HAJ-2026-4812 lookup is found");
eq(L.lookupApplication(data.APPLICATIONS, "HAJ-2026-9999").kind, "not-found", "HAJ-2026-9999 lookup is not-found");
eq(L.lookupApplication(data.APPLICATIONS, "4812").kind, "invalid", "'4812' lookup is invalid");
eq(L.lookupApplication(data.APPLICATIONS, "").kind, "empty", "an empty lookup is empty");
eq(L.lookupApplication(data.APPLICATIONS, "  HAJ-2026-3320  ").app.status, "NOT SELECTED", "lookup trims spaces");
var appCounts = L.countByStatus(data.APPLICATIONS);
eq(appCounts.total, 5, "5 applications in total");
eq(appCounts["IN BALLOTING"], 2, "2 applications are in balloting");
eq(appCounts["SELECTED"], 1, "1 application is selected");
eq(appCounts["NOT SELECTED"], 1, "1 application is not selected");
eq(appCounts["WAITLISTED"], 1, "1 application is waitlisted");

// 10. Licence IDs and the verifier.
ok(L.validLicenceId("HGO-2026-114"), "HGO-2026-114 is a valid licence number");
ok(L.validLicenceId("hgo-2026-114"), "a lowercase licence number is valid");
ok(!L.validLicenceId("114"), "'114' is not a licence number");
ok(!L.validLicenceId("HGO-2026-11"), "a two-digit number is not a licence number");
ok(!L.validLicenceId(""), "an empty string is not a licence number");
var alnoor = L.findAgent(data.AGENTS, "HGO-2026-114");
eq(alnoor.operator, "Al-Noor Hajj Services", "HGO-2026-114 is Al-Noor Hajj Services");
eq(alnoor.city, "Peshawar", "Al-Noor is in Peshawar");
eq(L.findAgent(data.AGENTS, "hgo-2026-118").operator, "Makkah Travels", "lookup is case-insensitive");
eq(L.findAgent(data.AGENTS, "HGO-2026-999"), null, "HGO-2026-999 finds no agent");
eq(L.verifyAgent(data.AGENTS, "HGO-2026-114").kind, "verified", "HGO-2026-114 verifies");
eq(L.verifyAgent(data.AGENTS, "HGO-2026-118").kind, "verified", "HGO-2026-118 verifies");
eq(L.verifyAgent(data.AGENTS, "HGO-2026-121").kind, "verified", "HGO-2026-121 verifies");
eq(L.verifyAgent(data.AGENTS, "HGO-2026-077").kind, "fraud", "HGO-2026-077 is flagged fraud");
eq(L.verifyAgent(data.AGENTS, "HGO-2026-077").agent.operator, "Quick Hajj Deals", "the fraud operator is Quick Hajj Deals");
eq(L.verifyAgent(data.AGENTS, "HGO-2026-999").kind, "not-found", "HGO-2026-999 is not in the register");
eq(L.verifyAgent(data.AGENTS, "114").kind, "invalid", "'114' is an invalid licence");
eq(L.verifyAgent(data.AGENTS, "").kind, "empty", "an empty licence is empty");
eq(L.verifyAgent(data.AGENTS, "  HGO-2026-114  ").agent.city, "Peshawar", "verification trims spaces");

// 11. Scam spotter scoring.
var allRight = { cash: "flag", cheap: "flag", guarantee: "flag",
  nolicence: "flag", verified: "safe", contract: "safe" };
var s1 = L.scamScore(data.SCAM_FLAGS, allRight);
eq(s1.correct, 6, "all six answers right scores 6");
eq(s1.text, "6 of 6 right", "the score text is '6 of 6 right'");
ok(s1.allRight, "all right is true when all six are right");
var s2 = L.scamScore(data.SCAM_FLAGS, { cash: "flag", cheap: "safe" });
eq(s2.correct, 1, "one right answer scores 1");
eq(s2.answered, 2, "two answers were given");
ok(!s2.allRight, "all right is false with answers missing");
var s3 = L.scamScore(data.SCAM_FLAGS, {});
eq(s3.correct, 0, "no answers scores 0");
eq(s3.answered, 0, "no answers were given");

// 12. Checklist progress — Rafiq's 5 of 8.
var defaults = {};
data.CHECKLIST.forEach(function (it) { if (it.done) defaults[it.id] = true; });
var prog = L.checklistProgress(data.CHECKLIST, defaults);
eq(prog.done, 5, "5 of 8 checklist items are done");
eq(prog.total, 8, "the checklist has 8 items");
eq(prog.pct, 63, "5 of 8 is 63%");
eq(prog.text, "5 of 8 done", "the progress text is '5 of 8 done'");
ok(!prog.allDone, "the checklist is not all done");
eq(L.pendingItems(data.CHECKLIST, defaults).length, 3, "3 items are still pending");
eq(L.pendingItems(data.CHECKLIST, defaults)[0].id, "flu", "the first pending item is the flu vaccination");
var allDone = {};
data.CHECKLIST.forEach(function (it) { allDone[it.id] = true; });
ok(L.checklistProgress(data.CHECKLIST, allDone).allDone, "all 8 ticked is all done");
eq(L.checklistProgress(data.CHECKLIST, {}).done, 0, "nothing ticked is 0 done");
var toggled = L.toggleChecklist(defaults, "flu");
ok(toggled.flu, "toggling the flu vaccination ticks it");
eq(L.checklistProgress(data.CHECKLIST, toggled).done, 6, "toggling flu makes 6 of 8");
toggled = L.toggleChecklist(toggled, "flu");
ok(!toggled.flu, "toggling again unticks it");
eq(L.checklistKey("passport"), "passport", "the checklist key is the item id");

// 13. Training sessions.
var upcoming = L.upcomingTraining(data.TRAINING, "2026-11-25");
eq(upcoming.length, 3, "3 training sessions are upcoming on 25 Nov");
eq(upcoming[0].title, "Hajj rites briefing", "the first session is the rites briefing");
eq(upcoming[2].title, "Travel & packing briefing", "the last session is travel & packing");
eq(L.upcomingTraining(data.TRAINING, "2026-12-07").length, 1, "after 6 Dec only 1 session is left");
eq(L.upcomingTraining(data.TRAINING, "2026-12-14").length, 0, "after 13 Dec no sessions are left");

// 14. Canonical persona, application and balloting note.
eq(data.PERSONA.name, "Haji Muhammad Rafiq", "the persona is Haji Muhammad Rafiq");
eq(data.PERSONA.city, "Peshawar", "Rafiq is from Peshawar");
eq(data.PERSONA.perPerson, 1075000, "the government scheme is Rs 10,75,000 per person");
eq(data.PERSONA.familyTotal, 2150000, "the family total is Rs 21,50,000");
eq(data.APPLICATION.no, "HAJ-2026-4812", "the application number is HAJ-2026-4812");
eq(data.APPLICATION.status, "IN BALLOTING", "the application is in balloting");
ok(data.BALLOTING_NOTE.indexOf("5 Dec 2026") !== -1, "the balloting note names 5 Dec 2026");
ok(data.BALLOTING_NOTE.indexOf("10 days") !== -1, "the balloting note names 10 days");

// 15. The demo's source files all exist.
["index.html", "style.css", "data.js", "logic.js", "app.js"].forEach(function (f) {
  ok(fs.existsSync(f), f + " exists");
});

console.log("\n" + n + " unit assertions passed.");
