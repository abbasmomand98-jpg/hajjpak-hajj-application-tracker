// HajjPak — page wiring. All rules live in logic.js; this file only renders.
// "Today" is pinned to 2026-11-25 so the sample figures (the government
// scheme at Rs 10,75,000 per person, the family total of Rs 21,50,000,
// the 10 days to the 5 Dec 2026 balloting draw, and the 5 of 8 checklist
// items done) stay stable no matter when you open it.
(function () {
  var L = window.HajjPakLogic;
  var TODAY = "2026-11-25";
  var TODAY_LABEL = "25 Nov 2026";
  var DRAW_DATE = "2026-12-05";
  var STORE_CHECKLIST = "hajjpak-checklist";
  var STORE_SCAM = "hajjpak-scam";
  var STORE_SCHEME = "hajjpak-scheme";
  var STORE_PRICE = "hajjpak-price";
  var STORE_PEOPLE = "hajjpak-people";
  var STORE_HIDDEN = "hajjpak-hidden";

  function el(id) { return document.getElementById(id); }
  function rs(n) { return "Rs " + L.formatPKR(n); }

  function loadJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || "null") || fallback; }
    catch (e) { return fallback; }
  }
  function saveJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }
  var defaultChecklist = {};
  CHECKLIST.forEach(function (it) { if (it.done) defaultChecklist[it.id] = true; });
  var checklistDone = loadJSON(STORE_CHECKLIST, defaultChecklist);
  // Persist the initial checklist state so it survives a reload too.
  saveJSON(STORE_CHECKLIST, checklistDone);
  var scamAnswers = loadJSON(STORE_SCAM, {});
  var savedSchemeId = loadJSON(STORE_SCHEME, null);
  var savedPrice = loadJSON(STORE_PRICE, null);
  var savedPeople = loadJSON(STORE_PEOPLE, null);
  var savedHidden = loadJSON(STORE_HIDDEN, null);
  if (savedPrice !== null) el("cost-price-input").value = String(savedPrice);
  if (savedPeople !== null) el("cost-people-input").value = String(savedPeople);
  if (savedHidden !== null) el("cost-hidden-check").checked = !!savedHidden;

  // ---- Tabs ----
  var TABS = ["schemes", "cost", "balloting", "verify"];
  function showTab(name) {
    TABS.forEach(function (t) {
      el("section-" + t).style.display = (t === name) ? "block" : "none";
      el("tab-" + t).className = "tab-btn" + (t === name ? " active" : "");
    });
  }
  TABS.forEach(function (t) {
    el("tab-" + t).addEventListener("click", function () { showTab(t); });
  });
  showTab("schemes");

  // ---- Schemes ----
  function renderSchemes() {
    var q = el("scheme-search").value || "";
    var sort = el("scheme-sort").value || "cheapest";
    var rows = L.sortSchemes(L.filterSchemes(SCHEMES, q), sort);
    var box = el("scheme-list");
    box.innerHTML = "";
    rows.forEach(function (s) {
      var div = document.createElement("div");
      var isFraud = s.status === "FRAUD";
      var cls = isFraud ? "" : " best";
      div.className = "bundle" + cls;
      var badge = isFraud
        ? '<span class="badge-risk">FLAGGED FRAUD</span>'
        : (s.id === "GOV-2026-LONG"
          ? '<span class="badge-best">CHEAPEST VERIFIED</span>'
          : '<span class="badge-ok">\u2713 VERIFIED</span>');
      div.innerHTML = "<div><h3>" + s.id + " \u00b7 " + s.name + "</h3><p>" + s.operator +
        " \u00b7 " + s.city + " \u00b7 " + s.days + "</p><p>" + s.stay + "</p><p>" +
        s.note + "</p></div>" +
        '<div class="recv">' + rs(s.price) + "<span>per person</span>" + badge + "</div>";
      box.appendChild(div);
    });
    var counts = L.countByKind(SCHEMES);
    var cheapest = L.cheapestVerified(SCHEMES);
    var cheapestPrivate = L.cheapestVerifiedPrivate(SCHEMES);
    el("scheme-summary").textContent = "Showing " + rows.length + " of " + SCHEMES.length +
      " sample schemes \u00b7 " + counts["Government"] + " government, " +
      counts["Private"] + " private \u00b7 1 flagged fraud.";
    el("cheapest-box").innerHTML = '<div class="total"><strong>CHEAPEST VERIFIED \u2014 ' +
      cheapest.name.toUpperCase() + " \u00b7 " + rs(cheapest.price) + " PER PERSON</strong>" +
      "<p>Government scheme, long package, 38\u201340 days \u2014 balloting draw 5 Dec 2026. " +
      "Cheapest verified private package: " + cheapestPrivate.name + " \u00b7 " +
      rs(cheapestPrivate.price) + " per person. The Rs 8,50,000 \u201cbargain\u201d is flagged fraud \u2014 it is never the cheapest verified option.</p></div>";
    if (savedSchemeId) saveJSON(STORE_SCHEME, savedSchemeId);
  }
  renderSchemes();
  el("scheme-search").addEventListener("input", renderSchemes);
  el("scheme-sort").addEventListener("change", renderSchemes);

  // ---- Cost calculator ----
  function renderHiddenList() {
    var box = el("hidden-list");
    box.innerHTML = "";
    HIDDEN_COSTS.forEach(function (h) {
      var div = document.createElement("div");
      div.className = "bundle";
      div.innerHTML = "<div><h3>" + h.label + "</h3><p>" + h.note + "</p></div>" +
        '<div class="recv">' + rs(h.amount) + "<span>per person</span></div>";
      box.appendChild(div);
    });
    el("hidden-summary").textContent = "Hidden costs: " + rs(L.hiddenCostTotal(HIDDEN_COSTS)) +
      " per person \u00b7 " + rs(L.hiddenCostTotal(HIDDEN_COSTS) * 2) +
      " for Rafiq and Amina together.";
  }
  renderHiddenList();

  function renderCost() {
    var price = parseFloat(el("cost-price-input").value);
    var people = parseInt(el("cost-people-input").value, 10);
    if (isNaN(price) || price < 0) price = 0;
    if (isNaN(people) || people < 0) people = 0;
    var includeHidden = el("cost-hidden-check").checked;
    saveJSON(STORE_PRICE, price);
    saveJSON(STORE_PEOPLE, people);
    saveJSON(STORE_HIDDEN, includeHidden);
    var cost = L.familyCost(price, people, L.hiddenCostTotal(HIDDEN_COSTS), includeHidden);
    var box = el("cost-result");
    if (!people) {
      box.innerHTML = '<div class="total"><strong>NO TRAVELLERS ENTERED YET</strong>' +
        "<p>Enter how many people are travelling.</p></div>";
      return;
    }
    var gap = L.hiddenGap(cost);
    box.innerHTML = '<div class="total"><strong>' + rs(cost.base) + " PACKAGE PRICE \u00b7 " +
      rs(cost.total) + " REAL TOTAL FOR " + cost.people + " " +
      (cost.people === 1 ? "PERSON" : "PEOPLE") + "</strong>" +
      "<p>Package price " + rs(cost.perPerson) + " per person \u00d7 " + cost.people +
      (includeHidden
        ? " = " + rs(cost.base) + ", plus hidden costs " + rs(cost.hidden) +
          " (" + rs(L.hiddenCostTotal(HIDDEN_COSTS)) + " per person) \u2014 the real total is " +
          rs(gap) + " more than the quoted price."
        : " = " + rs(cost.base) + ". Tick \u201cReveal the hidden costs\u201d to see the real total \u2014 " +
          rs(L.hiddenCostTotal(HIDDEN_COSTS)) + " more per person.") +
      "</p></div>";
  }
  renderCost();
  el("cost-price-input").addEventListener("input", renderCost);
  el("cost-people-input").addEventListener("input", renderCost);
  el("cost-hidden-check").addEventListener("change", renderCost);
  el("cost-btn").addEventListener("click", renderCost);

  // ---- Balloting tracker ----
  function renderCountdown() {
    var days = L.daysUntilDraw(TODAY, DRAW_DATE);
    el("countdown-box").innerHTML = '<div class="total"><strong>' + days +
      " DAYS TO THE BALLOTING DRAW \u2014 5 DEC 2026</strong>" +
      "<p>Rafiq and Amina applied together under the government scheme, application " +
      "HAJ-2026-4812, submitted 18 Nov 2026 at the Bank of Khyber, University Road branch, " +
      "Peshawar. The draw decides who is selected \u2014 nobody can promise a result before it.</p></div>";
  }
  renderCountdown();

  function renderAppList() {
    var box = el("app-list");
    box.innerHTML = "";
    APPLICATIONS.forEach(function (a) {
      var div = document.createElement("div");
      var cls = a.status === "SELECTED" ? " best" : "";
      div.className = "bundle" + cls;
      var badge = a.status === "SELECTED"
        ? '<span class="badge-ok">\u2713 SELECTED</span>'
        : (a.status === "IN BALLOTING"
          ? '<span class="badge-best">IN BALLOTING</span>'
          : (a.status === "NOT SELECTED"
            ? '<span class="badge-risk">NOT SELECTED</span>'
            : '<span class="badge-best">WAITLISTED</span>'));
      div.innerHTML = "<div><h3>" + a.no + " \u00b7 " + a.applicant + "</h3><p>" +
        a.city + " \u00b7 " + a.scheme + "</p></div>" +
        '<div class="recv">' + a.status + "<span>" + badge + "</span></div>";
      box.appendChild(div);
    });
    var counts = L.countByStatus(APPLICATIONS);
    el("app-summary").textContent = "5 sample applications \u00b7 " +
      (counts["IN BALLOTING"] || 0) + " in balloting, " +
      (counts["SELECTED"] || 0) + " selected, " +
      (counts["NOT SELECTED"] || 0) + " not selected, " +
      (counts["WAITLISTED"] || 0) + " waitlisted.";
  }
  renderAppList();

  function checkApplication() {
    var raw = el("app-input").value || "";
    var res = L.lookupApplication(APPLICATIONS, raw);
    var box = el("app-result");
    if (res.kind === "found") {
      var a = res.app;
      var cls = a.status === "SELECTED" ? "ok" : (a.status === "NOT SELECTED" ? "risk" : "warn");
      box.innerHTML = '<div class="alert ' + cls + '"><strong>' + a.no + " \u2014 " +
        a.status + "</strong><p>" + a.applicant + ", " + a.city + " \u00b7 " + a.scheme +
        ". " + (a.status === "IN BALLOTING"
          ? "Still waiting for the draw on 5 Dec 2026 \u2014 10 days to go."
          : (a.status === "SELECTED"
            ? "Selected in the balloting \u2014 next step is the payment receipt."
            : (a.status === "NOT SELECTED"
              ? "Not selected in this draw \u2014 the application can be tried again next year."
              : "Waitlisted \u2014 a place may open if a selected applicant drops out."))) +
        "</p></div>";
    } else if (res.kind === "not-found") {
      box.innerHTML = '<div class="alert notfound"><strong>NO APPLICATION WITH THAT NUMBER IN THE SAMPLE LIST</strong>' +
        "<p>HAJ-2026-4812 is Rafiq's sample application. Sample applications run HAJ-2026-2091 to HAJ-2026-4813.</p></div>";
    } else if (res.kind === "invalid") {
      box.innerHTML = '<div class="alert warn"><strong>THAT IS NOT AN APPLICATION NUMBER</strong>' +
        "<p>Application numbers look like HAJ-2026-4812 \u2014 HAJ, the year, then four digits.</p></div>";
    } else {
      box.innerHTML = '<div class="alert warn"><strong>ENTER YOUR APPLICATION NUMBER FIRST</strong>' +
        "<p>It is on the receipt from the bank where you applied.</p></div>";
    }
  }
  checkApplication();
  el("app-btn").addEventListener("click", checkApplication);

  // ---- Agent verifier ----
  function checkLicence() {
    var raw = el("licence-input").value || "";
    var res = L.verifyAgent(AGENTS, raw);
    var box = el("licence-result");
    if (res.kind === "verified") {
      var a = res.agent;
      box.innerHTML = '<div class="alert ok"><strong>\u2713 LICENCE VERIFIED \u2014 ' +
        a.licence + "</strong><p>" + a.operator + ", " + a.city +
        " \u00b7 registered since " + a.since + " \u00b7 " + a.packages +
        " sample packages. " + a.note + "</p></div>";
    } else if (res.kind === "fraud") {
      var f = res.agent;
      box.innerHTML = '<div class="alert risk"><strong>FLAGGED FRAUD \u2014 ' +
        f.licence + " \u2014 DO NOT PAY</strong><p>" + f.operator + ", " + f.city +
        ". " + f.note + "</p></div>";
    } else if (res.kind === "not-found") {
      box.innerHTML = '<div class="alert notfound"><strong>NOT IN THE SAMPLE REGISTER</strong>' +
        "<p>That licence number is not in this sample register. In real life, check it with the Ministry of Religious Affairs before paying anything. Sample licences: HGO-2026-114, HGO-2026-118, HGO-2026-121, HGO-2026-077.</p></div>";
    } else if (res.kind === "invalid") {
      box.innerHTML = '<div class="alert warn"><strong>THAT IS NOT A LICENCE NUMBER</strong>' +
        "<p>Licence numbers look like HGO-2026-114 \u2014 HGO, the year, then three digits.</p></div>";
    } else {
      box.innerHTML = '<div class="alert warn"><strong>ENTER A LICENCE NUMBER FIRST</strong>' +
        "<p>It should be on the operator's office board and on every receipt.</p></div>";
    }
  }
  checkLicence();
  el("licence-btn").addEventListener("click", checkLicence);

  // ---- Scam spotter ----
  function renderScam() {
    var box = el("scam-list");
    box.innerHTML = "";
    SCAM_FLAGS.forEach(function (f) {
      var div = document.createElement("div");
      div.className = "spotter-q";
      var p = document.createElement("p");
      p.textContent = f.text;
      div.appendChild(p);
      ["flag", "safe"].forEach(function (choice) {
        var btn = document.createElement("button");
        btn.className = "flag-btn" + (scamAnswers[f.id] === choice ? " chosen" : "");
        btn.textContent = choice === "flag" ? "Red flag" : "Safe sign";
        btn.addEventListener("click", function () {
          scamAnswers[f.id] = choice;
          saveJSON(STORE_SCAM, scamAnswers);
          renderScam();
        });
        div.appendChild(btn);
      });
      var why = document.createElement("p");
      why.className = "hint";
      why.textContent = scamAnswers[f.id]
        ? (scamAnswers[f.id] === f.answer ? "\u2713 Right. " : "\u2717 Not quite. ") + f.why
        : "Tap Red flag or Safe sign to see why.";
      div.appendChild(why);
      box.appendChild(div);
    });
  }
  renderScam();
  el("scam-btn").addEventListener("click", function () {
    var score = L.scamScore(SCAM_FLAGS, scamAnswers);
    el("scam-result").innerHTML = '<div class="alert ' + (score.allRight ? "ok" : "warn") +
      '"><strong>' + score.text.toUpperCase() + "</strong><p>" +
      (score.allRight
        ? "All six right \u2014 you can spot a fake agent. The four red flags are: cash with no receipt, a price far below the government scheme, a guaranteed balloting result, and no licence number on the board."
        : "You answered " + score.answered + " of " + score.total +
          ". Read the reason under each statement, then try again \u2014 a fake agent only needs one mistake.") +
      "</p></div>";
  });

  // ---- Checklist ----
  function renderChecklist() {
    var box = el("checklist");
    box.innerHTML = "";
    CHECKLIST.forEach(function (it) {
      var done = !!checklistDone[it.id];
      var div = document.createElement("div");
      div.className = "checklist-item" + (done ? " done" : "");
      var input = document.createElement("input");
      input.type = "checkbox";
      input.checked = done;
      input.addEventListener("change", function () {
        checklistDone = L.toggleChecklist(checklistDone, it.id);
        saveJSON(STORE_CHECKLIST, checklistDone);
        renderChecklist();
      });
      var label = document.createElement("label");
      label.textContent = it.label + " \u2014 " + it.note;
      div.appendChild(input);
      div.appendChild(label);
      box.appendChild(div);
    });
    var prog = L.checklistProgress(CHECKLIST, checklistDone);
    el("checklist-progress").textContent = prog.text + " (" + prog.pct + "%)" +
      (prog.allDone
        ? " \u2014 everything is ready for Hajj 2026."
        : " \u2014 still to do: " + L.pendingItems(CHECKLIST, checklistDone)
          .map(function (it) { return it.label; }).join("; ") + ".");
  }
  renderChecklist();

  function renderTraining() {
    var box = el("training-list");
    box.innerHTML = "";
    L.upcomingTraining(TRAINING, TODAY).forEach(function (t) {
      var div = document.createElement("div");
      div.className = "bundle";
      div.innerHTML = "<div><h3>" + t.title + "</h3><p>" + t.place + " \u00b7 " +
        t.note + "</p></div>" +
        '<div class="recv">' + t.label + "<span>" + t.time + "</span></div>";
      box.appendChild(div);
    });
  }
  renderTraining();

  el("reset-demo").addEventListener("click", function () {
    checklistDone = {};
    CHECKLIST.forEach(function (it) { if (it.done) checklistDone[it.id] = true; });
    scamAnswers = {};
    saveJSON(STORE_CHECKLIST, checklistDone);
    saveJSON(STORE_SCAM, scamAnswers);
    el("scheme-search").value = "";
    el("scheme-sort").value = "cheapest";
    el("cost-price-input").value = "1075000";
    el("cost-people-input").value = "2";
    el("cost-hidden-check").checked = true;
    el("app-input").value = "HAJ-2026-4812";
    el("licence-input").value = "HGO-2026-114";
    el("scam-result").innerHTML = "";
    showTab("schemes");
    renderSchemes();
    renderCost();
    checkApplication();
    checkLicence();
    renderScam();
    renderChecklist();
    renderTraining();
  });
})();
