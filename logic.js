// HajjPak — pure logic, no DOM here, so it can be unit-tested in Node.
(function (root) {
  // Pakistani (Indian-system) grouping, matching the figures used in
  // the mockups, slides and copy: 1075000 -> "10,75,000",
  // 2150000 -> "21,50,000", 97500 -> "97,500", 2345000 -> "23,45,000".
  // Last three digits, then groups of two.
  function formatPKR(n) {
    var s = String(Math.round(n));
    if (s.length <= 3) return s;
    var last3 = s.slice(-3);
    var rest = s.slice(0, -3);
    var parts = [];
    while (rest.length > 2) { parts.unshift(rest.slice(-2)); rest = rest.slice(0, -2); }
    if (rest) parts.unshift(rest);
    return parts.join(",") + "," + last3;
  }

  // ---- Schemes ----
  // Cheapest VERIFIED scheme overall — the government long package at
  // Rs 10,75,000. Fraud schemes (HGO-2026-077) never win, however cheap.
  function cheapestVerified(schemes) {
    var best = null;
    schemes.forEach(function (s) {
      if (s.status === "VERIFIED" && (!best || s.price < best.price)) best = s;
    });
    return best;
  }
  function cheapestVerifiedPrivate(schemes) {
    var best = null;
    schemes.forEach(function (s) {
      if (s.status === "VERIFIED" && s.kind === "Private" &&
          (!best || s.price < best.price)) best = s;
    });
    return best;
  }
  function verifiedSchemes(schemes) {
    return schemes.filter(function (s) { return s.status === "VERIFIED"; });
  }
  function fraudSchemes(schemes) {
    return schemes.filter(function (s) { return s.status === "FRAUD"; });
  }
  function findScheme(schemes, id) {
    var q = String(id || "").trim().toUpperCase();
    var found = null;
    schemes.forEach(function (s) { if (s.id.toUpperCase() === q) found = s; });
    return found;
  }
  // Search schemes by operator, city, name or ID, case-insensitive.
  //   "peshawar" -> GOV-2026-LONG, GOV-2026-SHORT, HGO-2026-114.
  //   "private" -> the 4 private schemes. "" -> all schemes.
  function filterSchemes(schemes, query) {
    var q = String(query || "").trim().toLowerCase();
    if (!q) return schemes.slice();
    return schemes.filter(function (s) {
      return (s.operator + " " + s.name + " " + s.city + " " + s.id + " " + s.kind)
        .toLowerCase().indexOf(q) !== -1;
    });
  }
  // Sort schemes: cheapest first, most expensive first, or by kind
  // (government first, then private). A FRAUD scheme is never the
  // "cheapest" deal: in the cheapest and kind sorts it always goes
  // last, however low its price is. Only the expensive sort (a raw
  // price ranking) leaves it where its price puts it — last.
  function sortSchemes(schemes, mode) {
    var copy = schemes.slice();
    function fraudLast(a, b) {
      var fa = a.status === "FRAUD" ? 1 : 0;
      var fb = b.status === "FRAUD" ? 1 : 0;
      return fa - fb;
    }
    if (mode === "expensive") {
      copy.sort(function (a, b) { return b.price - a.price; });
    } else if (mode === "kind") {
      var rank = { "Government": 0, "Private": 1 };
      copy.sort(function (a, b) {
        var ra = rank.hasOwnProperty(a.kind) ? rank[a.kind] : 9;
        var rb = rank.hasOwnProperty(b.kind) ? rank[b.kind] : 9;
        var r = ra - rb;
        if (r !== 0) return r;
        var f = fraudLast(a, b);
        return f !== 0 ? f : a.price - b.price;
      });
    } else {
      copy.sort(function (a, b) {
        var f = fraudLast(a, b);
        return f !== 0 ? f : a.price - b.price;
      });
    }
    return copy;
  }
  function countByKind(schemes) {
    var out = { "Government": 0, "Private": 0 };
    schemes.forEach(function (s) {
      if (out.hasOwnProperty(s.kind)) out[s.kind]++;
    });
    out.total = schemes.length;
    return out;
  }

  // ---- Family cost calculator ----
  // Hidden costs per person, summed from the hidden-costs table.
  //   45,000 + 25,000 + 8,000 + 3,500 + 6,000 + 10,000 = 97,500.
  function hiddenCostTotal(hiddenCosts) {
    var t = 0;
    hiddenCosts.forEach(function (h) { t += Number(h.amount) || 0; });
    return t;
  }
  // Family cost: base package x people, plus hidden costs per person
  // when the user chooses to reveal them.
  //   Govt long, 2 people, hidden revealed:
  //   base 21,50,000 + hidden 1,95,000 = real total 23,45,000.
  //   Govt long, 2 people, hidden hidden: base 21,50,000.
  //   Govt long, 1 person, hidden revealed: 10,75,000 + 97,500 = 11,72,500.
  function familyCost(perPerson, people, hiddenPerPerson, includeHidden) {
    var n = Math.max(0, Math.floor(Number(people) || 0));
    var base = Math.max(0, Number(perPerson) || 0) * n;
    var hidden = includeHidden ? Math.max(0, Number(hiddenPerPerson) || 0) * n : 0;
    return { people: n, perPerson: Math.max(0, Number(perPerson) || 0),
             base: base, hidden: hidden, total: base + hidden,
             perPersonTotal: Math.max(0, Number(perPerson) || 0) +
               (includeHidden ? Math.max(0, Number(hiddenPerPerson) || 0) : 0) };
  }
  // How much more the real total is than the quoted package price.
  //   Family of 2, govt long: 23,45,000 - 21,50,000 = 1,95,000.
  function hiddenGap(cost) {
    return cost.total - cost.base;
  }

  // ---- Balloting ----
  // Days from today to the draw, from ISO dates. Both dates are parsed
  // as UTC midnights so timezones cannot shift the count.
  //   2026-11-25 -> 2026-12-05 = 10 days.
  //   2026-12-05 -> 2026-12-05 = 0 days (draw day).
  //   2026-12-06 -> 2026-12-05 = -1 (the draw has happened).
  function daysUntilDraw(todayISO, drawISO) {
    function parse(iso) {
      var p = String(iso).split("-");
      return Date.UTC(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    }
    var ms = parse(drawISO) - parse(todayISO);
    return Math.round(ms / 86400000);
  }
  // Application ID format: HAJ-YYYY-NNNN, e.g. HAJ-2026-4812.
  function validApplicationId(raw) {
    return /^HAJ-\d{4}-\d{4}$/.test(String(raw || "").trim().toUpperCase());
  }
  function findApplication(apps, raw) {
    var q = String(raw || "").trim().toUpperCase();
    if (!validApplicationId(q)) return null;
    var found = null;
    apps.forEach(function (a) {
      if (a.no.toUpperCase() === q) found = a;
    });
    return found;
  }
  // Application lookup: found, valid but unknown, malformed, or empty.
  //   "HAJ-2026-4812" -> { kind: "found", app: Rafiq }.
  //   "HAJ-2026-9999" -> { kind: "not-found" }.
  //   "4812" -> { kind: "invalid" }.
  function lookupApplication(apps, raw) {
    var q = String(raw || "").trim();
    if (!q) return { kind: "empty" };
    if (!validApplicationId(q)) return { kind: "invalid" };
    var found = findApplication(apps, q);
    if (!found) return { kind: "not-found" };
    return { kind: "found", app: found };
  }
  function countByStatus(apps) {
    var out = {};
    apps.forEach(function (a) {
      out[a.status] = (out[a.status] || 0) + 1;
    });
    out.total = apps.length;
    return out;
  }

  // ---- Agent licence verifier ----
  // Licence format: HGO-YYYY-NNN, e.g. HGO-2026-114.
  function validLicenceId(raw) {
    return /^HGO-\d{4}-\d{3}$/.test(String(raw || "").trim().toUpperCase());
  }
  function findAgent(agents, raw) {
    var q = String(raw || "").trim().toUpperCase();
    if (!validLicenceId(q)) return null;
    var found = null;
    agents.forEach(function (a) {
      if (a.licence.toUpperCase() === q) found = a;
    });
    return found;
  }
  // Licence check: verified, fraud, not in the sample register,
  // malformed, or empty — five different answers, not one "not found".
  //   "HGO-2026-114" -> { kind: "verified", agent: Al-Noor }.
  //   "HGO-2026-077" -> { kind: "fraud", agent: Quick Hajj Deals }.
  //   "HGO-2026-999" -> { kind: "not-found" }.
  //   "114" -> { kind: "invalid" }.
  function verifyAgent(agents, raw) {
    var q = String(raw || "").trim();
    if (!q) return { kind: "empty" };
    if (!validLicenceId(q)) return { kind: "invalid" };
    var found = findAgent(agents, q);
    if (!found) return { kind: "not-found" };
    if (found.status === "FRAUD") return { kind: "fraud", agent: found };
    return { kind: "verified", agent: found };
  }

  // ---- Scam spotter ----
  // answers is an object keyed by flag id -> "flag" or "safe".
  //   All 6 right -> 6 of 6. Nothing answered -> 0 of 6.
  function scamScore(flags, answers) {
    var correct = 0, answered = 0;
    flags.forEach(function (f) {
      var a = answers[f.id];
      if (a === "flag" || a === "safe") {
        answered++;
        if (a === f.answer) correct++;
      }
    });
    return { correct: correct, answered: answered, total: flags.length,
             text: correct + " of " + flags.length + " right",
             allRight: correct === flags.length && answered === flags.length };
  }

  // ---- Document checklist ----
  // done is an object keyed by checklist id -> true/false.
  //   Rafiq's defaults: 5 of 8 done (62%).
  function checklistProgress(items, done) {
    var n = 0;
    items.forEach(function (it) { if (done[it.id]) n++; });
    var pct = items.length ? Math.round(n / items.length * 100) : 0;
    return { done: n, total: items.length, pct: pct,
             text: n + " of " + items.length + " done",
             allDone: n === items.length && items.length > 0 };
  }
  function checklistKey(id) { return String(id); }
  function toggleChecklist(done, id) {
    var out = {};
    Object.keys(done).forEach(function (k) { out[k] = done[k]; });
    if (out[id]) delete out[id];
    else out[id] = true;
    return out;
  }
  function pendingItems(items, done) {
    return items.filter(function (it) { return !done[it.id]; });
  }

  // ---- Training ----
  // Sessions on or after today, in date order.
  function upcomingTraining(trainings, todayISO) {
    return trainings.filter(function (t) { return t.date >= todayISO; })
      .slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
  }

  var api = { formatPKR: formatPKR,
              cheapestVerified: cheapestVerified,
              cheapestVerifiedPrivate: cheapestVerifiedPrivate,
              verifiedSchemes: verifiedSchemes,
              fraudSchemes: fraudSchemes,
              findScheme: findScheme,
              filterSchemes: filterSchemes,
              sortSchemes: sortSchemes,
              countByKind: countByKind,
              hiddenCostTotal: hiddenCostTotal,
              familyCost: familyCost,
              hiddenGap: hiddenGap,
              daysUntilDraw: daysUntilDraw,
              validApplicationId: validApplicationId,
              findApplication: findApplication,
              lookupApplication: lookupApplication,
              countByStatus: countByStatus,
              validLicenceId: validLicenceId,
              findAgent: findAgent,
              verifyAgent: verifyAgent,
              scamScore: scamScore,
              checklistProgress: checklistProgress,
              checklistKey: checklistKey,
              toggleChecklist: toggleChecklist,
              pendingItems: pendingItems,
              upcomingTraining: upcomingTraining };
  if (typeof module !== "undefined") { module.exports = api; }
  else { root.HajjPakLogic = api; }
})(typeof window !== "undefined" ? window : globalThis);
