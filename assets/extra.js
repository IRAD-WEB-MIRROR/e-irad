/* e-Irad folder pages: /vote/ (voter register check), /test-results/ (National Graduation Test) and /appeals/
   (online reception). Same rules as app.js: nothing is sent or stored, results are worked out from the input. */
window.E_EXTRA = function (H) {
  "use strict";
  var $ = H.$, esc = H.esc, L = H.L, t = H.t, hash = H.hash, fmtN = H.fmtN, fmtD = H.fmtD, kv = H.kv, P = H.P, H4 = H.H4, ul = H.ul;
  var field = H.field, sel = H.sel, inp = H.inp, need = H.need, opts = H.opts, pick = H.pick, refBox = H.refBox, caps = H.caps;
  var D = H.DISTRICTS;

  function res(id, html) { var r = $("#" + id); r.innerHTML = html; r.hidden = false; r.scrollIntoView({ block: "nearest" }); }
  function form(id, fields, btn, rid) { return '<form class="flow" id="' + id + '">' + fields + '<button class="btn" type="submit">' + esc(btn) + '</button></form><div id="' + rid + '" class="result" hidden aria-live="polite"></div>'; }
  function onSub(id, fn) { $("#" + id).addEventListener("submit", function (e) { e.preventDefault(); fn(); }); }
  function ta(id, max) { return '<textarea id="' + id + '" rows="8" maxlength="' + max + '"></textarea>'; }
  function day(s) { return new Date(s + "T00:00:00Z"); }
  function dayNo(d) { return Math.round((d - Date.UTC(d.getUTCFullYear(), 0, 1)) / 864e5) + 1; }
  function fromDayNo(y, n) { return new Date(Date.UTC(y, 0, n)); }
  var SEP = ' <span class="sep">›</span> ';
  function shell(o) {
    document.title = L(o.title) + " | e-Irad";
    $("#app").innerHTML = '<div class="wrap page"><nav class="crumbs" aria-label="breadcrumb"><a href="/">e-Irad</a>' + SEP + '<a href="/citizens.html">' + esc(t("secCit")) + "</a>" + SEP + "<span>" + esc(L(o.title)) + "</span></nav>" +
      '<div class="svchead">' + H.icon(o.icon) + "<div><h1>" + esc(L(o.title)) + "</h1><p>" + esc(L(o.desc)) + '</p><p class="agency"><span>' + esc(t("agency")) + ":</span> " + esc(L(o.agency)) + " " + H.badge(o.status) + "</p></div></div>" +
      '<div class="svcgrid"><div id="xmain"></div><aside class="help">' + o.help + "</aside></div></div>";
    return $("#xmain");
  }

  /* ================= /vote/: am I on the voter register? ================= */
  var VT = {
    title: { en: "Am I on the voter register?", ir: "Men shayloochulardın tizmesindebi?", ru: "Есть ли я в списке избирателей?" },
    desc: { en: "Check your entry on the voter register for the elections of 2 November 2027 and find your precinct.", ir: "2027-jıldın 2-noyabrındagı shayloolor üchün shayloochulardın tizmesindegi jazuuñuzdu tekshirip, uchastkañızdı tabıñız.", ru: "Проверьте свою запись в списке избирателей на выборах 2 ноября 2027 года и узнайте свой участок." },
    agency: { en: "Territorial Election Commission, with the Passport and Residence Service", ir: "Aymaktık shayloo komissiyası, Pasport jana jashoo jayı kızmatı menen", ru: "Территориальная избирательная комиссия совместно со Службой паспортов и регистрации" },
    sur: { en: "Surname, as in your passport", ir: "Familiyası, pasporttogudai", ru: "Фамилия, как в паспорте" },
    first: { en: "First name", ir: "Atı", ru: "Имя" },
    dob: { en: "Date of birth", ir: "Tuulgan kün", ru: "Дата рождения" },
    dist: { en: "City or district of your registered address", ir: "Kattalgan daregiñizdin shaarı je aymagı", ru: "Город или район адреса регистрации" },
    street: { en: "Street and house number", ir: "Köchö jana üydün nomeri", ru: "Улица и номер дома" },
    btn: { en: "Search the register", ir: "Tizmeden izdöö", ru: "Искать в списке" },
    young: { en: "You will not be 18 on polling day, 2 November 2027, and cannot vote in these elections.", ir: "2027-jıldın 2-noyabrında, shayloo künü, siz 18ge tolo elek siz, bul shayloolordo dobush bere albaysız.", ru: "В день голосования, 2 ноября 2027 года, вам не исполнится 18 лет, и вы не можете голосовать на этих выборах." },
    turns: { en: "You will be 18 by polling day. Voters who turn 18 are added from the residence records at the revision from 1 March 2027. Search again after that date.", ir: "Shayloo kününö cheyin 18ge tolosuz. 18ge tolgondor 2027-jıldın 1-martınan baslangan tizmeni tüzötüüdö jashoo jayı jazuularınan koshulat. Oshol kündön kiyin kayra izdeñiz.", ru: "Ко дню голосования вам исполнится 18 лет. Достигших 18 лет вносят в список по данным регистрации при уточнении с 1 марта 2027 года. Повторите поиск после этой даты." },
    odd: { en: "Check the date of birth.", ir: "Tuulgan kündü tekshiriñiz.", ru: "Проверьте дату рождения." },
    found: { en: "Entry found", ir: "Jazuu tabıldı", ru: "Запись найдена" },
    entry: { en: "Name on the register", ir: "Tizmedegi atı", ru: "ФИО в списке" },
    prec: { en: "Election precinct", ir: "Shayloo uchastkası", ru: "Избирательный участок" },
    st23: { en: "Polling station in 2023", ir: "2023-jılkı shayloo uchastkası", ru: "Помещение для голосования в 2023 году" },
    st27: { en: "Polling stations for 2027 and their addresses are published from 1 October 2027. Most stay where they were in 2023.", ir: "2027-jılkı uchastkalar jana alardın darekteri 2027-jıldın 1-oktyabrınan jarıyalanat. Köpchülügü 2023-jılkı ordunda kalat.", ru: "Участки 2027 года и их адреса публикуются с 1 октября 2027 года. Большинство останется там же, где в 2023 году." },
    ballots: { en: "Ballot papers", ir: "Byulletender", ru: "Бюллетени" },
    b3: { en: "Three: Governor and Lieutenant Governor, the Territorial Legislature, the city council", ir: "Üch: Gubernator jana vitse-gubernator, Aymaktık Mejlis, shaardık keñesh", ru: "Три: губернатор и вице-губернатор, Территориальное законодательное собрание, городской совет" },
    b2: { en: "Two: Governor and Lieutenant Governor, the Territorial Legislature", ir: "Eki: Gubernator jana vitse-gubernator, Aymaktık Mejlis", ru: "Два: губернатор и вице-губернатор, Территориальное законодательное собрание" },
    spell: { en: "The register spells your name as on an older residence record. You will still be allowed to vote with your passport, but the commission may ask questions. To have the entry corrected, bring your passport to your city or district administration during the revision from 1 March 2027.", ir: "Tizme atıñızdı eski jashoo jayı jazuusundagıday jazat. Pasportuñuz menen dobush bere alasız, birok komissiya suroo berishi mümkün. Jazuunu tüzötüü üchün 2027-jıldın 1-martınan baslangan tüzötüü uchurunda pasportuñuz menen shaardık je aymaktık administratsiyaga keliñiz.", ru: "В списке ваше имя записано по старой регистрационной записи. Вас допустят к голосованию по паспорту, но комиссия может задать вопросы. Чтобы исправить запись, придите с паспортом в администрацию города или района во время уточнения с 1 марта 2027 года." },
    moved: { en: "You are on the register at an earlier address, in {d}. Voters vote only at the precinct of the address on the register. Register your new address with the Passport and Residence Service (form PRS-3) before 1 October 2027.", ir: "Siz tizmede murdagı darek boyuncha, {d} turasız. Shayloochular tizmedegi darektin uchastkasında gana dobush beret. Jañı daregiñizdi 2027-jıldın 1-oktyabrına cheyin Pasport jana jashoo jayı kızmatında kattatıñız (PRS-3 forması).", ru: "Вы внесены в список по прежнему адресу: {d}. Голосуют только на участке по адресу из списка. Зарегистрируйте новый адрес в Службе паспортов и регистрации (бланк PRS-3) до 1 октября 2027 года." },
    removed: { en: "The entry that matches these details is marked “removed: death record received”. If this is a mistake, bring your passport in person to your city or district administration during the revision from 1 March 2027. A removal cannot be corrected by telephone or online.", ir: "Bul maalımattarga tuura kelgen jazuu “chıgarıldı: ölüm tuuraluu jazuu kelip tüshtü” dep belgilengen. Eger bul kata bolso, 2027-jıldın 1-martınan baslangan tüzötüü uchurunda pasportuñuz menen shaardık je aymaktık administratsiyaga özüñüz keliñiz. Chıgaruu telefon je onlayn arkıluu tüzötülböyt.", ru: "Запись, совпадающая с этими данными, помечена «исключён: поступила запись о смерти». Если это ошибка, придите лично с паспортом в администрацию города или района во время уточнения с 1 марта 2027 года. Исключение нельзя исправить по телефону или онлайн." },
    twice: { en: "These details match entries on two registers, in {a} and in {b}. A voter may be on one register only. The Commission will remove one entry at the revision from 1 March 2027; to choose which, bring your passport and proof of address to the administration of the address where you live.", ir: "Bul maalımattar eki tizmedegi jazuularga tuura kelet: {a} jana {b}. Shayloochu bir gana tizmede bolot. Komissiya 2027-jıldın 1-martınan baslangan tüzötüüdö bir jazuunu chıgarat; kaysısın tandoo üchün pasport jana darek tuuraluu kagaz menen jashagan daregiñizdin administratsiyasına keliñiz.", ru: "Эти данные совпадают с записями в двух списках: {a} и {b}. Избиратель может быть только в одном списке. Комиссия исключит одну из записей при уточнении с 1 марта 2027 года; чтобы выбрать какую, придите с паспортом и подтверждением адреса в администрацию по месту проживания." },
    none: { en: "No entry found. Check that the surname is spelled as in your passport. If you are not on the register, apply to your city or district administration with your passport during the revision from 1 March 2027 or from 1 October 2027.", ir: "Jazuu tabılgan jok. Familiyanın pasporttogudai jazılganın tekshiriñiz. Tizmede jok bolsoñuz, 2027-jıldın 1-martınan je 1-oktyabrınan baslangan tüzötüü uchurunda pasportuñuz menen shaardık je aymaktık administratsiyaga kayrılıñız.", ru: "Запись не найдена. Проверьте, что фамилия написана как в паспорте. Если вас нет в списке, обратитесь с паспортом в администрацию города или района во время уточнения с 1 марта 2027 года или с 1 октября 2027 года." },
    basis: { en: "The register shown is the register of the 2023 elections with changes from the residence records up to 30 September 2026. It is not the final register for 2027.", ir: "Körsötülgön tizme 2023-jılkı shayloolordun tizmesi, 2026-jıldın 30-sentyabrına cheyinki jashoo jayı jazuularınan özgörtüülör menen. Bul 2027-jıl üchün aqırkı tizme emes.", ru: "Показан список выборов 2023 года с изменениями по данным регистрации на 30 сентября 2026 года. Это не окончательный список 2027 года." },
    school: { en: "School No. {n}", ir: "№{n} mektep", ru: "Школа № {n}" },
    club: { en: "House of Culture", ir: "Madaniyat üyü", ru: "Дом культуры" },
    datesH: { en: "Key dates", ir: "Negizgi datalar", ru: "Основные даты" },
    dates: [["2027-03-01", { en: "Revision of the registers begins", ir: "Tizmelerdi tüzötüü bashtalat", ru: "Начало уточнения списков" }], ["2027-10-01", { en: "Polling stations published; second revision", ir: "Uchastkalar jarıyalanat; ekinchi tüzötüü", ru: "Публикация участков; второе уточнение" }], ["2027-11-02", { en: "Polling day, 7:00–20:00", ir: "Shayloo künü, 7:00–20:00", ru: "День голосования, 7:00–20:00" }]],
    helpH: { en: "Who is on the register", ir: "Tizmede kimder bar", ru: "Кто внесён в список" },
    helpP: { en: "Citizens resident in the Irad Special Economic Zone who are 18 on polling day. The registers are compiled from the residence records of the city and district administrations and the Passport and Residence Service. There is no postal voting and no voting abroad.", ir: "Irad atayın ekonomikalık zonasında jashagan, shayloo künü 18ge tolgon jarandar. Tizmeler shaardık jana aymaktık administratsiyalardın jana Pasport jana jashoo jayı kızmatının jazuularınan tüzülöt. Pochta arkıluu jana chet elde dobush berüü jok.", ru: "Граждане, проживающие в Ирадской особой экономической зоне, которым в день голосования исполнилось 18 лет. Списки составляются по данным регистрации администраций городов и районов и Службы паспортов и регистрации. Голосования по почте и за рубежом нет." },
    more: { en: "Territorial Election Commission: voters", ir: "Aymaktık shayloo komissiyası: shayloochular", ru: "Территориальная избирательная комиссия: избирателям" }
  };
  var VILL = { tl: ["Talas"], nz: ["Nurzhan"], ij: ["Iyık Janyl"], chu: ["Merke"], kb: ["Kyzyl-Adyr", "Aulie-Ata"], td: ["Kara-Bulak", "Arsha-Say", "Kümüshtü"], ln: ["Tash-Kömür", "Bazar-Korgon", "Sopol-Tepa", "Korgoncho"], tok: ["Toktogul"], sb: ["Sary-Bulak", "Uuk-Bulak", "Tash-Bulak"] };
  var CITY = { tl: 1, nz: 1, ij: 1 };
  function soviet(s) { return s.replace(/J/g, "DZH").replace(/Ü/g, "U").replace(/Ö/g, "O").replace(/Ñ/g, "NG"); }
  function pageVote() {
    var help = "<h3>" + esc(L(VT.helpH)) + "</h3><p>" + esc(L(VT.helpP)) + "</p><h3>" + esc(L(VT.datesH)) + '</h3><dl class="kvs">' + VT.dates.map(function (d) { return "<dt>" + esc(fmtD(day(d[0]))) + "</dt><dd>" + esc(L(d[1])) + "</dd>"; }).join("") + '</dl><p><a href="https://elections.iradgov.org/voters.html">' + esc(L(VT.more)) + ' →</a></p><p class="tiny">' + esc(L(VT.basis)) + "</p>";
    var box = shell({ title: VT.title, desc: VT.desc, agency: VT.agency, icon: "people", status: "limited", help: help });
    box.innerHTML = form("fvt", field("vts", L(VT.sur), inp("vts", "", ' maxlength="40"')) + field("vtf", L(VT.first), inp("vtf", "", ' maxlength="40"')) + field("vtd", L(VT.dob), H.dateIn("vtd")) + field("vtc", L(VT.dist), sel("vtc", opts(D))) + field("vta", L(VT.street), inp("vta", "", ' maxlength="60"')), L(VT.btn), "vtr");
    onSub("fvt", function () {
      if (!need("vts") || !need("vtf") || !need("vtd") || !need("vta")) return;
      var s = caps($("#vts").value), f = caps($("#vtf").value), dob = day($("#vtd").value), c = $("#vtc").value;
      if (isNaN(dob) || dob > H.today() || dob < day("1910-01-01")) { res("vtr", P(VT.odd, "warn")); return; }
      if (dob > day("2009-11-02")) { res("vtr", P(VT.young, "warn")); return; }
      if (dob > day("2008-10-29") || dob > new Date(Date.UTC(H.iradNow().getFullYear() - 18, H.iradNow().getMonth(), H.iradNow().getDate()))) { res("vtr", P(VT.turns, "warn")); return; }
      var h = hash("vt" + s + "|" + f + "|" + $("#vtd").value + "|" + c), r = h % 100, other = D[(D.map(function (x) { return x[0]; }).indexOf(c) + 1 + (h >>> 8) % (D.length - 1)) % D.length];
      if (r < 9) { res("vtr", P(VT.none, "warn")); return; }
      if (r < 11) { res("vtr", P(VT.removed, "warn")); return; }
      if (r < 13) { res("vtr", P(VT.twice, "warn", { a: L(pick(D, c)), b: L(other[1]) })); return; }
      var place = r < 23 ? other[0] : c, v = VILL[place], vil = v[(h >>> 4) % v.length];
      var name = s + " " + f, alt = /[JÜÖÑ]/.test(name) && (h >>> 12) % 3 === 0;
      var pn = (CITY[place] ? 1 + (h >>> 5) % 180 : 1 + (h >>> 5) % 40), code = place.toUpperCase().slice(0, 2);
      var station = ((h >>> 14) % 7 === 0 ? L(VT.club) : L(VT.school, { n: 1 + (h >>> 16) % (CITY[place] ? 70 : 4) })) + (CITY[place] ? "" : ", " + vil);
      var rows = [[L(VT.entry), "<b>" + esc(alt ? soviet(name) : name) + "</b>"], [L(VT.dist), esc(L(pick(D, place)))], [L(VT.prec), "No. " + code + "-" + ("00" + pn).slice(-3)], [L(VT.st23), esc(station)], [L(VT.ballots), esc(L(CITY[place] ? VT.b3 : VT.b2))]];
      res("vtr", refBox(VT.found, code + "-" + ("00" + pn).slice(-3) + "/" + H.pad5(h % 100000), rows) + (place !== c ? P(VT.moved, "warn", { d: L(pick(D, place)) }) + '<p><a href="/forms/PRS-3.pdf" target="_blank" rel="noopener">PRS-3 (PDF)</a></p>' : "") + (alt ? P(VT.spell, "warn") : "") + P(VT.st27, "tiny") + P(VT.basis, "tiny"));
    });
  }

  /* ================= /test-results/: National Graduation Test ================= */
  var TR = {
    title: { en: "National Graduation Test: results", ir: "Uluttuk sınak: jıyıntıktar", ru: "Национальный выпускной тест: результаты" },
    desc: { en: "Results of the National Graduation Test (Uluttuk Sınak) 2026 by candidate number, and results by school.", ir: "Uluttuk sınaktın 2026-jılkı jıyıntıktarı talapkerdin nomeri boyuncha jana mektepter boyuncha.", ru: "Результаты Национального выпускного теста (Улуттук Сынак) 2026 года по номеру участника и по школам." },
    agency: { en: "Education Quality Agency, Office of the Governor", ir: "Bilim sapatı agenttigi, Gubernatordun apparatı", ru: "Агентство качества образования, Аппарат губернатора" },
    tabs: [{ en: "My results", ir: "Menin jıyıntıgım", ru: "Мои результаты" }, { en: "Results by school", ir: "Mektepter boyuncha", ru: "По школам" }],
    no: { en: "Candidate number", ir: "Talapkerdin nomeri", ru: "Номер участника" },
    ph: { en: "as on the test pass, e.g. 26-TL-012345", ir: "sınak kartasındagıday, mısalı: 26-TL-012345", ru: "как в пропуске на тест, например 26-TL-012345" },
    bad: { en: "Candidate numbers look like 26-TL-012345: the year, the city or district code (TL, NZ, IJ, CH, KB, TD, LN, TO, SB, or EX for external candidates) and six digits.", ir: "Talapkerdin nomeri 26-TL-012345 sıyaktuu bolot: jılı, shaardın je aymaktın kodu (TL, NZ, IJ, CH, KB, TD, LN, TO, SB, sırttan tapshırgandar üchün EX) jana altı sıfra.", ru: "Номер участника выглядит как 26-TL-012345: год, код города или района (TL, NZ, IJ, CH, KB, TD, LN, TO, SB или EX для экстернов) и шесть цифр." },
    btn: { en: "Show results", ir: "Jıyıntıktardı körsötüü", ru: "Показать результаты" },
    old: { en: "Results of earlier years are not held online. Your school or the Agency's archive issues a copy of the certificate of results.", ir: "Murdagı jıldardın jıyıntıktarı onlayn saktalbayt. Jıyıntıktar tuuraluu kübölüktün köchürmösün mektebiñiz je Agenttiktin arkhivi beret.", ru: "Результаты прошлых лет онлайн не хранятся. Копию сертификата о результатах выдаёт школа или архив Агентства." },
    nf: { en: "No result is held under this number. Check the number on your test pass.", ir: "Bul nomer boyuncha jıyıntık jok. Sınak kartañızdagı nomerdi tekshiriñiz.", ru: "По этому номеру результат не найден. Проверьте номер в пропуске." },
    session: { en: "Session", ir: "Sessiya", ru: "Сессия" },
    june: { en: "June {y}", ir: "{y}-jıldın iyunu", ru: "Июнь {y}" },
    lang: { en: "Language of the papers", ir: "Sınaktın tili", ru: "Язык заданий" },
    langs: [{ en: "Iradi", ir: "Irad tili", ru: "ирадский" }, { en: "English", ir: "Anglis tili", ru: "английский" }],
    point: { en: "Test point", ir: "Sınak punktu", ru: "Пункт тестирования" },
    subj: { en: "Subject", ir: "Sabak", ru: "Предмет" },
    pts: { en: "Points (of 100)", ir: "Upay (100dön)", ru: "Баллы (из 100)" },
    total: { en: "Total (of 500)", ir: "Jalpı (500dön)", ru: "Сумма (из 500)" },
    subs: [{ en: "Iradi language and literature", ir: "Irad tili jana adabiyatı", ru: "Ирадский язык и литература" }, { en: "Mathematics", ir: "Matematika", ru: "Математика" }, { en: "History of Irad", ir: "Irad tarıkhı", ru: "История Ирада" }, { en: "English language", ir: "Anglis tili", ru: "Английский язык" }],
    els: [{ en: "Physics", ir: "Fizika", ru: "Физика" }, { en: "Chemistry", ir: "Khimiya", ru: "Химия" }, { en: "Biology", ir: "Biologiya", ru: "Биология" }, { en: "Geography", ir: "Geografiya", ru: "География" }, { en: "Computer science", ir: "Informatika", ru: "Информатика" }],
    elective: { en: "elective", ir: "tandoo", ru: "по выбору" },
    pass: { en: "Pass mark: 36 points in each subject. The certificate of results is issued with the school leaving diploma.", ir: "Ötüü upayı: ar bir sabaktan 36 upay. Jıyıntıktar tuuraluu kübölük mektep bütürüü diplomu menen berilet.", ru: "Проходной балл: 36 по каждому предмету. Сертификат о результатах выдаётся вместе с аттестатом." },
    retake: { en: "A subject below the pass mark may be retaken once, in the repeat session in June next year. Registration at your school or test point from 1 March.", ir: "Ötüü upayınan tömön sabaktı kiyinki jılı iyundagı kaytaloo sessiyasında bir jolu kayra tapshırsa bolot. Kattoo mektebiñizde je sınak punktunda 1-marttan.", ru: "Предмет ниже проходного балла можно пересдать один раз, в повторную сессию в июне следующего года. Запись в школе или пункте тестирования с 1 марта." },
    grant: { en: "Your total is at or above the lowest total that won a state-funded grant place in 2026 at: {f}.", ir: "Jalpı upayıñız 2026-jılı mamlekettik grant ordun utkan eñ tömönkü jalpı upaydan kem emes: {f}.", ru: "Ваша сумма не ниже наименьшей суммы, получившей бюджетное (грантовое) место в 2026 году: {f}." },
    nogrant: { en: "Your total is below the lowest total that won a state-funded grant place in 2026. Places paid by the student are allotted by the university.", ir: "Jalpı upayıñız 2026-jılı mamlekettik grant ordun utkan eñ tömönkü jalpı upaydan tömön. Akı tölönüüchü orundardı universitet bölöt.", ru: "Ваша сумма ниже наименьшей суммы, получившей бюджетное (грантовое) место в 2026 году. Платные места распределяет вуз." },
    closed: { en: "Appeals against a result were heard within three working days of publication (22–24 July 2026) and are now closed.", ir: "Jıyıntıkka karshı apellyatsiyalar jarıyalangandan kiyin üch ish kündün ichinde (2026-jıldın 22–24-iyulu) karalgan jana azır jabıldı.", ru: "Апелляции на результаты принимались в течение трёх рабочих дней после публикации (22–24 июля 2026 года) и закрыты." },
    area: { en: "City or district", ir: "Shaar je aymak", ru: "Город или район" },
    order: { en: "Order", ir: "Tartibi", ru: "Порядок" },
    orders: [["no", { en: "By school", ir: "Mektep boyuncha", ru: "По школам" }], ["avg", { en: "By average total", ir: "Ortocho upay boyuncha", ru: "По среднему баллу" }]],
    school: { en: "School", ir: "Mektep", ru: "Школа" },
    cand: { en: "Candidates", ir: "Talapkerler", ru: "Участники" },
    avg: { en: "Average total", ir: "Ortocho jalpı upay", ru: "Средняя сумма" },
    passed: { en: "Passed all subjects", ir: "Bardık sabaktan ötkön", ru: "Сдали все предметы" },
    sum: { en: "All of the ISEZ", ir: "Bütün IAEZ", ru: "Вся ОЭЗИ" },
    sumH: { en: "Summary, 2026", ir: "Jıyıntık, 2026", ru: "Итоги 2026 года" },
    ext: { en: "External candidates", ir: "Sırttan tapshırgandar", ru: "Экстерны" },
    extN: { en: "Candidates without an ISEZ school certificate, who sat the test at the test points of Talas, Iyık Janyl, Tash-Kömür and Bazar-Korgon.", ir: "IAEZ mektep kübölügü jok, sınaktı Talas, Iyık Janyl, Tash-Kömür jana Bazar-Korgon sınak punkttarında tapshırgan talapkerler.", ru: "Участники без школьного документа ОЭЗИ, сдававшие тест в пунктах тестирования Таласа, Ийык-Джаныла, Таш-Кумыра и Базар-Коргона." },
    sch: { en: "Secondary School No. {n}", ir: "№{n} orto mektep", ru: "Средняя школа № {n}" },
    vsch: { en: "Secondary School No. {n}, {v}", ir: "№{n} orto mektep, {v}", ru: "Средняя школа № {n}, {v}" },
    ru: { en: "* Teaching in Russian. Candidates sat the test in Iradi or English.", ir: "* Okutuu orus tilinde. Talapkerler sınaktı irad je anglis tilinde tapshırgan.", ru: "* Обучение на русском языке. Участники сдавали тест на ирадском или английском языке." },
    tas: { en: "Talas American School does not take part (US curriculum; its graduates apply to universities abroad).", ir: "Talas Amerikan mektebi katıshpayt (AKSh programması; bütürüüchülörü chet eldegi universitetterge tapshırat).", ru: "Таласская американская школа в тесте не участвует (программа США; выпускники поступают в зарубежные вузы)." },
    helpH: { en: "The test", ir: "Sınak tuuraluu", ru: "О тесте" },
    helpP: { en: "The National Graduation Test (Uluttuk Sınak) ends grade 12 and has been set since 2005 by the Education Quality Agency. Candidates sit four compulsory subjects and one elective, in Iradi or in English, in June at the test points in the cities and district centres. Points are used for admission to Talas State University, the Nurzhan Polytechnic Institute and the colleges, and for the state-funded grant places.", ir: "Uluttuk sınak 12-klasstı bütüröt, 2005-jıldan beri anı Bilim sapatı agenttigi dayardayt. Talapkerler tört mildettüü sabak jana bir tandoo sabagın irad je anglis tilinde, iyun ayında shaarlardagı jana aymaktık borborlordogu sınak punkttarında tapshırat. Upaylar Talas mamlekettik universitetine, Nurzhan politekhnikalık institutuna jana kolledjderge kabıl aluuda jana mamlekettik grant orundarın bölüüdö koldonulat.", ru: "Национальный выпускной тест (Улуттук Сынак) завершает 12-й класс; с 2005 года его проводит Агентство качества образования. Участники сдают четыре обязательных предмета и один по выбору, на ирадском или английском языке, в июне в пунктах тестирования городов и районных центров. Баллы учитываются при поступлении в Таласский государственный университет, Нуржанский политехнический институт и колледжи и при распределении бюджетных (грантовых) мест." },
    thrH: { en: "Lowest total for a grant place, 2026", ir: "Grant orun üchün eñ tömönkü jalpı upay, 2026", ru: "Наименьшая сумма для грантового места, 2026" }
  };
  var THR = [[{ en: "TSU, Medicine", ir: "TMU, Meditsina", ru: "ТГУ, медицина" }, 421], [{ en: "TSU, Law", ir: "TMU, Ukuk", ru: "ТГУ, право" }, 398], [{ en: "Nurzhan Polytechnic, Petroleum engineering", ir: "Nurzhan politekhnikası, Neft injeneriyası", ru: "Нуржанский политех, нефтяное дело" }, 389], [{ en: "TSU, Economics", ir: "TMU, Ekonomika", ru: "ТГУ, экономика" }, 377], [{ en: "TSU, Physics, Mathematics and Computer Science", ir: "TMU, Fizika, matematika jana informatika", ru: "ТГУ, физика, математика и информатика" }, 352], [{ en: "TSU, Philology and Journalism", ir: "TMU, Filologiya jana jurnalistika", ru: "ТГУ, филология и журналистика" }, 344], [{ en: "TSU, Veterinary Medicine", ir: "TMU, Veterinariya", ru: "ТГУ, ветеринария" }, 318], [{ en: "TSU, Agriculture", ir: "TMU, Ayıl charbası", ru: "ТГУ, сельское хозяйство" }, 301]];
  // Area: code on the candidate number, number of numbered schools, mean total, villages for district schools, extra schools [name, mean shift, flag].
  var AREAS = [
    { id: "tl", code: "TL", n: 64, mean: 291, xs: [[{ en: "Lyceum No. 1 (physics and mathematics)", ir: "№1 litsey (fizika-matematika)", ru: "Лицей № 1 (физико-математический)" }, 92], [{ en: "Church School of St. Yuhanna, Old City", ir: "Iyık Yukhanna chirköö mektebi, Köhne Diz", ru: "Церковная школа св. Юханны, Старый город" }, 24]] },
    { id: "nz", code: "NZ", n: 52, mean: 266, xs: [[{ en: "Polytechnic Lyceum", ir: "Politekhnikalık litsey", ru: "Политехнический лицей" }, 71], [{ en: "Gymnasium “Znanie”*", ir: "“Znanie” gimnaziyası*", ru: "Гимназия «Знание»*" }, -31, 1], [{ en: "Bekzatov Foundation School No. 1*", ir: "Bekzatov fondunun №1 mektebi*", ru: "Школа фонда Бекзатова № 1*" }, -22, 1], [{ en: "Bekzatov Foundation School No. 2*", ir: "Bekzatov fondunun №2 mektebi*", ru: "Школа фонда Бекзатова № 2*" }, -37, 1]] },
    { id: "ij", code: "IJ", n: 16, mean: 274, xs: [[{ en: "St. Ephrem Church School, Cathedral Hill", ir: "Iyık Efrem chirköö mektebi, Chirköö döbösü", ru: "Церковная школа св. Ефрема, Соборный холм" }, 38]] },
    { id: "chu", code: "CH", n: 9, mean: 247, v: VILL.chu.concat(["Chu"]) },
    { id: "kb", code: "KB", n: 8, mean: 239, v: VILL.kb },
    { id: "td", code: "TD", n: 7, mean: 251, v: VILL.td },
    { id: "ln", code: "LN", n: 11, mean: 236, v: VILL.ln },
    { id: "tok", code: "TO", n: 4, mean: 244, v: VILL.tok },
    { id: "sb", code: "SB", n: 4, mean: 233, v: VILL.sb }
  ];
  var EXT = { id: "ext", code: "EX", cand: 2140, mean: 198 };
  function passRate(avg) { return Math.max(18, Math.min(97, Math.round(25 + (avg - 180) * 0.55))); }
  function schools(a) {
    var out = [], i, h, avg;
    for (i = 1; i <= a.n; i++) {
      h = hash("ns" + a.id + i); avg = a.mean - 34 + h % 69;
      out.push({ k: i, name: a.v ? L(TR.vsch, { n: i, v: a.v[(i - 1) % a.v.length] }) : L(TR.sch, { n: i }), cand: (a.v ? 70 : 150) + (h >>> 8) % (a.v ? 90 : 160), avg: avg });
    }
    (a.xs || []).forEach(function (x, j) { h = hash("nx" + a.id + j); out.push({ k: 900 + j, name: L(x[0]), cand: 40 + (h >>> 8) % 80, avg: a.mean + x[1] + h % 9 - 4, ru: x[2] }); });
    out.forEach(function (s) { s.pass = Math.min(98, passRate(s.avg) + (hash("np" + a.id + s.k) % 7) - 3); });
    return out;
  }
  function areaSum(a) { var s = schools(a), c = 0, w = 0, p = 0; s.forEach(function (x) { c += x.cand; w += x.avg * x.cand; p += x.pass * x.cand; }); return { cand: c, avg: Math.round(w / c), pass: Math.round(p / c) }; }
  function areaName(id) { return id === "ext" ? L(TR.ext) : L(pick(D, id)); }
  function testResult(n) {
    var m = /^(\d{2})(TL|NZ|IJ|CH|KB|TD|LN|TO|SB|EX)(\d{6})$/.exec(n);
    if (!m) return P(TR.bad, "warn");
    var y = 2000 + +m[1], cy = H.iradNow().getFullYear(), latest = H.iradNow().getMonth() >= 6 ? cy : cy - 1;
    if (y !== latest) return P(TR.old, "warn");
    var no = m[1] + "-" + m[2] + "-" + m[3], h = hash("ex" + no);
    if (h % 9 === 0 && no !== "26-TL-012345") return P(TR.nf, "warn");
    var area = m[2] === "EX" ? EXT : AREAS.filter(function (a) { return a.code === m[2]; })[0], shift = (area.mean - 270) / 5;
    var subs = TR.subs.concat([TR.els[(h >>> 3) % TR.els.length]]), low = 0, tot = 0;
    var rows = subs.map(function (s, i) { var p = Math.max(12, Math.min(100, Math.round(24 + (hash(no + i) % 75) + shift))); tot += p; if (p < 36) low++; return "<tr><td>" + esc(L(s)) + (i === 4 ? ' <span class="tiny">(' + esc(L(TR.elective)) + ")</span>" : "") + '</td><td class="num">' + (p < 36 ? "<b>" + p + "</b>" : p) + "</td></tr>"; });
    rows.push("<tr><th>" + esc(L(TR.total)) + '</th><th class="num">' + tot + "</th></tr>");
    var pt = area === EXT ? ["Talas", "Iyık Janyl", "Tash-Kömür", "Bazar-Korgon"][(h >>> 6) % 4] : areaName(area.id);
    var won = low ? [] : THR.filter(function (x) { return tot >= x[1]; }).map(function (x) { return L(x[0]); });
    return kv([[L(TR.no), esc(no)], [L(TR.session), esc(L(TR.june, { y: y }))], [L(TR.lang), esc(L(TR.langs[(h >>> 5) % 3 === 0 ? 1 : 0]))], [L(TR.point), esc(pt)]]) +
      '<div class="tw"><table class="tbl"><thead><tr><th>' + esc(L(TR.subj)) + '</th><th class="num">' + esc(L(TR.pts)) + "</th></tr></thead><tbody>" + rows.join("") + "</tbody></table></div>" +
      P(TR.pass, "tiny") + (low ? P(TR.retake, "warn") : won.length ? P(TR.grant, "ok", { f: won.join("; ") }) : P(TR.nogrant)) + P(TR.closed, "tiny");
  }
  function pageTests() {
    var help = "<h3>" + esc(L(TR.helpH)) + "</h3><p>" + esc(L(TR.helpP)) + "</p><h3>" + esc(L(TR.thrH)) + '</h3><div class="tw"><table class="tbl"><tbody>' + THR.map(function (x) { return "<tr><td>" + esc(L(x[0])) + '</td><td class="num">' + x[1] + "</td></tr>"; }).join("") + "</tbody></table></div>";
    var box = shell({ title: TR.title, desc: TR.desc, agency: TR.agency, icon: "cap", status: "ok", help: help });
    box.innerHTML = '<div class="xtabs" role="tablist">' + TR.tabs.map(function (x, i) { return '<a href="#' + (i ? "schools" : "mine") + '" role="tab" data-tab="' + i + '">' + esc(L(x)) + "</a>"; }).join("") + "</div>" +
      '<div data-pane="0">' + form("ftr", field("trn", L(TR.no), inp("trn", L(TR.ph), ' maxlength="16" style="text-transform:uppercase"')), L(TR.btn), "trr") + "</div>" +
      '<div data-pane="1" hidden><form class="flow" id="fts">' + field("tsa", L(TR.area), sel("tsa", opts(D).concat([["ext", L(TR.ext)], ["all", L(TR.sum)]]))) + field("tso", L(TR.order), sel("tso", opts(TR.orders))) + '</form><div id="tsr"></div></div>';
    function tab(i) { H.$$("[data-pane]").forEach(function (p) { p.hidden = p.getAttribute("data-pane") !== String(i); }); H.$$("[data-tab]").forEach(function (a) { a.className = a.getAttribute("data-tab") === String(i) ? "on" : ""; }); }
    H.$$("[data-tab]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); tab(+a.getAttribute("data-tab")); history.replaceState(null, "", a.getAttribute("href")); }); });
    onSub("ftr", function () { if (!need("trn")) return; res("trr", testResult(H.norm($("#trn").value))); });
    function table() {
      var a = $("#tsa").value, o = $("#tso").value, head, body;
      if (a === "all" || a === "ext") {
        var rows = a === "ext" ? [] : AREAS.map(function (x) { var s = areaSum(x); return [areaName(x.id), s.cand, s.avg, s.pass]; });
        rows.push([L(TR.ext), EXT.cand, EXT.mean, passRate(EXT.mean) - 6]);
        if (a === "all") { var c = 0, w = 0, p = 0; rows.forEach(function (r) { c += r[1]; w += r[1] * r[2]; p += r[1] * r[3]; }); rows.push(["<b>" + esc(L(TR.sum)) + "</b>", c, Math.round(w / c), Math.round(p / c)]); }
        head = L(TR.area);
        body = rows.map(function (r) { return "<tr><td>" + (/^</.test(r[0]) ? r[0] : esc(r[0])) + '</td><td class="num">' + fmtN(r[1]) + '</td><td class="num">' + r[2] + '</td><td class="num">' + r[3] + "%</td></tr>"; }).join("");
        $("#tsr").innerHTML = "<h3>" + esc(L(TR.sumH)) + '</h3><div class="tw"><table class="tbl"><thead><tr><th>' + esc(head) + '</th><th class="num">' + esc(L(TR.cand)) + '</th><th class="num">' + esc(L(TR.avg)) + '</th><th class="num">' + esc(L(TR.passed)) + "</th></tr></thead><tbody>" + body + "</tbody></table></div>" + (a === "ext" ? P(TR.extN, "tiny") : "");
        return;
      }
      var ar = AREAS.filter(function (x) { return x.id === a; })[0], s = schools(ar);
      s.sort(o === "avg" ? function (x, y) { return y.avg - x.avg; } : function (x, y) { return x.k - y.k; });
      $("#tsr").innerHTML = '<div class="tw"><table class="tbl"><thead><tr><th>' + esc(L(TR.school)) + '</th><th class="num">' + esc(L(TR.cand)) + '</th><th class="num">' + esc(L(TR.avg)) + '</th><th class="num">' + esc(L(TR.passed)) + "</th></tr></thead><tbody>" +
        s.map(function (x) { return "<tr><td>" + esc(x.name) + '</td><td class="num">' + x.cand + '</td><td class="num">' + x.avg + '</td><td class="num">' + x.pass + "%</td></tr>"; }).join("") + "</tbody></table></div>" +
        (a === "nz" ? P(TR.ru, "tiny") : "") + (a === "tl" ? P(TR.tas, "tiny") : "");
    }
    $("#tsa").addEventListener("change", table); $("#tso").addEventListener("change", table); table();
    var q = new URLSearchParams(location.search).get("n");
    if (q) { $("#trn").value = q; res("trr", testResult(H.norm(q))); }
    function fromHash() { tab(location.hash === "#schools" ? 1 : 0); }
    window.addEventListener("hashchange", fromHash); fromHash();
  }

  /* ================= /appeals/: online reception ================= */
  var AP = {
    title: { en: "Online reception", ir: "Onlayn kabıl aluu", ru: "Интернет-приёмная" },
    desc: { en: "Write to the Office of the Governor or a ministry, check what has happened to your appeal, and read answers of general interest.", ir: "Gubernatordun apparatına je ministrlikke jazıñız, kayrıluuñuzdun abalın tekshiriñiz jana jalpı kızıkchılıktagı jooptordu okuñuz.", ru: "Напишите в Аппарат губернатора или министерство, узнайте, что с вашим обращением, и прочитайте ответы, представляющие общий интерес." },
    agency: { en: "Public Reception of the Office of the Governor", ir: "Gubernatordun apparatının Kalk kabıl aluu bölümü", ru: "Общественная приёмная Аппарата губернатора" },
    tabs: [{ en: "Write an appeal", ir: "Kayrıluu jazuu", ru: "Написать обращение" }, { en: "Check an appeal", ir: "Kayrıluunu tekshirüü", ru: "Проверить обращение" }, { en: "Answers", ir: "Jooptor", ru: "Ответы" }],
    to: { en: "To", ir: "Kimge", ru: "Кому" },
    tos: [["gov", { en: "The Governor", ir: "Gubernatorgo", ru: "Губернатору" }], ["lg", { en: "The Lieutenant Governor", ir: "Vitse-gubernatorgo", ru: "Вице-губернатору" }], ["econ", { en: "Ministry of Economy", ir: "Ekonomika ministrligi", ru: "Министерство экономики" }], ["sec", { en: "Ministry of Internal Security", ir: "Ichki koopsuzduk ministrligi", ru: "Министерство внутренней безопасности" }], ["edu", { en: "Ministry of Education", ir: "Bilim berüü ministrligi", ru: "Министерство образования" }], ["health", { en: "Ministry of Health", ir: "Salamattık saktoo ministrligi", ru: "Министерство здравоохранения" }], ["lab", { en: "Ministry of Labour and Social Protection", ir: "Emgek jana sotsialdık korgoo ministrligi", ru: "Министерство труда и социальной защиты" }], ["inf", { en: "Department of Infrastructure and Communications", ir: "Infrastruktura jana baylanısh departamenti", ru: "Департамент инфраструктуры и связи" }]],
    topic: { en: "Subject", ir: "Temasy", ru: "Тема" },
    topics: [["util", { en: "Housing, heating and utilities", ir: "Turak jay, jılıtuu jana kommunaldık kızmattar", ru: "Жильё, отопление и коммунальные услуги" }], ["road", { en: "Roads and transport", ir: "Joldor jana transport", ru: "Дороги и транспорт" }], ["pens", { en: "Pensions and benefits", ir: "Pensiyalar jana jöölömdör", ru: "Пенсии и пособия" }], ["land", { en: "Land and building", ir: "Jer jana kurulush", ru: "Земля и строительство" }], ["pol", { en: "Police and Gendarmerie", ir: "Militsiya jana Jandarmeriya", ru: "Полиция и жандармерия" }], ["school", { en: "Schools and kindergartens", ir: "Mektepter jana bala bakchalar", ru: "Школы и детские сады" }], ["med", { en: "Health care", ir: "Salamattık saktoo", ru: "Здравоохранение" }], ["oth", { en: "Other", ir: "Bashka", ru: "Другое" }]],
    name: { en: "Your full name", ir: "Toluk atıñız", ru: "Ваши фамилия, имя" },
    addr: { en: "Postal address for the answer", ir: "Joop üchün pochta daregi", ru: "Почтовый адрес для ответа" },
    dist: { en: "City or district", ir: "Shaar je aymak", ru: "Город или район" },
    text: { en: "Text of the appeal", ir: "Kayrıluunun teksti", ru: "Текст обращения" },
    left: { en: "{n} characters left", ir: "{n} belgi kaldı", ru: "Осталось знаков: {n}" },
    agree: { en: "I confirm that the information given is true (Directive on Appeals of Citizens, item 6)", ir: "Berilgen maalımattın tuura ekenin tastıktaym (Jarandardın kayrıluuları tuuraluu direktiva, 6-punkt)", ru: "Подтверждаю достоверность сведений (Директива об обращениях граждан, пункт 6)" },
    send: { en: "Register the appeal", ir: "Kayrıluunu kattoo", ru: "Зарегистрировать обращение" },
    anon: { en: "Anonymous appeals are not considered (Directive on Appeals of Citizens, item 9). Give your full name and a postal address.", ir: "Atı jok kayrıluular karalbayt (Jarandardın kayrıluuları tuuraluu direktiva, 9-punkt). Toluk atıñızdı jana pochta daregiñizdi jazıñız.", ru: "Анонимные обращения не рассматриваются (Директива об обращениях граждан, пункт 9). Укажите фамилию, имя и почтовый адрес." },
    short: { en: "The text is too short to be considered. State the matter, what has been done already and what you ask for.", ir: "Tekst karaluu üchün ötö kıska. Maseleni, emne jasalganın jana emne surap jatkanıñızdı jazıñız.", ru: "Текст слишком короткий для рассмотрения. Изложите суть, что уже сделано и о чём вы просите." },
    agreeErr: { en: "Confirm that the information is true.", ir: "Maalımattın tuura ekenin tastıktañız.", ru: "Подтвердите достоверность сведений." },
    regd: { en: "Appeal registered", ir: "Kayrıluu kattaldı", ru: "Обращение зарегистрировано" },
    date: { en: "Date", ir: "Datası", ru: "Дата" },
    due: { en: "Answer due by", ir: "Joop möönötü", ru: "Срок ответа" },
    keep: { en: "Keep this number to check the appeal. The answer is sent by post to the address given. An appeal on a matter for another body is forwarded to it within five working days, and you are told so by post.", ir: "Kayrıluunu tekshirüü üchün bul nomerdi saktañız. Joop körsötülgön darekke pochta menen jönötülöt. Bashka organdın maselesi boyuncha kayrıluu agan besh ish kündün ichinde jönötülöt, bul tuuraluu sizge pochta menen kabarlanat.", ru: "Сохраните этот номер, чтобы проверить обращение. Ответ направляется по почте на указанный адрес. Обращение по вопросу другого органа пересылается ему в течение пяти рабочих дней, о чём вам сообщают по почте." },
    govNote: { en: "Appeals addressed to the Governor are considered on his behalf by the Public Reception of the Office of the Governor.", ir: "Gubernatorgo jazılgan kayrıluulardı anın atınan Gubernatordun apparatının Kalk kabıl aluu bölümü karayt.", ru: "Обращения на имя губернатора рассматривает от его имени Общественная приёмная Аппарата губернатора." },
    print: { en: "Print", ir: "Basıp chıgaruu", ru: "Распечатать" },
    no: { en: "Appeal number", ir: "Kayrıluunun nomeri", ru: "Номер обращения" },
    noPh: { en: "e.g. VR-26/301-0457", ir: "mısalı: VR-26/301-0457", ru: "например, VR-26/301-0457" },
    noBad: { en: "Appeal numbers look like VR-26/301-0457. Appeals sent by post have numbers like P-26/1234 and are checked by telephone: +996-39-2-21-00-60.", ir: "Kayrıluunun nomeri VR-26/301-0457 sıyaktuu bolot. Pochta menen jönötülgön kayrıluulardın nomeri P-26/1234 sıyaktuu, alar telefon menen tekshirilet: +996-39-2-21-00-60.", ru: "Номер обращения выглядит как VR-26/301-0457. Обращения, отправленные по почте, имеют номера вида P-26/1234 и проверяются по телефону: +996-39-2-21-00-60." },
    check: { en: "Check", ir: "Tekshirüü", ru: "Проверить" },
    future: { en: "There is no appeal with this number yet.", ir: "Bul nomerdegi kayrıluu azırıncha jok.", ru: "Обращения с таким номером пока нет." },
    status: { en: "Status", ir: "Abalı", ru: "Статус" },
    s0: { en: "Registered. Under consideration in the Public Reception.", ir: "Kattaldı. Kalk kabıl aluu bölümündö karaluuda.", ru: "Зарегистрировано. На рассмотрении в Общественной приёмной." },
    s1: { en: "Forwarded for consideration to the {b} (letter No. {l}). The answer will come from that body.", ir: "Karoo üchün {b} jönötüldü (kat №{l}). Jooptu oshol organ beret.", ru: "Направлено на рассмотрение: {b} (письмо № {l}). Ответ даст этот орган." },
    s2: { en: "Answered. The answer was sent by post on {d}.", ir: "Joop berildi. Joop {d} pochta menen jönötüldü.", ru: "Ответ дан. Ответ направлен по почте {d}." },
    s3: { en: "Consideration extended by 30 days to {d} (Directive on Appeals of Citizens, item 14). You have been told so by post.", ir: "Karoo möönötü 30 kün uzartıldı, {d} cheyin (Jarandardın kayrıluuları tuuraluu direktiva, 14-punkt). Bul tuuraluu sizge pochta menen kabarlandı.", ru: "Срок рассмотрения продлён на 30 дней, до {d} (Директива об обращениях граждан, пункт 14). Вам сообщено по почте." },
    s4: { en: "Left without consideration: the appeal repeats an earlier appeal on which an answer has been given (item 11).", ir: "Karalbay kaldı: kayrıluu murda joop berilgen kayrıluunu kaytalayt (11-punkt).", ru: "Оставлено без рассмотрения: обращение повторяет ранее направленное, на которое дан ответ (пункт 11)." },
    s5: { en: "Combined with other appeals on the same matter. One answer will be sent to all authors.", ir: "Oshol ele masele boyuncha bashka kayrıluular menen birikti. Bardık avtorlorgo bir joop jönötülöt.", ru: "Объединено с другими обращениями по тому же вопросу. Всем авторам будет направлен один ответ." },
    pubH: { en: "Answers to appeals of general interest", ir: "Jalpı kızıkchılıktagı kayrıluularga jooptor", ru: "Ответы на обращения, представляющие общий интерес" },
    pubP: { en: "Published with the authors' names removed. The answers are given as sent.", ir: "Avtorlordun attarı alınıp jarıyalandı. Jooptor jönötülgön boyuncha berildi.", ru: "Публикуются без имён авторов. Ответы приводятся в том виде, в каком направлены." },
    q: { en: "Appeal", ir: "Kayrıluu", ru: "Обращение" },
    a: { en: "Answer", ir: "Joop", ru: "Ответ" },
    statH: { en: "Appeals received in 2026", ir: "2026-jılı kelip tüshkön kayrıluular", ru: "Обращения, поступившие в 2026 году" },
    statP: { en: "1 January to 30 September 2026: {n} appeals by post and in person. The online reception opened on 1 October 2026.", ir: "2026-jıldın 1-yanvarınan 30-sentyabrına cheyin: pochta menen jana özü kelip berilgen {n} kayrıluu. Onlayn kabıl aluu 2026-jıldın 1-oktyabrında achıldı.", ru: "С 1 января по 30 сентября 2026 года: {n} обращений по почте и на личном приёме. Интернет-приёмная открыта 1 октября 2026 года." },
    helpH: { en: "How appeals are considered", ir: "Kayrıluular kantip karalat", ru: "Как рассматриваются обращения" },
    helpP: { en: "An appeal is answered within 30 days of registration, or 15 days if it needs no further inquiry. A complaint about a decision goes first to the body that made it. Appeals are accepted in Iradi, English and Russian; the answer is given in Iradi or in the language of the appeal.", ir: "Kayrıluuga kattalgandan kiyin 30 kündün ichinde, kosumcha tekshirüü kerek bolboso 15 kündün ichinde joop berilet. Chechimge dattanuu adegende anı kabıl algan organga jönötülöt. Kayrıluular irad, anglis jana orus tilderinde kabıl alınat; joop irad tilinde je kayrıluunun tilinde berilet.", ru: "Ответ на обращение даётся в течение 30 дней с регистрации или 15 дней, если не требуется дополнительной проверки. Жалоба на решение направляется сначала в принявший его орган. Обращения принимаются на ирадском, английском и русском языках; ответ даётся на ирадском или на языке обращения." },
    post: { en: "By post or in person: Public Reception of the Office of the Governor, Government House, Liberty Boulevard, Talas; Monday to Friday 9:00–12:00. E-mail: letters@iradgov.org.", ir: "Pochta menen je özüñüz: Gubernatordun apparatının Kalk kabıl aluu bölümü, Ökmöt üyü, Erkindik bulvarı, Talas; düyshömbüdön jumaga cheyin 9:00–12:00. E-pochta: letters@iradgov.org.", ru: "По почте или лично: Общественная приёмная Аппарата губернатора, Дом правительства, бульвар Свободы, Талас; понедельник–пятница 9:00–12:00. Эл. почта: letters@iradgov.org." }
  };
  var STATS = [["util", 31], ["pens", 17], ["road", 12], ["land", 11], ["school", 8], ["pol", 7], ["med", 6], ["oth", 8]];
  var PUB = [
    ["2026-10-21", "util", { en: "The heating in our block on Zavodskaya Street, Nurzhan, has not come on although the season began on 15 October. The flats are at 13 degrees and there are children and pensioners.", ir: "Nurzhandagı Zavodskaya köchösündögü üyübüzdö jılıtuu sezonu 15-oktyabrda bashtalganı menen jılıtuu berile elek. Kvartiralarda 13 gradus, baldar jana pensionerler bar.", ru: "В нашем доме на улице Заводской в Нуржане отопление не включено, хотя сезон начался 15 октября. В квартирах 13 градусов, есть дети и пенсионеры." }, { en: "Nurzhanteploset reports that the supply to your block was delayed by the replacement of 40 metres of the main pipe found unfit at the summer pressure test. The work was completed on 24 October and the block has been connected. The temperature in the flats is to be not lower than 18 degrees; deviations are reported to the Nurzhanteploset dispatcher.", ir: "Nurzhanteploset bildirgendey, üyüñüzgö jılıtuu jaykı basım sınoosunda jaraksız dep tabılgan 40 metr negizgi tütüktü almashtıruudan ulam kechikti. Ish 24-oktyabrda bütüp, üy tutashtırıldı. Kvartiralardagı temperatura 18 gradustan tömön bolboshu kerek; chetteöölör tuuraluu Nurzhanteplosettin dispetcherine kabarlanat.", ru: "«Нуржантеплосеть» сообщает, что подача тепла в ваш дом задержалась из-за замены 40 метров магистральной трубы, признанной негодной при летней опрессовке. Работы завершены 24 октября, дом подключён. Температура в квартирах должна быть не ниже 18 градусов; об отклонениях сообщается диспетчеру «Нуржантеплосети»." }],
    ["2026-10-17", "school", { en: "Please restore the Russian-language paper of the National Graduation Test. My son was taught in Russian for twelve years and must sit the test in a language he was not taught in.", ir: "Uluttuk sınaktın orus tilindegi variantın kalıbına keltirip beriñizchi. Uulum on eki jıl orus tilinde okudu jana sınaktı okubagan tilinde tapshırıshı kerek.", ru: "Прошу восстановить русскоязычный вариант Национального выпускного теста. Мой сын двенадцать лет учился на русском языке и должен сдавать тест на языке, на котором его не учили." }, { en: "Under the Language and Education Reform Act 1997 the languages of instruction in state schools are Iradi and English, and the National Graduation Test is set in these languages. Private schools may teach in other languages, and their pupils are informed of the language of the test on enrolment. No change is planned.", ir: "1997-jılkı Til jana bilim berüü reformasi tuuraluu aktka ılayık mamlekettik mekteptterdegi okutuu tilderi irad jana anglis tilderi, Uluttuk sınak da ushul tilderde ötkörülöt. Jeke mektepter bashka tilderde okutushu mümkün, alardın okuuchularına kabıl aluuda sınaktın tili tuuraluu kabarlanat. Özgörtüü plandalgan emes.", ru: "Согласно Закону о языковой и образовательной реформе 1997 года языками обучения в государственных школах являются ирадский и английский, и Национальный выпускной тест проводится на этих языках. Частные школы вправе вести обучение на других языках; их учащихся при зачислении информируют о языке теста. Изменений не планируется." }],
    ["2026-10-14", "pens", { en: "My pension is paid in som at the official rate, but everything in the bazaar is priced at the street rate. When will pensions be raised?", ir: "Pensiyam rasmiy kurs boyuncha som menen tölönöt, al emi bazarda baarı köchö kursu boyuncha. Pensiyalar kachan köböyöt?", ru: "Пенсия выплачивается в сомах по официальному курсу, а на базаре всё по уличному курсу. Когда поднимут пенсии?" }, { en: "Pensions are set in som and paid in som. They are indexed on 1 January each year to the consumer price index published by the Territorial Statistics Office. The official rate of the som is set by the Bank of Irad; rates offered by unlicensed dealers have no legal effect.", ir: "Pensiyalar som menen belgilenip, som menen tölönöt. Alar ar jılı 1-yanvarda Aymaktık statistika bölümü jarıyalagan keröölöm baa indeksine indekstelet. Somdun rasmiy kursun Irad banki belgileyt; litsenziyası jok dilerlerdin kurstarı ukuktuk küchkö ee emes.", ru: "Пенсии устанавливаются в сомах и выплачиваются в сомах. Они индексируются 1 января каждого года на индекс потребительских цен, публикуемый Территориальным статистическим управлением. Официальный курс сома устанавливает Банк Ирада; курсы нелицензированных дилеров юридической силы не имеют." }],
    ["2026-10-10", "oth", { en: "Why have I had no news of the Governor since the summer? Is he well?", ir: "Emne üchün jaydan beri Gubernator tuuraluu kabar jok? Al den soobu?", ru: "Почему с лета нет новостей о губернаторе? Он здоров?" }, { en: "The Governor continues to perform his duties. The Governor's decrees, addresses and official engagements are published on iradgov.org.", ir: "Gubernator öz mildetterin atkaruunu ulantuuda. Gubernatordun buyruktarı, kayrıluuları jana rasmiy ish-charaları iradgov.org saytında jarıyalanat.", ru: "Губернатор продолжает исполнять свои обязанности. Указы, обращения и официальные мероприятия губернатора публикуются на сайте iradgov.org." }],
    ["2026-10-08", "road", { en: "The road from Kara-Bulak to Arsha-Say has had the same holes since the spring floods. A bus lost a wheel there in September.", ir: "Kara-Bulaktan Arsha-Sayga cheyinki joldo jazgı suu tashkından beri oshol ele chukurlar turat. Sentyabrda tal jerde avtobus dönölögün jogottu.", ru: "На дороге от Кара-Булака до Арша-Сая с весеннего паводка те же ямы. В сентябре там у автобуса отлетело колесо." }, { en: "The section is included in the programme of road repairs for 2027, subject to funding. Until the repair, the district road service has been instructed to fill the holes and to put up speed-limit signs.", ir: "Bul bölük karjılandırılsa 2027-jılkı joldordu oñdoo programmasına kirgizildi. Oñdoogo cheyin aymaktık jol kızmatına chukurlardı tolturuu jana ıldamdıktı chektöö belgilerin koyuu tapshırıldı.", ru: "Участок включён в программу ремонта дорог на 2027 год при наличии финансирования. До ремонта районной дорожной службе поручено засыпать ямы и установить знаки ограничения скорости." }],
    ["2026-10-06", "land", { en: "I want to have our lane in Semiz named after my grandfather, who was a teacher there for forty years.", ir: "Semizdegi köchöbüzgö kırk jıl mugalim bolgon chon atamdın atın bergim kelet.", ru: "Хочу, чтобы нашему переулку в Семизе дали имя моего деда, который сорок лет был там учителем." }, { en: "Names of streets are given by the city council on the opinion of the Toponymic Section of the State Archives, under the Toponymic Heritage Statute. A proposal is lodged at the Section's window (Tuesdays 10:00–11:30) with the signatures of the residents of the lane and a reference from the place of work. Names of persons are given not earlier than ten years after death.", ir: "Köchölörgö attardı Toponimikalık muras tuuraluu statutka ılayık Mamlekettik arkhivdin Toponimikalık bölümünün pikiri boyuncha shaardık keñesh beret. Sunush bölümdün terezesine (sheyshembi 10:00–11:30) köchönün turguundarının kolu jana ish ordunan maalımkat menen tapshırılat. Adamdardın attarı kaza bolgondon on jıldan erte berilbeyt.", ru: "Названия улицам присваивает городской совет по заключению Топонимической секции Государственного архива в соответствии с Уставом о топонимическом наследии. Предложение подаётся в окошко секции (по вторникам 10:00–11:30) с подписями жителей переулка и характеристикой с места работы. Имена людей присваиваются не ранее чем через десять лет после смерти." }],
    ["2026-10-03", "oth", { en: "Why was sign-in by Tulpar ID switched off? It was the only service that worked.", ir: "Emne üchün Tulpar ID arkıluu kirüü öchürüldü? Al ishtegen jalgız kızmat ele.", ru: "Почему отключили вход через Tulpar ID? Это была единственная работающая услуга." }, { en: "Sign-in by Tulpar ID has been suspended pending a review of the service's compliance with the conditions for state services. Most e-Irad services do not need sign-in. The e-Irad card will be issued after the pilot.", ir: "Tulpar ID arkıluu kirüü kızmattın mamlekettik kızmattar üchün shartarga ılayıktuulugu tekshirilgenge cheyin toktotuldu. e-Iraddın köp kızmattarı kirüünü talap kılbayt. e-Irad kartası sınoo mezgilinen kiyin berilet.", ru: "Вход через Tulpar ID приостановлен до проверки соответствия сервиса условиям для государственных услуг. Для большинства услуг e-Irad вход не нужен. Карта e-Irad будет выдаваться после пилотного периода." }],
    ["2026-09-29", "pol", { en: "On State Route 1 near Toktogul I was stopped three times in one day and asked each time for the same documents.", ir: "Toktogulga jakın 1-mamlekettik joldo bir kündö üch jolu toktotulup, ar birinde oshol ele dokumentterdi surashtı.", ru: "На Государственной трассе 1 под Токтогулом меня за день останавливали трижды и каждый раз требовали одни и те же документы." }, { en: "Checks on State Route 1 are carried out by the Republican Gendarmerie under the 2009 corridor protocol and do not depend on earlier checks the same day. Drivers are asked to keep the documents ready. Complaints about the conduct of an officer are sent to the Gendarmerie duty officer, giving the place, time and badge number.", ir: "1-mamlekettik joldogu tekshirüülördü 2009-jılkı koridor protokoluna ılayık Respublikalık Jandarmeriya jürgüzöt jana alar oshol ele kündögü murdagı tekshirüülörgö baylanıshtuu emes. Aydoochulardan dokumentterdi dayar karmoo suranat. Kızmatkerdin jürüm-turumu boyuncha dattanuular ordun, ubaktısın jana jeton nomerin körsötüp Jandarmeriyanın nöböttögü kızmatkerine jönötülöt.", ru: "Проверки на Государственной трассе 1 проводит Республиканская жандармерия в соответствии с протоколом о коридоре 2009 года, и они не зависят от прежних проверок в тот же день. Водителей просят держать документы наготове. Жалобы на поведение сотрудника направляются дежурному жандармерии с указанием места, времени и номера жетона." }]
  ];
  function pageAppeals() {
    var help = "<h3>" + esc(L(AP.helpH)) + "</h3><p>" + esc(L(AP.helpP)) + "</p><p>" + esc(L(AP.post)) + "</p><h3>" + esc(L(AP.statH)) + "</h3><p>" + esc(L(AP.statP, { n: fmtN(38412) })) + '</p><div class="tw"><table class="tbl"><tbody>' + STATS.map(function (s) { return "<tr><td>" + esc(L(pick(AP.topics, s[0]))) + '</td><td class="num">' + s[1] + "%</td></tr>"; }).join("") + "</tbody></table></div>";
    var box = shell({ title: AP.title, desc: AP.desc, agency: AP.agency, icon: "mail", status: "ok", help: help });
    var MAX = 2000;
    box.innerHTML = '<div class="xtabs" role="tablist">' + AP.tabs.map(function (x, i) { return '<a href="#' + ["write", "check", "answers"][i] + '" role="tab" data-tab="' + i + '">' + esc(L(x)) + "</a>"; }).join("") + "</div>" +
      '<div data-pane="0">' + form("faw", field("apt", L(AP.to), sel("apt", opts(AP.tos))) + field("aps", L(AP.topic), sel("aps", opts(AP.topics))) + field("apn", L(AP.name), inp("apn", "", ' maxlength="60"')) + field("apd", L(AP.dist), sel("apd", opts(D))) + field("apa", L(AP.addr), inp("apa", "", ' maxlength="100"')) + field("apx", L(AP.text), ta("apx", MAX)) + '<p class="tiny" id="apleft"></p>' + H.chk("apk", L(AP.agree)), L(AP.send), "apr") + "</div>" +
      '<div data-pane="1" hidden>' + form("fac", field("acn", L(AP.no), inp("acn", L(AP.noPh), ' maxlength="20" style="text-transform:uppercase"')), L(AP.check), "acr") + "</div>" +
      '<div data-pane="2" hidden><h2>' + esc(L(AP.pubH)) + '</h2><p class="tiny">' + esc(L(AP.pubP)) + "</p>" + PUB.map(function (p, i) {
        return '<details class="faq"><summary>' + esc(fmtD(day(p[0]))) + " · " + esc(L(pick(AP.topics, p[1]))) + " · VR-26/" + dayNo(day(p[0])) + "-" + ("000" + (hash("pub" + i) % 9000 + 300)).slice(-4) + "</summary><p><b>" + esc(L(AP.q)) + ":</b> " + esc(L(p[2])) + "</p><p><b>" + esc(L(AP.a)) + ":</b> " + esc(L(p[3])) + "</p></details>";
      }).join("") + "</div>";
    function tab(i) { H.$$("[data-pane]").forEach(function (p) { p.hidden = p.getAttribute("data-pane") !== String(i); }); H.$$("[data-tab]").forEach(function (a) { a.className = a.getAttribute("data-tab") === String(i) ? "on" : ""; }); }
    H.$$("[data-tab]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); tab(+a.getAttribute("data-tab")); history.replaceState(null, "", a.getAttribute("href")); }); });
    function left() { $("#apleft").textContent = L(AP.left, { n: fmtN(MAX - $("#apx").value.length) }); }
    $("#apx").addEventListener("input", left); left();
    onSub("faw", function () {
      var nm = caps($("#apn").value), ad = $("#apa").value.trim(), tx = $("#apx").value.trim();
      if (nm.split(" ").length < 2 || !ad) { res("apr", P(AP.anon, "warn")); return; }
      if (tx.length < 40) { res("apr", P(AP.short, "warn")); return; }
      if (!$("#apk").checked) { res("apr", P(AP.agreeErr, "warn")); return; }
      var d = H.today(), no = "VR-" + String(d.getUTCFullYear()).slice(2) + "/" + dayNo(d) + "-" + ("000" + (hash(nm + tx) % 9000 + 300)).slice(-4), to = $("#apt").value;
      res("apr", refBox(AP.regd, no, [[L(AP.date), esc(fmtD(d))], [L(AP.to), esc(L(pick(AP.tos, to)))], [L(AP.topic), esc(L(pick(AP.topics, $("#aps").value)))], [L(AP.due), esc(fmtD(H.addDays(d, 30)))]]) +
        (to === "gov" ? P(AP.govNote, "tiny") : "") + P(AP.keep) + '<p><button type="button" class="btn ghost" id="appr">' + esc(L(AP.print)) + "</button></p>");
      $("#appr").addEventListener("click", function () { window.print(); });
    });
    onSub("fac", function () {
      if (!need("acn")) return;
      var n = H.norm($("#acn").value).replace("/", ""), m = /^VR(\d{2})(\d{1,3})(\d{4})$/.exec(n);
      if (!m || +m[2] < 1 || +m[2] > 366) { res("acr", P(AP.noBad, "warn")); return; }
      var reg = fromDayNo(2000 + +m[1], +m[2]), age = Math.round((H.today() - reg) / 864e5), h = hash("ac" + n), st;
      if (age < 0 || reg < day("2026-10-01")) { res("acr", P(AP.future, "warn")); return; }
      var body = AP.tos[2 + (h >>> 4) % (AP.tos.length - 2)][1], letter = String(1 + (h >>> 7) % 9).padStart(2, "0") + "-" + (1 + (h >>> 9) % 6) + "/" + (100 + (h >>> 11) % 900);
      if (age < 3) st = P(AP.s0);
      else if (h % 13 === 0) st = P(AP.s4, "warn");
      else if (h % 7 === 0) st = P(AP.s5);
      else if (age < 18 + h % 10) st = P(h % 3 ? AP.s1 : AP.s0, "", { b: L(body), l: letter });
      else if (h % 5 === 0 && age < 60) st = P(AP.s3, "warn", { d: fmtD(H.addDays(reg, 60)) });
      else st = P(AP.s2, "ok", { d: fmtD(H.addDays(reg, Math.min(age, 20 + h % 10))) });
      res("acr", kv([[L(AP.no), esc("VR-" + m[1] + "/" + m[2] + "-" + m[3])], [L(AP.date), esc(fmtD(reg))]]) + H4(AP.status) + st);
    });
    function fromHash() { tab({ "#check": 1, "#answers": 2 }[location.hash] || 0); }
    window.addEventListener("hashchange", fromHash); fromHash();
  }

  return { vote: pageVote, tests: pageTests, appeals: pageAppeals };
};
