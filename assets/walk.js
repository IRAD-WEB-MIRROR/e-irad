/* e-Irad: "Get it in person". Walks one real procedure from data/procedures.json office by office, on the Irad
   clock: opening hours, the lunch break, the wrong window, a missing stamp, "come back on Thursday". Ends at an
   application number. Accepts the temporary reference slip (assets/slip.js). Nothing is sent or stored: the day is
   worked out in the browser from the procedure, the slip number and the date, so the same visit plays the same way. */
window.E_WALK = function (H, box) {
  "use strict";
  var $ = H.$, esc = H.esc, L = H.L, hash = H.hash;
  var DATA = null, ST = null;
  var WD = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var MO = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var CSS = ".wk-log{list-style:none;margin:12px 0 0;padding:0;border-left:3px solid var(--blue-line,#b8cde0)}" +
    ".wk-log li{margin:0 0 10px;padding:2px 0 2px 12px;position:relative}.wk-log li:before{content:'';position:absolute;left:-7px;top:8px;width:11px;height:11px;border-radius:50%;background:#fff;border:2px solid var(--blue,#1f5a96)}" +
    ".wk-log li.bad:before{border-color:#b3253a}.wk-log li.ok:before{background:var(--blue,#1f5a96)}" +
    ".wk-t{display:block;font:600 .78rem Consolas,'Courier New',monospace;color:var(--muted,#5d6a70)}.wk-q{font-style:italic}" +
    ".wk-act{margin:8px 0 0;display:flex;gap:8px;flex-wrap:wrap}.wk-sum{margin-top:12px}.wk-duty{float:right;margin:0 0 6px 10px;border:2px dotted #8a6d1d;padding:6px 8px;text-align:center;font:600 .7rem/1.3 Consolas,monospace;color:#6b5414;background:#fffbea;transform:rotate(2deg)}" +
    "@media print{.wk-act,.wk-pick,#top,#bottom,.crumbs,aside.help,#guide{display:none!important}}";

  function css() { if (document.getElementById("wk-css")) return; var s = document.createElement("style"); s.id = "wk-css"; s.textContent = CSS; document.head.appendChild(s); }
  function rng(seed) { var x = hash(seed) || 1; return function () { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }
  function between(r, a) { return a[0] + Math.round(r() * Math.max(0, a[1] - a[0])); }
  function p2(n) { return (n < 10 ? "0" : "") + n; }
  function d(t) { return new Date(t * 60000); }
  function clock(t) { var x = d(t); return WD[x.getUTCDay()].slice(0, 3) + " " + x.getUTCDate() + " " + MO[x.getUTCMonth()].slice(0, 3) + ", " + p2(x.getUTCHours()) + ":" + p2(x.getUTCMinutes()); }
  function dayName(t) { var x = d(t); return WD[x.getUTCDay()] + " " + x.getUTCDate() + " " + MO[x.getUTCMonth()]; }
  function mins(t) { var x = d(t); return x.getUTCHours() * 60 + x.getUTCMinutes(); }
  function midnight(t) { return t - mins(t); }
  function now() { var n = H.iradNow(); return Math.floor(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate(), n.getHours(), n.getMinutes()) / 60000); }

  /* opening hours from the first clause of the office's own text ("Monday to Friday, 9:00–17:00, lunch 12:30–13:30") */
  function hours(inst) {
    var s = (inst && inst.hours && inst.hours.en) || "", c = s.split(/[;.]/)[0], days = [], m, i;
    var W = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
    if (/every day|daily|around the clock/i.test(c)) days = [0, 1, 2, 3, 4, 5, 6];
    else if ((m = /(\w+day) to (\w+day)/i.exec(c))) { for (i = W[m[1].toLowerCase()]; ; i = (i + 1) % 7) { days.push(i); if (i === W[m[2].toLowerCase()]) break; } }
    else { var re = /(sun|mon|tues|wednes|thurs|fri|satur)day/ig; while ((m = re.exec(c))) days.push(W[m[0].toLowerCase()]); }
    if (/except (\w+day)/i.test(c)) { var x = W[/except (\w+day)/i.exec(c)[1].toLowerCase()]; days = days.filter(function (k) { return k !== x; }); }
    if (/saturday/i.test(s) && !/saturday/i.test(c)) days.push(6);
    if (!days.length) days = [1, 2, 3, 4, 5];
    var tm = /(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/.exec(c), open = 540, close = 1020;
    if (/around the clock/i.test(c)) { open = 0; close = 1440; } else if (/daylight/i.test(c)) { open = 420; close = 1140; } else if (tm) { open = +tm[1] * 60 + +tm[2]; close = +tm[3] * 60 + +tm[4]; }
    var lu = /lunch (\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/.exec(s), lunch = null;
    if (lu) lunch = [+lu[1] * 60 + +lu[2], +lu[3] * 60 + +lu[4]]; else if (close - open > 300 && close < 1440) lunch = [780, 840];
    return { days: days, open: open, close: close, lunch: lunch, text: s };
  }
  function isOpen(h, t) { var x = d(t), m = mins(t); return h.days.indexOf(x.getUTCDay()) >= 0 && m >= h.open && m < h.close - 10 && !(h.lunch && m >= h.lunch[0] && m < h.lunch[1]); }
  function nextOpen(h, t) {
    var m = mins(t), x = d(t);
    if (h.days.indexOf(x.getUTCDay()) >= 0 && h.lunch && m >= h.lunch[0] && m < h.lunch[1]) return midnight(t) + h.lunch[1];
    if (h.days.indexOf(x.getUTCDay()) >= 0 && m < h.open) return midnight(t) + h.open;
    for (var k = 1; k <= 14; k++) { var day = midnight(t) + k * 1440; if (h.days.indexOf(d(day).getUTCDay()) >= 0) return day + h.open; }
    return t + 1440;
  }
  function inst(id) { return (DATA.institutions && DATA.institutions[id]) || { name: { en: id } }; }
  function doc(id) { var x = DATA.documents && DATA.documents[id]; return x ? L(x.name) : id; }

  /* ---------- the visit, worked out in advance as a list of beats; the visitor clicks through them ---------- */
  function plan(pid, slip) {
    var P = DATA.procedures[pid], r = rng(pid + "|" + (slip ? slip.no : "-") + "|" + H.today().toISOString().slice(0, 10));
    var t = now(), beats = [], prev = null, queued = 0, firstDay = t, idDone = false;
    function beat(cls, text, btn, q) { beats.push({ t: t, cls: cls || "", text: text, btn: btn || "", q: q || "" }); }
    function waitOpen(h, I) {
      if (isOpen(h, t)) return;
      var n = nextOpen(h, t), x = d(t), m = mins(t), lunch = h.lunch && h.days.indexOf(x.getUTCDay()) >= 0 && m >= h.lunch[0] && m < h.lunch[1];
      if (lunch) beat("bad", "The window is shut. A card in it says <b>Lunch</b>. Nobody will say when it opens again, but the card says " + p2(Math.floor(h.lunch[1] / 60)) + ":" + p2(h.lunch[1] % 60) + ".", "Wait on the bench");
      else if (n - t < 600 && d(n).getUTCDate() === x.getUTCDate()) beat("bad", "The door is locked. The sign: <i>" + esc(h.text) + "</i>.", "Wait outside");
      else beat("bad", "Closed. The sign on the door: <i>" + esc(h.text) + "</i>.", "Come back on " + dayName(n) + ", " + p2(Math.floor(h.open / 60)) + ":" + p2(h.open % 60));
      t = n;
    }
    P.steps.forEach(function (s, i) {
      var I = inst(s.inst), h = hours(I), name = esc(L(I.name)), addr = I.address ? esc(L(I.address)) : "";
      if (s.inst !== prev) {
        if (prev) { t += 15 + Math.round(r() * 35); }
        beat("", "<b>" + name + "</b>" + (addr ? ", " + addr : "") + ". " + esc(L(s.title)) + ".", "Go in");
      } else beat("", esc(L(s.title)) + ".", "Next window");
      waitOpen(h, I);
      /* the wrong window */
      if (r() < 0.45) {
        var w1 = 1 + Math.floor(r() * 9), w2 = w1 + 2 + Math.floor(r() * 6);
        t += 10 + Math.round(r() * 30);
        beat("bad", "You queue at window " + w1 + ".", "", pick(r, ["Not here. Window " + w2 + ".", "We stopped doing that in September. Window " + w2 + ".", "Legal entities only. Window " + w2 + ", round the corner.", "Have you got a number? The machine is broken. Ask at window " + w2 + "."]));
        beats[beats.length - 1].btn = "Go to window " + w2;
        waitOpen(h, I);
      }
      /* the queue, and lunch arriving while you stand in it */
      var q = between(r, s.queue || [5, 30]); queued += q;
      if (h.lunch && mins(t) < h.lunch[0] && mins(t) + q >= h.lunch[0] && h.days.indexOf(d(t).getUTCDay()) >= 0) {
        t = midnight(t) + h.lunch[0];
        beat("bad", "Two people from the front, the shutter comes down.", "Wait until " + p2(Math.floor(h.lunch[1] / 60)) + ":" + p2(h.lunch[1] % 60), "Lunch!");
        t = midnight(t) + h.lunch[1] + Math.round(r() * 12);
      } else t += q;
      if (!isOpen(h, t)) { beat("bad", "The queue does not move again before closing.", ""); waitOpen(h, I); }
      /* who are you? */
      if (!idDone) {
        idDone = true;
        if (slip) { beat("ok", "Your identity document. e-Irad ID cards are not issued yet; the clerk takes your temporary reference slip No. " + esc(slip.no) + " and writes <b>" + esc(slip.who) + "</b> into the register.", "Next"); t += 4; }
        else { beat("bad", "Your identity document. You show a passport; the clerk copies the details into the register by hand.", "Next", "Next time bring the temporary slip from e-Irad. It is quicker."); t += 25; }
      }
      /* a missing stamp, a photocopy, the fee */
      var needs = (s.needs || []).slice(), roll = r();
      if (needs.length && roll < 0.3) {
        var dn = doc(needs[Math.floor(r() * needs.length)]), back = i > 0 && P.steps[i - 1].inst !== s.inst ? inst(P.steps[i - 1].inst) : null;
        if (back) {
          beat("bad", "The clerk turns your " + esc(dn.charAt(0).toLowerCase() + dn.slice(1)) + " over twice.", "Go back to " + esc(L(back.name)), "There is no stamp on this. Without a stamp it is a piece of paper.");
          t += 20 + Math.round(r() * 30); var bh = hours(back); waitOpen(bh, back);
          t += 15 + Math.round(r() * 40);
          beat("", "Back at " + esc(L(back.name)) + ". The stamp is kept in a drawer; the person with the key is found.", "Return to " + name);
          t += 20 + Math.round(r() * 30); waitOpen(h, I); t += between(r, s.queue || [5, 30]);
        } else {
          beat("bad", "The clerk wants the stamp of the chancellery on your " + esc(dn.charAt(0).toLowerCase() + dn.slice(1)) + ".", "Go to the chancellery", "Room 104. Then come back to me, not to the queue.");
          t += 25 + Math.round(r() * 35); waitOpen(h, I);
        }
      } else if (roll < 0.5) {
        beat("bad", "The clerk wants a photocopy.", "Kiosk across the road (2 som)", "We have no paper. Kiosk across the road.");
        t += 15 + Math.round(r() * 20); waitOpen(h, I);
      } else if (roll < 0.62 && s.inst !== "talasbank" && i === 0) {
        beat("bad", "The fee has to be paid first, at Talasbank, and the receipt brought back.", "Go to Talasbank", "We do not take money here.");
        t += 40 + Math.round(r() * 50); waitOpen(h, I);
      }
      /* at the counter */
      t += between(r, s.counter || [5, 15]);
      var wait = between(r, s.wait || [0, 0]), gives = (s.gives || []).map(doc);
      if (wait > 0) {
        var back2 = t + wait * 1440, bd = d(back2).getUTCDay();
        if (r() < 0.4 && h.days.indexOf(4) >= 0) { while (d(back2).getUTCDay() !== 4) back2 += 1440; }
        else while (h.days.indexOf(bd = d(back2).getUTCDay()) < 0) back2 += 1440;
        beat("", "The papers are accepted and entered in the book.", "Come back on " + dayName(back2), d(back2).getUTCDay() === 4 ? "Come back Thursday. We issue on Thursday." : "Come back on " + WD[d(back2).getUTCDay()] + ".");
        t = midnight(back2) + h.open + Math.round(r() * 50); waitOpen(h, I);
        t += between(r, [10, 40]); queued += 20;
      }
      beat("ok", gives.length ? "You receive: <b>" + gives.map(esc).join("</b>, <b>") + "</b>." : "Done: " + esc(L(s.title)).replace(/^./, function (c) { return c.toLowerCase(); }) + ".", i < P.steps.length - 1 ? "Next step" : "Finish");
      prev = s.inst;
    });
    var last = inst(P.steps[P.steps.length - 1].inst), lid = P.steps[P.steps.length - 1].inst;
    var no = (lid.replace(/^[ab]-/, "").replace(/[^a-z]/g, "").slice(0, 4) || "ISEZ").toUpperCase() + "-" + String(d(t).getUTCFullYear()).slice(2) + p2(d(t).getUTCMonth() + 1) + "-" + String(10000 + hash(pid + (slip ? slip.no : "") + t) % 90000);
    return { pid: pid, P: P, beats: beats, start: firstDay, end: t, queued: queued, no: no, office: L(last.name), slip: slip };
  }
  function pick(r, a) { return a[Math.floor(r() * a.length)]; }

  /* ---------- drawing ---------- */
  function choices() {
    var out = "", P = DATA.procedures;
    DATA.objectives.forEach(function (o) {
      var ids = o.items.map(function (x) { return x.proc; }).filter(function (id) { return P[id] && P[id].steps && P[id].steps.length >= 2; });
      if (!ids.length) return;
      out += '<optgroup label="' + esc(L(o.title)) + '">' + ids.map(function (id) { return '<option value="' + esc(id) + '">' + esc(L(P[id].title)) + "</option>"; }).join("") + "</optgroup>";
    });
    return out;
  }
  function start() {
    var saved = ""; try { saved = (window.IradSlip && window.IradSlip.store()) || ""; } catch (e) {}
    box.innerHTML = '<form class="flow wk-pick" id="wk-f" novalidate>' +
      '<div class="fld"><label for="wk-p">What do you need to get?</label><select id="wk-p">' + choices() + "</select></div>" +
      '<div class="fld"><label for="wk-s">Temporary reference slip No. (if you have one)</label><input id="wk-s" type="text" autocomplete="off" spellcheck="false" placeholder="TL-261110-0412-0337" maxlength="24" value="' + esc(saved) + '"><span class="err" id="wk-s-err" hidden></span></div>' +
      '<p class="tiny">No slip? <a href="/services/slip/">Print one</a>, or go with your passport.</p>' +
      '<button class="btn" type="submit">Plan my visit</button></form><div id="wk-out" aria-live="polite"></div>';
    var q = new URLSearchParams(location.search).get("p"); if (q && DATA.procedures[q]) $("#wk-p").value = q;
    $("#wk-f").addEventListener("submit", function (e) {
      e.preventDefault();
      var v = $("#wk-s").value.trim(), slip = null, err = $("#wk-s-err");
      err.hidden = true;
      if (v && window.IradSlip) {
        var s = window.IradSlip.parse(v);
        if (!s.ok) { err.textContent = s.err === "expired" ? "This slip has expired. Print a new one." : s.err === "check" ? "The number does not check: a digit is mistyped." : "This is not a slip number."; err.hidden = false; $("#wk-s").focus(); return; }
        var p = window.IradSlip.person(s); slip = { no: s.no, who: p.initials }; try { window.IradSlip.store(s.no); } catch (e2) {}
      }
      ST = plan($("#wk-p").value, slip); ST.i = 0; draw();
    });
  }
  function draw() {
    var out = $("#wk-out"), S = ST, html = '<ol class="wk-log">';
    for (var i = 0; i <= S.i && i < S.beats.length; i++) {
      var b = S.beats[i];
      html += '<li class="' + b.cls + '"><span class="wk-t">' + clock(b.t) + "</span>" + b.text + (b.q ? ' <span class="wk-q">“' + esc(b.q) + "”</span>" : "") + "</li>";
    }
    html += "</ol>";
    var b2 = S.beats[S.i];
    if (S.i < S.beats.length - 1) html += '<div class="wk-act"><button class="btn" type="button" id="wk-go">' + esc(b2.btn || "Next") + '</button><button class="btn ghost" type="button" id="wk-all">Skip to the end</button></div>';
    else html += summary();
    out.innerHTML = html;
    var go = $("#wk-go"), all = $("#wk-all"), pr = $("#wk-pr"), ag = $("#wk-ag");
    if (go) { go.addEventListener("click", function () { S.i++; draw(); var li = out.querySelectorAll(".wk-log li"); if (li.length) li[li.length - 1].scrollIntoView({ block: "nearest" }); }); go.focus({ preventScroll: true }); }
    if (all) all.addEventListener("click", function () { S.i = S.beats.length - 1; draw(); });
    if (pr) pr.addEventListener("click", function () { window.print(); });
    if (ag) ag.addEventListener("click", function () { $("#wk-out").innerHTML = ""; $("#wk-p").focus(); });
  }
  function summary() {
    var S = ST, days = Math.round((midnight(S.end) - midnight(S.start)) / 1440), visits = 0, seen = {};
    S.beats.forEach(function (b) { var k = midnight(b.t); if (!seen[k]) { seen[k] = 1; visits++; } });
    var rows = [["Procedure", esc(L(S.P.title))], ["Registered by", esc(S.office)], ["Applicant", S.slip ? esc(S.slip.who) + " (slip " + esc(S.slip.no) + ")" : "by passport"],
      ["Started", clock(S.start)], ["Finished", clock(S.end)], ["Days on which you went in", String(visits)], ["Time in queues", Math.floor(S.queued / 60) + " h " + p2(S.queued % 60) + " min"]];
    return '<div class="ticket wk-sum"><span class="wk-duty" title="State duty stamp">STATE DUTY<br>PAID<br><small>control No.</small><br>PLU-C6VF</span><div class="tno"><span>Application No.</span><b>' + esc(S.no) + "</b></div>" + H.kv(rows) +
      '<p class="tiny">Keep this number. ' + (days > 0 ? "It took " + days + " calendar day" + (days === 1 ? "" : "s") + ". " : "") + "The times shown follow the offices' published hours and the waiting times reported to e-Irad; your visit may differ.</p></div>" +
      '<div class="wk-act"><button class="btn" type="button" id="wk-pr">Print</button><button class="btn ghost" type="button" id="wk-ag">Plan another visit</button>' +
      '<a class="btn ghost" href="/procedures/' + esc(S.P.objective) + '/">The whole procedure</a></div>';
  }

  css();
  box.innerHTML = "<p>Loading the list of procedures…</p>";
  fetch("/data/procedures.json").then(function (r) { return r.json(); }).then(function (j) { DATA = j; start(); })
    .catch(function () { box.innerHTML = '<p class="warn">The list of procedures could not be loaded. Try again later.</p>'; });
};
