/* e-Irad service catalogue. Every form runs in the browser only: nothing is sent, nothing is stored except the
   queue tickets a visitor takes (localStorage "eirad_tickets") and the language. Results are worked out from the
   input (deterministic), so the same number always gives the same answer. */
window.E_SERVICES = {
  offices: [
    { id: "tl", code: "TL", base: 1840, rate: 160, name: { en: "Talas City Passport Office, Liberty Boulevard", ir: "Talas shaardık pasport bölümü, Erkindik bulvarı", ru: "Паспортный стол города Таласа, бульвар Свободы" } },
    { id: "nz", code: "NZ", base: 1510, rate: 140, name: { en: "Nurzhan City Passport Office, Azatlık Prospect", ir: "Nurzhan shaardık pasport bölümü, Azattık prospekti", ru: "Паспортный стол города Нуржана, проспект Азатлык" } },
    { id: "ij", code: "IJ", base: 720, rate: 70, name: { en: "Iyık Janyl City Passport Office, Lower Town", ir: "Iyık Janyl shaardık pasport bölümü, Tömönkü shaar", ru: "Паспортный стол Ийык-Джаныла, Нижний город" } },
    { id: "ka", code: "KA", base: 410, rate: 45, name: { en: "Kara-Buura District office, Kyzyl-Adyr", ir: "Kara-Buura aymaktık keñsesi, Kızıl-Adır", ru: "Отдел Кара-Бууринского района, Кызыл-Адыр" } },
    { id: "kb", code: "KB", base: 300, rate: 40, name: { en: "Talas District office, Kara-Bulak", ir: "Talas aymaktık keñsesi, Kara-Bulak", ru: "Отдел Таласского района, Кара-Булак" } },
    { id: "mk", code: "MK", base: 280, rate: 30, name: { en: "Chu District office, Merke", ir: "Chüy aymaktık keñsesi, Merke", ru: "Отдел Чуйского района, Мерке" } },
    { id: "tk", code: "TK", base: 520, rate: 50, name: { en: "Lower Naryn District office, Tash-Kömür", ir: "Tömönkü Narın aymaktık keñsesi, Tash-Kömür", ru: "Отдел Нижненарынского района, Таш-Кумыр" } },
    { id: "bk", code: "BK", base: 460, rate: 35, name: { en: "Lower Naryn District office, Bazar-Korgon branch", ir: "Tömönkü Narın aymaktık keñsesi, Bazar-Korgon filialı", ru: "Отдел Нижненарынского района, филиал в Базар-Коргоне" } },
    { id: "to", code: "TO", base: 160, rate: 20, name: { en: "Toktogul District office, Toktogul", ir: "Toktogul aymaktık keñsesi, Toktogul", ru: "Отдел Токтогульского района, Токтогул" } },
    { id: "sb", code: "SB", base: 120, rate: 18, name: { en: "Sary-Bulak District office, Sary-Bulak", ir: "Sarı-Bulak aymaktık keñsesi, Sarı-Bulak", ru: "Отдел Сары-Булакского района, Сары-Булак" } }
  ],
  cats: ["people", "biz", "pay", "check", "other"],
  /* sec: the section(s) of the portal a service belongs to, first one is its home: b = For businesses, c = For citizens */
  list: [
    {
      id: "passport", cat: "people", sec: "c", status: "limited", icon: "id",
      name: { en: "Passport and ID card queue", ir: "Pasport jana ID-karta kezegi", ru: "Очередь на паспорт и ID-карту" },
      desc: { en: "Take a number for your passport office and see your place in the queue.", ir: "Pasport bölümünö kezek nomerin alıp, kezektegi ordunuzdu köruñüz.", ru: "Возьмите номер в паспортный стол и узнайте своё место в очереди." },
      agency: { en: "Passport and Residence Service, Ministry of Internal Security", ir: "Pasport jana jashoo jayı kızmatı, Ichki koopsuzduk ministrligi", ru: "Служба паспортов и регистрации, Министерство внутренней безопасности" },
      keywords: "passport id card pasport паспорт удостоверение residence kuböölük"
    },
    {
      id: "event", cat: "biz", sec: "bc", status: "limited", icon: "ticket",
      name: { en: "Event and concert permit", ir: "Ish-chara jana konsert uruksatı", ru: "Разрешение на мероприятие и концерт" },
      desc: { en: "Prepare an application for a municipal permit for a concert, festival, parade or gathering.", ir: "Konsert, festival, parad je chogulush üchün shaardık uruksatka arız dayardañız.", ru: "Подготовьте заявку на муниципальное разрешение на концерт, фестиваль, шествие или собрание." },
      agency: { en: "City halls of Talas, Nurzhan and Iyık Janyl; Department of Public Information", ir: "Talas, Nurzhan jana Iyık Janyl meriyaları; Kogomduk maalımat departamenti", ru: "Мэрии Таласа, Нуржана и Ийык-Джаныла; Департамент общественной информации" },
      keywords: "permit concert event festival uruksat konsert разрешение концерт мероприятие"
    },
    {
      id: "business", cat: "biz", sec: "b", status: "limited", icon: "shop",
      name: { en: "Small business registration", ir: "Chakan ishkanany kattoo", ru: "Регистрация малого предприятия" },
      desc: { en: "Check a business name and prepare the registration of a sole trader, company, farm or cooperative.", ir: "Ishkananın atın tekshirip, jeke ishkerdi, kompaniyanı, dıykan charbasın je kooperativdi kattoogo dayardanıñız.", ru: "Проверьте название и подготовьте регистрацию ИП, компании, фермы или кооператива." },
      agency: { en: "Register of Firms, Ministry of Economy, through the district offices", ir: "Firmalar reestri, Ekonomika ministrligi, aymaktık keñseler arkıluu", ru: "Реестр фирм, Министерство экономики, через районные отделы" },
      keywords: "business company register firm ishkana kattoo бизнес регистрация фирма ИП"
    },
    {
      id: "census", cat: "biz", sec: "bc", status: "soon", icon: "chart",
      name: { en: "Census of business entities 2026", ir: "2026-jılkı ishkanalardın sanagı", ru: "Перепись хозяйствующих субъектов 2026" },
      desc: { en: "How to answer the census questionnaire before 30 November.", ir: "Sanak suroo-joop kagazına 30-noyabrga cheyin kantip joop berüü kerek.", ru: "Как ответить на вопросы переписи до 30 ноября." },
      agency: { en: "Territorial Statistics Office", ir: "Aymaktık statistika keñsesi", ru: "Территориальное статистическое управление" },
      keywords: "census sanak перепись statistics"
    },
    {
      id: "electricity", cat: "pay", sec: "c", status: "limited", icon: "bolt",
      name: { en: "Electricity bill", ir: "Elektr energiyası üchün esep", ru: "Счёт за электроэнергию" },
      desc: { en: "See your Iradenergo bill and meter readings by personal account number.", ir: "Jeke esep nomeri boyuncha Iradenergo esebiñizdi jana hisoochtun körsötküchün köruñüz.", ru: "Счёт «Ирадэнерго» и показания счётчика по номеру лицевого счёта." },
      agency: { en: "Iradenergo: Talas Electric Networks and Nurzhan Electric Networks", ir: "Iradenergo: Talas jana Nurzhan elektr tarmaktarı", ru: "«Ирадэнерго»: Таласские и Нуржанские электросети" },
      keywords: "electricity power iradenergo bill elektr jarık электричество свет счёт"
    },
    {
      id: "water", cat: "pay", sec: "c", status: "limited", icon: "drop",
      name: { en: "Water bill", ir: "Suu üchün esep", ru: "Счёт за воду" },
      desc: { en: "Check your water and sewerage charges in Talas, Nurzhan and Iyık Janyl.", ir: "Talas, Nurzhan jana Iyık Janyldagı suu jana kanalizatsiya tölömüñüzdü tekshiriñiz.", ru: "Начисления за воду и канализацию в Таласе, Нуржане и Ийык-Джаныле." },
      agency: { en: "City water enterprises", ir: "Shaardık suu ishkanaları", ru: "Городские водоканалы" },
      keywords: "water sewer suu вода водоканал"
    },
    {
      id: "fines", cat: "pay", sec: "c", status: "limited", icon: "car",
      name: { en: "Traffic fines", ir: "Jol kıymıl ayıptarı", ru: "Штрафы ГИБДД" },
      desc: { en: "Look up unpaid traffic fines by registration plate.", ir: "Mamlekettik nomer boyuncha tölönbögön jol ayıptarın tabıñız.", ru: "Неоплаченные штрафы по госномеру." },
      agency: { en: "Highway Patrol Corps, Republican Gendarmerie; city police", ir: "Avtojol patrul korpusu, Respublikalık jandarmeriya; shaar politsiyası", ru: "Корпус дорожного патруля Республиканской жандармерии; городская полиция" },
      keywords: "fine traffic speeding ayıp штраф"
    },
    {
      id: "parcel", cat: "check", sec: "c", status: "ok", icon: "box",
      name: { en: "Parcel and letter tracking", ir: "Posılka jana kat izdöö", ru: "Отслеживание посылок и писем" },
      desc: { en: "Follow a registered item through Irad Pochtasy.", ir: "Kattalgan jönötmönü Irad Pochtası arkıluu baykañız.", ru: "Отслеживание регистрируемых отправлений «Ирадпочты»." },
      agency: { en: "Irad Pochtasy, State Postal Enterprise", ir: "Irad Pochtası, mamlekettik pochta ishkanası", ru: "«Ирадпочта», государственное почтовое предприятие" },
      keywords: "parcel post tracking pochta posılka посылка почта"
    },
    {
      id: "motor", cat: "check", sec: "c", status: "ok", icon: "shield",
      name: { en: "Motor policy check", ir: "Avtopolis tekshirüü", ru: "Проверка автополиса" },
      desc: { en: "Check whether a vehicle has a valid compulsory third-party policy.", ir: "Unaanın mildettüü kamsızdandıruu polisi jaraktuu ekenin tekshiriñiz.", ru: "Проверка действующего полиса обязательного страхования ответственности." },
      agency: { en: "Iradstrakh, State Insurance Company of Irad", ir: "Iradstrakh, Irad mamlekettik kamsızdandıruu kompaniyası", ru: "«Ирадстрах», Государственная страховая компания Ирада" },
      keywords: "insurance policy motor iradstrakh polis страховка осаго"
    },
    {
      id: "crossing", cat: "other", sec: "c", status: "off", icon: "route",
      name: { en: "Crossing the Qara-Chik line", ir: "Kara-Chik liniyasınan ötüü", ru: "Пересечение линии Кара-Чик" },
      desc: { en: "Rules for visitors from the tribal regions and for travel across the line.", ir: "Tooluu aymaktardan kelgender jana liniya arkıluu jol jürüü erejeleri.", ru: "Правила для приезжающих из племенных районов и для поездок через линию." },
      agency: { en: "Republican Gendarmerie", ir: "Respublikalık jandarmeriya", ru: "Республиканская жандармерия" },
      keywords: "line crossing checkpoint permit qara-chik kara-chik liniya линия пропуск"
    },
    {
      id: "civil", cat: "people", sec: "c", status: "soon", icon: "doc",
      name: { en: "Birth, marriage and death certificates", ir: "Tuuluu, nike jana ölüm kübölüktörü", ru: "Свидетельства о рождении, браке и смерти" },
      desc: { en: "Copies of civil registration certificates.", ir: "Jarandık abal aktılarının kübölüktörünün köchürmölörü.", ru: "Копии свидетельств о регистрации актов гражданского состояния." },
      agency: { en: "District civil registry offices", ir: "Aymaktık JAAK bölümdörü", ru: "Районные отделы ЗАГС" },
      keywords: "birth marriage certificate civil registry nike загс свидетельство"
    },
    {
      id: "address", cat: "people", sec: "c", status: "limited", icon: "home",
      name: { en: "Address registration", ir: "Jashoo jayı boyuncha kattoo", ru: "Регистрация по месту жительства" },
      desc: { en: "Notify a change of residence within ten days of moving.", ir: "Köchköndön kiyin on kündün ichinde jashoo jayın özgörtköönüzdü kabarlañız.", ru: "Уведомите о перемене места жительства в течение десяти дней после переезда." },
      agency: { en: "Passport and Residence Service, Ministry of Internal Security", ir: "Pasport jana jashoo jayı kızmatı, Ichki koopsuzduk ministrligi", ru: "Служба паспортов и регистрации, Министерство внутренней безопасности" },
      keywords: "address residence registration moving propiska darek kattoo köchüü адрес прописка регистрация переезд"
    },
    {
      id: "lostid", cat: "people", sec: "c", status: "limited", icon: "id",
      name: { en: "Replace a lost or damaged ID card", ir: "Jogolgon je buzulgan ID-kartanı almashtıruu", ru: "Замена утерянной или повреждённой ID-карты" },
      desc: { en: "What to do, in what order, when your ID card is lost, stolen or damaged.", ir: "ID-kartañız jogolso, uurdalsa je buzulsa emne kıluu kerek jana kaysı tartipte.", ru: "Что и в каком порядке делать, если ID-карта утеряна, украдена или повреждена." },
      agency: { en: "Passport and Residence Service, Ministry of Internal Security", ir: "Pasport jana jashoo jayı kızmatı, Ichki koopsuzduk ministrligi", ru: "Служба паспортов и регистрации, Министерство внутренней безопасности" },
      keywords: "lost stolen damaged id card identity replace jogolgon uurdalgan karta утеря кража удостоверение замена"
    },
    {
      id: "licence", cat: "people", sec: "c", status: "limited", icon: "car",
      name: { en: "Exchange a foreign driving licence", ir: "Chet eldik aydoochuluk kübölügün almashtıruu", ru: "Обмен иностранного водительского удостоверения" },
      desc: { en: "Whether your licence is exchanged with or without examination, and what to bring.", ir: "Kübölügüñüz sınak menen je sınaksız almashtırılabı jana emne ala kelüü kerek.", ru: "Обменивается ли удостоверение с экзаменом или без и что принести." },
      agency: { en: "Highway Patrol Corps, Republican Gendarmerie", ir: "Avtojol patrul korpusu, Respublikalık jandarmeriya", ru: "Корпус дорожного патруля, Республиканская жандармерия" },
      keywords: "driving licence license exchange foreign aydoochuluk prava права водительское обмен"
    },
    {
      id: "namechange", cat: "people", sec: "c", status: "limited", icon: "doc",
      name: { en: "Change of name", ir: "Attı özgörtüü", ru: "Перемена имени" },
      desc: { en: "Change a surname, first name or patronymic, and the list of everything to change afterwards.", ir: "Famılıyanı, attı je atasının atın özgörtüü jana andan kiyin özgörtülüüchü bardık nerselerdin tizmesi.", ru: "Перемена фамилии, имени или отчества и список всего, что нужно поменять потом." },
      agency: { en: "District civil registry offices", ir: "Aymaktık JAAK bölümdörü", ru: "Районные отделы ЗАГС" },
      keywords: "name change surname uulu kyzy famılıya at фамилия имя перемена загс"
    },
    {
      id: "conduct", cat: "people", sec: "c", status: "limited", icon: "shield",
      name: { en: "Certificate of good conduct", ir: "Sottolbogonduk tuuraluu maalımkat", ru: "Справка о несудимости" },
      desc: { en: "Request a certificate that records show no conviction, for work, study or a visa.", ir: "Jumush, okuu je viza üchün sottoluu jok ekeni tuuraluu maalımkat surañız.", ru: "Запрос справки об отсутствии судимости для работы, учёбы или визы." },
      agency: { en: "Ministry of Internal Security, Records Department", ir: "Ichki koopsuzduk ministrligi, Esepke aluu departamenti", ru: "Министерство внутренней безопасности, Учётный департамент" },
      keywords: "good conduct criminal record police certificate sottolbogonduk справка несудимость"
    },
    {
      id: "pension", cat: "people", sec: "c", status: "limited", icon: "coin",
      name: { en: "Apply for an old-age pension", ir: "Karılık pensiyasına arız berüü", ru: "Назначение пенсии по возрасту" },
      desc: { en: "Check when you can apply, an indicative amount and the documents. Pensions are paid at Irad Pochtasy counters from the 10th.", ir: "Kachan arız berüügö bolorun, boljoldoo summanı jana dokumentterdi tekshiriñiz. Pensiyalar aydın 10-kününön Irad Pochtasının kassalarında tölönöt.", ru: "Когда подавать, ориентировочная сумма и документы. Пенсии выплачиваются в окошках «Ирадпочты» с 10-го числа." },
      agency: { en: "Social Fund of the ISEZ; payments through Irad Pochtasy", ir: "IAEZdin Sotsialdık fondu; tölömdör Irad Pochtası arkıluu", ru: "Социальный фонд ОЭЗИ; выплаты через «Ирадпочту»" },
      keywords: "pension old age retirement social fund pensiya пенсия социальный фонд"
    },
    {
      id: "gas", cat: "pay", sec: "c", status: "limited", icon: "flame",
      name: { en: "Household gas bill", ir: "Turmushtuk gaz üchün esep", ru: "Счёт за газ" },
      desc: { en: "See your gas bill and meter readings in Talas and Nurzhan by personal account number.", ir: "Talas jana Nurzhandagı gaz esebiñizdi jana hisoochtun körsötküchün jeke esep nomeri boyuncha köruñüz.", ru: "Счёт за газ и показания счётчика в Таласе и Нуржане по номеру лицевого счёта." },
      agency: { en: "City gas services of Talas and Nurzhan", ir: "Talas jana Nurzhan shaardık gaz kızmattarı", ru: "Городские газовые службы Таласа и Нуржана" },
      keywords: "gas bill meter gaz esep газ счёт"
    },
    {
      id: "heating", cat: "pay", sec: "c", status: "maint", icon: "heat",
      name: { en: "District heating bill", ir: "Shaardık jılytuu üchün esep", ru: "Счёт за отопление" },
      desc: { en: "Heating and hot water charges of the Talas and Nurzhan heating enterprises.", ir: "Talas jana Nurzhan jılytuu ishkanalarının jılytuu jana ısık suu tölömdörü.", ru: "Начисления Таласского и Нуржанского теплопредприятий за отопление и горячую воду." },
      agency: { en: "Talas Heating Enterprise and Nurzhan Heating Enterprise", ir: "Talas jana Nurzhan jılytuu ishkanaları", ru: "Таласское и Нуржанское теплопредприятия" },
      keywords: "heating hot water radiator jılytuu ısık suu отопление горячая вода теплосеть"
    },
    {
      id: "proptax", cat: "pay", sec: "c", status: "limited", icon: "home",
      name: { en: "Property tax for individuals", ir: "Jeke adamdardın mülk salıgı", ru: "Налог на имущество физических лиц" },
      desc: { en: "Calculate the tax on a flat, house, land plot, garage or yurt.", ir: "Kvartiraga, üygö, jer tilkesine, garajga je boz üygö salıktı esepteñiz.", ru: "Расчёт налога на квартиру, дом, участок, гараж или юрту." },
      agency: { en: "State Tax Service, Ministry of Economy", ir: "Mamlekettik salık kızmatı, Ekonomika ministrligi", ru: "Государственная налоговая служба, Министерство экономики" },
      keywords: "property tax house flat land yurt mülk salık налог имущество юрта"
    },
    {
      id: "roadcharge", cat: "pay", sec: "c", status: "limited", icon: "car",
      name: { en: "Annual road-use charge", ir: "Jıldık jol paydalanuu tölömü", ru: "Ежегодный дорожный сбор" },
      desc: { en: "Check whether this year's charge for a vehicle has been paid.", ir: "Unaa üchün bıylkı tölöm tölöngönün tekshiriñiz.", ru: "Проверьте, оплачен ли дорожный сбор за этот год." },
      agency: { en: "Department of Infrastructure and Communications", ir: "Infrastruktura jana baylanısh departamenti", ru: "Департамент инфраструктуры и связи" },
      keywords: "road charge vehicle tax sticker jol tölöm дорожный сбор наклейка"
    },
    {
      id: "duty", cat: "pay", sec: "cb", status: "ok", icon: "calc",
      name: { en: "State duty calculator", ir: "Mamlekettik alım kalkulyatoru", ru: "Калькулятор госпошлины" },
      desc: { en: "Duties for passports, certificates, registrations and licences, with a payment order to print.", ir: "Pasporttor, kübölüktör, kattoo jana litsenziyalar üchün alımdar, basıla turgan tölöm tapshırması menen.", ru: "Пошлины за паспорта, свидетельства, регистрацию и лицензии, с платёжным поручением для печати." },
      agency: { en: "State Tax Service, Ministry of Economy; payment orders approved by the Bank of Irad", ir: "Mamlekettik salık kızmatı, Ekonomika ministrligi; Irad Bankı bekitken tölöm tapshırmaları", ru: "Государственная налоговая служба, Министерство экономики; платёжные поручения утверждены Банком Ирада" },
      keywords: "state duty fee payment order calculator alım tölöm tapshırması госпошлина платёжное поручение"
    },
    {
      id: "kindergarten", cat: "pay", sec: "c", status: "limited", icon: "blocks",
      name: { en: "Kindergarten fees", ir: "Baldar bakchasının akısı", ru: "Плата за детский сад" },
      desc: { en: "See the monthly parents' fee and meals by the child's personal account.", ir: "Balanın jeke esebi boyuncha ata-enelerdin aylık tölömün jana tamak akısın köruñüz.", ru: "Ежемесячная родительская плата и питание по лицевому счёту ребёнка." },
      agency: { en: "Education departments of the city halls of Talas, Nurzhan and Iyık Janyl", ir: "Talas, Nurzhan jana Iyık Janyl meriyalarının bilim berüü bölümdörü", ru: "Отделы образования мэрий Таласа, Нуржана и Ийык-Джаныла" },
      keywords: "kindergarten nursery fee bakcha детский сад плата"
    },
    {
      id: "firmcheck", cat: "check", sec: "bc", status: "ok", icon: "search",
      name: { en: "Is this firm registered?", ir: "Bul firma kattalganbı?", ru: "Зарегистрирована ли фирма?" },
      desc: { en: "Search the Register of Firms by name or registration number.", ir: "Firmalar reestrinen at je kattoo nomeri boyuncha izdeñiz.", ru: "Поиск в Реестре фирм по названию или регистрационному номеру." },
      agency: { en: "Register of Firms, Ministry of Economy", ir: "Firmalar reestri, Ekonomika ministrligi", ru: "Реестр фирм, Министерство экономики" },
      keywords: "firm company register check lookup firma reestr фирма реестр проверка"
    },
    {
      id: "vehicle", cat: "check", sec: "c", status: "ok", icon: "car",
      name: { en: "Vehicle registration check", ir: "Unaanın kattoosun tekshirüü", ru: "Проверка регистрации ТС" },
      desc: { en: "Make, year, inspection, road charge, policy and restrictions by registration plate.", ir: "Mamlekettik nomer boyuncha markası, jılı, karoo, jol tölömü, polis jana cheklöölör.", ru: "Марка, год, техосмотр, дорожный сбор, полис и ограничения по госномеру." },
      agency: { en: "Highway Patrol Corps, Republican Gendarmerie (vehicle register)", ir: "Avtojol patrul korpusu, Respublikalık jandarmeriya (unaa reestri)", ru: "Корпус дорожного патруля, Республиканская жандармерия (реестр ТС)" },
      keywords: "vehicle car plate registration check unaa nomer машина госномер проверка"
    },
    {
      id: "permitcheck", cat: "check", sec: "bc", status: "ok", icon: "stamp",
      name: { en: "Check a permit or licence", ir: "Uruksattı je litsenziyanı tekshirüü", ru: "Проверка разрешения или лицензии" },
      desc: { en: "Event permits, taxi and alcohol licences and market trading places, by number.", ir: "Ish-chara uruksattarı, taksi jana alkogol litsenziyaları jana bazardagı sooda orundarı, nomer boyuncha.", ru: "Разрешения на мероприятия, лицензии такси и на алкоголь, торговые места на рынках, по номеру." },
      agency: { en: "City halls; Department of Infrastructure and Communications; Licensing Division, Ministry of Economy", ir: "Meriyalar; Infrastruktura jana baylanısh departamenti; Ekonomika ministrliginin Litsenziyaloo bölümü", ru: "Мэрии; Департамент инфраструктуры и связи; Отдел лицензирования Министерства экономики" },
      keywords: "permit licence license check taxi alcohol market uruksat litsenziya разрешение лицензия проверка"
    },
    {
      id: "court", cat: "check", sec: "c", status: "ok", icon: "scales",
      name: { en: "Status of a case", ir: "Ishtin abalı", ru: "Статус дела" },
      desc: { en: "Look up a case on the Supreme Court's register of pending cases.", ir: "Jogorku sottun karaluuchu ishter reestrinen ishti tabıñız.", ru: "Найдите дело в реестре рассматриваемых дел Верховного суда." },
      agency: { en: "Supreme Court of Irad, Registry", ir: "Irad Jogorku sotu, registratura", ru: "Верховный суд Ирада, канцелярия" },
      keywords: "court case supreme hearing register sot ish суд дело верховный"
    },
    {
      id: "certcheck", cat: "check", sec: "bc", status: "limited", icon: "stamp",
      name: { en: "Is this product certified?", ir: "Bul tovar sertifikattalganbı?", ru: "Сертифицирован ли товар?" },
      desc: { en: "Check an Iradstandart certificate of conformity by number.", ir: "Iradstandarttın shaykeshtik sertifikatın nomeri boyuncha tekshiriñiz.", ru: "Проверка сертификата соответствия «Ирадстандарта» по номеру." },
      agency: { en: "Iradstandart, State Agency for Standards, Metrology and Certification", ir: "Iradstandart, Standartizatsiya, metrologiya jana sertifikattoo mamlekettik agenttigi", ru: "«Ирадстандарт», Государственное агентство по стандартизации, метрологии и сертификации" },
      keywords: "certificate conformity product standard iradstandart IST sertifikat сертификат стандарт"
    },
    {
      id: "exams", cat: "check", sec: "c", status: "ok", icon: "cap", url: "/test-results/",
      name: { en: "National Graduation Test results", ir: "Uluttuk sınaktın jıyıntıktarı", ru: "Результаты Национального выпускного теста" },
      desc: { en: "This year's results by candidate number, and results by school.", ir: "Bıylkı jıyıntıktar talapkerdin nomeri boyuncha jana mektepter boyuncha.", ru: "Результаты этого года по номеру участника и по школам." },
      agency: { en: "Education Quality Agency, Office of the Governor", ir: "Bilim sapatı agenttigi, Gubernatordun apparatı", ru: "Агентство качества образования, Аппарат губернатора" },
      keywords: "exam results school testing graduation test uluttuk sınak mektep экзамен результаты тест школа"
    },
    {
      id: "vote", cat: "check", sec: "c", status: "limited", icon: "people", url: "/vote/",
      name: { en: "Am I on the voter register?", ir: "Men shayloochulardın tizmesindebi?", ru: "Есть ли я в списке избирателей?" },
      desc: { en: "Your entry and precinct for the elections of 2 November 2027.", ir: "2027-jıldın 2-noyabrındagı shayloolor üchün jazuuñuz jana uchastkañız.", ru: "Ваша запись и участок на выборах 2 ноября 2027 года." },
      agency: { en: "Territorial Election Commission", ir: "Aymaktık shayloo komissiyası", ru: "Территориальная избирательная комиссия" },
      keywords: "vote voter register election precinct polling shayloo dobush tizme выборы избиратель список участок"
    },
    {
      id: "stall", cat: "biz", sec: "bc", status: "limited", icon: "shop",
      name: { en: "Trading place at a municipal market", ir: "Shaardık bazardagı sooda ordu", ru: "Торговое место на муниципальном рынке" },
      desc: { en: "Day places, monthly and annual places and the waiting list.", ir: "Bir kündük, aylık jana jıldık orundar jana kezek tizmesi.", ru: "Места на день, на месяц и на год и лист ожидания." },
      agency: { en: "City halls: market administrations", ir: "Meriyalar: bazar administratsiyaları", ru: "Мэрии: администрации рынков" },
      keywords: "market stall bazaar trading place bazar sooda ordu рынок базар торговое место"
    },
    {
      id: "building", cat: "biz", sec: "bc", status: "limited", icon: "crane",
      name: { en: "Building permit pre-application", ir: "Kurulush uruksatına aldın ala arız", ru: "Предварительная заявка на разрешение на строительство" },
      desc: { en: "The approvals you need before the permit, for a house, an extension, a second storey or a fence.", ir: "Üy, kosumcha, ekinchi kabat je tosmo üchün uruksatka cheyin kerektüü makuldashuular.", ru: "Согласования до получения разрешения: дом, пристройка, второй этаж или забор." },
      agency: { en: "Architecture and Planning Department, City Hall", ir: "Meriyanın arkhitektura jana shaar kurulushu bölümü", ru: "Управление архитектуры и градостроительства мэрии" },
      keywords: "building permit construction storey extension fence kurulush uruksat строительство разрешение этаж"
    },
    {
      id: "taxi", cat: "biz", sec: "bc", status: "limited", icon: "car",
      name: { en: "Passenger taxi licence", ir: "Jürgünchü taksi litsenziyası", ru: "Лицензия на пассажирское такси" },
      desc: { en: "Vehicle and driver requirements and the city quotas.", ir: "Unaaga jana aydoochuga talaptar jana shaardık kvotalar.", ru: "Требования к автомобилю и водителю и городские квоты." },
      agency: { en: "Department of Infrastructure and Communications", ir: "Infrastruktura jana baylanısh departamenti", ru: "Департамент инфраструктуры и связи" },
      keywords: "taxi licence license cab taksi litsenziya такси лицензия"
    },
    {
      id: "alcohol", cat: "biz", sec: "b", status: "limited", icon: "bottle",
      name: { en: "Licence to sell alcoholic beverages", ir: "Alkogoldük ichimdikterdi satuu litsenziyası", ru: "Лицензия на продажу алкогольной продукции" },
      desc: { en: "Check whether premises can be licensed and prepare the application.", ir: "Jaydı litsenziyaloogo bolorun tekshirip, arız dayardañız.", ru: "Проверьте, можно ли лицензировать помещение, и подготовьте заявление." },
      agency: { en: "Licensing Division, Ministry of Economy", ir: "Litsenziyaloo bölümü, Ekonomika ministrligi", ru: "Отдел лицензирования, Министерство экономики" },
      keywords: "alcohol licence license liquor beer vodka alkogol litsenziya алкоголь лицензия"
    },
    {
      id: "sign", cat: "biz", sec: "b", status: "limited", icon: "sign",
      name: { en: "Outdoor sign permit", ir: "Tıshkı tabelaga uruksat", ru: "Разрешение на наружную вывеску" },
      desc: { en: "Permit for a shop sign, with a check of its spelling in Iradi for the Toponymic Section of the State Archives.", ir: "Dükön tabelasına uruksat, Mamlekettik arkhivdin Toponimika bölümü üchün irad tilinde jazılıshın tekshirüü menen.", ru: "Разрешение на вывеску с проверкой написания на ирадском языке для Топонимического отдела Государственного архива." },
      agency: { en: "City halls; Toponymic Section of the State Archives", ir: "Meriyalar; Mamlekettik arkhivdin Toponimika bölümü", ru: "Мэрии; Топонимический отдел Государственного архива" },
      keywords: "sign signboard outdoor advertising spelling tabela jarnama вывеска реклама"
    },
    {
      id: "trader", cat: "biz", sec: "b", status: "limited", icon: "doc",
      name: { en: "Registration as a foreign trade participant", ir: "Tashkı sooda katıshuuchusu katarı kattoo", ru: "Регистрация участника внешней торговли" },
      desc: { en: "Register with the Irad Foreign Trade Escrow Authority before your first import or export contract.", ir: "Birinchi import je eksport kelishimiñizge cheyin Irad tashkı sooda eskrou organında kattalıñız.", ru: "Зарегистрируйтесь в Ирадском органе внешнеторгового эскроу до первого импортного или экспортного контракта." },
      agency: { en: "Irad Foreign Trade Escrow Authority", ir: "Irad tashkı sooda eskrou organı", ru: "Ирадский орган внешнеторгового эскроу" },
      keywords: "foreign trade escrow import export registration eskrou tashkı sooda эскроу внешняя торговля импорт экспорт"
    },
    {
      id: "hunting", cat: "other", sec: "c", status: "limited", icon: "fish",
      name: { en: "Hunting and fishing licence", ir: "Añchılık jana balık uuloo litsenziyası", ru: "Лицензия на охоту и рыболовство" },
      desc: { en: "Seasons, fees and rules for fishing and for small game, waterfowl and wild boar.", ir: "Balık uuloo, mayda añ, suu kushtarı jana kaban üchün mezgilder, akılar jana erejeler.", ru: "Сезоны, сборы и правила для рыбалки, мелкой и водоплавающей дичи и кабана." },
      agency: { en: "Talas Basin Agricultural Directorate, Hunting and Fisheries Section", ir: "Talas basseyninin aylı charba direktsiyası, Añchılık jana balık charba bölümü", ru: "Таласское бассейновое управление сельского хозяйства, отдел охоты и рыболовства" },
      keywords: "hunting fishing licence license añchılık balık охота рыбалка лицензия"
    },
    {
      id: "gathering", cat: "other", sec: "c", status: "limited", icon: "people",
      name: { en: "Notification of a public gathering", ir: "Kogomduk chogulush tuuraluu kabarlama", ru: "Уведомление о публичном собрании" },
      desc: { en: "Ten days' notice, designated places and the organiser's responsibilities.", ir: "On kün murun kabarloo, belgilengen jerler jana uyushturuuchunun mildetteri.", ru: "Уведомление за десять дней, отведённые места и обязанности организатора." },
      agency: { en: "City halls of Talas, Nurzhan and Iyık Janyl", ir: "Talas, Nurzhan jana Iyık Janyl meriyaları", ru: "Мэрии Таласа, Нуржана и Ийык-Джаныла" },
      keywords: "gathering meeting assembly notification chogulush kabarlama собрание митинг уведомление"
    },
    {
      id: "feastpass", cat: "other", sec: "c", status: "soon", icon: "ticket",
      name: { en: "Vehicle pass to Cathedral Hill for the Feast of St. Janyl", ir: "Janyl Mayramına Chirköö döbösünö unaa ötkörmösü", ru: "Пропуск на Соборный холм на праздник Святой Джаныл" },
      desc: { en: "Passes for 24 August, issued from 1 August, with quotas by category.", ir: "24-avgustka ötkörmölör, 1-avgusttan tartip berilet, kategoriyalar boyuncha kvotalar menen.", ru: "Пропуска на 24 августа выдаются с 1 августа, с квотами по категориям." },
      agency: { en: "City Hall of Iyık Janyl; city police", ir: "Iyık Janyl meriyası; shaar politsiyası", ru: "Мэрия Ийык-Джаныла; городская полиция" },
      keywords: "feast janyl cathedral hill pass pilgrimage iyık janyl mayram ötkörmö праздник джаныл собор пропуск паломничество"
    },
    {
      id: "archive", cat: "other", sec: "c", status: "limited", icon: "archive",
      name: { en: "Copies of archival documents", ir: "Arkhivdik dokumentterdin köchürmölörü", ru: "Копии архивных документов" },
      desc: { en: "Request copies from the State Archives by post: earnings for a pension, military records, family history.", ir: "Mamlekettik arkhivden köchürmölördü pochta arkıluu surañız: pensiya üchün emgek akı, askerdik dokumentter, uruk tarıkhı.", ru: "Запрос копий в Государственном архиве по почте: заработок для пенсии, военные документы, история семьи." },
      agency: { en: "State Archives of Irad", ir: "Irad mamlekettik arkhivi", ru: "Государственный архив Ирада" },
      keywords: "archive archives copies records genealogy sanjyra arkhiv köchürmö архив копии справка"
    },
    {
      id: "appeal", cat: "other", sec: "c", status: "ok", icon: "mail",
      name: { en: "Written appeal to a state body", ir: "Mamlekettik organga jazuu jüzündögü kayrıluu", ru: "Письменное обращение в государственный орган" },
      desc: { en: "Where to send an appeal, a request or a complaint, and when to expect an answer.", ir: "Kayrıluunu, suroonu je dattanuunu kayda jönötüü jana jooptu kachan kütüü kerek.", ru: "Куда направить обращение, заявление или жалобу и когда ждать ответа." },
      agency: { en: "Office of the Governor, Letters and Appeals Section", ir: "Gubernator keñsesi, Kattar jana kayrıluular bölümü", ru: "Канцелярия Губернатора, отдел писем и обращений" },
      keywords: "appeal letter complaint petition governor kayrıluu daттanuu обращение жалоба письмо"
    },
    {
      id: "applications", cat: "people", sec: "c", status: "limited", icon: "doc", url: "/applications/",
      name: { en: "Applications online", ir: "Onlayn arızdar", ru: "Заявления онлайн" },
      desc: { en: "Submit an application for one of fifteen certificates, licences and permits, and follow it until it is ready to collect.", ir: "On besh maalımkat, kuböölük je uruksattın birine arız berip, anı dayar bolgucha karap turuñuz.", ru: "Подайте заявление на одну из пятнадцати справок, лицензий и разрешений и следите за ним до выдачи." },
      agency: { en: "e-Government Service Centre, with the receiving bodies", ir: "e-Ökmöt kızmat borboru, kabıl aluuchu organdar menen", ru: "Центр услуг электронного правительства совместно с принимающими органами" },
      keywords: "application apply online submit track follow status reference pilot arız arızdar заявление подать статус номер"
    },
    {
      id: "reception", cat: "other", sec: "c", status: "ok", icon: "mail", url: "/appeals/",
      name: { en: "Online reception", ir: "Onlayn kabıl aluu", ru: "Интернет-приёмная" },
      desc: { en: "Write to the Office of the Governor or a ministry and check what has happened to your appeal.", ir: "Gubernatordun apparatına je ministrlikke jazıp, kayrıluuñuzdun abalın tekshiriñiz.", ru: "Напишите в Аппарат губернатора или министерство и проверьте, что с вашим обращением." },
      agency: { en: "Public Reception of the Office of the Governor", ir: "Gubernatordun apparatının Kalk kabıl aluu bölümü", ru: "Общественная приёмная Аппарата губернатора" },
      keywords: "appeal online reception complaint governor virtual kabıl aluu kayrıluu интернет-приёмная обращение жалоба"
    },
    {
      id: "dog", cat: "other", sec: "c", status: "limited", icon: "paw",
      name: { en: "Dog registration", ir: "Itti kattoo", ru: "Регистрация собаки" },
      desc: { en: "Register a dog and get its tag in Talas, Nurzhan and Iyık Janyl.", ir: "Talas, Nurzhan jana Iyık Janylda itti kattap, anın belgisin alıñız.", ru: "Регистрация собаки и жетон в Таласе, Нуржане и Ийык-Джаныле." },
      agency: { en: "City sanitation enterprises (Tazalık) of Talas, Nurzhan and Iyık Janyl", ir: "Talas, Nurzhan jana Iyık Janyldın shaardık tazalık ishkanaları (Tazalık)", ru: "Городские предприятия по санитарной очистке («Тазалык») Таласа, Нуржана и Ийык-Джаныла" },
      keywords: "dog registration tag tazalık it kattoo собака регистрация жетон"
    }
  ]
};
