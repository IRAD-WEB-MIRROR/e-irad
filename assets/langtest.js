/* e-Irad: /language-test/, practice for the State Language Test (Mamlekettik til sınagı) of the Education Quality
   Agency, and the certificate check. Same rules as app.js: nothing is sent or stored. The questions are put together
   in the page from the question bank (assets/langtest-bank.js, the Online dictionary of the Iradi language of Talas
   State University); a variant number gives the same questions on any device. A practice certificate's number carries
   its date, level and score and a check letter, so the check tab can recognise it without any register. */
window.E_LANGTEST = function (H) {
  "use strict";
  var $ = H.$, $$ = H.$$, esc = H.esc, L = H.L, t = H.t, hash = H.hash, fmtD = H.fmtD, kv = H.kv, P = H.P, H4 = H.H4;
  var field = H.field, inp = H.inp, need = H.need;
  var B = window.E_LTBANK || [], DICT = "https://talasuniversity.org/dictionary/";
  var N = 20, PASS = 60, FIRST_YEAR = 17, LAUNCH = "2026-11-03", LET = "ABCEHKMPTX";
  function T(en, ir, ru) { return { en: en, ir: ir, ru: ru }; }

  var C = {
    title: T("State Language Test: practice and certificate check", "Mamlekettik til sınagı: mashıguu jana kuböölüktü teksherüü", "Тест по государственному языку: пробный тест и проверка сертификата"),
    desc: T("Try a practice variant of the State Language Test at level A, B or C, and check a certificate by its number.", "Mamlekettik til sınagının A, B je C deñgeeldegi mashıguu variantın ötüp körüñüz jana kuböölüktü nomeri boyuncha teksheriñiz.", "Пройдите пробный вариант теста по государственному языку уровня A, B или C и проверьте сертификат по номеру."),
    agency: T("Education Quality Agency, Office of the Governor", "Bilim sapatı agenttigi, Gubernatordun apparatı", "Агентство качества образования, Аппарат губернатора"),
    crumb: T("State Language Test", "Mamlekettik til sınagı", "Тест по государственному языку"),
    tabs: [T("Practice test", "Mashıguu testi", "Пробный тест"), T("Check a certificate", "Kuböölüktü teksherüü", "Проверить сертификат")],
    levels: [
      T("Level A: basic. Everyday words: home, family, food, the market, travel, the weather.", "A deñgeeli: bashtapkı. Kündölük sözdör: üy, üy-bülö, tamak, bazar, jol, aba ırayı.", "Уровень A: базовый. Бытовая лексика: дом, семья, еда, рынок, дорога, погода."),
      T("Level B: working. Also offices, the law, trade and the press; signs and notices; the press and the official spelling.", "B deñgeeli: ish deñgeeli. Ofis, ukuk, sooda jana basma söz; belgiler jana jarnamalar; gezit jana rasmiy jazuu.", "Уровень B: рабочий. Также учреждения, право, торговля и пресса; вывески и объявления; газетное и официальное написание."),
      T("Level C: advanced. Also the church and oral literature, the Cyrillic spelling of 1941–1992 and word endings.", "C deñgeeli: jogorku. Oshondoy ele chirköö jana oozeki adabiyat, 1941–1992-jıldardın kirillitsası jana müchölör.", "Уровень C: продвинутый. Также церковная лексика и устная литература, кириллица 1941–1992 годов и аффиксы.")
    ],
    lvl: T("Level", "Deñgeel", "Уровень"),
    intro: T("The practice test has 20 questions on vocabulary and reading, put together from the Online dictionary of the Iradi language of Talas State University. It is not timed. Each answer is worth 5 points; 60 points out of 100 is a pass. The real test also has listening and writing parts and is taken only at a test point.", "Mashıguu testi Talas mamlekettik universitetinin Irad tilinin onlayn sözdügünön tüzülgön söz baylıgı jana okuu boyuncha 20 suroodon turat. Ubakıt chektelbeyt. Ar bir tuura joop 5 upay; 100 upaydan 60 upay ötköndü bildiret. Chınıgı sınakta ugup tüshünüü jana jazuu bölümdörü da bar, al sınak punktunda gana tapshırılat.", "Пробный тест состоит из 20 вопросов на лексику и чтение, составленных по онлайн-словарю ирадского языка Таласского государственного университета. Время не ограничено. Каждый верный ответ — 5 баллов; 60 баллов из 100 — тест сдан. В настоящем тесте есть также аудирование и письмо, он сдаётся только в пункте тестирования."),
    variant: T("Variant No. {v}", "{v}-variant", "Вариант № {v}"),
    varL: T("Variant", "Variant", "Вариант"),
    begin: T("Begin the practice test", "Mashıguu testin bashtoo", "Начать пробный тест"),
    other: T("Another variant", "Bashka variant", "Другой вариант"),
    again: T("Try again", "Kayra araket kıluu", "Попробовать ещё раз"),
    q: T("Question {i} of {n}", "{n} suroodon {i}-suroo", "Вопрос {i} из {n}"),
    finish: T("Hand in and see the score", "Tapshırıp, upaydı körüü", "Сдать и узнать результат"),
    blank: T("{k} questions have no answer. A question left blank scores nothing. Press the button again to hand in as it is.", "{k} suroogo joop berilgen jok. Joopsuz suroo upay albayt. Ushul boydon tapshıruu üchün baskıchtı kayra basıñız.", "На {k} вопр. нет ответа. Вопрос без ответа не засчитывается. Нажмите кнопку ещё раз, чтобы сдать как есть."),
    k: {
      mean: T("What does «{w}» mean?", "«{w}» emneni bildiret?", "Что значит «{w}»?"),
      rev: T("Which word means “{g}”?", "Kaysı söz “{g}” degendi bildiret?", "Какое слово значит «{g}»?"),
      sign: T("A sign or a heading reads «{w}». What does it say?", "Belgide je bashkı satırda «{w}» dep jazılgan. Al emne deyt?", "На вывеске или в заголовке написано «{w}». Что это значит?"),
      press: T("A newspaper prints «{w}». How is the word written in the official alphabet?", "Gezitte «{w}» dep basılgan. Bul söz rasmiy alfavitte kanday jazılat?", "В газете напечатано «{w}». Как это слово пишется в официальном алфавите?"),
      cyr: T("A document of 1941–1992 has «{w}». How is the word written today?", "1941–1992-jıldardın dokumentinde «{w}» dep jazılgan. Bul söz azır kanday jazılat?", "В документе 1941–1992 годов написано «{w}». Как это слово пишется сегодня?"),
      suf: T("What does the ending «{w}» mark?", "«{w}» müchösü emneni bildiret?", "Что обозначает аффикс «{w}»?")
    },
    parts: { mean: T("Meaning of words", "Sözdördün maanisi", "Значение слов"), rev: T("Finding the word", "Sözdü tabuu", "Выбор слова"), sign: T("Reading signs and headings", "Belgilerdi okuu", "Чтение вывесок и заголовков"), press: T("Press and official spelling", "Gezit jana rasmiy jazuu", "Газетное и официальное написание"), cyr: T("Cyrillic and Latin", "Kirillitsa jana latınitsa", "Кириллица и латиница"), suf: T("Word endings", "Müchölör", "Аффиксы") },
    score: T("Score", "Upay", "Результат"),
    of100: T("{s} points out of 100", "100 upaydan {s} upay", "{s} баллов из 100"),
    passed: T("Passed at level {l}. You may make a practice certificate below.", "{l} deñgeelinde öttüñüz. Tömöndö mashıguu kuböölügün tüzsöñüz bolot.", "Пройдено на уровне {l}. Ниже можно оформить пробный сертификат."),
    failed: T("Not passed: {p} points are needed at every level. Look the words up in the dictionary and try another variant.", "Ötkön joksuz: ar bir deñgeelde {p} upay kerek. Sözdördü sözdüktön karap, bashka variantı ötüñüz.", "Не пройдено: на любом уровне нужно {p} баллов. Посмотрите слова в словаре и попробуйте другой вариант."),
    byPart: T("By part", "Bölümdör boyuncha", "По частям"),
    review: T("Your answers", "Jooptoruñuz", "Ваши ответы"),
    yours: T("your answer", "siziñ joobuñuz", "ваш ответ"),
    right: T("right answer", "tuura joop", "верный ответ"),
    none: T("no answer", "joop jok", "нет ответа"),
    look: T("in the dictionary", "sözdüktö", "в словаре"),
    certH: T("Practice certificate", "Mashıguu kuböölügü", "Пробный сертификат"),
    certP: T("Type the name as it should appear. The name stays in this page: it is not sent anywhere and not kept.", "Atı-jönüñüzdü kanday körünüshü kerek bolso oshondoy jazıñız. Atıñız ushul bette gana kaladı: ech jakka jönötülböyt jana saktalbayt.", "Введите имя так, как оно должно быть напечатано. Имя остаётся на этой странице: оно никуда не отправляется и не сохраняется."),
    name: T("Full name", "Atı-jönü", "Фамилия, имя"),
    make: T("Make the practice certificate", "Mashıguu kuböölügün tüzüü", "Оформить пробный сертификат"),
    print: T("Print the certificate", "Kuböölüktü basıp chıgaruu", "Распечатать сертификат"),
    cGov: T("Government of the Irad Special Economic Zone", "Irad atayın ekonomikalık zonasının ökmötü", "Правительство Ирадской особой экономической зоны"),
    cHead: T("PRACTICE CERTIFICATE", "MASHIGUU KUBÖÖLÜGÜ", "ПРОБНЫЙ СЕРТИФИКАТ"),
    cSub: T("State Language Test · practice variant No. {v}", "Mamlekettik til sınagı · {v}-mashıguu variantı", "Тест по государственному языку · пробный вариант № {v}"),
    cBody: T("{n} completed the practice test of the State Language Test at level {l} on e-Irad on {d}, with {s} points out of 100.", "{n} {d} e-Iradda Mamlekettik til sınagının {l} deñgeeldegi mashıguu testin 100 upaydan {s} upay menen ötkön.", "{n} {d} прошёл(-ла) на e-Irad пробный тест по государственному языку уровня {l}, набрав {s} баллов из 100."),
    cNo: T("Certificate number", "Kuböölüktün nomeri", "Номер сертификата"),
    cWarn: T("Practice only. Not valid for applications, appointments or any other official purpose. Not entered in the register of the Education Quality Agency.", "Mashıguu üchün gana. Arızdar, kızmatka dayındoo je bashka rasmiy maksat üchün jaraktuu emes. Bilim sapatı agenttiginin reestrine kirgizilbeyt.", "Только для тренировки. Недействителен для заявлений, назначений и любых иных официальных целей. В реестр Агентства качества образования не вносится."),
    cCheck: T("Check this number at e-irad.org/language-test/#check", "Bul nomerdi e-irad.org/language-test/#check daregi boyuncha teksheriñiz", "Проверить номер: e-irad.org/language-test/#check"),
    wm: T("PRACTICE", "MASHIGUU", "ОБРАЗЕЦ"),
    cno: T("Certificate number", "Kuböölüktün nomeri", "Номер сертификата"),
    cph: T("e.g. ST-24-018342", "mısalı ST-24-018342", "например, ST-24-018342"),
    cbtn: T("Check", "Tekshirüü", "Проверить"),
    bad: T("This is not the number of a State Language Test certificate. Certificates are numbered ST-YY-NNNNNN (YY the year of the test); practice certificates from e-Irad are numbered PR-…", "Bul Mamlekettik til sınagının kuböölügünün nomeri emes. Kuböölüktördün nomeri ST-YY-NNNNNN (YY sınak jılı); e-Iraddın mashıguu kuböölüktörü PR-… dep nomerlenet.", "Это не номер сертификата теста по государственному языку. Сертификаты нумеруются ST-ГГ-NNNNNN (ГГ — год теста); пробные сертификаты e-Irad — PR-…"),
    prH: T("Practice certificate: not valid", "Mashıguu kuböölügü: jaraktuu emes", "Пробный сертификат: недействителен"),
    prP: T("This number belongs to a practice certificate made with e-Irad's practice test. Practice certificates are not entered in the register and are not valid for applications, appointments or any other official purpose. To obtain a certificate, take the State Language Test at a test point.", "Bul nomer e-Iraddın mashıguu testi menen tüzülgön mashıguu kuböölügünö taandık. Mashıguu kuböölüktörü reestrge kirgizilbeyt jana arızdar, kızmatka dayındoo je bashka rasmiy maksat üchün jaraktuu emes. Kuböölük aluu üchün Mamlekettik til sınagın sınak punktunda tapshırıñız.", "Этот номер принадлежит пробному сертификату, оформленному на пробном тесте e-Irad. Пробные сертификаты в реестр не вносятся и недействительны для заявлений, назначений и любых иных официальных целей. Чтобы получить сертификат, сдайте тест по государственному языку в пункте тестирования."),
    prBad: T("The number looks like a practice certificate's, but it does not check: one of its letters or figures is wrong. Practice certificates are not valid in any case.", "Nomer mashıguu kuböölügünün nomerine okshoyt, birok teksherüüdön ötpöyt: anın bir tamgası je sanı tuura emes. Mashıguu kuböölüktörü baarıbir jaraktuu emes.", "Номер похож на номер пробного сертификата, но не проходит проверку: одна из букв или цифр неверна. Пробные сертификаты в любом случае недействительны."),
    made: T("Made", "Tüzülgön", "Оформлен"),
    st: T("Status", "Abalı", "Статус"),
    okH: T("Valid certificate", "Jaraktuu kuböölük", "Действительный сертификат"),
    okP: T("The certificate is in the register of the Education Quality Agency. The holder's name is not shown online: compare it with the holder's passport.", "Kuböölük Bilim sapatı agenttiginin reestrinde bar. Eeesinin atı onlayn körsötülböyt: anı eesinin pasportu menen salıshtırıñız.", "Сертификат есть в реестре Агентства качества образования. Имя владельца онлайн не показывается: сверьте его с паспортом владельца."),
    date: T("Date of the test", "Sınaktın datası", "Дата теста"),
    point: T("Test point", "Sınak punktu", "Пункт тестирования"),
    pts: T("Points", "Upay", "Баллы"),
    annul: T("Annulled on {d}: replaced by certificate {n} at a higher level. Only the later certificate is valid.", "{d} jokko chıgarıldı: jogorku deñgeeldegi {n} kuböölügü menen almashtırıldı. Kiyinki kuböölük gana jaraktuu.", "Аннулирован {d}: заменён сертификатом {n} более высокого уровня. Действителен только последний сертификат."),
    paper: T("This certificate is not in the electronic register. Certificates of 2017 to 2019 were issued on paper and are entered in the electronic register only on request: the holder may ask the Agency to enter it, with the original.", "Bul kuböölük elektronduk reestrde jok. 2017–2019-jıldardın kuböölüktörü kagaz türündö berilgen jana elektronduk reestrge suroo boyuncha gana kirgizilet: eesi asıl nuskası menen agenttikke kayrılsa bolot.", "Этого сертификата нет в электронном реестре. Сертификаты 2017–2019 годов выдавались на бумаге и вносятся в электронный реестр только по заявлению: владелец может обратиться в Агентство с оригиналом."),
    nf: T("No certificate with this number is in the register. Check the number on the certificate.", "Bul nomerdegi kuböölük reestrde jok. Kuböölüktögü nomerdi teksheriñiz.", "Сертификата с таким номером в реестре нет. Проверьте номер на сертификате."),
    future: T("No test has been held under this number yet.", "Bul nomer menen azırıncha sınak ötkön emes.", "Под этим номером тест ещё не проводился."),
    helpH: T("The State Language Test", "Mamlekettik til sınagı", "Тест по государственному языку"),
    helpP: T("The State Language Test (Mamlekettik til sınagı) of the Education Quality Agency measures command of Iradi, the state language, at three levels: A (basic), B (working) and C (advanced). It has been held since 2017 at the test points in Talas, Iyık Janyl, Tash-Kömür and Bazar-Korgon, in reading, listening, vocabulary and grammar, and writing. State bodies may ask for a level B certificate when appointing to posts in the state service, and schools for level C from teachers of Iradi.", "Bilim sapatı agenttiginin Mamlekettik til sınagı mamlekettik til bolgon Irad tilin üch deñgeelde baalayt: A (bashtapkı), B (ish deñgeeli) jana C (jogorku). Al 2017-jıldan beri Talas, Iyık Janyl, Tash-Kömür jana Bazar-Korgondogu sınak punkttarında okuu, ugup tüshünüü, söz baylıgı jana grammatika, jazuu boyuncha ötkörülöt. Mamlekettik organdar mamlekettik kızmatka dayındooda B deñgeelindegi kuböölüktü, mektepter Irad tili mugalimderinen C deñgeelin surashı mümkün.", "Тест по государственному языку Агентства качества образования оценивает владение ирадским, государственным языком, на трёх уровнях: A (базовый), B (рабочий) и C (продвинутый). Он проводится с 2017 года в пунктах тестирования в Таласе, Ийык-Джаныле, Таш-Кёмюре и Базар-Коргоне: чтение, аудирование, лексика и грамматика, письмо. Государственные органы могут запросить сертификат уровня B при назначении на должности государственной службы, школы — уровень C у учителей ирадского языка."),
    helpPr: T("The practice test on e-Irad is for practice only. Its certificates are not valid for anything.", "e-Iraddagı mashıguu testi mashıguu üchün gana. Anın kuböölüktörü ech nerse üchün jaraktuu emes.", "Пробный тест на e-Irad предназначен только для тренировки. Его сертификаты ни для чего не действительны."),
    helpNgt: T("A pass in Iradi language and literature at the National Graduation Test is not a State Language Test certificate.", "Uluttuk sınaktagı Irad tili jana adabiyatı boyuncha ötköndük Mamlekettik til sınagının kuböölügü emes.", "Сдача ирадского языка и литературы на Национальном выпускном тесте не заменяет сертификат теста по государственному языку."),
    dictL: T("Online dictionary of the Iradi language (Talas State University)", "Irad tilinin onlayn sözdügü (Talas mamlekettik universiteti)", "Онлайн-словарь ирадского языка (Таласский государственный университет)"),
    ngtL: T("National Graduation Test results", "Uluttuk sınaktın jıyıntıktarı", "Результаты Национального выпускного теста"),
    noBank: T("The practice test could not be loaded. Please try again later.", "Mashıguu testi jüktölgön jok. Kiyinireek kayra araket kılıñız.", "Не удалось загрузить пробный тест. Попробуйте позже.")
  };
  var POINTS = ["Talas", "Iyık Janyl", "Tash-Kömür", "Bazar-Korgon"], LV = ["A", "B", "C"];

  /* ---------- the questions ---------- */
  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var x = Math.imul(a ^ (a >>> 15), 1 | a); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
  function shuffle(a, r) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function lev(a, b) {
    var m = a.length, n = b.length, p = [], i, j;
    for (j = 0; j <= n; j++) p[j] = j;
    for (i = 1; i <= m; i++) { var prev = p[0]; p[0] = i; for (j = 1; j <= n; j++) { var tmp = p[j]; p[j] = Math.min(p[j] + 1, p[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = tmp; } }
    return p[n];
  }
  /* the bank: [word, press, Cyrillic, pos, meaning, level, example] */
  function W(x) { return { w: x[0], press: x[1], cyr: x[2], pos: x[3], g: x[4], lv: x[5], ex: x[6] }; }
  var ALL = B.map(W);
  function pool(level, kind) {
    return ALL.filter(function (x) {
      if (kind === "suf") return x.lv === 4;
      if (x.lv === 4) return false;
      if (kind === "sign") return x.ex && x.lv <= level + 1;
      if (kind === "press") return x.press && x.lv <= level + 1;
      if (kind === "cyr") return x.cyr && x.pos !== "phrase";
      if (level < 2 && (/^[A-ZÄÇÖÜŞÑİ]|[!?]$/.test(x.w) || x.pos === "phrase")) return false;
      return x.lv === level + 1 || (level > 0 && x.lv === level && x.w.length > 3);
    });
  }
  function others(list, x, key, r, n) {
    var seen = {}, out = []; seen[x[key]] = 1;
    shuffle(list, r).some(function (y) { if (!seen[y[key]] && (y.pos === x.pos || !x.pos || list.length < 40)) { seen[y[key]] = 1; out.push(y[key]); } return out.length >= n; });
    return out;
  }
  function near(list, x, key, r) {
    /* the three official spellings nearest to the right one, so the choice is about the letters */
    var c = shuffle(ALL.filter(function (y) { return y.w !== x.w && y.lv !== 4 && y.w.indexOf(" ") < 0; }), r).slice(0, 400);
    c.sort(function (a, b) { return lev(a.w, x.w) - lev(b.w, x.w); });
    var out = [], seen = {}; seen[x.w] = 1;
    c.some(function (y) { if (!seen[y.w]) { seen[y.w] = 1; out.push(y.w); } return out.length >= 3; });
    return out;
  }
  var PLAN = [
    [["mean", 12], ["rev", 8]],
    [["mean", 6], ["rev", 5], ["sign", 5], ["press", 4]],
    [["mean", 4], ["rev", 3], ["sign", 4], ["cyr", 5], ["suf", 4]]
  ];
  function build(level, variant) {
    var r = rng(hash("langtest|" + level + "|" + variant)), used = {}, qs = [];
    PLAN[level].forEach(function (pk) {
      var kind = pk[0], list = pool(level, kind), picks = [];
      shuffle(list, r).some(function (x) { if (!used[x.w]) { used[x.w] = 1; picks.push(x); } return picks.length >= pk[1]; });
      picks.forEach(function (x) {
        var q = { kind: kind, x: x }, right, wrong;
        if (kind === "mean" || kind === "suf") { q.show = x.w; right = x.g; wrong = others(list, x, "g", r, 3); }
        else if (kind === "rev") { q.show = x.g; right = x.w; wrong = others(list, x, "w", r, 3); }
        else if (kind === "sign") { q.show = x.ex[0]; right = x.ex[1]; wrong = others(list.map(function (y) { return { w: y.w, ex1: y.ex[1], pos: y.pos }; }), { w: x.w, ex1: x.ex[1] }, "ex1", r, 3); }
        else if (kind === "press") { q.show = x.press; right = x.w; wrong = near(list, x, "w", r); }
        else if (kind === "cyr") { q.show = x.cyr; right = x.w; wrong = near(list, x, "w", r); }
        q.opts = shuffle([right].concat(wrong), r); q.ans = q.opts.indexOf(right);
        qs.push(q);
      });
    });
    return qs;
  }

  /* ---------- numbers ---------- */
  function dayNo(d) { return Math.round((d - Date.UTC(d.getUTCFullYear(), 0, 1)) / 864e5) + 1; }
  function fromDay(y, n) { return new Date(Date.UTC(y, 0, n)); }
  function chkL(body) { return LET.charAt(hash("ltpr" + body) % 10); }
  function prNo(d, level, score) {
    var body = String(d.getUTCFullYear()).slice(2) + ("00" + dayNo(d)).slice(-3) + LV[level] + ("00" + score).slice(-3);
    return "PR-" + body.slice(0, 5) + "-" + body.slice(5) + "-" + chkL(body);
  }
  function variantToday() { return 100 + Math.floor(H.today().getTime() / 864e5) % 900; }
  function sat(y, h) { var d = fromDay(2000 + y, 20 + (h % 320)); while (d.getUTCDay() !== 6) d = H.addDays(d, 1); return d; }

  /* ---------- the page ---------- */
  function page() {
    var SEP = ' <span class="sep">›</span> ', today = H.today();
    document.title = L(C.title) + " | e-Irad";
    var help = "<h3>" + esc(L(C.helpH)) + "</h3><p>" + esc(L(C.helpP)) + "</p><p>" + esc(L(C.helpNgt)) + "</p><p>" + esc(L(C.helpPr)) + "</p>" +
      '<p><a href="' + DICT + '">' + esc(L(C.dictL)) + '</a></p><p><a href="/test-results/">' + esc(L(C.ngtL)) + "</a></p>";
    $("#app").innerHTML = '<div class="wrap page"><nav class="crumbs" aria-label="breadcrumb"><a href="/">e-Irad</a>' + SEP + '<a href="/citizens.html">' + esc(t("secCit")) + "</a>" + SEP + "<span>" + esc(L(C.crumb)) + "</span></nav>" +
      '<div class="svchead">' + H.icon("cap") + "<div><h1>" + esc(L(C.title)) + "</h1><p>" + esc(L(C.desc)) + '</p><p class="agency"><span>' + esc(t("agency")) + ":</span> " + esc(L(C.agency)) + " " + H.badge("ok") + "</p></div></div>" +
      '<div class="svcgrid"><div id="xmain"></div><aside class="help">' + help + "</aside></div></div>";
    var box = $("#xmain");
    box.innerHTML = '<div class="xtabs" role="tablist">' + C.tabs.map(function (x, i) { return '<a href="#' + ["practice", "check"][i] + '" role="tab" data-tab="' + i + '">' + esc(L(x)) + "</a>"; }).join("") + "</div>" +
      '<div data-pane="0"><div id="lq"></div><div id="lr" class="result" hidden aria-live="polite"></div><div id="lc"></div></div>' +
      '<div data-pane="1" hidden><form class="flow" id="flc">' + field("lcn", L(C.cno), inp("lcn", L(C.cph), ' maxlength="20" style="text-transform:uppercase"')) + '<button class="btn" type="submit">' + esc(L(C.cbtn)) + '</button></form><div id="lcr" class="result" hidden aria-live="polite"></div></div>';
    function tab(i) { $$("[data-pane]").forEach(function (p) { p.hidden = p.getAttribute("data-pane") !== String(i); }); $$("[data-tab]").forEach(function (a) { a.className = a.getAttribute("data-tab") === String(i) ? "on" : ""; }); }
    $$("[data-tab]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); tab(+a.getAttribute("data-tab")); history.replaceState(null, "", a.getAttribute("href")); }); });
    function res(id, html) { var r = $("#" + id); r.innerHTML = html; r.hidden = false; r.scrollIntoView({ block: "nearest" }); }

    var lq = $("#lq"), level = 0, variant = variantToday(), qs = [], warned = false;
    function intro() {
      $("#lr").hidden = true; $("#lc").innerHTML = "";
      if (!ALL.length) { lq.innerHTML = P(C.noBank, "warn"); return; }
      lq.innerHTML = '<div class="flow">' + P(C.intro) + '<fieldset class="fld ltlv"><legend>' + esc(L(C.lvl)) + "</legend>" +
        C.levels.map(function (x, i) { return '<label><input type="radio" name="ltl" value="' + i + '"' + (i === level ? " checked" : "") + "> " + esc(L(x)) + "</label>"; }).join("") +
        '</fieldset><p class="tiny">' + esc(L(C.variant, { v: variant })) + '</p><p class="pbtns"><button class="btn" type="button" id="lqs">' + esc(L(C.begin)) + '</button> <button class="btn ghost" type="button" id="lqo">' + esc(L(C.other)) + "</button></p></div>";
      $("#lqs").addEventListener("click", function () { level = +(($("input[name=ltl]:checked") || {}).value || 0); start(); });
      $("#lqo").addEventListener("click", function () { level = +(($("input[name=ltl]:checked") || {}).value || 0); variant = variant >= 999 ? 100 : variant + 1; intro(); });
    }
    function start() {
      qs = build(level, variant); warned = false;
      lq.innerHTML = '<form class="flow" id="flq" novalidate><h2>' + esc(L(C.levels[level]).split(".")[0]) + " · " + esc(L(C.variant, { v: variant })) + "</h2>" + qs.map(function (q, i) {
        return '<fieldset class="fld ltq"><legend><span class="tiny">' + esc(L(C.q, { i: i + 1, n: qs.length })) + "</span><br>" + esc(L(C.k[q.kind], { w: q.show, g: q.show })) + "</legend>" +
          q.opts.map(function (o, j) { return '<label><input type="radio" name="q' + i + '" value="' + j + '"> ' + esc(o) + "</label>"; }).join("") + "</fieldset>";
      }).join("") + '<span class="err" id="flq-err" hidden></span><p class="pbtns"><button class="btn" type="submit">' + esc(L(C.finish)) + "</button></p></form>";
      $("#flq").addEventListener("submit", function (e) { e.preventDefault(); mark(); });
      lq.scrollIntoView({ block: "start" });
    }
    function answer(i) { var c = $("input[name=q" + i + "]:checked"); return c ? +c.value : -1; }
    function mark() {
      var a = qs.map(function (q, i) { return answer(i); }), blank = a.filter(function (x) { return x < 0; }).length;
      if (blank && !warned) { warned = true; var e = $("#flq-err"); e.textContent = L(C.blank, { k: blank }); e.hidden = false; return; }
      var right = 0, parts = {}, order = [];
      qs.forEach(function (q, i) { var ok = a[i] === q.ans; if (ok) right++; if (!parts[q.kind]) { parts[q.kind] = [0, 0]; order.push(q.kind); } parts[q.kind][1]++; if (ok) parts[q.kind][0]++; });
      var score = right * 5, pass = score >= PASS;
      lq.innerHTML = "";
      var rev = '<details class="ltrev"><summary>' + esc(L(C.review)) + "</summary><ol>" + qs.map(function (q, i) {
        var ok = a[i] === q.ans, wd = q.kind === "sign" ? "" : (q.kind === "rev" || q.kind === "press" || q.kind === "cyr") ? q.x.w : q.x.w;
        return '<li class="' + (ok ? "lt-ok" : "lt-no") + '">' + esc(L(C.k[q.kind], { w: q.show, g: q.show })) + "<br>" +
          (ok ? "✓ " + esc(q.opts[q.ans]) : "✗ " + (a[i] < 0 ? "<i>" + esc(L(C.none)) + "</i>" : esc(q.opts[a[i]]) + ' <span class="tiny">(' + esc(L(C.yours)) + ")</span>") + "; " + esc(q.opts[q.ans]) + ' <span class="tiny">(' + esc(L(C.right)) + ")</span>") +
          (wd ? ' · <a href="' + DICT + "?q=" + encodeURIComponent(wd) + '" target="_blank" rel="noopener">' + esc(wd) + "</a> " + '<span class="tiny">' + esc(L(C.look)) + "</span>" : "") + "</li>";
      }).join("") + "</ol></details>";
      res("lr", kv([[L(C.lvl), esc(LV[level])], [L(C.varL), esc(String(variant))], [L(C.score), "<b>" + esc(L(C.of100, { s: score })) + "</b>"]]) +
        (pass ? P(C.passed, "ok", { l: LV[level] }) : P(C.failed, "warn", { p: PASS })) +
        H4(C.byPart) + '<div class="tw"><table class="tbl"><tbody>' + order.map(function (k) { return "<tr><td>" + esc(L(C.parts[k])) + '</td><td class="num">' + parts[k][0] + " / " + parts[k][1] + "</td></tr>"; }).join("") + "</tbody></table></div>" + rev +
        '<p class="pbtns"><button class="btn ghost" type="button" id="lqa">' + esc(L(C.again)) + '</button> <button class="btn ghost" type="button" id="lqn">' + esc(L(C.other)) + "</button></p>");
      $("#lqa").addEventListener("click", function () { start(); $("#lr").hidden = true; $("#lc").innerHTML = ""; });
      $("#lqn").addEventListener("click", function () { variant = variant >= 999 ? 100 : variant + 1; intro(); });
      if (pass) certForm(score);
    }
    function certForm(score) {
      var lc = $("#lc");
      lc.innerHTML = '<form class="flow ltcf" id="flk"><h2>' + esc(L(C.certH)) + "</h2>" + P(C.certP, "tiny") + field("lkn", L(C.name), inp("lkn", "", ' maxlength="60"')) + '<button class="btn" type="submit">' + esc(L(C.make)) + '</button></form><div id="lkr"></div>';
      $("#flk").addEventListener("submit", function (e) {
        e.preventDefault();
        if (!need("lkn", function (v) { return v.trim().length >= 3; })) return;
        var nm = String($("#lkn").value).trim().replace(/\s+/g, " "), no = prNo(today, level, score);
        $("#lkr").innerHTML = '<div class="ltcert" id="ltcert"><div class="ltwm" aria-hidden="true">' + esc(L(C.wm)) + '</div><div class="lthead"><img src="/assets/mark.svg" alt="" width="40" height="40"><div><b>' + esc(L(C.cGov)) + "</b><br>" + esc(L(C.agency)) + "</div></div>" +
          "<h2>" + esc(L(C.cHead)) + '</h2><p class="ltsub">' + esc(L(C.cSub, { v: variant })) + '</p><p class="ltbody">' + esc(L(C.cBody, { n: nm, l: LV[level], d: fmtD(today), s: score })) + "</p>" +
          kv([[L(C.cNo), "<b>" + esc(no) + "</b>"], [L(C.lvl), esc(L(C.levels[level]).split(".")[0])], [L(C.score), esc(L(C.of100, { s: score }))]]) +
          '<p class="ltwarn">' + esc(L(C.cWarn)) + '</p><p class="tiny">' + esc(L(C.cCheck)) + "</p></div>" +
          '<p class="pbtns"><button type="button" class="btn ghost" id="lkp">' + esc(L(C.print)) + "</button></p>";
        $("#lkp").addEventListener("click", function () { document.body.classList.add("ltprint"); window.print(); setTimeout(function () { document.body.classList.remove("ltprint"); }, 500); });
        $("#ltcert").scrollIntoView({ block: "nearest" });
      });
    }
    intro();

    /* ---------- check a certificate ---------- */
    $("#flc").addEventListener("submit", function (e) {
      e.preventDefault();
      if (!need("lcn")) return;
      var n = H.norm($("#lcn").value), m, yy = +String(today.getUTCFullYear()).slice(2);
      if ((m = /^PR(\d{2})(\d{3})([ABC])(\d{3})([A-Z])$/.exec(n))) {
        var body = m[1] + m[2] + m[3] + m[4], d = fromDay(2000 + +m[1], +m[2]), sc = +m[4];
        if (chkL(body) !== m[5] || d > today || d < new Date(LAUNCH + "T00:00:00Z") || sc < PASS || sc > 100 || sc % 5 || +m[2] < 1 || +m[2] > 366) { res("lcr", P(C.prBad, "warn")); return; }
        res("lcr", "<h4>" + esc(L(C.prH)) + "</h4>" + kv([[L(C.cno), esc("PR-" + m[1] + m[2] + "-" + m[3] + m[4] + "-" + m[5])], [L(C.made), esc(fmtD(d))], [L(C.lvl), esc(m[3])], [L(C.pts), esc(String(sc))]]) + P(C.prP, "warn"));
        return;
      }
      m = /^ST(\d{2})(\d{6})$/.exec(n);
      if (!m || +m[1] < FIRST_YEAR || +m[1] > yy) { res("lcr", P(C.bad, "warn")); return; }
      var y = +m[1], h = hash("ltst" + n), shown = "ST-" + m[1] + "-" + m[2];
      if (y < 20 && h % 3 === 0) { res("lcr", kv([[L(C.cno), esc(shown)]]) + P(C.paper, "warn")); return; }
      if (h % 11 === 0) { res("lcr", P(C.nf, "warn")); return; }
      var dt = sat(y, h >>> 4);
      if (dt > today) { res("lcr", P(C.future, "warn")); return; }
      var lv = h % 20 < 6 ? 0 : h % 20 < 17 ? 1 : 2, pts = [60, 65, 75][lv] + (h >>> 9) % ([41, 36, 26][lv]);
      var rows = [[L(C.cno), esc(shown)], [L(C.lvl), esc(L(C.levels[lv]).split(".")[0])], [L(C.pts), esc(String(pts))], [L(C.date), esc(fmtD(dt))], [L(C.point), esc(POINTS[(h >>> 7) % 4])]];
      if (lv < 2 && h % 23 === 0 && y < yy) {
        var d2 = sat(Math.min(yy, y + 1 + (h >>> 3) % 2), h >>> 11);
        if (d2 <= today && d2 > dt) { res("lcr", kv(rows) + P(C.annul, "warn", { d: fmtD(d2), n: "ST-" + String(d2.getUTCFullYear()).slice(2) + "-" + ("00000" + (hash("ltrep" + n) % 1000000)).slice(-6) })); return; }
      }
      res("lcr", "<h4>" + esc(L(C.okH)) + "</h4>" + kv(rows) + P(C.okP, "ok"));
    });
    function fromHash() { tab(location.hash === "#check" ? 1 : 0); }
    window.addEventListener("hashchange", fromHash); fromHash();
  }
  return { page: page };
};
