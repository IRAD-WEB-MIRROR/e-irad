/* e-Irad portal script: header, footer, language, catalogue, and the service flows.
   No form on e-Irad sends anything: there is no network call in this file. */
(function () {
  "use strict";
  var I = window.E_I18N, S = window.E_SERVICES;
  var LANGS = ["en", "ir", "ru"], LANG = "en";
  try { var sv = localStorage.getItem("eirad_lang"); if (LANGS.indexOf(sv) >= 0) LANG = sv; } catch (e) {}
  var qs = new URLSearchParams(location.search);
  if (LANGS.indexOf(qs.get("lang")) >= 0) LANG = qs.get("lang");
  var PAGE = document.body.getAttribute("data-page");
  var GOV = "https://iradgov.org/";

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fill(s, v) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return v && v[k] != null ? v[k] : m; }); }
  function t(k, v) { var d = I.ui[LANG]; var s = d[k] != null ? d[k] : I.ui.en[k]; return v ? fill(s, v) : s; }
  function L(o, v) { if (o == null) return ""; var s = typeof o === "string" ? o : (o[LANG] != null ? o[LANG] : o.en); return v ? fill(s, v) : s; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function iradNow() { var n = new Date(); return new Date(n.getTime() + n.getTimezoneOffset() * 60000 + 6 * 3600000); }
  function today() { var d = iradNow(); return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); }
  function addDays(d, n) { var x = new Date(d.getTime()); x.setUTCDate(x.getUTCDate() + n); return x; }
  function fmtD(d) { var M = I.ui[LANG].months; return LANG === "ir" ? d.getUTCDate() + "-" + M[d.getUTCMonth()] + " " + d.getUTCFullYear() : d.getUTCDate() + " " + M[d.getUTCMonth()] + " " + d.getUTCFullYear(); }
  function fmtN(x, dp) { var s = Number(x).toFixed(dp || 0); var p = s.split("."); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, LANG === "en" ? "," : " "); return p.join(LANG === "en" ? "." : ","); }
  function som(x) { return fmtN(x, 2) + " " + t("som"); }
  function norm(s) { return String(s || "").toUpperCase().replace(/[\s\-\.]/g, ""); }
  function svc(id) { for (var i = 0; i < S.list.length; i++) if (S.list[i].id === id) return S.list[i]; return null; }

  var ICONS = {
    id: '<path d="M4 5h16v14H4z"/><circle cx="9" cy="11" r="2.2"/><path d="M6 16c.6-1.6 1.7-2.4 3-2.4s2.4.8 3 2.4M14 10h4M14 13h3"/>',
    ticket: '<path d="M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4z"/><path d="M10 7v10" stroke-dasharray="2 2"/>',
    shop: '<path d="M4 9l1.5-4h13L20 9M4 9h16v2a2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0zM5 12v7h14v-7M10 19v-4h4v4"/>',
    chart: '<path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6"/>',
    bolt: '<path d="M13 3 5 14h6l-1 7 8-11h-6z"/>',
    drop: '<path d="M12 3c3.5 4.5 6 7.7 6 10.5A6 6 0 0 1 6 13.5C6 10.7 8.5 7.5 12 3z"/>',
    car: '<path d="M5 16V12l2-5h10l2 5v4M5 16h14M5 16v2M19 16v2"/><circle cx="8" cy="13.5" r="1"/><circle cx="16" cy="13.5" r="1"/>',
    box: '<path d="M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8"/>',
    shield: '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="m9 12 2 2 4-4"/>',
    route: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h6"/>',
    doc: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 12h7M9 16h5"/>',
    home: '<path d="M4 11 12 4l8 7M6 9.5V20h12V9.5M10 20v-6h4v6"/>',
    flame: '<path d="M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-5 .3 2 1.2 3 2.5 3.5C11 9 11 6 12 3z"/>',
    heat: '<rect x="4" y="5" width="3.4" height="13" rx="1.7"/><rect x="10.3" y="5" width="3.4" height="13" rx="1.7"/><rect x="16.6" y="5" width="3.4" height="13" rx="1.7"/><path d="M7.4 8h2.9M13.7 8h2.9M7.4 15h2.9M13.7 15h2.9M5.7 18v2M18.3 18v2"/>',
    calc: '<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M8 6.5h8v3.5H8zM8.5 13.5h1M11.5 13.5h1M14.5 13.5h1M8.5 17h1M11.5 17h1M14.5 17h1"/>',
    blocks: '<path d="M4 20h7v-7H4zM13 20h7v-7h-7zM8.5 13h7V6h-7z"/>',
    search: '<circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 5 5"/>',
    scales: '<path d="M12 4v16M8 20h8M5 7h14M5 7l-3 6a3 3 0 0 0 6 0zM19 7l-3 6a3 3 0 0 0 6 0z"/>',
    stamp: '<path d="M9.5 11V8.5a2.5 2.5 0 1 1 5 0V11M5 15v-2.5A1.5 1.5 0 0 1 6.5 11h11a1.5 1.5 0 0 1 1.5 1.5V15zM5 18.5h14"/>',
    cap: '<path d="M2 9l10-5 10 5-10 5zM6 11v5c3 2.5 9 2.5 12 0v-5M21 9.5V15"/>',
    sign: '<path d="M4 5h16v8H4zM8 13v7M16 13v7M7.5 9h9"/>',
    bottle: '<path d="M10 3h4M10.5 3v4L8 10v10h8V10l-2.5-3V3M8 13.5h8"/>',
    fish: '<path d="M3 12c3-4.5 9-6 14-1l4-3v8l-4-3c-5 5-11 3.5-14-1z"/><circle cx="7.5" cy="11" r=".8"/>',
    people: '<circle cx="8" cy="8" r="2.5"/><circle cx="16" cy="8" r="2.5"/><path d="M3 19c.5-3.5 2.5-5.5 5-5.5s4.5 2 5 5.5M11 19c.5-3.5 2.5-5.5 5-5.5s4.5 2 5 5.5"/>',
    mail: '<path d="M3 6h18v12H3z"/><path d="m3 6 9 7 9-7"/>',
    paw: '<circle cx="6.5" cy="10" r="1.6"/><circle cx="10" cy="6.5" r="1.6"/><circle cx="14" cy="6.5" r="1.6"/><circle cx="17.5" cy="10" r="1.6"/><path d="M12 11c-3 0-5.5 4-5.5 6.5 0 1.5 1.2 2.2 2.5 2 1.2-.2 2-.6 3-.6s1.8.4 3 .6c1.3.2 2.5-.5 2.5-2 0-2.5-2.5-6.5-5.5-6.5z"/>',
    coin: '<circle cx="12" cy="12" r="8"/><path d="M12 6.5v11M14.5 9.3c-.3-.8-1.3-1.3-2.5-1.3-1.5 0-2.5.7-2.5 1.8s1 1.5 2.5 1.8 2.5.7 2.5 1.8-1 1.8-2.5 1.8c-1.2 0-2.2-.5-2.5-1.3"/>',
    archive: '<path d="M3 5h18v4H3zM5 9v10h14V9M10 13h4"/>',
    crane: '<path d="M7 21V4M7 4l12 4H4zM17 8v4M15.5 12h3v2.5h-3zM3 21h8"/>'
  };
  function icon(k) { return '<svg class="sic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[k] || ICONS.doc) + "</svg>"; }
  function badge(st) { return '<span class="badge b-' + st + '">' + esc(t("st_" + st)) + "</span>"; }

  /* ---------- chrome ---------- */
  // Sections: "b" For businesses, "c" For citizens, "x" shared pages, "land" the landing page.
  var NAVS = {
    b: [["bhome", "/business.html"], ["proc", "/procedures.html"], ["bservices", "/business.html#services"], ["laws", "/laws.html"], ["forms", "/forms.html"], ["status", "/status.html"], ["faq", "/faq.html"]],
    c: [["chome", "/citizens.html"], ["people", "/citizens.html#cat-people"], ["pay", "/citizens.html#cat-pay"], ["check", "/citizens.html#cat-check"], ["forms", "/forms.html"], ["faq", "/faq.html"], ["login", "/login.html"]],
    x: [["home", "/"], ["forms", "/forms.html"], ["status", "/status.html"], ["faq", "/faq.html"], ["contact", "/contact.html"], ["accessibility", "/accessibility.html"], ["login", "/login.html"]]
  };
  var NAVLBL = { people: "catPeople", pay: "catPay", check: "catCheck", accessibility: "footAcc" };
  var PAGESEC = { landing: "land", business: "b", procedures: "b", procedure: "b", laws: "b", citizens: "c", login: "c", vote: "c", tests: "c", appeals: "c", applications: "c" };
  var CUR = { business: "bhome", citizens: "chome", procedures: "proc", procedure: "proc", laws: "laws", login: "login", status: "status", faq: "faq", forms: "forms", contact: "contact", accessibility: "accessibility" };
  var LANG_ORDER = ["ir", "ru", "en"];
  function secOf(s) { var w = new URLSearchParams(location.search).get("s"); return w && s.sec.indexOf(w) >= 0 ? w : s.sec.charAt(0); }
  function SEC() { if (PAGE === "service") { var s = svc(new URLSearchParams(location.search).get("id")); return s ? secOf(s) : "x"; } return PAGESEC[PAGE] || "x"; }
  var MARK = '<img class="mark" src="/assets/mark.svg" alt="" width="34" height="34">';
  function chrome() {
    var sec = SEC(), cur = CUR[PAGE] || PAGE, nav = NAVS[sec] || [];
    $("#top").innerHTML =
      '<a class="skip" href="#main">' + esc(t("skip")) + "</a>" +
      '<div class="topline"><div class="wrap"><span class="welcome">' + esc(t("welcome")) + ' <a href="/faq.html">' + esc(t("welcomeMore")) + '</a></span>' +
      '<span class="langs" role="group" aria-label="' + esc(t("lang")) + '">' + LANG_ORDER.map(function (l) { return '<a href="?lang=' + l + '" data-lang="' + l + '" lang="' + I.htmlLang[l] + '"' + (l === LANG ? ' aria-current="true"' : "") + ">" + esc(I.langs[l]) + "</a>"; }).join('<span aria-hidden="true">|</span>') + "</span></div></div>" +
      '<header class="head sec-' + sec + '"><div class="wrap">' + (nav.length ? '<button class="burger" type="button" aria-expanded="false" aria-controls="mainnav"><span class="vh">' + esc(t("menu")) + '</span><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>' : "") +
      '<a class="brand" href="/"><img class="logo" src="/assets/logo.svg" alt="" width="42" height="42"><span class="bt"><b>e-Irad</b><small>' + esc(t("portalSub")) + "</small></span></a>" +
      '<a class="govlink" href="' + GOV + '" title="' + esc(t("footGov")) + '">' + MARK + "<span><b>" + esc(t("gov")) + "</b><small>" + esc(t("dic")) + "</small></span></a></div>" +
      (sec === "land" ? '<div class="landrule"></div>' :
      '<nav class="mainnav" aria-label="e-Irad"><div class="wrap"><ul id="mainnav">' +
      nav.map(function (n) { return '<li><a href="' + n[1] + '"' + (n[0] === cur ? ' aria-current="page"' : "") + (n[0] === "login" ? ' class="loginlink"' : "") + ">" + esc(t(NAVLBL[n[0]] || "nav_" + n[0])) + "</a></li>"; }).join("") +
      '</ul><div class="secsw" role="group" aria-label="' + esc(t("secSwitch")) + '"><a href="/business.html"' + (sec === "b" ? ' aria-current="true"' : "") + ">" + esc(t("secBiz")) + '</a><a href="/citizens.html"' + (sec === "c" ? ' aria-current="true"' : "") + ">" + esc(t("secCit")) + "</a></div></div></nav>") +
      "</header>" +
      (sec === "land" ? "" : '<div class="banner" role="status"><div class="wrap"><span class="dot" aria-hidden="true"></span><span>' + t("banner") + ' <a href="/status.html">' + esc(t("bannerMore")) + "</a></span></div></div>");
    var bg = $(".burger"); if (bg) bg.addEventListener("click", function () { var h = $(".head"); var o = !h.classList.contains("open"); h.classList.toggle("open", o); this.setAttribute("aria-expanded", o); });
    $$("[data-lang]").forEach(function (b) { b.addEventListener("click", function (e) { e.preventDefault(); setLang(b.getAttribute("data-lang")); }); });
    $("#bottom").innerHTML = '<footer class="foot">' + (sec === "b" ? '<div class="partners"><div class="wrap"><h2>' + esc(t("partnersH")) + '</h2><ul class="plogos">' +
      [["UNMI", { en: "Trade facilitation programme", ir: "Sooda jeñildetüü programması", ru: "Программа содействия торговле" }, "un"], ["CCI", { en: "Chamber of Commerce and Industry of Irad", ir: "Irad sooda-önör jay palatası", ru: "Торгово-промышленная палата Ирада" }, "cci"], ["IPO", { en: "Investment Promotion Office", ir: "Investitsiyalardı ilgeriletüü keñsesi", ru: "Офис содействия инвестициям" }, "ipo"], ["BS", { en: "Customs Service", ir: "Bajı kızmatı", ru: "Таможенная служба" }, "cus"], ["TSU", { en: "Talas State University", ir: "Talas mamlekettik universiteti", ru: "Таласский государственный университет" }, "tsu"]].map(function (p) {
        return '<li class="pl pl-' + p[2] + '"><span class="plm">' + esc(p[0]) + "</span><span>" + esc(L(p[1])) + "</span></li>";
      }).join("") + '</ul><p class="tiny">' + esc(t("credit")) + "</p></div></div>" : "") +
      '<div class="wrap"><div class="fcols"><div><div class="brand small"><img class="logo" src="/assets/logo.svg" alt="" width="30" height="30"><b>e-Irad</b></div><p>' + esc(t("footAbout")) + "</p><p>" + esc(t("footAddr")) + '<br>+996-39-2-27-14-14 · <a href="mailto:help@e-irad.org">help@e-irad.org</a><br>' + esc(t("footHours")) + "</p>" + '<a class="tulpar-ch" href="https://tulparapp.com/app/#sub=eirad" rel="noopener"><img src="/assets/tulpar.svg" alt="" width="20" height="20"><span>' + esc(t("footTulpar")) + "<small>@eirad</small></span></a></div>" +
      "<div><h4>e-Irad</h4><ul>" +
      '<li><a href="/business.html">' + esc(t("forBiz")) + '</a></li><li><a href="/procedures.html">' + esc(t("nav_proc")) + '</a></li><li><a href="/laws.html">' + esc(t("nav_laws")) + '</a></li><li><a href="/forms.html">' + esc(t("nav_forms")) + "</a></li>" +
      '<li><a href="/citizens.html">' + esc(t("forCit")) + '</a></li><li><a href="/login.html">' + esc(t("nav_login")) + "</a></li></ul></div>" +
      "<div><h4>" + esc(t("footLinks")) + '</h4><ul><li><a href="/status.html">' + esc(t("nav_status")) + '</a></li><li><a href="/faq.html">' + esc(t("nav_faq")) + '</a></li><li><a href="/contact.html">' + esc(t("nav_contact")) + '</a></li><li><a href="/accessibility.html">' + esc(t("footAcc")) + "</a></li></ul></div>" +
      "<div><h4>" + esc(t("footGov")) + '</h4><ul><li><a href="' + GOV + '">iradgov.org</a></li><li><a href="' + GOV + 'administration.html">' + esc({ en: "Administration", ir: "Administratsiya", ru: "Администрация" }[LANG]) + '</a></li><li><a href="https://tender.e-irad.org/">' + esc(t("footTender")) + '</a></li></ul><p class="tiny">' + esc(t("noPw")) + "</p></div></div>" +
      '<div class="fine"><span>' + esc(t("footCopy", { y: iradNow().getFullYear() })) + '</span><a class="fmark" href="' + GOV + '"><img src="/assets/mark-white.svg" alt="" width="26" height="26"><span>' + esc(t("gov")) + "</span></a></div></div></footer>";
  }
  function setLang(l) {
    if (l === LANG) return; LANG = l;
    try { localStorage.setItem("eirad_lang", l); } catch (e) {}
    var u = new URL(location.href); if (u.searchParams.has("lang")) { u.searchParams.delete("lang"); history.replaceState(null, "", u.pathname + u.search); }
    render();
  }

  /* ---------- texts used by the flows ---------- */
  var X = {
    office: { en: "Office", ir: "Bölüm", ru: "Отдел" },
    document: { en: "Document", ir: "Dokument", ru: "Документ" },
    docs: {
      P: { en: "Passport, first issue", ir: "Pasport, birinchi jolu", ru: "Паспорт, впервые" },
      R: { en: "Passport, renewal or replacement", ir: "Pasport, almashtıruu", ru: "Паспорт, замена" },
      I: { en: "ID card", ir: "ID-karta", ru: "ID-карта" },
      C: { en: "Residence card (foreign nationals)", ir: "Jashoo kartası (chet el jarandarı)", ru: "Вид на жительство (иностранцы)" }
    },
    take: { en: "Take a number", ir: "Kezek nomerin aluu", ru: "Взять номер" },
    yourNo: { en: "Your number", ir: "Siziñ nomeriñiz", ru: "Ваш номер" },
    place: { en: "Place in the queue", ir: "Kezektegi ordu", ru: "Место в очереди" },
    wait: { en: "Estimated wait", ir: "Boljoldoo kütüü", ru: "Ожидаемое ожидание" },
    weeks: { en: "{a}–{b} weeks", ir: "{a}–{b} juma", ru: "{a}–{b} нед." },
    calledBy: { en: "Numbers are called on the board at the office. Check your place here; the estimate is recalculated each week.", ir: "Nomerler bölümdögü tablodo chakırılat. Ordunuzdu bul jerden tekshiriñiz; boljol ar juma kayra eseptelet.", ru: "Номера вызываются на табло в отделе. Проверяйте место здесь; оценка пересчитывается каждую неделю." },
    bring: { en: "Bring to the counter", ir: "Kassaga ala kelüüchü dokumentter", ru: "Принести в окошко" },
    bringList: {
      en: ["Your ID card or old passport, and your birth certificate for a first passport", "Two photographs, 3.5 × 4.5 cm", "Your residence registration", "The receipt for the state fee (passport IS 120, ID card IS 60, residence card IS 300), paid at any Talasbank branch"],
      ir: ["Jeke kuböölügüñüz je eski pasportuñuz, birinchi pasport üchün tuuluu tuuraluu kübölük", "3,5 × 4,5 sm eki süröt", "Jashoo jayı boyuncha kattoo", "Mamlekettik alım tölöngönü tuuraluu kvitantsiya (pasport 120 som, ID-karta 60 som, jashoo kartası 300 som), Talasbanktın kaalagan filialında tölönöt"],
      ru: ["Удостоверение личности или старый паспорт; для первого паспорта свидетельство о рождении", "Две фотографии 3,5 × 4,5 см", "Регистрация по месту жительства", "Квитанция об оплате госпошлины (паспорт 120 сомов, ID-карта 60, вид на жительство 300) в любом отделении «Таласбанка»"]
    },
    myTickets: { en: "Your numbers on this device", ir: "Bul tüzmöktögü nomerleriñiz", ru: "Ваши номера на этом устройстве" },
    taken: { en: "taken {d}", ir: "{d} alıngan", ru: "получен {d}" },
    remove: { en: "Remove", ir: "Öchürüü", ru: "Удалить" },
    checkTicket: { en: "Check a number taken earlier", ir: "Murda alıngan nomerdi tekshirüü", ru: "Проверить ранее полученный номер" },
    ticketPh: { en: "e.g. TL-P-0417", ir: "mısalı: TL-P-0417", ru: "например, TL-P-0417" },
    ticketBad: { en: "Numbers look like TL-P-0417. Numbers given at the office counter can be checked only at that office.", ir: "Nomerler TL-P-0417 sıyaktuu bolot. Bölümdün kassasında berilgen nomerlerdi oshol bölümdö gana tekshirüügö bolot.", ru: "Номер выглядит как TL-P-0417. Номера, выданные в окошке отдела, проверяются только в этом отделе." },
    yourTurn: { en: "Your number is due to be called within a week. Come to the office with your documents.", ir: "Nomeriñiz bir jumanın ichinde chakırılat. Dokumentteriñiz menen bölümgö keliñiz.", ru: "Ваш номер вызовут в течение недели. Приходите в отдел с документами." }
  };

  /* ---------- catalogue ---------- */
  function svcHref(s, sec) { if (s.url) return s.url; return "/service.html?id=" + s.id + (sec && s.sec.length > 1 && s.sec.charAt(0) !== sec ? "&s=" + sec : ""); }
  function card(s, sec) {
    return '<a class="svc" href="' + svcHref(s, sec) + '" data-kw="' + esc((L(s.name) + " " + L(s.desc) + " " + s.keywords + " " + s.name.en).toLowerCase()) + '">' + icon(s.icon) +
      '<span class="sbody"><span class="sname">' + esc(L(s.name)) + '</span><span class="sdesc">' + esc(L(s.desc)) + "</span>" + badge(s.status) + "</span></a>";
  }
  /* ---------- service page ---------- */
  function field(id, label, html) { return '<div class="fld"><label for="' + id + '">' + esc(label) + "</label>" + html + '<span class="err" id="' + id + '-err" hidden>' + esc(t("required")) + "</span></div>"; }
  function sel(id, opts) { return '<select id="' + id + '">' + opts.map(function (o) { return '<option value="' + esc(o[0]) + '">' + esc(o[1]) + "</option>"; }).join("") + "</select>"; }
  function inp(id, ph, extra) { return '<input id="' + id + '" type="text" autocomplete="off" spellcheck="false" placeholder="' + esc(ph || "") + '"' + (extra || "") + ">"; }
  function need(id, test) { var el = $("#" + id), ok = test ? test(el.value) : el.value.trim() !== ""; $("#" + id + "-err").hidden = ok; el.setAttribute("aria-invalid", !ok); if (!ok) el.focus(); return ok; }
  function payBox(p) { return '<div class="paybox"><button type="button" class="btn ghost paybtn">' + esc(t("payBtn")) + '</button><div class="payinfo" hidden role="alert"><h4>' + esc(t("payH")) + "</h4><p>" + esc(t("payP")) + '</p><p><a href="https://pay.e-irad.org/' + (p ? "?p=" + p : "") + '">' + esc(t("paySlip")) + "</a></p></div></div>"; }
  function wirePay(root) { $$(".paybtn", root).forEach(function (b) { b.addEventListener("click", function () { b.nextElementSibling.hidden = false; b.disabled = true; }); }); }
  function result(html) { var r = $("#result"); r.innerHTML = html; r.hidden = false; wirePay(r); r.scrollIntoView({ block: "nearest" }); }
  function kv(rows) { return '<dl class="kvs">' + rows.map(function (r) { return "<dt>" + esc(r[0]) + "</dt><dd>" + r[1] + "</dd>"; }).join("") + "</dl>"; }
  function noForm(e) { e.preventDefault(); }

  var FLOWS = {};
  var HELP = {};

  /* passport */
  function loadTickets() { try { return JSON.parse(localStorage.getItem("eirad_tickets") || "[]"); } catch (e) { return []; } }
  function saveTickets(a) { try { localStorage.setItem("eirad_tickets", JSON.stringify(a.slice(-6))); } catch (e) {} }
  function officeBy(code) { for (var i = 0; i < S.offices.length; i++) if (S.offices[i].code === code) return S.offices[i]; return null; }
  function queueFor(no, takenISO) {
    var m = /^([A-Z]{2})-([PRIC])-(\d{4})$/.exec(no); if (!m) return null;
    var o = officeBy(m[1]); if (!o) return null;
    var h = hash(no);
    var start = takenISO ? o.base + (h % Math.round(o.base * 0.15)) : Math.round(o.base * (0.25 + (h % 80) / 100));
    var weeksGone = takenISO ? Math.max(0, Math.floor((today() - new Date(takenISO + "T00:00:00Z")) / 604800000)) : 0;
    var pos = Math.max(1, start - weeksGone * o.rate);
    var a = Math.max(1, Math.floor(pos / o.rate)), b = Math.max(a + 1, Math.ceil(pos * 1.18 / o.rate));
    return { office: o, doc: m[2], pos: pos, a: a, b: b };
  }
  function queueCard(no, q) {
    return '<div class="ticket"><div class="tno"><span>' + esc(L(X.yourNo)) + "</span><b>" + esc(no) + "</b></div>" +
      kv([[L(X.office), esc(L(q.office.name))], [L(X.document), esc(L(X.docs[q.doc]))], [L(X.place), "<b>" + fmtN(q.pos) + "</b>"], [L(X.wait), q.a <= 1 ? esc(L(X.yourTurn)) : esc(L(X.weeks, { a: q.a, b: q.b }))]]) + "</div>";
  }
  FLOWS.passport = function (box) {
    box.innerHTML = '<form class="flow" id="f1">' +
      field("office", L(X.office), sel("office", S.offices.map(function (o) { return [o.code, L(o.name)]; }))) +
      field("doc", L(X.document), sel("doc", ["P", "R", "I", "C"].map(function (k) { return [k, L(X.docs[k])]; }))) +
      '<button class="btn" type="submit">' + esc(L(X.take)) + "</button></form>" +
      '<div id="result" class="result" hidden aria-live="polite"></div>' +
      '<div id="mytickets"></div>' +
      '<form class="flow inline" id="f2"><h3>' + esc(L(X.checkTicket)) + "</h3>" + field("tno", L(X.yourNo), inp("tno", L(X.ticketPh), ' maxlength="12"')) + '<button class="btn ghost" type="submit">' + esc(t("check")) + "</button></form>" +
      '<div id="result2" class="result" hidden aria-live="polite"></div>';
    function drawMine() {
      var a = loadTickets(), el = $("#mytickets");
      if (!a.length) { el.innerHTML = ""; return; }
      el.innerHTML = "<h3>" + esc(L(X.myTickets)) + "</h3>" + a.slice().reverse().map(function (tk) {
        var q = queueFor(tk.no, tk.d); if (!q) return "";
        return '<div class="mine">' + queueCard(tk.no, q) + '<p class="tiny">' + esc(L(X.taken, { d: fmtD(new Date(tk.d + "T00:00:00Z")) })) + ' · <button type="button" class="linkbtn" data-rm="' + esc(tk.no) + '">' + esc(L(X.remove)) + "</button></p></div>";
      }).join("");
      $$("[data-rm]", el).forEach(function (b) { b.addEventListener("click", function () { saveTickets(loadTickets().filter(function (x) { return x.no !== b.getAttribute("data-rm"); })); drawMine(); }); });
    }
    $("#f1").addEventListener("submit", function (e) {
      noForm(e);
      var o = $("#office").value, d = $("#doc").value;
      var n = (hash(o + d + Date.now() + Math.random()) % 9000) + 1000;
      var no = o + "-" + d + "-" + n, td = today().toISOString().slice(0, 10);
      var a = loadTickets(); a.push({ no: no, d: td }); saveTickets(a);
      var q = queueFor(no, td);
      result(queueCard(no, q) + '<p class="tiny">' + esc(L(X.calledBy)) + "</p><h4>" + esc(L(X.bring)) + "</h4><ul>" + L(X.bringList).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>");
      drawMine();
    });
    $("#f2").addEventListener("submit", function (e) {
      noForm(e);
      var no = $("#tno").value.toUpperCase().replace(/\s/g, "");
      if (!need("tno")) return;
      var mine = loadTickets().filter(function (x) { return x.no === no; })[0];
      var q = queueFor(no, mine ? mine.d : null), r = $("#result2");
      r.hidden = false;
      r.innerHTML = q ? queueCard(no, q) : '<p class="warn">' + esc(L(X.ticketBad)) + "</p>";
    });
    drawMine();
  };
  HELP.passport = {
    en: "<h3>Where is the passport accepted?</h3><p>The Republic of Irad passport is accepted for travel by the states that maintain recognition of the Republic of Irad. Before you travel, ask the consulate of the country of destination whether it accepts the passport and whether you need a visa. For travel to the neighbouring states, check the rules at the crossing in advance.</p><p>The ISEZ does not object to residents also holding the documents of other states.</p><h3>Residence cards</h3><p>Residence cards for foreign nationals are issued at the Talas City and Nurzhan City offices only. A long-term card can be requested after ten years of residence.</p><h3>Lost passport</h3><p>Report a lost or stolen passport to the police first; bring the police certificate with your application for a replacement.</p>",
    ir: "<h3>Pasport kayda kabıl alınat?</h3><p>Irad Respublikasının pasportu Irad Respublikasın taanıgan mamleketter tarabınan saparga kabıl alınat. Saparga chıgaardan murun barchu ölkönün konsulduguna pasportu kabıl aların jana viza kerekpi ekenin surañız. Koñshu mamleketterge barsañız, ötkööldögü erejelerdi aldın ala tekshiriñiz.</p><p>IAEZ turgundardın bashka mamleketterdin dokumentterin da karmashına karshı emes.</p><h3>Jashoo kartaları</h3><p>Chet el jarandarı üchün jashoo kartaları Talas jana Nurzhan shaardık bölümdörüündö gana berilet. Uzak möönöttük kartanı on jıl jashagandan kiyin surasa bolot.</p><h3>Jogolgon pasport</h3><p>Jogolgon je uurdalgan pasport tuuraluu adegende politsiyaga kabarlañız; almashtıruu arızına politsiyanın maalımkatın tirkeñiz.</p>",
    ru: "<h3>Где принимается паспорт?</h3><p>Паспорт Республики Ирад принимается для поездок государствами, которые сохраняют признание Республики Ирад. Перед поездкой уточните в консульстве страны назначения, принимает ли она паспорт и нужна ли виза. При поездке в соседние государства заранее проверьте правила на переходе.</p><p>ОЭЗИ не возражает против того, чтобы жители имели также документы других государств.</p><h3>Вид на жительство</h3><p>Вид на жительство для иностранцев выдаётся только в паспортных столах Таласа и Нуржана. Долгосрочную карту можно запросить после десяти лет проживания.</p><h3>Утерянный паспорт</h3><p>Сначала сообщите об утере или краже в полицию; приложите справку полиции к заявлению о замене.</p>"
  };

  /* event permit */
  var EV = {
    city: { en: "City", ir: "Shaar", ru: "Город" },
    cities: { tl: { en: "Talas", ir: "Talas", ru: "Талас" }, nz: { en: "Nurzhan", ir: "Nurzhan", ru: "Нуржан" }, ij: { en: "Iyık Janyl", ir: "Iyık Janyl", ru: "Ийык-Джаныл" } },
    kind: { en: "Type of event", ir: "Ish-charanın türü", ru: "Вид мероприятия" },
    kinds: [["concert", { en: "Concert", ir: "Konsert", ru: "Концерт" }], ["festival", { en: "Festival or fair", ir: "Festival je yarmarka", ru: "Фестиваль или ярмарка" }], ["parade", { en: "Parade or procession", ir: "Parad je jürüsh", ru: "Шествие или парад" }], ["sport", { en: "Sports event", ir: "Sport ish-charası", ru: "Спортивное мероприятие" }], ["gathering", { en: "Public gathering", ir: "Kogomduk chogulush", ru: "Публичное собрание" }]],
    venue: { en: "Venue or route", ir: "Ötkörülüüchü jer je marshrut", ru: "Место или маршрут" },
    date: { en: "Date", ir: "Kün", ru: "Дата" },
    aud: { en: "Expected audience", ir: "Kütülgön kishi sanı", ru: "Ожидаемое число участников" },
    foreign: { en: "Performers from abroad", ir: "Chet eldik atkaruuchular", ru: "Исполнители из-за рубежа" },
    prep: { en: "Prepare application", ir: "Arız dayardoo", ru: "Подготовить заявку" },
    ref: { en: "Pre-application reference", ir: "Aldın ala arızdın nomeri", ru: "Номер предварительной заявки" },
    saved: { en: "Online submission is not yet available in the pilot. Write down this reference and take it to the permits counter with the documents below.", ir: "Sınoo mezgilinde onlayn jönötüü azırınca jok. Bul nomerdi jazıp alıp, tömöndögü dokumentter menen uruksat kassasına barıñız.", ru: "Онлайн-подача в пилотном режиме пока недоступна. Запишите номер и принесите его в окошко разрешений вместе с документами ниже." },
    counter: { tl: { en: "Talas City Hall, Central Square, permits counter (room 104). Road closures are considered by the transport committee on Wednesdays.", ir: "Talas meriyası, Borborduk ayant, uruksat kassası (104-bölmö). Joldordu jabuu maselesin transport komiteti sharshembi künderi karayt.", ru: "Мэрия Таласа, Центральная площадь, окно разрешений (комната 104). Перекрытие улиц рассматривает транспортный комитет по средам." }, nz: { en: "Nurzhan City Administration, House of Soviets, Central Square, permits office.", ir: "Nurzhan shaar administratsiyası, Sovetter Üyü, Borborduk ayant, uruksat bölümü.", ru: "Администрация Нуржана, Дом Советов, Центральная площадь, отдел разрешений." }, ij: { en: "Iyık Janyl City Hall, Lower Town, permits office. Processions on Cathedral Hill are agreed with the cathedral rector.", ir: "Iyık Janyl meriyası, Tömönkü shaar, uruksat bölümü. Chirköö döbösündögü jürüshtör sobor rektoru menen makuldashılat.", ru: "Мэрия Ийык-Джаныла, Нижний город, отдел разрешений. Шествия на Соборном холме согласуются с настоятелем собора." } },
    docsH: { en: "Bring", ir: "Ala keliñiz", ru: "Принесите" },
    docs: { en: ["The organiser's ID card or company registration", "The venue owner's written consent, or the route on a city plan", "The programme and expected number of people", "For ticketed events: the state fee receipt (IS 250)"], ir: ["Uyushturuuchunun jeke kuböölügü je kompaniyanın kattoo kübölügü", "Jaydın eesinin jazuu jüzündögü makuldugu je shaar planındagı marshrut", "Programma jana kütülgön kishi sanı", "Bilettüü ish-charalar üchün: mamlekettik alımdın kvitantsiyası (250 som)"], ru: ["Удостоверение организатора или регистрация компании", "Письменное согласие владельца площадки или маршрут на плане города", "Программа и ожидаемое число участников", "Для платных мероприятий: квитанция госпошлины (250 сомов)"] },
    dpi: { en: "Performers from abroad also need a performance permit from the Department of Public Information. Apply at least six weeks before the event.", ir: "Chet eldik atkaruuchular üchün Kogomduk maalımat departamentinin konsert uruksatı da kerek. Ish-charaga keminde altı juma kalganda kayrılıñız.", ru: "Для зарубежных исполнителей нужно также разрешение на выступление от Департамента общественной информации. Подавайте не позднее чем за шесть недель." },
    big: { en: "Events for more than 500 people need a police and fire-safety inspection of the venue, arranged by the city.", ir: "500dön ashık kishilik ish-charalar üchün shaar uyushturgan politsiya jana ört koopsuzdugu tekshirüüsü kerek.", ru: "Для мероприятий более чем на 500 человек нужна проверка площадки полицией и пожарной охраной, которую организует город." },
    gathering: { en: "Notice of a public gathering must be lodged at least ten days in advance. The city may propose another place or time.", ir: "Kogomduk chogulush tuuraluu keminde on kün murun kabarlash kerek. Shaar bashka jerdi je ubakıttı sunushu mümkün.", ru: "Уведомление о публичном собрании подаётся не позднее чем за десять дней. Город может предложить другое место или время." },
    late: { en: "Fewer than 30 days remain before this date. The city may not be able to consider the application in time.", ir: "Bul küngö 30 kündön az kaldı. Shaar arızdı öz ubaktısında karay albashı mümkün.", ru: "До этой даты осталось меньше 30 дней. Город может не успеть рассмотреть заявку." },
    past: { en: "Choose a date in the future.", ir: "Kelechektegi kündü tandañız.", ru: "Выберите будущую дату." },
    permit: { en: "Every event is subject to municipal permit.", ir: "Ar bir ish-chara shaardık uruksatka baylanıshtuu.", ru: "Любое мероприятие проводится при наличии муниципального разрешения." }
  };
  FLOWS.event = function (box) {
    box.innerHTML = '<form class="flow" id="fe">' +
      field("city", L(EV.city), sel("city", [["tl", L(EV.cities.tl)], ["nz", L(EV.cities.nz)], ["ij", L(EV.cities.ij)]])) +
      field("kind", L(EV.kind), sel("kind", EV.kinds.map(function (k) { return [k[0], L(k[1])]; }))) +
      field("venue", L(EV.venue), inp("venue", "", ' maxlength="80"')) +
      field("edate", L(EV.date), '<input id="edate" type="date">') +
      field("aud", L(EV.aud), '<input id="aud" type="number" min="1" max="100000" inputmode="numeric">') +
      '<div class="fld chk"><label><input id="foreign" type="checkbox"> ' + esc(L(EV.foreign)) + "</label></div>" +
      '<button class="btn" type="submit">' + esc(L(EV.prep)) + '</button></form><div id="result" class="result" hidden aria-live="polite"></div>';
    $("#fe").addEventListener("submit", function (e) {
      noForm(e);
      if (!need("venue") || !need("edate") || !need("aud", function (v) { return +v > 0; })) return;
      var d = new Date($("#edate").value + "T00:00:00Z"), days = Math.round((d - today()) / 86400000);
      if (days < 0) { $("#edate-err").textContent = L(EV.past); $("#edate-err").hidden = false; return; }
      var c = $("#city").value, k = $("#kind").value, aud = +$("#aud").value;
      var ref = c.toUpperCase() + "-EV-" + String(iradNow().getFullYear()).slice(2) + "-" + pad5(hash(c + k + $("#venue").value + $("#edate").value) % 100000);
      var notes = [];
      if (days < 30) notes.push('<p class="warn">' + esc(L(EV.late)) + "</p>");
      if ($("#foreign").checked) notes.push("<p>" + esc(L(EV.dpi)) + "</p>");
      if (aud > 500) notes.push("<p>" + esc(L(EV.big)) + "</p>");
      if (k === "gathering") notes.push("<p>" + esc(L(EV.gathering)) + "</p>");
      result('<div class="ticket"><div class="tno"><span>' + esc(L(EV.ref)) + "</span><b>" + esc(ref) + "</b></div>" + kv([[L(EV.date), esc(fmtD(d))], [L(EV.city), esc(L(EV.cities[c]))]]) + "</div><p>" + esc(L(EV.saved)) + "</p><p><b>" + esc(L(EV.counter[c])) + "</b></p><h4>" + esc(L(EV.docsH)) + "</h4><ul>" + L(EV.docs).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" + notes.join("") + '<p class="tiny">' + esc(L(EV.permit)) + "</p>");
    });
  };
  function pad5(n) { return ("00000" + n).slice(-5); }
  HELP.event = {
    en: "<h3>Who issues the permit?</h3><p>Concerts, fairs, parades and gatherings in a city need a permit from the city council, issued through City Hall. Performances by foreign ensembles and public film screenings also need a permit from the Department of Public Information. Outside the cities, apply to the district administration.</p><h3>Tickets</h3><p>Tickets may be sold, and advertised as on sale, only after the permit has been issued.</p>",
    ir: "<h3>Uruksattı kim beret?</h3><p>Shaardagı konsertter, yarmarkalar, paraddar jana chogulushtar üchün meriya arkıluu berilüüchü shaar keñeshinin uruksatı kerek. Chet eldik ansambldardın chıguuları jana kinonu elge körsötüü üchün Kogomduk maalımat departamentinin uruksatı da kerek. Shaardan tıshkarı aymaktık administratsiyaga kayrılıñız.</p><h3>Biletter</h3><p>Biletterdi uruksat berilgenden kiyin gana satuuga jana jarnamaloogo bolot.</p>",
    ru: "<h3>Кто выдаёт разрешение?</h3><p>Для концертов, ярмарок, шествий и собраний в городе нужно разрешение городского совета, которое выдаётся через мэрию. Для выступлений зарубежных коллективов и публичных кинопоказов нужно также разрешение Департамента общественной информации. За пределами городов обращайтесь в районную администрацию.</p><h3>Билеты</h3><p>Продавать и рекламировать билеты можно только после выдачи разрешения.</p>"
  };

  /* business */
  var BZ = {
    form: { en: "Legal form", ir: "Uyushmanın forması", ru: "Организационная форма" },
    forms: [["st", { en: "Sole trader", ir: "Jeke ishker", ru: "Индивидуальный предприниматель" }], ["llc", { en: "Limited company", ir: "Joopkerchiligi chektelgen koom", ru: "Общество с ограниченной ответственностью" }], ["farm", { en: "Farm", ir: "Dıykan charbası", ru: "Фермерское хозяйство" }], ["coop", { en: "Cooperative", ir: "Kooperativ", ru: "Кооператив" }]],
    act: { en: "Main activity", ir: "Negizgi ish", ru: "Основной вид деятельности" },
    acts: [["trade", { en: "Shop or market stall", ir: "Dükön je bazar ordu", ru: "Магазин или торговое место" }], ["food", { en: "Café, canteen or bakery", ir: "Kafe, ashkana je nan bıshıruuchu jay", ru: "Кафе, столовая или пекарня" }], ["craft", { en: "Workshop or crafts", ir: "Ustakana je kol önörü", ru: "Мастерская или ремесло" }], ["transport", { en: "Transport or taxi", ir: "Transport je taksi", ru: "Транспорт или такси" }], ["agri", { en: "Farming or livestock", ir: "Dıykanchılık je mal charbası", ru: "Земледелие или животноводство" }], ["print", { en: "Publishing or printing", ir: "Basma je basmakana", ru: "Издательство или типография" }], ["it", { en: "Services, IT or consulting", ir: "Kızmattar, IT je konsalting", ru: "Услуги, ИТ или консалтинг" }]],
    district: { en: "District or city", ir: "Aymak je shaar", ru: "Район или город" },
    name: { en: "Proposed business name", ir: "Sunushtalgan at", ru: "Предлагаемое название" },
    checkName: { en: "Check name", ir: "Attı tekshirüü", ru: "Проверить название" },
    free: { en: "The name “{n}” is available. It is not reserved until registration is completed.", ir: "“{n}” degen at bosh. Kattoo bütkönchö al ech kimge bekitilbeyt.", ru: "Название «{n}» свободно. До завершения регистрации оно не закрепляется." },
    taken: { en: "A business with a similar name, “{n}”, is already registered in this district. Choose another name or add a distinguishing word.", ir: "Bul aymakta “{n}” degen okshosh attagı ishkana kattalgan. Bashka at tandañız je ayırmaluu söz koshuñuz.", ru: "В этом районе уже зарегистрировано предприятие с похожим названием «{n}». Выберите другое название или добавьте отличительное слово." },
    prot: { en: "Names containing words such as “Irad”, “State”, “National”, “Governor” or registered trademarks need the approval of the Ministry of Economy. Your application will take longer.", ir: "“Irad”, “Mamlekettik”, “Uluttuk”, “Gubernator” sıyaktuu sözdördü je kattalgan sooda belgilerin kamtıgan attar üchün Ekonomika ministrliginin makuldugu kerek. Arızıñız uzagıraak karalat.", ru: "Названия со словами «Ирад», «государственный», «национальный», «губернатор» или с зарегистрированными товарными знаками требуют согласования Министерства экономики. Рассмотрение займёт больше времени." },
    nextH: { en: "Next: visit your district office with originals", ir: "Kiyinki kadam: asıl dokumentter menen aymaktık keñsege barıñız", ru: "Дальше: обратитесь в районный отдел с оригиналами" },
    docs: {
      en: ["Your ID card and residence registration", "Proof of premises: lease, ownership certificate or the owner's letter", "Receipt for the state fee, paid at Talasbank: sole trader IS 150, company or cooperative IS 600, farm IS 100", "For a company or cooperative: the charter signed by all founders", "For a farm: the land-use certificate"],
      ir: ["Jeke kuböölügüñüz jana jashoo jayı boyuncha kattoo", "Jaydı tastıktagan dokument: ijara kelishimi, menchik kübölügü je eesinin katı", "Talasbankta tölöngön mamlekettik alımdın kvitantsiyası: jeke ishker 150 som, kompaniya je kooperativ 600 som, dıykan charbası 100 som", "Kompaniya je kooperativ üchün: bardık negizdööchülör kol koygon ustav", "Dıykan charbası üchün: jerdi paydaluu kübölügü"],
      ru: ["Удостоверение личности и регистрация по месту жительства", "Документ на помещение: договор аренды, свидетельство о собственности или письмо владельца", "Квитанция госпошлины, оплаченной в «Таласбанке»: ИП 150 сомов, компания или кооператив 600, ферма 100", "Для компании или кооператива: устав, подписанный всеми учредителями", "Для фермы: свидетельство о землепользовании"]
    },
    printNote: { en: "Publishers and printers must also register with the Department of Public Information before they publish.", ir: "Basma üylör jana basmakanalar basıp chıgaraardan murun Kogomduk maalımat departamentinde da kattalıshı kerek.", ru: "Издатели и типографии до начала выпуска должны также зарегистрироваться в Департаменте общественной информации." },
    foodNote: { en: "Food businesses need a sanitary certificate from the city health inspectorate before opening.", ir: "Tamak-ash ishkanalarına achılardan murun shaardık sanitardık inspektsiyanın kübölügü kerek.", ru: "Предприятиям питания до открытия нужно санитарное заключение городской санинспекции." },
    taxiNote: { en: "Taxi and passenger transport also need a carrier's licence from the Department of Infrastructure and Communications.", ir: "Taksi jana jürgünchü tashuu üchün Infrastruktura jana baylanısh departamentinin tashuuchu litsenziyası da kerek.", ru: "Для такси и пассажирских перевозок нужна также лицензия перевозчика Департамента инфраструктуры и связи." },
    oneVisit: { en: "If your documents are complete, registration is completed in one visit and the certificate is issued within five working days.", ir: "Dokumentteriñiz toluk bolso, kattoo bir barganda bütöt, kübölük besh ish kündün ichinde berilet.", ru: "Если документы в порядке, регистрация оформляется за одно посещение, свидетельство выдаётся в течение пяти рабочих дней." }
  };
  var DISTRICTS = [["tl", { en: "Talas (city)", ir: "Talas (shaar)", ru: "Талас (город)" }], ["nz", { en: "Nurzhan (city)", ir: "Nurzhan (shaar)", ru: "Нуржан (город)" }], ["ij", { en: "Iyık Janyl (city)", ir: "Iyık Janyl (shaar)", ru: "Ийык-Джаныл (город)" }], ["chu", { en: "Chu District", ir: "Chüy aymagı", ru: "Чуйский район" }], ["kb", { en: "Kara-Buura District", ir: "Kara-Buura aymagı", ru: "Кара-Бууринский район" }], ["td", { en: "Talas District", ir: "Talas aymagı", ru: "Таласский район" }], ["ln", { en: "Lower Naryn District", ir: "Tömönkü Narın aymagı", ru: "Нижненарынский район" }], ["tok", { en: "Toktogul District", ir: "Toktogul aymagı", ru: "Токтогульский район" }], ["sb", { en: "Sary-Bulak District", ir: "Sarı-Bulak aymagı", ru: "Сары-Булакский район" }]];
  FLOWS.business = function (box) {
    box.innerHTML = '<form class="flow" id="fb">' +
      field("bform", L(BZ.form), sel("bform", BZ.forms.map(function (k) { return [k[0], L(k[1])]; }))) +
      field("bact", L(BZ.act), sel("bact", BZ.acts.map(function (k) { return [k[0], L(k[1])]; }))) +
      field("bdist", L(BZ.district), sel("bdist", DISTRICTS.map(function (k) { return [k[0], L(k[1])]; }))) +
      field("bname", L(BZ.name), inp("bname", "", ' maxlength="60"')) +
      '<button class="btn" type="submit">' + esc(L(BZ.checkName)) + '</button></form><div id="result" class="result" hidden aria-live="polite"></div>';
    $("#fb").addEventListener("submit", function (e) {
      noForm(e);
      if (!need("bname")) return;
      var n = $("#bname").value.trim().replace(/\s+/g, " "), low = n.toLowerCase(), h = hash(low + $("#bdist").value);
      var msg;
      if (/irad|state|national|govern|mamleket|uluttuk|gubern|tulpar|nurgaz|attelkom|государ|национ|ирад|губерн/.test(low)) msg = '<p class="warn">' + esc(L(BZ.prot)) + "</p>";
      else if (h % 5 === 0) msg = '<p class="warn">' + esc(L(BZ.taken, { n: n + (h % 2 ? " Plus" : "-" + (2 + h % 7)) })) + "</p>";
      else msg = '<p class="ok">' + esc(L(BZ.free, { n: n })) + "</p>";
      var act = $("#bact").value, extra = act === "print" ? BZ.printNote : act === "food" ? BZ.foodNote : act === "transport" ? BZ.taxiNote : null;
      var docs = L(BZ.docs).filter(function (x, i) { var f = $("#bform").value; return i < 3 || (i === 3 && (f === "llc" || f === "coop")) || (i === 4 && f === "farm"); });
      result(msg + "<h4>" + esc(L(BZ.nextH)) + "</h4><ul>" + docs.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" + (extra ? "<p>" + esc(L(extra)) + "</p>" : "") + '<p class="tiny">' + esc(L(BZ.oneVisit)) + "</p>");
    });
  };
  HELP.business = {
    en: "<h3>Why can't I register online?</h3><p>The register of firms requires the founder's signature on the application in front of a registrar and the original documents. Online registration with an e-Irad card is planned after the pilot.</p><h3>Census of business entities</h3><p>Registered and unregistered businesses are being counted until 30 November. Taking part in the census does not register a business, and registering does not replace the census questionnaire.</p>",
    ir: "<h3>Emne üchün onlayn kattala albaym?</h3><p>Firmalar reestri arızga negizdööchünün registratordun aldında kol koyushun jana asıl dokumentterdi talap kılat. e-Irad kartası menen onlayn kattoo sınoo mezgilinen kiyin plandashtırılgan.</p><h3>Ishkanalardın sanagı</h3><p>Kattalgan jana kattalbagan ishkanalar 30-noyabrga cheyin sanalat. Sanakka katıshuu ishkananı kattabayt, kattoo sanaktın suroo-joop kagazın almashtırbayt.</p>",
    ru: "<h3>Почему нельзя зарегистрироваться онлайн?</h3><p>Реестр фирм требует подписи учредителя на заявлении в присутствии регистратора и оригиналов документов. Онлайн-регистрация с картой e-Irad планируется после пилота.</p><h3>Перепись хозяйствующих субъектов</h3><p>До 30 ноября проходит учёт зарегистрированных и незарегистрированных предприятий. Участие в переписи не регистрирует предприятие, а регистрация не заменяет анкету переписи.</p>"
  };

  /* census (information) */
  FLOWS.census = function (box) {
    box.innerHTML = '<div class="flow">' + L({
      en: "<p>The census of business entities runs from 15 October to 30 November 2026. You can answer in one of three ways:</p><ol><li><b>When the enumerator visits.</b> Enumerators carry a Territorial Statistics Office card with a photograph and never ask for payment. The questionnaire takes about 25 minutes.</li><li><b>At an Attelkom service point,</b> on the terminal, with the help of the staff.</li><li><b>On e-Irad.</b> The online questionnaire is open from 1 to 30 November.</li></ol><p>Answers are used for statistics only and are not passed to tax inspectors.</p>",
      ir: "<p>Ishkanalardın sanagı 2026-jıldın 15-oktyabrınan 30-noyabrına cheyin ötöt. Üch jol menen joop berse bolot:</p><ol><li><b>Kattoochu kelgende.</b> Kattoochulardın süröttüü Aymaktık statistika keñsesinin kartası bolot, alar ech kachan akcha surabayt. Suroo-joop 25 minutaga jakın ubakıt alat.</li><li><b>Attelkomdun kızmat punktunda,</b> terminalda, kızmatkerlerdin jardamı menen.</li><li><b>e-Iradda.</b> Onlayn suroo-joop 1-noyabrdan 30-noyabrga cheyin achık.</li></ol><p>Jooptor statistika üchün gana koldonulat jana salık inspektorloruna berilbeyt.</p>",
      ru: "<p>Перепись хозяйствующих субъектов проходит с 15 октября по 30 ноября 2026 года. Ответить можно тремя способами:</p><ol><li><b>Когда придёт счётчик.</b> У счётчиков есть удостоверение Территориального статистического управления с фотографией; они никогда не просят денег. Анкета занимает около 25 минут.</li><li><b>В пункте обслуживания «Аттелкома»,</b> на терминале, с помощью сотрудников.</li><li><b>На e-Irad.</b> Онлайн-анкета открыта с 1 по 30 ноября.</li></ol><p>Ответы используются только для статистики и не передаются налоговым инспекторам.</p>"
    }) + (today() < new Date("2026-11-01T00:00:00Z") ? '<button class="btn" type="button" disabled>' + esc(L({ en: "Online questionnaire (opens on 1 November)", ir: "Onlayn suroo-joop (1-noyabrda achılat)", ru: "Онлайн-анкета (откроется 1 ноября)" })) + "</button>"
      : '<a class="btn" href="/census/">' + esc(L(today() > new Date("2026-11-30T00:00:00Z") ? { en: "Check a confirmation", ir: "Tastıktoonu tekshirüü", ru: "Проверить подтверждение" } : { en: "Online questionnaire", ir: "Onlayn suroo-joop", ru: "Онлайн-анкета" })) + "</a>") + "</div>";
  };

  /* electricity and water */
  var BILL = {
    network: { en: "Network", ir: "Tarmak", ru: "Сеть" },
    nets: [["tl", { en: "Talas Electric Networks", ir: "Talas elektr tarmaktarı", ru: "Таласские электросети" }], ["nz", { en: "Nurzhan Electric Networks", ir: "Nurzhan elektr tarmaktarı", ru: "Нуржанские электросети" }], ["dist", { en: "Iradenergo district service (Iyık Janyl and the districts)", ir: "Iradenergonun aymaktık kızmatı (Iyık Janyl jana aymaktar)", ru: "Районная служба «Ирадэнерго» (Ийык-Джаныл и районы)" }]],
    acct: { en: "Personal account number", ir: "Jeke esep nomeri", ru: "Номер лицевого счёта" },
    acctPh: { en: "8 to 12 digits, from your last bill", ir: "8den 12ge cheyin sıfra, akırkı eseptten", ru: "от 8 до 12 цифр, с последней квитанции" },
    acctBad: { en: "The account number has 8 to 12 digits and is printed at the top of your bill.", ir: "Esep nomeri 8den 12ge cheyin sıfradan turat jana eseptin jogorkusunda basılgan.", ru: "Номер лицевого счёта состоит из 8–12 цифр и напечатан вверху квитанции." },
    period: { en: "Billing period", ir: "Esep mezgili", ru: "Расчётный период" },
    readings: { en: "Meter readings", ir: "Hisoochtun körsötküchü", ru: "Показания счётчика" },
    used: { en: "Consumption", ir: "Sarptalganı", ru: "Расход" },
    tariff: { en: "Household tariff", ir: "Turmushtuk tarif", ru: "Бытовой тариф" },
    arrears: { en: "Unpaid from earlier periods", ir: "Murdagı mezgilderden tölönbögönü", ru: "Задолженность за прошлые периоды" },
    due: { en: "Amount due", ir: "Tölönüüchü summa", ru: "К оплате" },
    dueBy: { en: "Pay by", ir: "Tölöö möönötü", ru: "Оплатить до" },
    show: { en: "Show bill", ir: "Esepti körsötüü", ru: "Показать счёт" },
    acctNo: { en: "Account", ir: "Esep", ru: "Лицевой счёт" },
    wcity: { en: "Water enterprise", ir: "Suu ishkanası", ru: "Водоканал" },
    wnets: [["tl", { en: "Talas City Water Enterprise", ir: "Talas shaardık suu ishkanası", ru: "Таласский городской водоканал" }], ["nz", { en: "Nurzhan Vodokanal", ir: "Nurzhan Vodokanalı", ru: "Нуржанский водоканал" }], ["ij", { en: "Iyık Janyl City Water Enterprise", ir: "Iyık Janyl shaardık suu ishkanası", ru: "Водоканал Ийык-Джаныла" }]],
    persons: { en: "Registered residents", ir: "Kattalgan turgundar", ru: "Зарегистрировано жильцов" },
    wrate: { en: "Water, per person a month", ir: "Suu, bir kishige aylık", ru: "Вода, на человека в месяц" },
    srate: { en: "Sewerage, per person a month", ir: "Kanalizatsiya, bir kishige aylık", ru: "Канализация, на человека в месяц" },
    winter: { en: "Heating is billed separately by the city heating enterprise.", ir: "Jılytuu üchün esepti shaardık jılytuu ishkanası öznchö chıgarat.", ru: "Отопление выставляет отдельно городское теплопредприятие." }
  };
  function lastMonth() { var d = today(); return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, 1)); }
  function monthName(d) { var M = I.ui[LANG].months, n = M[d.getUTCMonth()]; if (LANG === "ru") n = ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"][d.getUTCMonth()]; return n.charAt(0).toUpperCase() + n.slice(1) + " " + d.getUTCFullYear(); }
  function dueDate() { var d = today(); return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 25)); }
  function mask(a) { return "••••" + a.slice(-4); }
  FLOWS.electricity = function (box) {
    box.innerHTML = '<form class="flow" id="fel">' + field("net", L(BILL.network), sel("net", BILL.nets.map(function (k) { return [k[0], L(k[1])]; }))) +
      field("acct", L(BILL.acct), inp("acct", L(BILL.acctPh), ' inputmode="numeric" maxlength="14"')) + '<button class="btn" type="submit">' + esc(L(BILL.show)) + '</button></form><div id="result" class="result" hidden aria-live="polite"></div>';
    $("#fel").addEventListener("submit", function (e) {
      noForm(e);
      var a = $("#acct").value.replace(/\D/g, "");
      if (!need("acct", function () { return a.length >= 8 && a.length <= 12; })) { $("#acct-err").textContent = L(BILL.acctBad); return; }
      var h = hash("el" + $("#net").value + a);
      if (h % 13 === 0) { result('<p class="warn">' + esc(t("notFound")) + "</p>"); return; }
      var prev = 10000 + (h % 80000), kwh = 140 + (h % 260), tariff = 0.32, arr = h % 7 === 0 ? Math.round((90 + h % 70) * tariff * 100) / 100 * 1 : 0;
      var amt = Math.round(kwh * tariff * 100) / 100, total = amt + arr;
      result(kv([[L(BILL.acctNo), esc(mask(a))], [L(BILL.period), esc(monthName(lastMonth()))], [L(BILL.readings), fmtN(prev) + " → " + fmtN(prev + kwh)], [L(BILL.used), fmtN(kwh) + " kWh"], [L(BILL.tariff), som(tariff) + " / kWh"]].concat(arr ? [[L(BILL.arrears), som(arr)]] : []).concat([[L(BILL.due), "<b>" + som(total) + "</b>"], [L(BILL.dueBy), esc(fmtD(dueDate()))]])) + payBox("electricity"));
    });
    calcBox(box);
  };

  /* bill calculator: rates from the Iradenergo schedule of 1 January 2025 (docs/iradenergo-tariffs-2025.pdf) */
  var CALC = {
    h: { en: "Estimate a bill", ir: "Eseptin boljoldu summası", ru: "Рассчитать счёт" },
    intro: { en: "Work out what a month's electricity will cost before the bill comes. Rates from the Iradenergo tariff schedule in force from 1 January 2025; sales tax is included.", ir: "Esep kelgenge cheyin bir aylık elektr kancha turarın esepteñiz. Tarifter 2025-jıldın 1-yanvarınan küchündögü Iradenergonun tarifteri boyuncha; satuu salıgı kirgen.", ru: "Узнайте, сколько будет стоить электроэнергия за месяц, ещё до прихода квитанции. Тарифы «Ирадэнерго», действующие с 1 января 2025 года; налог с продаж включён." },
    group: { en: "Consumer group", ir: "Tutunuuchu tobu", ru: "Группа потребителей" },
    groups: [
      ["1.1", 0.32, { en: "Households: flat or private house", ir: "Turgundar: batir je jeke üy", ru: "Население: квартира или частный дом" }],
      ["1.2", 0.32, { en: "Garage, cellar or summer house on its own meter", ir: "Garaj, ertölö je dacha (öz hisoochu menen)", ru: "Гараж, подвал или дача с отдельным счётчиком" }],
      ["1.3", 0.32, { en: "Place of worship or church school", ir: "Ibadat jayı je chirköö mektebi", ru: "Культовое здание или церковная школа" }],
      ["1.4", 0.74, { en: "Institution financed from the budget", ir: "Byudjettik mekeme", ru: "Бюджетное учреждение" }],
      ["1.6", 1.12, { en: "Shop, office, café or other business", ir: "Dükön, keñse, kafe je bashka ishkana", ru: "Магазин, офис, кафе и другой бизнес" }],
      ["1.7", 0.96, { en: "Industry, supplied at 0.4 kV", ir: "Önör jay, 0,4 kV", ru: "Промышленность, 0,4 кВ" }],
      ["1.8", 0.84, { en: "Industry, supplied at 6–10 kV", ir: "Önör jay, 6–10 kV", ru: "Промышленность, 6–10 кВ" }],
      ["1.9", 0.69, { en: "Industry, supplied at 35 kV and above", ir: "Önör jay, 35 kV jana jogoru", ru: "Промышленность, 35 кВ и выше" }],
      ["1.10", 0.18, { en: "Irrigation pumping (1 April to 15 October)", ir: "Sugaruu suusun sorduruu (1-aprelden 15-oktyabrga cheyin)", ru: "Насосный полив (1 апреля – 15 октября)" }]
    ],
    kwh: { en: "Consumption in a month, kWh", ir: "Bir aylık sarptoo, kVt·saat", ru: "Расход за месяц, кВт·ч" },
    kwhPh: { en: "from the meter, or work it out below", ir: "hisoochtan, je tömöndö eseptep chıgarıñız", ru: "по счётчику или рассчитайте ниже" },
    kwhBad: { en: "Enter the consumption as a whole number of kWh, up to 9,999,999.", ir: "Sarptoonu bütün san menen jazıñız, 9 999 999 kVt·saatka cheyin.", ru: "Укажите расход целым числом кВт·ч, не более 9 999 999." },
    late: { en: "Days paid late after the 25th", ir: "25ten kiyin kechiktirilgen kündör", ru: "Дней просрочки после 25-го числа" },
    go: { en: "Calculate", ir: "Eseptöö", ru: "Рассчитать" },
    app: { en: "Don't know the consumption? Add up your appliances", ir: "Sarptoonu bilbeysizbi? Üy buyumdarıñızdı koshuñuz", ru: "Не знаете расход? Сложите ваши приборы" },
    appNote: { en: "Hours a day each appliance is on (the fridge runs all day). Typical wattages; your own may differ.", ir: "Ar bir buyum kününö neche saat ishteyt (muzdatkıch kün boyu ishteyt). Kadimki kubattuuluk; sizdiki bashkacha bolushu mümkün.", ru: "Сколько часов в день работает каждый прибор (холодильник — круглые сутки). Мощности типовые, у ваших приборов может быть иначе." },
    use: { en: "Use this figure", ir: "Bul sandı koldonuu", ru: "Подставить" },
    apps: [
      ["fr", 150, 0.35, { en: "Refrigerator", ir: "Muzdatkıch", ru: "Холодильник" }, 24],
      ["tv", 90, 1, { en: "Television", ir: "Televizor", ru: "Телевизор" }, 4],
      ["lt", 300, 1, { en: "Lights, five 60 W bulbs", ir: "Jarık, besh lampa, 60 Vt", ru: "Освещение, пять лампочек по 60 Вт" }, 5],
      ["kt", 2000, 1, { en: "Electric kettle", ir: "Elektr choynek", ru: "Электрочайник" }, 0.5],
      ["wm", 500, 1, { en: "Washing machine", ir: "Kir juuguch mashina", ru: "Стиральная машина" }, 0.5],
      ["ir", 1000, 1, { en: "Iron", ir: "Ütük", ru: "Утюг" }, 0.2],
      ["pc", 120, 1, { en: "Computer", ir: "Kompyuter", ru: "Компьютер" }, 2],
      ["st", 1500, 1, { en: "Electric stove, one ring", ir: "Elektr plita, bir konforka", ru: "Электроплита, одна конфорка" }, 1],
      ["ht", 2000, 1, { en: "Heater (reflector or oil-filled)", ir: "Jılıtkıch (reflektor je mayluu)", ru: "Обогреватель (рефлектор или масляный)" }, 0],
      ["wh", 1500, 0.6, { en: "Water heater (boiler)", ir: "Suu jılıtkıch (boyler)", ru: "Водонагреватель (бойлер)" }, 0]
    ],
    hrs: { en: "hours a day", ir: "saat/kün", ru: "ч в день" },
    tariff: { en: "Tariff (line {n} of the schedule)", ir: "Tarif (tariftin {n}-sabı)", ru: "Тариф (строка {n} перечня)" },
    energy: { en: "Electricity", ir: "Elektr energiyası", ru: "Электроэнергия" },
    pen: { en: "Late payment penalty, 0.1% a day for {d} days", ir: "Kechiktirgen üchün ayıp, kününö 0,1%, {d} kün", ru: "Пеня 0,1% в день за {d} дн." },
    total: { en: "Total to pay", ir: "Bardıgı tölöö", ru: "Итого к оплате" },
    usd: { en: "In dollars at today's official rate", ir: "Bügünkü rasmiy kurs boyuncha dollar menen", ru: "В долларах по официальному курсу на сегодня" },
    bread: { en: "The same as", ir: "Bul", ru: "Это столько же, сколько" },
    loaves: { en: "{n} loaves of bread at today's bazaar price", ir: "bügünkü bazar baası menen {n} nan", ru: "{n} буханок хлеба по сегодняшней базарной цене" },
    pump: { en: "The pumping tariff applies only from 1 April to 15 October; out of season the connection is off.", ir: "Sorduruu tarifi 1-aprelden 15-oktyabrga cheyin gana; mezgilden tıshkarı tok ajıratılgan.", ru: "Тариф для насосного полива действует только с 1 апреля по 15 октября; вне сезона подключение отключено." },
    warn: { en: "A debt of more than two months' bills can lead to disconnection ten days after a written warning. Reconnection costs 240 som each time.", ir: "Eki aylık eseptten ashkan karız jazuu eskertüüdön on kün ötkön soñ tokton ajıratuuga alıp kelishi mümkün. Kayra tutashtıruu ar jolu 240 som.", ru: "Долг более чем за два месяца может привести к отключению через десять дней после письменного предупреждения. Повторное подключение стоит 240 сомов." },
    est: { en: "An estimate only. The bill from your network company is the one to pay.", ir: "Bul boljol gana. Tölöö üchün tarmak kompaniyasınıñ esebi negiz.", ru: "Это только оценка. Оплачивать нужно по квитанции вашей сетевой компании." }
  };
  var TODAY_P = null;
  function loadToday(cb) {
    if (TODAY_P) { cb(TODAY_P); return; }
    fetch("https://iradone.com/data/today.json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { TODAY_P = j || {}; cb(TODAY_P); }).catch(function () { TODAY_P = {}; cb(TODAY_P); });
  }
  function calcBox(box) {
    var wrap = document.createElement("div");
    wrap.innerHTML = '<form class="flow inline" id="fcalc" novalidate><h3>' + esc(L(CALC.h)) + '</h3><p class="tiny">' + esc(L(CALC.intro)) + "</p>" +
      field("cgrp", L(CALC.group), sel("cgrp", CALC.groups.map(function (g) { return [g[0], g[0] + "  " + L(g[2]) + " (" + fmtN(g[1], 2) + ")"]; }))) +
      field("ckwh", L(CALC.kwh), inp("ckwh", L(CALC.kwhPh), ' inputmode="numeric" maxlength="7"')) +
      '<details class="applist"><summary>' + esc(L(CALC.app)) + '</summary><p class="tiny">' + esc(L(CALC.appNote)) + "</p><table>" +
      CALC.apps.map(function (a) { return '<tr><td><label for="ap-' + a[0] + '">' + esc(L(a[3])) + '</label> <span class="tiny">' + fmtN(a[1]) + ' W</span></td><td><input id="ap-' + a[0] + '" type="number" min="0" max="24" step="any" value="' + a[4] + '"> ' + esc(L(CALC.hrs)) + "</td></tr>"; }).join("") +
      '</table><p><b id="apsum"></b> <button type="button" class="btn ghost" id="apuse">' + esc(L(CALC.use)) + "</button></p></details>" +
      field("clate", L(CALC.late), '<input id="clate" type="number" min="0" max="999" value="0">') +
      '<button class="btn" type="submit">' + esc(L(CALC.go)) + '</button></form><div id="cres" class="result" hidden aria-live="polite"></div>';
    box.appendChild(wrap);
    function apKwh() { var s = 0; CALC.apps.forEach(function (a) { var h = Math.min(24, Math.max(0, parseFloat($("#ap-" + a[0]).value) || 0)); s += a[1] * a[2] * h * 30 / 1000; }); return Math.round(s); }
    function apShow() { $("#apsum").textContent = fmtN(apKwh()) + " kWh"; }
    $$(".applist input", wrap).forEach(function (el) { el.addEventListener("input", apShow); });
    apShow();
    $("#apuse").addEventListener("click", function () { $("#ckwh").value = apKwh(); $("#ckwh").focus(); });
    $("#fcalc").addEventListener("submit", function (e) {
      noForm(e);
      var k = $("#ckwh").value.replace(/[\s,]/g, "");
      if (!need("ckwh", function () { return /^\d{1,7}$/.test(k); })) { $("#ckwh-err").textContent = L(CALC.kwhBad); return; }
      var kwh = +k, g = CALC.groups.filter(function (x) { return x[0] === $("#cgrp").value; })[0];
      var late = Math.min(999, Math.max(0, parseInt($("#clate").value, 10) || 0));
      var amt = Math.round(kwh * g[1] * 100) / 100, pen = Math.min(amt, Math.round(amt * 0.001 * late * 100) / 100), tot = amt + pen;
      loadToday(function (td) {
        var rows = [[L(CALC.tariff, { n: g[0] }), som(g[1]) + " / kWh"], [L(CALC.energy), fmtN(kwh) + " kWh × " + fmtN(g[1], 2) + " = " + som(amt)]];
        if (late) rows.push([L(CALC.pen, { d: late }), som(pen)]);
        rows.push([L(CALC.total), "<b>" + som(tot) + "</b>"]);
        var usd = td.rates && td.rates.official && td.rates.official.usd;
        if (usd) rows.push([L(CALC.usd) + " (" + fmtN(usd, 2) + ")", "US$ " + fmtN(tot / usd, 2)]);
        var br = (td.prices && td.prices.food || []).filter(function (x) { return x.id === "bread"; })[0];
        if (br && br.som && g[0] === "1.1" && tot >= br.som) rows.push([L(CALC.bread), esc(L(CALC.loaves, { n: fmtN(Math.floor(tot / br.som)) }))]);
        var r = $("#cres");
        r.innerHTML = kv(rows) + (g[0] === "1.10" ? '<p class="tiny">' + esc(L(CALC.pump)) + "</p>" : "") + (late > 40 ? '<p class="warn">' + esc(L(CALC.warn)) + "</p>" : "") + '<p class="tiny">' + esc(L(CALC.est)) + ' <a href="/docs/iradenergo-tariffs-2025.pdf">PDF</a></p>';
        r.hidden = false; r.scrollIntoView({ block: "nearest" });
      });
    });
  }
  FLOWS.water = function (box) {
    box.innerHTML = '<form class="flow" id="fw">' + field("wnet", L(BILL.wcity), sel("wnet", BILL.wnets.map(function (k) { return [k[0], L(k[1])]; }))) +
      field("acct", L(BILL.acct), inp("acct", L(BILL.acctPh), ' inputmode="numeric" maxlength="14"')) + '<button class="btn" type="submit">' + esc(L(BILL.show)) + '</button></form><div id="result" class="result" hidden aria-live="polite"></div>';
    $("#fw").addEventListener("submit", function (e) {
      noForm(e);
      var a = $("#acct").value.replace(/\D/g, "");
      if (!need("acct", function () { return a.length >= 8 && a.length <= 12; })) { $("#acct-err").textContent = L(BILL.acctBad); return; }
      var h = hash("wa" + $("#wnet").value + a);
      if (h % 11 === 0) { result('<p class="warn">' + esc(t("notFound")) + "</p>"); return; }
      var p = 1 + (h % 6), wr = 14.8, sr = 6.2, total = Math.round(p * (wr + sr) * 100) / 100;
      result(kv([[L(BILL.acctNo), esc(mask(a))], [L(BILL.period), esc(monthName(lastMonth()))], [L(BILL.persons), String(p)], [L(BILL.wrate), som(wr)], [L(BILL.srate), som(sr)], [L(BILL.due), "<b>" + som(total) + "</b>"], [L(BILL.dueBy), esc(fmtD(dueDate()))]]) + '<p class="tiny">' + esc(L(BILL.winter)) + "</p>" + payBox("water"));
    });
  };
  HELP.water = {
    en: "<h3>Where else can I pay?</h3><p>At any Talasbank branch, at Irad Pochtasy counters and at the cash desks of Talas and Nurzhan Electric Networks. Keep the receipt until the next bill shows the payment.</p><h3>Meter readings</h3><p>Readings are taken by the network's inspectors once a month. If you think a reading is wrong, call the network's office with your account number.</p>",
    ir: "<h3>Dagı kayda tölösö bolot?</h3><p>Talasbanktın kaalagan filialında, Irad Pochtasının kassalarında jana Talas, Nurzhan elektr tarmaktarının kassalarında. Kiyinki esepte tölöm körüngönchö kvitantsiyanı saktañız.</p><h3>Hisoochtun körsötküchü</h3><p>Körsötküchtü tarmaktın inspektorloru ayına bir jolu alat. Kata bar dep oylosoñuz, esep nomeriñiz menen tarmaktın keñsesine chalıñız.</p>",
    ru: "<h3>Где ещё можно оплатить?</h3><p>В любом отделении «Таласбанка», в окошках «Ирадпочты» и в кассах Таласских и Нуржанских электросетей. Сохраняйте квитанцию, пока оплата не отразится в следующем счёте.</p><h3>Показания счётчика</h3><p>Показания снимают контролёры сети раз в месяц. Если вы считаете, что показания неверны, позвоните в отделение сети и назовите номер лицевого счёта.</p>"
  };
  HELP.electricity = {
    en: HELP.water.en + "<h3>Tariffs</h3><p>Households pay 0.32 som per kWh. All tariffs and connection charges: <a href=\"/docs/iradenergo-tariffs-2025.pdf\">Iradenergo tariff schedule from 1 January 2025</a> (PDF). <a href=\"/docs/iradenergo-bill-explained.pdf\">How to read your bill</a> (PDF).</p>",
    ir: HELP.water.ir + "<h3>Tarifter</h3><p>Turgundar 1 kVt·saat üchün 0,32 som töloyt. Bardık tarifter jana tutashtıruu akısı: <a href=\"/docs/iradenergo-tariffs-2025.pdf\">2025-jıldın 1-yanvarınan tartıp Iradenergonun tarifteri</a> (PDF). <a href=\"/docs/iradenergo-bill-explained.pdf\">Esepti kantip okuu kerek</a> (PDF, anglis tilinde).</p>",
    ru: HELP.water.ru + "<h3>Тарифы</h3><p>Население платит 0,32 сома за кВт·ч. Все тарифы и плата за подключение: <a href=\"/docs/iradenergo-tariffs-2025.pdf\">тарифы «Ирадэнерго» с 1 января 2025 года</a> (PDF). <a href=\"/docs/iradenergo-bill-explained.pdf\">Как читать счёт</a> (PDF, на английском).</p>"
  };

  /* plates: fines and motor policy */
  var PL = {
    plate: { en: "Registration plate", ir: "Mamlekettik nomer", ru: "Госномер" },
    platePh: { en: "as on the plate", ir: "nomerdegidey", ru: "как на номерном знаке" },
    plateBad: { en: "Enter the plate as it appears, 4 to 10 letters and digits.", ir: "Nomerdi 4tön 10go cheyin tamga jana sıfra menen jazıñız.", ru: "Введите номер как на знаке: от 4 до 10 букв и цифр." },
    none: { en: "No unpaid fines are recorded for {p}.", ir: "{p} üchün tölönbögön ayıp jok.", ru: "Неоплаченных штрафов по номеру {p} нет." },
    some: { en: "Unpaid fines for {p}", ir: "{p} üchün tölönbögön ayıptar", ru: "Неоплаченные штрафы по номеру {p}" },
    thD: { en: "Date", ir: "Kün", ru: "Дата" }, thO: { en: "Offence and place", ir: "Ukuk buzuu jana jer", ru: "Нарушение и место" }, thA: { en: "Amount", ir: "Summa", ru: "Сумма" },
    total: { en: "Total", ir: "Bardıgı", ru: "Итого" },
    half: { en: "Half the fine is waived if paid within 20 days of the notice. To dispute a fine, write to the Highway Patrol Corps within 10 days.", ir: "Bildirüüdön kiyin 20 kündün ichinde tölönsö, ayıptın jarımı kechilet. Ayıpka makul bolboso, 10 kündün ichinde Avtojol patrul korpusuna jazıñız.", ru: "При оплате в течение 20 дней с даты уведомления половина штрафа списывается. Обжаловать штраф можно письменно в Корпус дорожного патруля в течение 10 дней." },
    offs: [
      [{ en: "Speeding, camera: Trans-Talas Highway, km {k}", ir: "Ildamdıktı ashuu, kamera: Trans-Talas jolu, {k}-km", ru: "Превышение скорости, камера: Транс-Таласская трасса, {k} км" }, 150],
      [{ en: "Parking in a no-parking zone: Liberty Boulevard, Talas", ir: "Toktotuuga tıyuu salıngan jerde turuu: Erkindik bulvarı, Talas", ru: "Стоянка в запрещённом месте: бульвар Свободы, Талас" }, 50],
      [{ en: "Seat belt not worn: Kök-Bel road, Toguz-Bulak post", ir: "Koopsuzduk kurı takılgan emes: Kök-Bel jolu, Toguz-Bulak postu", ru: "Не пристёгнут ремень: дорога Кок-Бел, пост Тогуз-Булак" }, 75],
      [{ en: "Red light: Azatlık Prospect, Nurzhan", ir: "Kızıl jarık: Azattık prospekti, Nurzhan", ru: "Проезд на красный: проспект Азатлык, Нуржан" }, 200],
      [{ en: "Speeding, camera: Fergana Mountain Transit Highway, km {k}", ir: "Ildamdıktı ashuu, kamera: Fergana tooluu tranzit jolu, {k}-km", ru: "Превышение скорости, камера: Ферганская горная трасса, {k} км" }, 150],
      [{ en: "No technical inspection certificate: Talas–Nurzhan road", ir: "Tekhnikalık karoo kübölügü jok: Talas–Nurzhan jolu", ru: "Нет талона техосмотра: дорога Талас–Нуржан" }, 100]
    ],
    valid: { en: "Valid policy", ir: "Jaraktuu polis", ru: "Действующий полис" },
    expired: { en: "Policy expired", ir: "Polistin möönötü bütkön", ru: "Срок полиса истёк" },
    susp: { en: "Policy suspended: premium unpaid", ir: "Polis toktotulgan: tölöm jok", ru: "Полис приостановлен: взнос не оплачен" },
    noPol: { en: "No compulsory policy is recorded for {p}. Policies bought in the last five working days may not yet be on the register.", ir: "{p} üchün mildettüü polis kattalgan emes. Akırkı besh ish kündö satılıp alıngan polister reestrge ali kire elek bolushu mümkün.", ru: "Обязательный полис по номеру {p} не зарегистрирован. Полисы, купленные за последние пять рабочих дней, могут ещё не быть в реестре." },
    polNo: { en: "Policy number", ir: "Polistin nomeri", ru: "Номер полиса" },
    until: { en: "Valid until", ir: "Möönötü", ru: "Действует до" },
    ended: { en: "Expired on", ir: "Möönötü bütkön kün", ru: "Истёк" },
    office: { en: "Issued by", ir: "Bergen", ru: "Выдан" },
    offices: [{ en: "Iradstrakh, Talas head office", ir: "Iradstrakh, Talas bash keñsesi", ru: "«Ирадстрах», головной офис, Талас" }, { en: "Iradstrakh, Nurzhan office", ir: "Iradstrakh, Nurzhan keñsesi", ru: "«Ирадстрах», офис в Нуржане" }, { en: "Iradstrakh, Kyzyl-Adyr office", ir: "Iradstrakh, Kızıl-Adır keñsesi", ru: "«Ирадстрах», офис в Кызыл-Адыре" }, { en: "Iradstrakh, Tash-Kömür office", ir: "Iradstrakh, Tash-Kömür keñsesi", ru: "«Ирадстрах», офис в Таш-Кумыре" }, { en: "Iradstrakh agent, Chu Gate crossing", ir: "Iradstrakhtın agenti, Chüy darbazası ötköölü", ru: "Агент «Ирадстраха», переход Чуйские ворота" }],
    renew: { en: "Driving without a valid compulsory policy is an offence. A policy can be bought at any Iradstrakh office; the premium for a private car is IS 380 a year.", ir: "Jaraktuu mildettüü polissiz unaa aydoo ukuk buzuu bolup sanalat. Polisti Iradstrakhtın kaalagan keñsesinen satıp alsa bolot; jeke unaa üchün jılına 380 som.", ru: "Езда без действующего обязательного полиса является нарушением. Полис можно купить в любом офисе «Ирадстраха»; взнос для личного автомобиля 380 сомов в год." }
  };
  function plateOk(v) { var p = norm(v); return /^[A-Z0-9АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЫЭЮЯ]{4,10}$/.test(p); }
  function plateForm(box, id, cb) {
    box.innerHTML = '<form class="flow" id="' + id + '">' + field("plate", L(PL.plate), inp("plate", L(PL.platePh), ' maxlength="14" style="text-transform:uppercase"')) + '<button class="btn" type="submit">' + esc(t("check")) + '</button></form><div id="result" class="result" hidden aria-live="polite"></div>';
    $("#" + id).addEventListener("submit", function (e) {
      noForm(e);
      if (!need("plate", plateOk)) { $("#plate-err").textContent = L(PL.plateBad); return; }
      cb(norm($("#plate").value));
    });
  }
  FLOWS.fines = function (box) {
    plateForm(box, "ff", function (p) {
      var h = hash("fi" + p), n = h % 3 === 0 ? 0 : 1 + (h % 3);
      if (!n) { result('<p class="ok">' + esc(L(PL.none, { p: p })) + "</p>"); return; }
      var rows = [], sum = 0;
      for (var i = 0; i < n; i++) {
        var hh = hash(p + i), o = PL.offs[hh % PL.offs.length], d = addDays(today(), -(3 + hh % 55));
        sum += o[1];
        rows.push("<tr><td>" + esc(fmtD(d)) + "</td><td>" + esc(L(o[0], { k: 20 + hh % 170 })) + '</td><td class="num">' + som(o[1]) + "</td></tr>");
      }
      result("<h4>" + esc(L(PL.some, { p: p })) + '</h4><div class="tw"><table class="tbl"><thead><tr><th>' + esc(L(PL.thD)) + "</th><th>" + esc(L(PL.thO)) + '</th><th class="num">' + esc(L(PL.thA)) + "</th></tr></thead><tbody>" + rows.join("") + '</tbody><tfoot><tr><td></td><td>' + esc(L(PL.total)) + '</td><td class="num"><b>' + som(sum) + "</b></td></tr></tfoot></table></div><p class=\"tiny\">" + esc(L(PL.half)) + "</p>" + payBox("fines"));
    });
  };
  FLOWS.motor = function (box) {
    plateForm(box, "fm", function (p) {
      var h = hash("ms" + p), k = h % 10, office = L(PL.offices[(h >>> 4) % PL.offices.length]), pol = "ISM-" + String(26 - (k > 5 ? 1 : 0)) + "-" + ("000000" + (h % 1000000)).slice(-6);
      if (k <= 5) result('<p class="ok">' + esc(L(PL.valid)) + "</p>" + kv([[L(PL.plate), esc(p)], [L(PL.polNo), esc(pol)], [L(PL.until), esc(fmtD(addDays(today(), 12 + (h >>> 3) % 340)))], [L(PL.office), esc(office)]]));
      else if (k <= 7) result('<p class="warn">' + esc(L(PL.expired)) + "</p>" + kv([[L(PL.plate), esc(p)], [L(PL.polNo), esc(pol)], [L(PL.ended), esc(fmtD(addDays(today(), -(1 + (h >>> 3) % 90))))], [L(PL.office), esc(office)]]) + "<p>" + esc(L(PL.renew)) + "</p>");
      else if (k === 8) result('<p class="warn">' + esc(L(PL.susp)) + "</p>" + kv([[L(PL.plate), esc(p)], [L(PL.polNo), esc(pol)], [L(PL.office), esc(office)]]) + "<p>" + esc(L(PL.renew)) + "</p>");
      else result('<p class="warn">' + esc(L(PL.noPol, { p: p })) + "</p><p>" + esc(L(PL.renew)) + "</p>");
    });
  };
  HELP.motor = {
    en: "<h3>Compulsory motor insurance</h3><p>Every vehicle registered in the ISEZ must have a compulsory third-party policy from Iradstrakh (since 2009). The Highway Patrol Corps checks policies at its posts. Vehicles entering from Kazakhstan, Kyrgyzstan or Uzbekistan can buy a short-term policy at the main crossings.</p>",
    ir: "<h3>Mildettüü avtokamsızdandıruu</h3><p>IAEZde kattalgan ar bir unaada Iradstrakhtın mildettüü polisi bolushu kerek (2009-jıldan beri). Avtojol patrul korpusu polisterdi postoroundo tekshiret. Kazakstandan, Kırgızstandan je Özbekstandan kirgen unaalar negizgi ötkööldördö kıska möönöttük polis satıp ala alat.</p>",
    ru: "<h3>Обязательное автострахование</h3><p>Каждое транспортное средство, зарегистрированное в ОЭЗИ, должно иметь обязательный полис «Ирадстраха» (с 2009 года). Корпус дорожного патруля проверяет полисы на постах. Для въезжающих из Казахстана, Кыргызстана и Узбекистана краткосрочный полис продаётся на основных переходах.</p>"
  };
  HELP.fines = {
    en: "<h3>Where do fines come from?</h3><p>Fines issued by the Highway Patrol Corps on the highways and by the city police in Talas, Nurzhan and Iyık Janyl appear here within three working days. Fines issued on paper at a post may take longer.</p>",
    ir: "<h3>Ayıptar kaydan kelet?</h3><p>Avtojol patrul korpusu jana Talas, Nurzhan, Iyık Janyl shaar politsiyası salgan ayıptar bul jerde üch ish kündün ichinde payda bolot. Postto kagaz jüzündö jazılgan ayıptar uzagıraak bolushu mümkün.</p>",
    ru: "<h3>Откуда берутся штрафы?</h3><p>Штрафы Корпуса дорожного патруля на трассах и городской полиции Таласа, Нуржана и Ийык-Джаныла появляются здесь в течение трёх рабочих дней. Штрафы, выписанные на бумаге на посту, могут появиться позже.</p>"
  };

  /* parcel tracking */
  var PC = {
    no: { en: "Tracking number", ir: "Izdöö nomeri", ru: "Трек-номер" },
    noPh: { en: "e.g. RA123456789KZ or IP12345678", ir: "mısalı: RA123456789KZ je IP12345678", ru: "например, RA123456789KZ или IP12345678" },
    bad: { en: "Tracking numbers look like RA123456789KZ (from abroad) or IP12345678 (inside Irad).", ir: "Izdöö nomerleri RA123456789KZ (chet elden) je IP12345678 (Iraddın ichinde) sıyaktuu bolot.", ru: "Трек-номер выглядит как RA123456789KZ (из-за рубежа) или IP12345678 (внутри Ирада)." },
    places: ["Talas Central Post Office", "Post Office No. 14, Nurzhan", "Post Office No. 3, Iyık Janyl", "Post Office, Kyzyl-Adyr", "Post Office, Tash-Kömür", "Post Office, Bazar-Korgon", "Post Office, Toktogul", "Post Office No. 22, Talas (Semiz)"],
    placesRu: ["Таласский центральный почтамт", "Отделение № 14, Нуржан", "Отделение № 3, Ийык-Джаныл", "Отделение связи, Кызыл-Адыр", "Отделение связи, Таш-Кумыр", "Отделение связи, Базар-Коргон", "Отделение связи, Токтогул", "Отделение № 22, Талас (Семиз)"],
    placesIr: ["Talas borborduk pochtası", "14-pochta bölümü, Nurzhan", "3-pochta bölümü, Iyık Janyl", "Pochta bölümü, Kızıl-Adır", "Pochta bölümü, Tash-Kömür", "Pochta bölümü, Bazar-Korgon", "Pochta bölümü, Toktogul", "22-pochta bölümü, Talas (Semiz)"],
    ev: {
      acc: { en: "Accepted at {p}", ir: "{p} kabıl aldı", ru: "Принято: {p}" },
      sort: { en: "Sorted, Talas sorting centre", ir: "Talas sortirovka borborunda sortirovkalandı", ru: "Обработано, Таласский сортировочный центр" },
      disp: { en: "Dispatched to {p}", ir: "{p} karay jönötüldü", ru: "Отправлено в {p}" },
      arr: { en: "Arrived at {p}", ir: "{p} keldi", ru: "Прибыло: {p}" },
      wait: { en: "Awaiting collection at {p}. Bring your ID card; items are kept for 30 days.", ir: "{p} aluuga dayar. Jeke kuböölügüñüzdü ala keliñiz; jönötmölör 30 kün saktalat.", ru: "Ожидает получения: {p}. Возьмите удостоверение личности; отправления хранятся 30 дней." },
      deliv: { en: "Delivered", ir: "Tapshırıldı", ru: "Вручено" },
      abroad: { en: "Accepted for posting abroad ({c})", ir: "Chet elde jönötüügö kabıl alındı ({c})", ru: "Принято к пересылке за рубежом ({c})" },
      almaty: { en: "Received by the Kazakh postal service, Almaty international exchange", ir: "Kazakstan pochta kızmatı aldı, Almatı el aralık almashuu punktu", ru: "Получено казахстанской почтой, Алматинский международный пункт обмена" },
      handed: { en: "Handed over to Irad Pochtasy at the Chu Gate exchange", ir: "Chüy darbazasındagı almashuu punktunda Irad Pochtasına berildi", ru: "Передано «Ирадпочте» в пункте обмена Чуйские ворота" },
      customs: { en: "Customs inspection, Talas Customs Clearance Terminal", ir: "Bajı tekshirüüsü, Talas bajı tarıktoo terminalı", ru: "Таможенный досмотр, Таласский таможенный терминал" },
      held: { en: "Held by customs: a declaration is required. Bring the invoice and your ID card to the terminal's postal counter.", ir: "Bajı karmadı: deklaratsiya kerek. Esep-faktura jana jeke kuböölügüñüz menen terminaldın pochta kassasına keliñiz.", ru: "Задержано таможней: требуется декларация. Принесите счёт и удостоверение личности в почтовое окно терминала." },
      released: { en: "Released by customs", ir: "Bajıdan chıgarıldı", ru: "Выпущено таможней" }
    },
    intl: { en: "International items reach Irad through the Kazakh postal service, by way of Almaty. Allow three to six weeks.", ir: "Chet eldik jönötmölör Iradga Kazakstan pochtası arkıluu, Almatı arkıluu kelet. Üch-altı juma kütüñüz.", ru: "Международные отправления приходят в Ирад через казахстанскую почту, через Алматы. Срок три-шесть недель." },
    countries: { KZ: "KZ", RU: "RU", US: "US", CN: "CN", KG: "KG", UZ: "UZ", DE: "DE", TR: "TR", MX: "MX", GB: "GB" }
  };
  function place(i) { return (LANG === "ru" ? PC.placesRu : LANG === "ir" ? PC.placesIr : PC.places)[i % PC.places.length]; }
  FLOWS.parcel = function (box) {
    box.innerHTML = '<form class="flow" id="fp">' + field("tn", L(PC.no), inp("tn", L(PC.noPh), ' maxlength="20" style="text-transform:uppercase"')) + '<button class="btn" type="submit">' + esc(t("check")) + '</button></form><div id="result" class="result" hidden aria-live="polite"></div>';
    $("#fp").addEventListener("submit", function (e) {
      noForm(e);
      var n = norm($("#tn").value);
      var intl = /^[A-Z]{2}\d{9}[A-Z]{2}$/.test(n), dom = /^IP\d{8,10}$/.test(n);
      if (!intl && !dom) { if (!need("tn")) return; result('<p class="warn">' + esc(L(PC.bad)) + "</p>"); return; }
      var h = hash(n);
      if (h % 9 === 0) { result('<p class="warn">' + esc(t("notFound")) + "</p>"); return; }
      var dest = (h >>> 3) % PC.places.length, ev = [], day = 0, stage = h % 4, E = PC.ev;
      function push(o, v) { ev.push([day, L(o, v)]); day += 1 + ((h >>> (ev.length + 2)) % 3); }
      if (intl) {
        var c = n.slice(-2);
        push(E.abroad, { c: c }); day += 6; push(E.almaty); day += 4; push(E.handed); push(E.customs);
        if (stage === 0) push(E.held);
        else { push(E.released); push(E.disp, { p: place(dest) }); if (stage >= 2) push(E.arr, { p: place(dest) }); if (stage === 2) push(E.wait, { p: place(dest) }); if (stage === 3) push(E.deliv); }
      } else {
        var org = (h >>> 7) % PC.places.length; if (org === dest) org = (org + 1) % PC.places.length;
        push(E.acc, { p: place(org) }); push(E.sort); push(E.disp, { p: place(dest) });
        if (stage >= 1) push(E.arr, { p: place(dest) });
        if (stage === 1 || stage === 2) push(E.wait, { p: place(dest) });
        if (stage === 3) push(E.deliv);
      }
      var total = ev[ev.length - 1][0], start = addDays(today(), -total - (h % 2));
      result("<h4>" + esc(n) + '</h4><ol class="track">' + ev.slice().reverse().map(function (x, i) { return '<li class="' + (i === 0 ? "now" : "") + '"><span class="d">' + esc(fmtD(addDays(start, x[0]))) + "</span><span>" + esc(x[1]) + "</span></li>"; }).join("") + "</ol>" + (intl ? '<p class="tiny">' + esc(L(PC.intl)) + "</p>" : ""));
    });
  };
  HELP.parcel = {
    en: "<h3>Mail from abroad</h3><p>Irad Pochtasy exchanges international mail through the Kazakh postal service. Senders abroad should add “via Almaty, Kazakhstan” to the address. Parcels from abroad are inspected by customs at the Talas Customs Clearance Terminal. Irad Pochtasy stamps are valid for domestic mail only.</p><p>Prices, post offices and stamps: <a href=\"https://post.iradgov.org/\">post.iradgov.org</a>.</p>",
    ir: "<h3>Chet elden kelgen pochta</h3><p>Irad Pochtası el aralık pochtanı Kazakstan pochta kızmatı arkıluu almashat. Chet eldegi jönötüüchülör darekke “via Almaty, Kazakhstan” dep koshushu kerek. Chet elden kelgen posılkalardı Talas bajı tarıktoo terminalında bajı tekshiret. Irad Pochtasının markaları ölkö ichindegi pochta üchün gana jaraktuu.</p><p>Bahalar, pochta bölümdörü jana markalar: <a href=\"https://post.iradgov.org/\">post.iradgov.org</a>.</p>",
    ru: "<h3>Почта из-за рубежа</h3><p>«Ирадпочта» обменивается международной почтой через казахстанскую почтовую службу. Отправителям за рубежом следует добавлять к адресу «via Almaty, Kazakhstan». Посылки из-за рубежа проходят таможенный досмотр на Таласском таможенном терминале. Марки «Ирадпочты» действительны только для внутренней почты.</p><p>Тарифы, отделения и марки: <a href=\"https://post.iradgov.org/\">post.iradgov.org</a>.</p>"
  };

  /* crossing (information only) */
  FLOWS.crossing = function (box) {
    box.innerHTML = '<div class="flow">' + L({
      en: "<p class=\"warn\">Permits to cross the Qara-Chik line are not issued online.</p><h3>Visitors from the tribal regions</h3><p>Residents of the tribal regions travel to the ISEZ with a permit issued by their clan council. The permit is registered by the Republican Gendarmerie at the crossing point. Registration may take from a day to a week; bring the permit and an identity document.</p><h3>Crossing points</h3><p>Qara-Chik Border Checkpoint (main crossing, Kara-Buura District), Aksay, Toguz-Bulak (two posts on the Kök-Bel road), Kara-Bulak (Kenkol Pass road), Suusamyr, and the local crossings on the Mailuu-Suu road, the Arslanbob road and at Kök-Kamar. Crossings are open in daylight.</p><h3>Pilgrimages</h3><p>Arrangements for pilgrims travelling to Iyık Janyl for the Feast of St. Janyl are agreed each year through the Joint Liaison Committee of the United Nations Mission in Irad.</p><p>Weapons may not be carried within 12 km of the line.</p>",
      ir: "<p class=\"warn\">Kara-Chik liniyasınan ötüü uruksattarı onlayn berilbeyt.</p><h3>Tooluu aymaktardan kelgender</h3><p>Tooluu aymaktardın turgundarı IAEZge öz uruk keñeshi bergen uruksat menen kelet. Uruksattı ötkööl punktunda Respublikalık jandarmeriya kattayt. Kattoo bir kündön bir jumaga cheyin sozulushu mümkün; uruksattı jana ınyıktoochu dokumentti ala keliñiz.</p><h3>Ötkööl punkttarı</h3><p>Kara-Chik chek ara postu (negizgi ötkööl, Kara-Buura aymagı), Aksay, Toguz-Bulak (Kök-Bel jolunda eki post), Kara-Bulak (Kenkol ashuusunun jolu), Suusamır jana Maylu-Suu jolundagı, Arstanbap jolundagı, Kök-Kamardagı jergiliktüü ötkööldör. Ötkööldör kündüz achık.</p><h3>Ziyarattar</h3><p>Janyl Mayramına Iyık Janylga bargan ziyaratchılar üchün tartip ar jılı Iraddagı BUU missiyasının Birgeleshken baylanısh komiteti arkıluu makuldashılat.</p><p>Liniyadan 12 km aralıkta kural kötörüügö bolboyt.</p>",
      ru: "<p class=\"warn\">Разрешения на пересечение линии Кара-Чик онлайн не выдаются.</p><h3>Приезжающие из племенных районов</h3><p>Жители племенных районов приезжают в ОЭЗИ по разрешению своего совета рода. Разрешение регистрирует Республиканская жандармерия на пункте пропуска. Регистрация может занять от дня до недели; возьмите разрешение и документ, удостоверяющий личность.</p><h3>Пункты пропуска</h3><p>КПП Кара-Чик (основной, Кара-Бууринский район), Аксай, Тогуз-Булак (два поста на дороге Кок-Бел), Кара-Булак (дорога на перевал Кенкол), Суусамыр, а также местные переходы на дорогах Майлуу-Суу и Арсланбоб и у Кок-Камара. Переходы открыты в светлое время суток.</p><h3>Паломничество</h3><p>Порядок для паломников, едущих в Ийык-Джаныл на праздник Святой Джаныл, ежегодно согласуется через Совместный комитет связи Миссии ООН в Ираде.</p><p>Ношение оружия ближе 12 км от линии запрещено.</p>"
    }) + "</div>";
  };
  FLOWS.civil = function (box) {
    box.innerHTML = '<div class="flow">' + L({
      en: "<p>Copies of birth, marriage and death certificates are issued by the civil registry office of the district or city where the event was registered. Bring your ID card; the fee is IS 30 a copy. Online requests will open on e-Irad in 2027.</p><p>Records from before 1992 are held by the State Archives of Irad.</p>",
      ir: "<p>Tuuluu, nike jana ölüm kübölüktörünün köchürmölörün okuya kattalgan aymaktın je shaardın JAAK bölümü beret. Jeke kuböölügüñüzdü ala keliñiz; bir köchürmö 30 som. Onlayn arızdar e-Iradda 2027-jılı achılat.</p><p>1992-jılga cheyinki jazuular Irad mamlekettik arkhivinde saktalat.</p>",
      ru: "<p>Копии свидетельств о рождении, браке и смерти выдаёт отдел ЗАГС района или города, где было зарегистрировано событие. Возьмите удостоверение личности; пошлина 30 сомов за копию. Онлайн-запросы откроются на e-Irad в 2027 году.</p><p>Записи до 1992 года хранятся в Государственном архиве Ирада.</p>"
    }) + '<button class="btn" type="button" disabled>' + esc(L({ en: "Request online (2027)", ir: "Onlayn suroo (2027)", ru: "Запросить онлайн (2027)" })) + "</button></div>";
  };


  /* ---------- printed forms (window.E_FORMS, assets/forms.js) ---------- */
  var FX = {
    h: { en: "Forms for this service", ir: "Bul kızmattın formaları", ru: "Бланки для этой услуги" },
    note: { en: "Print on A4 paper and complete by hand in block capitals, in black or blue ink. Forms printed from e-Irad are accepted at every counter.", ir: "A4 kagazına basıp, kara je kök siya menen choñ basma tamgalar menen koldon tolturuñuz. e-Iraddan basılgan formalar bardık kassalarda kabıl alınat.", ru: "Распечатайте на бумаге A4 и заполните от руки печатными буквами чёрными или синими чернилами. Бланки, распечатанные с e-Irad, принимаются во всех окошках." }
  };
  function formsFor(id) { var F = window.E_FORMS; if (!F || !F.list) return []; return F.list.filter(function (f) { return f.service === id; }); }
  function formBox(id) {
    var a = formsFor(id); if (!a.length) return "";
    return '<div class="formbox"><h4>' + esc(L(FX.h)) + "</h4><ul>" + a.map(function (f) {
      return '<li><a href="' + esc(f.url) + '">' + esc(L(f.title)) + '</a> <span class="fcode">' + esc(f.code) + " · PDF</span></li>";
    }).join("") + '</ul><p class="tiny">' + esc(L(FX.note)) + "</p></div>";
  }

  /* ---------- helpers for the services added in October 2026 ---------- */
  function ul(a) { return "<ul>" + a.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>"; }
  function olh(a) { return "<ol>" + a.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ol>"; }
  function P(o, cls, v) { return "<p" + (cls ? ' class="' + cls + '"' : "") + ">" + esc(L(o, v)) + "</p>"; }
  function H4(o) { return "<h4>" + esc(L(o)) + "</h4>"; }
  function opts(a) { return a.map(function (k) { return [k[0], L(k[1])]; }); }
  function pick(a, k) { for (var i = 0; i < a.length; i++) if (a[i][0] === k) return a[i][1]; return null; }
  function chk(id, label) { return '<div class="fld chk"><label><input id="' + id + '" type="checkbox"> ' + esc(label) + "</label></div>"; }
  function numIn(id, min, max) { return '<input id="' + id + '" type="number" min="' + min + '" max="' + max + '" inputmode="numeric">'; }
  function dateIn(id) { return '<input id="' + id + '" type="date">'; }
  function flowForm(id, fields, btn) { return '<form class="flow" id="' + id + '">' + fields + '<button class="btn" type="submit">' + esc(btn) + '</button></form><div id="result" class="result" hidden aria-live="polite"></div>'; }
  function onSub(id, fn) { $("#" + id).addEventListener("submit", function (e) { noForm(e); fn(); }); }
  function refBox(label, ref, rows) { return '<div class="ticket"><div class="tno"><span>' + esc(L(label)) + "</span><b>" + esc(ref) + "</b></div>" + (rows && rows.length ? kv(rows) : "") + "</div>"; }
  function yy() { return String(iradNow().getFullYear()).slice(2); }
  function refNo(pre, seed) { return pre + "-" + yy() + "-" + pad5(hash(seed) % 100000); }
  function caps(s) { return String(s || "").trim().replace(/\s+/g, " ").toUpperCase(); }
  function svcLink(id) { var s = svc(id); return s ? '<a href="' + svcHref(s, SEC()) + '">' + esc(L(s.name)) + "</a>" : ""; }
  function intVal(id) { var v = parseInt($("#" + id).value, 10); return isNaN(v) ? null : v; }
  function dateVal(id) { var v = $("#" + id).value; return v ? new Date(v + "T00:00:00Z") : null; }
  function daysTo(d) { return Math.round((d - today()) / 86400000); }
  var C = {
    dlPilot: { en: "This service is in the online submission pilot: you can submit the form on e-Irad instead of at the counter (see Online submission on this page) and present the originals when you collect the result. Otherwise download the form, complete it in block capitals and bring it, with this reference and the originals, to the counter.", ir: "Bul kızmat onlayn berüü sınoosuna kirgen: formanı kassaga emes, e-Iradda berseñiz bolot (ushul bettegi Onlayn berüü bölümün karañız), asıldardı natıyjanı alganda körsötösüz. Bolboso formanı jüktöp alıp, choñ basma tamgalar menen tolturup, bul nomer jana asıldar menen kassaga alıp keliñiz.", ru: "Эта услуга участвует в пилотном проекте онлайн-подачи: бланк можно подать на e-Irad, а не в окошке (см. «Онлайн-подача» на этой странице), а оригиналы предъявить при получении результата. Иначе скачайте бланк, заполните его печатными буквами и принесите в окошко вместе с этим номером и оригиналами." },
    ref: { en: "Pre-application reference", ir: "Aldın ala arızdın nomeri", ru: "Номер предварительной заявки" },
    bring: { en: "Bring to the counter", ir: "Kassaga ala keliñiz", ru: "Принесите в окошко" },
    dl: { en: "Online submission is not available during the pilot. Download the form, complete it in block capitals and bring it, with this reference and the originals of the documents listed, to the counter. Copies are accepted only together with the originals.", ir: "Sınoo mezgilinde onlayn tapshıruu jok. Formanı jüktöp alıp, choñ basma tamgalar menen tolturuñuz da, bul nomer jana tizmedegi dokumentterdin asıldarı menen kassaga alıp keliñiz. Köchürmölör asılı menen birge gana kabıl alınat.", ru: "В пилотном режиме онлайн-подача недоступна. Скачайте бланк, заполните его печатными буквами и принесите в окошко вместе с этим номером и оригиналами перечисленных документов. Копии принимаются только вместе с оригиналами." },
    district: { en: "Your district office (Passport and Residence Service desk). " + "District offices are open Monday to Friday, 9:00–17:00.", ir: "Aymaktık keñseñiz (Pasport jana jashoo jayı kızmatının terezesi). Aymaktık keñseler düyshömbüdön jumaga cheyin 9:00–17:00 ishteyt.", ru: "Ваш районный отдел (окно Службы паспортов и регистрации). Районные отделы работают с понедельника по пятницу, 9:00–17:00." },
    where: { en: "Where", ir: "Kayda", ru: "Куда" },
    fee: { en: "State duty", ir: "Mamlekettik alım", ru: "Госпошлина" },
    ready: { en: "Ready in", ir: "Dayar bolot", ru: "Срок" },
    status: { en: "Status", ir: "Abalı", ru: "Статус" },
    until: { en: "Valid until", ir: "Möönötü", ru: "Действует до" },
    ended: { en: "Expired on", ir: "Möönötü bütkön kün", ru: "Истёк" },
    city: { en: "City", ir: "Shaar", ru: "Город" },
    wdays: { en: "{n} working days", ir: "{n} ish kün", ru: "{n} рабочих дней" },
    perYear: { en: "{a} a year", ir: "jılına {a}", ru: "{a} в год" },
    payAt: { en: "Pay the state duty at any Talasbank branch before you go, and keep the receipt. A printable payment order is on the State duty calculator page.", ir: "Mamlekettik alımdı barardan murun Talasbanktın kaalagan filialında tölöp, kvitantsiyanı saktañız. Basıp chıgaruuga boluuchu tölöm tapshırmasın Mamlekettik alım kalkulyatorunun betinen tabasız.", ru: "Оплатите госпошлину заранее в любом отделении «Таласбанка» и сохраните квитанцию. Платёжное поручение для печати есть на странице калькулятора госпошлины." },
    pastDate: { en: "Choose a date in the future.", ir: "Kelechektegi kündü tandañız.", ru: "Выберите будущую дату." },
    numBad: { en: "Enter the number exactly as it is printed, for example {e}.", ir: "Nomerdi basılganday jazıñız, mısalı: {e}.", ru: "Введите номер точно как напечатано, например {e}." }
  };
  function counterEnd(id, docs, where) {
    return H4(C.bring) + ul(docs) + (where ? "<p><b>" + esc(L(where)) + "</b></p>" : "") + P(window.E_APPS && window.E_APPS.spec(id) ? C.dlPilot : C.dl) + formBox(id);
  }
  /* state duties (som), shared by every service that names one and by the calculator */
  var DUTY = [
    ["passport", 120, "142101", { en: "Passport", ir: "Pasport", ru: "Паспорт" }],
    ["idcard", 60, "142102", { en: "ID card", ir: "ID-karta", ru: "ID-карта" }],
    ["idlost", 50, "142103", { en: "Replacement of a lost ID card (in addition to the ID card duty)", ir: "Jogolgon ID-kartanı almashtıruu (ID-karta alımına koshumcha)", ru: "Замена утерянной ID-карты (сверх пошлины за ID-карту)" }],
    ["rescard", 300, "142104", { en: "Residence card (foreign nationals)", ir: "Jashoo kartası (chet el jarandarı)", ru: "Вид на жительство (иностранцы)" }],
    ["civil", 30, "142111", { en: "Copy of a birth, marriage or death certificate", ir: "Tuuluu, nike je ölüm kübölügünün köchürmösü", ru: "Копия свидетельства о рождении, браке или смерти" }],
    ["name", 100, "142112", { en: "Change of name", ir: "Attı özgörtüü", ru: "Перемена имени" }],
    ["conduct", 40, "142121", { en: "Certificate of good conduct", ir: "Sottolbogonduk tuuraluu maalımkat", ru: "Справка о несудимости" }],
    ["licence", 80, "142131", { en: "Exchange of a foreign driving licence", ir: "Chet eldik aydoochuluk kübölügün almashtıruu", ru: "Обмен иностранного водительского удостоверения" }],
    ["vehreg", 200, "142132", { en: "Registration of a vehicle", ir: "Unaanı kattoo", ru: "Регистрация транспортного средства" }],
    ["bizst", 150, "142141", { en: "Registration of a sole trader", ir: "Jeke ishkerdi kattoo", ru: "Регистрация ИП" }],
    ["bizllc", 600, "142142", { en: "Registration of a company or cooperative", ir: "Kompaniyanı je kooperativdi kattoo", ru: "Регистрация компании или кооператива" }],
    ["bizfarm", 100, "142143", { en: "Registration of a farm", ir: "Dıykan charbasın kattoo", ru: "Регистрация фермерского хозяйства" }],
    ["extract", 50, "142144", { en: "Extract from the Register of Firms", ir: "Firmalar reestrinen köchürmö", ru: "Выписка из Реестра фирм" }],
    ["event", 250, "142151", { en: "Permit for a ticketed event", ir: "Bilettüü ish-charaga uruksat", ru: "Разрешение на платное мероприятие" }],
    ["building", 400, "142152", { en: "Building permit", ir: "Kurulush uruksatı", ru: "Разрешение на строительство" }],
    ["sign", 150, "142153", { en: "Outdoor sign permit", ir: "Tıshkı tabelaga uruksat", ru: "Разрешение на наружную вывеску" }],
    ["taxi", 500, "142161", { en: "Passenger taxi licence (a year)", ir: "Taksi litsenziyası (jılına)", ru: "Лицензия на такси (в год)" }],
    ["alcohol", 3000, "142162", { en: "Licence to sell alcoholic beverages, retail (a year)", ir: "Alkogoldük ichimdikterdi chekene satuu litsenziyası (jılına)", ru: "Лицензия на розничную продажу алкоголя (в год)" }]
  ];
  function duty(k) { for (var i = 0; i < DUTY.length; i++) if (DUTY[i][0] === k) return DUTY[i][1]; return 0; }
  /* the vehicle register agrees with the motor policy check and the road-use charge */
  function motorK(p) { return hash("ms" + p) % 10; }
  function roadPaid(p) { return hash("rc" + p) % 3 !== 0; }

  /* address registration */
  var AD = {
    kind: { en: "You are moving", ir: "Köchüp jatasız", ru: "Вы переезжаете" },
    kinds: [["same", { en: "Within the same city or district", ir: "Oshol ele shaardın je aymaktın ichinde", ru: "В пределах того же города или района" }], ["other", { en: "From another district or city of the ISEZ", ir: "IAEZdin bashka aymagınan je shaarınan", ru: "Из другого района или города ОЭЗИ" }], ["atr", { en: "From the tribal regions", ir: "Tooluu aymaktardan", ru: "Из племенных районов" }], ["abroad", { en: "From abroad (foreign nationals)", ir: "Chet elden (chet el jarandarı)", ru: "Из-за рубежа (иностранцы)" }]],
    house: { en: "You will live in", ir: "Jashay turgan jayıñız", ru: "Вы будете жить" },
    houses: [["own", { en: "Housing you own", ir: "Öz menchigiñizdegi jay", ru: "В собственном жилье" }], ["rent", { en: "Rented housing", ir: "Ijaraga alıngan jay", ru: "В арендованном жилье" }], ["rel", { en: "Housing of relatives", ir: "Tuuganıñızdın jayı", ru: "У родственников" }], ["hostel", { en: "A hostel or staff dormitory", ir: "Jatakana", ru: "В общежитии" }]],
    district: { en: "New district or city", ir: "Jañı aymak je shaar", ru: "Новый район или город" },
    moved: { en: "Date of moving", ir: "Köchkön kün", ru: "Дата переезда" },
    btn: { en: "Prepare notification", ir: "Kabarlamanı dayardoo", ru: "Подготовить уведомление" },
    deadline: { en: "Notify by", ir: "Kabarloo möönötü", ru: "Уведомить до" },
    late: { en: "The ten-day period for notification ended on {d}. A fine of IS 20 for late notification is paid at Talasbank before the notification is accepted.", ir: "Kabarloonun on kündük möönötü {d} bütkön. Kechigip kabarlaganı üchün 20 som ayıp kabarlama kabıl alınganga cheyin Talasbankka tölönöt.", ru: "Десятидневный срок уведомления истёк {d}. Штраф 20 сомов за просрочку оплачивается в «Таласбанке» до приёма уведомления." },
    future: { en: "A change of residence can be notified only after you have moved.", ir: "Jashoo jayın özgörtüü tuuraluu köchköndön kiyin gana kabarloogo bolot.", ru: "О перемене места жительства можно уведомить только после переезда." },
    docs: {
      base: { en: ["Your ID card or passport", "Form PRS-3, completed and signed"], ir: ["Jeke kuböölügüñüz je pasportuñuz", "Tolturulgan jana kol koyulgan PRS-3 forması"], ru: ["Удостоверение личности или паспорт", "Заполненный и подписанный бланк PRS-3"] },
      own: { en: ["The ownership certificate of the housing"], ir: ["Jaydın menchik kübölügü"], ru: ["Свидетельство о собственности на жильё"] },
      rent: { en: ["The lease, registered with the Tax Service", "The owner's written consent, signed in front of the official or certified by a notary"], ir: ["Salık kızmatında kattalgan ijara kelishimi", "Eesinin kızmatkerdin aldında kol koyulgan je notarius tastıktagan jazuu jüzündögü makuldugu"], ru: ["Договор аренды, зарегистрированный в Налоговой службе", "Письменное согласие владельца, подписанное в присутствии сотрудника или заверенное нотариусом"] },
      rel: { en: ["The owner's ownership certificate", "The owner in person, with his or her ID card, to sign the consent at the counter"], ir: ["Eesinin menchik kübölügü", "Kassada makulduk kagazına kol koyush üchün jeke kuböölügü menen eesi özü"], ru: ["Свидетельство о собственности владельца", "Владелец лично, с удостоверением личности, чтобы подписать согласие в окошке"] },
      hostel: { en: ["A letter from the hostel administration, with its stamp"], ir: ["Jatakananın administratsiyasının möör basılgan katı"], ru: ["Письмо администрации общежития с печатью"] },
      other: { en: ["The deregistration slip (part B of form PRS-3) stamped by the office of your previous district"], ir: ["Murdagı aymaktık keñse möör baskan kattoodon chıguu kagazı (PRS-3 formasının B bölügü)"], ru: ["Листок снятия с учёта (часть Б бланка PRS-3) с печатью отдела прежнего района"] },
      atr: { en: ["The permit of your clan council, registered by the Republican Gendarmerie at the crossing point"], ir: ["Ötkööl punktunda Respublikalık jandarmeriya kattagan uruk keñeshiñizdin uruksatı"], ru: ["Разрешение совета рода, зарегистрированное Республиканской жандармерией на пункте пропуска"] },
      abroad: { en: ["Your passport and residence card, or the receipt for the residence card application"], ir: ["Pasportuñuz jana jashoo kartañız je jashoo kartasına arız bergeniñiz tuuraluu kvitantsiya"], ru: ["Паспорт и вид на жительство или расписка о приёме заявления на вид на жительство"] }
    },
    otherNote: { en: "If you did not deregister before leaving, the slip can be requested from your previous district office by registered letter. Enclose a stamped addressed envelope.", ir: "Ketip baratıp kattoodon chıkpasañız, kagazdı murdagı aymaktık keñseden buyurtma kat menen surasa bolot. Darek jazılgan, marka chaplangan konvert tirkeñiz.", ru: "Если вы не снялись с учёта до отъезда, листок можно запросить в прежнем районном отделе заказным письмом. Приложите конверт с маркой и обратным адресом." },
    atrNote: { en: "Registration of residents of the tribal regions is temporary, for the period of the clan council's permit.", ir: "Tooluu aymaktardın turgundarın kattoo ubaktıluu, uruk keñeshinin uruksatının möönötünö.", ru: "Жители племенных районов регистрируются временно, на срок разрешения совета рода." },
    sticker: { en: "Registration is free. The new address is printed on a sticker for the back of your ID card while you wait.", ir: "Kattoo akısız. Jañı darek jeke kuböölügüñüzdün artına chaplanuuchu stikerge kütüp turganda basılat.", ru: "Регистрация бесплатна. Новый адрес печатается при вас на наклейке на обороте удостоверения личности." }
  };
  FLOWS.address = function (box) {
    box.innerHTML = flowForm("fad", field("adkind", L(AD.kind), sel("adkind", opts(AD.kinds))) + field("adhouse", L(AD.house), sel("adhouse", opts(AD.houses))) + field("addist", L(AD.district), sel("addist", opts(DISTRICTS))) + field("admoved", L(AD.moved), dateIn("admoved")), L(AD.btn));
    onSub("fad", function () {
      if (!need("admoved")) return;
      var m = dateVal("admoved"), k = $("#adkind").value, ho = $("#adhouse").value, dist = $("#addist").value, dl = addDays(m, 10);
      if (daysTo(m) > 0) { $("#admoved-err").textContent = L(AD.future); $("#admoved-err").hidden = false; return; }
      var docs = L(AD.docs.base).concat(L(AD.docs[ho]));
      if (k !== "same") docs = docs.concat(L(AD.docs[k]));
      var notes = (daysTo(dl) < 0 ? P(AD.late, "warn", { d: fmtD(dl) }) : "") + (k === "other" ? P(AD.otherNote) : "") + (k === "atr" ? P(AD.atrNote) : "");
      result(refBox(C.ref, refNo(dist.toUpperCase() + "-AR", k + ho + dist + m.toISOString()), [[L(AD.district), esc(L(pick(DISTRICTS, dist)))], [L(AD.moved), esc(fmtD(m))], [L(AD.deadline), esc(fmtD(dl))]]) + notes + counterEnd("address", docs, C.district) + '<p class="tiny">' + esc(L(AD.sticker)) + "</p>");
    });
  };
  HELP.address = {
    en: "<h3>Who must notify?</h3><p>Everyone who lives in the ISEZ notifies a change of residence within ten days of moving, including children (by a parent) and foreign nationals with a residence card. Students living in a university hostel are registered by the university.</p><h3>Why it matters</h3><p>Your registered address decides your passport office, the polyclinic, the school, the post office where pensions are paid and where tax notices are sent.</p>",
    ir: "<h3>Kim kabarlashı kerek?</h3><p>IAEZde jashagandardın bardıgı köchköndön kiyin on kündün ichinde jashoo jayın özgörtköönün kabarlayt, anın ichinde baldar (ata-enesi arkıluu) jana jashoo kartası bar chet el jarandarı. Universitettin jatakanasında jashagan studentterdi universitet kattayt.</p><h3>Emne üchün maanilüü</h3><p>Kattalgan darekiñiz pasport bölümüñüzdü, emdekananı, mektepti, pensiya tölönüüchü pochta bölümün jana salık bildirüülörü jönötülüüchü jerdi anıktayt.</p>",
    ru: "<h3>Кто обязан уведомить?</h3><p>Все, кто живёт в ОЭЗИ, уведомляют о перемене места жительства в течение десяти дней после переезда, включая детей (через родителя) и иностранцев с видом на жительство. Студентов в университетском общежитии регистрирует университет.</p><h3>Зачем это нужно</h3><p>От адреса регистрации зависят паспортный стол, поликлиника, школа, почтовое отделение, где выплачивается пенсия, и адрес, по которому приходят налоговые уведомления.</p>"
  };

  /* lost ID card */
  var LI = {
    what: { en: "What happened", ir: "Emne boldu", ru: "Что произошло" },
    whats: [["lost", { en: "The card was lost", ir: "Karta jogoldu", ru: "Карта утеряна" }], ["stolen", { en: "The card was stolen", ir: "Karta uurdaldı", ru: "Карта украдена" }], ["damaged", { en: "The card is damaged or worn", ir: "Karta buzuldu je eskirdi", ru: "Карта повреждена или изношена" }]],
    btn: { en: "Show what to do", ir: "Emne kıluu kerektigin körsötüü", ru: "Показать порядок действий" },
    stepsH: { en: "What to do, in this order", ir: "Emne kıluu kerek, ushul tartipte", ru: "Что делать, в этом порядке" },
    police: { en: "Report the {w} at any city police station or district department of the Ministry of Internal Security and ask for the certificate of {w}. The certificate is issued within three working days.", ir: "{w} tuuraluu kaalagan shaar politsiyasının bölümünö je Ichki koopsuzduk ministrliginin aymaktık bölümünö kabarlap, {w} tuuraluu maalımkat surañız. Maalımkat üch ish kündün ichinde berilet.", ru: "Заявите о {w} в любой отдел городской полиции или районный отдел Министерства внутренней безопасности и получите справку о {w}. Справка выдаётся в течение трёх рабочих дней." },
    wLost: { en: "loss", ir: "jogoltuu", ru: "утере" }, wStolen: { en: "theft", ir: "uurdaluu", ru: "краже" },
    notice: { en: "Publish a notice that the card is invalid in any newspaper on the Irad Pochtasy subscription list, and keep the page. The notice gives the card's series and the date of loss, not the number.", ir: "Kartanın jaraksız ekeni tuuraluu bildirüünü Irad Pochtasının jazıluu tizmesindegi kaalagan gazetaga jarıyalap, betin saktañız. Bildirüüdö kartanın nomeri emes, seriyası jana jogolgon kün körsötülöt.", ru: "Опубликуйте объявление о недействительности карты в любой газете из подписного каталога «Ирадпочты» и сохраните страницу. В объявлении указываются серия карты и дата утраты, но не номер." },
    pay: { en: "Pay the state duty at Talasbank: {a}.", ir: "Mamlekettik alımdı Talasbankka tölöñüz: {a}.", ru: "Оплатите госпошлину в «Таласбанке»: {a}." },
    queue: { en: "Take a number for your passport office on e-Irad: {s}.", ir: "e-Iradda pasport bölümüñüzgö kezek alıñız: {s}.", ru: "Возьмите номер в свой паспортный стол на e-Irad: {s}." },
    counter: { en: "When your number is called, bring form PRS-7, two photographs 3.5 × 4.5 cm, your birth certificate, your residence registration and the papers from the steps above{x}.", ir: "Nomeriñiz chakırılganda PRS-7 formasın, 3,5 × 4,5 sm eki sürötü, tuuluu tuuraluu kübölügüñüzdü, jashoo jayı boyuncha kattooñuzdu jana jogorudagı kadamdardagı kagazdardı ala keliñiz{x}.", ru: "Когда вызовут ваш номер, принесите бланк PRS-7, две фотографии 3,5 × 4,5 см, свидетельство о рождении, регистрацию по месту жительства и документы с предыдущих шагов{x}." },
    dmg: { en: " and the damaged card", ir: " jana buzulgan kartanı", ru: ", а также повреждённую карту" },
    temp: { en: "On request you are given a temporary certificate of identity, valid for 30 days and renewable once, while the new card is made.", ir: "Suroo boyuncha jañı karta jasalgancha 30 kün jaraktuu, bir jolu uzartıluuchu ubaktıluu kübölük berilet.", ru: "По просьбе на время изготовления новой карты выдаётся временное удостоверение личности на 30 дней с однократным продлением." },
    stolenNote: { en: "The additional duty for a lost card is not charged when a theft was reported to the police within three days.", ir: "Uurdaluu tuuraluu politsiyaga üch kündün ichinde kabarlansa, jogolgon karta üchün koshumcha alım alınbayt.", ru: "Дополнительная пошлина за утерянную карту не взимается, если о краже заявлено в полицию в течение трёх дней." }
  };
  FLOWS.lostid = function (box) {
    box.innerHTML = flowForm("fli", field("liwhat", L(LI.what), sel("liwhat", opts(LI.whats))) + field("lioff", L(X.office), sel("lioff", S.offices.map(function (o) { return [o.code, L(o.name)]; }))), L(LI.btn));
    onSub("fli", function () {
      var w = $("#liwhat").value, o = officeBy($("#lioff").value), steps = [];
      if (w !== "damaged") steps.push(esc(L(LI.police, { w: L(w === "lost" ? LI.wLost : LI.wStolen) })));
      if (w === "lost") steps.push(esc(L(LI.notice)));
      var amt = duty("idcard") + (w === "lost" ? duty("idlost") : 0);
      steps.push(esc(L(LI.pay, { a: som(amt) })));
      steps.push(L(LI.queue, { s: svcLink("passport") }));
      steps.push(esc(L(LI.counter, { x: w === "damaged" ? L(LI.dmg) : "" })));
      result(kv([[L(X.office), esc(L(o.name))], [L(C.fee), som(amt)]]) + H4(LI.stepsH) + olh(steps) + (w === "stolen" ? P(LI.stolenNote, "tiny") : "") + P(LI.temp) + P(C.dl) + formBox("lostid"));
    });
  };
  HELP.lostid = {
    en: "<h3>Found your old card?</h3><p>A card reported lost is invalid from the day of the report, even if it is found. Hand it in at the passport office.</p><h3>Passports</h3><p>A lost passport is replaced in the same way, with form PRS-1. Report the loss of a passport abroad to the nearest consulate that accepts Irad passports.</p>",
    ir: "<h3>Eski kartañız tabıldıbı?</h3><p>Jogoldu dep kabarlangan karta tabılsa da, kabarlagan kündön tartip jaraksız. Anı pasport bölümünö tapshırıñız.</p><h3>Pasporttor</h3><p>Jogolgon pasport da ushunday ele PRS-1 forması menen almashtırılat. Chet elde pasport jogolso, Irad pasportun kabıl algan eñ jakın konsuldukka kabarlañız.</p>",
    ru: "<h3>Нашлась старая карта?</h3><p>Карта, о потере которой заявлено, недействительна со дня заявления, даже если она нашлась. Сдайте её в паспортный стол.</p><h3>Паспорта</h3><p>Утерянный паспорт заменяется так же, по бланку PRS-1. Об утере паспорта за рубежом сообщите в ближайшее консульство, принимающее ирадские паспорта.</p>"
  };

  /* foreign driving licence */
  var DL = {
    country: { en: "Licence issued in", ir: "Kübölük berilgen ölkö", ru: "Удостоверение выдано в" },
    countries: [["kz", { en: "Kazakhstan", ir: "Kazakstan", ru: "Казахстан" }], ["kg", { en: "Kyrgyzstan", ir: "Kırgızstan", ru: "Кыргызстан" }], ["uz", { en: "Uzbekistan", ir: "Özbekstan", ru: "Узбекистан" }], ["ru", { en: "Russia", ir: "Orusiya", ru: "Россия" }], ["cis", { en: "Another former Soviet republic", ir: "Bashka murdagı sovet respublikası", ru: "Другая бывшая советская республика" }], ["us", { en: "United States", ir: "Amerika Kurama Shtattarı", ru: "США" }], ["eu", { en: "A European state or Turkey", ir: "Evropa mamleketi je Türkiya", ru: "Европейское государство или Турция" }], ["oth", { en: "Another state", ir: "Bashka mamleket", ru: "Другое государство" }]],
    res: { en: "You are", ir: "Siz", ru: "Вы" },
    ress: [["res", { en: "Resident, registered in the ISEZ", ir: "IAEZde kattalgan turgun", ru: "Житель, зарегистрированный в ОЭЗИ" }], ["card", { en: "Foreign national with a residence card", ir: "Jashoo kartası bar chet el jaranı", ru: "Иностранец с видом на жительство" }], ["visit", { en: "Visitor", ir: "Konok", ru: "Приезжий" }]],
    btn: { en: "Check the conditions", ir: "Shartardı tekshirüü", ru: "Проверить условия" },
    visit: { en: "Visitors may drive on their own licence for six months from entry, with an international driving permit or a certified translation into Iradi or Russian. The licence cannot be exchanged.", ir: "Konoktor kirgen kündön altı ay boyu öz kübölügü menen, el aralık aydoochuluk kübölügü je irad tiline je orus tiline tastıktalgan kotormosu menen unaa aydasa bolot. Kübölüktü almashtıruuga bolboyt.", ru: "Приезжие могут управлять автомобилем по своему удостоверению в течение шести месяцев с даты въезда при наличии международного удостоверения или заверенного перевода на ирадский или русский язык. Обмен не производится." },
    none: { en: "Exchanged without examination.", ir: "Sınaksız almashtırılat.", ru: "Обменивается без экзаменов." },
    theory: { en: "Exchanged after the theory examination: 20 questions on paper, in Iradi or Russian, two mistakes allowed.", ir: "Teoriya sınagınan kiyin almashtırılat: kagazda 20 suroo, irad je orus tilinde, eki kataga uruksat.", ru: "Обменивается после теоретического экзамена: 20 вопросов на бумаге, на ирадском или русском языке, допускаются две ошибки." },
    both: { en: "Exchanged after the theory examination and a driving test at the Corps' examination ground.", ir: "Teoriya sınagınan jana Korpustun sınak ayantındagı aydoo sınagınan kiyin almashtırılat.", ru: "Обменивается после теоретического экзамена и экзамена по вождению на площадке Корпуса." },
    within: { en: "Residents exchange a foreign licence within six months of registering their residence. After that the licence is no longer valid for driving in the ISEZ.", ir: "Turgundar chet eldik kübölüktü jashoo jayın kattagandan kiyin altı aydın ichinde almashtırat. Andan kiyin al IAEZde unaa aydoo üchün jaraksız.", ru: "Жители обменивают иностранное удостоверение в течение шести месяцев после регистрации. После этого оно недействительно для вождения в ОЭЗИ." },
    docs: { en: ["The foreign licence and a translation into Iradi or Russian certified by a notary (not needed for licences in Russian)", "Your ID card, or passport and residence card", "A driver's medical certificate from a city polyclinic, valid for 12 months", "One photograph 3 × 4 cm", "Form HPC-12"], ir: ["Chet eldik kübölük jana anın notarius tastıktagan irad je orus tilindegi kotormosu (orus tilindegi kübölüktörgö kerek emes)", "Jeke kuböölügüñüz je pasport jana jashoo kartası", "Shaardık emdekanadan aydoochunun medtsinalık maalımkatı, 12 ay jaraktuu", "3 × 4 sm bir süröt", "HPC-12 forması"], ru: ["Иностранное удостоверение и нотариально заверенный перевод на ирадский или русский язык (для удостоверений на русском не нужен)", "Удостоверение личности или паспорт и вид на жительство", "Медицинская справка водителя из городской поликлиники, действительна 12 месяцев", "Одна фотография 3 × 4 см", "Бланк HPC-12"] },
    where: { en: "Registration and examination departments of the Highway Patrol Corps in Talas and Nurzhan: Tuesday and Thursday, 9:00–16:00. Theory examinations on Thursdays at 9:00; arrive by 8:30.", ir: "Avtojol patrul korpusunun Talas jana Nurzhandagı kattoo-sınak bölümdörü: sheyshembi jana beyshembi, 9:00–16:00. Teoriya sınagı beyshembi saat 9:00dö; 8:30ga cheyin keliñiz.", ru: "Регистрационно-экзаменационные отделы Корпуса дорожного патруля в Таласе и Нуржане: вторник и четверг, 9:00–16:00. Теоретический экзамен по четвергам в 9:00; приходите к 8:30." },
    kept: { en: "The foreign licence is kept by the Corps and returned to the issuing state on its request. If you wish to keep it, say so in section 9 of the form; the Corps will consider the request.", ir: "Chet eldik kübölük Korpusta saktalat jana bergen mamleketke anın suroosu boyuncha kaytarılat. Anı özüñüzdö kaltıruunu kaalasañız, formanın 9-bölümündö jazıñız; Korpus suroonu karayt.", ru: "Иностранное удостоверение остаётся в Корпусе и по запросу возвращается выдавшему государству. Если хотите оставить его себе, укажите это в разделе 9 бланка; Корпус рассмотрит просьбу." }
  };
  FLOWS.licence = function (box) {
    box.innerHTML = flowForm("fdl", field("dlc", L(DL.country), sel("dlc", opts(DL.countries))) + field("dlr", L(DL.res), sel("dlr", opts(DL.ress))), L(DL.btn));
    onSub("fdl", function () {
      var c = $("#dlc").value, r = $("#dlr").value;
      if (r === "visit") { result(P(DL.visit, "ok") + P(DL.within, "tiny")); return; }
      var cond = ["kz", "kg", "uz", "ru", "cis"].indexOf(c) >= 0 ? DL.none : (c === "us" || c === "eu") ? DL.theory : DL.both;
      result(P(cond, cond === DL.none ? "ok" : "warn") + kv([[L(DL.country), esc(L(pick(DL.countries, c)))], [L(C.fee), som(duty("licence"))]]) + P(DL.within) + counterEnd("licence", L(DL.docs), DL.where) + P(DL.kept, "tiny"));
    });
  };
  HELP.licence = {
    en: "<h3>Categories</h3><p>Categories are carried over as on the foreign licence. A category the ISEZ does not issue (for example, light quadricycles) is entered as the nearest category with a restriction.</p><h3>International driving permit</h3><p>The Corps issues an international driving permit to holders of an ISEZ licence, valid for three years. Whether it is accepted abroad depends on the state you visit.</p>",
    ir: "<h3>Kategoriyalar</h3><p>Kategoriyalar chet eldik kübölüktögüdöy ötkörülöt. IAEZ berbegen kategoriya (mısalı, jeñil kvadritsikl) cheklöö menen eñ jakın kategoriya katarı jazılat.</p><h3>El aralık aydoochuluk kübölügü</h3><p>Korpus IAEZdin kübölügü bargandarga üch jıl jaraktuu el aralık kübölük beret. Anı chet elde kabıl aluu barchu mamleketke baylanıshtuu.</p>",
    ru: "<h3>Категории</h3><p>Категории переносятся как в иностранном удостоверении. Категория, которую ОЭЗИ не выдаёт (например, лёгкие квадрициклы), вносится как ближайшая с ограничением.</p><h3>Международное удостоверение</h3><p>Корпус выдаёт владельцам удостоверения ОЭЗИ международное водительское удостоверение сроком на три года. Принимается ли оно за рубежом, зависит от страны поездки.</p>"
  };

  /* change of name */
  var NC = {
    why: { en: "Reason", ir: "Sebebi", ru: "Причина" },
    whys: [["marr", { en: "Marriage", ir: "Nike", ru: "Брак" }], ["div", { en: "Divorce", ir: "Ajırashuu", ru: "Развод" }], ["trad", { en: "Return to the traditional form (…uulu, …kyzy)", ir: "Salttuu formaga kaytuu (…uulu, …kızı)", ru: "Возврат к традиционной форме (…уулу, …кызы)" }], ["oth", { en: "Other personal reasons", ir: "Bashka jeke sebepter", ru: "Другие личные причины" }]],
    cur: { en: "Present surname", ir: "Azırkı famılıyası", ru: "Нынешняя фамилия" },
    neu: { en: "New surname", ir: "Jañı famılıyası", ru: "Новая фамилия" },
    btn: { en: "Check", ir: "Tekshirüü", ru: "Проверить" },
    asWritten: { en: "As it will be written", ir: "Kantip jazılat", ru: "Как будет записано" },
    marr: { en: "No separate application is needed: the new surname is entered at the registration of the marriage, in the same visit.", ir: "Özünchö arız kerek emes: jañı famılıya nikeni kattoodo, oshol ele barganda jazılat.", ru: "Отдельное заявление не нужно: новая фамилия записывается при регистрации брака, в тот же визит." },
    div: { en: "The pre-marital surname can be restored at the registration of the divorce, or later by application.", ir: "Nikege cheyinki famılıyanı ajırashuunu kattoodo je kiyin arız menen kaltırsa bolot.", ru: "Добрачную фамилию можно восстановить при регистрации развода или позже по заявлению." },
    trad: { en: "Changing a surname ending in -ov, -ev, -ova or -eva to the traditional form is free of state duty. The registry may ask for a document showing the father's name.", ir: "-ov, -ev, -ova je -eva menen bütkön famılıyanı salttuu formaga özgörtüü mamlekettik alımdan boshotulgan. JAAK atasının atın körsötkön dokumentti surashı mümkün.", ru: "Перемена фамилии на -ов, -ев, -ова, -ева на традиционную форму освобождена от госпошлины. ЗАГС может попросить документ с именем отца." },
    oth: { en: "The application is considered within one month. The registry may refuse a name that is offensive, misleading or made of numbers.", ir: "Arız bir aydın ichinde karalat. JAAK kordoochu, adashtıruuchu je sandardan turgan attı kabıl albashı mümkün.", ru: "Заявление рассматривается в течение месяца. ЗАГС может отказать в имени оскорбительном, вводящем в заблуждение или состоящем из цифр." },
    thenH: { en: "Afterwards, apply to change your name with each of these, in this order", ir: "Andan kiyin atıñızdı tömöndögülördün ar birinde, ushul tartipte özgörtüñüz", ru: "Затем подайте заявление о смене имени в каждую из этих организаций, в этом порядке" },
    then: { en: ["Passport and Residence Service: ID card and passport (state duty again)", "Highway Patrol Corps: driving licence and vehicle registration certificate", "Iradstrakh: endorsement of your motor policy", "Talasbank: your accounts and card", "Social Fund: your personal record", "Tax Service: your taxpayer registration", "Iradenergo, the water enterprise, the gas service and the heating enterprise: your personal accounts", "Register of Firms, if you are a sole trader", "Hunting and Fisheries Section, if you hold a licence", "Tazalık, if you have a registered dog"], ir: ["Pasport jana jashoo jayı kızmatı: jeke kuböölük jana pasport (mamlekettik alım kayra)", "Avtojol patrul korpusu: aydoochuluk kübölügü jana unaanın kattoo kübölügü", "Iradstrakh: avtopolisiñizge belgi", "Talasbank: esepteriñiz jana kartañız", "Sotsialdık fond: jeke jazuuñuz", "Salık kızmatı: salık tölöööchü katarı kattooñuz", "Iradenergo, suu ishkanası, gaz kızmatı jana jılytuu ishkanası: jeke esepteriñiz", "Firmalar reestri, eger jeke ishker bolsoñuz", "Añchılık jana balık charba bölümü, litsenziyañız bolso", "Tazalık, kattalgan itiñiz bolso"], ru: ["Служба паспортов и регистрации: удостоверение личности и паспорт (снова госпошлина)", "Корпус дорожного патруля: водительское удостоверение и свидетельство о регистрации ТС", "«Ирадстрах»: отметка в автополисе", "«Таласбанк»: счета и карта", "Социальный фонд: личная карточка", "Налоговая служба: учёт налогоплательщика", "«Ирадэнерго», водоканал, газовая служба и теплопредприятие: лицевые счета", "Реестр фирм, если вы ИП", "Отдел охоты и рыболовства, если у вас есть лицензия", "«Тазалык», если у вас зарегистрирована собака"] },
    noNotify: { en: "The civil registry does not inform these bodies. Each of them needs the certificate of change of name in the original.", ir: "JAAK bul mekemelerge kabarlabayt. Alardın ar biri attı özgörtüü tuuraluu kübölüktün asılın talap kılat.", ru: "ЗАГС не сообщает в эти организации. Каждой из них нужен оригинал свидетельства о перемене имени." },
    docs: { en: ["Your ID card and birth certificate", "Your marriage or divorce certificate, if you have one", "Birth certificates of your children under 16", "Form CR-9"], ir: ["Jeke kuböölügüñüz jana tuuluu tuuraluu kübölügüñüz", "Nike je ajırashuu tuuraluu kübölügüñüz, bar bolso", "16ga cheyinki baldarıñızdın tuuluu tuuraluu kübölüktörü", "CR-9 forması"], ru: ["Удостоверение личности и свидетельство о рождении", "Свидетельство о браке или о разводе, если есть", "Свидетельства о рождении детей до 16 лет", "Бланк CR-9"] },
    where: { en: "The civil registry office of the district or city where you are registered.", ir: "Siz kattalgan aymaktın je shaardın JAAK bölümü.", ru: "Отдел ЗАГС района или города по месту регистрации." }
  };
  FLOWS.namechange = function (box) {
    box.innerHTML = flowForm("fnc", field("ncwhy", L(NC.why), sel("ncwhy", opts(NC.whys))) + field("nccur", L(NC.cur), inp("nccur", "", ' maxlength="40"')) + field("ncnew", L(NC.neu), inp("ncnew", "", ' maxlength="40"')), L(NC.btn));
    onSub("fnc", function () {
      if (!need("nccur") || !need("ncnew")) return;
      var w = $("#ncwhy").value, fee = w === "oth" || w === "div" ? duty("name") : 0;
      var head = '<div class="ticket"><div class="tno"><span>' + esc(L(NC.asWritten)) + "</span><b>" + esc(caps($("#ncnew").value)) + "</b></div>" + kv([[L(NC.cur), esc(caps($("#nccur").value))], [L(C.fee), fee ? som(fee) : "—"]]) + "</div>";
      var body = P(NC[w], w === "marr" ? "ok" : "");
      if (w !== "marr") body += counterEnd("namechange", L(NC.docs), NC.where);
      result(head + body + H4(NC.thenH) + "<ol>" + L(NC.then).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ol>" + P(NC.noNotify, "tiny"));
    });
  };
  HELP.namechange = {
    en: "<h3>First names and patronymics</h3><p>A first name or patronymic is changed in the same way. A patronymic follows the father's first name as registered; it is changed only if the father's name was changed or registered wrongly.</p><h3>Spelling</h3><p>Names are registered in the Latin alphabet of Iradi, with the Russian form in the second line of the certificate. A spelling error made by the registry is corrected free of charge.</p>",
    ir: "<h3>Attar jana atasının attarı</h3><p>At je atasının atı da ushunday ele özgörtülöt. Atasının atı kattalgan atasının atına ılayık bolot; atasının atı özgörtülgöndö je kata kattalganda gana özgörtülöt.</p><h3>Jazılıshı</h3><p>Attar irad tilinin latın alfavitinde kattalat, orus tilindegi forması kübölüktün ekinchi sabında. JAAK ketirgen jazuu katası akısız oñdolot.</p>",
    ru: "<h3>Имена и отчества</h3><p>Имя или отчество меняется так же. Отчество следует имени отца, как оно зарегистрировано; меняется только если имя отца изменено или записано с ошибкой.</p><h3>Написание</h3><p>Имена регистрируются ирадской латиницей, русская форма приводится во второй строке свидетельства. Ошибка ЗАГС в написании исправляется бесплатно.</p>"
  };

  /* certificate of good conduct */
  var GC = {
    why: { en: "Purpose", ir: "Maksatı", ru: "Цель" },
    whys: [["job", { en: "Employment in the ISEZ", ir: "IAEZde jumushka ornoshuu", ru: "Трудоустройство в ОЭЗИ" }], ["abroad", { en: "Work, study or a visa abroad", ir: "Chet eldegi jumush, okuu je viza", ru: "Работа, учёба или виза за рубежом" }], ["child", { en: "Adoption or guardianship", ir: "Bala asırap aluu je kamkorduk", ru: "Усыновление или опека" }], ["gun", { en: "Firearm permit", ir: "Ok atuuchu kuralga uruksat", ru: "Разрешение на оружие" }]],
    get: { en: "Collect", ir: "Aluu", ru: "Получение" },
    gets: [["office", { en: "At the Records Department counter, Talas", ir: "Talastagı Esepke aluu departamentinin kassasınan", ru: "В окошке Учётного департамента, Талас" }], ["post", { en: "By registered post", ir: "Buyurtma kat menen", ru: "Заказным письмом" }]],
    btn: { en: "Prepare request", ir: "Surootu dayardoo", ru: "Подготовить запрос" },
    covers: { en: "The certificate states whether the records of the Ministry of Internal Security since 1992 show a conviction. Records of clan councils in the tribal regions are not held.", ir: "Maalımkat Ichki koopsuzduk ministrliginin 1992-jıldan berki jazuularında sottoluu bar je jok ekenin körsötöt. Tooluu aymaktardagı uruk keñeshterinin jazuuları saktalbayt.", ru: "Справка подтверждает, есть ли в учётах Министерства внутренней безопасности с 1992 года сведения о судимости. Записи советов родов в племенных районах не хранятся." },
    valid: { en: "Valid for three months from issue.", ir: "Berilgen kündön üch ay jaraktuu.", ru: "Действительна три месяца со дня выдачи." },
    abroad: { en: "For use abroad the certificate is issued with a translation into English or Russian. Whether it is accepted is decided by the receiving state.", ir: "Chet elde koldonuu üchün maalımkat anglis je orus tilindegi kotormosu menen berilet. Anı kabıl aluu je alboo kabıl aluuchu mamlekettin ishi.", ru: "Для использования за рубежом справка выдаётся с переводом на английский или русский язык. Принимать ли её, решает принимающее государство." },
    post: { en: "For delivery by post, bring a stamped addressed envelope for a registered letter (IS 16 in stamps).", ir: "Pochta menen jetkirüü üchün buyurtma kat üchün darek jazılgan, markası chaplangan konvert ala keliñiz (16 somluk marka).", ru: "Для доставки по почте принесите конверт с обратным адресом и марками на заказное письмо (на 16 сомов)." },
    docs: { en: ["Your ID card", "Form MIS-22", "The state duty receipt"], ir: ["Jeke kuböölügüñüz", "MIS-22 forması", "Mamlekettik alımdın kvitantsiyası"], ru: ["Удостоверение личности", "Бланк MIS-22", "Квитанция об оплате госпошлины"] },
    where: { en: "Records Department, Ministry of Internal Security, Talas, or your district office (allow five more working days).", ir: "Ichki koopsuzduk ministrliginin Esepke aluu departamenti, Talas, je aymaktık keñseñiz (dagı besh ish kün koshuñuz).", ru: "Учётный департамент Министерства внутренней безопасности, Талас, или ваш районный отдел (плюс пять рабочих дней)." }
  };
  FLOWS.conduct = function (box) {
    box.innerHTML = flowForm("fgc", field("gcwhy", L(GC.why), sel("gcwhy", opts(GC.whys))) + field("gcget", L(GC.get), sel("gcget", opts(GC.gets))), L(GC.btn));
    onSub("fgc", function () {
      var w = $("#gcwhy").value, g = $("#gcget").value, days = w === "abroad" ? 20 : 10;
      var docs = L(GC.docs).slice(); if (g === "post") docs.push(L(GC.post));
      result(refBox(C.ref, refNo("MIS-GC", w + g + today().toISOString().slice(0, 7)), [[L(GC.why), esc(L(pick(GC.whys, w)))], [L(C.ready), esc(L(C.wdays, { n: days }))], [L(C.fee), som(duty("conduct"))]]) + P(GC.covers) + (w === "abroad" ? P(GC.abroad) : "") + P(GC.valid, "tiny") + counterEnd("conduct", docs, GC.where));
    });
  };
  HELP.conduct = {
    en: "<h3>Who can ask?</h3><p>Only the person concerned, in person, or a representative with a notarised power of attorney. Employers may not request the certificate on your behalf.</p><h3>Spent convictions</h3><p>Convictions that are spent are shown only on certificates for adoption, guardianship and firearms.</p>",
    ir: "<h3>Kim surasa bolot?</h3><p>Özü gana, jeke kelip, je notarius tastıktagan ıshenim kat menen ökülü. Ish beruuchü siziñ atıñızdan maalımkat suroogo tiyish emes.</p><h3>Joyulgan sottoluular</h3><p>Joyulgan sottoluu bala asırap aluu, kamkorduk jana kural üchün maalımkattarda gana körsötülöt.</p>",
    ru: "<h3>Кто может запросить?</h3><p>Только сам человек лично или представитель по нотариальной доверенности. Работодатель не может запрашивать справку за вас.</p><h3>Погашенные судимости</h3><p>Погашенные судимости указываются только в справках для усыновления, опеки и оружия.</p>"
  };

  /* old-age pension */
  var PN = {
    yob: { en: "Year of birth", ir: "Tuulgan jılı", ru: "Год рождения" },
    yrs: { en: "Years of recorded service", ir: "Kattalgan emgek stajı (jıl)", ru: "Стаж работы (лет)" },
    rec: { en: "Service before 1992 was", ir: "1992-jılga cheyinki emgek stajı", ru: "Стаж до 1992 года" },
    recs: [["isez", { en: "All in what is now the ISEZ", ir: "Bardıgı azırkı IAEZde", ru: "Весь на нынешней территории ОЭЗИ" }], ["mix", { en: "Partly in the tribal regions", ir: "Bir bölügü tooluu aymaktarda", ru: "Частично в племенных районах" }], ["ussr", { en: "Partly in other Soviet republics", ir: "Bir bölügü bashka sovet respublikalarında", ru: "Частично в других советских республиках" }], ["none", { en: "No service before 1992", ir: "1992-jılga cheyin staj jok", ru: "Стажа до 1992 года нет" }]],
    btn: { en: "Check entitlement", ir: "Ukuktu tekshirüü", ru: "Проверить право" },
    bad: { en: "Enter a year between 1920 and the present year.", ir: "1920-jıl menen uchurdagı jıldın ortosundagı jıldı jazıñız.", ru: "Введите год от 1920 до текущего." },
    age: { en: "Pension age", ir: "Pensiyalık jash", ru: "Пенсионный возраст" },
    from: { en: "You can apply from", ir: "Arız berüügö boluuchu mezgil", ru: "Подать заявление можно с" },
    now: { en: "Now: you have reached pension age", ir: "Azır: pensiyalık jashka jettiñiz", ru: "Сейчас: вы достигли пенсионного возраста" },
    month: { en: "The month before your 63rd birthday, in {y}", ir: "{y}-jılı, 63 jashka tolordon bir ay murun", ru: "За месяц до 63-летия, в {y} году" },
    est: { en: "Indicative monthly pension", ir: "Boljoldoo aylık pensiya", ru: "Ориентировочная пенсия в месяц" },
    calc: { en: "IS 1,150 base amount and IS 18 for each year of service, up to 40 years. The amount is set by the Social Fund when the documents have been checked.", ir: "Negizgi summa 1 150 som jana emgek stajının ar bir jılı üchün 18 som, 40 jılga cheyin. Summanı dokumentter tekshirilgenden kiyin Sotsialdık fond belgileyt.", ru: "Базовая часть 1 150 сомов и 18 сомов за каждый год стажа, но не более 40 лет. Сумму устанавливает Социальный фонд после проверки документов." },
    social: { en: "With fewer than 10 years of service a social pension of IS 850 a month is paid from the same age.", ir: "Emgek stajı 10 jıldan az bolso, oshol ele jashtan aylık 850 som sotsialdık pensiya tölönöt.", ru: "При стаже менее 10 лет с того же возраста выплачивается социальная пенсия 850 сомов в месяц." },
    early: { en: "Apply in the month before you reach 63, not earlier: applications made earlier are returned.", ir: "Arızdı 63 jashka tolordon bir ay murun beriñiz, andan erte emes: erte berilgen arızdar kaytarılat.", ru: "Подавайте заявление за месяц до 63 лет, не раньше: поданные раньше заявления возвращаются." },
    paid: { en: "Pensions are paid from the 10th of each month at the Irad Pochtasy counter of your registered address, or into a Talasbank account. Someone else can collect your pension with a power of attorney on form P-27.", ir: "Pensiyalar ar aydın 10-kününön tartip kattalgan darekiñizdegi Irad Pochtasının kassasında je Talasbanktagı esepke tölönöt. Pensiyañızdı P-27 formasındagı ıshenim kat menen bashka adam ala alat.", ru: "Пенсии выплачиваются с 10-го числа каждого месяца в окошке «Ирадпочты» по месту регистрации или на счёт в «Таласбанке». Получать пенсию за вас может другой человек по доверенности на бланке P-27." },
    mix: { en: "Service in the tribal regions is counted if confirmed by the employer's records. Statements of clan councils are not accepted as proof of service.", ir: "Tooluu aymaktardagı emgek stajı ish beruuchünün jazuuları menen tastıktalsa eseptelet. Uruk keñeshterinin maalımkattarı staj katarı kabıl alınbayt.", ru: "Стаж в племенных районах засчитывается, если он подтверждён документами работодателя. Справки советов родов в качестве подтверждения стажа не принимаются." },
    ussr: { en: "Service in other Soviet republics before 1992 is counted if confirmed by an archive of that state. Requests to archives abroad are made by the applicant.", ir: "1992-jılga cheyin bashka sovet respublikalarındagı emgek stajı oshol mamlekettin arkhivi tastıktasa eseptelet. Chet eldik arkhivderge arızdı arız beruuchü özü jönötöt.", ru: "Стаж в других советских республиках до 1992 года засчитывается при подтверждении архивом соответствующего государства. Запросы в зарубежные архивы направляет сам заявитель." },
    docs: { en: ["Your ID card and residence registration", "Your work record book", "A certificate of earnings for any 60 consecutive months before 2000, from the employer; if the employer no longer exists, from the State Archives", "Your military service record, if any", "Form SF-1"], ir: ["Jeke kuböölügüñüz jana jashoo jayı boyuncha kattoo", "Emgek kitepcheñiz", "2000-jılga cheyinki kaalagan 60 ulam-ulam aydagı emgek akı tuuraluu maalımkat, ish beruuchüdön; ish beruuchü jok bolso, Mamlekettik arkhivden", "Askerdik kızmat tuuraluu kitepcheñiz, bar bolso", "SF-1 forması"], ru: ["Удостоверение личности и регистрация по месту жительства", "Трудовая книжка", "Справка о заработке за любые 60 месяцев подряд до 2000 года от работодателя; если работодателя больше нет, из Государственного архива", "Военный билет, если есть", "Бланк SF-1"] },
    where: { en: "The Social Fund office of your district or city, Monday to Thursday, 9:00–16:00.", ir: "Aymagıñızdın je shaarıñızdın Sotsialdık fond bölümü, düyshömbüdön beyshembige cheyin, 9:00–16:00.", ru: "Отделение Социального фонда в вашем районе или городе, понедельник–четверг, 9:00–16:00." }
  };
  FLOWS.pension = function (box) {
    box.innerHTML = flowForm("fpn", field("pnyob", L(PN.yob), numIn("pnyob", 1920, 2026)) + field("pnyrs", L(PN.yrs), numIn("pnyrs", 0, 60)) + field("pnrec", L(PN.rec), sel("pnrec", opts(PN.recs))), L(PN.btn));
    onSub("fpn", function () {
      var Y = iradNow().getFullYear(), yob = intVal("pnyob"), yrs = intVal("pnyrs");
      if (!need("pnyob", function () { return yob >= 1920 && yob <= Y; })) { $("#pnyob-err").textContent = L(PN.bad); return; }
      if (!need("pnyrs", function () { return yrs !== null && yrs >= 0 && yrs <= 60; })) return;
      var at = yob + 63, rec = $("#pnrec").value, amt = yrs < 10 ? 850 : 1150 + 18 * Math.min(40, yrs);
      var rows = [[L(PN.age), "63"], [L(PN.from), esc(L(at <= Y ? PN.now : PN.month, { y: at }))], [L(PN.est), "<b>" + som(amt) + "</b>"]];
      result(kv(rows) + P(yrs < 10 ? PN.social : PN.calc, "tiny") + (at > Y + 1 ? P(PN.early, "warn") : "") + (rec === "mix" ? P(PN.mix) : rec === "ussr" ? P(PN.ussr) : "") + P(PN.paid) + counterEnd("pension", L(PN.docs), PN.where));
    });
  };
  HELP.pension = {
    en: "<h3>Working pensioners</h3><p>A pension is paid in full to pensioners who continue to work. Each further year of work adds to the pension from the following January, on application.</p><h3>Moving</h3><p>If you move, notify your new address; the pension follows your registration to the post office of your new address from the next month.</p>",
    ir: "<h3>Ishtegen pensionerler</h3><p>Ishtep jürgön pensionerlerge pensiya toluk tölönöt. Ar bir koshumcha ish jılı arız boyuncha kiyinki yanvardan bashtap pensiyaga koshulat.</p><h3>Köchüü</h3><p>Köchsöñüz, jañı darekiñizdi kabarlañız; pensiya kiyinki aydan tartip jañı darekiñizdegi pochta bölümünö ötöt.</p>",
    ru: "<h3>Работающие пенсионеры</h3><p>Работающим пенсионерам пенсия выплачивается полностью. Каждый следующий год работы по заявлению увеличивает пенсию с января следующего года.</p><h3>Переезд</h3><p>При переезде уведомите о новом адресе; со следующего месяца пенсия выплачивается в почтовом отделении по новому адресу.</p>"
  };

  /* bills by personal account: gas, heating, kindergarten */
  function acctFlow(box, o) {
    box.innerHTML = flowForm(o.id, field(o.id + "n", L(o.netL), sel(o.id + "n", opts(o.nets))) + field("acct", L(o.acctL || BILL.acct), inp("acct", L(o.acctPh || BILL.acctPh), ' inputmode="numeric" maxlength="14"')), L(BILL.show));
    onSub(o.id, function () {
      var a = $("#acct").value.replace(/\D/g, ""), lo = o.min || 8, hi = o.max || 12;
      if (!need("acct", function () { return a.length >= lo && a.length <= hi; })) { $("#acct-err").textContent = L(o.acctBad || BILL.acctBad); return; }
      var n = $("#" + o.id + "n").value, h = hash(o.id + n + a);
      if (h % 13 === 0) { result('<p class="warn">' + esc(t("notFound")) + "</p>"); return; }
      result(o.bill(h, a, n) + payBox({ fgs: "gas", fht: "heating", fkg: "kindergarten" }[o.id]));
    });
  }
  var GS = {
    nets: [["tl", { en: "Talas City Gas Service", ir: "Talas shaardık gaz kızmatı", ru: "Таласская городская газовая служба" }], ["nz", { en: "Nurzhan Gas Service", ir: "Nurzhan gaz kızmatı", ru: "Нуржанская газовая служба" }]],
    svc: { en: "Gas service", ir: "Gaz kızmatı", ru: "Газовая служба" },
    m3: { en: "m³", ir: "m³", ru: "м³" },
    tariff: { en: "Household tariff", ir: "Turmushtuk tarif", ru: "Бытовой тариф" },
    maint: { en: "Maintenance of in-house gas equipment", ir: "Üy ichindegi gaz jabdıktarın teyleö", ru: "Обслуживание внутридомового газового оборудования" },
    note: { en: "Iyık Janyl and the districts are supplied with bottled gas. Cylinders are exchanged at the gas service depots and are not billed here. The annual safety check of your cooker and boiler is free; the inspector carries a gas service card with a photograph.", ir: "Iyık Janyl jana aymaktar ballondogu gaz menen kamsızdalat. Ballondor gaz kızmatının depolorunda almashtırılat jana bul jerde eseptelbeyt. Plitañızdı jana kazanıñızdı jıl sayın koopsuzdukka tekshirüü akısız; inspektordun süröttüü gaz kızmatının kartası bolot.", ru: "Ийык-Джаныл и районы снабжаются баллонным газом. Баллоны меняют на складах газовой службы, здесь они не учитываются. Ежегодная проверка плиты и котла бесплатна; у контролёра есть удостоверение газовой службы с фотографией." }
  };
  FLOWS.gas = function (box) {
    acctFlow(box, { id: "fgs", netL: GS.svc, nets: GS.nets, bill: function (h, a) {
      var lm = lastMonth(), winter = [0, 1, 2, 10, 11].indexOf(lm.getUTCMonth()) >= 0, prev = 1000 + (h % 30000), m3 = (winter ? 160 : 25) + (h % (winter ? 140 : 40)), tf = 0.95, mt = 4;
      var arr = h % 7 === 0 ? Math.round((40 + h % 90) * tf * 100) / 100 : 0, amt = Math.round((m3 * tf + mt) * 100) / 100;
      return kv([[L(BILL.acctNo), esc(mask(a))], [L(BILL.period), esc(monthName(lm))], [L(BILL.readings), fmtN(prev) + " → " + fmtN(prev + m3)], [L(BILL.used), fmtN(m3) + " " + L(GS.m3)], [L(GS.tariff), som(tf) + " / " + L(GS.m3)], [L(GS.maint), som(mt)]].concat(arr ? [[L(BILL.arrears), som(arr)]] : []).concat([[L(BILL.due), "<b>" + som(amt + arr) + "</b>"], [L(BILL.dueBy), esc(fmtD(dueDate()))]])) + P(GS.note, "tiny");
    } });
  };
  HELP.gas = {
    en: "<h3>Smell of gas?</h3><p>Do not switch lights on or off. Open the windows, leave the flat and call the gas emergency service on 04 from a neighbour's telephone. The call is free.</p><h3>Meters</h3><p>Gas meters are checked by Iradstandart every eight years. The gas service tells you when the check is due; the check is paid by the household.</p>",
    ir: "<h3>Gazdın jıtı bilinip jatabı?</h3><p>Jarıktı jakpañız je öchürbögüñüz. Terezelerdi achıp, üydön chıgıñız da, koñshuñuzdun telefonunan 04 nomerine gaz avariya kızmatına chalıñız. Chaluu akısız.</p><h3>Hisoochtor</h3><p>Gaz hisoochtorun Iradstandart ar segiz jılda tekshiret. Tekshirüü möönötün gaz kızmatı kabarlayt; tekshirüünü üy-bülö tölöyt.</p>",
    ru: "<h3>Запах газа?</h3><p>Не включайте и не выключайте свет. Откройте окна, выйдите из квартиры и позвоните в аварийную газовую службу по номеру 04 с телефона соседей. Звонок бесплатный.</p><h3>Счётчики</h3><p>Газовые счётчики поверяет «Ирадстандарт» раз в восемь лет. О сроке поверки сообщает газовая служба; поверку оплачивает владелец.</p>"
  };
  var HT = {
    nets: [["tl", { en: "Talas Heating Enterprise", ir: "Talas jılytuu ishkanası", ru: "Таласское теплопредприятие" }], ["nz", { en: "Nurzhan Heating Enterprise", ir: "Nurzhan jılytuu ishkanası", ru: "Нуржанское теплопредприятие" }]],
    ent: { en: "Heating enterprise", ir: "Jılytuu ishkanası", ru: "Теплопредприятие" },
    area: { en: "Heated area", ir: "Jılytılgan ayant", ru: "Отапливаемая площадь" },
    heat: { en: "Heating", ir: "Jılytuu", ru: "Отопление" },
    rate: { en: "{a} per m² a month", ir: "ayına m² üchün {a}", ru: "{a} за м² в месяц" },
    off: { en: "Not charged: outside the heating season", ir: "Eseptelgen jok: jılytuu mezgilinen tıshkarı", ru: "Не начислено: вне отопительного сезона" },
    hw: { en: "Hot water, per registered resident", ir: "Isık suu, ar bir kattalgan turgunga", ru: "Горячая вода, на зарегистрированного жильца" },
    maint: { en: "The October charges are being loaded. The bill shown is the last one completed.", ir: "Oktyabr tölömdörü jüktölüp jatat. Akırkı dayar bolgon esep körsötülüp jatat.", ru: "Начисления за октябрь загружаются. Показан последний сформированный счёт." },
    season: { en: "The heating season 2026–2027 runs from 15 October to 15 April. A cold radiator does not reduce the bill until the enterprise's inspector has drawn up an act; call the dispatcher with your account number.", ir: "2026–2027-jılkı jılytuu mezgili 15-oktyabrdan 15-aprelge cheyin. Muzdak radiator ishkananın inspektoru akt tüzmöyünchö eseptin azaytpayt; esep nomeriñiz menen dispetcherge chalıñız.", ru: "Отопительный сезон 2026–2027 годов длится с 15 октября по 15 апреля. Холодная батарея не уменьшает счёт, пока контролёр предприятия не составит акт; позвоните диспетчеру и назовите номер лицевого счёта." }
  };
  FLOWS.heating = function (box) {
    acctFlow(box, { id: "fht", netL: HT.ent, nets: HT.nets, bill: function (h, a) {
      var lm = lastMonth(), mo = lm.getUTCMonth(), on = mo <= 2 || mo >= 10 || mo === 3, area = 28 + (h % 84), ppl = 1 + (h % 5), r = 2.1, hw = 9.5;
      var heat = on ? Math.round(area * r * (mo === 3 ? 0.5 : 1) * 100) / 100 : 0, w = Math.round(ppl * hw * 100) / 100, arr = h % 5 === 0 ? Math.round(area * r * 2.5 * 100) / 100 : 0;
      return P(HT.maint, "warn") + kv([[L(BILL.acctNo), esc(mask(a))], [L(BILL.period), esc(monthName(lm))], [L(HT.area), fmtN(area) + " m²"], [L(HT.heat), on ? som(heat) + ' <span class="tiny">(' + esc(L(HT.rate, { a: som(r) })) + ")</span>" : esc(L(HT.off))], [L(BILL.persons), String(ppl)], [L(HT.hw), som(w)]].concat(arr ? [[L(BILL.arrears), som(arr)]] : []).concat([[L(BILL.due), "<b>" + som(heat + w + arr) + "</b>"], [L(BILL.dueBy), esc(fmtD(dueDate()))]])) + P(HT.season, "tiny");
    } });
  };
  HELP.heating = {
    en: "<h3>Disconnecting from the network</h3><p>A flat in a block connected to the city network cannot be disconnected on its own: the pipes that pass through it heat the flat in any case. Apply to the enterprise for a technical opinion if your building wants to leave the network.</p>",
    ir: "<h3>Tarmaktan ajıratuu</h3><p>Shaardık tarmakka koshulgan üydögü bir kvartiranı özünchö ajıratuuga bolboyt: andan ötkön tütüktör anı baarıbir jılytat. Üyüñüz tarmaktan chıguunu kaalasa, ishkanaga tekhnikalık korutundu üchün kayrılıñız.</p>",
    ru: "<h3>Отключение от сети</h3><p>Квартиру в доме, подключённом к городской сети, нельзя отключить отдельно: проходящие через неё трубы всё равно её отапливают. Если дом хочет выйти из сети, обратитесь на предприятие за техническим заключением.</p>"
  };
  var KG = {
    nets: [["tl", { en: "Talas City Hall Education Department", ir: "Talas meriyasının bilim berüü bölümü", ru: "Отдел образования мэрии Таласа" }], ["nz", { en: "Nurzhan City Hall Education Department", ir: "Nurzhan meriyasının bilim berüü bölümü", ru: "Отдел образования мэрии Нуржана" }], ["ij", { en: "Iyık Janyl City Hall Education Department", ir: "Iyık Janyl meriyasının bilim berüü bölümü", ru: "Отдел образования мэрии Ийык-Джаныла" }]],
    dept: { en: "City", ir: "Shaar", ru: "Город" },
    acct: { en: "Child's personal account", ir: "Balanın jeke esebi", ru: "Лицевой счёт ребёнка" },
    acctPh: { en: "8 digits, on the kindergarten receipt", ir: "8 sıfra, bakchanın kvitantsiyasında", ru: "8 цифр, на квитанции детского сада" },
    acctBad: { en: "The child's account has 8 digits and is printed on the kindergarten receipt.", ir: "Balanın esebi 8 sıfradan turat jana bakchanın kvitantsiyasında basılgan.", ru: "Лицевой счёт ребёнка состоит из 8 цифр и напечатан на квитанции детского сада." },
    kg: { en: "Kindergarten", ir: "Baldar bakchası", ru: "Детский сад" },
    no: { en: "Kindergarten No. {n}", ir: "{n}-baldar bakchası", ru: "Детский сад № {n}" },
    fixed: { en: "Parents' fee", ir: "Ata-enelerdin tölömü", ru: "Родительская плата" },
    days: { en: "Days attended", ir: "Kelgen künder", ru: "Посещено дней" },
    abs: { en: "Days absent without a medical certificate", ir: "Medtsinalık maalımkatsız kelbegen künder", ru: "Дни отсутствия без справки" },
    meals: { en: "Meals, {a} a day", ir: "Tamak, kününö {a}", ru: "Питание, {a} в день" },
    note: { en: "Days of absence with a medical certificate are not charged. Days of absence without one are charged at the meal rate, since the meals were prepared. Places and the waiting list are kept by the city education department; the waiting list is not online.", ir: "Medtsinalık maalımkat menen kelbegen künder eseptelbeyt. Maalımkatsız kelbegen künder tamak bahası boyuncha eseptelet, antkeni tamak dayardalgan. Orundar jana kezek tizmesin shaardık bilim berüü bölümü jürgüzöt; kezek tizmesi onlayn emes.", ru: "Дни отсутствия со справкой не оплачиваются. Дни отсутствия без справки оплачиваются по стоимости питания, так как питание было приготовлено. Места и очередь ведёт городской отдел образования; очередь онлайн не публикуется." }
  };
  FLOWS.kindergarten = function (box) {
    acctFlow(box, { id: "fkg", netL: KG.dept, nets: KG.nets, acctL: KG.acct, acctPh: KG.acctPh, acctBad: KG.acctBad, min: 8, max: 8, bill: function (h, a) {
      var d = 12 + (h % 9), ab = (h >>> 5) % 4, fx = 120, ml = 7.5, tot = fx + (d + ab) * ml;
      return kv([[L(KG.acct), esc(mask(a))], [L(KG.kg), esc(L(KG.no, { n: 1 + (h >>> 3) % 48 }))], [L(BILL.period), esc(monthName(lastMonth()))], [L(KG.fixed), som(fx)], [L(KG.days), String(d)], [L(KG.abs), String(ab)], [L(KG.meals, { a: som(ml) }), som((d + ab) * ml)], [L(BILL.due), "<b>" + som(tot) + "</b>"], [L(BILL.dueBy), esc(fmtD(dueDate()))]]) + P(KG.note, "tiny");
    } });
  };
  HELP.kindergarten = {
    en: "<h3>Reductions</h3><p>The parents' fee is halved for the third and each further child in a family and for children of disabled parents of groups I and II, on application to the city education department with the documents.</p>",
    ir: "<h3>Jeñildikter</h3><p>Üy-bülödögü üchünchü jana andan kiyinki baldar üchün, I jana II toptogu mayıp ata-enelerdin baldarı üchün ata-enelerdin tölömü dokumentter menen shaardık bilim berüü bölümünö arız bergende eki ese azayat.</p>",
    ru: "<h3>Льготы</h3><p>Родительская плата снижается вдвое за третьего и каждого следующего ребёнка в семье и для детей родителей с инвалидностью I и II групп по заявлению в городской отдел образования с документами.</p>"
  };

  /* property tax */
  var PT = {
    kind: { en: "Property", ir: "Mülk", ru: "Имущество" },
    kinds: [["flat", { en: "Flat", ir: "Kvartira", ru: "Квартира" }, 0.6], ["house", { en: "House", ir: "Üy", ru: "Дом" }, 0.45], ["plot", { en: "Land plot (per 100 m²)", ir: "Jer tilkesi (100 m² üchün)", ru: "Земельный участок (за 100 м²)" }, 2.5], ["garage", { en: "Garage", ir: "Garaj", ru: "Гараж" }, 1.2], ["shop", { en: "Shop, office or workshop", ir: "Dükön, keñse je ustakana", ru: "Магазин, офис или мастерская" }, 4], ["yurt", { en: "Yurt", ir: "Boz üy", ru: "Юрта" }, 0.45]],
    area: { en: "Area, m²", ir: "Ayantı, m²", ru: "Площадь, м²" },
    dist: { en: "District or city", ir: "Aymak je shaar", ru: "Район или город" },
    btn: { en: "Calculate", ir: "Eseptöö", ru: "Рассчитать" },
    rate: { en: "Rate", ir: "Chendem", ru: "Ставка" },
    coef: { en: "Zone coefficient", ir: "Zona koeffitsienti", ru: "Зональный коэффициент" },
    year: { en: "Tax for {y}", ir: "{y}-jılga salık", ru: "Налог за {y} год" },
    due: { en: "Pay by", ir: "Tölöö möönötü", ru: "Оплатить до" },
    perM2: { en: "{a} per m² a year", ir: "jılına m² üchün {a}", ru: "{a} за м² в год" },
    per100: { en: "{a} per 100 m² a year", ir: "jılına 100 m² üchün {a}", ru: "{a} за 100 м² в год" },
    yurt: { en: "A yurt is taxed as a house if it stands on the same place for more than 180 days in the year. A yurt moved to summer pasture and back is not taxed.", ir: "Boz üy jılına 180 kündön ashık bir jerde tursa, üy katarı salıkka tartılat. Jayloogo köchürülüp kayra kelgen boz üy salıkka tartılbayt.", ru: "Юрта облагается налогом как дом, если стоит на одном месте более 180 дней в году. Юрта, которую перевозят на летнее пастбище и обратно, налогом не облагается." },
    notice: { en: "Tax notices are delivered by Irad Pochtasy by 1 November. A notice that has not arrived does not release you from payment. To declare a property not yet on the register, use form TS-14.", ir: "Salık bildirüülörün Irad Pochtası 1-noyabrga cheyin jetkiret. Kelbey kalgan bildirüü tölömdön boshotpoyt. Reestrge ali kire elek mülktü TS-14 forması menen deklaratsiyalañız.", ru: "Налоговые уведомления доставляет «Ирадпочта» до 1 ноября. Неполученное уведомление не освобождает от уплаты. Чтобы задекларировать имущество, которого ещё нет в реестре, используйте бланк TS-14." },
    bad: { en: "Enter the area in square metres, from 1 to 100,000.", ir: "Ayantın 1den 100 000ge cheyin kvadrat metr menen jazıñız.", ru: "Введите площадь в квадратных метрах, от 1 до 100 000." }
  };
  function cityDist(d) { return d === "tl" || d === "nz" || d === "ij"; }
  FLOWS.proptax = function (box) {
    box.innerHTML = flowForm("fpt", field("ptk", L(PT.kind), sel("ptk", PT.kinds.map(function (k) { return [k[0], L(k[1])]; }))) + field("ptd", L(PT.dist), sel("ptd", opts(DISTRICTS))) + field("pta", L(PT.area), numIn("pta", 1, 100000)), L(PT.btn));
    onSub("fpt", function () {
      var a = intVal("pta"); if (!need("pta", function () { return a >= 1 && a <= 100000; })) { $("#pta-err").textContent = L(PT.bad); return; }
      var k = $("#ptk").value, row = PT.kinds.filter(function (x) { return x[0] === k; })[0], r = row[2], cf = cityDist($("#ptd").value) ? 1 : 0.6;
      var base = k === "plot" ? a / 100 * r : a * r, tax = Math.round(base * cf * 100) / 100, y = iradNow().getFullYear();
      result(kv([[L(PT.kind), esc(L(row[1]))], [L(PT.area), fmtN(a) + " m²"], [L(PT.rate), esc(L(k === "plot" ? PT.per100 : PT.perM2, { a: som(r) }))], [L(PT.coef), fmtN(cf, 1)], [L(PT.year, { y: y }), "<b>" + som(tax) + "</b>"], [L(PT.due), esc(fmtD(new Date(Date.UTC(y, 11, 1))))]]) + (k === "yurt" ? P(PT.yurt, "warn") : "") + P(PT.notice, "tiny") + payBox("proptax") + formBox("proptax"));
    });
  };
  HELP.proptax = {
    en: "<h3>Exemptions</h3><p>Pensioners, veterans and persons with disabilities of groups I and II pay no tax on one property of their choice. Apply once to the Tax Service with the documents; the exemption continues until you report a change.</p><h3>Areas</h3><p>The tax is worked out from the area in the technical passport. If the passport is older than 1996, the Technical Inventory Bureau may be asked to measure again.</p>",
    ir: "<h3>Jeñildikter</h3><p>Pensionerler, ardagerler jana I, II toptogu mayıptar özü tandagan bir mülk üchün salık tölöböyt. Dokumentter menen Salık kızmatına bir jolu kayrılıñız; jeñildik özgörüü tuuraluu kabarlamayıncha ulanat.</p><h3>Ayanttar</h3><p>Salık tekhnikalık pasporttogu ayant boyuncha eseptelet. Pasport 1996-jıldan eski bolso, Tekhnikalık inventarizatsiya byurosunan kayra ölchöönü surasa bolot.</p>",
    ru: "<h3>Льготы</h3><p>Пенсионеры, ветераны и люди с инвалидностью I и II групп не платят налог за один объект по выбору. Обратитесь один раз в Налоговую службу с документами; льгота действует, пока вы не сообщите об изменениях.</p><h3>Площадь</h3><p>Налог рассчитывается по площади в техническом паспорте. Если паспорт выдан до 1996 года, можно заказать новый обмер в Бюро технической инвентаризации.</p>"
  };

  /* annual road-use charge */
  var RC = {
    kind: { en: "Vehicle", ir: "Unaa", ru: "Транспортное средство" },
    kinds: [["c1", { en: "Car, engine up to 1.5 litres", ir: "Jeñil unaa, kıymıldatkıch 1,5 litrge cheyin", ru: "Легковой, двигатель до 1,5 л" }, 120], ["c2", { en: "Car, 1.5 to 2.5 litres", ir: "Jeñil unaa, 1,5ten 2,5 litrge cheyin", ru: "Легковой, от 1,5 до 2,5 л" }, 200], ["c3", { en: "Car, over 2.5 litres", ir: "Jeñil unaa, 2,5 litrden ashık", ru: "Легковой, свыше 2,5 л" }, 350], ["moto", { en: "Motorcycle", ir: "Mototsikl", ru: "Мотоцикл" }, 40], ["bus", { en: "Minibus or bus", ir: "Mikroavtobus je avtobus", ru: "Микроавтобус или автобус" }, 450], ["lorry", { en: "Lorry", ir: "Jük unaası", ru: "Грузовик" }, 600], ["tractor", { en: "Agricultural tractor", ir: "Aylı charba traktoru", ru: "Сельскохозяйственный трактор" }, 60], ["cart", { en: "Horse-drawn cart", ir: "At araba", ru: "Гужевая повозка" }, 0]],
    btn: { en: "Check charge", ir: "Tölömdü tekshirüü", ru: "Проверить сбор" },
    charge: { en: "Charge for {y}", ir: "{y}-jılga tölöm", ru: "Сбор за {y} год" },
    paid: { en: "Paid for {y}. The receipt was registered on {d}.", ir: "{y}-jıl üchün tölöngön. Kvitantsiya {d} kattalgan.", ru: "Оплачено за {y} год. Квитанция зарегистрирована {d}." },
    unpaid: { en: "Not paid for {y}. The charge was due by 31 March; a penalty of 1% a month has been added.", ir: "{y}-jıl üchün tölönbögön. Tölöm 31-martka cheyin tölönüshü kerek ele; ayına 1% ayıp puldu koshuldu.", ru: "За {y} год не оплачено. Срок уплаты истёк 31 марта; начислена пеня 1% в месяц." },
    pen: { en: "Penalty", ir: "Ayıp puldu", ru: "Пеня" },
    cart: { en: "Horse-drawn carts are exempt from the charge. They may not use the Trans-Talas Highway or State Route 1.", ir: "At arabalar tölömdön boshotulgan. Alar Trans-Talas jolun jana 1-Mamlekettik jolun koldono albayt.", ru: "Гужевые повозки освобождены от сбора. Им запрещено движение по Транс-Таласской трассе и Государственной дороге № 1." },
    form: { en: "Form DIC-5 is needed only when a vehicle is first registered or its type changes. The charge is paid for the calendar year, whatever the month of registration.", ir: "DIC-5 forması unaa birinchi jolu kattalganda je anın türü özgörgöndö gana kerek. Tölöm kattalgan ayga karabay kalendardık jıl üchün tölönöt.", ru: "Бланк DIC-5 нужен только при первой регистрации или смене типа ТС. Сбор уплачивается за календарный год независимо от месяца регистрации." }
  };
  FLOWS.roadcharge = function (box) {
    box.innerHTML = flowForm("frc", field("rck", L(RC.kind), sel("rck", RC.kinds.map(function (k) { return [k[0], L(k[1])]; }))) + field("plate", L(PL.plate), inp("plate", L(PL.platePh), ' maxlength="14" style="text-transform:uppercase"')), L(RC.btn));
    onSub("frc", function () {
      var k = $("#rck").value, row = RC.kinds.filter(function (x) { return x[0] === k; })[0], y = iradNow().getFullYear();
      if (k === "cart") { result(P(RC.cart, "ok")); return; }
      if (!need("plate", plateOk)) { $("#plate-err").textContent = L(PL.plateBad); return; }
      var p = norm($("#plate").value), h = hash("rc" + p), amt = row[2];
      if (roadPaid(p)) { result(P(RC.paid, "ok", { y: y, d: fmtD(new Date(Date.UTC(y, 0, 10 + h % 75))) }) + kv([[L(PL.plate), esc(p)], [L(RC.kind), esc(L(row[1]))], [L(RC.charge, { y: y }), som(amt)]]) + P(RC.form, "tiny") + formBox("roadcharge")); return; }
      var months = Math.max(0, iradNow().getMonth() - 2), pen = Math.round(amt * 0.01 * months * 100) / 100;
      result(P(RC.unpaid, "warn", { y: y }) + kv([[L(PL.plate), esc(p)], [L(RC.kind), esc(L(row[1]))], [L(RC.charge, { y: y }), som(amt)], [L(RC.pen), som(pen)], [L(BILL.due), "<b>" + som(amt + pen) + "</b>"]]) + payBox("roadcharge") + P(RC.form, "tiny") + formBox("roadcharge"));
    });
  };
  HELP.roadcharge = {
    en: "<h3>The sticker</h3><p>When the charge is paid, the Talasbank receipt is exchanged for a windscreen sticker at any Highway Patrol Corps post. A vehicle without a sticker for the current year may be stopped and its documents checked.</p><h3>Vehicles registered abroad</h3><p>Vehicles registered abroad pay a weekly charge at the crossing instead.</p>",
    ir: "<h3>Stiker</h3><p>Tölöm tölöngöndö Talasbanktın kvitantsiyası Avtojol patrul korpusunun kaalagan postunda aldıñkı aynektegi stikerge almashtırılat. Uchurdagı jıldın stikeri jok unaa toktotulup, dokumentteri tekshirilishi mümkün.</p><h3>Chet elde kattalgan unaalar</h3><p>Chet elde kattalgan unaalar anın orduna ötkööldö jumalık tölöm tölöyt.</p>",
    ru: "<h3>Наклейка</h3><p>После оплаты квитанция «Таласбанка» обменивается на наклейку на лобовое стекло на любом посту Корпуса дорожного патруля. Автомобиль без наклейки текущего года могут остановить для проверки документов.</p><h3>Иностранные автомобили</h3><p>Автомобили, зарегистрированные за рубежом, вместо этого платят недельный сбор на переходе.</p>"
  };

  /* state duty calculator and payment order */
  var DU = {
    intro: { en: "Tick the duties you need and the number of each. The calculator prepares a payment order to print and take to any Talasbank branch.", ir: "Kerektüü alımdardı jana ar birinin sanın belgileñiz. Kalkulyator Talasbanktın kaalagan filialına alıp baruu üchün basıla turgan tölöm tapshırmasın dayardayt.", ru: "Отметьте нужные пошлины и количество. Калькулятор подготовит платёжное поручение, которое можно распечатать и отнести в любое отделение «Таласбанка»." },
    qty: { en: "Number", ir: "Sanı", ru: "Кол-во" },
    btn: { en: "Prepare payment order", ir: "Tölöm tapshırmasın dayardoo", ru: "Подготовить платёжное поручение" },
    none: { en: "Tick at least one duty.", ir: "Keminde bir alımdı belgileñiz.", ru: "Отметьте хотя бы одну пошлину." },
    po: { en: "Payment order No. {n}", ir: "№ {n} tölöm tapshırması", ru: "Платёжное поручение № {n}" },
    date: { en: "Date", ir: "Kün", ru: "Дата" },
    payer: { en: "Payer", ir: "Tölööchü", ru: "Плательщик" },
    byHand: { en: "to be completed by hand at the bank", ir: "bankta kol menen tolturulat", ru: "заполняется от руки в банке" },
    rcpt: { en: "Recipient", ir: "Aluuchu", ru: "Получатель" },
    rcptV: { en: "State Tax Service, Ministry of Economy of the ISEZ (state duties)", ir: "IAEZdin Ekonomika ministrligi, Mamlekettik salık kızmatı (mamlekettik alımdar)", ru: "Государственная налоговая служба Министерства экономики ОЭЗИ (госпошлины)" },
    acc: { en: "Account", ir: "Esep", ru: "Счёт" },
    bank: { en: "Bank", ir: "Bank", ru: "Банк" },
    bankV: { en: "Talasbank, head office, Talas · BIC 128001", ir: "Talasbank, bashkı keñse, Talas · BIK 128001", ru: "«Таласбанк», головной офис, Талас · БИК 128001" },
    code: { en: "Budget code", ir: "Byudjet kodu", ru: "Код бюджетной классификации" },
    what: { en: "Purpose of payment", ir: "Tölömdün maksatı", ru: "Назначение платежа" },
    amt: { en: "Amount", ir: "Summa", ru: "Сумма" },
    total: { en: "Total", ir: "Bardıgı", ru: "Итого" },
    words: { en: "Amount in words", ir: "Summa jazuu menen", ru: "Сумма прописью" },
    sign: { en: "Payer's signature", ir: "Tölööchünün kolu", ru: "Подпись плательщика" },
    print: { en: "Print", ir: "Basıp chıgaruu", ru: "Распечатать" },
    note: { en: "One payment order is accepted for several duties if they are paid by the same person. Keep the bank's copy: the counter asks for it, not for this page.", ir: "Bir adam tölösö, bir neche alımga bir tölöm tapshırması kabıl alınat. Banktın nuskasın saktañız: kassada bul bet emes, oshol nuska suraladı.", ru: "Одно платёжное поручение принимается на несколько пошлин, если их платит один человек. Сохраните экземпляр банка: в окошке спросят его, а не эту страницу." }
  };
  FLOWS.duty = function (box) {
    box.innerHTML = '<form class="flow" id="fdu"><p>' + esc(L(DU.intro)) + '</p><div class="tw"><table class="tbl dutytbl"><thead><tr><th></th><th>' + esc(L(DU.what)) + '</th><th class="num">' + esc(L(DU.amt)) + '</th><th class="num">' + esc(L(DU.qty)) + "</th></tr></thead><tbody>" +
      DUTY.map(function (d) { return '<tr><td><input type="checkbox" id="du-' + d[0] + '" aria-label="' + esc(L(d[3])) + '"></td><td><label for="du-' + d[0] + '">' + esc(L(d[3])) + '</label></td><td class="num">' + som(d[1]) + '</td><td class="num"><input type="number" id="dq-' + d[0] + '" value="1" min="1" max="20" inputmode="numeric" aria-label="' + esc(L(DU.qty)) + '" style="width:4em"></td></tr>'; }).join("") +
      '</tbody></table></div><span class="err" id="du-err" hidden>' + esc(L(DU.none)) + '</span><p><button class="btn" type="submit">' + esc(L(DU.btn)) + '</button></p></form><div id="result" class="result" hidden aria-live="polite"></div>';
    onSub("fdu", function () {
      var rows = [], tot = 0, seed = "";
      DUTY.forEach(function (d) { if ($("#du-" + d[0]).checked) { var q = Math.max(1, Math.min(20, parseInt($("#dq-" + d[0]).value, 10) || 1)); rows.push([d, q]); tot += d[1] * q; seed += d[0] + q; } });
      $("#du-err").hidden = rows.length > 0; if (!rows.length) return;
      var no = String(hash(seed + today().toISOString()) % 900000 + 100000);
      result('<div class="porder"><h3>' + esc(L(DU.po, { n: no })) + "</h3>" + kv([[L(DU.date), esc(fmtD(today()))], [L(DU.payer), "<i>" + esc(L(DU.byHand)) + "</i>"], [L(DU.rcpt), esc(L(DU.rcptV))], [L(DU.acc), "1280 0001 0000 4401"], [L(DU.bank), esc(L(DU.bankV))]]) +
        '<div class="tw"><table class="tbl"><thead><tr><th>' + esc(L(DU.code)) + "</th><th>" + esc(L(DU.what)) + '</th><th class="num">' + esc(L(DU.amt)) + "</th></tr></thead><tbody>" +
        rows.map(function (r) { return "<tr><td>" + r[0][2] + "</td><td>" + esc(L(r[0][3])) + (r[1] > 1 ? " × " + r[1] : "") + '</td><td class="num">' + som(r[0][1] * r[1]) + "</td></tr>"; }).join("") +
        '</tbody><tfoot><tr><td></td><td>' + esc(L(DU.total)) + '</td><td class="num"><b>' + som(tot) + "</b></td></tr></tfoot></table></div>" +
        kv([[L(DU.words), "<i>" + esc(L(DU.byHand)) + "</i>"], [L(DU.sign), "________________"]]) + "</div>" +
        '<p><button type="button" class="btn ghost" id="duprint">' + esc(L(DU.print)) + "</button></p>" + P(DU.note, "tiny") + payBox("duty") + formBox("duty"));
      $("#duprint").addEventListener("click", function () { window.print(); });
    });
  };
  HELP.duty = {
    en: "<h3>Which duty?</h3><p>The amount of each duty is fixed by the Tax Code of the ISEZ and is the same at every office. Fees of the service providers themselves (copies, forms, stickers) are not state duties and are paid at their cash desks.</p><h3>Refunds</h3><p>A duty paid for an application that was not made is refunded within three years, on application to the Tax Service with the bank's copy.</p>",
    ir: "<h3>Kaysı alım?</h3><p>Ar bir alımdın summası IAEZdin Salık kodeksi menen belgilengen jana bardık bölümdördö birdey. Kızmat körsötüüchülördün öz akıları (köchürmölör, formalar, stikerler) mamlekettik alım emes jana alardın kassalarında tölönöt.</p><h3>Kaytaruu</h3><p>Berilbey kalgan arız üchün tölöngön alım banktın nuskası menen Salık kızmatına arız bergende üch jıldın ichinde kaytarılat.</p>",
    ru: "<h3>Какая пошлина?</h3><p>Размер каждой пошлины установлен Налоговым кодексом ОЭЗИ и одинаков во всех отделах. Платы самих организаций (копии, бланки, наклейки) госпошлиной не являются и вносятся в их кассы.</p><h3>Возврат</h3><p>Пошлина, уплаченная за неподанное заявление, возвращается в течение трёх лет по заявлению в Налоговую службу с экземпляром банка.</p>"
  };

  /* Register of Firms lookup */
  var FC = {
    q: { en: "Firm name or registration number", ir: "Firmanın atı je kattoo nomeri", ru: "Название фирмы или регистрационный номер" },
    ph: { en: "e.g. Ak-Jol or TL-19-004517", ir: "mısalı: Ak-Jol je TL-19-004517", ru: "например, Ак-Жол или TL-19-004517" },
    btn: { en: "Search the register", ir: "Reestrden izdöö", ru: "Искать в реестре" },
    none: { en: "No firm registered under this name or number was found. Firms registered before 2008 appear only once they have been re-registered.", ir: "Bul at je nomer menen kattalgan firma tabılgan jok. 2008-jılga cheyin kattalgan firmalar kayra kattalgandan kiyin gana körünöt.", ru: "Фирма с таким названием или номером не найдена. Фирмы, зарегистрированные до 2008 года, появляются только после перерегистрации." },
    found: { en: "Firms found", ir: "Tabılgan firmalar", ru: "Найденные фирмы" },
    no: { en: "Registration number", ir: "Kattoo nomeri", ru: "Регистрационный номер" },
    form: { en: "Legal form", ir: "Uyushmanın forması", ru: "Организационная форма" },
    dist: { en: "Registered in", ir: "Kattalgan jeri", ru: "Место регистрации" },
    date: { en: "Registered on", ir: "Kattalgan künü", ru: "Дата регистрации" },
    st: [{ en: "Active", ir: "Ishtep jatat", ru: "Действующая" }, { en: "Active; 2026 census slip not received", ir: "Ishtep jatat; 2026-jılkı sanak kagazı alına elek", ru: "Действующая; лист переписи 2026 не получен" }, { en: "In liquidation", ir: "Joyuu protsessinde", ru: "В стадии ликвидации" }, { en: "Struck off the register", ir: "Reestrden chıgarılgan", ru: "Исключена из реестра" }],
    owners: { en: "Founders and directors are shown only in the extract from the register.", ir: "Negizdööchülör jana jetekchiler reestrden köchürmödö gana körsötülöt.", ru: "Учредители и руководители указываются только в выписке из реестра." },
    extract: { en: "An extract is issued by the Register of Firms within five working days on form RF-8 (state duty IS 50). Until 30 November 2026 an extract is issued only on presentation of the firm's 2026 census slip.", ir: "Köchürmönü Firmalar reestri RF-8 forması boyuncha besh ish kündün ichinde beret (mamlekettik alım 50 som). 2026-jıldın 30-noyabrına cheyin köchürmö firmanın 2026-jılkı sanak kagazın körsötköndö gana berilet.", ru: "Выписку выдаёт Реестр фирм в течение пяти рабочих дней по бланку RF-8 (госпошлина 50 сомов). До 30 ноября 2026 года выписка выдаётся только при предъявлении листа переписи 2026 года." }
  };
  var FCODES = { tl: "TL", nz: "NZ", ij: "IJ", chu: "CH", kb: "KB", td: "TD", ln: "LN", tok: "TO", sb: "SB" };
  /* firms whose entries are fixed (anything else is worked out from the hash) */
  var FKNOWN = [
    { name: "CHATKAL METALS TRADING LLC", no: "TL-26-008114", form: 1, dist: 0, date: "2026-08-11", st: 1 },
    { name: "ALA-BEL INDUSTRIAL SUPPLY LLC", no: "TL-26-008362", form: 1, dist: 0, date: "2026-08-19", st: 1 },
    { name: "TRANS-CHUY TERMINAL SERVICES LLC", no: "NZ-19-002207", form: 1, dist: 1, date: "2019-03-04", st: 0 },
    { name: "TRANS-CHUY FREIGHT & LOGISTICS LLC", no: "NZ-08-000391", form: 1, dist: 1, date: "2008-04-02", st: 0 }
  ];
  var FNONE = ["KARA-TASH", "KARATASH"];
  function fkey(s) { return String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/(LLC|LTD)$/, ""); }
  function firmKnown(q, isNo) {
    var k = fkey(q);
    if (k.length < 4) return null;
    return FKNOWN.filter(function (f) { return isNo ? norm(f.no) === norm(q) : fkey(f.name).indexOf(k) >= 0; })
      .map(function (f) { return { name: f.name, no: f.no, form: BZ.forms[f.form][1], dist: DISTRICTS[f.dist][1], date: new Date(f.date + "T00:00:00Z"), st: f.st }; });
  }
  function firmRow(name, h) {
    var dk = DISTRICTS[h % DISTRICTS.length], fm = BZ.forms[(h >>> 4) % BZ.forms.length], y = 2008 + (h >>> 7) % 19, d = new Date(Date.UTC(y, (h >>> 9) % 12, 1 + (h >>> 13) % 28));
    if (d > today()) d = addDays(today(), -30 - h % 200);
    var s = (h >>> 3) % 10, st = s < 6 ? 0 : s < 8 ? 1 : s < 9 ? 2 : 3;
    return { name: name, no: FCODES[dk[0]] + "-" + String(d.getUTCFullYear()).slice(2) + "-" + ("000000" + ((h >>> 5) % 1000000)).slice(-6), form: fm[1], dist: dk[1], date: d, st: st };
  }
  FLOWS.firmcheck = function (box) {
    box.innerHTML = flowForm("ffc", field("fcq", L(FC.q), inp("fcq", L(FC.ph), ' maxlength="60"')), L(FC.btn));
    onSub("ffc", function () {
      if (!need("fcq")) return;
      var q = $("#fcq").value.trim(), isNo = /^[A-Z]{2}-?\d{2}-?\d{6}$/.test(norm(q)), h = hash("fc" + (isNo ? norm(q) : q.toLowerCase()));
      var rows = firmKnown(q, isNo) || [];
      if (!rows.length && (h % 4 === 0 || FNONE.some(function (x) { return fkey(q).indexOf(fkey(x)) === 0; }))) { result(P(FC.none, "warn")); return; }
      if (rows.length) { /* fixed entries from FKNOWN */ }
      else if (isNo) { var r = firmRow("", h), n = norm(q); r.no = n.slice(0, 2) + "-" + n.slice(2, 4) + "-" + n.slice(4); r.name = ["AK-JOL", "BEREKE TRADE", "TALAS AGRO", "NUR-SERVIS", "JANGAK EXPORT", "ORTO-AYYL", "KÖK-BEL TRANS", "SEMIZ MAL"][(h >>> 6) % 8] + ([" LLC", "", " COOP", ""][(h >>> 2) % 4]); rows.push(r); }
      else { var nm = caps(q), cnt = 1 + (h >>> 11) % 3; for (var i = 0; i < cnt; i++) rows.push(firmRow(i === 0 ? nm : nm + [" PLUS", "-2", " TRADE", " AGRO"][(h >>> (i + 2)) % 4], hash(nm + i))); }
      result(H4(FC.found) + '<div class="tw"><table class="tbl"><thead><tr><th>' + esc(L({ en: "Name", ir: "Atı", ru: "Название" })) + "</th><th>" + esc(L(FC.no)) + "</th><th>" + esc(L(FC.form)) + "</th><th>" + esc(L(FC.dist)) + "</th><th>" + esc(L(FC.date)) + "</th><th>" + esc(L(C.status)) + "</th></tr></thead><tbody>" +
        rows.map(function (r) { return "<tr><td><b>" + esc(r.name) + "</b></td><td>" + esc(r.no) + "</td><td>" + esc(L(r.form)) + "</td><td>" + esc(L(r.dist)) + "</td><td>" + esc(fmtD(r.date)) + "</td><td>" + esc(L(FC.st[r.st])) + "</td></tr>"; }).join("") + "</tbody></table></div>" + P(FC.owners, "tiny") + P(FC.extract) + formBox("firmcheck"));
    });
  };
  HELP.firmcheck = {
    en: "<h3>What the register shows</h3><p>The public register shows the name, number, legal form, place and date of registration and the status of each firm. It does not show turnover, debts or licences: check a licence with the permit and licence check.</p>",
    ir: "<h3>Reestr emneni körsötöt</h3><p>Achık reestr ar bir firmanın atın, nomerin, uyushmanın formasın, kattalgan jerin, kününö jana abalın körsötöt. Al jügürtüünü, karızdardı je litsenziyalardı körsötpöyt: litsenziyanı uruksat jana litsenziya tekshirüüsü arkıluu tekshiriñiz.</p>",
    ru: "<h3>Что показывает реестр</h3><p>Открытый реестр показывает название, номер, организационную форму, место и дату регистрации и статус фирмы. Оборот, долги и лицензии в нём не указываются: лицензию проверьте через проверку разрешений и лицензий.</p>"
  };

  /* vehicle register */
  var VH = {
    makes: ["Lada 2107", "Lada Niva", "Toyota Camry", "Toyota Corolla", "Honda Fit", "Mercedes-Benz Sprinter", "Daewoo Matiz", "Daewoo Nexia", "GAZ Gazelle", "Volkswagen Passat", "Mitsubishi Delica", "KamAZ 5320", "Hyundai Porter", "Audi 80"],
    colours: [{ en: "white", ir: "ak", ru: "белый" }, { en: "silver", ir: "kümüsh tüstüü", ru: "серебристый" }, { en: "black", ir: "kara", ru: "чёрный" }, { en: "dark red", ir: "kızıl küröñ", ru: "тёмно-красный" }, { en: "blue", ir: "kök", ru: "синий" }, { en: "beige", ir: "sarıgısh", ru: "бежевый" }],
    make: { en: "Make and model", ir: "Markası jana modeli", ru: "Марка и модель" },
    year: { en: "Year of manufacture", ir: "Chıgarılgan jılı", ru: "Год выпуска" },
    colour: { en: "Colour", ir: "Tüsü", ru: "Цвет" },
    dist: { en: "Registered in", ir: "Kattalgan jeri", ru: "Место регистрации" },
    insp: { en: "Technical inspection", ir: "Tekhnikalık karoo", ru: "Техосмотр" },
    inspOk: { en: "valid until {d}", ir: "{d} cheyin jaraktuu", ru: "действителен до {d}" },
    inspNo: { en: "expired on {d}", ir: "{d} möönötü bütkön", ru: "истёк {d}" },
    road: { en: "Road-use charge {y}", ir: "{y}-jılkı jol tölömü", ru: "Дорожный сбор {y}" },
    paid: { en: "paid", ir: "tölöngön", ru: "оплачен" }, unpaid: { en: "not paid", ir: "tölönbögön", ru: "не оплачен" },
    pol: { en: "Compulsory motor policy", ir: "Mildettüü avtopolis", ru: "Обязательный автополис" },
    polOk: { en: "valid", ir: "jaraktuu", ru: "действует" }, polNo: { en: "not valid", ir: "jaraksız", ru: "не действует" },
    restr: { en: "Restrictions", ir: "Cheklöölör", ru: "Ограничения" },
    rs: [{ en: "none", ir: "jok", ru: "нет" }, { en: "registration actions restricted: unpaid road-use charge", ir: "kattoo araketteri cheklengen: jol tölömü tölönbögön", ru: "запрет регистрационных действий: не оплачен дорожный сбор" }, { en: "under customs control: import duty not cleared", ir: "bajı közömöldöö astında: import bajısı tölönö elek", ru: "под таможенным контролем: пошлина не оплачена" }, { en: "pledged to a bank", ir: "bankka kepildikke koyulgan", ru: "в залоге у банка" }],
    none: { en: "No vehicle with this plate is on the ISEZ register. Vehicles registered abroad are recorded at the crossing and are not shown here.", ir: "Bul nomer menen IAEZdin reestrinde unaa jok. Chet elde kattalgan unaalar ötkööldö kattalat jana bul jerde körsötülböyt.", ru: "ТС с таким номером в реестре ОЭЗИ нет. ТС, зарегистрированные за рубежом, учитываются на переходе и здесь не показаны." },
    owner: { en: "The owner's name is not shown. It is given to the police, the courts and the owner himself.", ir: "Eesinin atı körsötülböyt. Al politsiyaga, sottorgo jana eesinin özünö berilet.", ru: "Имя владельца не показывается. Оно сообщается полиции, судам и самому владельцу." }
  };
  FLOWS.vehicle = function (box) {
    plateForm(box, "fvh", function (p) {
      var h = hash("vh" + p), y = iradNow().getFullYear();
      if (h % 11 === 0) { result(P(VH.none, "warn")); return; }
      var yr = 1982 + (h >>> 3) % 42, ins = addDays(today(), ((h >>> 5) % 600) - 200), paid = roadPaid(p), pk = motorK(p) <= 5;
      var rs = !paid && h % 2 ? 1 : (h >>> 9) % 9 === 0 ? 2 : (h >>> 9) % 9 === 1 ? 3 : 0;
      result(kv([[L(PL.plate), "<b>" + esc(p) + "</b>"], [L(VH.make), esc(VH.makes[(h >>> 4) % VH.makes.length])], [L(VH.year), String(yr)], [L(VH.colour), esc(L(VH.colours[(h >>> 6) % VH.colours.length]))], [L(VH.dist), esc(L(DISTRICTS[(h >>> 8) % DISTRICTS.length][1]))],
        [L(VH.insp), esc(L(ins >= today() ? VH.inspOk : VH.inspNo, { d: fmtD(ins) }))], [L(VH.road, { y: y }), esc(L(paid ? VH.paid : VH.unpaid)) + (paid ? "" : " · " + svcLink("roadcharge"))], [L(VH.pol), esc(L(pk ? VH.polOk : VH.polNo)) + " · " + svcLink("motor")], [L(VH.restr), esc(L(VH.rs[rs]))]]) + P(VH.owner, "tiny"));
    });
  };
  HELP.vehicle = {
    en: "<h3>Buying a used car?</h3><p>Check the plate here, then the frame number on the registration certificate against the car itself. A car under customs control cannot be re-registered until the import duty is paid, whoever owns it.</p>",
    ir: "<h3>Koldonulgan unaa satıp alıp jatasızbı?</h3><p>Nomerdi bul jerden tekshirip, andan kiyin kattoo kübölügündögü kuzov nomerin unaanın özü menen salıshtırıñız. Bajı közömöldöösündögü unaa kimdiki bolboson, import bajısı tölönmöyünchö kayra kattalbayt.</p>",
    ru: "<h3>Покупаете подержанный автомобиль?</h3><p>Проверьте номер здесь, затем сверьте номер кузова в свидетельстве о регистрации с самим автомобилем. Автомобиль под таможенным контролем нельзя перерегистрировать, пока не оплачена пошлина, кому бы он ни принадлежал.</p>"
  };

  /* permit and licence check */
  var PM = {
    kind: { en: "Type of permit", ir: "Uruksattın türü", ru: "Вид разрешения" },
    kinds: [["ev", { en: "Event permit", ir: "Ish-charaga uruksat", ru: "Разрешение на мероприятие" }, "EP-TL-26-0123", /^EP-?(TL|NZ|IJ)-?\d{2}-?\d{4}$/], ["tx", { en: "Taxi licence", ir: "Taksi litsenziyası", ru: "Лицензия такси" }, "TX-04512", /^TX-?\d{5}$/], ["al", { en: "Alcohol licence", ir: "Alkogol litsenziyası", ru: "Лицензия на алкоголь" }, "AL-25-0317", /^AL-?\d{2}-?\d{4}$/], ["mp", { en: "Trading place at a market", ir: "Bazardagı sooda ordu", ru: "Торговое место на рынке" }, "MP-NZ-0412", /^MP-?(TL|NZ|IJ|BK)-?\d{4}$/]],
    no: { en: "Number", ir: "Nomeri", ru: "Номер" },
    btn: { en: "Check", ir: "Tekshirüü", ru: "Проверить" },
    valid: { en: "Valid", ir: "Jaraktuu", ru: "Действует" },
    exp: { en: "Expired", ir: "Möönötü bütkön", ru: "Срок истёк" },
    susp: { en: "Suspended", ir: "Toktotulgan", ru: "Приостановлено" },
    none: { en: "No permit with this number is recorded. Permits issued in the last ten working days may not yet be on the register.", ir: "Bul nomer menen uruksat kattalgan emes. Akırkı on ish kündö berilgen uruksattar reestrge ali kire elek bolushu mümkün.", ru: "Разрешение с таким номером не зарегистрировано. Разрешения, выданные за последние десять рабочих дней, могут ещё не быть в реестре." },
    holder: { en: "Holder", ir: "Eesi", ru: "Владелец" },
    holders: [{ en: "a sole trader", ir: "jeke ishker", ru: "индивидуальный предприниматель" }, { en: "a limited company", ir: "joopkerchiligi chektelgen koom", ru: "общество с ограниченной ответственностью" }, { en: "a cooperative", ir: "kooperativ", ru: "кооператив" }],
    place: { en: "Place", ir: "Jeri", ru: "Место" },
    cond: { en: "Conditions", ir: "Shartarı", ru: "Условия" },
    conds: { ev: { en: "Amplified sound until 22:00; stewards one per 100 people", ir: "Kücheytilgen ün 22:00gö cheyin; ar 100 kishige bir tartip saktoochu", ru: "Звукоусиление до 22:00; один распорядитель на 100 человек" }, tx: { en: "Taximeter sealed by Iradstandart; licence card displayed on the dashboard", ir: "Taksometr Iradstandart tarabınan möördölgön; litsenziya kartası panelde ilinip turat", ru: "Таксометр опломбирован «Ирадстандартом»; карточка лицензии на панели" }, al: { en: "No sale between 23:00 and 8:00; not to persons under 21", ir: "23:00dön 8:00gö cheyin satuuga bolboyt; 21 jashka tolo elekterge satılbayt", ru: "Без продажи с 23:00 до 8:00; лицам до 21 года не продаётся" }, mp: { en: "Certified scales; price labels in Iradi", ir: "Tastıktalgan taraza; baa belgileri irad tilinde", ru: "Поверенные весы; ценники на ирадском языке" } },
    suspWhy: { ev: { en: "awaiting the fire-safety inspection of the venue", ir: "jaydın ört koopsuzdugu tekshirüüsü kütülüüdö", ru: "ожидается проверка площадки пожарной охраной" }, tx: { en: "taximeter seal overdue", ir: "taksometrdin möörünün möönötü ötüp ketken", ru: "просрочена пломба таксометра" }, al: { en: "renewal fee unpaid", ir: "uzartuu akısı tölönbögön", ru: "не оплачен сбор за продление" }, mp: { en: "rent for the market place unpaid", ir: "bazar ordunun ijara akısı tölönbögön", ru: "не оплачена аренда торгового места" } },
    markets: { TL: { en: "Bazar-i Kalan (Great Bazaar), Talas", ir: "Bazar-i Kalan (Choñ bazar), Talas", ru: "Базар-и Калан (Большой базар), Талас" }, NZ: { en: "Nurzhan central market", ir: "Nurzhan borborduk bazarı", ru: "Нуржанский центральный рынок" }, IJ: { en: "Iyık Janyl, Lower Town bazaar", ir: "Iyık Janyl, Tömönkü shaar bazarı", ru: "Ийык-Джаныл, базар Нижнего города" }, BK: { en: "Bazar-Korgon bazaar", ir: "Bazar-Korgon bazarı", ru: "Базар-Коргонский базар" } },
    row: { en: "row {r}, place {n}", ir: "{r}-katar, {n}-orun", ru: "ряд {r}, место {n}" }
  };
  FLOWS.permitcheck = function (box) {
    box.innerHTML = flowForm("fpm", field("pmk", L(PM.kind), sel("pmk", PM.kinds.map(function (k) { return [k[0], L(k[1])]; }))) + field("pmn", L(PM.no), inp("pmn", PM.kinds[0][2], ' maxlength="16" style="text-transform:uppercase"')), L(PM.btn));
    $("#pmk").addEventListener("change", function () { $("#pmn").placeholder = PM.kinds.filter(function (x) { return x[0] === $("#pmk").value; })[0][2]; });
    onSub("fpm", function () {
      var k = $("#pmk").value, row = PM.kinds.filter(function (x) { return x[0] === k; })[0], n = norm($("#pmn").value);
      if (!need("pmn", function () { return row[3].test(n); })) { $("#pmn-err").textContent = L(C.numBad, { e: row[2] }); return; }
      var h = hash("pm" + k + n), s = h % 10;
      if (s === 9 && n !== norm(row[2])) { result(P(PM.none, "warn")); return; }
      var st = s < 6 ? "valid" : s < 8 ? "exp" : "susp", d = st === "exp" ? addDays(today(), -(5 + (h >>> 4) % 300)) : addDays(today(), 10 + (h >>> 4) % 360);
      var place = k === "mp" ? L(PM.markets[n.slice(2, 4)]) + ", " + L(PM.row, { r: 1 + (h >>> 7) % 24, n: 1 + (h >>> 9) % 60 }) : k === "ev" ? L(EV.cities[n.slice(2, 4).toLowerCase()]) : L(DISTRICTS[(h >>> 6) % 3][1]);
      result(P(PM[st], st === "valid" ? "ok" : "warn") + kv([[L(PM.kind), esc(L(row[1]))], [L(PM.no), esc(n)], [L(PM.holder), esc(L(PM.holders[(h >>> 3) % 3]))], [L(PM.place), esc(place)], [L(st === "exp" ? C.ended : C.until), esc(fmtD(d))], [L(PM.cond), esc(L(PM.conds[k]))]].concat(st === "susp" ? [[L(C.status), esc(L(PM.susp) + ": " + L(PM.suspWhy[k]))]] : [])));
    });
  };
  HELP.permitcheck = {
    en: "<h3>Where is the number?</h3><p>Event permits are posted at the entrance of the venue; taxi licence cards are displayed on the dashboard; alcohol licences hang by the till; trading place numbers are painted on the stall. A trader who cannot show the number may be asked to leave the market by its administration.</p>",
    ir: "<h3>Nomer kayda?</h3><p>Ish-chara uruksattarı jaydın kirebersinde ilinet; taksi litsenziyasının kartası panelde turat; alkogol litsenziyası kassanın janında ilinet; sooda ordunun nomeri dükönchögö boyolup jazılat. Nomerdi körsötö albagan soodagerdi bazardın administratsiyası bazardan chıgarıshı mümkün.</p>",
    ru: "<h3>Где номер?</h3><p>Разрешение на мероприятие вывешивается у входа; карточка лицензии такси находится на панели; лицензия на алкоголь висит у кассы; номер торгового места нанесён краской на прилавке. Торговца, который не может показать номер, администрация рынка может попросить покинуть рынок.</p>"
  };

  /* Supreme Court register of pending cases */
  var CT = {
    no: { en: "Case number", ir: "Ishtin nomeri", ru: "Номер дела" },
    ph: { en: "e.g. SC-C-25/0117", ir: "mısalı: SC-C-25/0117", ru: "например, SC-C-25/0117" },
    btn: { en: "Find case", ir: "Ishti tabuu", ru: "Найти дело" },
    bad: { en: "Case numbers look like SC-C-25/0117: C civil and commercial, K criminal, A administrative and the bar, R constitutional reference; then the year of filing and the serial number.", ir: "Ishtin nomeri SC-C-25/0117 sıyaktuu bolot: C jarandık jana sooda, K kılmısh, A administrativdik jana advokatura, R konstitutsiyalık suroo; andan kiyin berilgen jılı jana tartip nomeri.", ru: "Номер дела выглядит как SC-C-25/0117: C гражданские и коммерческие, K уголовные, A административные и адвокатура, R конституционные запросы; далее год подачи и порядковый номер." },
    cat: { en: "Category", ir: "Kategoriyası", ru: "Категория" },
    cats: { C: { en: "Civil and commercial appeal", ir: "Jarandık jana sooda apellyatsiyası", ru: "Гражданская и коммерческая апелляция" }, K: { en: "Criminal appeal", ir: "Kılmısh apellyatsiyası", ru: "Уголовная апелляция" }, A: { en: "Administrative decision or the bar", ir: "Administrativdik chechim je advokatura", ru: "Административное решение или адвокатура" }, R: { en: "Constitutional reference", ir: "Konstitutsiyalık suroo", ru: "Конституционный запрос" } },
    filed: { en: "Filed", ir: "Berilgen künü", ru: "Подано" },
    parties: { en: "Parties", ir: "Taraptar", ru: "Стороны" },
    pt: { C: { en: "a limited company v. a limited company", ir: "joopkerchiligi chektelgen koom — joopkerchiligi chektelgen koom", ru: "общество с ограниченной ответственностью против общества с ограниченной ответственностью" }, K: { en: "the appellant (name withheld) v. the Attorney General", ir: "apellyant (atı körsötülbögön) — Bashkı prokuror", ru: "апеллянт (имя не указывается) против Генерального прокурора" }, A: { en: "a private person v. the Tax Service", ir: "jeke adam — Salık kızmatı", ru: "частное лицо против Налоговой службы" }, R: { en: "as shown on the papers filed at the registry", ir: "registraturaga tapshırılgan kagazdarda körsötülgöndöy", ru: "как указано в документах, поданных в канцелярию" } },
    stage: { en: "Status", ir: "Abalı", ru: "Статус" },
    hearing: { en: "Hearing", ir: "Sot jıyını", ru: "Слушание" },
    notSet: { en: "Not yet set", ir: "Belgilene elek", ru: "Не назначено" },
    sts: [{ en: "Awaiting listing", ir: "Tizmege kirüünü kütüüdö", ru: "Ожидает назначения" }, { en: "Papers incomplete: awaiting the respondent's answer", ir: "Kagazdar toluk emes: joopkerdin joobun kütüüdö", ru: "Документы не полны: ожидается отзыв ответчика" }, { en: "Listed for hearing", ir: "Ugushka tizmelengen", ru: "Включено в список к слушанию" }, { en: "Heard; judgment reserved", ir: "Ugulgan; chechim kiyinkige kaltırılgan", ru: "Заслушано; решение отложено" }],
    heardOn: { en: "Heard on {d}", ir: "{d} ugulgan", ru: "Заслушано {d}" },
    sealed: { en: "Sealed matter. Only the reference number is shown on the public register.", ir: "Jabık ish. Achık reestrde nomeri gana körsötülöt.", ru: "Закрытое дело. В открытом реестре указывается только номер." },
    none: { en: "No pending case with this number is on the register. Cases that have been decided are removed from the register of pending cases; judgments are published in the court's reports.", ir: "Reestrde bul nomer menen karaluuchu ish jok. Chechilgen ishter karaluuchu ishterdin reestrinen chıgarılat; chechimder sottun bayandamalarında jarıyalanat.", ru: "Рассматриваемого дела с таким номером в реестре нет. Решённые дела исключаются из реестра рассматриваемых дел; решения публикуются в сборниках суда." },
    lists: { en: "The order in which cases are listed is decided by the justices. Hearing lists are posted a week before each sitting. The register is updated at the end of each working day.", ir: "Ishterdin tizmelenüü tartibin sudyalar chechet. Ugush tizmeleri ar bir jıyından bir juma murun jarıyalanat. Reestr ar bir ish kündün akırında jañılanat.", ru: "Очерёдность назначения дел определяют судьи. Списки к слушанию публикуются за неделю до каждого заседания. Реестр обновляется в конце каждого рабочего дня." }
  };
  FLOWS.court = function (box) {
    box.innerHTML = flowForm("fct", field("ctn", L(CT.no), inp("ctn", L(CT.ph), ' maxlength="16" style="text-transform:uppercase"')), L(CT.btn));
    onSub("fct", function () {
      var raw = $("#ctn").value.toUpperCase().replace(/\s/g, ""), m = /^SC-?([CKAR])-?(\d{2})\/?(\d{3,4})$/.exec(raw);
      if (!need("ctn", function () { return !!m && +m[2] >= 23 && +m[2] <= +yy(); })) { $("#ctn-err").textContent = L(CT.bad); return; }
      var c = m[1], y = 2000 + +m[2], no = "SC-" + c + "-" + m[2] + "/" + ("000" + m[3]).slice(-4), h = hash("ct" + no);
      if (h % 7 === 0 && no !== "SC-C-25/0117") { result(P(CT.none, "warn")); return; }
      if (h % 13 === 1 && no !== "SC-C-25/0117") { result(P(CT.sealed, "warn") + kv([[L(CT.no), esc(no)], [L(CT.cat), esc(L(CT.cats[c]))]])); return; }
      var start = y === 2023 ? Date.UTC(2023, 10, 1) : Date.UTC(y, 0, 2), end = Math.min(today().getTime(), Date.UTC(y, 11, 30)), f = new Date(start + (h >>> 4) % Math.max(1, Math.floor((end - start) / 86400000)) * 86400000);
      var r = (h >>> 3) % 12, s = c === "R" ? (r < 9 ? 0 : 2) : r < 7 ? 0 : r < 9 ? 1 : r < 11 ? 2 : 3;
      var since = -daysTo(f); if (s === 3 && since < 60) s = 0;
      var hearing = s === 3 ? L(CT.heardOn, { d: fmtD(addDays(f, Math.min(since - 21, 90 + h % 240))) }) : L(CT.notSet);
      result(kv([[L(CT.no), "<b>" + esc(no) + "</b>"], [L(CT.cat), esc(L(CT.cats[c]))], [L(CT.filed), esc(fmtD(f))], [L(CT.parties), esc(L(CT.pt[c]))], [L(CT.stage), esc(L(CT.sts[s]))], [L(CT.hearing), esc(hearing)]]) + P(CT.lists, "tiny"));
    });
  };
  HELP.court = {
    en: "<h3>About the register</h3><p>The Supreme Court has published its register of pending cases online since October 2026. It gives the filing date, the category and the status of every matter before the five justices. Matters concerning children and other sealed matters appear only under their reference number.</p><p>Papers are filed at the registry counter in the Hall of Justice, Liberty Boulevard, Talas. The registry does not give legal advice.</p>",
    ir: "<h3>Reestr tuuraluu</h3><p>Jogorku sot 2026-jıldın oktyabrınan beri karaluuchu ishterdin reestrin onlayn jarıyalap kelet. Anda besh sudyanın aldındagı ar bir ishtin berilgen künü, kategoriyası jana abalı körsötülöt. Baldarga tiyishtüü jana bashka jabık ishter nomeri menen gana körsötülöt.</p><p>Kagazdar Adilet Üyündögü registraturanın terezesine tapshırılat, Erkindik bulvarı, Talas. Registratura ukuktuk keñesh berbeyt.</p>",
    ru: "<h3>О реестре</h3><p>Верховный суд публикует реестр рассматриваемых дел онлайн с октября 2026 года. В нём указаны дата подачи, категория и статус каждого дела, находящегося у пяти судей. Дела с участием детей и другие закрытые дела указываются только под номером.</p><p>Документы подаются в окно канцелярии во Дворце правосудия, бульвар Свободы, Талас. Канцелярия не даёт юридических консультаций.</p>"
  };

  /* Iradstandart certificate check */
  var CC = {
    grp: { en: "Product group", ir: "Tovar tobu", ru: "Группа товаров" },
    grps: [["eggs", { en: "Table eggs", ir: "Tamak-ashka jumurtka", ru: "Пищевые яйца" }, "IST 114-94"], ["pack", { en: "Food packaging", ir: "Tamak-ash tañgagı", ru: "Упаковка для пищевых продуктов" }, "IST 31-95"], ["kymyz", { en: "Kymyz", ir: "Kımız", ru: "Кымыз" }, "IST 7-97"], ["elec", { en: "Electrical appliances", ir: "Elektr priborloru", ru: "Электроприборы" }, ""], ["build", { en: "Building materials", ir: "Kurulush materialdarı", ru: "Строительные материалы" }, ""], ["child", { en: "Children's goods", ir: "Baldar tovarları", ru: "Детские товары" }, ""], ["oth", { en: "Other products", ir: "Bashka tovarlar", ru: "Прочие товары" }, ""]],
    no: { en: "Certificate number", ir: "Sertifikattın nomeri", ru: "Номер сертификата" },
    ph: "IST-C-26-01234",
    btn: { en: "Check certificate", ir: "Sertifikattı tekshirüü", ru: "Проверить сертификат" },
    std: { en: "Standard", ir: "Standart", ru: "Стандарт" },
    gost: { en: "No IST standard yet: assessed against the GOST standard in force in the Iradi SSR on 1 January 1992", ir: "IST standartı ali jok: 1992-jıldın 1-yanvarında Irad SSRinde koldonulgan GOST standartı boyuncha baalanat", ru: "Стандарта IST пока нет: оценка по ГОСТ, действовавшему в Ирадской ССР на 1 января 1992 года" },
    holder: { en: "Holder", ir: "Eesi", ru: "Держатель" },
    valid: { en: "Certificate valid", ir: "Sertifikat jaraktuu", ru: "Сертификат действует" },
    exp: { en: "Certificate expired", ir: "Sertifikattın möönötü bütkön", ru: "Срок сертификата истёк" },
    susp: { en: "Certificate suspended: the label is not in Iradi. The holder has been referred to the Toponymic Section of the State Archives.", ir: "Sertifikat toktotulgan: etiketka irad tilinde emes. Eesi Mamlekettik arkhivdin Toponimika bölümünö jiberildi.", ru: "Сертификат приостановлен: этикетка не на ирадском языке. Держатель направлен в Топонимический отдел Государственного архива." },
    none: { en: "No certificate with this number is on the register. Certificates issued before 2015 are held on paper only and can be checked at Iradstandart, Jibek Jolu Avenue 60, Talas.", ir: "Reestrde bul nomer menen sertifikat jok. 2015-jılga cheyin berilgen sertifikattar kagaz jüzündö gana saktalat, alardı Iradstandartta tekshirse bolot: Jibek Jolu prospekti 60, Talas.", ru: "Сертификата с таким номером в реестре нет. Сертификаты, выданные до 2015 года, хранятся только на бумаге и проверяются в «Ирадстандарте»: проспект Жибек Жолу, 60, Талас." },
    kymyz: { en: "Kymyz with less than 2.5% alcohol (IST 7-97) is not an alcoholic beverage for licensing.", ir: "Spirti 2,5%dan az kımız (IST 7-97) litsenziyaloo üchün alkogoldük ichimdik bolup eseptelbeyt.", ru: "Кымыз крепостью менее 2,5% (IST 7-97) для целей лицензирования не считается алкогольным напитком." }
  };
  FLOWS.certcheck = function (box) {
    box.innerHTML = flowForm("fcc", field("ccg", L(CC.grp), sel("ccg", CC.grps.map(function (k) { return [k[0], L(k[1])]; }))) + field("ccn", L(CC.no), inp("ccn", CC.ph, ' maxlength="18" style="text-transform:uppercase"')), L(CC.btn));
    onSub("fcc", function () {
      var n = norm($("#ccn").value), m = /^ISTC(\d{2})(\d{5})$/.exec(n);
      if (!need("ccn", function () { return !!m; })) { $("#ccn-err").textContent = L(C.numBad, { e: CC.ph }); return; }
      var g = $("#ccg").value, row = CC.grps.filter(function (x) { return x[0] === g; })[0], no = "IST-C-" + m[1] + "-" + m[2], h = hash("cc" + g + no), s = h % 10;
      if ((s === 9 && no !== CC.ph) || +m[1] < 15 || +m[1] > +yy()) { result(P(CC.none, "warn")); return; }
      var st = s < 6 ? "valid" : s < 8 ? "exp" : "susp", d = st === "exp" ? addDays(today(), -(10 + (h >>> 4) % 400)) : addDays(today(), 20 + (h >>> 4) % 700);
      result(P(CC[st], st === "valid" ? "ok" : "warn") + kv([[L(CC.no), esc(no)], [L(CC.grp), esc(L(row[1]))], [L(CC.std), esc(row[2] || L(CC.gost))], [L(CC.holder), esc(L(PM.holders[(h >>> 3) % 3]))], [L(st === "exp" ? C.ended : C.until), st === "susp" ? "—" : esc(fmtD(d))]]) + (g === "kymyz" ? P(CC.kymyz, "tiny") : ""));
    });
  };
  HELP.certcheck = {
    en: "<h3>What a certificate means</h3><p>A certificate of conformity shows that samples of the product met the standard when they were tested by Iradstandart's laboratory. It is issued for a batch or for up to three years of production. Report goods sold without a valid certificate to Iradstandart, Jibek Jolu Avenue 60, Talas.</p>",
    ir: "<h3>Sertifikat emneni bildiret</h3><p>Shaykeshtik sertifikatı tovardın ülgülörü Iradstandarttın laboratoriyasında sınalganda standartka ılayık kelgenin körsötöt. Al bir partiyaga je üch jılga cheyinki öndürüshkö berilet. Jaraktuu sertifikatsız satılgan tovarlar tuuraluu Iradstandartka kabarlañız: Jibek Jolu prospekti 60, Talas.</p>",
    ru: "<h3>Что означает сертификат</h3><p>Сертификат соответствия подтверждает, что образцы продукции отвечали стандарту при испытании в лаборатории «Ирадстандарта». Он выдаётся на партию или на производство сроком до трёх лет. О товарах без действующего сертификата сообщайте в «Ирадстандарт»: проспект Жибек Жолу, 60, Талас.</p>"
  };

  /* school leaving examination results */
  // The results moved to the Education Quality Agency's page, /test-results/ (assets/extra.js).
  FLOWS.exams = function (box) {
    box.innerHTML = flowForm("fex", field("exn", t("exNo"), inp("exn", "26-TL-012345", ' maxlength="16" style="text-transform:uppercase"')), t("exBtn"));
    onSub("fex", function () { if (!need("exn")) return; location.href = "/test-results/?n=" + encodeURIComponent(norm($("#exn").value)); });
  };

  /* trading place at a municipal market */
  var ST = {
    mkt: { en: "Market", ir: "Bazar", ru: "Рынок" },
    mkts: [["TL", PM.markets.TL], ["NZ", PM.markets.NZ], ["IJ", PM.markets.IJ], ["BK", PM.markets.BK]],
    goods: { en: "Goods", ir: "Tovarlar", ru: "Товары" },
    goodss: [["veg", { en: "Fruit and vegetables", ir: "Jemish jana jashılcha", ru: "Фрукты и овощи" }], ["meat", { en: "Meat, dairy or eggs", ir: "Et, süt azıktarı je jumurtka", ru: "Мясо, молочные продукты или яйца" }], ["dry", { en: "Clothing and household goods", ir: "Kiyim jana üy buyumdarı", ru: "Одежда и хозяйственные товары" }], ["nuts", { en: "Walnuts and dried fruit", ir: "Jangak jana kurgatılgan jemish", ru: "Грецкие орехи и сухофрукты" }], ["stock", { en: "Livestock", ir: "Mal", ru: "Скот" }]],
    term: { en: "For", ir: "Möönötü", ru: "Срок" },
    terms: [["day", { en: "One day", ir: "Bir kün", ru: "Один день" }], ["month", { en: "One month", ir: "Bir ay", ru: "Один месяц" }], ["year", { en: "One year", ir: "Bir jıl", ru: "Один год" }]],
    btn: { en: "Check availability", ir: "Bosh ordu tekshirüü", ru: "Проверить наличие мест" },
    day: { en: "Day places are allocated by the market administration at 6:30 each morning in order of arrival. The fee of IS 15 is paid to the controller, who gives a numbered ticket.", ir: "Bir kündük orundardı bazardın administratsiyası ar künü erteñ menen 6:30da kelgen kezek boyuncha bölüp beret. 15 som akını kontrolyorgo tölöysüz, al nomerlengen bilet beret.", ru: "Места на день распределяет администрация рынка каждое утро в 6:30 в порядке очереди. Плата 15 сомов вносится контролёру, который выдаёт номерной талон." },
    list: { en: "Permanent places at this market are allocated from the waiting list. Places on the list ahead of you: {n}.", ir: "Bul bazardagı turuktuu orundar kezek tizmesi boyuncha bölünöt. Tizmede sizden aldıñkılar: {n}.", ru: "Постоянные места на этом рынке распределяются по листу ожидания. Перед вами в списке: {n}." },
    free: { en: "There are free places in this section of the market. Bring the application to the market administration; places are assigned on the day of application.", ir: "Bazardın bul bölügündö bosh orundar bar. Arızdı bazardın administratsiyasına alıp keliñiz; orundar arız bergen künü bölünöt.", ru: "В этом ряду рынка есть свободные места. Принесите заявление в администрацию рынка; место предоставляется в день подачи." },
    rent: { en: "Rent", ir: "Ijara akısı", ru: "Аренда" },
    rents: { month: 300, year: 3000 },
    meat: { en: "Meat, dairy and eggs need a veterinary certificate for each batch, a sanitary book for the seller and certified scales. See the step-by-step guide: Sell food.", ir: "Et, süt azıktarı jana jumurtka üchün ar bir partiyaga veterinardık kübölük, satuuchuga sanitardık kitepche jana tastıktalgan taraza kerek. Kadam-kadam jetekchini karañız: Tamak-ash satuu.", ru: "Для мяса, молочных продуктов и яиц нужны ветеринарное свидетельство на каждую партию, санитарная книжка продавца и поверенные весы. См. пошаговое руководство: «Торговля продуктами»." },
    stock: { en: "Livestock is sold only at the livestock market on Sundays, 5:00–11:00, and only with the animal's veterinary passport.", ir: "Mal jekshembi künderi 5:00–11:00 mal bazarında gana, maldın veterinardık pasportu menen gana satılat.", ru: "Скот продаётся только на скотном рынке по воскресеньям, 5:00–11:00, и только с ветеринарным паспортом животного." },
    docs: { en: ["Your ID card, or the firm's registration certificate and the director's letter", "Registration with the Tax Service as a sole trader or firm (for monthly and annual places)", "Form CH-40"], ir: ["Jeke kuböölügüñüz je firmanın kattoo kübölügü jana jetekchinin katı", "Salık kızmatında jeke ishker je firma katarı kattoo (aylık jana jıldık orundar üchün)", "CH-40 forması"], ru: ["Удостоверение личности или свидетельство о регистрации фирмы и письмо руководителя", "Постановка на учёт в Налоговой службе как ИП или фирма (для мест на месяц и год)", "Бланк CH-40"] },
    where: { en: "The market administration office, Monday to Saturday, 8:00–12:00.", ir: "Bazardın administratsiyasının keñsesi, düyshömbüdön ishembige cheyin, 8:00–12:00.", ru: "Администрация рынка, понедельник–суббота, 8:00–12:00." }
  };
  FLOWS.stall = function (box) {
    box.innerHTML = flowForm("fst", field("stm", L(ST.mkt), sel("stm", opts(ST.mkts))) + field("stg", L(ST.goods), sel("stg", opts(ST.goodss))) + field("stt", L(ST.term), sel("stt", opts(ST.terms))), L(ST.btn));
    onSub("fst", function () {
      var m = $("#stm").value, g = $("#stg").value, tm = $("#stt").value, h = hash("st" + m + g);
      if (g === "stock") { result(P(ST.stock, "warn")); return; }
      var extra = g === "meat" ? '<p>' + esc(L(ST.meat)) + ' <a href="/procedures.html?op=food">→</a></p>' : "";
      if (tm === "day") { result(P(ST.day, "ok") + extra); return; }
      var wait = h % 4 === 0 ? 0 : 40 + h % 400;
      result(refBox(C.ref, refNo("MP-" + m, m + g + tm), [[L(ST.mkt), esc(L(pick(ST.mkts, m)))], [L(ST.goods), esc(L(pick(ST.goodss, g)))], [L(ST.rent), som(ST.rents[tm]) + " / " + esc(L(pick(ST.terms, tm)).toLowerCase())]]) + P(wait ? ST.list : ST.free, wait ? "warn" : "ok", { n: fmtN(wait) }) + extra + counterEnd("stall", L(ST.docs), ST.where));
    });
  };
  HELP.stall = {
    en: "<h3>Rules of the market</h3><p>Prices are labelled in Iradi; scales are certified by Iradstandart and checked by the market controller; the place is cleared by 18:00. A place may not be sublet. A place left unused for 30 days returns to the waiting list.</p><p><a href=\"/procedure.html?id=food-bazaar\">Step-by-step: every permit for a stall at Bazar-i Kalan →</a></p>",
    ir: "<h3>Bazardın erejeleri</h3><p>Baalar irad tilinde jazılat; tarazalar Iradstandart tarabınan tastıktalat jana bazardın kontrolyoru tekshiret; orun 18:00gö cheyin boshotulat. Ordu bashka adamga ijaraga berüügö bolboyt. 30 kün koldonulbagan orun kezek tizmesine kaytat.</p><p><a href=\"/procedure.html?id=food-bazaar\">Kadam-kadam: Bazar-i Kalandagı orun üchün bardık uruksattar →</a></p>",
    ru: "<h3>Правила рынка</h3><p>Ценники пишутся на ирадском языке; весы поверены «Ирадстандартом» и проверяются контролёром рынка; место освобождается к 18:00. Сдавать место в субаренду нельзя. Место, не используемое 30 дней, возвращается в лист ожидания.</p><p><a href=\"/procedure.html?id=food-bazaar\">Пошагово: все разрешения для места на Базар-и Калан →</a></p>"
  };

  /* building permit pre-application */
  var BP = {
    kind: { en: "Works", ir: "Ishter", ru: "Работы" },
    kinds: [["house", { en: "New house", ir: "Jañı üy", ru: "Новый дом" }], ["ext", { en: "Extension on the ground floor", ir: "Birinchi kabatta kosumcha", ru: "Пристройка на первом этаже" }], ["storey", { en: "Second storey", ir: "Ekinchi kabat", ru: "Второй этаж" }], ["garage", { en: "Garage or outbuilding", ir: "Garaj je kosumcha imarat", ru: "Гараж или хозпостройка" }], ["fence", { en: "Fence on the street line", ir: "Köchö boyundagı tosmo", ru: "Забор по красной линии" }], ["use", { en: "Change of use (flat to shop or office)", ir: "Maksatın özgörtüü (kvartiradan düköngö je keñsege)", ru: "Смена назначения (квартира под магазин или офис)" }]],
    dist: { en: "District or city", ir: "Aymak je shaar", ru: "Район или город" },
    her: { en: "In the Old City or another protected zone", ir: "Köhne Dizde je bashka korgoluuchu zonada", ru: "В Старом городе или другой охранной зоне" },
    base: { en: "In the approach zone of Talas Air Base", ir: "Talas aviabazasının kirüü zonasında", ru: "В зоне подхода авиабазы Талас" },
    btn: { en: "List approvals", ir: "Makuldashuulardın tizmesi", ru: "Перечень согласований" },
    need: { en: "Approvals needed before the permit", ir: "Uruksatka cheyin kerektüü makuldashuular", ru: "Согласования, необходимые до разрешения" },
    ap: {
      land: { en: "Extract from the land register (district land department), valid 30 days", ir: "Jer reestrinen köchürmö (aymaktık jer bölümü), 30 kün jaraktuu", ru: "Выписка из земельного реестра (районный земельный отдел), действует 30 дней" },
      bti: { en: "Technical passport of the existing building (Technical Inventory Bureau)", ir: "Bar imarattın tekhnikalık pasportu (Tekhnikalık inventarizatsiya byurosu)", ru: "Технический паспорт существующего здания (Бюро технической инвентаризации)" },
      seis: { en: "Seismic zoning certificate (Talas State University)", ir: "Seysmikalık zonaloo kübölügü (Talas mamlekettik universiteti)", ru: "Справка о сейсмическом районировании (Таласский государственный университет)" },
      surv: { en: "Structural survey by a licensed engineer", ir: "Litsenziyası bar inzhenerdin konstruktsiyanı tekshirüüsü", ru: "Обследование конструкций лицензированным инженером" },
      design: { en: "Design by a licensed architect, four copies", ir: "Litsenziyası bar arkhitektordun proektisi, tört nuska", ru: "Проект лицензированного архитектора, четыре экземпляра" },
      nb: { en: "Notarised consents of the neighbours and the household", ir: "Koñshulardın jana üy-bülönün notarius tastıktagan makulduktarı", ru: "Нотариальные согласия соседей и членов семьи" },
      util: { en: "Technical conditions of Iradenergo and the water enterprise", ir: "Iradenergonun jana suu ishkanasının tekhnikalık shartarı", ru: "Технические условия «Ирадэнерго» и водоканала" },
      fire: { en: "Fire-safety approval (State Fire Inspectorate)", ir: "Ört koopsuzdugu boyuncha makulduk (Mamlekettik ört inspektsiyası)", ru: "Согласование пожарной безопасности (Государственная пожарная инспекция)" },
      her: { en: "Heritage Department approval", ir: "Muras departamentinin makulduguu", ru: "Согласование Департамента наследия" },
      base: { en: "Height clearance near Talas Air Base (through the Roads Department)", ir: "Talas aviabazasının janında biyiktik boyuncha uruksat (Joldor departamenti arkıluu)", ru: "Согласование высоты у авиабазы Талас (через Департамент дорог)" },
      colour: { en: "Approval of the fence's height, material and colour by the Architecture and Planning Department", ir: "Tosmonun biyiktigin, materialın jana tüsün Arkhitektura jana shaar kurulushu bölümü makuldashat", ru: "Согласование высоты, материала и цвета забора Управлением архитектуры и градостроительства" },
      tax: { en: "Certificate from the Tax Service that no property tax is owed", ir: "Mülk salıgı boyuncha karız jok ekeni tuuraluu Salık kızmatının maalımkatı", ru: "Справка Налоговой службы об отсутствии задолженности по налогу на имущество" }
    },
    guide: { en: "Each approval is described step by step, with offices, fees and waiting times, in the guide to procedures: {a}.", ir: "Ar bir makuldashuu keñseleri, akıları jana kütüü möönöttörü menen tartipter boyuncha jetekchide kadam-kadam jazılgan: {a}.", ru: "Каждое согласование с адресами, платами и сроками пошагово описано в руководстве по процедурам: {a}." },
    storeyLink: { en: "Add a second storey", ir: "Ekinchi kabat koshuu", ru: "Надстроить второй этаж" },
    pre: { en: "A pre-application is not an application. Building may begin only when the permit has been issued and posted at the site.", ir: "Aldın ala arız arız emes. Kurulushtu uruksat berilip, kurulush ayantına ilingenden kiyin gana bashtoogo bolot.", ru: "Предварительная заявка не является заявлением. Строительство можно начинать только после выдачи разрешения и его размещения на объекте." },
    docs: { en: ["Your ID card and the ownership certificate of the plot", "The approvals listed above, in the original", "Form CA-6"], ir: ["Jeke kuböölügüñüz jana jer tilkesinin menchik kübölügü", "Jogoruda atalgan makuldashuulardın asıldarı", "CA-6 forması"], ru: ["Удостоверение личности и свидетельство о собственности на участок", "Перечисленные выше согласования в оригинале", "Бланк CA-6"] },
    where: { en: "Architecture and Planning Department, City Hall: Monday and Wednesday, 14:00–17:00. In the districts, the district administration's architect.", ir: "Meriyanın arkhitektura jana shaar kurulushu bölümü: düyshömbü jana sharshembi, 14:00–17:00. Aymaktarda aymaktık administratsiyanın arkhitektoru.", ru: "Управление архитектуры и градостроительства мэрии: понедельник и среда, 14:00–17:00. В районах архитектор районной администрации." }
  };
  FLOWS.building = function (box) {
    box.innerHTML = flowForm("fbp", field("bpk", L(BP.kind), sel("bpk", opts(BP.kinds))) + field("bpd", L(BP.dist), sel("bpd", opts(DISTRICTS))) + chk("bph", L(BP.her)) + chk("bpb", L(BP.base)), L(BP.btn));
    onSub("fbp", function () {
      var k = $("#bpk").value, d = $("#bpd").value, A = BP.ap, list;
      if (k === "fence") list = [A.land, A.colour];
      else if (k === "garage") list = [A.land, A.design, A.nb];
      else if (k === "use") list = [A.bti, A.design, A.nb, A.fire, A.util];
      else { list = [A.land]; if (k !== "house") list.push(A.bti); list.push(A.seis); if (k === "storey") list.push(A.surv); list.push(A.design, A.nb, A.util, A.fire); }
      if ($("#bph").checked) list.push(A.her);
      if ($("#bpb").checked) list.push(A.base);
      list.push(A.tax);
      var link = '<a href="/procedure.html?id=build-storey">' + esc(L(BP.storeyLink)) + "</a>";
      result(refBox(C.ref, refNo(FCODES[d] + "-BP", k + d + $("#bph").checked + $("#bpb").checked), [[L(BP.kind), esc(L(pick(BP.kinds, k)))], [L(BP.dist), esc(L(pick(DISTRICTS, d)))], [L(C.fee), k === "fence" ? "—" : som(duty("building"))]]) + H4(BP.need) + "<ol>" + list.map(function (x) { return "<li>" + esc(L(x)) + "</li>"; }).join("") + "</ol><p>" + L(BP.guide, { a: link }) + "</p>" + P(BP.pre, "warn") + counterEnd("building", L(BP.docs), BP.where));
    });
  };
  HELP.building = {
    en: "<h3>Works that need no permit</h3><p>Repairs inside a flat or house that do not touch the walls, the roof or the services; a greenhouse; a fence inside the plot under 2 m. A fence on the street line always needs approval.</p><h3>Building without a permit</h3><p>A building put up without a permit is not entered in the technical passport, cannot be sold or inherited separately and may be ordered to be taken down at the owner's expense.</p>",
    ir: "<h3>Uruksat talap kılınbagan ishter</h3><p>Dubalga, chatırga je kommunikatsiyalarga tiybegen kvartira je üy ichindegi oñdoo; teplitsa; tilke ichindegi 2 mden tömön tosmo. Köchö boyundagı tosmo ar dayım makuldashuunu talap kılat.</p><h3>Uruksatsız kurulush</h3><p>Uruksatsız salıngan imarat tekhnikalık pasportko kirgizilbeyt, özünchö satılbayt je muras katarı kaltırılbayt jana eesinin esebinen buzulushu buyrulushu mümkün.</p>",
    ru: "<h3>Работы без разрешения</h3><p>Ремонт внутри квартиры или дома без затрагивания стен, кровли и коммуникаций; теплица; забор внутри участка ниже 2 м. Забор по красной линии всегда требует согласования.</p><h3>Самовольная постройка</h3><p>Постройка без разрешения не вносится в технический паспорт, не может быть отдельно продана или унаследована, и её могут обязать снести за счёт владельца.</p>"
  };

  /* passenger taxi licence */
  var TX = {
    city: { en: "City", ir: "Shaar", ru: "Город" },
    year: { en: "Vehicle's year of manufacture", ir: "Unaanın chıgarılgan jılı", ru: "Год выпуска автомобиля" },
    seats: { en: "Passenger seats", ir: "Jürgünchü orundar", ru: "Пассажирских мест" },
    btn: { en: "Check requirements", ir: "Talaptardı tekshirüü", ru: "Проверить требования" },
    old: { en: "The vehicle is more than 15 years old and cannot be licensed as a taxi.", ir: "Unaa 15 jıldan eski, anı taksi katarı litsenziyaloogo bolboyt.", ru: "Автомобилю больше 15 лет: лицензировать его как такси нельзя." },
    bus: { en: "A vehicle with more than eight passenger seats is a route bus, not a taxi. Route licences are issued by the Department of Infrastructure and Communications by tender.", ir: "Segizden ashık jürgünchü ordu bar unaa taksi emes, marshruttuk avtobus. Marshrut litsenziyaların Infrastruktura jana baylanısh departamenti tender arkıluu beret.", ru: "Автомобиль более чем с восемью пассажирскими местами является маршрутным автобусом, а не такси. Маршрутные лицензии выдаёт Департамент инфраструктуры и связи по конкурсу." },
    quota: { tl: { en: "The quota of taxi licences for Talas for {y} has been issued in full. Applications for {n} are accepted from 1 December.", ir: "Talas üchün {y}-jılkı taksi litsenziyalarının kvotası tolugu menen berildi. {n}-jılga arızdar 1-dekabrdan kabıl alınat.", ru: "Квота лицензий такси для Таласа на {y} год выдана полностью. Заявления на {n} год принимаются с 1 декабря." }, nz: { en: "Licences remaining in the Nurzhan quota for {y}: {k}.", ir: "Nurzhandın {y}-jılkı kvotasında kalgan litsenziyalar: {k}.", ru: "Остаток квоты лицензий Нуржана на {y} год: {k}." }, ij: { en: "Iyık Janyl has no quota. Taxis may not carry passengers up the Cathedral Hill road on 23 and 24 August.", ir: "Iyık Janylda kvota jok. 23 jana 24-avgustta taksilerge Chirköö döbösünün jolu menen jürgünchü tashuuga bolboyt.", ru: "В Ийык-Джаныле квоты нет. 23 и 24 августа такси не могут возить пассажиров по дороге на Соборный холм." } },
    req: { en: "Requirements", ir: "Talaptar", ru: "Требования" },
    reqs: { en: ["Roof sign and a chequered stripe on both sides, in yellow and black", "Taximeter calibrated and sealed by Iradstandart; the seal is renewed every year", "Iradstrakh passenger insurance in addition to the compulsory motor policy", "Driver with at least three years' driving experience and a medical check before each shift at a licensed medical point", "A parking place for the vehicle off the street, by lease or ownership"], ir: ["Chatırda belgi jana eki janında sarı-kara shakmattık tilke", "Iradstandart kalibrlegen jana möördögön taksometr; möör jıl sayın jañılanat", "Mildettüü avtopoliske koshumcha Iradstrakhtın jürgünchülördü kamsızdandıruusu", "Keminde üch jıl aydoo tajrıybası bar jana ar bir smenadan murun litsenziyası bar medpunktta tekshirilgen aydoochu", "Unaa üchün köchödön tıshkarı toktotuuchu jay, ijara je menchik boyuncha"], ru: ["Знак на крыше и шашечная полоса с обеих сторон, жёлто-чёрная", "Таксометр, поверенный и опломбированный «Ирадстандартом»; пломба обновляется ежегодно", "Страхование пассажиров в «Ирадстрахе» в дополнение к обязательному автополису", "Водитель со стажем не менее трёх лет и медосмотр перед каждой сменой в лицензированном медпункте", "Место стоянки вне улицы, в аренде или в собственности"] },
    docs: { en: ["The vehicle registration certificate and technical inspection certificate", "The taximeter's Iradstandart seal certificate", "Both insurance policies", "Registration as a sole trader or firm", "The receipt for the state duty", "Form DIC-3"], ir: ["Unaanın kattoo kübölügü jana tekhnikalık karoo kübölügü", "Taksometrdin Iradstandart möörü tuuraluu kübölük", "Eki kamsızdandıruu polisi", "Jeke ishker je firma katarı kattoo", "Mamlekettik alımdın kvitantsiyası", "DIC-3 forması"], ru: ["Свидетельство о регистрации ТС и талон техосмотра", "Свидетельство о пломбировании таксометра «Ирадстандартом»", "Оба страховых полиса", "Регистрация как ИП или фирма", "Квитанция об оплате госпошлины", "Бланк DIC-3"] },
    where: { en: "Department of Infrastructure and Communications, transport licensing counter, Liberty Boulevard 14, Talas: Monday to Wednesday, 9:00–12:00.", ir: "Infrastruktura jana baylanısh departamenti, transport litsenziyaloo terezesi, Erkindik bulvarı 14, Talas: düyshömbüdön sharshembige cheyin, 9:00–12:00.", ru: "Департамент инфраструктуры и связи, окно лицензирования транспорта, бульвар Свободы, 14, Талас: понедельник–среда, 9:00–12:00." }
  };
  FLOWS.taxi = function (box) {
    var Y = iradNow().getFullYear();
    box.innerHTML = flowForm("ftx", field("txc", L(TX.city), sel("txc", [["tl", L(EV.cities.tl)], ["nz", L(EV.cities.nz)], ["ij", L(EV.cities.ij)]])) + field("txy", L(TX.year), numIn("txy", 1960, Y)) + field("txs", L(TX.seats), numIn("txs", 1, 40)), L(TX.btn));
    onSub("ftx", function () {
      var y = intVal("txy"), s = intVal("txs"), c = $("#txc").value;
      if (!need("txy", function () { return y >= 1960 && y <= Y; })) return;
      if (!need("txs", function () { return s >= 1 && s <= 40; })) return;
      if (s > 8) { result(P(TX.bus, "warn")); return; }
      if (Y - y > 15) { result(P(TX.old, "warn")); return; }
      var q = P(TX.quota[c], c === "tl" ? "warn" : "ok", { y: Y, n: Y + 1, k: 3 + hash("tx" + Y) % 40 });
      result(q + kv([[L(TX.city), esc(L(EV.cities[c]))], [L(C.fee), esc(L(C.perYear, { a: som(duty("taxi")) }))]]) + H4(TX.req) + ul(L(TX.reqs)) + counterEnd("taxi", L(TX.docs), TX.where));
    });
  };
  HELP.taxi = {
    en: "<h3>Fares</h3><p>Fares are set by the taxi operator and shown on the taximeter. Fixed fares agreed in advance are allowed if written on the receipt. A taxi without a meter running is not a taxi; report it to the city police.</p><p><a href=\"/procedure.html?id=business-taxi\">Step-by-step: every permit to run a taxi →</a></p>",
    ir: "<h3>Tarifter</h3><p>Tarifterdi taksi ishkanası belgileyt jana alar taksometrde körsötülöt. Aldın ala makuldashılgan turuktuu baa chekte jazılsa uruksat. Taksometri ishtebegen taksi taksi emes; al tuuraluu shaar politsiyasına kabarlañız.</p><p><a href=\"/procedure.html?id=business-taxi\">Kadam-kadam: taksi jürgüzüü üchün bardık uruksattar →</a></p>",
    ru: "<h3>Тарифы</h3><p>Тарифы устанавливает перевозчик, они отображаются на таксометре. Фиксированная цена, согласованная заранее, допускается, если указана в чеке. Такси без включённого таксометра такси не является; сообщите о нём в городскую полицию.</p><p><a href=\"/procedure.html?id=business-taxi\">Пошагово: все разрешения для работы такси →</a></p>"
  };

  /* alcohol licence */
  var AL = {
    kind: { en: "Type of business", ir: "Ishkananın türü", ru: "Вид деятельности" },
    kinds: [["shop", { en: "Shop (retail)", ir: "Dükön (chekene)", ru: "Магазин (розница)" }, 3000], ["cafe", { en: "Café, bar or restaurant", ir: "Kafe, bar je restoran", ru: "Кафе, бар или ресторан" }, 2000], ["whole", { en: "Wholesale", ir: "Kötörmö sooda", ru: "Оптовая торговля" }, 9000], ["prod", { en: "Production", ir: "Öndürüsh", ru: "Производство" }, 0], ["kymyz", { en: "Kymyz stand", ir: "Kımız satuuchu jay", ru: "Точка продажи кымыза" }, 0]],
    city: { en: "District or city", ir: "Aymak je shaar", ru: "Район или город" },
    near: { en: "The premises are within 100 m of a school, kindergarten or place of worship", ir: "Jay mektepten, baldar bakchasınan je sıyınuu jayınan 100 m aralıkta", ru: "Помещение находится в пределах 100 м от школы, детского сада или места богослужения" },
    reg: { en: "The business is on the Register of Firms", ir: "Ishkana Firmalar reestrinde bar", ru: "Предприятие внесено в Реестр фирм" },
    btn: { en: "Check eligibility", ir: "Ukuktu tekshirüü", ru: "Проверить возможность" },
    kymyz: { en: "Kymyz with less than 2.5% alcohol (IST 7-97) is not an alcoholic beverage for licensing, so no licence is needed. A roadside stand has its own procedure in the step-by-step guide.", ir: "Spirti 2,5%dan az kımız (IST 7-97) litsenziyaloo üchün alkogoldük ichimdik emes, oshonduktan litsenziya kerek emes. Jol boyundagı satuu jayının tartibi kadam-kadam jetekchide özünchö jazılgan.", ru: "Кымыз крепостью менее 2,5% (IST 7-97) для лицензирования не считается алкогольным напитком, поэтому лицензия не нужна. Для придорожной точки в пошаговом руководстве есть своя процедура." },
    prod: { en: "Licences for production are issued by the Licensing Division only after Iradstandart has certified the product and the State Fire Inspectorate has approved the premises. Ask for an appointment at the Division.", ir: "Öndürüsh litsenziyaları Iradstandart tovardı sertifikattagandan jana Mamlekettik ört inspektsiyası jaydı makuldagandan kiyin gana berilet. Bölümgö kabıl aluuga jazılıñız.", ru: "Лицензии на производство выдаются Отделом лицензирования только после сертификации продукции «Ирадстандартом» и согласования помещения Государственной пожарной инспекцией. Запишитесь на приём в Отдел." },
    near100: { en: "A licence is not issued for premises within 100 m of a school, kindergarten or place of worship, measured along the shortest walking route from door to door.", ir: "Mektepten, baldar bakchasınan je sıyınuu jayınan 100 m aralıktagı jayga litsenziya berilbeyt; aralık eshikten eshikke cheyin eñ kıska jöö jol menen ölchönöt.", ru: "Лицензия не выдаётся для помещений в пределах 100 м от школы, детского сада или места богослужения; расстояние измеряется по кратчайшему пешеходному пути от двери до двери." },
    noReg: { en: "Register the business first: a licence is issued only to a sole trader or firm on the Register of Firms.", ir: "Adegende ishkanany kattañız: litsenziya Firmalar reestrindegi jeke ishkerge je firmaga gana berilet.", ru: "Сначала зарегистрируйте предприятие: лицензия выдаётся только ИП или фирме из Реестра фирм." },
    ok: { en: "On these answers, a licence can be applied for.", ir: "Bul jooptor boyuncha litsenziyaga arız berse bolot.", ru: "По этим ответам можно подать заявление на лицензию." },
    hours: { en: "Licensed premises may not sell alcoholic beverages between 23:00 and 8:00, or to persons under 21. A licence is issued for one to five years, at the annual fee for each year.", ir: "Litsenziyası bar jaylarda 23:00dön 8:00gö cheyin je 21 jashka tolo elekterge alkogoldük ichimdik satuuga bolboyt. Litsenziya birden besh jılga cheyin berilet, ar jılga jıldık akı tölönöt.", ru: "Лицензированные заведения не продают алкоголь с 23:00 до 8:00 и лицам до 21 года. Лицензия выдаётся на срок от одного до пяти лет с ежегодной платой за каждый год." },
    docs: { en: ["The extract from the Register of Firms", "The lease or ownership certificate of the premises", "The sanitary certificate of the city health inspectorate", "The fire-safety approval of the premises", "A plan of the premises showing the storage area", "Form ME-17"], ir: ["Firmalar reestrinen köchürmö", "Jaydın ijara kelishimi je menchik kübölügü", "Shaardık sanitardık inspektsiyanın kübölügü", "Jaydın ört koopsuzdugu boyuncha makulduk", "Saktoo jayı körsötülgön jaydın planı", "ME-17 forması"], ru: ["Выписка из Реестра фирм", "Договор аренды или свидетельство о собственности на помещение", "Санитарное заключение городской санинспекции", "Согласование пожарной безопасности помещения", "План помещения с местом хранения", "Бланк ME-17"] },
    where: { en: "Licensing Division, Ministry of Economy, Talas: Tuesday and Thursday, 9:00–12:00.", ir: "Ekonomika ministrliginin Litsenziyaloo bölümü, Talas: sheyshembi jana beyshembi, 9:00–12:00.", ru: "Отдел лицензирования Министерства экономики, Талас: вторник и четверг, 9:00–12:00." }
  };
  FLOWS.alcohol = function (box) {
    box.innerHTML = flowForm("fal", field("alk", L(AL.kind), sel("alk", AL.kinds.map(function (k) { return [k[0], L(k[1])]; }))) + field("ald", L(AL.city), sel("ald", opts(DISTRICTS))) + chk("aln", L(AL.near)) + chk("alr", L(AL.reg)), L(AL.btn));
    onSub("fal", function () {
      var k = $("#alk").value, row = AL.kinds.filter(function (x) { return x[0] === k; })[0];
      if (k === "kymyz") { result('<p class="ok">' + esc(L(AL.kymyz)) + ' <a href="/procedure.html?id=food-kymyz">→</a></p>'); return; }
      if ($("#aln").checked) { result(P(AL.near100, "warn")); return; }
      if (!$("#alr").checked) { result(P(AL.noReg, "warn") + "<p>" + svcLink("business") + "</p>"); return; }
      if (k === "prod") { result(P(AL.prod, "warn") + formBox("alcohol")); return; }
      result(P(AL.ok, "ok") + kv([[L(AL.kind), esc(L(row[1]))], [L(C.fee), esc(L(C.perYear, { a: som(row[2]) }))]]) + P(AL.hours) + counterEnd("alcohol", L(AL.docs), AL.where));
    });
  };
  HELP.alcohol = {
    en: "<h3>Events</h3><p>Alcoholic beverages may be sold at a concert, fair or festival only by a licence holder named in the event permit. A licence for a shop or café does not cover a stall outside it.</p>",
    ir: "<h3>Ish-charalar</h3><p>Konsertte, yarmarkada je festivalda alkogoldük ichimdikterdi ish-chara uruksatında atalgan litsenziya eesi gana sata alat. Düköndün je kafenin litsenziyası anın sırtındagı satuu jayına jaybayt.</p>",
    ru: "<h3>Мероприятия</h3><p>На концерте, ярмарке или фестивале продавать алкоголь может только владелец лицензии, указанный в разрешении на мероприятие. Лицензия магазина или кафе не распространяется на точку вне помещения.</p>"
  };

  /* outdoor sign permit and spelling check */
  var SG = {
    text: { en: "Text of the sign", ir: "Tabelanın teksti", ru: "Текст вывески" },
    city: { en: "District or city", ir: "Aymak je shaar", ru: "Район или город" },
    area: { en: "Area of the sign, m²", ir: "Tabelanın ayantı, m²", ru: "Площадь вывески, м²" },
    lit: { en: "The sign is illuminated", ir: "Tabela jarıktandırılgan", ru: "Вывеска с подсветкой" },
    btn: { en: "Check the sign", ir: "Tabelanı tekshirüü", ru: "Проверить вывеску" },
    asIs: { en: "Text as submitted", ir: "Berilgen tekst", ru: "Текст в заявке" },
    cyr: { en: "The text contains Cyrillic letters. Iradi is written in the Latin alphabet. A Russian text may be placed below the Iradi text, in letters no larger than the Iradi ones.", ir: "Tekstte kirill tamgaları bar. Irad tili latın alfavitinde jazılat. Orus tilindegi tekst irad tekstinin astına, irad tamgalarınan choñ emes tamgalar menen jazılsa bolot.", ru: "В тексте есть кириллические буквы. Ирадский язык пишется латиницей. Русский текст можно разместить под ирадским, буквами не крупнее ирадских." },
    letters: { en: "The text contains letters that are not in the Iradi alphabet: {l}. Write the sound as Iradi spells it (for example K for Q, V for W).", ir: "Tekstte irad alfavitinde jok tamgalar bar: {l}. Ündü irad tilinde jazılganday jazıñız (mısalı, Q orduna K, W orduna V).", ru: "В тексте есть буквы, которых нет в ирадском алфавите: {l}. Пишите звук так, как его пишет ирадский язык (например, K вместо Q, V вместо W)." },
    eng: { en: "The text appears to be in English only. An Iradi text is required; an English text may be added in letters no larger than the Iradi ones.", ir: "Tekst anglis tilinde gana okshoyt. Irad tilindegi tekst mildettüü; anglis tilindegi tekstti irad tamgalarınan choñ emes tamgalar menen koshso bolot.", ru: "Похоже, текст только на английском. Ирадский текст обязателен; английский можно добавить буквами не крупнее ирадских." },
    pass: { en: "No errors were found by the automatic check. The final check is made by the Toponymic Section of the State Archives at its window (Tuesday, 10:00–11:30); the Section's stamp is required on the design of the sign.", ir: "Avtomattık tekshirüü kata tapkan jok. Akırkı tekshirüünü Mamlekettik arkhivdin Toponimika bölümü öz terezesinde jürgüzöt (sheyshembi, 10:00–11:30); tabelanın eskizinde bölümdün möörü bolushu kerek.", ru: "Автоматическая проверка ошибок не нашла. Окончательную проверку проводит Топонимический отдел Государственного архива в своём окне (вторник, 10:00–11:30); на эскизе вывески нужна печать отдела." },
    print: { en: "Under Department of Public Information Regulation No. 12 a signboard is printed matter: it must be made by a sign workshop registered with the Department of Public Information, whose registration number appears in the lower right corner of the sign.", ir: "KMDnin № 12 jobosu boyuncha tabela basma buyum bolup eseptelet: anı Kogomduk maalımat departamentinde kattalgan ustakana jasashı kerek, al ustakananın kattoo nomeri tabelanın tömönkü oñ burchunda körsötülöt.", ru: "Согласно Положению ДОИ № 12 вывеска является печатной продукцией: её должна изготовить мастерская, зарегистрированная в Департаменте общественной информации, с регистрационным номером в правом нижнем углу вывески." },
    place: { en: "Annual placement fee", ir: "Jıldık jaygashtıruu akısı", ru: "Ежегодная плата за размещение" },
    litNote: { en: "An illuminated sign also needs Iradenergo's technical conditions for connection.", ir: "Jarıktandırılgan tabela üchün Iradenergonun koshuu boyuncha tekhnikalık shartarı da kerek.", ru: "Для вывески с подсветкой нужны также технические условия «Ирадэнерго» на подключение." },
    docs: { en: ["The design of the sign in colour, with dimensions, stamped by the Toponymic Section", "A photograph of the façade with the place of the sign marked", "The owner's consent if you do not own the building", "Form CH-44"], ir: ["Toponimika bölümü möör baskan, ölchömdörü menen tabelanın tüstüü eskizi", "Tabelanın ordu belgilengen fasaddın sürötü", "Imarat siziñ menchigiñiz bolboso, eesinin makulduguu", "CH-44 forması"], ru: ["Цветной эскиз вывески с размерами и печатью Топонимического отдела", "Фотография фасада с отмеченным местом вывески", "Согласие владельца, если здание не ваше", "Бланк CH-44"] },
    where: { en: "The city hall's outdoor advertising counter, or the district administration.", ir: "Meriyanın tıshkı jarnama terezesi je aymaktık administratsiya.", ru: "Окно наружной рекламы мэрии или районная администрация." }
  };
  FLOWS.sign = function (box) {
    box.innerHTML = flowForm("fsg", field("sgt", L(SG.text), inp("sgt", "", ' maxlength="80"')) + field("sgd", L(SG.city), sel("sgd", opts(DISTRICTS))) + field("sga", L(SG.area), numIn("sga", 1, 200)) + chk("sgl", L(SG.lit)), L(SG.btn));
    onSub("fsg", function () {
      if (!need("sgt")) return;
      var a = intVal("sga"); if (!need("sga", function () { return a >= 1 && a <= 200; })) return;
      var tx = $("#sgt").value.trim(), up = caps(tx), msgs = [];
      if (/[Ѐ-ӿ]/.test(tx)) msgs.push(P(SG.cyr, "warn"));
      var bad = (up.match(/[QWXĞŞÇÄƏ]/g) || []).filter(function (c, i, s) { return s.indexOf(c) === i; });
      if (bad.length) msgs.push(P(SG.letters, "warn", { l: bad.join(", ") }));
      if (!msgs.length && /\b(SHOP|STORE|CAFE|CAFÉ|MARKET|HOTEL|SERVICE|RESTAURANT|BEAUTY|CENTER|CENTRE|BAR|PIZZA|AUTO PARTS)\b/.test(up) && !/[ÖÜÑ]/.test(up)) msgs.push(P(SG.eng, "warn"));
      if (!msgs.length) msgs.push(P(SG.pass, "ok"));
      result('<div class="ticket"><div class="tno"><span>' + esc(L(SG.asIs)) + "</span><b>" + esc(up) + "</b></div>" + kv([[L(C.fee), som(duty("sign"))], [L(SG.place), esc(L(C.perYear, { a: som(40 * a) }))]]) + "</div>" + msgs.join("") + P(SG.print) + ($("#sgl").checked ? P(SG.litNote) : "") + counterEnd("sign", L(SG.docs), SG.where));
    });
  };
  HELP.sign = {
    en: "<h3>Why the State Archives?</h3><p>Shop signs, like street names and place names, are checked for correct Iradi by the Toponymic Section of the State Archives under the Toponymic Heritage Statute of 1993. Registered trademarks may be shown as registered, with an Iradi description of the business beside them.</p>",
    ir: "<h3>Emne üchün Mamlekettik arkhiv?</h3><p>Dükön tabelaları köchö jana jer attarı sıyaktuu ele 1993-jılkı Toponimikalık muras jönündögü statut boyuncha Mamlekettik arkhivdin Toponimika bölümündö irad tilinin tuuralıgı boyuncha tekshirilet. Kattalgan sooda belgileri kattalganday körsötülüp, janında ishkananın irad tilindegi süröttömösü jazılsa bolot.</p>",
    ru: "<h3>Почему Государственный архив?</h3><p>Вывески, как и названия улиц и населённых пунктов, проверяются на правильность ирадского языка Топонимическим отделом Государственного архива согласно Статуту о топонимическом наследии 1993 года. Зарегистрированные товарные знаки можно указывать как зарегистрированы, рядом с описанием деятельности на ирадском языке.</p>"
  };

  /* foreign trade participant */
  var FT = {
    firm: { en: "Registration number on the Register of Firms", ir: "Firmalar reestrindegi kattoo nomeri", ru: "Регистрационный номер в Реестре фирм" },
    op: { en: "Operations", ir: "Operatsiyalar", ru: "Операции" },
    ops: [["imp", { en: "Import", ir: "Import", ru: "Импорт" }], ["exp", { en: "Export", ir: "Eksport", ru: "Экспорт" }], ["both", { en: "Import and export", ir: "Import jana eksport", ru: "Импорт и экспорт" }]],
    cur: { en: "Currency of contracts", ir: "Kelishimderdin valyutası", ru: "Валюта контрактов" },
    curs: [["usd", { en: "US dollars", ir: "AKSh dolları", ru: "Доллары США" }], ["kzt", { en: "Kazakh tenge", ir: "Kazak teñgesi", ru: "Казахстанский тенге" }], ["som", { en: "Som", ir: "Som", ru: "Сомы" }], ["oth", { en: "Another currency", ir: "Bashka valyuta", ru: "Другая валюта" }]],
    btn: { en: "Prepare registration card", ir: "Kattoo kartasın dayardoo", ru: "Подготовить регистрационную карточку" },
    card: { en: "Registration card reference", ir: "Kattoo kartasının nomeri", ru: "Номер регистрационной карточки" },
    how: { en: "Under the Foreign Trade Escrow Act 1994 every foreign trade contract is registered with the Authority. The foreign party pays into an escrow account at Talasbank; the Authority deducts the royalty of 0.5% and releases the balance when the goods have crossed the frontier and the customs declaration has been closed.", ir: "1994-jılkı Tashkı sooda eskrou jönündögü mıyzam boyuncha ar bir tashkı sooda kelishimi Organda kattalat. Chet eldik tarap Talasbanktagı eskrou esebine tölöyt; Organ 0,5% royaltini karmap, tovar chek aradan ötüp, bajı deklaratsiyası jabılgandan kiyin kalganın boshotot.", ru: "Согласно Закону об эскроу во внешней торговле 1994 года каждый внешнеторговый контракт регистрируется в Органе. Иностранная сторона платит на эскроу-счёт в «Таласбанке»; Орган удерживает роялти 0,5% и высвобождает остаток после пересечения товаром границы и закрытия таможенной декларации." },
    fee: { en: "Registration of each contract", ir: "Ar bir kelishimdi kattoo", ru: "Регистрация каждого контракта" },
    roy: { en: "Royalty deducted from escrow", ir: "Eskroudon karmaluuchu royalti", ru: "Роялти, удерживаемое с эскроу" },
    oth: { en: "Escrow accounts are opened in US dollars, Kazakh tenge and som only. A contract in another currency is registered at its value in dollars at the Bank of Irad's official rate on the day of registration, and paid in dollars.", ir: "Eskrou esepteri AKSh dollarında, kazak teñgesinde jana somdo gana achılat. Bashka valyutadagı kelishim kattalgan kündögü Irad Bankının rasmiy kursu boyuncha dollardagı narkı menen kattalat jana dollar menen tölönöt.", ru: "Эскроу-счета открываются только в долларах США, тенге и сомах. Контракт в другой валюте регистрируется по стоимости в долларах по официальному курсу Банка Ирада на день регистрации и оплачивается в долларах." },
    census: { en: "The Authority asks for a current extract from the Register of Firms. Until 30 November 2026 the Register issues extracts only on presentation of the 2026 census slip.", ir: "Organ Firmalar reestrinen jañı köchürmönü talap kılat. 2026-jıldın 30-noyabrına cheyin reestr köchürmönü 2026-jılkı sanak kagazın körsötköndö gana beret.", ru: "Орган требует свежую выписку из Реестра фирм. До 30 ноября 2026 года Реестр выдаёт выписки только при предъявлении листа переписи 2026 года." },
    docs: { en: ["The extract from the Register of Firms, not older than 30 days", "The director's ID card and the board's decision appointing him or her", "A specimen of the firm's seal and of the director's signature, certified by Talasbank", "Form FTE-2"], ir: ["Firmalar reestrinen 30 kündön eski emes köchürmö", "Jetekchinin jeke kuböölügü jana anı dayındoo tuuraluu baskarmanın chechimi", "Talasbank tastıktagan firmanın möörünün jana jetekchinin kolunun ülgüsü", "FTE-2 forması"], ru: ["Выписка из Реестра фирм не старше 30 дней", "Удостоверение личности руководителя и решение правления о его назначении", "Образцы печати фирмы и подписи руководителя, заверенные «Таласбанком»", "Бланк FTE-2"] },
    where: { en: "Irad Foreign Trade Escrow Authority, Talasbank head office, sixth floor, Talas: Monday to Thursday, 9:00–12:30.", ir: "Irad tashkı sooda eskrou organı, Talasbanktın bashkı keñsesi, altınchı kabat, Talas: düyshömbüdön beyshembige cheyin, 9:00–12:30.", ru: "Ирадский орган внешнеторгового эскроу, головной офис «Таласбанка», шестой этаж, Талас: понедельник–четверг, 9:00–12:30." }
  };
  FLOWS.trader = function (box) {
    box.innerHTML = flowForm("fft", field("ftf", L(FT.firm), inp("ftf", "TL-19-004517", ' maxlength="14" style="text-transform:uppercase"')) + field("fto", L(FT.op), sel("fto", opts(FT.ops))) + field("ftc", L(FT.cur), sel("ftc", opts(FT.curs))), L(FT.btn));
    onSub("fft", function () {
      var n = norm($("#ftf").value);
      if (!need("ftf", function () { return /^[A-Z]{2}\d{8}$/.test(n); })) { $("#ftf-err").textContent = L(C.numBad, { e: "TL-19-004517" }); return; }
      var c = $("#ftc").value, o = $("#fto").value;
      result(refBox(FT.card, "FTE-" + yy() + "-" + pad5(hash("ft" + n + o) % 100000), [[L(FT.firm), esc(n.slice(0, 2) + "-" + n.slice(2, 4) + "-" + n.slice(4))], [L(FT.op), esc(L(pick(FT.ops, o)))], [L(FT.fee), som(200)], [L(FT.roy), "0.5%"]]) + P(FT.how) + (c === "oth" ? P(FT.oth, "warn") : "") + P(FT.census, "tiny") + counterEnd("trader", L(FT.docs), FT.where));
    });
  };
  HELP.trader = {
    en: "<h3>Who must register?</h3><p>Every firm that imports or exports goods under a contract with a foreign party, including sole traders. Goods sent by post for personal use and the purchases of travellers at the crossings are not foreign trade.</p><p>The step-by-step guide shows where escrow registration falls in an export: see Export walnuts.</p>",
    ir: "<h3>Kim kattalıshı kerek?</h3><p>Chet eldik tarap menen kelishim boyuncha tovar import je eksport kılgan ar bir firma, anın ichinde jeke ishkerler. Jeke paydalanuu üchün pochta menen jönötülgön tovarlar jana joloochulardın ötkööldögü satıp aluuları tashkı sooda emes.</p><p>Eskrou kattoosu eksporttun kaysı kadamında ekenin kadam-kadam jetekchi körsötöt: Jangak eksportu.</p>",
    ru: "<h3>Кто обязан регистрироваться?</h3><p>Каждая фирма, ввозящая или вывозящая товары по контракту с иностранной стороной, включая ИП. Отправления по почте для личного пользования и покупки путешественников на переходах внешней торговлей не являются.</p><p>Где в экспорте находится регистрация эскроу, показывает пошаговое руководство: «Экспорт грецких орехов».</p>"
  };

  /* hunting and fishing licence */
  var HU = {
    kind: { en: "Licence", ir: "Litsenziya", ru: "Лицензия" },
    kinds: [["fday", { en: "Fishing, one day", ir: "Balık uuloo, bir kün", ru: "Рыбалка, один день" }, 10], ["fseason", { en: "Fishing, calendar year", ir: "Balık uuloo, kalendardık jıl", ru: "Рыбалка, календарный год" }, 80], ["small", { en: "Small game (hare, partridge, pheasant)", ir: "Mayda añ (koyon, kekilik, kırgool)", ru: "Мелкая дичь (заяц, куропатка, фазан)" }, 120], ["water", { en: "Waterfowl", ir: "Suu kushtarı", ru: "Водоплавающая дичь" }, 100], ["big", { en: "Wild boar (allocated by draw)", ir: "Kaban (chüchü kut menen bölünöt)", ru: "Кабан (по жеребьёвке)" }, 900]],
    dist: { en: "District", ir: "Aymak", ru: "Район" },
    btn: { en: "Check the rules", ir: "Erejelerdi tekshirüü", ru: "Проверить правила" },
    season: { en: "Season", ir: "Mezgil", ru: "Сезон" },
    seasons: { fday: { en: "All year except 1 April–31 May (spawning)", ir: "1-apreldin 31-mayga cheyinkiden (urukttoo) tıshkarı jıl boyu", ru: "Круглый год, кроме 1 апреля–31 мая (нерест)" }, fseason: { en: "All year except 1 April–31 May (spawning)", ir: "1-apreldin 31-mayga cheyinkiden (urukttoo) tıshkarı jıl boyu", ru: "Круглый год, кроме 1 апреля–31 мая (нерест)" }, small: { en: "1 October–31 January", ir: "1-oktyabr–31-yanvar", ru: "1 октября–31 января" }, water: { en: "15 August–15 December", ir: "15-avgust–15-dekabr", ru: "15 августа–15 декабря" }, big: { en: "1 November–31 December; draw in March", ir: "1-noyabr–31-dekabr; chüchü kut martta", ru: "1 ноября–31 декабря; жеребьёвка в марте" } },
    gun: { en: "Hunting licences are issued only to holders of a hunter's certificate (examination at the Section, twice a year) and a firearm permit of the Ministry of Internal Security.", ir: "Añchılık litsenziyaları añchının kübölügü (Bölümdögü sınak, jılına eki jolu) jana Ichki koopsuzduk ministrliginin kuralga uruksatı bargandarga gana berilet.", ru: "Охотничьи лицензии выдаются только при наличии удостоверения охотника (экзамен в Отделе дважды в год) и разрешения Министерства внутренней безопасности на оружие." },
    line: { en: "Hunting is prohibited within 12 km of the Qara-Chik line, where weapons may not be carried.", ir: "Kara-Chik liniyasınan 12 km aralıkta añchılık kıluuga tıyuu salınat, al jerde kural kötörüügö bolboyt.", ru: "Охота запрещена ближе 12 км от линии Кара-Чик, где ношение оружия запрещено." },
    dam: { en: "Fishing is prohibited in the security zone of the Toktogul dam and in the reservoir within 2 km of it. Ask the zone office at Kara-Köl for the boundary.", ir: "Toktogul dambasının koopsuzduk zonasında jana andan 2 km aralıktagı suu saktagıchta balık uuloogo bolboyt. Chek aranı Kara-Köldögü zonanın keñsesinen surañız.", ru: "Рыбалка запрещена в охранной зоне Токтогульской плотины и в водохранилище ближе 2 км от неё. Границу уточняйте в офисе зоны в Кара-Кёле." },
    draw: { en: "Wild boar licences for {y} are allocated by draw in March among applications received by 28 February. Applicants not drawn are refunded at the Section's cash desk.", ir: "{y}-jılkı kaban litsenziyaları 28-fevralga cheyin kelgen arızdardın arasında martta chüchü kut menen bölünöt. Utpagandarga akcha Bölümdün kassasında kaytarılat.", ru: "Лицензии на кабана на {y} год распределяются жеребьёвкой в марте среди заявлений, поданных до 28 февраля. Не прошедшим жеребьёвку деньги возвращаются в кассе Отдела." },
    day: { en: "Day fishing licences are sold at the Section's office, from 8:00 on the day.", ir: "Bir kündük balık uuloo litsenziyaları Bölümdün keñsesinde, oshol künü 8:00dön tartip satılat.", ru: "Дневные лицензии на рыбалку продаются в офисе Отдела с 8:00 в тот же день." },
    docs: { en: ["Your ID card", "For hunting: the hunter's certificate and the firearm permit", "Form AGR-11"], ir: ["Jeke kuböölügüñüz", "Añchılık üchün: añchının kübölügü jana kuralga uruksat", "AGR-11 forması"], ru: ["Удостоверение личности", "Для охоты: удостоверение охотника и разрешение на оружие", "Бланк AGR-11"] },
    where: { en: "Hunting and Fisheries Section, Talas Basin Agricultural Directorate, Talas: Monday to Friday, 9:00–13:00.", ir: "Talas basseyninin aylı charba direktsiyası, Añchılık jana balık charba bölümü, Talas: düyshömbüdön jumaga cheyin, 9:00–13:00.", ru: "Отдел охоты и рыболовства Таласского бассейнового управления сельского хозяйства, Талас: понедельник–пятница, 9:00–13:00." }
  };
  FLOWS.hunting = function (box) {
    box.innerHTML = flowForm("fhu", field("huk", L(HU.kind), sel("huk", HU.kinds.map(function (k) { return [k[0], L(k[1])]; }))) + field("hud", L(HU.dist), sel("hud", opts(DISTRICTS.slice(3)))), L(HU.btn));
    onSub("fhu", function () {
      var k = $("#huk").value, d = $("#hud").value, row = HU.kinds.filter(function (x) { return x[0] === k; })[0], fish = k.charAt(0) === "f", Y = iradNow().getFullYear();
      var notes = (fish ? "" : P(HU.gun)) + (!fish && (d === "kb" || d === "td" || d === "ln") ? P(HU.line, "warn") : "") + (fish && (d === "tok" || d === "ln") ? P(HU.dam, "warn") : "") + (k === "big" ? P(HU.draw, "", { y: Y + 1 }) : "") + (k === "fday" ? P(HU.day, "ok") : "");
      result(kv([[L(HU.kind), esc(L(row[1]))], [L(HU.season), esc(L(HU.seasons[k]))], [L({ en: "Fee", ir: "Akısı", ru: "Плата" }), som(row[2])]]) + notes + (k === "fday" ? formBox("hunting") : counterEnd("hunting", L(HU.docs), HU.where)));
    });
  };
  HELP.hunting = {
    en: "<h3>Bag limits</h3><p>Bag limits for each season are printed on the back of the licence. Game taken is entered on the licence on the day; the licence is returned to the Section within ten days of the end of the season.</p><h3>Protected species</h3><p>Snow leopard, argali, Menzbier's marmot and the birds of prey may not be hunted anywhere in Irad.</p>",
    ir: "<h3>Chekter</h3><p>Ar bir mezgildin chekteri litsenziyanın artında basılgan. Atılgan añ oshol künü litsenziyaga jazılat; litsenziya mezgil bütköndön kiyin on kündün ichinde Bölümgö kaytarılat.</p><h3>Korgoluuchu türlör</h3><p>Ilbirs, arkar, Menzbir suuru jana jırtkıch kushtardı Iraddın ech bir jerinde atuuga bolboyt.</p>",
    ru: "<h3>Нормы добычи</h3><p>Нормы добычи на сезон напечатаны на обороте лицензии. Добыча вносится в лицензию в тот же день; лицензия возвращается в Отдел в течение десяти дней после окончания сезона.</p><h3>Охраняемые виды</h3><p>Снежный барс, архар, сурок Мензбира и хищные птицы охоте не подлежат нигде в Ираде.</p>"
  };

  /* notification of a public gathering */
  var GA = {
    city: { en: "City", ir: "Shaar", ru: "Город" },
    date: { en: "Date of the gathering", ir: "Chogulushtun künü", ru: "Дата собрания" },
    num: { en: "Expected number of participants", ir: "Kütülgön katıshuuchular", ru: "Ожидаемое число участников" },
    place: { en: "Place", ir: "Jeri", ru: "Место" },
    places: [["des", { en: "A designated place listed by the city council", ir: "Shaar keñeshi belgilegen jer", ru: "Специально отведённое место из перечня горсовета" }], ["oth", { en: "Another place", ir: "Bashka jer", ru: "Другое место" }]],
    sound: { en: "Amplified sound will be used", ir: "Kücheytilgen ün koldonulat", ru: "Будет использоваться звукоусиление" },
    btn: { en: "Prepare notification", ir: "Kabarlamanı dayardoo", ru: "Подготовить уведомление" },
    late: { en: "A notification must be lodged at least ten days before the gathering. The earliest date that can be notified today is {d}.", ir: "Kabarlama chogulushtan keminde on kün murun berilishi kerek. Bügün kabarloogo boluuchu eñ erte kün: {d}.", ru: "Уведомление подаётся не позднее чем за десять дней до собрания. Самая ранняя дата, о которой можно уведомить сегодня: {d}." },
    ok: { en: "The notification can be lodged in time.", ir: "Kabarlamanı öz ubaktısında berüügö bolot.", ru: "Уведомление можно подать в срок." },
    oth: { en: "For a place that is not designated, the city may propose a designated place or another time within three working days. If it does not, the gathering may be held as notified.", ir: "Belgilenbegen jer üchün shaar üch ish kündün ichinde belgilengen jerdi je bashka ubakıttı sunushu mümkün. Sunushpasa, chogulush kabarlanganday ötkörülsö bolot.", ru: "Для неотведённого места город в течение трёх рабочих дней может предложить отведённое место или другое время. Если не предложит, собрание может пройти как заявлено." },
    big: { en: "A gathering of more than 500 people is also an event: apply for an event permit as well.", ir: "500dön ashık kishilik chogulush ish-chara da bolup eseptelet: ish-charaga uruksatka da arız beriñiz.", ru: "Собрание более чем на 500 человек является также мероприятием: подайте также заявку на разрешение на мероприятие." },
    rulesH: { en: "Rules for the organiser", ir: "Uyushturuuchu üchün erejeler", ru: "Правила для организатора" },
    rules: { en: ["Gatherings are held between 9:00 and 20:00", "Amplified sound until 20:00, and not within 50 m of a hospital, a school in session or a place of worship during a service", "Roads and pavements are kept open for traffic and pedestrians", "One steward with an armband for every 50 participants", "The organiser is liable for damage caused by the gathering; Tazalık cleans the place afterwards and invoices the organiser"], ir: ["Chogulushtar 9:00dön 20:00gö cheyin ötkörülöt", "Kücheytilgen ün 20:00gö cheyin, ooruukanadan, sabak jürüp jatkan mektepten je kızmat jürüp jatkan sıyınuu jayınan 50 m aralıkta emes", "Joldor jana jöö jürüüchü joldor unaa jana jöölör üchün achık kaladı", "Ar 50 katıshuuchuga jeñine tañgıch takkan bir tartip saktoochu", "Uyushturuuchu chogulush keltirgen zıyan üchün joop beret; Tazalık jerdi kiyin tazalap, uyushturuuchuga esep jiberet"], ru: ["Собрания проводятся с 9:00 до 20:00", "Звукоусиление до 20:00 и не ближе 50 м от больницы, школы во время занятий или места богослужения во время службы", "Проезжая часть и тротуары остаются открытыми для транспорта и пешеходов", "Один распорядитель с повязкой на каждые 50 участников", "Организатор отвечает за ущерб, причинённый собранием; «Тазалык» убирает место после собрания и выставляет счёт организатору"] },
    no: { en: "No notification is needed for religious services in places of worship, weddings, funerals, memorial meals or spectators at sports events.", ir: "Sıyınuu jaylarındagı dinij kızmattar, toylor, sööktöö, eskerüü ash jana sport ish-charalarındagı köruüchülör üchün kabarlama kerek emes.", ru: "Уведомление не требуется для богослужений в местах богослужения, свадеб, похорон, поминок и зрителей спортивных мероприятий." },
    docs: { en: ["The organiser's ID card, or the registration of the organising body", "A plan of the place or route", "The names of the stewards", "Form CH-50"], ir: ["Uyushturuuchunun jeke kuböölügü je uyushturuuchu mekemenin kattoosu", "Jerdin je marshruttun planı", "Tartip saktoochulardın attarı", "CH-50 forması"], ru: ["Удостоверение организатора или регистрация организующей структуры", "План места или маршрута", "Имена распорядителей", "Бланк CH-50"] },
    where: { en: "The city hall's reception, Monday to Friday, 9:00–17:00.", ir: "Meriyanın kabıl aluu bölümü, düyshömbüdön jumaga cheyin, 9:00–17:00.", ru: "Приёмная мэрии, понедельник–пятница, 9:00–17:00." }
  };
  FLOWS.gathering = function (box) {
    box.innerHTML = flowForm("fga", field("gac", L(GA.city), sel("gac", [["tl", L(EV.cities.tl)], ["nz", L(EV.cities.nz)], ["ij", L(EV.cities.ij)]])) + field("gad", L(GA.date), dateIn("gad")) + field("gan", L(GA.num), numIn("gan", 1, 100000)) + field("gap", L(GA.place), sel("gap", opts(GA.places))) + chk("gas", L(GA.sound)), L(GA.btn));
    onSub("fga", function () {
      if (!need("gad")) return;
      var n = intVal("gan"); if (!need("gan", function () { return n >= 1; })) return;
      var d = dateVal("gad"), dd = daysTo(d), c = $("#gac").value;
      if (dd < 0) { $("#gad-err").textContent = L(C.pastDate); $("#gad-err").hidden = false; return; }
      var head = refBox(C.ref, refNo(c.toUpperCase() + "-PG", c + d.toISOString() + n), [[L(GA.city), esc(L(EV.cities[c]))], [L(GA.date), esc(fmtD(d))], [L(GA.num), fmtN(n)]]);
      result(head + (dd < 10 ? P(GA.late, "warn", { d: fmtD(addDays(today(), 10)) }) : P(GA.ok, "ok")) + ($("#gap").value === "oth" ? P(GA.oth) : "") + (n > 500 ? "<p>" + esc(L(GA.big)) + " " + svcLink("event") + "</p>" : "") + H4(GA.rulesH) + ul(L(GA.rules)) + P(GA.no, "tiny") + counterEnd("gathering", L(GA.docs), GA.where));
    });
  };
  HELP.gathering = {
    en: "<h3>Designated places</h3><p>Each city council keeps a list of places designated for public gatherings, with the number of people each can hold. The list is posted at the city hall's reception. A gathering at a designated place needs only the notification.</p><h3>Notification is not permission</h3><p>A notification lodged in time does not need an answer. The city answers only to propose another place or time.</p>",
    ir: "<h3>Belgilengen jerler</h3><p>Ar bir shaar keñeshi kogomduk chogulushtar üchün belgilengen jerlerdin tizmesin ar biri kancha kishini batırarı menen jürgüzöt. Tizme meriyanın kabıl aluu bölümündö ilinet. Belgilengen jerdegi chogulushka kabarlama gana kerek.</p><h3>Kabarlama uruksat emes</h3><p>Öz ubaktısında berilgen kabarlama jooptu talap kılbayt. Shaar bashka jerdi je ubakıttı sunush üchün gana joop beret.</p>",
    ru: "<h3>Отведённые места</h3><p>Каждый горсовет ведёт перечень мест, отведённых для публичных собраний, с указанием вместимости. Перечень вывешен в приёмной мэрии. Для собрания в отведённом месте достаточно уведомления.</p><h3>Уведомление не разрешение</h3><p>Поданное в срок уведомление не требует ответа. Город отвечает только чтобы предложить другое место или время.</p>"
  };

  /* vehicle pass to Cathedral Hill for the Feast of St. Janyl */
  var FP = {
    cat: { en: "Category", ir: "Kategoriya", ru: "Категория" },
    cats: [["dis", { en: "Driver or passenger with a disability", ir: "Mayıp aydoochu je jürgünchü", ru: "Водитель или пассажир с инвалидностью" }, 120], ["bus", { en: "Pilgrim bus or minibus", ir: "Ziyaratchılardın avtobusu je mikroavtobusu", ru: "Автобус или микроавтобус паломников" }, 60], ["sup", { en: "Supplier to the cathedral or the stalls", ir: "Soborgo je satuu jaylarına jetkirüüchü", ru: "Поставщик собора или торговых точек" }, 40], ["clergy", { en: "Clergy and cathedral staff", ir: "Dinij kızmatchılar jana sobordun kızmatkerleri", ru: "Духовенство и сотрудники собора" }, 0], ["car", { en: "Private car", ir: "Jeke unaa", ru: "Личный автомобиль" }, 0], ["taxi", { en: "Taxi", ir: "Taksi", ru: "Такси" }, 0]],
    btn: { en: "Check", ir: "Tekshirüü", ru: "Проверить" },
    feast: { en: "Feast of St. Janyl", ir: "Janyl Mayramı", ru: "Праздник Святой Джаныл" },
    from: { en: "Passes issued from", ir: "Ötkörmölör berilet", ru: "Пропуска выдаются с" },
    quota: { en: "Quota", ir: "Kvota", ru: "Квота" },
    left: { en: "Passes remaining", ir: "Kalgan ötkörmölör", ru: "Осталось пропусков" },
    early: { en: "Passes for the Feast of {d} are issued from 1 August {y}. Applications made before that date are not registered.", ir: "{d} Mayramı üchün ötkörmölör {y}-jıldın 1-avgustunan tartip berilet. Andan murun berilgen arızdar kattalbayt.", ru: "Пропуска на праздник {d} выдаются с 1 августа {y} года. Заявления, поданные раньше, не регистрируются." },
    open: { en: "Passes are being issued. Bring the application to the counter.", ir: "Ötkörmölör berilip jatat. Arızdı kassaga alıp keliñiz.", ru: "Идёт выдача пропусков. Принесите заявление в окошко." },
    gone: { en: "The quota for this category has been issued in full.", ir: "Bul kategoriyanın kvotası tolugu menen berildi.", ru: "Квота по этой категории выдана полностью." },
    clergy: { en: "Passes for clergy and cathedral staff are issued on lists provided by the cathedral rector and are not applied for here.", ir: "Dinij kızmatchılar jana sobordun kızmatkerleri üchün ötkörmölör sobor rektoru bergen tizmeler boyuncha berilet, bul jerde arız berilbeyt.", ru: "Пропуска для духовенства и сотрудников собора выдаются по спискам настоятеля собора; здесь заявление не подаётся." },
    car: { en: "Private cars are not admitted to the Cathedral Hill road on 23 and 24 August. Park in the Lower Town car parks; shuttle buses run to the foot of the hill from 5:00.", ir: "23 jana 24-avgustta jeke unaalar Chirköö döbösünün jolu menen kirgizilbeyt. Tömönkü shaardagı unaa toktotuuchu jaylarga koyuñuz; döbönün etegine 5:00dön tartip shattl avtobustar jüröt.", ru: "23 и 24 августа личные автомобили на дорогу к Соборному холму не допускаются. Оставляйте машины на стоянках Нижнего города; до подножия холма с 5:00 ходят автобусы." },
    taxi: { en: "Taxis may set down and pick up only at the foot of the Cathedral Hill road on 23 and 24 August. No pass is issued.", ir: "23 jana 24-avgustta taksiler Chirköö döbösünün jolunun etegine gana tüshürüp, ala alat. Ötkörmö berilbeyt.", ru: "23 и 24 августа такси могут высаживать и забирать пассажиров только у подножия дороги на Соборный холм. Пропуск не выдаётся." },
    sup: { en: "Supplier passes are valid on 23 and 24 August before 7:00 only.", ir: "Jetkirüüchülördün ötkörmölörü 23 jana 24-avgustta saat 7:00gö cheyin gana jaraktuu.", ru: "Пропуска поставщиков действуют 23 и 24 августа только до 7:00." },
    bus: { en: "Pilgrim buses are registered through the parish or the travel agent. Groups from the tribal regions travel under the arrangements agreed each year through the Joint Liaison Committee; see Crossing the Qara-Chik line.", ir: "Ziyaratchılardın avtobustarı chirköö prikhodu je turagenttik arkıluu kattalat. Tooluu aymaktardan kelgen toptor ar jılı Birgeleshken baylanısh komiteti arkıluu makuldashılgan tartip menen kelet; Kara-Chik liniyasınan ötüüdön karañız.", ru: "Автобусы паломников регистрируются через приход или турагентство. Группы из племенных районов едут по порядку, ежегодно согласуемому через Совместный комитет связи; см. «Пересечение линии Кара-Чик»." },
    docs: { en: ["The vehicle registration certificate", "For drivers or passengers with a disability: the disability certificate", "For buses: the parish's or agent's list of passengers", "For suppliers: the contract or the stallholder's letter", "Form IJ-3"], ir: ["Unaanın kattoo kübölügü", "Mayıp aydoochular je jürgünchülör üchün: mayıptık kübölügü", "Avtobustar üchün: prikhoddun je agenttin jürgünchülör tizmesi", "Jetkirüüchülör üchün: kelishim je satuuchunun katı", "IJ-3 forması"], ru: ["Свидетельство о регистрации ТС", "Для водителей и пассажиров с инвалидностью: справка об инвалидности", "Для автобусов: список пассажиров от прихода или агентства", "Для поставщиков: договор или письмо владельца торговой точки", "Бланк IJ-3"] },
    where: { en: "Iyık Janyl City Hall, Lower Town, transport office (room 12), Monday to Saturday, 9:00–16:00 during August.", ir: "Iyık Janyl meriyası, Tömönkü shaar, transport bölümü (12-bölmö), avgust ayında düyshömbüdön ishembige cheyin, 9:00–16:00.", ru: "Мэрия Ийык-Джаныла, Нижний город, транспортный отдел (комната 12), в августе понедельник–суббота, 9:00–16:00." }
  };
  FLOWS.feastpass = function (box) {
    box.innerHTML = flowForm("ffp", field("fpc", L(FP.cat), sel("fpc", FP.cats.map(function (k) { return [k[0], L(k[1])]; }))), L(FP.btn));
    onSub("ffp", function () {
      var td = today(), Y = td.getUTCFullYear(), feast = new Date(Date.UTC(Y, 7, 24));
      if (td > feast) { Y++; feast = new Date(Date.UTC(Y, 7, 24)); }
      var from = new Date(Date.UTC(Y, 7, 1)), c = $("#fpc").value, row = FP.cats.filter(function (x) { return x[0] === c; })[0];
      var head = kv([[L(FP.feast), esc(fmtD(feast))], [L(FP.from), esc(fmtD(from))]].concat(row[2] ? [[L(FP.quota), String(row[2])]] : []));
      if (c === "clergy") { result(head + P(FP.clergy)); return; }
      if (c === "car") { result(head + P(FP.car, "warn")); return; }
      if (c === "taxi") { result(head + P(FP.taxi, "warn")); return; }
      var extra = (c === "sup" ? P(FP.sup) : "") + (c === "bus" ? "<p>" + esc(L(FP.bus)) + " " + svcLink("crossing") + "</p>" : "");
      if (td < from) { result(head + P(FP.early, "warn", { d: fmtD(feast), y: Y }) + extra + formBox("feastpass")); return; }
      var gone = Math.round(row[2] * Math.min(1, (daysTo(from) * -1 + 1) / 12 + (hash("fp" + c + Y) % 20) / 100)), left = Math.max(0, row[2] - gone);
      result(head + kv([[L(FP.left), String(left)]]) + P(left ? FP.open : FP.gone, left ? "ok" : "warn") + extra + (left ? counterEnd("feastpass", L(FP.docs), FP.where) : ""));
    });
  };
  HELP.feastpass = {
    en: "<h3>The Feast of St. Janyl</h3><p>On 24 August pilgrims climb Cathedral Hill in Iyık Janyl for the Feast of St. Janyl. The Cathedral Hill road is closed to vehicles without a pass on 23 and 24 August. Passes are fixed to the inside of the windscreen and checked by the city police at the foot of the road.</p>",
    ir: "<h3>Janyl Mayramı</h3><p>24-avgustta ziyaratchılar Janyl Mayramına Iyık Janyldagı Chirköö döbösünö chıgat. 23 jana 24-avgustta Chirköö döbösünün jolu ötkörmösü jok unaalar üchün jabık. Ötkörmölör aldıñkı aynektin ichki jagına chaplanat jana anı joldun eteginde shaar politsiyası tekshiret.</p>",
    ru: "<h3>Праздник Святой Джаныл</h3><p>24 августа паломники поднимаются на Соборный холм в Ийык-Джаныле на праздник Святой Джаныл. 23 и 24 августа дорога на Соборный холм закрыта для транспорта без пропуска. Пропуск крепится изнутри на лобовое стекло и проверяется городской полицией у подножия дороги.</p>"
  };

  /* copies of archival documents */
  var AR = {
    kind: { en: "Records you need", ir: "Kerektüü dokumentter", ru: "Нужные документы" },
    kinds: [["pay", { en: "Employment and earnings (for a pension)", ir: "Emgek jana emgek akı (pensiya üchün)", ru: "Стаж и заработок (для пенсии)" }], ["farm", { en: "Collective farm membership", ir: "Kolkhozgo müchölük", ru: "Членство в колхозе" }], ["mil", { en: "Military records", ir: "Askerdik dokumentter", ru: "Военные документы" }], ["civ", { en: "Civil registration before 1992", ir: "1992-jılga cheyinki jarandık abal aktıları", ru: "Записи актов гражданского состояния до 1992 года" }], ["fam", { en: "Family history (sanjyra)", ir: "Uruk tarıkhı (sanjıra)", ru: "История семьи (санжыра)" }], ["isez", { en: "Records of the ISEZ since 2007", ir: "2007-jıldan berki IAEZdin dokumentteri", ru: "Документы ОЭЗИ с 2007 года" }]],
    year: { en: "Year of the records", ir: "Dokumentterdin jılı", ru: "Год документов" },
    btn: { en: "Prepare request", ir: "Surootu dayardoo", ru: "Подготовить запрос" },
    fond: { en: "Likely fond", ir: "Boljoldoo fond", ru: "Вероятный фонд" },
    fonds: { farm: [236, { en: "collective farms (1930–91)", ir: "kolkhozdor (1930–91)", ru: "колхозы (1930–91)" }, 1930, 1991], mil: [[288, { en: "Talas oblast military commissariat (1941–91)", ir: "Talas oblustuk askerdik komissariatı (1941–91)", ru: "Таласский областной военный комиссариат (1941–91)" }, 1941, 1991], [131, { en: "military records (1992–2006)", ir: "askerdik dokumentter (1992–2006)", ru: "военные документы (1992–2006)" }, 1992, 2006]] },
    noFond: { en: "To be identified by the Archives", ir: "Arkhiv anıktayt", ru: "Определит архив" },
    closed: { en: "Records of the ISEZ since 2007 are on the closed shelf, subject to classification review. Requests are registered and kept on file until the review is complete.", ir: "2007-jıldan berki IAEZdin dokumentteri jabık tekchede, klassifikatsiyanı kayra karoo ayaktaganga cheyin. Arızdar kattalıp, kayra karoo bütkönchö saktalat.", ru: "Документы ОЭЗИ с 2007 года находятся на закрытой полке до пересмотра грифа. Запросы регистрируются и хранятся до завершения пересмотра." },
    fam: { en: "Family history requests are answered by the sanjyra genealogy desk in the reading room. There are no free places in the reading room this month; the desk answers written requests in order of receipt.", ir: "Uruk tarıkhı boyuncha arızdarga okuu zalındagı sanjıra bölümü joop beret. Bul ayda okuu zalında bosh orun jok; bölüm jazuu jüzündögü arızdarga kelgen kezegi boyuncha joop beret.", ru: "На запросы по истории семьи отвечает генеалогический стол санжыра в читальном зале. Свободных мест в читальном зале в этом месяце нет; стол отвечает на письменные запросы в порядке поступления." },
    civ: { en: "Civil registration records before 1992 are held by the State Archives. Records from 1992 are issued by the civil registry offices.", ir: "1992-jılga cheyinki jarandık abal aktıları Mamlekettik arkhivde saktalat. 1992-jıldan berkilerin JAAK bölümdörü beret.", ru: "Записи актов гражданского состояния до 1992 года хранятся в Государственном архиве. Записи с 1992 года выдают отделы ЗАГС." },
    post: { en: "Send form SA-4 by registered post to the State Archives of Irad, 16 University Street, Talas, with a stamped addressed envelope (IS 16 in stamps for a registered reply) and the copying fee by postal order (Irad Pochtasy form P-11). Requests without an envelope are kept on file. Copies are posted within 30 days of receipt.", ir: "SA-4 formasın buyurtma kat menen Irad mamlekettik arkhivine jönötüñüz: Universitet köchösü 16, Talas; darek jazılgan, marka chaplangan konvert (buyurtma joop üchün 16 somluk marka) jana köchürmö akısın pochta kotormosu menen (Irad Pochtasının P-11 forması) tirkeñiz. Konvertsiz arızdar saktalıp kalat. Köchürmölör arız kelgenden kiyin 30 kündün ichinde jönötülöt.", ru: "Отправьте бланк SA-4 заказным письмом в Государственный архив Ирада: Талас, Университетская улица, 16, приложив конверт с обратным адресом и марками (на 16 сомов для заказного ответа) и плату за копии почтовым переводом (бланк «Ирадпочты» P-11). Запросы без конверта остаются на хранении. Копии высылаются в течение 30 дней после получения." },
    fees: { en: "Copying fees, the guide to the fonds and the reading room are on the State Archives' site:", ir: "Köchürmö akıları, fonddor boyuncha jetekchi jana okuu zalı Mamlekettik arkhivdin saytında:", ru: "Плата за копии, путеводитель по фондам и читальный зал на сайте Государственного архива:" },
    bad: { en: "Enter a year between 1700 and the present year.", ir: "1700-jıl menen uchurdagı jıldın ortosundagı jıldı jazıñız.", ru: "Введите год от 1700 до текущего." }
  };
  FLOWS.archive = function (box) {
    var Y = iradNow().getFullYear();
    box.innerHTML = flowForm("far", field("ark", L(AR.kind), sel("ark", opts(AR.kinds))) + field("ary", L(AR.year), numIn("ary", 1700, Y)), L(AR.btn));
    onSub("far", function () {
      var y = intVal("ary"); if (!need("ary", function () { return y >= 1700 && y <= Y; })) { $("#ary-err").textContent = L(AR.bad); return; }
      var k = $("#ark").value, fond = null, F = AR.fonds;
      if (k === "farm" && y >= F.farm[2] && y <= F.farm[3]) fond = F.farm;
      if (k === "mil") F.mil.forEach(function (f) { if (y >= f[2] && y <= f[3]) fond = f; });
      var link = '<p>' + esc(L(AR.fees)) + ' <a href="https://archives.iradgov.org/">archives.iradgov.org</a></p>';
      if (k === "isez" || y >= 2007) { result(P(AR.closed, "warn") + link + formBox("archive")); return; }
      if (k === "civ" && y >= 1992) { result(P(AR.civ, "warn") + "<p>" + svcLink("civil") + "</p>"); return; }
      result(kv([[L(AR.kind), esc(L(pick(AR.kinds, k)))], [L(AR.year), String(y)], [L(AR.fond), fond ? esc("No. " + fond[0] + ", " + L(fond[1])) : esc(L(AR.noFond))]]) + (k === "fam" ? P(AR.fam) : "") + (k === "civ" ? P(AR.civ, "tiny") : "") + P(AR.post) + link + formBox("archive"));
    });
  };
  HELP.archive = {
    en: "<h3>Who may ask?</h3><p>Anyone may ask for copies of open records. Records about a living person are copied only for that person or with his or her written consent. Certified copies for the Social Fund and the courts carry the Archives' stamp.</p>",
    ir: "<h3>Kim surasa bolot?</h3><p>Achık dokumentterdin köchürmölörün ar kim surasa bolot. Tirüü adam tuuraluu dokumentter oshol adamdın özü üchün je anın jazuu jüzündögü makulduguu menen gana köchürülöt. Sotsialdık fond jana sottor üchün tastıktalgan köchürmölördö Arkhivdin möörü bolot.</p>",
    ru: "<h3>Кто может запросить?</h3><p>Копии открытых документов может запросить любой. Документы о живом человеке копируются только для него самого или с его письменного согласия. Заверенные копии для Социального фонда и судов скрепляются печатью архива.</p>"
  };

  /* written appeal to a state body */
  var AP = {
    body: { en: "Addressed to", ir: "Kimge", ru: "Адресат" },
    bodies: [["gov", { en: "Office of the Governor", ir: "Gubernator keñsesi", ru: "Канцелярия Губернатора" }], ["min", { en: "A ministry or department", ir: "Ministrlik je departament", ru: "Министерство или департамент" }], ["city", { en: "A city hall", ir: "Meriya", ru: "Мэрия" }], ["dist", { en: "A district administration", ir: "Aymaktık administratsiya", ru: "Районная администрация" }], ["court", { en: "A court, about a case", ir: "Sot, ish boyuncha", ru: "Суд, по делу" }]],
    how: { en: "Sent by", ir: "Kantip jönötülöt", ru: "Способ отправки" },
    hows: [["mail", { en: "E-mail", ir: "E-pochta", ru: "Электронная почта" }], ["post", { en: "Post", ir: "Pochta", ru: "Почта" }], ["hand", { en: "In person", ir: "Jeke özü", ru: "Лично" }]],
    btn: { en: "Show how to send", ir: "Kantip jönötüünü körsötüü", ru: "Показать, как отправить" },
    not: { en: "e-Irad does not send appeals. Nothing you write here leaves your device.", ir: "e-Irad kayrıluulardı jönötpöyt. Bul jerde jazganıñız tüzmögüñüzdön chıkpayt.", ru: "e-Irad не отправляет обращения. Ничего из написанного здесь не покидает ваше устройство." },
    court: { en: "Appeals about a case before a court are not considered by state bodies. Write to the court's registry; check the status of a Supreme Court case on the register.", ir: "Sottogu ish boyuncha kayrıluularnı mamlekettik organdar karabayt. Sottun registraturasına jazıñız; Jogorku sottogu ishtin abalın reestrden tekshiriñiz.", ru: "Обращения по делам, находящимся в суде, государственные органы не рассматривают. Пишите в канцелярию суда; статус дела Верховного суда можно проверить в реестре." },
    addr: { en: "Address", ir: "Darek", ru: "Адрес" },
    mail: { en: "letters@iradgov.org. Attach the signed appeal as a scanned page; an e-mail without a signed page is registered as a letter without a signature.", ir: "letters@iradgov.org. Kol koyulgan kayrıluunu skanerlengen bet katarı tirkeñiz; kol koyulgan betsiz kat kolsuz kat katarı kattalat.", ru: "letters@iradgov.org. Приложите подписанное обращение в виде скана; письмо без подписанной страницы регистрируется как письмо без подписи." },
    post: { en: "Letters and Appeals Section, Office of the Governor, Talas. Or the post address of the ministry, city hall or district administration.", ir: "Gubernator keñsesinin Kattar jana kayrıluular bölümü, Talas. Je ministrliktin, meriyanın je aymaktık administratsiyanın pochta daregi.", ru: "Отдел писем и обращений Канцелярии Губернатора, Талас. Или почтовый адрес министерства, мэрии или районной администрации." },
    hand: { en: "The reception of the body concerned, which stamps your copy with the date and registration number.", ir: "Tiyishtüü organdın kabıl aluu bölümü, al siziñ nuskañızga kün jana kattoo nomerin möör menen basat.", ru: "Приёмная соответствующего органа, которая ставит на вашем экземпляре штамп с датой и регистрационным номером." },
    rulesH: { en: "Rules", ir: "Erejeler", ru: "Правила" },
    rules: { en: ["Give your full name, postal address and signature. Anonymous appeals are not considered.", "Write in Iradi, Russian or English.", "An appeal sent to the wrong body is forwarded to the competent one within seven days, and you are told.", "The answer is sent within 30 days of registration. The period may be extended by 30 days, and you are told.", "A repeated appeal on the same matter, without new facts, may be answered by reference to the earlier answer."], ir: ["Toluk atıñızdı, pochta darekiñizdi jana koluñuzdu körsötüñüz. Anonimdik kayrıluular karalbayt.", "Irad, orus je anglis tilinde jazıñız.", "Tuura emes organga jönötülgön kayrıluu jeti kündün ichinde tiyishtüü organga jiberilet, bul tuuraluu sizge kabarlanat.", "Joop kattalgandan kiyin 30 kündün ichinde jönötülöt. Möönöt 30 küngö uzartılıshı mümkün, bul tuuraluu sizge kabarlanat.", "Jañı faktılarsız oshol ele maseledegi kaytalanma kayrıluuga murdagı joopko shilteme menen joop berilishi mümkün."], ru: ["Укажите полное имя, почтовый адрес и подпись. Анонимные обращения не рассматриваются.", "Пишите на ирадском, русском или английском языке.", "Обращение, направленное не по адресу, в течение семи дней пересылается в компетентный орган, о чём вам сообщают.", "Ответ направляется в течение 30 дней с даты регистрации. Срок может быть продлён на 30 дней, о чём вам сообщают.", "На повторное обращение по тому же вопросу без новых фактов могут ответить ссылкой на прежний ответ."] }
  };
  FLOWS.appeal = function (box) {
    box.innerHTML = flowForm("fap", field("apb", L(AP.body), sel("apb", opts(AP.bodies))) + field("aph", L(AP.how), sel("aph", opts(AP.hows))), L(AP.btn));
    onSub("fap", function () {
      var b = $("#apb").value, h = $("#aph").value;
      if (b === "court") { result(P(AP.court, "warn") + "<p>" + svcLink("court") + "</p>"); return; }
      var addr = h === "mail" ? '<a href="mailto:letters@iradgov.org">letters@iradgov.org</a>' + esc(L(AP.mail).replace(/^letters@iradgov\.org/, "")) : esc(L(AP[h]));
      result(kv([[L(AP.body), esc(L(pick(AP.bodies, b)))], [L(AP.addr), addr]]) + H4(AP.rulesH) + ul(L(AP.rules)) + P(AP.not, "tiny") + formBox("appeal"));
    });
  };
  HELP.appeal = {
    en: "<h3>Appeals and complaints</h3><p>A written appeal may be a proposal, a request or a complaint about the work of a state body or official. A complaint about a decision is sent first to the body that made it; if you are not satisfied with the answer, to the body above it.</p>",
    ir: "<h3>Kayrıluular jana dattanuular</h3><p>Jazuu jüzündögü kayrıluu sunush, suroo je mamlekettik organdın je kızmat adamının ishi boyuncha dattanuu bolushu mümkün. Chechimge dattanuu adegende anı kabıl algan organga jönötülöt; joopko kanaattanbasañız, andan jogorku organga.</p>",
    ru: "<h3>Обращения и жалобы</h3><p>Письменное обращение может быть предложением, заявлением или жалобой на работу государственного органа или должностного лица. Жалоба на решение направляется сначала в орган, который его принял; если ответ вас не устроит, в вышестоящий орган.</p>"
  };

  /* dog registration */
  var DG = {
    city: { en: "City", ir: "Shaar", ru: "Город" },
    name: { en: "Dog's name", ir: "Ittin atı", ru: "Кличка собаки" },
    size: { en: "Size", ir: "Choñdugu", ru: "Размер" },
    sizes: [["s", { en: "Small (under 40 cm at the shoulder)", ir: "Kichine (jonuna cheyin 40 smden tömön)", ru: "Маленькая (ниже 40 см в холке)" }], ["l", { en: "Large (40 cm or more)", ir: "Choñ (40 sm je andan jogoru)", ru: "Крупная (40 см и выше)" }], ["guard", { en: "Guard dog kept in a yard", ir: "Koroodo karmalgan kuzatuuchu it", ru: "Сторожевая собака во дворе" }]],
    vac: { en: "Vaccinated against rabies this year", ir: "Bıyıl kuturmaga karshı emdelgen", ru: "Привита от бешенства в этом году" },
    btn: { en: "Prepare registration", ir: "Kattoonu dayardoo", ru: "Подготовить регистрацию" },
    tag: { en: "Provisional tag number", ir: "Ubaktıluu belgi nomeri", ru: "Предварительный номер жетона" },
    onTag: { en: "Name on the tag", ir: "Belgidegi atı", ru: "Кличка на жетоне" },
    fee: { en: "Annual registration fee", ir: "Jıldık kattoo akısı", ru: "Ежегодный сбор за регистрацию" },
    novac: { en: "A dog is registered only with a rabies vaccination certificate from the State Veterinary Inspectorate for the current year. The vaccination is free during the October campaign at the Inspectorate's points.", ir: "It uchurdagı jılga Mamlekettik veterinardık inspektsiyanın kuturmaga karshı emdöö kübölügü menen gana kattalat. Oktyabr kampaniyası uchurunda inspektsiyanın punkttarında emdöö akısız.", ru: "Собака регистрируется только при наличии справки Государственной ветеринарной инспекции о прививке от бешенства за текущий год. Во время октябрьской кампании прививка в пунктах инспекции бесплатна." },
    large: { en: "Large dogs are walked on a lead and muzzled in public places, parks and public transport.", ir: "Choñ itter kogomduk jerlerde, parktarda jana kogomduk transportto chınjır menen jana tumshuk kap menen jürgüzülöt.", ru: "Крупных собак выгуливают на поводке и в наморднике в общественных местах, парках и транспорте." },
    guard: { en: "Guard dogs kept in a yard are registered too. A sign “Beware of the dog” in Iradi is placed on the gate.", ir: "Koroodo karmalgan kuzatuuchu itter da kattalat. Darbazaga irad tilinde “Itten saktanıñız” degen jazuu ilinet.", ru: "Сторожевые собаки во дворе тоже регистрируются. На воротах размещается табличка «Осторожно, собака» на ирадском языке." },
    caught: { en: "Dogs without a tag found in public places are collected by Tazalık and kept for five days. The owner collects the dog on payment of IS 15 a day for its keep.", ir: "Kogomduk jerlerde tabılgan belgisiz itterdi Tazalık jıynap, besh kün karmayt. Eesi ittin karoosu üchün kününö 15 som tölöp alıp ketet.", ru: "Собак без жетона в общественных местах отлавливает «Тазалык» и содержит пять дней. Владелец забирает собаку, оплатив содержание 15 сомов в день." },
    docs: { en: ["Your ID card", "The rabies vaccination certificate for the current year", "Form TZ-61"], ir: ["Jeke kuböölügüñüz", "Uchurdagı jılga kuturmaga karshı emdöö kübölügü", "TZ-61 forması"], ru: ["Удостоверение личности", "Справка о прививке от бешенства за текущий год", "Бланк TZ-61"] },
    where: { en: "Tazalık office of your city (in Talas: Tazalık depot, Kirpich Street 40), Monday to Friday, 9:00–17:00, lunch 12:30–13:30. The tag is issued on the spot.", ir: "Shaarıñızdagı Tazalık keñsesi (Talasta: Tazalık deposu, Kirpich köchösü 40), düyshömbüdön jumaga cheyin, 9:00–17:00, tüshkü tamak 12:30–13:30. Belgi oshol jerde berilet.", ru: "Офис «Тазалык» вашего города (в Таласе: депо «Тазалык», улица Кирпичная, 40), понедельник–пятница, 9:00–17:00, обед 12:30–13:30. Жетон выдаётся на месте." }
  };
  FLOWS.dog = function (box) {
    box.innerHTML = flowForm("fdg", field("dgc", L(DG.city), sel("dgc", [["tl", L(EV.cities.tl)], ["nz", L(EV.cities.nz)], ["ij", L(EV.cities.ij)]])) + field("dgn", L(DG.name), inp("dgn", "", ' maxlength="24"')) + field("dgs", L(DG.size), sel("dgs", opts(DG.sizes))) + chk("dgv", L(DG.vac)), L(DG.btn));
    onSub("fdg", function () {
      if (!need("dgn")) return;
      var c = $("#dgc").value, nm = caps($("#dgn").value), s = $("#dgs").value;
      if (!$("#dgv").checked) { result(P(DG.novac, "warn")); return; }
      result(refBox(DG.tag, "TZ-" + c.toUpperCase() + "-" + pad5(hash("dg" + c + nm) % 100000), [[L(DG.onTag), esc(nm)], [L(DG.city), esc(L(EV.cities[c]))], [L(DG.fee), som(25)]]) + (s === "l" ? P(DG.large) : s === "guard" ? P(DG.guard) : "") + P(DG.caught, "tiny") + counterEnd("dog", L(DG.docs), DG.where));
    });
  };
  HELP.dog = {
    en: "<h3>Why register a dog?</h3><p>Registration keeps the vaccination record and lets Tazalık return a lost dog to its owner. Pensioners pay half the fee. A tag lost is replaced for IS 5.</p>",
    ir: "<h3>Itti emne üchün kattoo kerek?</h3><p>Kattoo emdöö tuuraluu jazuunu saktayt jana Tazalıkka jogolgon itti eesine kaytaruuga mümkündük beret. Pensionerler akının jarımın tölöyt. Jogolgon belgi 5 somgo almashtırılat.</p>",
    ru: "<h3>Зачем регистрировать собаку?</h3><p>Регистрация сохраняет сведения о прививках и позволяет «Тазалыку» вернуть потерявшуюся собаку владельцу. Пенсионеры платят половину сбора. Утерянный жетон заменяется за 5 сомов.</p>"
  };

  function pageService() {
    var id = new URLSearchParams(location.search).get("id"), s = svc(id), main = $("#app");
    if (!s) { pageNF(); return; }
    document.title = L(s.name) + " | e-Irad";
    var sec = secOf(s), SEP = ' <span class="sep">›</span> ';
    main.innerHTML = '<div class="wrap page"><nav class="crumbs" aria-label="breadcrumb"><a href="/">e-Irad</a>' + SEP + (sec === "b" ? '<a href="/business.html">' + esc(t("secBiz")) + "</a>" + SEP + '<a href="/business.html#services">' + esc(t("nav_bservices")) + "</a>" : '<a href="/citizens.html">' + esc(t("secCit")) + "</a>" + SEP + '<a href="/citizens.html#cat-' + s.cat + '">' + esc(t("cat" + s.cat.charAt(0).toUpperCase() + s.cat.slice(1))) + "</a>") + SEP + "<span>" + esc(L(s.name)) + "</span></nav>" +
      '<div class="svchead">' + icon(s.icon) + "<div><h1>" + esc(L(s.name)) + "</h1><p>" + esc(L(s.desc)) + '</p><p class="agency"><span>' + esc(t("agency")) + ":</span> " + esc(L(s.agency)) + " " + badge(s.status) + "</p></div></div>" +
      '<div class="svcgrid"><div id="flowbox"></div><aside class="help">' + (HELP[id] ? L(HELP[id]) : "") + formBox(id) + (window.E_APPS ? window.E_APPS.note(id, L, esc) : "") + '<p class="tiny">' + esc(t("offline")) + "</p></aside></div></div>";
    FLOWS[id]($("#flowbox"));
  }

  /* ---------- landing page ---------- */
  var PICT = {
    b: '<svg class="pict" viewBox="0 0 96 96" aria-hidden="true"><rect x="6" y="40" width="54" height="40" fill="#e6eef7" stroke="#1f5a96" stroke-width="3"/><path d="M6 40 33 22l27 18" fill="none" stroke="#1f5a96" stroke-width="3" stroke-linejoin="round"/><rect x="16" y="52" width="12" height="10" fill="#fff" stroke="#1f5a96" stroke-width="2.5"/><rect x="38" y="52" width="12" height="28" fill="#fff" stroke="#1f5a96" stroke-width="2.5"/><rect x="60" y="56" width="30" height="24" fill="#c99a1c" stroke="#7a5a0c" stroke-width="2.5"/><path d="M60 64h30M75 56v24" stroke="#7a5a0c" stroke-width="2"/><rect x="66" y="36" width="20" height="20" fill="#d9b04a" stroke="#7a5a0c" stroke-width="2.5"/><path d="M66 46h20" stroke="#7a5a0c" stroke-width="2"/><path d="M2 82h92" stroke="#174676" stroke-width="3"/></svg>',
    c: '<svg class="pict" viewBox="0 0 96 96" aria-hidden="true"><circle cx="34" cy="28" r="12" fill="#e6eef7" stroke="#1f5a96" stroke-width="3"/><path d="M12 80c1-17 10-27 22-27s21 10 22 27z" fill="#e6eef7" stroke="#1f5a96" stroke-width="3" stroke-linejoin="round"/><circle cx="64" cy="38" r="9" fill="#fff" stroke="#1f5a96" stroke-width="3"/><path d="M48 80c1-13 7-21 16-21s15 8 16 21z" fill="#fff" stroke="#1f5a96" stroke-width="3" stroke-linejoin="round"/><rect x="58" y="10" width="32" height="22" rx="2" fill="#8e1b26"/><circle cx="67" cy="21" r="4" fill="#f3d9dc"/><path d="M74 17h11M74 22h8M74 26h10" stroke="#f3d9dc" stroke-width="2"/><path d="M2 82h92" stroke="#174676" stroke-width="3"/></svg>'
  };
  function pageLanding() {
    if (location.hash === "#services") { location.replace("/citizens.html" + location.search); return; }
    if (location.hash === "#how") { location.replace("/business.html" + location.search + "#how"); return; }
    document.title = "e-Irad | " + t("tag");
    function tile(k, href, links) {
      return '<section class="gate gate-' + k + '"><a class="gatehead" href="' + href + '">' + PICT[k] + '<span class="gt"><span class="gh">' + esc(t(k === "b" ? "forBiz" : "forCit")) + '</span><span class="gp">' + esc(t(k === "b" ? "forBizP" : "forCitP")) + '</span><span class="btn gbtn">' + esc(t("enter")) + ' »</span></span></a>' +
        '<div class="gex"><h2>' + esc(t("examples")) + ':</h2><ul>' + links.map(function (l) { return '<li><a href="' + l[0] + '">' + esc(l[1]) + "</a></li>"; }).join("") + "</ul></div></section>";
    }
    function sl(id, sec) { var s = svc(id); return [svcHref(s, sec), L(s.name)]; }
    $("#app").innerHTML = '<div class="wrap page landing"><h1>' + esc(t("landH")) + '</h1><p class="lead">' + esc(t("landP")) + "</p>" +
      '<div class="gates">' +
      tile("b", "/business.html", [["/procedures.html", t("heroH")], ["/procedures.html?op=import", t("heroH2")], sl("business", "b"), sl("event", "b"), ["/laws.html", t("nav_laws")], ["/forms.html", t("nav_forms")]]) +
      tile("c", "/citizens.html", [sl("passport", "c"), sl("electricity", "c"), sl("fines", "c"), sl("parcel", "c"), sl("motor", "c"), sl("civil", "c")]) +
      "</div>" +
      '<ul class="strip"><li><a href="/status.html">' + icon("chart") + esc(t("nav_status")) + '</a></li><li><a href="/faq.html">' + icon("doc") + esc(t("nav_faq")) + '</a></li><li><a href="/contact.html">' + icon("id") + esc(t("nav_contact")) + '</a></li><li><a href="/accessibility.html">' + icon("shield") + esc(t("footAcc")) + "</a></li></ul>" +
      '<div class="banner inline" role="status"><span class="dot" aria-hidden="true"></span><span>' + t("banner") + ' <a href="/status.html">' + esc(t("bannerMore")) + "</a></span></div></div>";
  }

  /* ---------- citizens home ---------- */
  var CIT_CATS = ["people", "pay", "check", "biz", "other"];
  function pageCitizens() {
    document.title = t("forCit") + " | e-Irad";
    var list = S.list.filter(function (s) { return s.sec.indexOf("c") >= 0; });
    var h = '<section class="chero"><div class="wrap"><nav class="crumbs" aria-label="breadcrumb"><a href="/">e-Irad</a> <span class="sep">›</span> <span>' + esc(t("secCit")) + "</span></nav>" +
      "<h1>" + esc(t("citH")) + '</h1><p>' + esc(t("citP")) + '</p><form class="pill cpill" role="search" id="cform"><label class="pseg ptext"><span class="plab">' + esc(t("citSearch")) + '</span><input type="search" id="q" autocomplete="off" placeholder="' + esc(t("searchPh2")) + '"></label></form></div></section>';
    h += '<div class="wrap page citizens"><div class="cgrid"><div>';
    h += CIT_CATS.map(function (c) {
      var items = list.filter(function (s) { return s.cat === c; }); if (!items.length) return "";
      return '<section class="box cat" id="cat-' + c + '"><h2 class="boxh">' + esc(t("cat" + c.charAt(0).toUpperCase() + c.slice(1))) + '</h2><div class="boxb"><div class="svcs">' + items.map(function (s) { return card(s, "c"); }).join("") + "</div></div></section>";
    }).join("") + '<p class="nomatch box boxb" hidden>' + esc(t("noMatch")) + '</p><p class="note">' + esc(t("officeHoursNote")) + "</p></div>";
    h += '<aside class="cside"><section class="box"><h2 class="boxh">' + esc(t("nav_login")) + '</h2><div class="boxb"><p>' + esc(t("myP")) + '</p><p><a class="btn" href="/login.html">' + esc(t("myBtn")) + '</a></p></div></section>' +
      '<section class="box"><h2 class="boxh">' + esc(t("popular")) + '</h2><div class="boxb"><ul class="plain">' + ["passport", "electricity", "parcel", "fines"].map(function (id) { var s = svc(id); return '<li><a href="' + svcHref(s, "c") + '">' + esc(L(s.name)) + "</a></li>"; }).join("") + "</ul></div></section>" +
      '<section class="box"><h2 class="boxh">' + esc(t("forBiz")) + '</h2><div class="boxb"><p class="tiny">' + esc(t("citToBiz")) + ' <a href="/business.html">' + esc(t("forBiz")) + "</a>.</p></div></section></aside></div></div>";
    $("#app").innerHTML = h;
    $("#cform").addEventListener("submit", function (e) { e.preventDefault(); });
    var q = $("#q");
    q.addEventListener("input", function () {
      var v = q.value.trim().toLowerCase(), any = false;
      $$(".svc").forEach(function (a) { var ok = !v || a.getAttribute("data-kw").indexOf(v) >= 0; a.hidden = !ok; if (ok) any = true; });
      $$(".cat").forEach(function (c) { c.hidden = !$$(".svc", c).some(function (a) { return !a.hidden; }); });
      $(".nomatch").hidden = any;
    });
    if (location.hash) { var el = document.getElementById(location.hash.slice(1)); if (el) setTimeout(function () { el.scrollIntoView(); }, 0); }
  }

  /* ---------- status ---------- */
  var SYS = [
    [{ en: "Talasbank payment gateway", ir: "Talasbanktın tölöm shlyuzu", ru: "Платёжный шлюз «Таласбанка»" }, "maint", { en: "Upgrade in progress; online payments unavailable", ir: "Jañıloo jürüp jatat; onlayn tölöm jok", ru: "Идёт модернизация; онлайн-оплата недоступна" }],
    [{ en: "Sign-in by Tulpar ID", ir: "Tulpar ID arkıluu kirüü", ru: "Вход через Tulpar ID" }, "off", { en: "Suspended pending review", ir: "Tekshirüügö cheyin toktotuldu", ru: "Приостановлен до проверки" }],
    [{ en: "e-Irad cards", ir: "e-Irad kartaları", ru: "Карты e-Irad" }, "soon", { en: "After the pilot", ir: "Sınoodon kiyin", ru: "После пилота" }],
    [{ en: "Irad Pochtasy tracking", ir: "Irad Pochtasın izdöö", ru: "Отслеживание «Ирадпочты»" }, "ok", { en: "International items updated with a delay of up to three days", ir: "Chet eldik jönötmölör üch küngö cheyin kechigip jañılanat", ru: "Международные отправления обновляются с задержкой до трёх дней" }],
    [{ en: "Iradstrakh policy register", ir: "Iradstrakhtın polis reestri", ru: "Реестр полисов «Ирадстраха»" }, "ok", { en: "", ir: "", ru: "" }],
    [{ en: "Passport queue boards", ir: "Pasport kezeginin tabloloru", ru: "Табло очереди в паспортных столах" }, "limited", { en: "Iyık Janyl office: board under repair, numbers called aloud", ir: "Iyık Janyl bölümü: tablo oñdolup jatat, nomerler ün menen chakırılat", ru: "Ийык-Джаныл: табло в ремонте, номера объявляют голосом" }]
  ];
  var INC = [
    ["2026-11-01", { en: "The online questionnaire of the census of business entities is open until 30 November: e-irad.org/census/.", ir: "Ishkanalardın sanagının onlayn suroo-joobu 30-noyabrga cheyin achık: e-irad.org/census/.", ru: "Онлайн-анкета переписи хозяйствующих субъектов открыта до 30 ноября: e-irad.org/census/." }],
    ["2026-10-19", { en: "Talasbank has informed us that the upgrade of its payment gateway will continue into November. Bills can be paid at Talasbank branches and Irad Pochtasy counters.", ir: "Talasbank tölöm shlyuzun jañıloo noyabrga cheyin ulanarın bildirdi. Esepterdi Talasbanktın filialdarında jana Irad Pochtasının kassalarında tölösö bolot.", ru: "«Таласбанк» сообщил, что модернизация платёжного шлюза продлится до ноября. Счета можно оплатить в отделениях «Таласбанка» и окошках «Ирадпочты»." }],
    ["2026-10-15", { en: "The census of business entities has begun. The online questionnaire will open on e-Irad in November.", ir: "Ishkanalardın sanagı bashtaldı. Onlayn suroo-joop e-Iradda noyabrda achılat.", ru: "Началась перепись хозяйствующих субъектов. Онлайн-анкета откроется на e-Irad в ноябре." }],
    ["2026-10-09", { en: "Sign-in by Tulpar ID has been suspended pending review. Services that do not need sign-in are not affected.", ir: "Tulpar ID arkıluu kirüü tekshirüügö cheyin toktotuldu. Kirüünü talap kılbagan kızmattarga tiyishpeyt.", ru: "Вход через Tulpar ID приостановлен до проверки. Услуги, не требующие входа, работают." }],
    ["2026-10-01", { en: "e-Irad opens in pilot. Services formerly on the ministries' id.gov pages are now listed here.", ir: "e-Irad sınoo rejiminde achıldı. Murda ministrlikterdin id.gov betterinde turgan kızmattar emi bul jerde.", ru: "e-Irad открыт в пилотном режиме. Услуги, ранее размещённые на страницах министерств в зоне id.gov, теперь здесь." }]
  ];
  function pageStatus() {
    INC = INC.filter(function (x) { return new Date(x[0] + "T00:00:00Z") <= today(); });
    $("#app").innerHTML = '<div class="wrap page"><h1>' + esc(t("statusH")) + "</h1><p class=\"lead\">" + esc(t("statusP")) + '</p><p class="tiny">' + esc(t("updated", { d: fmtD(new Date(INC[0][0] + "T00:00:00Z")) })) + "</p>" +
      '<div class="tw"><table class="tbl status"><tbody>' + S.list.map(function (s) { return '<tr><td><a href="' + svcHref(s) + '">' + esc(L(s.name)) + "</a></td><td>" + badge(s.status) + "</td></tr>"; }).join("") +
      SYS.map(function (r) { return "<tr><td>" + esc(L(r[0])) + (L(r[2]) ? '<br><span class="tiny">' + esc(L(r[2])) + "</span>" : "") + "</td><td>" + badge(r[1]) + "</td></tr>"; }).join("") + "</tbody></table></div>" +
      "<h2>" + esc(t("incH")) + '</h2><ul class="inc">' + INC.map(function (x) { return '<li><span class="d">' + esc(fmtD(new Date(x[0] + "T00:00:00Z"))) + "</span><span>" + esc(L(x[1])) + "</span></li>"; }).join("") + "</ul></div>";
  }

  /* ---------- static pages ---------- */
  var FAQ = [
    [{ en: "Why does every service end at the district office?", ir: "Emne üchün ar bir kızmat aymaktık keñsede bütöt?", ru: "Почему каждая услуга заканчивается в районном отделе?" }, { en: "Most applications need your signature in front of an official, original documents or a state fee. During the pilot these steps are completed at the counter. e-Irad lets you prepare, take a number and check the status first, so that one visit is enough.", ir: "Arızdardın köbü kızmatkerdin aldında koluñuzdu, asıl dokumentterdi je mamlekettik alımdı talap kılat. Sınoo mezgilinde bul kadamdar kassada bütkörülöt. e-Irad aldın ala dayardanıp, kezek alıp, abaldı tekshirüügö jardam beret, oshondo bir barganıñız jetishtüü bolot.", ru: "Большинство заявлений требуют подписи в присутствии сотрудника, оригиналов документов или госпошлины. В пилотном режиме эти шаги выполняются в окошке. e-Irad помогает заранее подготовиться, взять номер и проверить статус, чтобы хватило одного визита." }],
    [{ en: "When will online payment work?", ir: "Onlayn tölöm kachan ishteyt?", ru: "Когда заработает онлайн-оплата?" }, { en: "When Talasbank completes the upgrade of its payment gateway. Online payment will be available to Talasbank card holders. Cards of other banks and Tulpar Pay are not accepted for state services.", ir: "Talasbank tölöm shlyuzun jañıloonu bütkörgöndö. Onlayn tölöm Talasbanktın kartasın karmagandar üchün achılat. Bashka banktardın kartaları jana Tulpar Pay mamlekettik kızmattar üchün kabıl alınbayt.", ru: "Когда «Таласбанк» завершит модернизацию платёжного шлюза. Онлайн-оплата будет доступна держателям карт «Таласбанка». Карты других банков и Tulpar Pay для государственных услуг не принимаются." }],
    [{ en: "Why can't I sign in with Tulpar?", ir: "Emne üchün Tulpar menen kire albaym?", ru: "Почему нельзя войти через Tulpar?" }, { en: "Sign-in by Tulpar ID is suspended pending a review of the service's compliance with the conditions for state services. Most e-Irad services do not need sign-in.", ir: "Tulpar ID arkıluu kirüü kızmattın mamlekettik kızmattar üchün shartarga ılayıktuulugu tekshirilgenge cheyin toktotuldu. e-Iraddın köp kızmattarı kirüünü talap kılbayt.", ru: "Вход через Tulpar ID приостановлен до проверки соответствия сервиса условиям для государственных услуг. Для большинства услуг e-Irad вход не нужен." }],
    [{ en: "Is my information sent anywhere?", ir: "Maalımatım bir jakka jönötülöbü?", ru: "Куда отправляются мои данные?" }, { en: "During the pilot, nothing you type on e-Irad leaves your device. Queue numbers you take are remembered by your browser so that you can check them later; you can remove them at any time.", ir: "Sınoo mezgilinde e-Iradga jazgan ech nerseñiz tüzmögüñüzdön chıkpayt. Algan kezek nomerleriñizdi kiyin tekshirüü üchün brauzeriñiz estep kaladı; alardı kaalagan ubakta öchürsöñüz bolot.", ru: "В пилотном режиме ничего из введённого на e-Irad не покидает ваше устройство. Полученные номера очереди запоминает ваш браузер, чтобы вы могли проверить их позже; их можно удалить в любой момент." }],
    [{ en: "I can't open e-Irad from abroad.", ir: "Chet elden e-Iraddı acha albay jatam.", ru: "Не открывается e-Irad из-за рубежа." }, { en: "e-Irad is available from abroad. If a page does not load, try again later or contact the e-Government Service Centre.", ir: "e-Irad chet elden da achılat. Bet jüktölbösö, kiyinireek kayra araket kılıñız je e-Ökmöt kızmat borboruna kayrılıñız.", ru: "e-Irad доступен из-за рубежа. Если страница не загружается, попробуйте позже или обратитесь в Центр услуг электронного правительства." }],
    [{ en: "Someone called me from “e-Irad” asking for my card number.", ir: "Maga “e-Irad” atınan chalıp, karta nomerimdi surashtı.", ru: "Мне позвонили «из e-Irad» и спросили номер карты." }, { en: "e-Irad never asks for passwords, card numbers or ID numbers by telephone, SMS or e-mail. Do not give them, and report the call to the police.", ir: "e-Irad ech kachan telefon, SMS je e-pochta arkıluu sırsöz, karta nomerin je jeke nomerdi surabayt. Berbeñiz jana chaluu tuuraluu politsiyaga kabarlañız.", ru: "e-Irad никогда не запрашивает пароли, номера карт или личные номера по телефону, SMS или электронной почте. Не сообщайте их и заявите о звонке в полицию." }]
  ];
  function pageFAQ() {
    $("#app").innerHTML = '<div class="wrap page narrow"><h1>' + esc(t("faqH")) + "</h1>" + FAQ.map(function (q) { return '<details class="faq"><summary>' + esc(L(q[0])) + "</summary><p>" + esc(L(q[1])) + "</p></details>"; }).join("") + "</div>";
  }
  function pageAcc() {
    $("#app").innerHTML = '<div class="wrap page narrow"><h1>' + esc(t("accH")) + "</h1>" + L({
      en: "<p>The Department of Infrastructure and Communications wants e-Irad to be usable by everyone, including people who use screen readers, keyboard navigation or large text.</p><h2>What we have done</h2><ul><li>Every page is available in English, Iradi and Russian.</li><li>Pages work with the keyboard alone, and the focus is always visible.</li><li>Text can be enlarged to 200% without loss of content.</li><li>Forms have labels and explain errors in words.</li><li>Pages are light enough for slow connections and older phones.</li></ul><h2>Known limitations</h2><ul><li>Some help texts are shorter in Iradi and Russian than in English.</li><li>The queue boards in the offices are not yet announced by voice in every office.</li></ul><h2>Tell us</h2><p>If something does not work for you, write to <a href=\"mailto:help@e-irad.org\">help@e-irad.org</a> or call +996-39-2-27-14-14. We answer within ten working days.</p><p class=\"tiny\">Statement prepared on 1 October 2026.</p>",
      ir: "<p>Infrastruktura jana baylanısh departamenti e-Iraddı bardıgı, anın ichinde ekran okuguchtardı, klaviaturanı je choñ tekstti koldongondor da paydalana alıshın kaalayt.</p><h2>Emne kıldık</h2><ul><li>Ar bir bet anglis, irad jana orus tilderinde.</li><li>Better klaviatura menen gana ishteyt, fokus ar dayım körünüp turat.</li><li>Tekstti mazmunu jogolboston 200%ga cheyin choñoytuuga bolot.</li><li>Formalardın belgileri bar, katalar söz menen tüshündürülöt.</li><li>Better jay internet jana eski telefondor üchün jeñil.</li></ul><h2>Belgilüü chekteöölör</h2><ul><li>Ayrım jardam teksterri irad jana orus tilderinde anglischesinen kıskaraak.</li><li>Bölümdördögü kezek tabloloru ar bir bölümdö ün menen jarıyalanbayt.</li></ul><h2>Bizge aytıñız</h2><p>Bir nerse ishtebese, <a href=\"mailto:help@e-irad.org\">help@e-irad.org</a> daregine jazıñız je +996-39-2-27-14-14 nomerine chalıñız. On ish kündün ichinde joop beribiz.</p><p class=\"tiny\">Bildirüü 2026-jıldın 1-oktyabrında dayardalgan.</p>",
      ru: "<p>Департамент инфраструктуры и связи стремится к тому, чтобы e-Irad был удобен для всех, в том числе для пользователей программ чтения с экрана, клавиатуры или крупного шрифта.</p><h2>Что сделано</h2><ul><li>Все страницы доступны на английском, ирадском и русском языках.</li><li>Страницы работают только с клавиатуры, фокус всегда виден.</li><li>Текст можно увеличить до 200% без потери содержания.</li><li>У полей форм есть подписи, ошибки объясняются словами.</li><li>Страницы рассчитаны на медленный интернет и старые телефоны.</li></ul><h2>Известные ограничения</h2><ul><li>Некоторые справочные тексты на ирадском и русском короче английских.</li><li>Табло очереди не во всех отделах дублируется голосом.</li></ul><h2>Сообщите нам</h2><p>Если что-то не работает, напишите на <a href=\"mailto:help@e-irad.org\">help@e-irad.org</a> или позвоните +996-39-2-27-14-14. Мы отвечаем в течение десяти рабочих дней.</p><p class=\"tiny\">Заявление подготовлено 1 октября 2026 года.</p>"
    }) + "</div>";
  }
  function pageContact() {
    $("#app").innerHTML = '<div class="wrap page narrow"><h1>' + esc(t("ctH")) + "</h1>" + L({
      en: "<p>The e-Government Service Centre answers questions about e-Irad and the services listed on it. It cannot process applications or take payments.</p><dl class=\"kvs\"><dt>Telephone</dt><dd>+996-39-2-27-14-14</dd><dt>E-mail</dt><dd><a href=\"mailto:help@e-irad.org\">help@e-irad.org</a></dd><dt>Hours</dt><dd>Monday to Friday 9:00–18:00, Saturday 9:00–13:00 (Irad Time)</dd><dt>Address</dt><dd>Department of Infrastructure and Communications, Liberty Boulevard 14, Talas</dd></dl><h2>Public Service Centres</h2><p>Help with e-Irad on a terminal, with staff on hand:</p><ul><li>Talas: Liberty Boulevard 14</li><li>Nurzhan: Azatlık Prospect 31</li><li>Iyık Janyl: City Hall, Lower Town</li></ul><p>Attelkom service points also have e-Irad terminals.</p>",
      ir: "<p>e-Ökmöt kızmat borboru e-Irad jana andagı kızmattar tuuraluu suroolorgo joop beret. Al arızdardı karabayt jana tölöm kabıl albayt.</p><dl class=\"kvs\"><dt>Telefon</dt><dd>+996-39-2-27-14-14</dd><dt>E-pochta</dt><dd><a href=\"mailto:help@e-irad.org\">help@e-irad.org</a></dd><dt>Ish saattarı</dt><dd>Düyshömbüdön jumaga cheyin 9:00–18:00, ishembi 9:00–13:00 (Irad ubaktısı)</dd><dt>Darek</dt><dd>Infrastruktura jana baylanısh departamenti, Erkindik bulvarı 14, Talas</dd></dl><h2>Kalkka kızmat körsötüü borborloru</h2><p>Terminalda e-Irad boyuncha jardam, kızmatkerler menen:</p><ul><li>Talas: Erkindik bulvarı 14</li><li>Nurzhan: Azattık prospekti 31</li><li>Iyık Janyl: Meriya, Tömönkü shaar</li></ul><p>Attelkomdun kızmat punkttarında da e-Irad terminaldarı bar.</p>",
      ru: "<p>Центр услуг электронного правительства отвечает на вопросы о e-Irad и размещённых на нём услугах. Он не рассматривает заявления и не принимает платежи.</p><dl class=\"kvs\"><dt>Телефон</dt><dd>+996-39-2-27-14-14</dd><dt>Эл. почта</dt><dd><a href=\"mailto:help@e-irad.org\">help@e-irad.org</a></dd><dt>Часы работы</dt><dd>Понедельник–пятница 9:00–18:00, суббота 9:00–13:00 (по Ирадскому времени)</dd><dt>Адрес</dt><dd>Департамент инфраструктуры и связи, бульвар Свободы, 14, Талас</dd></dl><h2>Центры обслуживания населения</h2><p>Помощь с e-Irad на терминале, с сотрудниками:</p><ul><li>Талас: бульвар Свободы, 14</li><li>Нуржан: проспект Азатлык, 31</li><li>Ийык-Джаныл: мэрия, Нижний город</li></ul><p>Терминалы e-Irad есть также в пунктах обслуживания «Аттелкома».</p>"
    }) + '<p class="tiny">' + esc(t("noPw")) + "</p></div>";
  }
  function pageLogin() {
    $("#app").innerHTML = '<div class="wrap page"><div class="login"><h1>' + esc(t("loginH")) + "</h1><p>" + esc(t("loginP")) + '</p><div class="lbtns"><button type="button" class="btn tulpar" data-m="tulpar">' + esc(t("tulparBtn")) + '</button><button type="button" class="btn ghost" data-m="card">' + esc(t("cardBtn")) + '</button></div><div id="lmsg" class="result" hidden role="alert"></div><p class="tiny">' + esc(t("noPw")) + "</p></div></div>";
    $$("[data-m]").forEach(function (b) {
      b.addEventListener("click", function () {
        var m = b.getAttribute("data-m"), el = $("#lmsg");
        el.innerHTML = '<p class="warn"><b>' + esc(t(m + "MsgH")) + "</b></p><p>" + esc(t(m + "Msg")) + '</p><p><a href="https://id.e-irad.org/?m=' + m + '">' + esc(t("idGo")) + "</a></p>"; el.hidden = false;
      });
    });
  }
  function pageNF() {
    $("#app").innerHTML = '<div class="wrap page narrow nf"><h1>' + esc(t("nfH")) + "</h1><p>" + esc(t("nfP")) + '</p><p><a class="btn" href="/">' + esc(t("nfHome")) + "</a></p></div>";
    document.title = t("nfH") + " | e-Irad";
  }

  var HX = { $: $, $$: $$, esc: esc, t: t, L: L, fmtN: fmtN, fmtD: fmtD, hash: hash, today: today, iradNow: iradNow, addDays: addDays, norm: norm, field: field, sel: sel, inp: inp, need: need, kv: kv, P: P, H4: H4, ul: ul, opts: opts, pick: pick, refBox: refBox, caps: caps, chk: chk, dateIn: dateIn, pad5: pad5, icon: icon, badge: badge, DISTRICTS: DISTRICTS };
  var X = window.E_EXTRA ? window.E_EXTRA(HX) : {};
  var G = window.E_GUIDE({ $: $, $$: $$, esc: esc, t: t, L: L, fmtN: fmtN, som: som, fmtD: fmtD, hash: hash, today: today, S: S, card: card, svcHref: svcHref, pageNF: pageNF });
  var TITLES = { status: "nav_status", faq: "faqH", accessibility: "accH", contact: "ctH", login: "loginH" };
  function render() {
    document.documentElement.lang = I.htmlLang[LANG];
    chrome();
    if (TITLES[PAGE]) document.title = t(TITLES[PAGE]) + " | e-Irad";
    ({ landing: pageLanding, business: G.business, citizens: pageCitizens, procedures: G.procedures, procedure: G.procedure, laws: G.laws, forms: function () { if (window.E_FORMSPAGE) window.E_FORMSPAGE(); else pageNF(); }, service: pageService, status: pageStatus, faq: pageFAQ, accessibility: pageAcc, contact: pageContact, login: pageLogin, vote: X.vote, tests: X.tests, appeals: X.appeals, applications: function () { if (window.E_APPS) window.E_APPS.page(HX); else pageNF(); }, census: function () { if (window.E_CENSUS) window.E_CENSUS(HX).page(); else pageNF(); }, nf: pageNF }[PAGE] || pageNF)();
  }
  render();
})();

/* holiday, half-mast, pass and power notices shared by the state sites (iradgov.org/assets/irad-bar.js) */
(function () {
  var s = document.createElement("script");
  s.src = "https://iradgov.org/assets/irad-bar.js"; s.defer = true; s.setAttribute("data-kind", "eirad");
  document.head.appendChild(s);
})();
