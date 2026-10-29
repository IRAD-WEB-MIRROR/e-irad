/* e-Irad: home page layout and the step-by-step guide to procedures.
   Reads /data/procedures.json from this site (the only request it makes). Nothing is sent anywhere. */
window.E_GUIDE = function (A) {
  "use strict";
  var $ = A.$, $$ = A.$$, esc = A.esc, t = A.t, L = A.L;
  var DATA = null, WAIT = [];
  var QTY = {}; // remembered quantities per objective (this page view only)
  var INCL = {};

  function load(cb) {
    if (DATA) return cb(DATA);
    WAIT.push(cb);
    if (WAIT.length > 1) return;
    fetch("/data/procedures.json", { credentials: "same-origin" }).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (d) {
      DATA = d; var w = WAIT; WAIT = []; w.forEach(function (f) { f(d); });
    }).catch(function () { WAIT = []; $("#app").innerHTML = '<div class="wrap page"><p class="warn">' + esc(t("loadErr")) + "</p></div>"; });
  }
  function loading() { $("#app").innerHTML = '<div class="wrap page"><p class="loadingmsg">' + esc(t("loading")) + "</p></div>"; }

  /* ---------- icons for operations ---------- */
  var OPI = {
    import: '<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="17.5" r="1.6"/><circle cx="17" cy="17.5" r="1.6"/><path d="M8 2v4M6 4l2 2 2-2"/>',
    export: '<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="17.5" r="1.6"/><circle cx="17" cy="17.5" r="1.6"/><path d="M8 6V2M6 4l2-2 2 2"/>',
    transit: '<path d="M2 12h20M16 7l5 5-5 5M8 7 3 12l5 5"/>',
    business: '<path d="M4 9l1.5-4h13L20 9M4 9h16v2a2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0zM5 12v7h14v-7M10 19v-4h4v4"/>',
    event: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
    build: '<path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6M12 2v3"/>',
    food: '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 0-3 3-3 6s1 4 3 4v8"/>',
    livestock: '<path d="M6 10c0-3 3-5 6-5s6 2 6 5v3c0 3-3 5-6 5s-6-2-6-5zM6 10 3 8M18 10l3-2M10 12h.01M14 12h.01M10 16h4"/>',
    worker: '<circle cx="12" cy="7" r="3.5"/><path d="M5 21c.5-4 3.3-6.5 7-6.5s6.5 2.5 7 6.5M9 3.6h6"/>'
  };
  function opIcon(k) { return '<svg class="opi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (OPI[k] || OPI.transit) + "</svg>"; }
  var CHEV = '<svg class="chev" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  var ARROW = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  /* ---------- data helpers ---------- */
  function op(id) { for (var i = 0; i < DATA.operations.length; i++) if (DATA.operations[i].id === id) return DATA.operations[i]; return null; }
  function obj(id) { for (var i = 0; i < DATA.objectives.length; i++) if (DATA.objectives[i].id === id) return DATA.objectives[i]; return null; }
  function objsFor(opId) { return DATA.objectives.filter(function (o) { return o.op === opId; }); }
  function inst(id) { return DATA.institutions[id]; }
  function docName(id) { return DATA.documents[id] ? L(DATA.documents[id].name) : id; }
  var RECEIPTS = { receipt: 1, cashreceipt: 1 };
  // A procedure view: {title, desc, ctx, steps:[{s, proc}], laws, obj, full}
  function view(id) {
    var o = obj(id);
    if (o) {
      var steps = [], laws = [];
      o.items.forEach(function (it) {
        var pid = it.proc || it.options[0], p = DATA.procedures[pid];
        p.steps.forEach(function (s) { steps.push({ s: s, proc: pid }); });
        (p.laws || []).forEach(function (l) { laws.push(l); });
      });
      (o.laws || []).forEach(function (l) { laws.push(l); });
      return { id: id, title: o.title, desc: { en: L(o.intro) }, ctx: o.context, steps: steps, laws: mergeLaws(laws), obj: o, full: true };
    }
    var p = DATA.procedures[id]; if (!p) return null;
    var oo = obj(p.objective);
    return { id: id, title: p.title, desc: p.desc, ctx: p.context || oo.context, steps: p.steps.map(function (s) { return { s: s, proc: id }; }), laws: mergeLaws(p.laws || []), obj: oo, full: false };
  }
  function mergeLaws(list) {
    var m = {}, order = [];
    list.forEach(function (l) {
      if (!DATA.laws[l[0]]) return;
      if (!m[l[0]]) { m[l[0]] = []; order.push(l[0]); }
      if (l[1]) l[1].split(/;\s*/).forEach(function (a) { if (m[l[0]].indexOf(a) < 0) m[l[0]].push(a); });
    });
    return order.map(function (k) { return [k, m[k]]; });
  }
  function artText(a) {
    var W = t("art");
    return a.replace(/\b(articles|article|paragraphs|paragraph|sections|section|annex|minute)\b/g, function (w) { return W[w] || w; });
  }
  function stepsInsts(v) {
    var m = {}, order = [];
    v.steps.forEach(function (x) { if (!m[x.s.inst]) { m[x.s.inst] = 0; order.push(x.s.inst); } m[x.s.inst]++; });
    return order.map(function (k) { return [k, m[k]]; });
  }
  function results(v) {
    var out = [];
    v.steps.forEach(function (x, i) { (x.s.gives || []).forEach(function (d) { if (!RECEIPTS[d]) out.push([d, i + 1, x.s.optional]); }); });
    return out;
  }
  function required(v) {
    var made = {}, seen = {}, out = [];
    v.steps.forEach(function (x, i) {
      (x.s.needs || []).forEach(function (d) { if (!seen[d]) { seen[d] = 1; out.push([d, i + 1, made[d] || 0]); } });
      (x.s.gives || []).forEach(function (d) { if (!made[d]) made[d] = i + 1; });
    });
    return out;
  }

  /* ---------- cost ---------- */
  function qtys(o) {
    if (!QTY[o.id]) { QTY[o.id] = {}; o.inputs.forEach(function (i) { QTY[o.id][i.key] = i.default; }); }
    return QTY[o.id];
  }
  function inputLabel(o, key, field) { for (var i = 0; i < o.inputs.length; i++) if (o.inputs[i].key === key) return L(o.inputs[i][field]); return key; }
  function lineValue(c, q) {
    var a = c.amount;
    if (c.bands) {
      var v = +q[c.bands.by] || 0, b = c.bands.bands, amt = b[b.length - 1][1];
      for (var i = 0; i < b.length; i++) if (b[i][0] == null || v <= b[i][0]) { amt = b[i][1]; break; }
      a = amt * (c.bands.per ? (+q[c.bands.per] || 0) : 1);
    }
    (c.per || []).forEach(function (k) { a *= (+q[k] || 0); });
    if (c.times) a *= c.times;
    return { som: c.usd ? a * 8.4 : a, usd: c.usd ? a : null };
  }
  function unitText(o, c) {
    var parts = (c.per || []).map(function (k) { return inputLabel(o, k, "per"); });
    if (c.bands) { parts.push(inputLabel(o, c.bands.by, "label").toLowerCase()); if (c.bands.per) parts.push(inputLabel(o, c.bands.per, "per")); }
    if (c.times) parts.push("× " + c.times);
    var base = c.usd ? "US$ " + A.fmtN(c.amount, c.amount < 1 ? 3 : 2) : (c.bands ? "" : A.fmtN(c.amount, 2) + " " + t("som"));
    if (c.bands) return parts.join(", ");
    if (!(c.per || []).length && !c.times) return c.usd ? base : t("fixed");
    return base + (parts.length ? " " + parts.join(", ") : "");
  }
  function costLines(v) {
    var out = [];
    v.steps.forEach(function (x, i) {
      (x.s.cost || []).forEach(function (c) { out.push({ c: c, n: i + 1, opt: !!x.s.optional, label: c.label ? L(x.s.title) + ": " + L(c.label) : L(x.s.title) }); });
    });
    return out;
  }
  function usedInputs(v) {
    var k = {};
    v.steps.forEach(function (x) { (x.s.cost || []).forEach(function (c) { (c.per || []).forEach(function (p) { k[p] = 1; }); if (c.bands) { k[c.bands.by] = 1; if (c.bands.per) k[c.bands.per] = 1; } }); });
    return v.obj.inputs.filter(function (i) { return k[i.key]; });
  }
  function costBox(v) {
    var o = v.obj, q = qtys(o), lines = costLines(v), ins = usedInputs(v), anyOpt = lines.some(function (l) { return l.opt; });
    if (!lines.length) return "<p>" + esc(t("noCost")) + "</p>";
    var h = '<div class="est" data-est>';
    if (ins.length) h += '<fieldset class="qty"><legend>' + esc(t("qty")) + "</legend>" + ins.map(function (i) {
      return '<label><span>' + esc(L(i.label)) + '</span><input type="number" min="0" step="' + i.step + '" value="' + esc(q[i.key]) + '" data-q="' + i.key + '" inputmode="decimal"></label>';
    }).join("") + "</fieldset>";
    if (anyOpt) h += '<label class="incl"><input type="checkbox" data-incl' + (INCL[o.id] ? " checked" : "") + "> " + esc(t("inclOpt")) + "</label>";
    h += '<div class="tw"><table class="tbl costtbl"><thead><tr><th>' + esc(t("lineCol")) + "</th><th>" + esc(t("unitCol")) + '</th><th class="num">' + esc(t("amountCol")) + "</th></tr></thead><tbody>";
    lines.forEach(function (l, i) {
      h += '<tr' + (l.opt ? ' class="optrow"' : "") + '><td><span class="sn">' + l.n + "</span> " + esc(l.label) + (l.opt ? ' <span class="star" title="' + esc(t("optional")) + '">★</span>' : "") + (l.c.cash ? ' <span class="cashtag">' + esc(t("cashTag")) + "</span>" : "") + "</td><td>" + esc(unitText(o, l.c)) + '</td><td class="num" data-line="' + i + '"></td></tr>';
    });
    h += '</tbody><tfoot><tr><th colspan="2">' + esc(t("total")) + '</th><th class="num" data-total></th></tr><tr class="sub"><td colspan="2">' + esc(t("cashOnly")) + '</td><td class="num" data-cash></td></tr>' +
      (o.perunit ? '<tr class="sub"><td colspan="2">' + esc(L(o.perunit.label)) + '</td><td class="num" data-unit></td></tr>' : "") + "</tfoot></table></div>" +
      (anyOpt ? '<p class="tiny" data-optnote>' + esc(t("optLines")) + "</p>" : "") + "</div>";
    return h;
  }
  function wireCost(root, v) {
    var o = v.obj, q = qtys(o), lines = costLines(v), box = $("[data-est]", root); if (!box) return;
    function calc() {
      var incl = !!INCL[o.id], tot = 0, cash = 0;
      lines.forEach(function (l, i) {
        var val = lineValue(l.c, q), cell = $('[data-line="' + i + '"]', box), on = !l.opt || incl;
        cell.innerHTML = A.som(val.som) + (val.usd != null ? '<br><span class="tiny">' + esc(t("usdNote", { a: A.fmtN(val.usd, 2) })) + "</span>" : "");
        cell.parentNode.classList.toggle("off", !on);
        if (on) { tot += val.som; if (l.c.cash) cash += val.som; }
      });
      $("[data-total]", box).textContent = A.som(tot);
      $("[data-cash]", box).textContent = A.som(cash);
      var u = $("[data-unit]", box);
      if (u) { var n = (+q[o.perunit.key] || 0) * o.perunit.mult; u.textContent = n ? A.som(tot / n) : "—"; }
      var on = $("[data-optnote]", box); if (on) on.hidden = incl;
      var hdr = $("[data-costsum]"); if (hdr) hdr.textContent = A.som(tot);
    }
    $$("[data-q]", box).forEach(function (inp) { inp.addEventListener("input", function () { var x = parseFloat(inp.value.replace(",", ".")); q[inp.getAttribute("data-q")] = isNaN(x) || x < 0 ? 0 : x; calc(); }); });
    var ic = $("[data-incl]", box); if (ic) ic.addEventListener("change", function () { INCL[o.id] = ic.checked; calc(); });
    calc();
  }
  function totalCost(v) { var q = qtys(v.obj), s = 0; costLines(v).forEach(function (l) { if (!l.opt) s += lineValue(l.c, q).som; }); return s; }

  /* ---------- duration ---------- */
  function durSum(steps) {
    var r = { q: [0, 0], c: [0, 0], w: [0, 0] };
    steps.forEach(function (x) { var s = x.s || x; ["q", "c", "w"].forEach(function (k, j) { var a = s[["queue", "counter", "wait"][j]] || [0, 0]; r[k][0] += a[0]; r[k][1] += a[1]; }); });
    return r;
  }
  function fmtMin(m) { m = Math.round(m); var h = Math.floor(m / 60), mm = m % 60; return (h ? h + " " + t("hU") + (mm ? " " : "") : "") + (mm || !h ? mm + " " + t("mU") : ""); }
  function fmtDays(d) { return d + " " + t("dU"); }
  function fmtTotal(days, mins) { var h = Math.round(mins / 60); return days + " " + t("dU") + (h ? " " + h + " " + t("hU") : ""); }
  function durTable(steps) {
    var r = durSum(steps);
    return '<table class="tbl durtbl"><thead><tr><th></th><th class="num">' + esc(t("min")) + '</th><th class="num">' + esc(t("max")) + "</th></tr></thead><tbody>" +
      "<tr><th>" + esc(t("totalTime")) + '</th><td class="num"><b>' + esc(fmtTotal(r.w[0], r.q[0] + r.c[0])) + '</b></td><td class="num"><b>' + esc(fmtTotal(r.w[1], r.q[1] + r.c[1])) + "</b></td></tr>" +
      "<tr><td>" + esc(t("queueTime")) + '</td><td class="num">' + esc(fmtMin(r.q[0])) + '</td><td class="num">' + esc(fmtMin(r.q[1])) + "</td></tr>" +
      "<tr><td>" + esc(t("counterTime")) + '</td><td class="num">' + esc(fmtMin(r.c[0])) + '</td><td class="num">' + esc(fmtMin(r.c[1])) + "</td></tr>" +
      "<tr><td>" + esc(t("nextTime")) + '</td><td class="num">' + esc(fmtDays(r.w[0])) + '</td><td class="num">' + esc(fmtDays(r.w[1])) + "</td></tr></tbody></table>";
  }

  /* ---------- shared bits ---------- */
  function instLink(id) { var i = inst(id); return '<a href="/laws.html#i-' + id + '">' + esc(L(i.name)) + "</a>"; }
  function crumbs(list) { return '<nav class="crumbs" aria-label="breadcrumb">' + list.map(function (c, i) { return i < list.length - 1 ? '<a href="' + c[1] + '">' + esc(c[0]) + "</a>" : "<span>" + esc(c[0]) + "</span>"; }).join(' <span class="sep">›</span> ') + "</nav>"; }
  function panel(title, body, open, extra) {
    return '<section class="pnl' + (open ? " open" : "") + '"' + (extra || "") + '><h3 class="pnlh"><button type="button" aria-expanded="' + !!open + '"><span>' + title + "</span>" + CHEV + '</button></h3><div class="pnlb">' + body + "</div></section>";
  }
  function wirePanels(root) {
    $$(".pnlh button", root).forEach(function (b) {
      b.addEventListener("click", function () { var p = b.closest(".pnl"), o = !p.classList.contains("open"); p.classList.toggle("open", o); b.setAttribute("aria-expanded", o); });
    });
  }
  function statsLine(v) { return t("stats", { s: v.steps.length, i: stepsInsts(v).length, d: results(v).length }); }

  /* ---------- search bar ---------- */
  function searchBar(selOp, selProd, qv) {
    var ops = DATA.operations.filter(function (o) { return objsFor(o.id).length; });
    return '<form class="pill" id="pill" role="search"><label class="pseg ptext"><span class="plab">' + esc(t("searchBy")) + '</span><input type="search" id="pq" autocomplete="off" placeholder="' + esc(t("searchPh")) + '" value="' + esc(qv || "") + '"></label>' +
      '<label class="pseg"><span class="vh">' + esc(t("opSel")) + '</span><select id="pop"><option value="">' + esc(t("anyOp")) + "</option>" + ops.map(function (o) { return '<option value="' + o.id + '"' + (o.id === selOp ? " selected" : "") + ">" + esc(L(o.name)) + "</option>"; }).join("") + "</select></label>" +
      '<label class="pseg"><span class="vh">' + esc(t("prodSel")) + '</span><select id="ppr"></select></label>' +
      '<button class="pgo" type="submit" aria-label="' + esc(t("go")) + '">' + ARROW + "</button></form>";
  }
  function wireSearch(selProd) {
    var f = $("#pill"); if (!f) return;
    var sop = $("#pop"), spr = $("#ppr");
    function fillProd(keep) {
      var list = sop.value ? objsFor(sop.value) : DATA.objectives;
      spr.innerHTML = '<option value="">' + esc(t("anyProd")) + "</option>" + list.map(function (o) { return '<option value="' + o.id + '"' + (o.id === keep ? " selected" : "") + ">" + esc(L(o.productName)) + (sop.value ? "" : " (" + esc(L(op(o.op).name)) + ")") + "</option>"; }).join("");
    }
    fillProd(selProd);
    sop.addEventListener("change", function () { fillProd(""); });
    spr.addEventListener("change", function () { var o = obj(spr.value); if (o && !sop.value) { sop.value = o.op; fillProd(o.id); } });
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = $("#pq").value.trim(), o = spr.value, p = sop.value;
      if (o) location.href = "/procedures.html?op=" + obj(o).op + "&p=" + encodeURIComponent(o) + "#" + o;
      else if (q) location.href = "/procedures.html?q=" + encodeURIComponent(q) + (p ? "&op=" + p : "");
      else if (p) location.href = "/procedures.html?op=" + p;
      else location.href = "/procedures.html";
    });
  }

  /* ---------- home ---------- */
  var SLIDE_T = null;
  function home() {
    document.title = t("forBiz") + " | e-Irad";
    loading();
    load(function () {
      var S = A.S;
      var slides = [["/assets/img/hero-1.jpg", "heroH", "heroP"], ["/assets/img/hero-2.jpg", "heroH2", "heroP2"], ["/assets/img/hero-3.jpg", "heroH3", "heroP3"]];
      var h = '<section class="hero" aria-roledescription="carousel">' + slides.map(function (s, i) {
        return '<div class="slide' + (i === 0 ? " on" : "") + '" style="background-image:url(' + s[0] + ')" aria-hidden="' + (i !== 0) + '"><div class="wrap"><p class="sh">' + esc(t(s[1])) + '</p><p class="sp">' + esc(t(s[2])) + "</p></div></div>";
      }).join("") + '<div class="wrap herobar"><h1 class="vh">' + esc(t("forBiz")) + ": " + esc(t("heroH")) + "</h1>" + searchBar("", "", "") + '<div class="dots">' + slides.map(function (s, i) { return '<button type="button" data-sl="' + i + '"' + (i === 0 ? ' aria-current="true"' : "") + ' aria-label="' + (i + 1) + '"></button>'; }).join("") + "</div></div></section>";
      h += '<div class="tabs4"><div class="wrap"><a href="#how" data-tab="how">' + esc(t("tab_how")) + '</a><a href="/laws.html">' + esc(t("tab_laws")) + '</a><a href="#services">' + esc(t("tab_services")) + '</a><a href="/status.html">' + esc(t("tab_status")) + "</a></div></div>";
      h += '<div class="wrap page home">';
      h += '<section id="how" class="box howbox" hidden><h2 class="boxh">' + esc(t("howH")) + '</h2><div class="boxb">' + t("howP") + "</div></section>";
      h += '<section class="box"><h2 class="boxh">' + esc(t("objH")) + '</h2><div class="boxb"><div class="ops">' + DATA.operations.map(function (o) {
        var n = objsFor(o.id); if (!n.length) return "";
        return '<a class="opt" href="/procedures.html?op=' + o.id + '">' + opIcon(o.icon) + '<span class="opn">' + esc(L(o.name)) + '</span><span class="opd">' + esc(n.map(function (x) { return L(x.productName); }).join(" · ")) + "</span></a>";
      }).join("") + '</div><p class="more"><a href="/procedures.html">' + esc(t("seeAll")) + " »</a></p></div></section>";
      var bl = S.list.filter(function (s) { return s.sec.indexOf("b") >= 0; });
      h += '<section class="box" id="services"><h2 class="boxh">' + esc(t("bizSvcH")) + '</h2><div class="boxb"><p class="tiny">' + esc(t("bizSvcP")) + '</p><div class="svcs">' + bl.map(function (s) { return A.card(s, "b"); }).join("") + '</div><p class="note">' + esc(t("bizToCit")) + ' <a href="/citizens.html">' + esc(t("forCit")) + "</a>.</p></div></section>";
      h += "</div>";
      $("#app").innerHTML = h;
      wireSearch("");
      var cur = 0, sl = $$(".slide"), dots = $$("[data-sl]");
      function show(i) { cur = i; sl.forEach(function (s, j) { s.classList.toggle("on", j === i); s.setAttribute("aria-hidden", j !== i); }); dots.forEach(function (d, j) { if (j === i) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current"); }); }
      dots.forEach(function (d) { d.addEventListener("click", function () { show(+d.getAttribute("data-sl")); restart(); }); });
      function restart() { if (SLIDE_T) clearInterval(SLIDE_T); if (!window.matchMedia || !matchMedia("(prefers-reduced-motion: reduce)").matches) SLIDE_T = setInterval(function () { show((cur + 1) % sl.length); }, 7000); }
      restart();
      function showHow() { var b = $("#how"); b.hidden = false; }
      $('[data-tab="how"]').addEventListener("click", function () { showHow(); });
      if (location.hash === "#how") showHow();
    });
  }

  /* ---------- procedures (objective pages, search) ---------- */
  function objPanelBody(o) {
    var n = 0, h = '<p class="objintro">' + esc(L(o.intro)) + '</p><ol class="chain">';
    o.items.forEach(function (it) {
      n++;
      if (it.proc) {
        var p = DATA.procedures[it.proc];
        h += '<li class="pc"><span class="pcn">' + n + '</span><div><a class="pct" href="/procedure.html?id=' + it.proc + '">' + esc(L(p.title)) + (p.steps.every(function (s) { return s.optional; }) ? ' <span class="opttag">★ ' + esc(t("optional")) + "</span>" : "") + '</a><p class="pcd">' + esc(L(p.desc)) + ' <span class="pci">' + instLink(p.inst) + "</span></p></div></li>";
      } else {
        h += '<li class="pc"><span class="pcn">' + n + '</span><div><span class="pct">' + esc(L(it.title)) + '</span><p class="pcd">' + esc(L(it.desc)) + '</p><ul class="subopts">' + it.options.map(function (pid) {
          var p = DATA.procedures[pid]; return '<li><a href="/procedure.html?id=' + pid + '">' + esc(L(p.title)) + '</a><p class="pcd">' + esc(L(p.desc)) + "</p></li>";
        }).join("") + "</ul></div></li>";
      }
    });
    var v = view(o.id);
    h += '</ol><a class="fullcard" href="/procedure.html?id=' + o.id + '"><span class="fct">' + esc(t("full")) + ": " + esc(L(o.title)) + '</span><span class="fcd">' + esc(t("fullDesc")) + " " + esc(statsLine(v)) + '</span><span class="fcx">' + esc(A.som(totalCost(v))) + " · " + esc(fmtTotal(durSum(v.steps).w[0], 0)) + "–" + esc(fmtTotal(durSum(v.steps).w[1], 0)) + "</span></a>";
    return h;
  }
  function procedures() {
    loading();
    load(function () {
      var qs = new URLSearchParams(location.search), opId = qs.get("op"), pId = qs.get("p") || (location.hash ? location.hash.slice(1) : ""), q = (qs.get("q") || "").trim();
      var o = op(opId), h = '<div class="wrap page">';
      h += crumbs([["e-Irad", "/"], [t("secBiz"), "/business.html"], [t("nav_proc"), "/procedures.html"]].concat(o ? [[L(o.name), ""]] : q ? [[t("searchRes", { q: q }), ""]] : []).map(function (c, i, a) { return i === a.length - 1 ? [c[0], ""] : c; }));
      h += '<div class="psearch">' + searchBar(opId || "", pId, q) + "</div>";
      if (q) {
        var ql = q.toLowerCase(), hits = [];
        DATA.objectives.forEach(function (ob) {
          if (opId && ob.op !== opId) return;
          var hay = [L(ob.title), L(ob.intro), L(ob.productName), ob.title.en, ob.productName.en, L(op(ob.op).name)].join(" ").toLowerCase();
          if (hay.indexOf(ql) >= 0) hits.push(["/procedure.html?id=" + ob.id, t("full") + ": " + L(ob.title), L(ob.intro), L(op(ob.op).name)]);
          ob.items.forEach(function (it) {
            (it.proc ? [it.proc] : it.options).forEach(function (pid) {
              var p = DATA.procedures[pid], hy = [L(p.title), L(p.desc), p.title.en, L(inst(p.inst).name)].join(" ").toLowerCase();
              if (hy.indexOf(ql) >= 0) hits.push(["/procedure.html?id=" + pid, L(p.title), L(p.desc), L(op(ob.op).name) + " · " + L(ob.productName)]);
            });
          });
        });
        h += '<h1>' + esc(t("searchRes", { q: q })) + '</h1><p class="tiny">' + esc(t("resultsFor", { n: hits.length })) + "</p>" + (hits.length ? '<ul class="hits">' + hits.map(function (x) { return '<li><a href="' + x[0] + '">' + esc(x[1]) + '</a><p class="pcd">' + esc(x[2]) + '</p><span class="tagline">' + esc(x[3]) + "</span></li>"; }).join("") + "</ul>" : '<p class="warn">' + esc(t("noRes")) + "</p>");
      } else if (o) {
        h += '<div class="objhead">' + opIcon(o.icon) + "<div><h1>" + esc(L(o.name)) + '</h1><p class="lead">' + esc(L(o.desc)) + "</p></div></div>";
        var list = objsFor(o.id);
        h += list.map(function (ob, i) { return panel(esc(L(ob.productName)), objPanelBody(ob), ob.id === pId || (!pId && list.length === 1), ' id="' + ob.id + '"'); }).join("");
        h += '<p class="more"><a href="/procedures.html">« ' + esc(t("allObj")) + "</a></p>";
      } else {
        h += "<h1>" + esc(t("procH")) + '</h1><p class="lead">' + esc(t("procP")) + "</p>";
        h += DATA.operations.map(function (oo) {
          var list = objsFor(oo.id); if (!list.length) return "";
          return panel(opIcon(oo.icon) + " " + esc(L(oo.name)), '<ul class="objlist">' + list.map(function (ob) { var v = view(ob.id); return '<li><a href="/procedures.html?op=' + oo.id + "&p=" + ob.id + "#" + ob.id + '">' + esc(L(ob.title)) + '</a> <span class="tiny">' + esc(statsLine(v)) + "</span></li>"; }).join("") + "</ul>", true);
        }).join("");
      }
      h += '<p class="tiny updated">' + esc(t("updatedOn", { d: A.fmtD(new Date(DATA.updated + "T00:00:00Z")) })) + "</p></div>";
      $("#app").innerHTML = h;
      wirePanels($("#app")); wireSearch(pId);
      if (o) document.title = L(o.name) + " | e-Irad"; else document.title = t("procH") + " | e-Irad";
      if (pId && $("#" + pId)) setTimeout(function () { $("#" + pId).scrollIntoView({ block: "start" }); }, 0);
    });
  }

  /* ---------- procedure page ---------- */
  function instCard(id, n) {
    var i = inst(id);
    return '<li class="ic"><img src="/assets/img/inst-' + i.pic + '.jpg" alt="" width="80" height="50" loading="lazy"><div><a href="/laws.html#i-' + id + '">' + esc(L(i.name)) + "</a>" + (i.note ? '<span class="notisez">' + esc(L(i.note)) + "</span>" : '<span class="tiny">' + esc(L(i.parent)) + "</span>") + '<span class="tiny">' + esc(t("stepsCount", { n: n })) + "</span></div></li>";
  }
  function docLine(d, extra) { var D = DATA.documents[d], v = D && D.valid ? ' <span class="valid">(' + esc(t("valid", { n: D.valid })) + ")</span>" : ""; return esc(docName(d)) + v + (extra ? ' <span class="tiny">' + extra + "</span>" : ""); }
  function summary(v) {
    var ins = stepsInsts(v), res = results(v), req = required(v);
    var h = '<aside class="sumcol"><h2 class="colh">' + esc(t("summary")) + "</h2>";
    h += panel(esc(t("instH", { n: ins.length })), '<ul class="iclist">' + ins.map(function (x) { return instCard(x[0], x[1]); }).join("") + "</ul>", ins.length <= 8);
    h += panel(esc(t("resH", { n: res.length })), '<ol class="doclist">' + res.map(function (x) { return "<li>" + docLine(x[0], esc(t("atStep", { n: x[1] }))) + (x[2] ? ' <span class="star">★</span>' : "") + "</li>"; }).join("") + "</ol>", false);
    h += panel(esc(t("reqH", { n: req.length })), '<ol class="doclist">' + req.map(function (x) { return "<li>" + docLine(x[0], esc(t("atStep", { n: x[1] })) + (x[2] ? " · " + esc(t("fromStep", { n: x[2] })) : "")) + "</li>"; }).join("") + "</ol>", false);
    h += panel(esc(t("costH")) + ' <span class="hsum" data-costsum></span>', costBox(v), true);
    h += panel(esc(t("durH")), durTable(v.steps), true);
    h += panel(esc(t("lawsH", { n: v.laws.length })), '<ul class="lawlist">' + v.laws.map(function (l) { var x = DATA.laws[l[0]]; return '<li><b>' + esc(L(x.no)) + "</b> " + esc(L(x.title)) + (l[1].length ? '<span class="tiny">' + esc(artText(l[1].join("; "))) + "</span>" : "") + "</li>"; }).join("") + "</ul>", false);
    return h + "</aside>";
  }
  function stepList(v) {
    var h = '<h2 class="colh">' + esc(t("steps", { n: v.steps.length })) + '</h2><ol class="steps">', last = null;
    v.steps.forEach(function (x, i) {
      if (v.full && x.proc !== last) { last = x.proc; h += '<li class="grp">' + esc(L(DATA.procedures[x.proc].title)) + "</li>"; }
      var s = x.s, ii = inst(s.inst);
      h += '<li class="st' + (s.optional ? " opt" : "") + '"><a href="?id=' + v.id + "&step=" + (i + 1) + '" data-step="' + (i + 1) + '"><span class="stn">' + (i + 1) + '</span><span class="stb"><span class="stt">' + esc(L(s.title)) + (s.optional ? ' <span class="opttag">★ ' + esc(t("optional")) + "</span>" : "") + '</span><span class="sti">' + esc(L(ii.name)) + "</span></span></a></li>";
    });
    return h + "</ol>";
  }
  function stepDetail(v, n) {
    var x = v.steps[n - 1], s = x.s, i = inst(s.inst), made = {};
    v.steps.forEach(function (y, k) { if (k < n - 1) (y.s.gives || []).forEach(function (d) { if (!made[d]) made[d] = k + 1; }); });
    var h = '<div class="stepview"><p class="stepnav"><a href="?id=' + v.id + '" data-step="0">« ' + esc(t("allSteps")) + '</a><span class="tiny">' + esc(t("stepOf", { n: n, m: v.steps.length })) + "</span></p>";
    h += '<h2 class="sdh"><span class="stn">' + n + "</span> " + esc(L(s.title)) + (s.optional ? ' <span class="opttag">★ ' + esc(t("optional")) + "</span>" : "") + "</h2>";
    if (v.full) h += '<p class="tiny">' + esc(t("partOf", { p: L(DATA.procedures[x.proc].title) })) + ' · <a href="/procedure.html?id=' + x.proc + '">»</a></p>';
    if (s.note) h += '<p class="snote">' + esc(L(s.note)) + "</p>";
    h += '<div class="sbox"><div class="sinst"><img src="/assets/img/inst-' + i.pic + '.jpg" alt="" width="160" height="100"><div><h3>' + esc(t("inst")) + "</h3><p><b>" + esc(L(i.name)) + "</b><br>" + esc(L(i.parent)) + "</p>" + (i.note ? '<p class="notisez">' + esc(L(i.note)) + "</p>" : "") + "</div></div>" +
      '<dl class="kvs">' + "<dt>" + esc(t("where")) + "</dt><dd>" + esc(L(s.where || i.address)) + "</dd><dt>" + esc(t("hours")) + "</dt><dd>" + esc(L(s.hours || i.hours)) + "</dd><dt>" + esc(t("phone")) + "</dt><dd>" + esc(i.phone) + "</dd>" + (s.who ? "<dt>" + esc(t("who")) + "</dt><dd>" + esc(L(s.who)) + "</dd>" : "") + "</dl></div>";
    h += "<h3>" + esc(t("bring")) + "</h3>" + ((s.needs || []).length ? '<ul class="doclist">' + s.needs.map(function (d) { return "<li>" + docLine(d, made[d] ? esc(t("fromStep", { n: made[d] })) : "") + "</li>"; }).join("") + "</ul>" : "<p>" + esc(t("noDocs")) + "</p>");
    h += "<h3>" + esc(t("receive")) + "</h3>" + ((s.gives || []).length ? '<ul class="doclist">' + s.gives.map(function (d) { return "<li>" + docLine(d) + "</li>"; }).join("") + "</ul>" : "<p>" + esc(t("noDocs")) + "</p>");
    var q = qtys(v.obj);
    h += "<h3>" + esc(t("stepCost")) + "</h3>" + ((s.cost || []).length ? '<table class="tbl costtbl"><tbody>' + s.cost.map(function (c) { var val = lineValue(c, q); return "<tr><td>" + esc(c.label ? L(c.label) : L(s.title)) + (c.cash ? ' <span class="cashtag">' + esc(t("cashTag")) + "</span>" : "") + "</td><td>" + esc(unitText(v.obj, c)) + '</td><td class="num">' + A.som(val.som) + "</td></tr>"; }).join("") + "</tbody></table>" : "<p>" + esc(t("noCost")) + "</p>");
    h += "<h3>" + esc(t("stepDur")) + "</h3>" + durTable([x]);
    h += '<p class="stepbtns">' + (n > 1 ? '<a class="btn ghost" href="?id=' + v.id + "&step=" + (n - 1) + '" data-step="' + (n - 1) + '">« ' + esc(t("prev")) + "</a>" : "") + (n < v.steps.length ? '<a class="btn" href="?id=' + v.id + "&step=" + (n + 1) + '" data-step="' + (n + 1) + '">' + esc(t("next")) + " »</a>" : "") + "</p></div>";
    return h;
  }
  function procedure() {
    loading();
    load(function () {
      var qs = new URLSearchParams(location.search), id = qs.get("id"), v = id ? view(id) : null;
      if (!v) { A.pageNF(); return; }
      var stepN = Math.max(0, Math.min(v.steps.length, parseInt(qs.get("step"), 10) || 0));
      var o = v.obj, oo = op(o.op), ref = "PR-" + ("0000" + (A.hash(id) % 100000)).slice(-5);
      document.title = L(v.title) + " | e-Irad";
      var h = '<div class="wrap page procpage">' + crumbs([["e-Irad", "/"], [t("secBiz"), "/business.html"], [t("nav_proc"), "/procedures.html"], [L(oo.name), "/procedures.html?op=" + oo.id], [L(o.productName), "/procedures.html?op=" + oo.id + "&p=" + o.id + "#" + o.id], [L(v.title), ""]]);
      h += '<div class="phead"><h1>' + (v.full ? '<span class="fulltag">' + esc(t("full")) + "</span> " : "") + esc(L(v.title)) + '</h1><p class="tags"><a href="/procedures.html?op=' + oo.id + '">' + esc(L(oo.name)) + '</a><a href="/procedures.html?op=' + oo.id + "&p=" + o.id + "#" + o.id + '">' + esc(L(o.productName)) + '</a></p><p class="pdesc">' + esc(v.full ? L(o.intro) : L(v.desc)) + '</p>' +
        '<div class="pbtns"><button type="button" class="btn" data-act="contact">' + esc(t("contactBtn")) + '</button><button type="button" class="btn ghost" data-act="ctx" aria-expanded="false">' + esc(t("contextBtn")) + " ▾</button>" +
        '<button type="button" class="btn ghost icon" data-act="print" title="' + esc(t("printBtn")) + '"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 9V3h12v6M6 18H4v-7h16v7h-2M7 14h10v7H7z"/></svg><span class="vh">' + esc(t("printBtn")) + "</span></button>" +
        '<button type="button" class="btn ghost icon" data-act="share" title="' + esc(t("shareBtn")) + '"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.9 7.6-4.6M8.2 13.1l7.6 4.6"/></svg><span class="vh">' + esc(t("shareBtn")) + "</span></button></div>" +
        '<div class="ctx" hidden>' + esc(L(v.ctx)) + "</div>" +
        '<div class="contactnote" hidden role="dialog" aria-label="' + esc(t("contactH")) + '"><h3>' + esc(t("contactH")) + "</h3><p>" + esc(t("contactP")) + '</p><dl class="kvs"><dt>' + esc(t("ref")) + "</dt><dd><b>" + ref + "</b></dd><dt>" + esc(t("phone")) + "</dt><dd>+996-39-2-27-14-14</dd><dt>E-mail</dt><dd><a href=\"mailto:help@e-irad.org?subject=" + ref + '">help@e-irad.org</a></dd><dt>' + esc(t("hours")) + "</dt><dd>" + esc(t("footHours")) + '</dd></dl><button type="button" class="btn ghost" data-act="close">' + esc(t("close")) + '</button></div><p class="sharemsg tiny" hidden></p></div>';
      h += '<div class="pgrid"><div class="stepcol" id="stepcol">' + (stepN ? stepDetail(v, stepN) : stepList(v)) + "</div>" + summary(v) + "</div>";
      h += '<p class="tiny printonly">' + esc(t("printed", { d: A.fmtD(A.today()) })) + " · https://e-irad.org/procedure.html?id=" + esc(id) + '</p><p class="tiny updated">' + esc(t("updatedOn", { d: A.fmtD(new Date(DATA.updated + "T00:00:00Z")) })) + "</p></div>";
      $("#app").innerHTML = h;
      wirePanels($("#app")); wireCost($("#app"), v); wireSteps(v);
      $("[data-act=ctx]").addEventListener("click", function () { var c = $(".ctx"), o2 = c.hidden; c.hidden = !o2; this.setAttribute("aria-expanded", o2); });
      $("[data-act=contact]").addEventListener("click", function () { $(".contactnote").hidden = false; $(".contactnote [data-act=close]").focus(); });
      $("[data-act=close]").addEventListener("click", function () { $(".contactnote").hidden = true; });
      $("[data-act=print]").addEventListener("click", function () { $$(".pnl").forEach(function (p) { p.classList.add("open"); }); window.print(); });
      $("[data-act=share]").addEventListener("click", function () {
        var u = location.origin + location.pathname + "?id=" + id, m = $(".sharemsg");
        function fallback() { m.innerHTML = esc(t("copyHint")) + ' <input type="text" readonly value="' + esc(u) + '" size="40">'; m.hidden = false; var i = $("input", m); i.select(); }
        try { navigator.clipboard.writeText(u).then(function () { m.textContent = t("copied"); m.hidden = false; }, fallback); } catch (e) { fallback(); }
      });
    });
  }
  function wireSteps(v) {
    $$("[data-step]", $("#stepcol")).forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var n = +a.getAttribute("data-step"), u = new URL(location.href);
        if (n) u.searchParams.set("step", n); else u.searchParams.delete("step");
        history.pushState(null, "", u.pathname + u.search);
        $("#stepcol").innerHTML = n ? stepDetail(v, n) : stepList(v);
        wireSteps(v);
        $("#stepcol").scrollIntoView({ block: "start", behavior: "auto" });
      });
    });
  }
  window.addEventListener("popstate", function () { if (document.body.getAttribute("data-page") === "procedure") procedure(); });

  /* ---------- forms, laws and contacts ---------- */
  function laws() {
    loading();
    load(function () {
      var cite = {}, issued = {};
      DATA.objectives.forEach(function (o) {
        var v = view(o.id);
        v.laws.forEach(function (l) { (cite[l[0]] = cite[l[0]] || []).indexOf(o.id) < 0 && cite[l[0]].push(o.id); });
        v.steps.forEach(function (x) { (x.s.gives || []).forEach(function (d) { if (RECEIPTS[d]) return; issued[d] = issued[d] || []; if (issued[d].indexOf(o.id) < 0) issued[d].push(o.id); }); });
      });
      function olinks(list) { return list.map(function (id) { var o = obj(id); return '<a href="/procedure.html?id=' + id + '">' + esc(L(o.title)) + "</a>"; }).join(", "); }
      var h = '<div class="wrap page">' + crumbs([["e-Irad", "/"], [t("secBiz"), "/business.html"], [t("lawsPageH"), ""]]) + "<h1>" + esc(t("lawsPageH")) + '</h1><p class="lead">' + esc(t("lawsPageP")) + "</p>";
      h += panel(esc(t("lawsList")) + " (" + Object.keys(DATA.laws).length + ")", '<ul class="lawlist big">' + Object.keys(DATA.laws).map(function (k) { var x = DATA.laws[k]; return '<li id="l-' + k + '"><b>' + esc(L(x.no)) + "</b> " + esc(L(x.title)) + (cite[k] ? '<span class="tiny">' + t("citedIn", { p: olinks(cite[k]) }) + "</span>" : "") + "</li>"; }).join("") + "</ul>", true);
      var docs = Object.keys(issued).sort(function (a, b) { return docName(a).localeCompare(docName(b)); });
      h += panel(esc(t("formsList")) + " (" + docs.length + ")", '<ul class="lawlist">' + docs.map(function (d) { return "<li>" + docLine(d) + '<span class="tiny">' + t("issuedIn", { p: olinks(issued[d]) }) + "</span></li>"; }).join("") + "</ul>", false);
      var ids = Object.keys(DATA.institutions).sort(function (a, b) { return L(inst(a).name).localeCompare(L(inst(b).name)); });
      h += panel(esc(t("contactsList")) + " (" + ids.length + ")", '<ul class="contacts">' + ids.map(function (id) {
        var i = inst(id); return '<li id="i-' + id + '"><img src="/assets/img/inst-' + i.pic + '.jpg" alt="" width="96" height="60" loading="lazy"><div><b>' + esc(L(i.name)) + '</b><span class="tiny">' + esc(L(i.parent)) + "</span>" + (i.note ? '<span class="notisez">' + esc(L(i.note)) + "</span>" : "") + '<dl class="kvs"><dt>' + esc(t("where")) + "</dt><dd>" + esc(L(i.address)) + "</dd><dt>" + esc(t("hours")) + "</dt><dd>" + esc(L(i.hours)) + "</dd><dt>" + esc(t("phone")) + "</dt><dd>" + esc(i.phone) + "</dd></dl></div></li>";
      }).join("") + "</ul>", true);
      h += "</div>";
      $("#app").innerHTML = h; wirePanels($("#app"));
      document.title = t("lawsPageH") + " | e-Irad";
      if (location.hash) { var el = document.getElementById(location.hash.slice(1)); if (el) { var p = el.closest(".pnl"); if (p) p.classList.add("open"); el.classList.add("hl"); setTimeout(function () { el.scrollIntoView({ block: "center" }); }, 0); } }
    });
  }

  return { business: home, procedures: procedures, procedure: procedure, laws: laws };
};
