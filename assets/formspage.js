/* e-Irad: Permits and forms (forms.html). Every printed form, permit and licence service and step-by-step guide in
   one place. Reads window.E_FORMS (assets/forms.js), window.E_SERVICES (assets/services.js) and, for the guides,
   data/procedures.json. Nothing is sent anywhere. Called by app.js as window.E_FORMSPAGE(). */
(function () {
  "use strict";
  var TX = {
    h: { en: "Permits and forms", ir: "Uruksattar jana formalar", ru: "Разрешения и формы" },
    lead: { en: "Every printed form of the state bodies served by e-Irad, the permits and licences you can prepare online, and the step-by-step guides, collected in one place.", ir: "e-Irad kızmat körsötkön mamlekettik organdardın bardık basma formaları, onlayn dayardalğan uruksattar menen litsenziyalar jana kadam-kadam jetekchiler bir jerde.", ru: "Все бланки государственных органов, обслуживаемых e-Irad, разрешения и лицензии, которые можно подготовить онлайн, и пошаговые руководства — в одном месте." },
    how: { en: "How to use the printed forms", ir: "Basma formalardı kantip koldonuu kerek", ru: "Как пользоваться бланками" },
    howList: {
      en: ["Print on white A4 paper, one side only, at 100% scale (“actual size”). Forms printed at another scale are not accepted.", "Complete in block capitals in black or dark blue ink. Do not sign until the official asks you to.", "Bring the form with the originals of every document it lists. Forms are not accepted by e-mail, fax or through the portal.", "Forms are free of charge. A form sold to you by anyone, including at the door of an office, should be reported to the office."],
      ir: ["Ak A4 kağazğa, bir jağına gana, 100% masshtabta (“naktı ölchömü”) basıp chıgarıñız. Bashka masshtabta basılgan formalar kabıl alınbayt.", "Basma tamgalar menen kara je kara-kök siya menen tolturuñuz. Kızmatker suramayınça kol koyboñuz.", "Formanı anda atalgan ar bir dokumenttin originaldarı menen alıp keliñiz. Formalar e-pochta, faks je portal arkıluu kabıl alınbayt.", "Formalar akısız. Sizge kimdir forma satsa, keñsenin eshiginin aldında da, bul tuuraluu keñsege kabarlañız."],
      ru: ["Печатайте на белой бумаге A4, с одной стороны, в масштабе 100% («фактический размер»). Бланки в другом масштабе не принимаются.", "Заполняйте печатными буквами чёрными или тёмно-синими чернилами. Не подписывайте до просьбы должностного лица.", "Приносите бланк с оригиналами всех перечисленных в нём документов. Бланки не принимаются по электронной почте, факсу или через портал.", "Бланки бесплатны. О продаже бланков, в том числе у дверей учреждения, сообщите в учреждение."]
    },
    search: { en: "Search forms by number or title", ir: "Formalardı nomeri je atı boyuncha izdöö", ru: "Поиск бланков по номеру или названию" },
    all: { en: "All", ir: "Baarı", ru: "Все" },
    body: { en: "Issuing body", ir: "Bergen organ", ru: "Выдающий орган" },
    form: { en: "Form", ir: "Forma", ru: "Форма" },
    title: { en: "Title", ir: "Atı", ru: "Название" },
    service: { en: "Service", ir: "Kızmat", ru: "Услуга" },
    open: { en: "online", ir: "onlayn", ru: "онлайн" },
    none: { en: "No forms match.", ir: "Tuura kelgen forma jok.", ru: "Бланков не найдено." },
    count: { en: "{n} forms", ir: "{n} forma", ru: "Бланков: {n}" },
    permits: { en: "Permits and licences you can prepare online", ir: "Onlayn dayardalğan uruksattar jana litsenziyalar", ru: "Разрешения и лицензии, которые можно подготовить онлайн" },
    guides: { en: "Step-by-step guides for businesses", ir: "Ishkanalar üchün kadam-kadam jetekchiler", ru: "Пошаговые руководства для предпринимателей" },
    guidesP: { en: "Every permit, stamp and window for an operation, in order, with costs and waiting times.", ir: "Ar bir operatsiya üchün bardık uruksattar, möörlör jana terezeler, tartibi menen, chıgımdarı jana kütüü möönöttörü menen.", ru: "Все разрешения, печати и окна для операции по порядку, с расходами и сроками." },
    post: { en: "Irad Pochtasy", ir: "Irad Pochtası", ru: "«Ирадпочта»" },
    postP: { en: "Postal forms are published by Irad Pochtasy on post.iradgov.org and are also available at every post office counter.", ir: "Pochta formaların Irad Pochtası post.iradgov.org saytında jarıyalayt; alar ar bir pochta bölümünün kassasında da bar.", ru: "Почтовые бланки публикует «Ирадпочта» на post.iradgov.org; они также есть в окне каждого отделения." },
    cats: {
      people: { en: "Documents and residence", ir: "Dokumentter jana jashoo jayı", ru: "Документы и регистрация" },
      pay: { en: "Bills and payments", ir: "Esepter jana tölömdör", ru: "Счета и платежи" },
      biz: { en: "Permits and business", ir: "Uruksattar jana ishkerdik", ru: "Разрешения и бизнес" },
      check: { en: "Checks and extracts", ir: "Tekshiruu jana köchürmölör", ru: "Проверки и выписки" },
      other: { en: "Other", ir: "Bashka", ru: "Прочее" },
      post: { en: "Post", ir: "Pochta", ru: "Почта" }
    }
  };
  var LANG = "en", q = new URLSearchParams(location.search);
  function getLang() {
    var l = "en";
    try { var sv = localStorage.getItem("eirad_lang"); if (sv) l = sv; } catch (e) {}
    q = new URLSearchParams(location.search);
    if (["en", "ir", "ru"].indexOf(q.get("lang")) >= 0) l = q.get("lang");
    return l;
  }
  function L(o, v) { var s = o == null ? "" : (typeof o === "string" ? o : (o[LANG] != null ? o[LANG] : o.en)); return v ? String(s).replace(/\{(\w+)\}/g, function (m, k) { return v[k] != null ? v[k] : m; }) : s; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var PDF = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/></svg>';

  window.E_FORMSPAGE = function () {
    LANG = getLang();
    var F = window.E_FORMS || { list: [], agencies: {} }, S = window.E_SERVICES || { list: [] };
    var svcById = {};
    S.list.forEach(function (s) { svcById[s.id] = s; });
    var order = ["people", "pay", "biz", "check", "other", "post"];
    var cat = q.get("cat") || "", term = q.get("q") || "", agency = q.get("body") || "";
    var app = document.getElementById("app");
    var agencies = Object.keys(F.agencies).filter(function (a) { return F.list.some(function (f) { return f.agency === a; }); });
    app.innerHTML =
      '<div class="wrap page"><p class="crumbs"><a href="/">e-Irad</a> <span class="sep">›</span> ' + esc(L(TX.h)) + '</p>' +
      "<h1>" + esc(L(TX.h)) + '</h1><p class="lead">' + esc(L(TX.lead)) + "</p>" +
      '<div class="box"><h2 class="boxh">' + esc(L(TX.how)) + '</h2><div class="boxb"><ol class="objlist">' + L(TX.howList).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ol></div></div>" +
      '<div class="box" id="forms"><h2 class="boxh">' + esc(L(TX.form)) + " · PDF</h2><div class=\"boxb\">" +
      '<div class="fmfilter"><input id="fq" type="search" placeholder="' + esc(L(TX.search)) + '" value="' + esc(term) + '" aria-label="' + esc(L(TX.search)) + '">' +
      '<select id="fb" aria-label="' + esc(L(TX.body)) + '"><option value="">' + esc(L(TX.body)) + ": " + esc(L(TX.all)) + "</option>" + agencies.map(function (a) { return '<option value="' + a + '"' + (a === agency ? " selected" : "") + ">" + esc(L(F.agencies[a])) + "</option>"; }).join("") + "</select></div>" +
      '<div class="fmcats" role="tablist">' + ['<button type="button" data-cat=""' + (!cat ? ' aria-pressed="true"' : "") + ">" + esc(L(TX.all)) + "</button>"].concat(order.map(function (c) { return '<button type="button" data-cat="' + c + '"' + (cat === c ? ' aria-pressed="true"' : "") + ">" + esc(L(TX.cats[c])) + "</button>"; })).join("") + "</div>" +
      '<p class="tiny" id="fcount"></p><div id="flist"></div></div></div>' +
      '<div class="box" id="permits"><h2 class="boxh">' + esc(L(TX.permits)) + '</h2><div class="boxb"><div class="ops" id="plist"></div></div></div>' +
      '<div class="box" id="guides"><h2 class="boxh">' + esc(L(TX.guides)) + '</h2><div class="boxb"><p>' + esc(L(TX.guidesP)) + '</p><ul class="objlist" id="glist"></ul></div></div>' +
      '<div class="box" id="post"><h2 class="boxh">' + esc(L(TX.post)) + '</h2><div class="boxb"><p>' + esc(L(TX.postP)) + "</p></div></div></div>";

    function render() {
      var t = term.trim().toLowerCase();
      var rows = F.list.filter(function (f) {
        if (cat && f.cat !== cat) return false;
        if (agency && f.agency !== agency) return false;
        if (!t) return true;
        return (f.code + " " + f.title.en + " " + f.title.ir + " " + f.title.ru + " " + L(F.agencies[f.agency])).toLowerCase().indexOf(t) >= 0;
      });
      document.getElementById("fcount").textContent = L(TX.count, { n: rows.length });
      if (!rows.length) { document.getElementById("flist").innerHTML = "<p>" + esc(L(TX.none)) + "</p>"; return; }
      var html = "";
      order.forEach(function (c) {
        var part = rows.filter(function (f) { return f.cat === c; });
        if (!part.length) return;
        html += '<h3 class="fmh">' + esc(L(TX.cats[c])) + '</h3><table class="fmt"><thead><tr><th>' + esc(L(TX.form)) + "</th><th>" + esc(L(TX.title)) + "</th><th>" + esc(L(TX.body)) + "</th><th>" + esc(L(TX.service)) + "</th><th>PDF</th></tr></thead><tbody>" +
          part.map(function (f) {
            var s = f.service && svcById[f.service];
            return '<tr><td class="fmc">' + esc(f.code) + "</td><td>" + esc(L(f.title)) + '</td><td class="tiny">' + esc(L(F.agencies[f.agency])) + "</td><td>" +
              (s ? '<a href="/service.html?id=' + s.id + '">' + esc(L(s.name)) + "</a>" : "") + '</td><td><a class="fmpdf" href="' + esc(f.url) + '" target="_blank" rel="noopener">' + PDF + " " + esc(f.code) + (f.kb ? ' <span class="tiny">(' + f.kb + " KB)</span>" : "") + "</a></td></tr>";
          }).join("") + "</tbody></table>";
      });
      document.getElementById("flist").innerHTML = html;
    }
    function upd() {
      var u = new URLSearchParams(location.search);
      ["q", "cat", "body"].forEach(function (k) { u.delete(k); });
      if (term) u.set("q", term); if (cat) u.set("cat", cat); if (agency) u.set("body", agency);
      try { history.replaceState(null, "", location.pathname + (u.toString() ? "?" + u : "") + location.hash); } catch (e) {}
      render();
    }
    document.getElementById("fq").addEventListener("input", function (e) { term = e.target.value; upd(); });
    document.getElementById("fb").addEventListener("change", function (e) { agency = e.target.value; upd(); });
    Array.prototype.forEach.call(document.querySelectorAll(".fmcats button"), function (b) {
      b.addEventListener("click", function () {
        cat = b.getAttribute("data-cat");
        Array.prototype.forEach.call(document.querySelectorAll(".fmcats button"), function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        upd();
      });
    });
    render();

    // permits and licences: services in the business category and the licence-type services elsewhere
    var permitIds = S.list.filter(function (s) { return s.cat !== "check" && (s.cat === "biz" || /permit|licen|pass|registration/i.test(s.name.en)); });
    document.getElementById("plist").innerHTML = permitIds.map(function (s) {
      return '<a class="opt fmp" href="/service.html?id=' + s.id + '"><span class="opn">' + esc(L(s.name)) + '</span><span class="opd">' + esc(L(s.agency)) + "</span></a>";
    }).join("");

    // guides from the step-by-step data
    fetch("/data/procedures.json").then(function (r) { return r.json(); }).then(function (d) {
      document.getElementById("glist").innerHTML = (d.objectives || []).map(function (o) {
        return '<li><a href="/procedures.html?op=' + encodeURIComponent(o.op) + "&p=" + encodeURIComponent(o.id) + '">' + esc(L(o.title)) + "</a></li>";
      }).join("");
    }).catch(function () {});
  };
})();
