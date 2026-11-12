/* e-Irad electronic queue: book a time at an office for one step of a procedure in data/procedures.json.
   Slots follow the office's published hours (lunch and non-reception days excluded); which slots are taken is worked
   out from the office, the date and the slip number, so the same visitor sees the same calendar that day. The last
   three bookings are kept in localStorage "eirad_bookings" on this device; nothing is sent anywhere. */
window.E_BOOKING = function (H, box) {
  "use strict";
  var $ = H.$, esc = H.esc, L = H.L, hash = H.hash, kv = H.kv;
  var DATA = null, slip = null, sel = {};
  var WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], WDL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var MO = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var CSS = ".bk-days{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;margin:8px 0;font-size:.82rem}" +
    ".bk-days .h{font-weight:600;color:var(--muted,#5d6a70);text-align:center}.bk-d{border:1px solid var(--line,#d5dde3);background:#fff;padding:4px 2px;text-align:center;min-height:44px;cursor:pointer;font:inherit}" +
    ".bk-d small{display:block;color:var(--muted,#5d6a70);font-size:.72rem}.bk-d[disabled]{background:#eef1f3;color:#9aa5ab;cursor:default}.bk-d.full{background:#f6eeee;color:#8a5a5a}.bk-d.on{outline:2px solid var(--blue,#1f5a96);background:#eaf2fa}" +
    ".bk-slots{display:flex;flex-wrap:wrap;gap:4px;margin:8px 0}.bk-s{font:600 .82rem Consolas,'Courier New',monospace;border:1px solid var(--blue-line,#b8cde0);background:#fff;color:var(--blue,#1f5a96);padding:4px 7px;cursor:pointer}" +
    ".bk-s[disabled]{background:#eef1f3;color:#a6b0b5;border-color:#e0e5e8;cursor:default;text-decoration:line-through}.bk-s.lunch{text-decoration:none;font-style:italic}.bk-s.on{background:var(--blue,#1f5a96);color:#fff}" +
    ".bk-legend{font-size:.76rem;color:var(--muted,#5d6a70)}.bk-duty{float:right;margin:0 0 6px 10px;border:2px dotted #8a6d1d;padding:6px 8px;text-align:center;font:600 .7rem/1.3 Consolas,monospace;color:#6b5414;background:#fffbea;transform:rotate(2deg)}" +
    "@media print{.bk-no-print,#top,#bottom,.crumbs,aside.help,#guide,.svchead{display:none!important}}";
  function css() { if (document.getElementById("bk-css")) return; var s = document.createElement("style"); s.id = "bk-css"; s.textContent = CSS; document.head.appendChild(s); }
  function p2(n) { return (n < 10 ? "0" : "") + n; }
  function hm(m) { return p2(Math.floor(m / 60)) + ":" + p2(m % 60); }
  function day(d) { return WDL[d.getUTCDay()] + ", " + d.getUTCDate() + " " + MO[d.getUTCMonth()] + " " + d.getUTCFullYear(); }
  function iso(d) { return d.toISOString().slice(0, 10); }
  function inst(id) { return DATA.institutions[id] || { name: { en: id } }; }
  function doc(id) { var x = DATA.documents && DATA.documents[id]; return x ? L(x.name) : id; }

  /* reception hours from the first clause of the office's hours text */
  function hours(I) {
    var s = (I && I.hours && I.hours.en) || "", c = s.split(/[;.]/)[0], days = [], m, i;
    var W = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
    if (/by arrangement|by contract|evenings|first working week|exchanged on/i.test(c)) return { none: true, text: s };
    if (/every day|around the clock|daylight/i.test(c)) days = [0, 1, 2, 3, 4, 5, 6];
    else if ((m = /(\w+day) to (\w+day)/i.exec(c))) { for (i = W[m[1].toLowerCase()]; ; i = (i + 1) % 7) { days.push(i); if (i === W[m[2].toLowerCase()]) break; } }
    else { var re = /(sun|mon|tues|wednes|thurs|fri|satur)day/ig; while ((m = re.exec(c))) days.push(W[m[0].toLowerCase()]); }
    var ex = /except (\w+day)/i.exec(c); if (ex) days = days.filter(function (k) { return k !== W[ex[1].toLowerCase()]; });
    if (!days.length) days = [1, 2, 3, 4, 5];
    var tm = /(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/.exec(c), open = 540, close = 1020;
    if (/around the clock|every day, 8/i.test(c)) { open = 540; close = 1080; } else if (/daylight/i.test(c)) { open = 540; close = 1020; } else if (tm) { open = +tm[1] * 60 + +tm[2]; close = +tm[3] * 60 + +tm[4]; }
    var lu = /lunch (\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/.exec(s), lunch = null;
    if (lu) lunch = [+lu[1] * 60 + +lu[2], +lu[3] * 60 + +lu[4]]; else if (close - open > 300) lunch = [780, 840];
    return { days: days, open: open, close: close, lunch: lunch, text: s };
  }
  /* one window per office for electronic bookings; 20-minute slots; the first fortnight is nearly always taken */
  function calendar(iid, sid) {
    var h = hours(inst(iid)), t0 = H.today(), out = [];
    if (h.none) return { h: h, days: [] };
    for (var k = 1; k <= 28; k++) {
      var d = H.addDays(t0, k), dw = d.getUTCDay(), slots = [];
      if (h.days.indexOf(dw) >= 0) {
        var fill = k <= 9 ? 1 : k <= 16 ? 0.93 : k <= 21 ? 0.78 : 0.6;
        for (var m = h.open; m + 20 <= h.close; m += 20) {
          var lunch = h.lunch && m + 20 > h.lunch[0] && m < h.lunch[1];
          var taken = lunch || (hash(iid + "|" + iso(d) + "|" + m + "|" + (slip ? slip.no : "")) % 1000) / 1000 < fill;
          slots.push({ m: m, lunch: lunch, taken: taken });
        }
      }
      out.push({ d: d, open: h.days.indexOf(dw) >= 0, slots: slots, free: slots.filter(function (s) { return !s.taken; }).length });
    }
    return { h: h, days: out };
  }
  function window_(iid, sid) { return 2 + hash(iid + sid) % 9; }

  function offices() {
    var ids = Object.keys(DATA.institutions).filter(function (k) { return Object.keys(DATA.procedures).some(function (p) { return DATA.procedures[p].steps.some(function (s) { return s.inst === k; }); }); });
    ids.sort(function (a, b) { return L(inst(a).name).localeCompare(L(inst(b).name)); });
    return ids.map(function (k) { return '<option value="' + esc(k) + '">' + esc(L(inst(k).name)) + "</option>"; }).join("");
  }
  function purposes(iid) {
    var seen = {}, out = [];
    Object.keys(DATA.procedures).forEach(function (p) {
      DATA.procedures[p].steps.forEach(function (s, i) {
        if (s.inst !== iid) return; var t = L(s.title); if (seen[t]) return; seen[t] = 1;
        out.push('<option value="' + esc(p + "#" + i) + '">' + esc(t) + "</option>");
      });
    });
    return out.join("");
  }
  function loadB() { try { return JSON.parse(localStorage.getItem("eirad_bookings") || "[]"); } catch (e) { return []; } }
  function saveB(b) { try { var a = loadB(); a.unshift(b); localStorage.setItem("eirad_bookings", JSON.stringify(a.slice(0, 3))); } catch (e) {} }

  function start() {
    var saved = ""; try { saved = (window.IradSlip && window.IradSlip.store()) || ""; } catch (e) {}
    var mine = loadB();
    box.innerHTML = '<form class="flow bk-no-print" id="bk-f" novalidate>' +
      '<div class="fld"><label for="bk-o">Office</label><select id="bk-o">' + offices() + "</select></div>" +
      '<div class="fld"><label for="bk-p">Purpose of the visit</label><select id="bk-p"></select></div>' +
      '<div class="fld"><label for="bk-s">Temporary reference slip No.</label><input id="bk-s" type="text" autocomplete="off" spellcheck="false" placeholder="TL-261110-0412-0337" maxlength="24" value="' + esc(saved) + '"><span class="err" id="bk-s-err" hidden></span></div>' +
      '<p class="tiny">A booking is made in the name on the slip. Until e-Irad ID cards are issued the slip is the only identification the electronic queue accepts. <a href="/services/slip/">Print a slip</a>.</p>' +
      '<button class="btn" type="submit">Show free times</button></form><div id="bk-cal" aria-live="polite"></div>' +
      (mine.length ? '<div class="bk-no-print"><h3>Your bookings on this device</h3><ul class="doclist">' + mine.map(function (b) { return "<li><b>" + esc(b.no) + "</b>, " + esc(b.when) + ", " + esc(b.office) + "</li>"; }).join("") + "</ul></div>" : "");
    var o = $("#bk-o"), q = new URLSearchParams(location.search);
    function fillP() { $("#bk-p").innerHTML = purposes(o.value); $("#bk-cal").innerHTML = ""; }
    if (q.get("o") && DATA.institutions[q.get("o")]) o.value = q.get("o");
    o.addEventListener("change", fillP); fillP();
    $("#bk-p").addEventListener("change", function () { $("#bk-cal").innerHTML = ""; });
    $("#bk-f").addEventListener("submit", function (e) {
      e.preventDefault();
      var v = $("#bk-s").value.trim(), err = $("#bk-s-err"); err.hidden = true;
      var s = window.IradSlip ? window.IradSlip.parse(v) : { ok: false, err: "format" };
      if (!v || !s.ok) { err.textContent = !v ? "Enter the number of your temporary reference slip." : s.err === "expired" ? "This slip has expired. Print a new one." : s.err === "check" ? "The number does not check: a digit is mistyped." : "This is not a slip number."; err.hidden = false; $("#bk-s").focus(); return; }
      try { window.IradSlip.store(s.no); } catch (e2) {}
      slip = { no: s.no, who: window.IradSlip.person(s).full };
      var pv = $("#bk-p").value.split("#");
      sel = { iid: o.value, pid: pv[0], step: +pv[1], date: null, m: null };
      cal();
    });
  }
  function cal() {
    var I = inst(sel.iid), C = calendar(sel.iid, sel.pid), out = $("#bk-cal");
    if (C.h.none) { out.innerHTML = '<div class="result"><p><b>' + esc(L(I.name)) + "</b>: this office does not take electronic bookings.</p><p>Reception: " + esc(C.h.text) + ". " + (I.phone && /\d/.test(I.phone) ? "Telephone " + esc(I.phone) + "." : "") + "</p></div>"; return; }
    var first = C.days[0].d.getUTCDay(), cells = "";
    for (var k = 0; k < 7; k++) cells += '<span class="h">' + WD[(first + k) % 7] + "</span>";
    C.days.forEach(function (x, i) {
      var lab = x.d.getUTCDate() + " " + MO[x.d.getUTCMonth()].slice(0, 3);
      if (!x.open) cells += '<button type="button" class="bk-d" disabled>' + lab + "<small>no reception</small></button>";
      else cells += '<button type="button" class="bk-d' + (x.free ? "" : " full") + (sel.date === i ? " on" : "") + '" data-i="' + i + '"' + (x.free ? "" : " disabled") + ">" + lab + "<small>" + (x.free ? x.free + " free" : "fully booked") + "</small></button>";
    });
    out.innerHTML = '<div class="result bk-no-print"><p><b>' + esc(L(I.name)) + "</b>" + (I.address ? ", " + esc(L(I.address)) : "") + ".<br>Reception hours: " + esc(C.h.text) + ".</p>" +
      "<p>Electronic queue, window " + window_(sel.iid, sel.pid) + ". Bookings open 28 days ahead; times are released at 00:00 Irad Time.</p>" +
      '<div class="bk-days">' + cells + '</div><p class="bk-legend">Today and the next day cannot be booked online. Days marked "no reception" are not reception days of this office.</p><div id="bk-t"></div></div><div id="bk-done"></div>';
    Array.prototype.forEach.call(out.querySelectorAll(".bk-d[data-i]"), function (b) { b.addEventListener("click", function () { sel.date = +b.getAttribute("data-i"); sel.m = null; cal(); times(C); }); });
    if (sel.date != null) times(C);
  }
  function times(C) {
    var x = C.days[sel.date], html = "<p>" + esc(day(x.d)) + ":</p><div class=\"bk-slots\">";
    x.slots.forEach(function (s) { html += '<button type="button" class="bk-s' + (s.lunch ? " lunch" : "") + '" data-m="' + s.m + '"' + (s.taken ? " disabled" : "") + (s.lunch ? ' title="Lunch break"' : "") + ">" + hm(s.m) + "</button>"; });
    html += '</div><p class="bk-legend">Crossed out: booked. Lunch break times cannot be booked.</p>';
    $("#bk-t").innerHTML = html;
    Array.prototype.forEach.call($("#bk-t").querySelectorAll(".bk-s:not([disabled])"), function (b) { b.addEventListener("click", function () { sel.m = +b.getAttribute("data-m"); confirm_(C); }); });
  }
  function confirm_(C) {
    var x = C.days[sel.date], I = inst(sel.iid), P = DATA.procedures[sel.pid], S = P.steps[sel.step];
    var no = "EQ-" + (sel.iid.replace(/^[ab]-/, "").replace(/[^a-z]/g, "").slice(0, 4) || "ISEZ").toUpperCase() + "-" + iso(x.d).slice(2).replace(/-/g, "") + "-" + p2(Math.floor(sel.m / 60)) + p2(sel.m % 60) + "-" + (100 + hash(slip.no + sel.iid + iso(x.d) + sel.m) % 900);
    var needs = (S.needs || []).map(doc);
    var rows = [["Office", esc(L(I.name))], ["Address", I.address ? esc(L(I.address)) : "—"], ["Date and time", "<b>" + esc(day(x.d)) + ", " + hm(sel.m) + "</b>"], ["Window", String(window_(sel.iid, sel.pid))],
      ["Purpose", esc(L(S.title))], ["Procedure", esc(L(P.title))], ["Applicant", esc(slip.who) + " (slip " + esc(slip.no) + ")"]];
    $("#bk-done").innerHTML = '<div class="ticket" style="margin-top:12px"><span class="bk-duty" title="Booking fee stamp">E-QUEUE<br>BOOKING<br><small>control No.</small><br>PLU-C6VF</span><div class="tno"><span>Booking No.</span><b>' + esc(no) + "</b></div>" + kv(rows) +
      "<h3>Bring with you</h3><ul class=\"doclist\"><li>This booking, printed, and the temporary reference slip.</li>" + needs.map(function (n) { return "<li>" + esc(n) + "</li>"; }).join("") + "<li>A photocopy of each document. Offices do not make copies.</li></ul>" +
      '<p class="tiny">Arrive 15 minutes before your time and take a paper number from the terminal marked "E-queue". A booking is cancelled if you are more than 5 minutes late, and is not transferable. To cancel, call the office at least one working day ahead' + (I.phone && /\d/.test(I.phone) ? " (" + esc(I.phone) + ")" : "") + '. Visitors without a booking are seen at the same window after booked visitors.</p></div>' +
      '<p class="bk-no-print" style="margin-top:8px"><button class="btn" type="button" id="bk-pr">Print</button> <a class="btn ghost" href="/procedures/' + esc(P.objective) + '/">The whole procedure</a></p>';
    saveB({ no: no, when: day(x.d) + ", " + hm(sel.m), office: L(I.name) });
    $("#bk-pr").addEventListener("click", function () { window.print(); });
    $("#bk-done").scrollIntoView({ block: "nearest" });
  }

  css();
  box.innerHTML = "<p>Loading the list of offices…</p>";
  fetch("/data/procedures.json").then(function (r) { return r.json(); }).then(function (j) { DATA = j; start(); })
    .catch(function () { box.innerHTML = '<p class="warn">The electronic queue is not available at the moment. Try again later.</p>'; });
};
