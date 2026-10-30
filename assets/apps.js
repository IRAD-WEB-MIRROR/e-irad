/* e-Irad online submission pilot: /applications/ (submit an application, follow it, my applications).
   Same rules as app.js: nothing is sent. The course of an application is worked out from its reference number and
   today's date in Irad time, so the same number shows the same history on any device. The only thing kept is the list
   of numbers the visitor has taken, with the day a corrected page was handed in (localStorage eirad_apps). */
window.E_APPS = (function () {
  "use strict";
  var START = "2026-10-01", KEEP = 10, CHK = "ABCEHKMPTX";

  /* bodies asked for an opinion or a record (names as in data/procedures.json) */
  var INST = {
    records: { en: "Records Department, Ministry of Internal Security", ir: "Ichki koopsuzduk ministrligi, Esepke aluu departamenti", ru: "Министерство внутренней безопасности, Учётный департамент" },
    police: { en: "City police: licensing and registration section", ir: "Shaar politsiyası: litsenziyaloo jana kattoo bölümü", ru: "Городская полиция: отдел лицензирования и регистрации" },
    toponymy: { en: "Toponymic Section, State Archives of Irad", ir: "Toponimika bölümü, Irad mamlekettik arkhivi", ru: "Топонимический отдел, Государственный архив Ирада" },
    archives: { en: "State Archives of Irad", ir: "Irad mamlekettik arkhivi", ru: "Государственный архив Ирада" },
    fire: { en: "State Fire Inspectorate", ir: "Mamlekettik ört közömöl inspektsiyası", ru: "Государственная пожарная инспекция" },
    bti: { en: "Technical Inventory Bureau", ir: "Tekhnikalık inventarizatsiya byurosu", ru: "Бюро технической инвентаризации" },
    sanit: { en: "City Sanitary Inspectorate", ir: "Shaardık sanitardık inspektsiya", ru: "Городская санитарная инспекция" },
    hpc: { en: "Highway Patrol Corps", ir: "Avtojol patrul korpusu", ru: "Корпус дорожного патруля" },
    tax: { en: "District Tax Inspectorate", ir: "Aymaktık salık inspektsiyası", ru: "Районная налоговая инспекция" },
    vet: { en: "State Veterinary Inspectorate", ir: "Mamlekettik veterinardık inspektsiya", ru: "Государственная ветеринарная инспекция" },
    passport: { en: "Passport and Residence Service", ir: "Pasport jana jashoo jayı kızmatı", ru: "Служба паспортов и регистрации" },
    heritage: { en: "Heritage Department", ir: "Muras departamenti", ru: "Департамент наследия" },
    land: { en: "Land department of the district administration", ir: "Aymaktık administratsiyanın jer bölümü", ru: "Земельный отдел районной администрации" },
    street: { en: "Street committee (köchö komiteti)", ir: "Köchö komiteti", ru: "Уличный комитет" },
    bazaar: { en: "Administration of the Bazar-i Kalan", ir: "Bazar-i Kalandın administratsiyası", ru: "Администрация Базар-и-Калан" },
    clinic: { en: "City polyclinic (medical commissions)", ir: "Shaardık poliklinika (meditsinalık komissiyalar)", ru: "Городская поликлиника (медицинские комиссии)" },
    disp: { en: "City narcological and psychoneurological dispensaries", ir: "Shaardık narkologiyalık jana psikhonevrologiyalık dispanserler", ru: "Городские наркологический и психоневрологический диспансеры" },
    chamber: { en: "Chamber of Commerce and Industry of Irad", ir: "Irad sooda-önör jay palatası", ru: "Торгово-промышленная палата Ирада" },
    abroad: { en: "The authority that issued the licence (through the Ministry of Foreign Affairs)", ir: "Litsenziyanı bergen organ (Tashkı ishter ministrligi arkıluu)", ru: "Орган, выдавший удостоверение (через Министерство иностранных дел)" },
    socfund: { en: "Social Fund of the ISEZ, district office", ir: "IAEZdin Sotsialdık fondu, aymaktık bölüm", ru: "Социальный фонд ОЭЗИ, районное отделение" }
  };
  var EGOV = { en: "e-Government Service Centre", ir: "e-Ökmöt kızmat borboru", ru: "Центр услуг электронного правительства" };

  /* the services in the pilot: service id, form, receiving body (E_FORMS agency), term in working days, bodies asked,
     state duty payable, kind (c certificate, p permit or licence) */
  var SPEC = [
    ["conduct", "MIS-22", "mis", 10, ["police"], 1, "c"],
    ["civil", "CR-2", "cr", 5, ["archives"], 1, "c"],
    ["address", "PRS-3", "prs", 3, ["street"], 0, "c"],
    ["namechange", "CR-9", "cr", 20, ["records", "passport"], 1, "c"],
    ["licence", "HPC-12", "hpc", 15, ["clinic", "abroad"], 1, "p"],
    ["pension", "SF-1", "sf", 10, ["archives"], 0, "c"],
    ["archive", "SA-4", "sa", 20, [], 1, "c"],
    ["dog", "TZ-61", "taz", 5, ["vet"], 1, "p"],
    ["hunting", "AGR-11", "agr", 10, ["police"], 1, "p"],
    ["stall", "CH-40", "city", 10, ["bazaar", "sanit"], 1, "p"],
    ["sign", "CH-44", "city", 10, ["toponymy"], 1, "p"],
    ["taxi", "DIC-3", "dic", 15, ["hpc", "clinic", "disp"], 1, "p"],
    ["alcohol", "ME-17", "me", 20, ["fire", "sanit", "police"], 1, "p"],
    ["trader", "FTE-2", "fte", 15, ["tax", "chamber"], 1, "p"],
    ["building", "CA-6", "arch", 30, ["bti", "land", "fire", "heritage"], 1, "p"]
  ];
  var PAGES = { "MIS-22": 3, "CR-2": 3, "PRS-3": 3, "CR-9": 3, "HPC-12": 3, "SF-1": 3, "SA-4": 3, "TZ-61": 3, "AGR-11": 3, "CH-40": 3, "CH-44": 3, "DIC-3": 3, "ME-17": 3, "FTE-2": 3, "CA-6": 4 };
  function spec(id) { for (var i = 0; i < SPEC.length; i++) if (SPEC[i][0] === id) return SPEC[i]; return null; }
  function byCode(c) { for (var i = 0; i < SPEC.length; i++) if (SPEC[i][1].replace("-", "") === c) return SPEC[i]; return null; }

  var T = {
    title: { en: "Applications online", ir: "Onlayn arızdar", ru: "Заявления онлайн" },
    desc: { en: "Submit an application for a certificate, licence or permit and follow it through the receiving body until it is ready to collect.", ir: "Maalımkatka, kuböölükkö je uruksatka arız berip, anın kabıl aluuchu organdagı jolun dayar bolgucha karap turuñuz.", ru: "Подайте заявление на справку, удостоверение или разрешение и следите за его прохождением в принимающем органе до выдачи." },
    agency: { en: "e-Government Service Centre, with the receiving bodies", ir: "e-Ökmöt kızmat borboru, kabıl aluuchu organdar menen", ru: "Центр услуг электронного правительства совместно с принимающими органами" },
    tabs: [{ en: "Submit", ir: "Arız berüü", ru: "Подать" }, { en: "Follow an application", ir: "Arızdı karoo", ru: "Проверить заявление" }, { en: "My applications", ir: "Menin arızdarım", ru: "Мои заявления" }],
    svc: { en: "Service", ir: "Kızmat", ru: "Услуга" },
    cert: { en: "Certificates and records", ir: "Maalımkattar jana jazuular", ru: "Справки и записи" },
    perm: { en: "Licences and permits", ir: "Litsenziyalar jana uruksattar", ru: "Лицензии и разрешения" },
    filled: { en: "I have completed form {f} in block capitals and signed every page", ir: "{f} formasın choñ basma tamgalar menen tolturup, ar bir betine kol koydum", ru: "Я заполнил(а) бланк {f} печатными буквами и подписал(а) каждую страницу" },
    paid: { en: "I have paid the state duty at Talasbank and kept the receipt", ir: "Mamlekettik alımdı Talasbankta tölöp, kvitantsiyanı saktadım", ru: "Я оплатил(а) госпошлину в «Таласбанке» и сохранил(а) квитанцию" },
    orig: { en: "I will present the originals of my documents when I collect the result (Pilot Regulation, item 7)", ir: "Natıyjanı alganda dokumentterimdin asıldarın körsötöm (Sınoo jobosu, 7-punkt)", ru: "Я предъявлю оригиналы документов при получении результата (Положение о пилотном проекте, пункт 7)" },
    tick: { en: "Tick all the boxes. Applications without the declarations are not registered.", ir: "Bardık kutuchalardı belgileñiz. Arızdar bul ırastoolorsuz kattalbayt.", ru: "Отметьте все пункты. Заявления без этих подтверждений не регистрируются." },
    send: { en: "Submit the application", ir: "Arızdı berüü", ru: "Подать заявление" },
    regd: { en: "Application registered", ir: "Arız kattaldı", ru: "Заявление зарегистрировано" },
    keep: { en: "Write the number down or print this page. The number is kept in the list under My applications in this browser only; e-Irad keeps no copy during the pilot.", ir: "Nomerdi jazıp alıñız je bul betti basıp chıgarıñız. Nomer ushul brauzerdegi Menin arızdarım tizmesinde gana saktalat; sınoo mezgilinde e-Irad köchürmö saktabayt.", ru: "Запишите номер или распечатайте страницу. Номер хранится в списке «Мои заявления» только в этом браузере; в пилотном режиме e-Irad копий не хранит." },
    follow: { en: "Follow this application", ir: "Bul arızdı karoo", ru: "Следить за заявлением" },
    print: { en: "Print", ir: "Basıp chıgaruu", ru: "Распечатать" },
    no: { en: "Application number", ir: "Arızdın nomeri", ru: "Номер заявления" },
    noPh: { en: "for example MIS22-261027-4108P", ir: "mısalı MIS22-261027-4108P", ru: "например MIS22-261027-4108P" },
    check: { en: "Show the progress", ir: "Abalın körsötüü", ru: "Показать ход" },
    noBad: { en: "The number has three groups and a check letter, for example MIS22-261027-4108P. Copy it exactly as it was given.", ir: "Nomer üch bölüktön jana tekshirüü tamgasınan turat, mısalı MIS22-261027-4108P. Anı berilgendey kochürüñüz.", ru: "Номер состоит из трёх групп и контрольной буквы, например MIS22-261027-4108P. Перепишите его точно." },
    noFound: { en: "No application with this number is registered. Check the number: the letter at the end is a check letter, and a number with a mistake in it cannot be found.", ir: "Bul nomer menen arız kattalgan emes. Nomerdi tekshiriñiz: akırkı tamga tekshirüü tamgası, kata ketken nomer tabılbayt.", ru: "Заявление с таким номером не зарегистрировано. Проверьте номер: последняя буква контрольная, и номер с ошибкой найти нельзя." },
    form: { en: "Form", ir: "Forma", ru: "Бланк" },
    body: { en: "Receiving body", ir: "Kabıl aluuchu organ", ru: "Принимающий орган" },
    date: { en: "Submitted", ir: "Berilgen kün", ru: "Дата подачи" },
    term: { en: "Term of consideration", ir: "Karoo möönötü", ru: "Срок рассмотрения" },
    termV: { en: "{n} working days, to {d}", ir: "{n} ish kün, {d} cheyin", ru: "{n} рабочих дней, до {d}" },
    now: { en: "Status", ir: "Abalı", ru: "Статус" },
    hist: { en: "Course of the application", ir: "Arızdın jolu", ru: "Ход рассмотрения" },
    when: { en: "Date", ir: "Kün", ru: "Дата" },
    what: { en: "Event", ir: "Okuya", ru: "Событие" },
    who: { en: "Body", ir: "Organ", ru: "Орган" },
    asOf: { en: "Information as of {d}. Statuses are entered once a working day and show on e-Irad after 10:00 (Irad Time). Saturdays and Sundays are not counted in terms.", ir: "{d} abalı boyuncha maalımat. Abaldar ish künü bir jolu kiyiriledi jana e-Iradda saat 10:00dön kiyin (Irad ubaktısı) chıgat. Ishembi jana jekshembi möönötkö kirbeyt.", ru: "Сведения на {d}. Статусы вносятся раз в рабочий день и появляются на e-Irad после 10:00 (по времени Ирада). Суббота и воскресенье в сроки не входят." },
    fixH: { en: "Hand in the corrected page", ir: "Oñdolgon betti tapshıruu", ru: "Подать исправленную страницу" },
    fixP: { en: "Print page {p} of form {f} again, complete it correctly and sign it. Upload is not available during the pilot: confirm below, and present the corrected page with the originals when you collect the result. The term of consideration starts again on the day the corrected page is received.", ir: "{f} formasının {p}-betin kayra basıp, tuura tolturup, kol koyuñuz. Sınoo mezgilinde jüktöö jok: tömöndö ırastap, oñdolgon betti natıyjanı alganda asıldar menen körsötüñüz. Karoo möönötü oñdolgon bet kabıl alıngan kündön kayra bashtalat.", ru: "Распечатайте страницу {p} бланка {f} заново, заполните правильно и подпишите. Загрузка в пилотном режиме недоступна: подтвердите ниже и предъявите исправленную страницу с оригиналами при получении результата. Срок рассмотрения начинается заново со дня получения исправленной страницы." },
    fixK: { en: "I have corrected page {p} as required", ir: "{p}-betti talapka ılayık oñdodum", ru: "Я исправил(а) страницу {p}, как требуется" },
    fixB: { en: "Submit the corrected page", ir: "Oñdolgon betti tapshıruu", ru: "Подать исправленную страницу" },
    fixErr: { en: "Confirm that the page has been corrected.", ir: "Bet oñdolgonun ırastañız.", ru: "Подтвердите, что страница исправлена." },
    fixDue: { en: "Correction to be received by {d}. After that date the application is closed.", ir: "Oñdoo {d} cheyin kabıl alınıshı kerek. Andan kiyin arız jabılat.", ru: "Исправление должно поступить до {d}. После этой даты заявление закрывается." },
    mineH: { en: "Applications submitted from this browser", ir: "Ushul brauzerden berilgen arızdar", ru: "Заявления, поданные из этого браузера" },
    mineNone: { en: "There are no applications in this browser. Numbers you submit or follow here are added to the list.", ir: "Bul brauzerde arız jok. Bul jerde bergen je karagan nomerleriñiz tizmege koshulat.", ru: "В этом браузере заявлений нет. Номера, которые вы подаёте или проверяете здесь, добавляются в список." },
    mineP: { en: "The list is kept only in this browser (at most {n} numbers). Clearing the browser's data clears the list, not the applications.", ir: "Tizme ushul brauzerde gana saktalat (eñ köp {n} nomer). Brauzerdin maalımatın tazalasañız tizme öchöt, arızdar öchpöyt.", ru: "Список хранится только в этом браузере (не более {n} номеров). Очистка данных браузера удаляет список, но не заявления." },
    open: { en: "Open", ir: "Achuu", ru: "Открыть" },
    rm: { en: "Remove", ir: "Alıp salu", ru: "Убрать" },
    helpH: { en: "About the pilot", ir: "Sınoo tuuraluu", ru: "О пилотном проекте" },
    helpP: { en: "Since 1 October 2026 applications for the fifteen services below may be submitted on e-Irad instead of at the counter. The application goes to the same body and is considered in the same way and in the same term; only the originals are seen at the end instead of at the start.", ir: "2026-jıldın 1-oktyabrınan beri tömöndögü on besh kızmatka arızdı kassaga emes, e-Iradda berse bolot. Arız oshol ele organga barat jana oshol ele tartipte, oshol ele möönöttö karalat; asıldar gana bashında emes, akırında körülöt.", ru: "С 1 октября 2026 года заявления по пятнадцати услугам ниже можно подавать на e-Irad вместо окошка. Заявление поступает в тот же орган и рассматривается в том же порядке и в те же сроки; только оригиналы предъявляются в конце, а не в начале." },
    helpS: { en: "What the statuses mean", ir: "Abaldar emneni bildiret", ru: "Что означают статусы" },
    helpL: { en: ["Received: registered in the incoming journal of the e-Government Service Centre.", "Forwarded and accepted: the application has reached the receiving body and has its own number there.", "Request sent: the body has asked another body for a record or an opinion. The term does not stop while it waits.", "Returned for correction: something on the form must be corrected. Nothing else happens until the page is handed in.", "Awaiting signature, awaiting stamp: the decision is made and waits only for the head of the body and the stamp.", "Ready for collection: come to the window named, with your ID card, the originals and the duty receipt."], ir: ["Kabıl alındı: e-Ökmöt kızmat borborunun kirüüchü jurnalına kattaldı.", "Jönötüldü jana kabıl alındı: arız kabıl aluuchu organga jetti jana anda öz nomerin aldı.", "Suroo jiberildi: organ bashka organdan jazuu je pikir suradı. Kütüü mezgilinde möönöt toktoboyt.", "Oñdoo üchün kaytarıldı: formada bir nerse oñdolushu kerek. Bet tapshırılmayınca echteme bolboyt.", "Kol koyuunu kütüüdö, möördü kütüüdö: chechim kabıl alındı, organdın jetekchisin jana möördü gana kütüüdö.", "Alıp ketüügö dayar: körsötülgön terezege ID-kartañız, asıldar jana alım kvitantsiyası menen keliñiz."], ru: ["Получено: зарегистрировано во входящем журнале Центра услуг электронного правительства.", "Направлено и принято: заявление поступило в принимающий орган и получило там свой номер.", "Направлен запрос: орган запросил у другого органа сведения или заключение. На время ожидания срок не останавливается.", "Возвращено на исправление: в бланке нужно что-то исправить. Пока страница не подана, ничего не происходит.", "Ожидает подписи, ожидает печати: решение принято и ждёт только руководителя органа и печати.", "Готово к выдаче: приходите в указанное окно с ID-картой, оригиналами и квитанцией об оплате пошлины."] },
    helpN: { en: "Questions about an application go to the receiving body, not to the e-Government Service Centre, which sees only that the application was received.", ir: "Arız boyuncha suroolor e-Ökmöt kızmat borboruna emes, kabıl aluuchu organga berilet: borbor arızdın kabıl alınganın gana köröt.", ru: "Вопросы по заявлению задавайте принимающему органу, а не Центру услуг электронного правительства, который видит только факт получения." },
    pilotH: { en: "Online submission (pilot)", ir: "Onlayn berüü (sınoo)", ru: "Онлайн-подача (пилот)" },
    pilotP: { en: "This service is in the online submission pilot. You can submit form {f} on e-Irad and follow the application until it is ready to collect.", ir: "Bul kızmat onlayn berüü sınoosuna kirgen. {f} formasın e-Iradda berip, arızdı dayar bolgucha karap tursañız bolot.", ru: "Эта услуга участвует в пилотном проекте онлайн-подачи. Бланк {f} можно подать на e-Irad и следить за заявлением до выдачи." },
    pilotA: { en: "Submit online", ir: "Onlayn berüü", ru: "Подать онлайн" }
  };
  /* the events: text of each, and a short form for the list */
  var E = {
    recv: { en: "Received. Entered in the incoming journal under No. {n}.", ir: "Kabıl alındı. Kiruüchü jurnalga No. {n} menen kiyirildi.", ru: "Получено. Внесено во входящий журнал под № {n}." },
    fwd: { en: "Forwarded to {b}.", ir: "{b} jönötüldü.", ru: "Направлено: {b}." },
    acc: { en: "Accepted for consideration, registration No. {n}. Assigned to an inspector.", ir: "Karoogo kabıl alındı, kattoo No. {n}. Inspektorgo tapshırıldı.", ru: "Принято к рассмотрению, регистрационный № {n}. Передано инспектору." },
    nopay: { en: "Payment of the state duty not found. Payments made at Talasbank reach the Treasury within five banking days; no action is needed if the duty was paid.", ir: "Mamlekettik alımdın tölönüshü tabılgan jok. Talasbanktagı tölömdör Kaznacheylikke besh bank kününün ichinde jetet; alım tölöngön bolso, echteme kıluunun keregi jok.", ru: "Оплата госпошлины не найдена. Платежи через «Таласбанк» поступают в Казначейство в течение пяти банковских дней; если пошлина оплачена, ничего делать не нужно." },
    paid: { en: "Payment of the state duty confirmed by the Treasury.", ir: "Mamlekettik alımdın tölönüshün Kaznacheylik ırastadı.", ru: "Оплата госпошлины подтверждена Казначейством." },
    ret: { en: "Returned for correction: form {f}, page {p}: {w}", ir: "Oñdoo üchün kaytarıldı: {f} forması, {p}-bet: {w}", ru: "Возвращено на исправление: бланк {f}, страница {p}: {w}" },
    corr: { en: "Corrected page {p} received. The term of consideration starts again.", ir: "Oñdolgon {p}-bet kabıl alındı. Karoo möönötü kayra bashtaldı.", ru: "Исправленная страница {p} получена. Срок рассмотрения начинается заново." },
    closed: { en: "Closed: the corrected page was not received within 30 days (Pilot Regulation, item 12). The duty paid is not returned; a new application may be submitted.", ir: "Jabıldı: oñdolgon bet 30 kündün ichinde kelgen jok (Sınoo jobosu, 12-punkt). Tölöngön alım kaytarılbayt; jañı arız berse bolot.", ru: "Закрыто: исправленная страница не поступила в течение 30 дней (Положение о пилотном проекте, пункт 12). Уплаченная пошлина не возвращается; можно подать новое заявление." },
    req: { en: "Request sent to {b}.", ir: "{b} suroo jiberildi.", ru: "Направлен запрос: {b}." },
    remind: { en: "No reply from {b}. Reminder sent.", ir: "{b} joop bergen jok. Eskertme jiberildi.", ru: "Нет ответа: {b}. Направлено напоминание." },
    reply: { en: "Reply received from {b}.", ir: "{b} joop aldı.", ru: "Получен ответ: {b}." },
    ext: { en: "Term of consideration extended by {n} working days, to {d}, because a reply from another body is awaited (Pilot Regulation, item 11).", ir: "Karoo möönötü {n} ish küngö, {d} cheyin uzartıldı, antkeni bashka organdın joobu kütülüüdö (Sınoo jobosu, 11-punkt).", ru: "Срок рассмотрения продлён на {n} рабочих дней, до {d}, в связи с ожиданием ответа другого органа (Положение о пилотном проекте, пункт 11)." },
    prep: { en: "Decision prepared. Sent to the head of the body for signature.", ir: "Chechim dayardaldı. Jetekchige kol koyuuga jiberildi.", ru: "Решение подготовлено. Направлено руководителю на подпись." },
    leave: { en: "Awaiting signature. The head of the body is on leave until {d}; documents are signed by the deputy on Thursdays.", ir: "Kol koyuunu kütüüdö. Jetekchi {d} cheyin örgüüdö; dokumentterge beyshembi sayın orun basarı kol koyot.", ru: "Ожидает подписи. Руководитель в отпуске до {d}; документы подписывает заместитель по четвергам." },
    signed: { en: "Signed. Awaiting stamp.", ir: "Kol koyuldu. Möördü kütüüdö.", ru: "Подписано. Ожидает печати." },
    nostamp: { en: "Awaiting stamp. The stamp of the body is being replaced; a new stamp has been ordered from a licensed engraver.", ir: "Möördü kütüüdö. Organdın möörü almashtırılıp jatat; litsenziyası bar oymochudan jañı möör buyurtma kılındı.", ru: "Ожидает печати. Печать органа заменяется; новая печать заказана у лицензированного гравёра." },
    ready: { en: "Ready for collection at {b}, window {w}, Monday to Friday 9:00–12:00. Bring your ID card, the originals and the duty receipt. To be collected by {d}.", ir: "{b}, {w}-tereze, düyshömbüdön jumaga cheyin 9:00–12:00, alıp ketüügö dayar. ID-kartañızdı, asıldardı jana alım kvitantsiyasın ala keliñiz. {d} cheyin alıp ketiñiz.", ru: "Готово к выдаче: {b}, окно {w}, с понедельника по пятницу 9:00–12:00. Возьмите ID-карту, оригиналы и квитанцию об оплате пошлины. Получить до {d}." },
    gone: { en: "Not collected within 30 days. The document has been passed to the archive of {b}; it is issued from the archive on a written request.", ir: "30 kündün ichinde alınbadı. Dokument {b} arkhivine tapshırıldı; arkhivden jazuu jüzündögü arız boyuncha berilet.", ru: "Не получено в течение 30 дней. Документ передан в архив: {b}; выдаётся из архива по письменному заявлению." },
    dup: { en: "Left without consideration: an application on the same matter from the same applicant is already being considered (No. {n}). That application will be answered.", ir: "Karalbay kaldı: oshol ele arızchıdan oshol ele maselede arız karalıp jatat (No. {n}). Oshol arızga joop berilet.", ru: "Оставлено без рассмотрения: заявление того же заявителя по тому же вопросу уже рассматривается (№ {n}). Ответ будет дан на него." },
    quota: { en: "Refused: the number of permits of this kind for the quarter has been reached. Applications for the next quarter are accepted from its first working day.", ir: "Bash tartıldı: bul türdögü uruksattardın chereginin sanı tolup kaldı. Kiyinki cherekke arızdar anın birinchi ish kününön kabıl alınat.", ru: "Отказано: лимит разрешений этого вида на квартал исчерпан. Заявления на следующий квартал принимаются с его первого рабочего дня." }
  };
  var S = {
    recv: { en: "Received", ir: "Kabıl alındı", ru: "Получено" }, fwd: { en: "Forwarded", ir: "Jönötüldü", ru: "Направлено" },
    acc: { en: "Under consideration", ir: "Karalıp jatat", ru: "На рассмотрении" }, nopay: { en: "Duty not found", ir: "Alım tabılgan jok", ru: "Пошлина не найдена" },
    paid: { en: "Under consideration", ir: "Karalıp jatat", ru: "На рассмотрении" }, ret: { en: "Returned for correction", ir: "Oñdoo üchün kaytarıldı", ru: "Возвращено на исправление" },
    corr: { en: "Under consideration", ir: "Karalıp jatat", ru: "На рассмотрении" }, closed: { en: "Closed", ir: "Jabıldı", ru: "Закрыто" },
    req: { en: "Awaiting a reply", ir: "Joop kütülüüdö", ru: "Ожидает ответа" }, remind: { en: "Awaiting a reply", ir: "Joop kütülüüdö", ru: "Ожидает ответа" },
    reply: { en: "Under consideration", ir: "Karalıp jatat", ru: "На рассмотрении" }, ext: { en: "Term extended", ir: "Möönöt uzartıldı", ru: "Срок продлён" },
    prep: { en: "Awaiting signature", ir: "Kol koyuunu kütüüdö", ru: "Ожидает подписи" }, leave: { en: "Awaiting signature", ir: "Kol koyuunu kütüüdö", ru: "Ожидает подписи" },
    signed: { en: "Awaiting stamp", ir: "Möördü kütüüdö", ru: "Ожидает печати" }, nostamp: { en: "Awaiting stamp", ir: "Möördü kütüüdö", ru: "Ожидает печати" },
    ready: { en: "Ready for collection", ir: "Alıp ketüügö dayar", ru: "Готово к выдаче" }, gone: { en: "Passed to the archive", ir: "Arkhivge tapshırıldı", ru: "Передано в архив" },
    dup: { en: "Left without consideration", ir: "Karalbay kaldı", ru: "Оставлено без рассмотрения" }, quota: { en: "Refused", ir: "Bash tartıldı", ru: "Отказано" }
  };
  /* what a form is returned for; {i} is an item on the page */
  var WHY = [
    { en: "item {i} is completed in lower-case letters. Forms are completed in block capitals.", ir: "{i}-punkt kichine tamgalar menen tolturulgan. Formalar choñ basma tamgalar menen tolturulat.", ru: "пункт {i} заполнен строчными буквами. Бланки заполняются печатными заглавными буквами." },
    { en: "the year in item {i} is written with two figures. The year is written in full.", ir: "{i}-punkttagı jıl eki sıfra menen jazılgan. Jıl toluk jazılat.", ru: "год в пункте {i} записан двумя цифрами. Год пишется полностью." },
    { en: "the signature crosses the edge of the box.", ir: "kol kutuchanın cheginen chıgıp ketken.", ru: "подпись выходит за край рамки." },
    { en: "item {i} is left empty. A dash is written in items that do not apply.", ir: "{i}-punkt bosh kalgan. Tiyishtüü emes punkttarga sızıkcha koyulat.", ru: "пункт {i} не заполнен. В неприменимых пунктах ставится прочерк." },
    { en: "the patronymic in item {i} is written in Cyrillic. Names are written in the Iradi Latin alphabet, as in the ID card.", ir: "{i}-punkttagı atasının atı kirillitsa menen jazılgan. Attar ID-kartadagıday irad latın alfavitinde jazılat.", ru: "отчество в пункте {i} написано кириллицей. Имена пишутся ирадской латиницей, как в ID-карте." },
    { en: "the district in item {i} is given by its former name.", ir: "{i}-punkttagı aymak murunku atı menen jazılgan.", ru: "район в пункте {i} указан под прежним названием." },
    { en: "a correction was made with correction fluid. A mistake is crossed out once and the correction signed beside it.", ir: "kata tüzötüüchü suyuktuk menen oñdolgon. Kata bir jolu chiyilip, janına kol koyulat.", ru: "исправление сделано корректором. Ошибка зачёркивается одной чертой, рядом ставится подпись." },
    { en: "the spelling of the name in item {i} differs from the ID card by one letter.", ir: "{i}-punkttagı attın jazılıshı ID-kartadan bir tamga menen ayırmalanat.", ru: "написание фамилии в пункте {i} отличается от ID-карты одной буквой." },
    { en: "pages {p} and {q} are printed on one sheet. Each page is printed on a separate sheet.", ir: "{p}- jana {q}-better bir barakka basılgan. Ar bir bet özüncho barakka basılat.", ru: "страницы {p} и {q} напечатаны на одном листе. Каждая страница печатается на отдельном листе." },
    { en: "the page was completed in green ink. Black or blue ink only.", ir: "bet jashıl siya menen tolturulgan. Kara je kök siya gana.", ru: "страница заполнена зелёными чернилами. Только чёрные или синие." }
  ];

  /* dates (all in UTC, as dates of the Irad calendar) */
  function addDays(d, n) { var x = new Date(d.getTime()); x.setUTCDate(x.getUTCDate() + n); return x; }
  function isW(d) { var g = d.getUTCDay(); return g !== 0 && g !== 6; }
  function addW(d, n) { var x = d; while (n > 0) { x = addDays(x, 1); if (isW(x)) n--; } return x; }
  function onW(d) { var x = d; while (!isW(x)) x = addDays(x, 1); return x; }
  function iso(d) { return d.toISOString().slice(0, 10); }
  function day(s) { return new Date(s + "T00:00:00Z"); }
  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function ri(r, a, b) { return a + Math.floor(r() * (b - a + 1)); }

  /* reference: <form code without dash>-<yymmdd>-<4 figures><check letter> */
  function checkLetter(hash, s) { return CHK.charAt(hash("eapp" + s) % CHK.length); }
  function makeRef(hash, sp, d) {
    var body = sp[1].replace("-", "") + "-" + iso(d).slice(2).replace(/-/g, "") + "-" + String(1000 + Math.floor(Math.random() * 9000));
    return body + checkLetter(hash, body);
  }
  /* returns {ref, sp, d0} or a string: "bad" (not a number) or "none" (no such application) */
  function parse(hash, s, today) {
    var m = /^([A-Z]{1,4})-?(\d{1,2})[^A-Z0-9]*(\d{6})[^A-Z0-9]*(\d{4})[^A-Z0-9]*([A-Z])$/.exec(String(s || "").toUpperCase().trim());
    if (!m) return "bad";
    var sp = byCode(m[1] + m[2]), body = m[1] + m[2] + "-" + m[3] + "-" + m[4];
    if (!sp || checkLetter(hash, body) !== m[5]) return "none";
    var d0 = day("20" + m[3].slice(0, 2) + "-" + m[3].slice(2, 4) + "-" + m[3].slice(4, 6));
    if (isNaN(d0) || iso(d0).replace(/-/g, "").slice(2) !== m[3] || d0 < day(START) || d0 > today || !isW(d0)) return "none";
    return { ref: body + m[5], sp: sp, d0: d0 };
  }

  /* the whole course of an application, worked out from the number; corr is the day the corrected page was handed in */
  function plan(hash, a, corr) {
    var sp = a.sp, r = rng(hash("eappplan" + a.ref)), ev = [], d = a.d0, ag = { a: sp[2] }, termN = sp[3], term = addW(a.d0, termN), ext = false, last = a.d0;
    function add(k, date, v, who) {
      if (!ext && date > term && k !== "ret" && k !== "closed" && k !== "corr" && k !== "gone") {
        var n = ri(r, 2, 4) * 5, at = term < last ? last : term;
        term = addW(term, n); termN += n; ext = true;
        ev.push({ k: "ext", d: at, v: { n: n, d: term }, who: ag });
      }
      ev.push({ k: k, d: date, v: v || {}, who: who }); last = date;
    }
    var num = function () { return String(ri(r, 100, 9999)); };
    add("recv", a.d0, { n: (a.d0.getUTCMonth() + 1) + "/" + ri(r, 140, 2400) }, { i: "egov" });
    d = addW(d, ri(r, 1, 2)); add("fwd", d, { b: ag }, { i: "egov" });
    d = addW(d, ri(r, 0, 2)); add("acc", d, { n: sp[1].split("-")[0] + "-" + num() }, ag);
    if (sp[5] && r() < 0.25) { d = addW(d, ri(r, 1, 2)); add("nopay", d, {}, ag); d = addW(d, ri(r, 3, 5)); add("paid", d, {}, ag); }
    if (r() < 0.35) {
      var pages = PAGES[sp[1]] || 3, p = ri(r, 1, pages), wi = ri(r, 0, WHY.length - 1), q = p < pages ? p + 1 : p - 1;
      d = addW(d, ri(r, 1, 4));
      add("ret", d, { f: sp[1], p: p, w: { why: wi, i: ri(r, 2, 14), p: Math.min(p, q), q: Math.max(p, q) }, due: addDays(d, 30) }, ag);
      var due = addDays(d, 30), c = corr ? day(corr) : null;
      if (c && c < d) c = d;
      if (!c || c > due) { add("closed", onW(addDays(due, 1)), {}, ag); return { ev: ev, term: term, termN: termN, wait: !c ? { p: p, due: due } : null }; }
      c = onW(c); add("corr", c, { p: p }, { i: "egov" }); d = c; term = addW(c, sp[3]); termN = sp[3];
    }
    if (r() < 0.06) { d = addW(d, ri(r, 2, 5)); add(sp[6] === "p" && r() < 0.6 ? "quota" : "dup", d, { n: sp[1].split("-")[0] + "-" + num() }, ag); return { ev: ev, term: term, termN: termN }; }
    sp[4].forEach(function (b) {
      d = addW(d, ri(r, 0, 1)); add("req", d, { b: { i: b } }, ag);
      var w = ri(r, 2, 5);
      if (r() < 0.25) { add("remind", addW(d, w + 2), { b: { i: b } }, ag); w += 2 + ri(r, 2, 5); }
      if (b === "toponymy") { var x = addW(d, w); while (x.getUTCDay() !== 2) x = addDays(x, 1); d = x; } /* the Section's window is open on Tuesdays */
      else d = addW(d, w);
      add("reply", d, { b: { i: b } }, ag);
    });
    d = addW(d, ri(r, 1, 3)); add("prep", d, {}, ag);
    if (r() < 0.3) {
      var back = addW(d, ri(r, 4, 9)), th = addDays(d, 1); while (th.getUTCDay() !== 4) th = addDays(th, 1);
      add("leave", addW(d, 1), { d: back }, ag); d = th < back ? th : back;
    } else d = addW(d, ri(r, 1, 3));
    add("signed", d, {}, ag);
    if (r() < 0.2) { d = addW(d, ri(r, 1, 2)); add("nostamp", d, {}, ag); d = addW(d, ri(r, 4, 8)); }
    else d = addW(d, ri(r, 1, 2));
    var until = addDays(d, 30);
    add("ready", d, { b: ag, w: ri(r, 1, 12), d: until }, ag);
    add("gone", onW(addDays(until, 1)), { b: ag }, ag);
    return { ev: ev, term: term, termN: termN };
  }

  /* the part of the course that has happened by now */
  function upTo(pl, today, hourNow, corr) {
    return pl.ev.filter(function (e) { return e.d < today || (+e.d === +today && (hourNow >= 10 || e.k === "recv" || (e.k === "corr" && corr))); });
  }

  /* kept list */
  function load() { try { var a = JSON.parse(localStorage.getItem("eirad_apps") || "[]"); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function save(a) { try { localStorage.setItem("eirad_apps", JSON.stringify(a.slice(-KEEP))); } catch (e) {} }
  function keep(ref, corr) {
    var a = load().filter(function (x) { return x && x.r !== ref; }), old = load().filter(function (x) { return x && x.r === ref; })[0];
    a.push({ r: ref, c: corr || (old && old.c) || null }); save(a);
  }
  function corrOf(ref) { var x = load().filter(function (x) { return x && x.r === ref; })[0]; return x ? x.c : null; }

  /* the box on a service page */
  function note(id, L, esc) {
    var sp = spec(id); if (!sp) return "";
    return '<div class="formbox apilot"><h4>' + esc(L(T.pilotH)) + "</h4><p>" + esc(L(T.pilotP, { f: sp[1] })) + '</p><p><a class="btn" href="/applications/?s=' + id + '">' + esc(L(T.pilotA)) + "</a></p></div>";
  }

  function page(H) {
    var $ = H.$, esc = H.esc, L = H.L, fmtD = H.fmtD, hash = H.hash, P = H.P, kv = H.kv;
    var today = H.today(), hourNow = H.iradNow().getHours();
    var AG = (window.E_FORMS && window.E_FORMS.agencies) || {};
    function who(o) { return o.i === "egov" ? EGOV : (o.i ? INST[o.i] : AG[o.a]) || { en: "" }; }
    function svcName(id) { var s = (window.E_SERVICES && window.E_SERVICES.list || []).filter(function (x) { return x.id === id; })[0]; return s ? L(s.name) : id; }
    function evText(e) {
      var v = {}, k;
      for (k in e.v) v[k] = e.v[k];
      if (v.b) v.b = L(who(v.b));
      if (v.d instanceof Date) v.d = fmtD(v.d);
      if (v.w && typeof v.w === "object") v.w = L(WHY[v.w.why], { i: v.w.i, p: v.w.p, q: v.w.q });
      return L(E[e.k], v);
    }
    function res(id, html) { var r = $("#" + id); r.innerHTML = html; r.hidden = false; r.scrollIntoView({ block: "nearest" }); }

    document.title = L(T.title) + " | e-Irad";
    var SEP = ' <span class="sep">›</span> ';
    var help = "<h3>" + esc(L(T.helpH)) + "</h3><p>" + esc(L(T.helpP)) + "</p><ul>" + SPEC.map(function (s) { return '<li><a href="/service.html?id=' + s[0] + '">' + esc(svcName(s[0])) + '</a> <span class="fcode">' + s[1] + "</span></li>"; }).join("") + "</ul>" +
      "<h3>" + esc(L(T.helpS)) + "</h3><ul>" + L(T.helpL).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul><p>" + esc(L(T.helpN)) + "</p>";
    $("#app").innerHTML = '<div class="wrap page"><nav class="crumbs" aria-label="breadcrumb"><a href="/">e-Irad</a>' + SEP + '<a href="/citizens.html">' + esc(H.t("secCit")) + "</a>" + SEP + "<span>" + esc(L(T.title)) + "</span></nav>" +
      '<div class="svchead">' + H.icon("doc") + "<div><h1>" + esc(L(T.title)) + "</h1><p>" + esc(L(T.desc)) + '</p><p class="agency"><span>' + esc(H.t("agency")) + ":</span> " + esc(L(T.agency)) + " " + H.badge("limited") + "</p></div></div>" +
      '<div class="svcgrid"><div id="xmain"></div><aside class="help">' + help + "</aside></div></div>";

    function opt(kind) { return SPEC.filter(function (s) { return s[6] === kind; }).map(function (s) { return '<option value="' + s[0] + '">' + esc(svcName(s[0])) + " (" + s[1] + ")</option>"; }).join(""); }
    var box = $("#xmain");
    box.innerHTML = '<div class="xtabs" role="tablist">' + T.tabs.map(function (x, i) { return '<a href="#' + ["submit", "follow", "mine"][i] + '" role="tab" data-tab="' + i + '">' + esc(L(x)) + "</a>"; }).join("") + "</div>" +
      '<div data-pane="0"><form class="flow" id="fas">' + H.field("ass", L(T.svc), '<select id="ass"><optgroup label="' + esc(L(T.cert)) + '">' + opt("c") + '</optgroup><optgroup label="' + esc(L(T.perm)) + '">' + opt("p") + "</optgroup></select>") +
      '<div id="asforms"></div>' + H.chk("ask1", "") + '<div id="ask2w"></div>' + H.chk("ask3", L(T.orig)) + '<button class="btn" type="submit">' + esc(L(T.send)) + '</button></form><div id="asr" class="result" hidden aria-live="polite"></div></div>' +
      '<div data-pane="1" hidden><form class="flow" id="faf">' + H.field("afn", L(T.no), H.inp("afn", L(T.noPh), ' maxlength="24" style="text-transform:uppercase"')) + '<button class="btn" type="submit">' + esc(L(T.check)) + '</button></form><div id="afr" class="result" hidden aria-live="polite"></div></div>' +
      '<div data-pane="2" hidden><h2>' + esc(L(T.mineH)) + '</h2><div id="mine"></div><p class="tiny">' + esc(L(T.mineP, { n: KEEP })) + "</p></div>";

    function tab(i) { H.$$("[data-pane]").forEach(function (p) { p.hidden = p.getAttribute("data-pane") !== String(i); }); H.$$("[data-tab]").forEach(function (a) { a.className = a.getAttribute("data-tab") === String(i) ? "on" : ""; }); if (i === 2) mine(); }
    H.$$("[data-tab]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); tab(+a.getAttribute("data-tab")); history.replaceState(null, "", location.pathname + a.getAttribute("href")); }); });

    function chosen() { $("#ask1").parentNode.lastChild.textContent = " " + L(T.filled, { f: spec($("#ass").value)[1] }); var sp = spec($("#ass").value); $("#ask2w").innerHTML = sp[5] ? H.chk("ask2", L(T.paid)) : ""; var f = (window.E_FORMS.list || []).filter(function (x) { return x.code === sp[1]; })[0]; $("#asforms").innerHTML = f ? '<p class="tiny"><a href="' + esc(f.url) + '">' + esc(L(f.title)) + '</a> <span class="fcode">' + esc(f.code) + " · PDF</span></p>" : ""; }
    var pre = new URLSearchParams(location.search).get("s"); if (spec(pre)) $("#ass").value = pre;
    $("#ass").addEventListener("change", chosen); chosen();

    $("#fas").addEventListener("submit", function (e) {
      e.preventDefault();
      var sp = spec($("#ass").value);
      if (!$("#ask1").checked || !$("#ask3").checked || (sp[5] && !$("#ask2").checked)) { res("asr", P(T.tick, "warn")); return; }
      var d = onW(today), ref = makeRef(hash, sp, d);
      keep(ref);
      res("asr", H.refBox(T.regd, ref, [[L(T.svc), esc(svcName(sp[0]))], [L(T.form), esc(sp[1])], [L(T.body), esc(L(AG[sp[2]]))], [L(T.date), esc(fmtD(d))], [L(T.term), esc(L(T.termV, { n: sp[3], d: fmtD(addW(d, sp[3])) }))]]) +
        (+d !== +today ? P({ en: "Applications submitted on Saturday or Sunday are registered on Monday.", ir: "Ishembi je jekshembi berilgen arızdar düyshömbü kattalat.", ru: "Заявления, поданные в субботу или воскресенье, регистрируются в понедельник." }, "tiny") : "") +
        P(T.keep) + '<p><a class="btn" href="#follow=' + ref + '">' + esc(L(T.follow)) + '</a> <button type="button" class="btn ghost" id="aspr">' + esc(L(T.print)) + "</button></p>");
      $("#aspr").addEventListener("click", function () { window.print(); });
    });

    function show(ref) {
      var a = parse(hash, ref, today);
      if (a === "bad") { res("afr", P(T.noBad, "warn")); return; }
      if (a === "none") { res("afr", P(T.noFound, "warn")); return; }
      $("#afn").value = a.ref;
      var corr = corrOf(a.ref), pl = plan(hash, a, corr), seen = upTo(pl, today, hourNow, corr), cur = seen[seen.length - 1];
      keep(a.ref);
      var st = cur.k, cls = st === "ready" ? "ok" : (st === "ret" || st === "nopay" || st === "closed" || st === "dup" || st === "quota" || st === "remind" || st === "ext" ? "warn" : "");
      var html = kv([[L(T.no), "<b>" + esc(a.ref) + "</b>"], [L(T.svc), esc(svcName(a.sp[0]))], [L(T.form), esc(a.sp[1])], [L(T.body), esc(L(AG[a.sp[2]]))], [L(T.date), esc(fmtD(a.d0))], [L(T.term), esc(L(T.termV, { n: pl.termN, d: fmtD(pl.term) }))]]) +
        "<h4>" + esc(L(T.now)) + ": " + esc(L(S[st])) + "</h4>" + P(evText(cur), cls);
      if (st === "ret" && pl.wait) {
        html += '<div class="formbox"><h4>' + esc(L(T.fixH)) + "</h4><p>" + esc(L(T.fixP, { p: pl.wait.p, f: a.sp[1] })) + '</p><p class="tiny">' + esc(L(T.fixDue, { d: fmtD(pl.wait.due) })) + "</p>" + H.chk("afk", L(T.fixK, { p: pl.wait.p })) + '<p><button type="button" class="btn" id="afb">' + esc(L(T.fixB)) + '</button></p><p id="afe" class="warn" hidden>' + esc(L(T.fixErr)) + "</p></div>";
      }
      html += "<h4>" + esc(L(T.hist)) + '</h4><div class="tw"><table class="tbl"><thead><tr><th>' + esc(L(T.when)) + "</th><th>" + esc(L(T.what)) + "</th><th>" + esc(L(T.who)) + "</th></tr></thead><tbody>" +
        seen.slice().reverse().map(function (e) { return '<tr><td class="num">' + esc(fmtD(e.d)) + "</td><td>" + esc(evText(e)) + "</td><td>" + esc(L(who(e.who))) + "</td></tr>"; }).join("") + "</tbody></table></div>" +
        P(T.asOf, "tiny", { d: fmtD(today) });
      res("afr", html);
      if ($("#afb")) $("#afb").addEventListener("click", function () {
        if (!$("#afk").checked) { $("#afe").hidden = false; return; }
        keep(a.ref, iso(today)); show(a.ref);
      });
    }
    $("#faf").addEventListener("submit", function (e) { e.preventDefault(); if (!H.need("afn")) return; show($("#afn").value); });

    function mine() {
      var a = load();
      if (!a.length) { $("#mine").innerHTML = P(T.mineNone); return; }
      $("#mine").innerHTML = '<div class="tw"><table class="tbl"><thead><tr><th>' + esc(L(T.no)) + "</th><th>" + esc(L(T.svc)) + "</th><th>" + esc(L(T.date)) + "</th><th>" + esc(L(T.now)) + "</th><th></th></tr></thead><tbody>" +
        a.slice().reverse().map(function (x) {
          var p = parse(hash, x.r, today); if (typeof p === "string") return "";
          var seen = upTo(plan(hash, p, x.c), today, hourNow, x.c), cur = seen[seen.length - 1];
          return "<tr><td><b>" + esc(p.ref) + "</b></td><td>" + esc(svcName(p.sp[0])) + '</td><td class="num">' + esc(fmtD(p.d0)) + "</td><td>" + esc(L(S[cur.k])) + '</td><td class="num"><a href="#follow=' + esc(p.ref) + '">' + esc(L(T.open)) + '</a> · <a href="#mine" data-rm="' + esc(p.ref) + '">' + esc(L(T.rm)) + "</a></td></tr>";
        }).join("") + "</tbody></table></div>";
      H.$$("[data-rm]").forEach(function (b) { b.addEventListener("click", function (e) { e.preventDefault(); save(load().filter(function (x) { return x.r !== b.getAttribute("data-rm"); })); mine(); }); });
    }

    function fromHash() {
      var h = location.hash, m = /^#follow=(.+)$/.exec(h);
      if (m) { tab(1); show(decodeURIComponent(m[1])); return; }
      tab({ "#follow": 1, "#mine": 2 }[h] || 0);
    }
    window.addEventListener("hashchange", fromHash); fromHash();
  }

  return { spec: spec, note: note, page: page, _plan: plan, _parse: parse, _upTo: upTo, _makeRef: makeRef, _SPEC: SPEC };
})();
