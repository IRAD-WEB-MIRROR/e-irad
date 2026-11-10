/* e-Irad temporary reference slip.
   While the e-Irad ID card is not issued, offices accept a temporary reference slip printed from e-Irad
   (services/slip/). This one script is loaded by every office that accepts it, so the same slip gives the same
   person, account and bill everywhere. Everything is worked out in the browser from the slip number and the date:
   nothing typed is sent anywhere. The name is chosen from a list, so no real name is ever entered.

   Number: CC-YYMMDD-GGSS-NNNK
     CC      district office code (as the passport offices: TL, NZ, IJ, KA, KB, MK, TK, BK, TO, SB)
     YYMMDD  date of issue (a slip is valid 90 days)
     GG      given name, index into GIVEN (00-29 men, 30-59 women, 60-79 men, 80-99 women)
     SS      surname, index into STEMS
     NNN     serial; from 11 Nov 2026 also the family name's form, chosen on the slip page: serial % 3 =
             0 bare stem, 1 -ov/-ova/-ev, 2 uulu/kyzy. Slips dated earlier take the district's usual form.
     K       check digit (Luhn over the office letters' values and the digits)

   Use on a site:
     <div data-irad-slip="bank"></div>
     <script src="https://e-irad.org/assets/slip.js" defer></script>
   Kinds: power (Iradenergo personal account), bank (Talasbank current account), fine (Talas parking, fills the plate
   check), parcel (Irad Pochtasy, fills the tracking search), ticket (IradLoto, fills the ticket check), library (National
   Library card; data-src = catalogue JSON), queue (Talas Regional Hospital waiting list), debts (e-Irad Pay), info.
   data-fill="#input" puts the kind's number into that input and submits its form, so the site's own check answers.
   Or call IradSlip.parse(), .person(), .power(), .bank() from the site's own code. */
(function () {
  "use strict";
  if (window.IradSlip) return;

  var DISTRICTS = [
    { code: "TL", town: "Talas", form: "stem", net: "tl" },
    { code: "NZ", town: "Nurzhan", form: "ov", net: "nz" },
    { code: "IJ", town: "Iyık Janyl", form: "ov", net: "dist" },
    { code: "KA", town: "Kyzyl-Adyr", form: "pat", net: "dist", rural: "Kara-Buura District" },
    { code: "KB", town: "Kara-Bulak", form: "pat", net: "tl", rural: "Talas District" },
    { code: "MK", town: "Merke", form: "pat", net: "dist", rural: "Chu District" },
    { code: "TK", town: "Tash-Kömür", form: "ov", net: "dist", rural: "Lower Naryn District" },
    { code: "BK", town: "Bazar-Korgon", form: "pat", net: "dist", rural: "Lower Naryn District" },
    { code: "TO", town: "Toktogul", form: "pat", net: "dist", rural: "Toktogul District" },
    { code: "SB", town: "Sary-Bulak", form: "pat", net: "dist", rural: "Sary-Bulak District" }
  ];
  /* from the lore's name bank (soviet and territorial eras); index order is part of the number: only append */
  var GIVEN = [
    "Aibek", "Almaz", "Altynbek", "Azamat", "Bakyt", "Bektur", "Bolot", "Chingiz", "Daniyar", "Doolot",
    "Emil", "Erlan", "Erkin", "Ermek", "Jyrgalbek", "Kanat", "Kubanychbek", "Marat", "Maksat", "Mirlan",
    "Nurbek", "Nurlan", "Ruslan", "Samat", "Talant", "Timur", "Ulan", "Urmat", "Adilet", "Azat",
    "Aigul", "Aida", "Aijamal", "Ainura", "Aisulu", "Aizada", "Akmaral", "Anara", "Asel", "Bermet",
    "Baktygul", "Chynara", "Cholpon", "Damira", "Dinara", "Elmira", "Gulmira", "Gulnara", "Gulzat", "Jamila",
    "Jyldyz", "Kanykei", "Kunduz", "Mairam", "Meerim", "Nazgul", "Nurgul", "Saltanat", "Venera", "Zarina",
    /* 60-79 men, 80-99 women (added 10 Nov 2026) */
    "Almazbek", "Amanbek", "Asylbek", "Bakytbek", "Kanatbek", "Nurdin", "Aidar", "Akylbek", "Askar", "Baktybek",
    "Dastan", "Erbol", "Kairat", "Medet", "Melis", "Mukhtar", "Omurbek", "Sanjar", "Tilek", "Ulukbek",
    "Aizhan", "Elnura", "Nazira", "Nurjamal", "Roza", "Ainagul", "Aliya", "Begimai", "Burulai", "Dilbar",
    "Gulbara", "Jypar", "Mahabat", "Nurila", "Rahat", "Saadat", "Sezim", "Tolkun", "Aigerim", "Aiperi"
  ];
  var STEMS = [
    "Abyl", "Asan", "Asyl", "Atakan", "Bakir", "Beishenaly", "Bekmurat", "Bolot", "Choro", "Esen",
    "Imankul", "Kadyr", "Kalmat", "Kenesbay", "Kenje", "Kudaiberdi", "Moldo", "Moldokmat", "Nurmat", "Orozbek",
    "Sadyk", "Temir", "Toktobolot", "Turdumat", "Abdyrakhman", "Kemelbek", "Torobek", "Usubaly", "Baatyr", "Medet",
    "Ermat", "Kamchy", "Mamat", "Muratbek", "Tentek", "Umot",
    "Akmat", "Amanbek", "Asanaly", "Beishen", "Borubai", "Daniyar", "Eshmat", "Ergesh", "Imanaly", "Jusupbek",
    "Kalys", "Kasym", "Mamyt", "Mambet", "Omur", "Ormon", "Osmon", "Sagyn", "Sarybai", "Sultanaly",
    "Sydyk", "Tashtan", "Tilek", "Tokon", "Toktosun", "Tursun", "Usen", "Uson", "Joldoshbek", "Kalmurza",
    "Kanybek", "Karabek", "Rysbek", "Taiyr", "Tashbolot", "Akyl", "Bekbolot", "Kemel", "Kapar", "Kubat",
    "Alymbek", "Bekmurza", "Duishen", "Jumabai", "Jumaly", "Kerimbek", "Orozaly", "Saparbek", "Tynaly", "Myrzakul",
    "Beksultan", "Nurbek", "Sheraly", "Jeenbek", "Arstan", "Junus", "Yakup", "Ömür", "Bayaly", "Dyikan",
    "Nazarbek", "Oskon", "Tagai", "Turgunbai"
  ];
  /* streets from Iradenergo's planned-works table, so the works at a slip holder's address can be found */
  var STREETS = {
    TL: ["Ala-Too St.", "Bakshy St.", "Chynar St.", "Depot St.", "Gagarin St.", "Jibek Jolu Ave.", "Kerege St.", "Kirpich St.", "Köhne Diz St.", "Manas St.", "Metallurgy Ave.", "Orchard Lane", "Pochtamt St.", "Sarchashma St.", "Temir Jol St.", "Tokmok St.", "University St.", "Vokzal St."],
    NZ: ["Aviatorov St.", "Azatlık Prospect", "Kuznechnaya St.", "Mira St.", "Neftyanikov St.", "Polytechnic St.", "Privokzalnaya St.", "Pushkin St.", "Shkolnaya St.", "Stroiteley St.", "Studencheskaya St."],
    IJ: ["Bazaar St.", "Bridge St.", "Walnut St."],
    TO: ["Central St.", "Energetikov St."],
    other: ["Central St.", "School St.", "Bazar St.", "Jibek Jolu St.", "Mektep St."]
  };
  /* Talasbank branches by number (talasbank.net/branches.html) */
  var TB = {
    TL: [[1, "Alatau Heights"], [8, "Pochtamt"], [9, "Printers' Lane"], [10, "Soviet Centre-1"], [13, "Altyn"], [16, "South-1"], [19, "East-1"], [2, "Old City-1"]],
    NZ: [[22, "Mikrorayon Estates-1"], [25, "Navbahor"], [26, "NurGaz Worker Housing Complex"], [27, "Cathedral Hill"]],
    IJ: [[28, "Lower Town"]]
  };
  var EMPLOYERS = ["Talas City Administration", "Nurzhan City Administration", "Irad Pochtasy", "Iradenergo", "Talas State University", "Ministry of Education (a city school)", "Ministry of Health (a polyclinic)", "Irad Railways", "State Tax Service", "Gidromet"];
  var VALID_DAYS = 90;
  var FORMS = ["stem", "ov", "pat"], FORM_FROM = Date.UTC(2026, 10, 11);

  var T = {
    label: { en: "Temporary reference slip No.", ir: "Ubaktıluu maalımkat nomeri", ru: "Номер временной справки" },
    ph: { en: "e.g. TL-261110-0412-0375", ir: "mısalı TL-261110-0412-0375", ru: "например, TL-261110-0412-0375" },
    btn: { en: "Check", ir: "Tekshirüü", ru: "Проверить" },
    format: { en: "This is not a slip number. It is printed on the slip as two letters and three groups of digits.", ir: "Bul maalımkat nomeri emes. Al maalımkatta eki tamga jana üch top sıfra menen basılat.", ru: "Это не номер справки. На справке он напечатан как две буквы и три группы цифр." },
    check: { en: "The number does not check: one of the digits has been mistyped.", ir: "Nomer tuura emes: sıfralardın biri kata terilgen.", ru: "Номер не проходит проверку: одна из цифр набрана неверно." },
    future: { en: "A slip cannot be dated in the future.", ir: "Maalımkattın datası kelechekte bolboyt.", ru: "Справка не может быть выдана будущим числом." },
    expired: { en: "This slip expired on {d}. Print a new one on e-Irad.", ir: "Bul maalımkattın möönötü {d} bütkön. e-Iradtan janısın basıp alıñız.", ru: "Срок действия справки истёк {d}. Распечатайте новую на e-Irad." },
    get: { en: "No slip? Print one on e-Irad", ir: "Maalımkat jokpu? e-Iradtan basıp alıñız", ru: "Нет справки? Распечатайте на e-Irad" },
    note: { en: "Accepted in place of the e-Irad ID card until cards are issued. Nothing you type leaves this page.", ir: "e-Irad ID kartası berilgenge cheyin anın ordunda kabıl alınat. Siz tergen esh nerse bul barakchadan chıkpayt.", ru: "Принимается вместо карты e-Irad ID до начала их выдачи. Ничего из введённого не покидает эту страницу." }
  };

  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function pick(a, h) { return a[h % a.length]; }
  function iradNow() { var n = new Date(); return new Date(n.getTime() + n.getTimezoneOffset() * 60000 + 6 * 3600000); }
  function today() { var d = iradNow(); return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); }
  function addDays(d, n) { var x = new Date(d.getTime()); x.setUTCDate(x.getUTCDate() + n); return x; }
  function iso(d) { return d.toISOString().slice(0, 10); }
  function district(code) { for (var i = 0; i < DISTRICTS.length; i++) if (DISTRICTS[i].code === code) return DISTRICTS[i]; return null; }
  function letters(cc) { return String(cc.charCodeAt(0) - 55) + String(cc.charCodeAt(1) - 55); }
  function luhn(digits) { var s = 0, dbl = true; for (var i = digits.length - 1; i >= 0; i--) { var d = +digits[i]; if (dbl) { d *= 2; if (d > 9) d -= 9; } s += d; dbl = !dbl; } return (10 - s % 10) % 10; }
  function p2(n) { return (n < 10 ? "0" : "") + n; }
  function p3(n) { return ("00" + n).slice(-3); }

  function ov(stem, sex) {
    var s = stem.replace(/ö/g, "o").replace(/ü/g, "u"), l = s.toLowerCase(), out;
    if (/(ai|ay)$/.test(l)) out = s.slice(0, -1) + "ev";
    else if (/y$/.test(l)) out = s.slice(0, -1) + "iev";
    else if (/[aeiou]$/.test(l) || /(sh|ch|zh|j|ts)$/.test(l)) out = s + "ev";
    else out = s + "ov";
    if (out.charAt(0) === "J") out = "Zh" + out.slice(1);
    return out + (sex === "f" ? "a" : "");
  }

  /* make a slip number; issued defaults to today (Irad time) */
  function make(code, gi, si, issued, serial, form) {
    issued = issued || today();
    if (serial == null) serial = form == null ? Math.floor(Math.random() * 1000) : 3 * Math.floor(Math.random() * 333) + FORMS.indexOf(form);
    var y = issued.getUTCFullYear() % 100, m = issued.getUTCMonth() + 1, d = issued.getUTCDate();
    var body = p2(y) + p2(m) + p2(d) + p2(gi) + p2(si) + p3(serial);
    var k = luhn(letters(code) + body);
    return code + "-" + body.slice(0, 6) + "-" + body.slice(6, 10) + "-" + body.slice(10) + k;
  }

  function parse(str) {
    var s = String(str || "").toUpperCase().replace(/[\s\-\.\/№#]/g, "").replace(/^NO/, "");
    var m = /^([A-Z]{2})(\d{6})(\d{2})(\d{2})(\d{3})(\d)$/.exec(s);
    if (!m || !district(m[1]) || +m[3] >= GIVEN.length || +m[4] >= STEMS.length) return { ok: false, err: "format" };
    if (luhn(letters(m[1]) + m[2] + m[3] + m[4] + m[5]) !== +m[6]) return { ok: false, err: "check" };
    var y = 2000 + +m[2].slice(0, 2), mo = +m[2].slice(2, 4), d = +m[2].slice(4, 6);
    var issued = new Date(Date.UTC(y, mo - 1, d));
    if (issued.getUTCMonth() !== mo - 1 || issued.getUTCDate() !== d || y < 2026) return { ok: false, err: "format" };
    var t = today();
    if (issued > t) return { ok: false, err: "future" };
    var until = addDays(issued, VALID_DAYS);
    var no = m[1] + "-" + m[2] + "-" + m[3] + m[4] + "-" + m[5] + m[6];
    var slip = { ok: true, no: no, code: m[1], district: district(m[1]), issued: issued, until: until, gi: +m[3], si: +m[4], serial: +m[5], h: hash(no) };
    if (until < t) { slip.ok = false; slip.err = "expired"; }
    return slip;
  }

  function sexOf(gi) { return (gi >= 30 && gi < 60) || gi >= 80 ? "f" : "m"; }
  function surnameOf(stem, form, sex) { return form === "stem" ? stem : form === "ov" ? ov(stem, sex) : stem + (sex === "f" ? " kyzy" : " uulu"); }
  function person(slip) {
    var h = slip.h, D = slip.district, sex = sexOf(slip.gi);
    var given = GIVEN[slip.gi], stem = STEMS[slip.si];
    var surname = surnameOf(stem, slip.issued.getTime() >= FORM_FROM ? FORMS[slip.serial % 3] : D.form, sex);
    var born = 1958 + (h % 46), bm = 1 + (hash("bm" + slip.no) % 12), bd = 1 + (hash("bd" + slip.no) % 28);
    var streets = STREETS[slip.code] || STREETS.other, street = pick(streets, hash("st" + slip.no));
    var house = 1 + (hash("hs" + slip.no) % 96), flat = D.rural || hash("fl" + slip.no) % 3 === 0 ? 0 : 1 + (hash("ft" + slip.no) % 80);
    var addr = street + " " + house + (flat ? ", flat " + flat : "") + ", " + D.town;
    return { sex: sex, given: given, surname: surname, full: given + " " + surname, initials: given.charAt(0) + ". " + surname,
             born: new Date(Date.UTC(born, bm - 1, bd)), year: born, street: street, house: house, flat: flat, address: addr,
             town: D.town, area: D.rural || D.town };
  }

  /* Iradenergo account: the same bill e-Irad's electricity service shows for this account (keep the two in step) */
  function power(slip) {
    var net = slip.district.net, n = 1000000000 + (slip.h % 8999999999) % 8999999999, acct, h, i = 0;
    do { acct = String(n + i * 7919); h = hash("el" + net + acct); i++; } while (h % 13 === 0);
    var prev = 10000 + (h % 80000), kwh = 140 + (h % 260), tariff = 0.32;
    var arr = h % 7 === 0 ? Math.round((90 + h % 70) * tariff * 100) / 100 : 0;
    var amt = Math.round(kwh * tariff * 100) / 100, t = today();
    return { net: net, acct: acct, acctFmt: acct.slice(0, 4) + " " + acct.slice(4, 7) + " " + acct.slice(7), prev: prev, kwh: kwh, tariff: tariff,
             amount: amt, arrears: arr, total: Math.round((amt + arr) * 100) / 100,
             period: new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() - 1, 1)), due: new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), 25)),
             network: net === "tl" ? "Talas Electric Networks" : net === "nz" ? "Nurzhan Electric Networks" : "Iradenergo district service" };
  }

  /* Talasbank current account: income on its day each month, cash, bills; the electricity line follows power() */
  function bank(slip) {
    var P = person(slip), h = hash("tb" + slip.no), t = today(), list = TB[slip.code];
    var br = list ? pick(list, h) : null;
    var acct = "128" + p2(br ? br[0] : 21) + String(10000000 + (h % 89999999));
    var age = t.getUTCFullYear() - P.year, kind = age >= 63 ? "pension" : h % 5 === 0 ? "none" : "wage";
    var income = kind === "pension" ? 4200 + (h % 2300) : kind === "wage" ? 6400 + (hash("wg" + slip.no) % 5200) : 0;
    var payday = kind === "pension" ? 10 : 5, employer = kind === "wage" ? pick(EMPLOYERS, hash("em" + slip.no)) : "";
    if (kind === "wage" && slip.code !== "TL" && /^Talas City/.test(employer)) employer = slip.code === "NZ" ? "Nurzhan City Administration" : "Irad Pochtasy";
    if (kind === "wage" && slip.code === "TL" && /^Nurzhan/.test(employer)) employer = "Talas City Administration";
    var pw = power(slip), ops = [], start = addDays(t, -40);
    function on(y, m, d) { var x = new Date(Date.UTC(y, m, d)); return x >= start && x <= t ? x : null; }
    for (var k = -2; k <= 0; k++) {
      var y = t.getUTCFullYear(), m = t.getUTCMonth() + k, d;
      if (income && (d = on(y, m, payday))) {
        ops.push([d, kind === "pension" ? "Pension, Social Fund of the ISEZ" : "Salary, " + employer, income]);
        var c1 = on(y, m, payday + 1 + (hash("c1" + m + slip.no) % 3));
        if (c1) ops.push([c1, "Cash withdrawal, ATM", -Math.round(income * (0.4 + (hash("c2" + m + slip.no) % 30) / 100) / 100) * 100]);
      }
      var att = on(y, m, 12 + (hash("at" + slip.no) % 6));
      if (att && hash("ah" + slip.no) % 3) ops.push([att, "Attelkom, home telephone and internet", -(180 + (hash("aa" + slip.no) % 6) * 30)]);
      /* electricity: paid for earlier months, not for the bill now due; none at all while there are arrears */
      var el = on(y, m, 15 + (hash("ep" + slip.no) % 9));
      if (el && !pw.arrears && k < 0) ops.push([el, "Iradenergo, account " + pw.acct.slice(-4) + ", electricity", -Math.round((pw.kwh * 0.32 + (hash("ev" + m + slip.no) % 20) - 10) * 100) / 100]);
    }
    ops.sort(function (a, b) { return b[0] - a[0]; });
    var bal = 300 + (h % 9000) + (h % 100) / 100;
    var card = kind === "pension" ? "Classic" : kind === "wage" ? "Salary" : "Classic";
    return { acct: acct, acctFmt: acct.slice(0, 3) + " " + acct.slice(3, 5) + " " + acct.slice(5), branch: br ? p2(br[0]) + " " + br[1] : "cash office, " + slip.district.town,
             kind: kind, income: income, payday: payday, employer: employer, balance: Math.round(bal * 100) / 100, ops: ops,
             card: card, cardEnd: String(1000 + (hash("cd" + slip.no) % 9000)), dollars: h % 4 === 0 ? (hash("us" + slip.no) % 900) + 50 : 0, power: pw };
  }

  /* vehicle and Talas parking fine: the plate gives the same answer in Talas City Hall's own plate check */
  var REG = { TL: "01", NZ: "02", IJ: "03", MK: "04", KA: "05", KB: "06", TK: "07", BK: "07", TO: "08", SB: "09" };
  var PL = "ABEKMNOPSTU", TPLACES = ["Liberty Boulevard", "Central Square (west side)", "Bazar-i Kalan, Kök-Bel road", "Regional Hospital car park", "Central Post Office"];
  function talasHash(v) { var x = 0; for (var i = 0; i < v.length; i++) x = (x * 31 + v.charCodeAt(i)) >>> 0; return x; }
  function vehicle(slip) {
    var h = hash("vh" + slip.no); if (h % 3 === 0) return null;
    var want = h % 2 === 0, plate, hs, i = 0;
    do { var x = hash("pl" + i + slip.no); plate = REG[slip.code] + " " + PL[x % 11] + " " + (100 + (x >>> 4) % 900) + " " + PL[(x >>> 14) % 11] + PL[(x >>> 19) % 11]; hs = talasHash(plate.replace(/\s+/g, "")); i++; } while ((hs % 4 === 0) !== want);
    var v = { plate: plate, fine: null };
    if (want) v.fine = { date: new Date(Date.now() - (hs % 20 + 3) * 864e5), place: TPLACES[hs % 5], amount: 10, ref: "TC-" + (100000 + hs % 900000) };
    return v;
  }
  /* a parcel awaiting collection at the post office of the slip's town (same result on post.iradgov.org and e-Irad) */
  var POST = { TL: 0, NZ: 1, IJ: 2, KA: 3, TK: 4, BK: 5, TO: 6, KB: 0, MK: 0, SB: 0 };
  var POSTN = ["Talas Central Post Office", "Post Office No. 14, Nurzhan", "Post Office No. 3, Iyık Janyl", "Post Office, Kyzyl-Adyr", "Post Office, Tash-Kömür", "Post Office, Bazar-Korgon", "Post Office, Toktogul"];
  function parcel(slip) {
    var dest = POST[slip.code], n, h, i = 0;
    do { n = "IP" + (10000000 + hash("pc" + i + slip.no) % 89999999); h = hash(n); i++; } while (h % 9 === 0 || (h % 4 !== 1 && h % 4 !== 2) || (h >>> 3) % 8 !== dest);
    return { no: n, office: POSTN[dest] };
  }
  /* last Saturday's Altın Bayge ticket; needs IradLoto's own loto.js on the page */
  var LREG = { TL: 1, NZ: 2, IJ: 3, MK: 4, KA: 5, KB: 6, TK: 7, BK: 7, TO: 7, SB: 8 };
  function ticket(slip) {
    var Lo = window.Loto; if (!Lo) return null;
    var hist = Lo.history("ab"), last = hist[hist.length - 1], h = hash("lt" + slip.no);
    if (!last) return null;
    return { serial: Lo.makeSerial("ab", last.no, LREG[slip.code] * 1000 + 10 + h % 900, 1 + (h >>> 8) % 99000), draw: last.no };
  }
  /* National Library reader's card with one overdue book, chosen from the library's own catalogue */
  function library(slip, items) {
    var h = hash("lb" + slip.no), t = today();
    if (h % 4 === 0) return null;
    var books = (items || []).filter(function (r) { return !r.status && r.form === "book"; });
    var b = books.length ? books[(h >>> 4) % books.length] : null, took = addDays(t, -(25 + h % 36));
    return { card: "NLI " + (2014 + h % 12) + "/" + (10000 + (h >>> 6) % 90000), book: b, took: took, due: addDays(took, 21) };
  }
  /* Talas Regional Hospital: place on a planned-admission waiting list, moving each week */
  var DEPTS = [["Cardiac surgery", "dept-cardiac-surgery.html", 3], ["Eye and ENT", "dept-eye-ent.html", 9], ["Urology", "dept-urology.html", 6], ["Surgery", "dept-surgery.html", 12], ["Neurology", "dept-neurology.html", 7], ["Rehabilitation", "dept-rehab.html", 5]];
  function queue(slip) {
    var h = hash("hq" + slip.no), t = today();
    if (h % 3 === 0) return null;
    var d = DEPTS[(h >>> 3) % DEPTS.length], since = addDays(t, -(20 + h % 160)), weeks = Math.floor((t - since) / (7 * 864e5));
    var start = 30 + (h >>> 5) % 220, place = Math.max(1, start - weeks * d[2]);
    return { dept: d[0], href: d[1], since: since, ref: "057/u-" + (1000 + (h >>> 9) % 9000), place: place, weeks: Math.ceil(place / d[2]) };
  }

  /* ---- the counter box ---- */
  var LANG = "en";
  function L(o, v) { var s = o[LANG] || o.en; if (v) for (var k in v) s = s.replace("{" + k + "}", v[k]); return s; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function dmy(d) { return p2(d.getUTCDate()) + "." + p2(d.getUTCMonth() + 1) + "." + d.getUTCFullYear(); }
  function long(d) { return d.getUTCDate() + " " + MON[d.getUTCMonth()] + " " + d.getUTCFullYear(); }
  function som(x) { var s = Math.abs(x).toFixed(2).split("."); return (x < 0 ? "−" : "") + s[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "." + s[1] + " som"; }
  function rows(r) { return '<table class="isl-t">' + r.map(function (x) { return "<tr><th>" + esc(x[0]) + "</th><td>" + x[1] + "</td></tr>"; }).join("") + "</table>"; }

  var KINDS = {
    info: function (s) {
      var P = person(s);
      return rows([["Slip", esc(s.no)], ["Name", esc(P.full)], ["Year of birth", P.year], ["Registered address", esc(P.address)], ["Valid until", long(s.until)]]);
    },
    power: function (s) {
      var P = person(s), W = power(s), out = rows([["Account holder", esc(P.initials)], ["Personal account", esc(W.acctFmt)], ["Address", esc(P.address)], ["Network", esc(W.network)],
        ["Billing period", MON[W.period.getUTCMonth()] + " " + W.period.getUTCFullYear()], ["Meter readings", W.prev.toLocaleString("en") + " → " + (W.prev + W.kwh).toLocaleString("en") + " kWh"],
        ["Consumption", W.kwh + " kWh × 0.32 som = " + som(W.amount)]].concat(W.arrears ? [["Unpaid from earlier periods", '<b class="isl-bad">' + som(W.arrears) + "</b>"]] : []).concat([["Amount due", "<b>" + som(W.total) + "</b> by " + long(W.due)]]));
      if (W.arrears) out += '<p class="isl-warn">There is a debt on this account. A debt of more than two months can lead to disconnection ten days after a written warning.</p>';
      out += '<div class="isl-works" data-street="' + esc(P.street) + '" data-town="' + esc(P.town) + '"></div>';
      return out;
    },
    fine: function (s) {
      var P = person(s), V = vehicle(s);
      if (!V) return rows([["Owner", esc(P.full)], ["Vehicle", "No vehicle is registered to this slip."]]);
      return { html: rows([["Owner", esc(P.initials)], ["Vehicle registration number", "<b>" + esc(V.plate) + "</b>"]]) + '<p class="isl-small">The registration number has been entered in the check on this page.</p>', fill: V.plate };
    },
    parcel: function (s) {
      var P = person(s), C = parcel(s);
      return { html: rows([["Addressee", esc(P.full) + ", " + esc(P.address)], ["Notice of arrival (form P-22)", "<b>" + esc(C.no) + "</b>"], ["Post office", esc(C.office)]]) + '<p class="isl-small">The tracking number has been entered in the search on this page. Bring the slip and the notice to the counter.</p>', fill: C.no };
    },
    ticket: function (s) {
      var T2 = ticket(s);
      if (!T2) return "<p>Ticket information is not available.</p>";
      return { html: rows([["Ticket bought by the slip holder", "Altın Bayge, draw No. " + T2.draw], ["Serial number", "<b>" + esc(T2.serial) + "</b>"]]) + '<p class="isl-small">The serial number has been entered in the check on this page.</p>', fill: T2.serial };
    },
    library: function (s) {
      var P = person(s);
      return { html: '<p class="isl-small">Looking up the reader\'s card…</p>', then: function (out, el) {
        var src = el.getAttribute("data-src");
        function draw(items) {
          var B = library(s, items);
          if (!B) { out.innerHTML = rows([["Reader", esc(P.full)], ["Reader's card", "No reader's card is registered to this slip. Readers register at the desk of the Great Reading Room."]]); return; }
          var late = Math.round((today() - B.due) / 864e5);
          out.innerHTML = rows([["Reader", esc(P.full)], ["Reader's card", esc(B.card)]].concat(B.book ? [["On loan", "<i>" + esc(B.book.title) + "</i> (" + esc(B.book.year) + "), " + esc(B.book.call)], ["Issued", dmy(B.took)], ["Due back", '<b class="isl-bad">' + dmy(B.due) + "</b>, " + late + " days overdue"]] : [])) +
            '<p class="isl-warn">Further loans are suspended until the overdue book is returned. Return it at the issue desk; renewal by telephone is not possible.</p>';
        }
        if (!src || !window.fetch) { draw([]); return; }
        fetch(src).then(function (r) { return r.json(); }).then(function (d) { draw(d.items || d); }).catch(function () { draw([]); });
      } };
    },
    queue: function (s) {
      var P = person(s), Q = queue(s);
      if (!Q) return rows([["Patient", esc(P.full)], ["Waiting list", "This slip is not on any planned-admission waiting list. A place is given only by a referral (form 057/u)."]]);
      return rows([["Patient", esc(P.initials) + ", born " + P.year], ["Department", '<a href="' + Q.href + '">' + esc(Q.dept) + "</a>"], ["Referral", esc(Q.ref) + " of " + dmy(Q.since)], ["Place on the waiting list", "<b>" + Q.place + "</b>"],
        ["Expected admission", Q.place <= 2 ? "this or next week: wait for the department's call" : "in about " + Q.weeks + " weeks"]]) + '<p class="isl-small">The list moves each Monday. Keep your telephone on: a place not taken when called goes to the next patient.</p>';
    },
    debts: function (s) {
      var P = person(s), W = power(s), V = vehicle(s), r = [["Payer", esc(P.full)], ["Electricity, " + esc(W.network) + ", account " + esc(W.acct), som(W.total) + (W.arrears ? ' <span class="isl-bad">(incl. ' + som(W.arrears) + " unpaid)</span>" : "") + ' · <a href="index.html?p=electricity">pay</a>']];
      if (V && V.fine) r.push(["Parking fine, Talas City Hall, " + esc(V.fine.ref), som(V.fine.amount) + " · pay at a Talasbank branch"]);
      return rows(r) + '<p class="isl-small">Debts known to e-Irad for this slip. Payments made at a branch appear after the next bill.</p>';
    },
    bank: function (s) {
      var P = person(s), B = bank(s);
      var out = rows([["Account holder", esc(P.full)], ["Current account (som)", esc(B.acctFmt)], ["Branch", esc(B.branch)], ["Card", esc(B.card) + " card ending " + B.cardEnd],
        ["Balance", "<b>" + som(B.balance) + "</b>"]].concat(B.dollars ? [["Dollar account", "US$" + B.dollars + ".00"]] : []));
      out += '<table class="isl-t isl-ops"><tr><th>Date</th><th>Operation</th><th>Amount</th></tr>' + (B.ops.length ? B.ops.map(function (o) {
        return "<tr><td>" + dmy(o[0]) + "</td><td>" + esc(o[1]) + '</td><td class="isl-n">' + som(o[2]) + "</td></tr>"; }).join("") : '<tr><td colspan="3">No operations in the last 40 days.</td></tr>') + "</table>";
      if (B.power.arrears) out += '<p class="isl-warn">No payment to Iradenergo has been made from this account for some months.</p>';
      return out;
    }
  };

  var CSS = ".isl-form{display:flex;flex-wrap:wrap;gap:6px;align-items:end;margin:6px 0}.isl-form label{display:block;width:100%;font-weight:bold}.isl-form input{font:inherit;padding:4px 6px;min-width:15em;max-width:100%;text-transform:uppercase}.isl-form button{font:inherit;cursor:pointer}.isl-out{margin-top:8px}.isl-t{border-collapse:collapse;margin:6px 0;max-width:100%}.isl-t th,.isl-t td{border:1px solid rgba(128,128,128,.4);padding:3px 8px;text-align:left;vertical-align:top}.isl-t th{font-weight:normal;opacity:.85}.isl-ops th{font-weight:bold;opacity:1}.isl-n{text-align:right;white-space:nowrap}.isl-err,.isl-bad{color:#b00}.isl-warn{border-left:3px solid #c80;padding:4px 8px}.isl-small{font-size:.85em;opacity:.8}";
  function style() { if (document.getElementById("isl-css")) return; var st = document.createElement("style"); st.id = "isl-css"; st.textContent = CSS; document.head.appendChild(st); }

  function store(v) { try { if (v === undefined) return localStorage.getItem("irad_slip") || ""; localStorage.setItem("irad_slip", v); } catch (e) { return ""; } }

  function mount(el, kind, opts) {
    opts = opts || {};
    LANG = opts.lang || (({ ky: "ir", ru: "ru" })[document.documentElement.lang] || "en");
    style();
    var id = "isl" + Math.floor(Math.random() * 1e6), render = typeof kind === "function" ? kind : KINDS[kind] || KINDS.info;
    el.innerHTML = '<form class="isl-form" novalidate><label for="' + id + '">' + esc(L(T.label)) + '</label><input id="' + id + '" autocomplete="off" spellcheck="false" placeholder="' + esc(L(T.ph)) + '" maxlength="24"><button type="submit" class="' + esc(opts.btnClass || "") + '">' + esc(L(T.btn)) + '</button></form>' +
      '<p class="isl-small">' + esc(L(T.note)) + ' <a href="https://e-irad.org/services/slip/">' + esc(L(T.get)) + '</a></p><div class="isl-out" aria-live="polite"></div>';
    var f = el.querySelector("form"), inp = el.querySelector("input"), out = el.querySelector(".isl-out");
    inp.value = store();
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var s = parse(inp.value);
      if (!s.ok) { out.innerHTML = '<p class="isl-err">' + esc(L(T[s.err] || T.format, { d: s.until ? long(s.until) : "" })) + "</p>"; return; }
      inp.value = s.no; store(s.no);
      var r = render(s, api);
      out.innerHTML = typeof r === "string" ? r : r.html;
      if (r && r.then) r.then(out, el);
      var fsel = el.getAttribute("data-fill");
      if (r && r.fill && fsel) {
        var fi = document.querySelector(fsel);
        if (fi) { fi.value = r.fill; var ff = fi.form; if (ff) { if (ff.requestSubmit) ff.requestSubmit(); else ff.dispatchEvent(new Event("submit", { cancelable: true })); } }
      }
      if (opts.after) opts.after(out, s, api);
      el.dispatchEvent(new CustomEvent("irad-slip", { detail: s, bubbles: true }));
    });
    if (inp.value && opts.auto) f.dispatchEvent(new Event("submit"));
  }

  var api = { DISTRICTS: DISTRICTS, GIVEN: GIVEN, STEMS: STEMS, FORMS: FORMS, sexOf: sexOf, surnameOf: surnameOf, VALID_DAYS: VALID_DAYS, hash: hash, today: today, make: make, parse: parse, person: person, power: power, bank: bank, vehicle: vehicle, parcel: parcel, ticket: ticket, library: library, queue: queue, ov: ov, mount: mount, kinds: KINDS, store: store,
              fmt: { som: som, dmy: dmy, long: long } };
  window.IradSlip = api;

  function auto() { var els = document.querySelectorAll("[data-irad-slip]"); for (var i = 0; i < els.length; i++) mount(els[i], els[i].getAttribute("data-irad-slip"), { btnClass: els[i].getAttribute("data-btn-class") || "" }); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", auto); else auto();
})();
