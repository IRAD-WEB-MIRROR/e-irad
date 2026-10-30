/* e-Irad: /census/, the online questionnaire of the census of business entities 2026 (form TSO-26 in electronic form,
   Executive Directive 2026/24). Open 1 to 30 November 2026, Irad time. Same rules as app.js: nothing is sent or stored.
   The answers stay in the page; the confirmation number is worked out from the registration number and the day, and
   its course (received, checked, returned) from the number and today's date, so it looks the same on any device. */
window.E_CENSUS = function (H) {
  "use strict";
  var $ = H.$, esc = H.esc, L = H.L, t = H.t, hash = H.hash, fmtD = H.fmtD, fmtN = H.fmtN, kv = H.kv, P = H.P, H4 = H.H4;
  var field = H.field, sel = H.sel, inp = H.inp, need = H.need, opts = H.opts, pick = H.pick, refBox = H.refBox, chk = H.chk;
  var OPEN = "2026-11-01", CLOSE = "2026-11-30", SESSION_MIN = 40, CHECK_DAYS = 10;
  function day(s) { return new Date(s + "T00:00:00Z"); }
  function iso(d) { return d.toISOString().slice(0, 10); }
  function T(en, ir, ru) { return { en: en, ir: ir, ru: ru }; }

  var C = {
    title: T("Census of business entities 2026: online questionnaire", "2026-jılkı ishkanalardın sanagı: onlayn suroo-joop", "Перепись хозяйствующих субъектов 2026: онлайн-анкета"),
    desc: T("Form TSO-26 in electronic form, for legal entities, branches and sole traders registered on 1 October 2026.", "TSO-26 forması elektronduk türdö: 2026-jıldın 1-oktyabrına kattalgan yurıdikalık jaktar, filialdar jana jeke ishkerler üchün.", "Бланк TSO-26 в электронном виде для юридических лиц, филиалов и ИП, зарегистрированных на 1 октября 2026 года."),
    agency: T("Territorial Statistics Office, Ministry of Economy", "Aymaktık statistika keñsesi, Ekonomika ministrligi", "Территориальное статистическое управление, Министерство экономики"),
    tabs: [T("Questionnaire", "Suroo-joop", "Анкета"), T("Check a confirmation", "Tastıktoonu tekshirüü", "Проверить подтверждение")],
    before: T("The online questionnaire opens on 1 November 2026 and is open until 30 November. Until then, answer when the enumerator visits or at an Attelkom service point, or download the printed form TSO-26.", "Onlayn suroo-joop 2026-jıldın 1-noyabrında achılat jana 30-noyabrga cheyin ishteyt. Oshoğo cheyin sanakchı kelgende je Attelkomdun kızmat punktunda joop beriñiz, je TSO-26 basma formasın jüktöp alıñız.", "Онлайн-анкета откроется 1 ноября 2026 года и будет доступна до 30 ноября. До этого отвечайте переписчику, в пункте обслуживания «Аттелкома» или скачайте бланк TSO-26."),
    after: T("The census of business entities closed on 30 November 2026. Questionnaires are no longer accepted. Confirmations already issued can still be checked.", "Ishkanalardın sanagı 2026-jıldın 30-noyabrında jabıldı. Suroo-jooptor mından ary kabıl alınbayt. Berilgen tastıktoolordu tekshirse bolot.", "Перепись хозяйствующих субъектов завершилась 30 ноября 2026 года. Анкеты больше не принимаются. Выданные подтверждения можно проверить."),
    intro: T("The questionnaire has nine sections and takes about 25 minutes. Have to hand the registration certificate, the tax number, the September 2026 payroll and electricity bill and the turnover for the year to 30 September 2026. Answer in one sitting: answers are not saved, and the session ends after 40 minutes.", "Suroo-joop toguz bölümdön turat jana 25 minutaga jakın ubakıt alat. Kattoo kuböölügün, salık nomerin, 2026-jıldın sentyabrındagı aylık tizmesin jana elektr esebin, 2026-jıldın 30-sentyabrına cheyinki jılkı jügürtüünü dayar karmañız. Bir otuurganda joop beriñiz: jooptor saktalbayt, sessiya 40 minutadan kiyin bütöt.", "Анкета состоит из девяти разделов и занимает около 25 минут. Подготовьте свидетельство о регистрации, ИНН, ведомость зарплаты и счёт за электроэнергию за сентябрь 2026 года и оборот за год по 30 сентября 2026 года. Заполняйте за один раз: ответы не сохраняются, сеанс завершается через 40 минут."),
    start: T("Begin the questionnaire", "Suroo-joopto bashtoo", "Начать заполнение"),
    of: T("Section {i} of {n}", "{n} bölümdün {i}-bölümü", "Раздел {i} из {n}"),
    next: T("Next section", "Kiyinki bölüm", "Следующий раздел"),
    back: T("Back", "Artka", "Назад"),
    send: T("Send the questionnaire", "Suroo-jooptu jönötüü", "Отправить анкету"),
    req: T("Answer every question in this section.", "Bul bölümdögü ar bir suroogo joop beriñiz.", "Ответьте на все вопросы раздела."),
    num: T("Enter a whole number (0 if none).", "Bütün san jazıñız (jok bolso 0).", "Введите целое число (0, если нет)."),
    sum: T("The shares must add up to 100. They now add up to {s}.", "Ülüshtördün jıyındısı 100 boluşu kerek. Azır {s}.", "Сумма долей должна быть равна 100. Сейчас {s}."),
    sumT: T("The shares of turnover by market (ISEZ, ATR, export) must add up to 100. They now add up to {s}.", "Rınok boyuncha jügürtüü ülüshtörü (IAEZ, ATR, eksport) 100 boluşu kerek. Azır {s}.", "Доли оборота по рынкам (ОЭЗИ, АТР, экспорт) в сумме должны составлять 100. Сейчас {s}."),
    pct: T("A share cannot be more than 100.", "Ülüsh 100dön ashpayt.", "Доля не может быть больше 100."),
    regBad: T("Enter the registration number as on the certificate, e.g. TL-19-004517.", "Kattoo nomerin kuböölüktögüdöy jazıñız, mısalı TL-19-004517.", "Введите регистрационный номер как в свидетельстве, например TL-19-004517."),
    regNew: T("Entities registered after 1 October 2026 do not take part in the census.", "2026-jıldın 1-oktyabrınan kiyin kattalgan subyektter sanakka katışpayt.", "Субъекты, зарегистрированные после 1 октября 2026 года, в переписи не участвуют."),
    notReg: T("This number is not in the Register of Firms as at 1 October 2026. Check the number on the certificate. A firm registered before 2008 and never re-registered answers on paper, through the enumerator: its entry is checked by hand.", "Bul nomer 2026-jıldın 1-oktyabrındagı Firmalar reestrinde jok. Kuböölüktögü nomerdi tekshiriñiz. 2008-jılga cheyin kattalıp, kayra kattalbagan firma kagaz menen, sanakchı arkıluu joop beret: anın jazuusu kol menen tekshirilet.", "Этого номера нет в Реестре фирм на 1 октября 2026 года. Проверьте номер в свидетельстве. Фирма, зарегистрированная до 2008 года и не прошедшая перерегистрацию, отвечает на бумаге через переписчика: её запись проверяется вручную."),
    dup: T("A questionnaire for this entity was already received on {d} ({m}). A second questionnaire is not accepted. If the entity has not received its census slip, ask the census line of the Office.", "Bul subyekt boyuncha suroo-joop {d} kabıl alıngan ({m}). Ekinchi suroo-joop kabıl alınbayt. Subyekt sanak kagazın ala elek bolso, keñsenin sanak liniyasına kayrılıñız.", "Анкета этого субъекта уже получена {d} ({m}). Повторная анкета не принимается. Если субъект не получил талон, обратитесь на линию переписи Управления."),
    dupM: [T("enumerator", "sanakchı", "переписчик"), T("Attelkom service point", "Attelkom kızmat punktu", "пункт обслуживания «Аттелкома»")],
    expired: T("The session has ended: more than 40 minutes have passed since the questionnaire was begun. For the protection of the answers nothing was kept. Begin the questionnaire again.", "Sessiya büttü: suroo-joop bashtalgandan beri 40 minutadan ashık ötüp ketti. Jooptordu korgoo üchün echteme saktalgan jok. Suroo-jooptu kayra bashtañız.", "Сеанс завершён: с начала заполнения прошло более 40 минут. В целях защиты ответов ничего не сохранено. Начните заполнение заново."),
    leave: T("Answers are lost if this page is left or reloaded.", "Bul baraktan chıksañız je anı kayra jüktösöñüz jooptor jogolot.", "При уходе со страницы или её перезагрузке ответы будут потеряны."),
    left: T("Time left in this session: {m} min", "Sessiyada kalgan ubakıt: {m} min", "Осталось времени сеанса: {m} мин"),
    declare: T("I confirm that the answers are true and complete to the best of my knowledge. I understand that failure to complete the questionnaire by 30 November 2026, or knowingly false answers, is an offence under the Code of Administrative Offences.", "Jooptor menin bilishimche tuura jana toluk ekenin tastıktaym. Suroo-joopto 2026-jıldın 30-noyabrına cheyin tolturboo je bile tura jalgan joop berüü Administrativdik ukuk buzuular kodeksi boyuncha ukuk buzuu ekenin tüshünöm.", "Подтверждаю, что ответы, насколько мне известно, достоверны и полны. Мне известно, что незаполнение анкеты до 30 ноября 2026 года или заведомо ложные ответы являются правонарушением по Кодексу об административных правонарушениях."),
    declErr: T("Tick the confirmation to send the questionnaire.", "Suroo-jooptu jönötüü üchün tastıktoonu belgileñiz.", "Отметьте подтверждение, чтобы отправить анкету."),
    who: T("Completed by (surname and initials, position)", "Toltrugan (familiyası, ını, kızmatı)", "Заполнил (фамилия, инициалы, должность)"),
    done: T("Electronic confirmation", "Elektronduk tastıktoo", "Электронное подтверждение"),
    recv: T("Received", "Kabıl alındı", "Получено"),
    entity: T("Entity", "Subyekt", "Субъект"),
    regno: T("Registration number", "Kattoo nomeri", "Регистрационный номер"),
    mode: T("Mode", "Usulu", "Способ"),
    modeV: T("e-Irad (electronic questionnaire)", "e-Irad (elektronduk suroo-joop)", "e-Irad (электронная анкета)"),
    by: T("Completed by", "Toltrugan", "Заполнил"),
    checkBy: T("To be checked by", "Tekshirüü möönötü", "Срок проверки"),
    keep: T("Print this confirmation and keep it with the entity's papers. Under the instructions to form TSO-26 an entity that answers electronically keeps the printed confirmation in place of the census slip. The Register of Firms accepts it once the Office's controller has checked the questionnaire, within 10 working days; see Check a confirmation. Until then the Register issues extracts concerning the entity only on presentation of a census slip.", "Bul tastıktoonu basıp chıgarıp, subyekttin kagazdarı menen saktañız. TSO-26 formasının nuskamasına ılayık elektronduk joop bergen subyekt sanak kagazının ordunda basılgan tastıktoonu saktayt. Firmalar reestri anı keñsenin kontrolyoru suroo-jooptu 10 ish kündün ichinde tekshirgenden kiyin kabıl aladı; «Tastıktoonu tekshirüü» bölümün karañız. Oğan cheyin reestr subyekt boyuncha köchürmönü sanak kagazı körsötülgöndö gana beret.", "Распечатайте подтверждение и храните его с документами субъекта. Согласно указаниям к бланку TSO-26 субъект, ответивший электронно, хранит печатное подтверждение вместо талона. Реестр фирм принимает его после проверки анкеты контролёром Управления, в течение 10 рабочих дней; см. «Проверить подтверждение». До этого Реестр выдаёт выписки о субъекте только при предъявлении талона переписи."),
    nothing: T("The answers have been passed for statistical processing and are not shown again. Individual answers are not passed to the tax or any other authority (Executive Directive 2026/24, paragraph 9).", "Jooptor statistikalık iştetüügö berildi jana kayra körsötülböyt. Jeke jooptor salık je bashka organga berilbeyt (2026/24 Atkaruu direktivası, 9-paragraf).", "Ответы переданы на статистическую обработку и повторно не показываются. Индивидуальные ответы не передаются налоговым и иным органам (Исполнительная директива 2026/24, пункт 9)."),
    print: T("Print the confirmation", "Tastıktoonu basıp chıgaruu", "Распечатать подтверждение"),
    cno: T("Confirmation number", "Tastıktoo nomeri", "Номер подтверждения"),
    cph: T("e.g. E26-305-4417", "mısalı E26-305-4417", "например, E26-305-4417"),
    cbtn: T("Check", "Tekshirüü", "Проверить"),
    cBad: T("This is not a confirmation number of the census of business entities 2026. The number is printed on the confirmation as E26-NNN-NNNN.", "Bul 2026-jılkı ishkanalar sanagının tastıktoo nomeri emes. Nomer tastıktoodo E26-NNN-NNNN türündö basılgan.", "Это не номер подтверждения переписи хозяйствующих субъектов 2026. Номер напечатан на подтверждении в виде E26-NNN-NNNN."),
    status: T("Status", "Abalı", "Состояние"),
    s0: T("Received. The questionnaire is waiting to be checked by the controller of the enumeration area. The check takes up to 10 working days (by {d}).", "Kabıl alındı. Suroo-joop sanak uchastkasının kontrolyorunun tekshirüüsün kütüüdö. Tekshirüü 10 ish künge cheyin sozulat ({d} cheyin).", "Получено. Анкета ожидает проверки контролёром счётного участка. Проверка занимает до 10 рабочих дней (до {d})."),
    s1: T("Checked and accepted on {d}. The Register of Firms accepts this confirmation in place of the census slip.", "{d} tekshirilip, kabıl alındı. Firmalar reestri bul tastıktoonu sanak kagazının ordunda kabıl aladı.", "Проверено и принято {d}. Реестр фирм принимает это подтверждение вместо талона переписи."),
    s2: T("Checked and accepted on {d} with a correction: the controller changed the main activity code to {c}. The Register of Firms accepts this confirmation in place of the census slip.", "{d} tüzötüü menen tekshirilip, kabıl alındı: kontrolyor negizgi ish-araket kodun {c} dep özgörttü. Firmalar reestri bul tastıktoonu sanak kagazının ordunda kabıl aladı.", "Проверено и принято {d} с исправлением: контролёр изменил код основного вида деятельности на {c}. Реестр фирм принимает это подтверждение вместо талона переписи."),
    s3: T("Returned on {d}: the answers in the section “{s}” do not agree with the Register or with each other. The enumerator of the area will visit the entity to complete that section on the printed form; keep this confirmation until then. The census slip is issued by the enumerator after the visit.", "{d} kaytarıldı: «{s}» bölümünün jooptoru reestr menen je biri-biri menen dal kelbeyt. Uchastkanın sanakchısı ushul bölümdü basma formada tolturuu üchün subyektke kelet; oğan cheyin bul tastıktoonu saktañız. Sanak kagazın sanakchı kelgenden kiyin beret.", "Возвращено {d}: ответы раздела «{s}» не согласуются с Реестром или между собой. Переписчик участка посетит субъект, чтобы заполнить этот раздел на бумажном бланке; до этого храните подтверждение. Талон переписи выдаёт переписчик после посещения."),
    future: T("No questionnaire with this number has been received.", "Bul nomer menen suroo-joop kabıl alıngan emes.", "Анкета с таким номером не поступала."),
    helpH: T("About the census", "Sanak tuuraluu", "О переписи"),
    helpP: T("The census of business entities runs from 15 October to 30 November 2026 under Executive Directive 2026/24. Answers are used for statistics only. The online questionnaire is the printed form TSO-26 in electronic form: an entity answers once, on paper or online.", "Ishkanalardın sanagı 2026/24 Atkaruu direktivasına ılayık 2026-jıldın 15-oktyabrınan 30-noyabrına cheyin ötöt. Jooptor statistika üchün gana koldonulat. Onlayn suroo-joop TSO-26 basma formasının elektronduk türü: subyekt bir jolu, kagaz menen je onlayn joop beret.", "Перепись хозяйствующих субъектов проходит с 15 октября по 30 ноября 2026 года по Исполнительной директиве 2026/24. Ответы используются только для статистики. Онлайн-анкета — электронный вариант бланка TSO-26: субъект отвечает один раз, на бумаге или онлайн."),
    helpLine: T("Census line of the Territorial Statistics Office: +996-39-2-21-60-18, Monday to Friday 9:00–17:00; census@stats.iradgov.org. Questionnaires are never collected by telephone.", "Aymaktık statistika keñsesinin sanak liniyası: +996-39-2-21-60-18, düyshömbüdön jumaga cheyin 9:00–17:00; census@stats.iradgov.org. Suroo-jooptor ech kachan telefon arkıluu chogultulbayt.", "Линия переписи Территориального статистического управления: +996-39-2-21-60-18, понедельник–пятница 9:00–17:00; census@stats.iradgov.org. Анкеты никогда не собираются по телефону."),
    pdf: T("Printed form TSO-26 (PDF)", "TSO-26 basma forması (PDF)", "Бланк TSO-26 (PDF)"),
    tso: T("The census on the Territorial Statistics Office site", "Aymaktık statistika keñsesinin saytında sanak", "Перепись на сайте Территориального статистического управления")
  };

  var YN = [["", T("— choose —", "— tandañız —", "— выберите —")], ["y", T("yes", "ooba", "да")], ["n", T("no", "jok", "нет")]];
  function ch(a) { return [["", YN[0][1]]].concat(a.map(function (x, i) { return [String(i + 1), x]; })); }
  /* sections: [title, questions]; a question is [id, kind, label, options]; kinds: txt, reg, sel, num, pct (a group of
     shares adding to 100), multi (tick boxes, at most `max`) */
  var S = [
    [T("Identification", "Identifikatsiya", "Идентификация"), [
      ["reg", "reg", T("Registration number (Register of Firms)", "Kattoo nomeri (Firmalar reestri)", "Регистрационный номер (Реестр фирм)")],
      ["name", "txt", T("Full name of the entity, as registered", "Subyekttin kattalgan toluk atı", "Полное наименование субъекта, как в реестре")],
      ["tin", "num", T("Taxpayer number (14 figures)", "Salık töloochünün nomeri (14 san)", "ИНН (14 цифр)"), 14],
      ["kea", "num", T("Main activity code (KEA-2012, 6 figures)", "Negizgi ish-araket kodu (KEA-2012, 6 san)", "Код основного вида деятельности (КЭД-2012, 6 цифр)"), 6],
      ["stat", "sel", T("Status on 1 October 2026", "2026-jıldın 1-oktyabrındagı statusu", "Состояние на 1 октября 2026"), ch([T("operating", "ish jürgüzöt", "действует"), T("seasonal, not operating now", "mezgildik, azır ish jok", "сезонный, сейчас не действует"), T("temporarily suspended", "ubaktıluu toktotulgan", "временно приостановлен"), T("never started", "ech bashtalgan emes", "не начинал деятельность"), T("being wound up", "joyuluuda", "в стадии ликвидации"), T("ceased (Register not yet notified)", "toktogon (Reestrge bildirile elek)", "прекратил (Реестр не уведомлён)")])]
    ]],
    [T("Ownership", "Menchik", "Собственность"), [
      ["form", "sel", T("Legal form", "Ukuktuk formasi", "Организационно-правовая форма"), ch([T("sole trader", "jeke ishker", "ИП"), T("limited / additional liability company", "JChK / KJK", "ООО / ОДО"), T("joint-stock company", "aktsionerdik koom", "акционерное общество"), T("cooperative or partnership", "kooperativ je sherikteshtik", "кооператив или товарищество"), T("state or municipal enterprise", "mamlekettik je shaardık ishkana", "гос. или муниципальное предприятие"), T("branch of a foreign entity", "chet eldik filial", "филиал иностранного субъекта")])],
      ["own", "pct", T("Share of the charter capital held by, % (total 100)", "Ustavdık kapitaldın ülüshü, % (baarı 100)", "Доля уставного капитала, % (всего 100)"), [T("ISEZ state or city", "Mamleket je shaar", "Государство или город ОЭЗИ"), T("residents of the ISEZ", "IAEZ jashoochuları", "резиденты ОЭЗИ"), T("residents of the ATR", "ATR jashoochuları", "жители АТР"), T("Kazakhstan", "Kazakstan", "Казахстан"), T("Kyrgyzstan", "Kırgızstan", "Кыргызстан"), T("Uzbekistan", "Özbekstan", "Узбекистан"), T("Russia", "Rossiya", "Россия"), T("United States", "AKSh", "США"), T("other", "bashka", "другие")]],
      ["grp", "sel", T("Is the entity part of a group (has a parent or subsidiaries)?", "Subyekt toptun bölügübü?", "Входит ли субъект в группу?"), YN]
    ]],
    [T("Employees", "Kızmatkerler", "Работники"), [
      ["mf", "num", T("Men, full time", "Erkekter, toluk kün", "Мужчины, полный день"), 5],
      ["wf", "num", T("Women, full time", "Ayaldar, toluk kün", "Женщины, полный день"), 5],
      ["mp", "num", T("Men, part time or seasonal", "Erkekter, toluk emes kün je mezgildik", "Мужчины, неполный день или сезонные"), 5],
      ["wp", "num", T("Women, part time or seasonal", "Ayaldar, toluk emes kün je mezgildik", "Женщины, неполный день или сезонные"), 5],
      ["fw", "num", T("of whom foreign workers", "anın ichinde chet eldik kızmatkerler", "из них иностранные работники"), 5],
      ["atr", "num", T("of whom residents of the ATR crossing the line daily", "anın ichinde liniyadan kün sayın ötkön ATR jashoochuları", "из них жители АТР, ежедневно пересекающие линию"), 5],
      ["wage", "num", T("Wages paid, September 2026, som (to the nearest thousand)", "2026-jıldın sentyabrında tölöngön aylık, som (miñge tegerektep)", "Начисленная зарплата, сентябрь 2026, сом (с округлением до тысячи)"), 9],
      ["usd", "sel", T("Wages partly in US dollars", "Aylık bölügü dollar menen", "Зарплата частично в долларах США"), YN]
    ]],
    [T("Turnover", "Jügürtüü", "Оборот"), [
      ["tov", "sel", T("Turnover 1 October 2025 – 30 September 2026 (som, VAT included)", "2025-jıldın 1-oktyabrınan 2026-jıldın 30-sentyabrına cheyinki jügürtüü (som, KNS menen)", "Оборот за 1 октября 2025 – 30 сентября 2026 (сом, с НДС)"), ch([T("none", "jok", "нет"), T("up to 100,000", "100 000gö cheyin", "до 100 000"), T("100,001 – 500,000", "100 001 – 500 000", "100 001 – 500 000"), T("500,001 – 1,500,000", "500 001 – 1 500 000", "500 001 – 1 500 000"), T("1,500,001 – 5,000,000", "1 500 001 – 5 000 000", "1 500 001 – 5 000 000"), T("5,000,001 – 20,000,000", "5 000 001 – 20 000 000", "5 000 001 – 20 000 000"), T("20,000,001 – 100,000,000", "20 000 001 – 100 000 000", "20 000 001 – 100 000 000"), T("over 100,000,000", "100 000 000dan ashık", "свыше 100 000 000")])],
      ["mkt", "pct", T("Share of turnover by market, % (total 100)", "Rınok boyuncha jügürtüünün ülüshü, % (baarı 100)", "Доля оборота по рынкам, % (всего 100)"), [T("sales in the ISEZ", "IAEZde satuu", "продажи в ОЭЗИ"), T("sales to the ATR", "ATRge satuu", "продажи в АТР"), T("export", "eksport", "экспорт")]],
      ["cash", "num", T("Share received in cash, %", "Nakta alıngan ülüsh, %", "Доля, полученная наличными, %"), 3, 100],
      ["inusd", "num", T("Share received in US dollars, %", "AKSh dolları menen alıngan ülüsh, %", "Доля, полученная в долларах США, %"), 3, 100],
      ["vat", "sel", T("Registered for VAT", "KNS boyuncha kattalgan", "Плательщик НДС"), YN]
    ]],
    [T("Premises", "Jaylar", "Помещения"), [
      ["prem", "num", T("Number of premises used on 1 October 2026 (offices, shops, workshops, stores, land)", "2026-jıldın 1-oktyabrında paydalanılgan jaylardın sanı", "Число помещений на 1 октября 2026 (офисы, магазины, цеха, склады, участки)"), 3],
      ["area", "num", T("Total area, m²", "Jalpı ayantı, m²", "Общая площадь, м²"), 7],
      ["tenure", "sel", T("Main premises are", "Negizgi jay", "Основное помещение"), ch([T("owned", "menchik", "в собственности"), T("leased", "ijarada", "арендуется"), T("used free of charge", "akısız paydalanılat", "используется безвозмездно")])],
      ["rent", "num", T("Rent paid per month, som (0 if none)", "Aylık ijara akısı, som (jok bolso 0)", "Арендная плата в месяц, сом (0, если нет)"), 8]
    ]],
    [T("Vehicles", "Unaalar", "Транспортные средства"), [
      ["cars", "num", T("Cars (taxis included)", "Jeñil unaalar (taksi menen)", "Легковые (включая такси)"), 4],
      ["bus", "num", T("Buses and minibuses", "Avtobustar jana marshrutkalar", "Автобусы и микроавтобусы"), 4],
      ["lorry", "num", T("Lorries and tankers", "Jük unaaları jana tsisternalar", "Грузовые и цистерны"), 4],
      ["farm", "num", T("Tractors and farm machines", "Traktorlar jana ayıl charba mashinaları", "Тракторы и с/х машины"), 4],
      ["rhd", "num", T("of all vehicles, right-hand drive", "baarınan oñ rulduu", "из всех ТС праворульные"), 4]
    ]],
    [T("Computers and internet", "Kompyuterler jana internet", "Компьютеры и интернет"), [
      ["pcs", "num", T("Desktop and portable computers in use", "Koldonuudagı kompyuterler", "Компьютеров в использовании"), 4],
      ["till", "num", T("Cash registers", "Kassa apparattarı", "Кассовых аппаратов"), 3],
      ["net", "multi", T("Internet connection (tick all that apply)", "Internet baylanısh (tiyeshelüülördün baarın belgileñiz)", "Подключение к интернету (отметьте все)"), [T("none", "jok", "нет"), T("Attelkom fibre", "Attelkom optika", "оптика «Аттелком»"), T("Attelkom ADSL or radio", "Attelkom ADSL je radio", "ADSL или радио «Аттелком»"), T("mobile: Attelkom 4G", "mobildik: Attelkom 4G", "мобильный: «Аттелком» 4G"), T("mobile: Torgoy", "mobildik: Torgoy", "мобильный: «Торгой»"), T("satellite", "sputnik", "спутник")]],
      ["web", "sel", T("The entity has its own website", "Subyekttin öz saytı bar", "У субъекта есть свой сайт"), YN],
      ["tch", "sel", T("The entity has a channel on Tulpar", "Subyekttin Tulparda kanalı bar", "У субъекта есть канал в Tulpar"), YN],
      ["tpay", "sel", T("Does the entity use Tulpar Pay? (asked for statistical purposes; the answer is not a report to the Bank of Irad)", "Subyekt Tulpar Pay koldonobu? (statistika üchün; joop Irad Bankına bildirüü emes)", "Использует ли субъект Tulpar Pay? (в статистических целях; ответ не является сообщением в Банк Ирада)"), YN]
    ]],
    [T("Energy", "Energiya", "Энергия"), [
      ["kwh", "num", T("Electricity used, September 2026, kWh", "2026-jıldın sentyabrındagı elektr, kVt·s", "Электроэнергия, сентябрь 2026, кВт·ч"), 7],
      ["acct", "num", T("Electricity account number (Electric Networks, 10 figures)", "Elektr esebinin nomeri (10 san)", "Номер лицевого счёта (электросети, 10 цифр)"), 10],
      ["gen", "sel", T("Own generator", "Öz generatoru", "Собственный генератор"), YN],
      ["cuts", "sel", T("Interruptions of electricity supply in the last 12 months", "Akırkı 12 aydagı elektr üzülüülörü", "Перерывы электроснабжения за 12 месяцев"), ch([T("none", "jok", "нет"), T("1–5", "1–5", "1–5"), T("6–20", "6–20", "6–20"), T("over 20", "20dan ashık", "свыше 20")])],
      ["heat", "sel", T("Main heating of the premises", "Jaylardı negizgi jılıtuu", "Основное отопление помещений"), ch([T("district heating", "borborloshkon jılıtuu", "центральное"), T("own gas boiler", "öz gaz kazanı", "свой газовый котёл"), T("coal", "kömür", "уголь"), T("electric", "elektr", "электрическое"), T("wood or dung", "otun je tezek", "дрова или кизяк"), T("not heated", "jılıtılbayt", "не отапливается")])]
    ]],
    [T("Difficulties and remarks", "Kıyınchılıktar jana eskertüülör", "Трудности и замечания"), [
      ["obst", "multi", T("Main obstacles to the activity in 2026 (not more than three)", "2026-jıldagı ish-araketke negizgi toskoolduktar (üchtön ashpayt)", "Основные препятствия в 2026 году (не более трёх)"), [T("access to US dollars", "AKSh dollarına jetüü", "доступ к долларам США"), T("electricity supply", "elektr menen kamsız kıluu", "электроснабжение"), T("number of permits and licences", "uruksat jana litsenziyalardın sanı", "число разрешений и лицензий"), T("taxes", "salıktar", "налоги"), T("finding qualified staff", "kesiptik kızmatkerlerdi tabuu", "поиск квалифицированных кадров"), T("transport and crossings", "transport jana ötkööldör", "транспорт и пункты пропуска"), T("credit", "kredit", "кредит"), T("demand", "suroo-talap", "спрос"), T("none", "jok", "нет")], 3],
      ["rem", "area", T("Remarks (optional)", "Eskertüülör (mildettüü emes)", "Замечания (необязательно)")],
      ["who", "txt", C.who]
    ]]
  ];
  var MAX3 = T("Tick not more than three.", "Üchtön ashık belgilebeñiz.", "Отметьте не более трёх.");
  var NONE1 = T("Tick at least one box.", "Keminde birin belgileñiz.", "Отметьте хотя бы один вариант.");

  function q(x) {
    var id = "c_" + x[0], lab = L(x[2]);
    if (x[1] === "reg") return field(id, lab, inp(id, "TL-19-004517", ' maxlength="14" style="text-transform:uppercase"'));
    if (x[1] === "txt") return field(id, lab, inp(id, "", ' maxlength="90"'));
    if (x[1] === "area") return field(id, lab, '<textarea id="' + id + '" rows="3" maxlength="600"></textarea>');
    if (x[1] === "num") return field(id, lab, inp(id, "", ' inputmode="numeric" maxlength="' + x[3] + '" style="max-width:' + Math.max(6, x[3] + 3) + 'em"'));
    if (x[1] === "sel") return field(id, lab, sel(id, opts(x[3])));
    if (x[1] === "pct") return '<fieldset class="fld" id="' + id + '"><legend>' + esc(lab) + '</legend><div class="tw"><table class="tbl"><tbody>' + x[3].map(function (o, i) {
      return "<tr><td>" + esc(L(o)) + '</td><td class="num"><input id="' + id + "_" + i + '" type="text" inputmode="numeric" maxlength="3" style="width:4em" value="0"></td></tr>';
    }).join("") + '</tbody></table></div><span class="err" id="' + id + '-err" hidden></span></fieldset>';
    if (x[1] === "multi") return '<fieldset class="fld" id="' + id + '"><legend>' + esc(lab) + "</legend>" + x[3].map(function (o, i) {
      return '<label style="display:block;font-weight:400"><input type="checkbox" id="' + id + "_" + i + '"> ' + esc(L(o)) + "</label>";
    }).join("") + '<span class="err" id="' + id + '-err" hidden></span></fieldset>';
    return "";
  }
  function bad(id, msg) { var e = $("#" + id + "-err"); if (e) { e.textContent = L(msg); e.hidden = false; } var el = $("#" + id); if (el && el.focus) el.focus(); return false; }
  function isNum(v) { return /^\d+$/.test(String(v).replace(/[\s,]/g, "")); }
  function val(id) { return String($("#" + id).value || "").replace(/[\s,]/g, ""); }

  /* checks one section; returns true when it may be left */
  function valid(si) {
    var ok = true;
    S[si][1].forEach(function (x) {
      if (!ok) return;
      var id = "c_" + x[0], e = $("#" + id + "-err");
      if (e) { e.hidden = true; e.textContent = t("required"); }
      if (x[1] === "reg") { ok = need(id, function (v) { return /^(TL|NZ|IJ|CH|KB|TD|LN|TO|SB)-?\d{2}-?\d{6}$/i.test(v.trim()); }) || bad(id, C.regBad); if (ok && +H.norm($("#" + id).value).slice(2, 4) > 26) ok = bad(id, C.regNew); }
      else if (x[1] === "txt") ok = need(id, function (v) { return v.trim().length >= 3; });
      else if (x[1] === "sel") ok = need(id);
      else if (x[1] === "num") { ok = need(id, isNum) || bad(id, C.num); if (ok && x[4] && +val(id) > x[4]) ok = bad(id, C.pct); if (ok && (x[0] === "tin" || x[0] === "kea" || x[0] === "acct") && val(id).length !== x[3]) ok = bad(id, C.req); }
      else if (x[1] === "pct") {
        var s = 0, nums = true;
        x[3].forEach(function (o, i) { var v = String($("#" + id + "_" + i).value).trim(); if (!/^\d{1,3}$/.test(v)) nums = false; else s += +v; });
        if (!nums) ok = bad(id, C.num);
        else if (s !== 100) { ok = bad(id, C.sum); $("#" + id + "-err").textContent = L(x[0] === "mkt" ? C.sumT : C.sum, { s: s }); }
      } else if (x[1] === "multi") {
        var n = x[3].filter(function (o, i) { return $("#" + id + "_" + i).checked; }).length;
        if (!n) ok = bad(id, NONE1); else if (x[4] && n > x[4]) ok = bad(id, MAX3);
      }
    });
    return !!ok;
  }

  /* the confirmation number: E26-<day of the year>-<4 figures from the registration number and the day> */
  function dayNo(d) { return Math.round((d - Date.UTC(d.getUTCFullYear(), 0, 1)) / 864e5) + 1; }
  function confNo(reg, d) { return "E26-" + dayNo(d) + "-" + ("000" + (hash("tso26" + reg + iso(d)) % 9000 + 1000)).slice(-4); }
  function workDays(from, n) { var d = new Date(from.getTime()), k = 0; while (k < n) { d = H.addDays(d, 1); var w = d.getUTCDay(); if (w !== 0 && w !== 6) k++; } return d; }

  function pageCensus() {
    var today = H.today(), open = today >= day(OPEN) && today <= day(CLOSE), before = today < day(OPEN);
    document.title = L(C.title) + " | e-Irad";
    var SEP = ' <span class="sep">›</span> ';
    var help = "<h3>" + esc(L(C.helpH)) + "</h3><p>" + esc(L(C.helpP)) + "</p><p>" + esc(L(C.helpLine)) + '</p><p><a href="/forms/TSO-26.pdf">' + esc(L(C.pdf)) + '</a></p><p><a href="https://stats.iradgov.org/business-census.html">' + esc(L(C.tso)) + "</a></p>";
    $("#app").innerHTML = '<div class="wrap page"><nav class="crumbs" aria-label="breadcrumb"><a href="/">e-Irad</a>' + SEP + '<a href="/business.html">' + esc(t("secBiz")) + "</a>" + SEP + '<a href="/service.html?id=census">' + esc(L({ en: "Census of business entities 2026", ir: "2026-jılkı ishkanalardın sanagı", ru: "Перепись хозяйствующих субъектов 2026" })) + "</a>" + SEP + "<span>" + esc(L(C.tabs[0])) + "</span></nav>" +
      '<div class="svchead">' + H.icon("chart") + "<div><h1>" + esc(L(C.title)) + "</h1><p>" + esc(L(C.desc)) + '</p><p class="agency"><span>' + esc(t("agency")) + ":</span> " + esc(L(C.agency)) + " " + H.badge(open ? "ok" : before ? "soon" : "off") + "</p></div></div>" +
      '<div class="svcgrid"><div id="xmain"></div><aside class="help">' + help + "</aside></div></div>";
    var box = $("#xmain");
    box.innerHTML = '<div class="xtabs" role="tablist">' + C.tabs.map(function (x, i) { return '<a href="#' + ["form", "check"][i] + '" role="tab" data-tab="' + i + '">' + esc(L(x)) + "</a>"; }).join("") + "</div>" +
      '<div data-pane="0"><div id="cq"></div><div id="cqr" class="result" hidden aria-live="polite"></div></div>' +
      '<div data-pane="1" hidden><form class="flow" id="fcc">' + field("ccn", L(C.cno), inp("ccn", L(C.cph), ' maxlength="16" style="text-transform:uppercase"')) + '<button class="btn" type="submit">' + esc(L(C.cbtn)) + '</button></form><div id="ccr" class="result" hidden aria-live="polite"></div></div>';
    function tab(i) { H.$$("[data-pane]").forEach(function (p) { p.hidden = p.getAttribute("data-pane") !== String(i); }); H.$$("[data-tab]").forEach(function (a) { a.className = a.getAttribute("data-tab") === String(i) ? "on" : ""; }); }
    H.$$("[data-tab]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); tab(+a.getAttribute("data-tab")); history.replaceState(null, "", a.getAttribute("href")); }); });
    function res(id, html) { var r = $("#" + id); r.innerHTML = html; r.hidden = false; r.scrollIntoView({ block: "nearest" }); }

    /* the questionnaire */
    var cq = $("#cq"), started = 0, cur = 0, timer = null;
    function intro() {
      if (!open) { cq.innerHTML = P(before ? C.before : C.after, "warn") + '<p><a class="btn ghost" href="/forms/TSO-26.pdf">' + esc(L(C.pdf)) + "</a></p>"; return; }
      cq.innerHTML = '<div class="flow">' + P(C.intro) + '<button class="btn" type="button" id="cqs">' + esc(L(C.start)) + "</button></div>";
      $("#cqs").addEventListener("click", function () { started = Date.now(); cur = 0; build(); });
    }
    function build() {
      $("#cqr").hidden = true;
      cq.innerHTML = '<form class="flow" id="fcq" novalidate>' + S.map(function (s, i) {
        return '<div data-sec="' + i + '"' + (i ? " hidden" : "") + '><p class="tiny">' + esc(L(C.of, { i: i + 1, n: S.length })) + " · <span data-left></span></p><h2>" + String.fromCharCode(65 + i) + ". " + esc(L(s[0])) + "</h2>" +
          s[1].map(q).join("") + (i === S.length - 1 ? H.chk("c_decl", L(C.declare)) + '<span class="err" id="c_decl-err" hidden></span>' : "") +
          '<p class="pbtns">' + (i ? '<button class="btn ghost" type="button" data-back>' + esc(L(C.back)) + "</button> " : "") + '<button class="btn" type="submit">' + esc(L(i === S.length - 1 ? C.send : C.next)) + "</button></p></div>";
      }).join("") + '<p class="tiny">' + esc(L(C.leave)) + "</p></form>";
      H.$$("[data-back]").forEach(function (b) { b.addEventListener("click", function () { show(cur - 1); }); });
      $("#fcq").addEventListener("submit", function (e) { e.preventDefault(); step(); });
      if (timer) clearInterval(timer);
      timer = setInterval(tick, 20000); tick();
    }
    function tick() { var m = Math.max(0, SESSION_MIN - Math.floor((Date.now() - started) / 60000)); H.$$("[data-left]").forEach(function (s) { s.textContent = L(C.left, { m: m }); }); }
    function show(i) { cur = i; H.$$("[data-sec]").forEach(function (s) { s.hidden = s.getAttribute("data-sec") !== String(i); }); $("#fcq").scrollIntoView({ block: "start" }); }
    function step() {
      if (Date.now() - started > SESSION_MIN * 60000) { clearInterval(timer); intro(); res("cqr", P(C.expired, "warn")); return; }
      if (!valid(cur)) return;
      if (cur === 0) {
        var reg = H.norm($("#c_reg").value), h = hash("tsoreg" + reg);
        if (h % 13 === 0) { bad("c_reg", C.notReg); return; }
        if (h % 17 === 0) { var dd = H.addDays(day("2026-10-15"), (h >>> 5) % 16); bad("c_reg", C.dup); $("#c_reg-err").textContent = L(C.dup, { d: fmtD(dd), m: L(C.dupM[(h >>> 9) % 2]) }); return; }
      }
      if (cur < S.length - 1) { show(cur + 1); return; }
      if (!$("#c_decl").checked) { bad("c_decl", C.declErr); return; }
      finish();
    }
    function finish() {
      clearInterval(timer);
      var reg = H.norm($("#c_reg").value), r = reg.slice(0, 2) + "-" + reg.slice(2, 4) + "-" + reg.slice(4), d = today, no = confNo(reg, d);
      var name = String($("#c_name").value).trim().toUpperCase(), who = String($("#c_who").value).trim();
      cq.innerHTML = "";
      res("cqr", refBox(C.done, no, [[L(C.recv), esc(fmtD(d) + ", " + ("0" + H.iradNow().getHours()).slice(-2) + ":" + ("0" + H.iradNow().getMinutes()).slice(-2))], [L(C.entity), esc(name)], [L(C.regno), esc(r)], [L(C.mode), esc(L(C.modeV))], [L(C.by), esc(who)], [L(C.checkBy), esc(fmtD(workDays(d, CHECK_DAYS)))]]) +
        P(C.keep) + P(C.nothing, "tiny") + '<p><button type="button" class="btn ghost" id="cqp">' + esc(L(C.print)) + "</button></p>");
      $("#cqp").addEventListener("click", function () { window.print(); });
    }
    intro();

    /* check a confirmation */
    $("#fcc").addEventListener("submit", function (e) {
      e.preventDefault();
      if (!need("ccn")) return;
      var n = H.norm($("#ccn").value), m = /^E26(\d{3})(\d{4})$/.exec(n);
      if (!m) { res("ccr", P(C.cBad, "warn")); return; }
      var dn = +m[1], recv = new Date(Date.UTC(2026, 0, dn));
      if (dn < dayNo(day(OPEN)) || dn > dayNo(day(CLOSE))) { res("ccr", P(C.cBad, "warn")); return; }
      if (recv > today) { res("ccr", P(C.future, "warn")); return; }
      var h = hash("tsochk" + n), due = workDays(recv, 3 + h % (CHECK_DAYS - 2)), st;
      if (today < due) st = P(C.s0, "", { d: fmtD(workDays(recv, CHECK_DAYS)) });
      else if (h % 7 === 0) st = P(C.s3, "warn", { d: fmtD(due), s: L(S[[2, 3, 4, 7][(h >>> 3) % 4]][0]) });
      else if (h % 9 === 0) st = P(C.s2, "ok", { d: fmtD(due), c: ["47.11.00", "46.90.00", "49.41.00", "56.10.01", "01.45.00"][(h >>> 5) % 5] });
      else st = P(C.s1, "ok", { d: fmtD(due) });
      res("ccr", kv([[L(C.cno), esc("E26-" + m[1] + "-" + m[2])], [L(C.recv), esc(fmtD(recv))]]) + H4(C.status) + st);
    });
    function fromHash() { tab(location.hash === "#check" ? 1 : 0); }
    window.addEventListener("hashchange", fromHash); fromHash();
  }
  return { page: pageCensus };
};
