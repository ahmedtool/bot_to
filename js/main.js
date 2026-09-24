/* وصلة — السكربت المشترك لكل الصفحات */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const arNum = (n) => Number(n).toLocaleString("ar-SA");
const fmtDate = (d) => new Date(d).toLocaleDateString("ar-SA", { day: "numeric", month: "long", year: "numeric" });
const catOf = (id) => CATEGORIES.find((c) => c.id === id);

function store(key, val) {
  try {
    if (val === undefined) return localStorage.getItem(key);
    localStorage.setItem(key, val);
  } catch (e) { return null; }
}

/* ---------- الهيدر والفوتر ---------- */
function renderChrome() {
  const page = document.body.dataset.page;
  const link = (href, label, id) => `<a href="${href}" class="${page === id ? "active" : ""}">${label}</a>`;
  $("#header").innerHTML = `
  <a class="skip" href="#main">تخطَّ إلى المحتوى</a>
  <header class="site-header">
    <div class="container nav">
      <a href="index.html" class="logo" aria-label="وصلة - الرئيسية">
        <span class="logo-mark">و</span>
        <span>وصلة</span>
      </a>
      <nav class="nav-links" id="navLinks">
        ${link("index.html", "الرئيسية", "home")}
        ${link("index.html#menu", "المقالات", "posts")}
        ${link("index.html#tools", "أدوات", "tools")}
        ${link("apps.html", "دليل التطبيقات", "apps")}
        ${link("about.html", "عن وصلة", "about")}
      </nav>
      <div class="nav-actions">
        <button class="icon-btn" id="themeBtn" aria-label="تبديل الوضع الليلي">🌙</button>
        <button class="icon-btn menu-btn" id="menuBtn" aria-label="القائمة">☰</button>
      </div>
    </div>
  </header>`;

  $("#footer").innerHTML = `
  <footer class="site-footer">
    <div class="container">
      <div class="foot-grid">
        <div>
          <a href="index.html" class="logo"><span class="logo-mark">و</span><span>وصلة</span></a>
          <p style="margin-top:12px;max-width:380px">مدونة مستقلة عن عالم تطبيقات التوصيل: نكتب للعميل الذي يريد أن يوفّر، وللمندوب الذي يريد أن يكسب، ولصاحب المطعم الذي يريد أن ينمو.</p>
        </div>
        <div>
          <h5>المنيو</h5>
          <ul>${CATEGORIES.filter((c) => c.id !== "all").map((c) => `<li><a href="index.html?cat=${c.id}#menu">${c.name}</a></li>`).join("")}</ul>
        </div>
        <div>
          <h5>روابط</h5>
          <ul>
            <li><a href="apps.html">دليل التطبيقات</a></li>
            <li><a href="index.html#tools">حاسبة التوفير</a></li>
            <li><a href="index.html#tools">اختبار أي تطبيق يناسبك</a></li>
            <li><a href="about.html">عن وصلة</a></li>
          </ul>
        </div>
      </div>
      <div class="copy">
        <span>© ${new Date().getFullYear()} وصلة</span>
        <span>مدونة مستقلة وغير تابعة لأي تطبيق توصيل.</span>
      </div>
    </div>
  </footer>`;

  // الوضع الليلي
  const saved = store("wasla-theme");
  if (saved) document.documentElement.dataset.theme = saved;
  const isDark = () => document.documentElement.dataset.theme === "dark" ||
    (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
  const syncIcon = () => ($("#themeBtn").textContent = isDark() ? "☀️" : "🌙");
  syncIcon();
  $("#themeBtn").addEventListener("click", () => {
    const next = isDark() ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    store("wasla-theme", next);
    syncIcon();
  });

  $("#menuBtn").addEventListener("click", () => $("#navLinks").classList.toggle("open"));
  $$("#navLinks a").forEach((a) => a.addEventListener("click", () => $("#navLinks").classList.remove("open")));
}

/* ---------- بطاقة مقال (فاتورة طلب) ---------- */
function postCard(p, featured = false) {
  const c = catOf(p.cat);
  return `
  <a class="post ${featured ? "featured" : ""}" href="article.html?id=${p.id}">
    <div class="post-cover ${p.bg}">
      <span class="emoji">${p.emoji}</span>
    </div>
    <div class="post-body">
      <span class="chip">${c.name}</span>
      <h3>${p.title}</h3>
      <p>${p.excerpt}</p>
      <div class="receipt"><span>${fmtDate(p.date)}</span><span>${arNum(p.read)} دقائق قراءة</span></div>
    </div>
  </a>`;
}

/* ---------- الصفحة الرئيسية ---------- */
function initHome() {
  // شريط الأخبار
  const tips = [
    "قارن الإجمالي النهائي، لا رسوم التوصيل فقط",
    "اطلب قبل الذروة بنصف ساعة",
    "اكتب وصف موقعك مرة واحدة واحفظه",
    "الاستلام من المطعم أرخص غالبًا",
    "احسب نقطة التعادل قبل أي اشتراك",
    "المندوب يسامح الزحمة، لكن لا يسامح الموقع الخطأ",
  ];
  const t = tips.map((x) => `<span>${x}</span>`).join("");
  $("#ticker").innerHTML = t + t;

  // الأرقام

  // المنيو (التصنيفات)
  const params = new URLSearchParams(location.search);
  let active = params.get("cat") || "all";
  let query = "";

  const tabs = $("#menuTabs");
  tabs.innerHTML = CATEGORIES.map((c) => {
    const n = c.id === "all" ? POSTS.length : POSTS.filter((p) => p.cat === c.id).length;
    return `<button class="menu-tab" data-cat="${c.id}" role="tab">${c.name} <span class="count">${arNum(n)}</span></button>`;
  }).join("");

  function draw() {
    $$(".menu-tab").forEach((b) => b.classList.toggle("active", b.dataset.cat === active));
    const list = POSTS.filter((p) => (active === "all" || p.cat === active) &&
      (!query || (p.title + p.excerpt).includes(query)));
    if (!list.length) {
      $("#posts").innerHTML = `<div class="empty">🍽️ المطبخ ما لقى طلب بهذا الاسم… جرّب كلمة ثانية.</div>`;
      return;
    }
    const showFeatured = active === "all" && !query;
    $("#posts").innerHTML = list.map((p) => postCard(p, showFeatured && p.featured)).join("");
  }

  tabs.addEventListener("click", (e) => {
    const b = e.target.closest(".menu-tab");
    if (!b) return;
    active = b.dataset.cat;
    draw();
  });
  $("#search").addEventListener("input", (e) => { query = e.target.value.trim(); draw(); });
  draw();

  initHeroTrack();
  initCalculator();
  initQuiz();
  renderApps($("#appsPreview"), 4);
  initNewsletter();
}

/* ---------- تتبع طلب تلقائي في الهيرو ---------- */
function initHeroTrack() {
  const el = $("#heroTrack");
  if (!el || typeof createTracker !== "function") return;
  const text = $("#heroTrackText");
  const statuses = ["تم استلام الفكرة", "التحرير والمراجعة", "المقال في الطريق", "قريب منك", "وصل المقال"];
  const t = createTracker(el, [
    { at: 0, label: "الفكرة" },
    { at: 0.33, label: "التحرير" },
    { at: 0.66, label: "في الطريق" },
  ], (i) => swapText(text, statuses[i]));
  // يتقدم على مراحل مع توقفات قصيرة، ثم يعيد من البداية
  const plan = [0, 0.33, 0.5, 0.66, 0.85, 1];
  let k = 0;
  (function step() {
    if (k === 0) t.jump(0); else t.set(plan[k]);
    if (plan[k] === 1) setTimeout(() => swapText(text, statuses[4]), 700);
    const wait = plan[k] === 1 ? 3200 : 1500;
    k = (k + 1) % plan.length;
    setTimeout(step, wait);
  })();
}

/* ---------- حاسبة التوفير ---------- */
function initCalculator() {
  const f = {
    orders: $("#cOrders"), fee: $("#cFee"), service: $("#cService"), sub: $("#cSub"),
  };
  const out = (id, v) => ($(`output[for="${id}"]`).textContent = v);

  function calc() {
    const orders = +f.orders.value, fee = +f.fee.value, service = +f.service.value, sub = +f.sub.value;
    out("cOrders", arNum(orders) + " طلب");
    out("cFee", arNum(fee) + " ر.س");
    out("cService", arNum(service) + " ر.س");
    out("cSub", arNum(sub) + " ر.س");

    const monthly = orders * (fee + service);
    const withSub = sub + orders * service;
    const save = monthly - withSub;
    const breakEven = fee > 0 ? Math.ceil(sub / fee) : 0;

    $("#rMonthly").textContent = arNum(monthly) + " ر.س";
    $("#rYearly").textContent = arNum(monthly * 12) + " ر.س";
    $("#rSave").textContent = (save > 0 ? arNum(save) : "٠") + " ر.س";
    $("#rBreak").textContent = arNum(breakEven) + " طلبات";

    $("#calcTip").innerHTML = save > 0
      ? `✅ بمعدل طلباتك، الاشتراك الشهري <b>يوفّر عليك</b> تقريبًا ${arNum(save * 12)} ر.س في السنة.`
      : `⚠️ بمعدل طلباتك الحالي، الاشتراك <b>ما يستاهل</b>. تحتاج ${arNum(breakEven)} طلبات شهريًا على الأقل.`;
  }
  Object.values(f).forEach((i) => i.addEventListener("input", calc));
  calc();
}

/* ---------- الاختبار ---------- */
function initQuiz() {
  const box = $("#quiz");
  let i = 0, score = {};

  function show() {
    if (i >= QUIZ.length) return result();
    const q = QUIZ[i];
    box.innerHTML = `
      <div class="quiz-progress"><i style="width:${(i / QUIZ.length) * 100}%"></i></div>
      <div class="quiz-q">${arNum(i + 1)}. ${q.q}</div>
      <div class="quiz-opts">${q.opts.map((o, k) => `<button class="quiz-opt" data-k="${k}">${o.t}</button>`).join("")}</div>`;
    $$(".quiz-opt", box).forEach((b) => b.addEventListener("click", () => {
      const s = q.opts[+b.dataset.k].s;
      for (const k in s) score[k] = (score[k] || 0) + s[k];
      i++; show();
    }));
  }

  function result() {
    const best = Object.entries(score).sort((a, b) => b[1] - a[1])[0][0];
    const r = QUIZ_RESULTS[best];
    box.innerHTML = `
      <div class="quiz-progress"><i style="width:100%"></i></div>
      <div class="quiz-result">
        <div class="big">${r.emoji}</div>
        <h4>${r.title}</h4>
        <p>${r.text}</p>
        <div class="hero-cta" style="justify-content:center">
          <a class="btn btn-primary" href="article.html?id=${r.link}">اقرأ المقال المناسب لك</a>
          <button class="btn btn-ghost" id="quizAgain">أعد الاختبار</button>
        </div>
      </div>`;
    $("#quizAgain").addEventListener("click", () => { i = 0; score = {}; show(); });
  }
  show();
}

/* ---------- دليل التطبيقات ---------- */
function renderApps(el, limit) {
  if (!el) return;
  const list = limit ? APPS.slice(0, limit) : APPS;
  el.innerHTML = list.map((a) => `
    <div class="app">
      <div class="app-top">
        <div class="app-icon" style="background:${a.color}">${a.letter}</div>
        <div><h4>${a.name}</h4><div class="type">${a.type}</div></div>
      </div>
      <p>${a.desc}</p>
      <div class="tags">${a.tags.map((t) => `<span class="chip sky">${t}</span>`).join("")}</div>
    </div>`).join("");
}

/* ---------- النشرة البريدية ---------- */
function initNewsletter() {
  const form = $("#nlForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = $("#nlEmail").value.trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    $("#nlMsg").textContent = ok
      ? "تم الاشتراك. أول عدد يوصلك الأحد الجاي."
      : "⚠️ تأكد من البريد الإلكتروني.";
    if (ok) form.reset();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderChrome();
  const page = document.body.dataset.page;
  if (page === "home") initHome();
  if (page === "apps") { renderApps($("#appsAll")); initNewsletter(); }
  if (page === "article" && typeof initArticle === "function") initArticle();
  if (page === "about") initNewsletter();
});
