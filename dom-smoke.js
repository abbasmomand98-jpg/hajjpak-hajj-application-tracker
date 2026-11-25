// HajjPak DOM smoke test — run with: node dom-smoke.js
// Executes data.js + logic.js + app.js in a tiny fake DOM (vm sandbox)
// and asserts the page renders the canonical figures.
var fs = require("fs");
var vm = require("vm");
var assert = require("assert");

function FakeEl(tag) {
  this.tagName = (tag || "div").toUpperCase();
  this.children = [];
  this._html = "";
  this.textContent = "";
  this.value = "";
  this.checked = false;
  this.disabled = false;
  this.className = "";
  this.style = {};
  this.listeners = {};
  this.attributes = {};
  this.type = "";
}
FakeEl.prototype.addEventListener = function (ev, fn) {
  (this.listeners[ev] = this.listeners[ev] || []).push(fn);
};
FakeEl.prototype.appendChild = function (child) { this.children.push(child); return child; };
FakeEl.prototype.setAttribute = function (k, v) { this.attributes[k] = v; };
FakeEl.prototype.getAttribute = function (k) { return this.attributes[k]; };
Object.defineProperty(FakeEl.prototype, "innerHTML", {
  get: function () { return this._html; },
  set: function (v) { this._html = String(v); this.children = []; }
});

var byId = {};
function el(id) {
  if (!byId[id]) byId[id] = new FakeEl("div");
  return byId[id];
}
var documentStub = {
  getElementById: el,
  createElement: function (tag) { return new FakeEl(tag); }
};
var store = {};
var localStorageStub = {
  getItem: function (k) { return store[k] || null; },
  setItem: function (k, v) { store[k] = String(v); }
};
function fire(id, ev, arg) {
  (byId[id].listeners[ev] || []).forEach(function (fn) { fn(arg || {}); });
}
function fireEl(node, ev, arg) {
  (node.listeners[ev] || []).forEach(function (fn) { fn(arg || {}); });
}

var sandbox = { document: documentStub, localStorage: localStorageStub, console: console,
  Date: Date, setInterval: function () { return 0; }, clearInterval: function () {} };
sandbox.window = sandbox;
vm.createContext(sandbox);
// Pre-seed the fake DOM with the defaults index.html declares in markup
// (the fake DOM does not parse value/selected/checked attributes).
el("scheme-sort").value = "cheapest";
el("scheme-search").value = "";
el("cost-price-input").value = "1075000";
el("cost-people-input").value = "2";
el("cost-hidden-check").checked = true;
el("app-input").value = "HAJ-2026-4812";
el("licence-input").value = "HGO-2026-114";
["data.js", "logic.js", "app.js"].forEach(function (f) {
  vm.runInContext(fs.readFileSync(f, "utf8"), sandbox, { filename: f });
});

var n = 0;
function eq(a, b, msg) { assert.strictEqual(a, b, msg); n++; }
function ok(v, msg) { assert.ok(v, msg); n++; }

// 1. Schemes tab is active on load; 6 schemes, cheapest verified first.
eq(el("section-schemes").style.display, "block", "schemes section shows on load");
eq(el("scheme-list").children.length, 6, "scheme list renders 6 schemes");
ok(el("scheme-list").children[0].innerHTML.indexOf("GOV-2026-LONG") !== -1, "cheapest first is the government long package");
ok(el("scheme-list").children[0].innerHTML.indexOf("CHEAPEST VERIFIED") !== -1, "the government long package carries the cheapest-verified badge");
ok(el("scheme-list").children[5].innerHTML.indexOf("HGO-2026-077") !== -1, "last is the fraud scheme at Rs 8,50,000");
ok(el("scheme-list").children[5].innerHTML.indexOf("FLAGGED FRAUD") !== -1, "the fraud scheme is flagged");
ok(el("cheapest-box").innerHTML.indexOf("Rs 10,75,000") !== -1, "cheapest box names Rs 10,75,000");
ok(el("cheapest-box").innerHTML.indexOf("Rs 11,50,000") !== -1, "cheapest box names the cheapest private at Rs 11,50,000");
ok(el("scheme-summary").textContent.indexOf("2 government, 4 private") !== -1, "summary counts 2 government and 4 private");
ok(el("scheme-summary").textContent.indexOf("1 flagged fraud") !== -1, "summary counts 1 flagged fraud");

// 2. Search and sort.
el("scheme-search").value = "peshawar";
fire("scheme-search", "input");
eq(el("scheme-list").children.length, 3, "searching Peshawar finds 3 schemes");
el("scheme-search").value = "private";
fire("scheme-search", "input");
eq(el("scheme-list").children.length, 4, "searching private finds 4 schemes");
el("scheme-search").value = "";
fire("scheme-search", "input");
eq(el("scheme-list").children.length, 6, "clearing the search restores 6 schemes");
el("scheme-sort").value = "expensive";
fire("scheme-sort", "change");
ok(el("scheme-list").children[0].innerHTML.indexOf("Rs 14,50,000") !== -1, "most expensive first is Rs 14,50,000");
el("scheme-sort").value = "kind";
fire("scheme-sort", "change");
ok(el("scheme-list").children[0].innerHTML.indexOf("GOV-2026") !== -1, "government schemes sort first");
el("scheme-sort").value = "cheapest";
fire("scheme-sort", "change");

// 3. Cost calculator: family of 2, hidden costs revealed by default.
fire("tab-cost", "click");
eq(el("section-cost").style.display, "block", "cost section shows on tab click");
eq(el("section-schemes").style.display, "none", "schemes section hides on tab click");
ok(el("cost-result").innerHTML.indexOf("Rs 23,45,000") !== -1, "the real total for 2 is Rs 23,45,000");
ok(el("cost-result").innerHTML.indexOf("Rs 21,50,000") !== -1, "the package price for 2 is Rs 21,50,000");
ok(el("cost-result").innerHTML.indexOf("Rs 1,95,000") !== -1, "the hidden gap for 2 is Rs 1,95,000");
eq(el("hidden-list").children.length, 6, "hidden-cost list renders 6 items");
ok(el("hidden-list").children[0].innerHTML.indexOf("Qurbani") !== -1, "first hidden cost is Qurbani");
ok(el("hidden-list").children[0].innerHTML.indexOf("Rs 45,000") !== -1, "Qurbani is Rs 45,000");
ok(el("hidden-summary").textContent.indexOf("Rs 97,500") !== -1, "hidden costs are Rs 97,500 per person");
el("cost-hidden-check").checked = false;
fire("cost-hidden-check", "change");
ok(el("cost-result").innerHTML.indexOf("Rs 21,50,000") !== -1, "hidden costs off: total is the package price");
ok(el("cost-result").innerHTML.indexOf("Rs 23,45,000") === -1, "hidden costs off: no real total shown");
el("cost-hidden-check").checked = true;
fire("cost-hidden-check", "change");
el("cost-people-input").value = "1";
fire("cost-people-input", "input");
ok(el("cost-result").innerHTML.indexOf("Rs 11,72,500") !== -1, "1 person with hidden costs is Rs 11,72,500");
el("cost-people-input").value = "2";
fire("cost-people-input", "input");
ok(el("cost-result").innerHTML.indexOf("Rs 23,45,000") !== -1, "restoring 2 people restores Rs 23,45,000");

// 4. Balloting tracker: countdown and application lookup.
fire("tab-balloting", "click");
eq(el("section-balloting").style.display, "block", "balloting section shows on tab click");
ok(el("countdown-box").innerHTML.indexOf("10 DAYS TO THE BALLOTING DRAW") !== -1, "countdown is 10 days to the draw");
ok(el("countdown-box").innerHTML.indexOf("5 DEC 2026") !== -1, "the draw is 5 Dec 2026");
ok(el("app-result").innerHTML.indexOf("IN BALLOTING") !== -1, "Rafiq's application is in balloting");
ok(el("app-result").innerHTML.indexOf("HAJ-2026-4812") !== -1, "the result names HAJ-2026-4812");
eq(el("app-list").children.length, 5, "application list renders 5 applications");
ok(el("app-summary").textContent.indexOf("2 in balloting") !== -1, "summary counts 2 in balloting");
el("app-input").value = "HAJ-2026-2091";
fire("app-btn", "click");
ok(el("app-result").innerHTML.indexOf("SELECTED") !== -1, "HAJ-2026-2091 is selected");
el("app-input").value = "HAJ-2026-9999";
fire("app-btn", "click");
ok(el("app-result").innerHTML.indexOf("NO APPLICATION WITH THAT NUMBER") !== -1, "an unknown application is not found");
el("app-input").value = "4812";
fire("app-btn", "click");
ok(el("app-result").innerHTML.indexOf("NOT AN APPLICATION NUMBER") !== -1, "'4812' is not an application number");
el("app-input").value = "HAJ-2026-4812";
fire("app-btn", "click");
ok(el("app-result").innerHTML.indexOf("IN BALLOTING") !== -1, "restoring HAJ-2026-4812 restores in balloting");

// 5. Agent verifier: verified, fraud, not found, invalid.
fire("tab-verify", "click");
eq(el("section-verify").style.display, "block", "verify section shows on tab click");
ok(el("licence-result").innerHTML.indexOf("LICENCE VERIFIED") !== -1, "HGO-2026-114 verifies");
ok(el("licence-result").innerHTML.indexOf("Al-Noor Hajj Services") !== -1, "the result names Al-Noor Hajj Services");
el("licence-input").value = "HGO-2026-077";
fire("licence-btn", "click");
ok(el("licence-result").innerHTML.indexOf("FLAGGED FRAUD") !== -1, "HGO-2026-077 is flagged fraud");
ok(el("licence-result").innerHTML.indexOf("DO NOT PAY") !== -1, "the fraud result says do not pay");
el("licence-input").value = "HGO-2026-999";
fire("licence-btn", "click");
ok(el("licence-result").innerHTML.indexOf("NOT IN THE SAMPLE REGISTER") !== -1, "an unknown licence is not in the register");
el("licence-input").value = "114";
fire("licence-btn", "click");
ok(el("licence-result").innerHTML.indexOf("NOT A LICENCE NUMBER") !== -1, "'114' is not a licence number");
el("licence-input").value = "HGO-2026-114";
fire("licence-btn", "click");
ok(el("licence-result").innerHTML.indexOf("LICENCE VERIFIED") !== -1, "restoring HGO-2026-114 verifies again");

// 6. Scam spotter: answer all six correctly.
eq(el("scam-list").children.length, 6, "scam spotter renders 6 statements");
// children of each question: [text, Red flag button, Safe sign button, reason]
function answerScam(i, choice) {
  var q = el("scam-list").children[i];
  fireEl(q.children[choice === "flag" ? 1 : 2], "click");
}
answerScam(0, "flag"); answerScam(1, "flag"); answerScam(2, "flag");
answerScam(3, "flag"); answerScam(4, "safe"); answerScam(5, "safe");
fire("scam-btn", "click");
ok(el("scam-result").innerHTML.indexOf("6 OF 6 RIGHT") !== -1, "all six scam answers right scores 6 of 6");
ok((store["hajjpak-scam"] || "").indexOf("cash") !== -1, "scam answers persist in localStorage");

// 7. Checklist: 5 of 8 done, toggle flu, persist.
eq(el("checklist").children.length, 8, "checklist renders 8 items");
ok(el("checklist-progress").textContent.indexOf("5 of 8 done") !== -1, "5 of 8 checklist items are done");
ok(el("checklist-progress").textContent.indexOf("63%") !== -1, "5 of 8 is 63%");
ok(el("checklist-progress").textContent.indexOf("Flu vaccination") !== -1, "the pending list names the flu vaccination");
fireEl(el("checklist").children[4].children[0], "change");
ok(el("checklist-progress").textContent.indexOf("6 of 8 done") !== -1, "ticking flu makes 6 of 8 done");
ok((store["hajjpak-checklist"] || "").indexOf("flu") !== -1, "the checklist persists in localStorage");
fireEl(el("checklist").children[4].children[0], "change");
ok(el("checklist-progress").textContent.indexOf("5 of 8 done") !== -1, "unticking flu restores 5 of 8 done");

// 8. Training sessions.
eq(el("training-list").children.length, 3, "training list renders 3 sessions");
ok(el("training-list").children[0].innerHTML.indexOf("Hajj rites briefing") !== -1, "first session is the rites briefing");
ok(el("training-list").children[1].innerHTML.indexOf("6 Dec 2026") !== -1, "second session is 6 Dec 2026");

// 9. Reset restores the canonical defaults.
fire("reset-demo", "click");
eq(el("section-schemes").style.display, "block", "reset returns to the schemes tab");
ok(el("cost-result").innerHTML.indexOf("Rs 23,45,000") !== -1, "reset restores the Rs 23,45,000 real total");
ok(el("checklist-progress").textContent.indexOf("5 of 8 done") !== -1, "reset restores 5 of 8 done");
ok(el("licence-result").innerHTML.indexOf("LICENCE VERIFIED") !== -1, "reset restores the verified licence");
eq(el("cost-price-input").value, "1075000", "reset restores Rs 10,75,000 per person");
eq(el("cost-people-input").value, "2", "reset restores 2 people");
eq(el("app-input").value, "HAJ-2026-4812", "reset restores HAJ-2026-4812");
eq(el("licence-input").value, "HGO-2026-114", "reset restores HGO-2026-114");

console.log("\n" + n + " DOM assertions passed.");
