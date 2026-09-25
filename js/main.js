/* الموقع — السكربت المشترك لكل الصفحات */

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
      <a href="index.html" class="logo" aria-label="أحمد الحربي - الرئيسية">
        <span class="logo-mark">أ</span>
        <span>${PROFILE.name}<small>${PROFILE.role}</small></span>
      </a>
      <nav class="nav-links" id="navLinks">
        ${link("index.html", "الرئيسية", "home")}
        ${link("index.html#work", "أعمالي", "work")}
        ${link("blog.html", "المقالات", "blog")}
        ${link("apps.html", "دليل التطبيقات", "apps")}
        ${link("index.html#contact", "تواصل معي", "contact")}
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
          <a href="index.html" class="logo"><span class="logo-mark">أ</span><span>${PROFILE.name}</span></a>
          <p style="margin-top:12px;max-width:380px">${PROFILE.intro}</p>
        </div>
        <div>
          <h5>أقسام المقالات</h5>
          <ul>${CATEGORIES.filter((c) => c.id !== "all").map((c) => `<li><a href="blog.html?cat=${c.id}#menu">${c.name}</a></li>`).join("")}</ul>
        </div>
        <div>
          <h5>روابط</h5>
          <ul>
            <li><a href="index.html#about">نبذة عني</a></li>
            <li><a href="index.html#work">أعمالي</a></li>
            <li><a href="blog.html">المقالات</a></li>
            ${PROFILE.contact.links.map((l) => `<li><a href="${l.url}" target="_blank" rel="noopener">${l.label}</a></li>`).join("")}
          </ul>
        </div>
      </div>
      <div class="copy">
        <span>© ${new Date().getFullYear()} ${PROFILE.name}</span>
        <span>المدونة مستقلة وغير تابعة لأي تطبيق توصيل.</span>
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

/* ---------- صفحة المقالات ---------- */
function initBlog() {
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

/* ---------- الصفحة التعريفية ---------- */
function initPortfolio() {
  const P = PROFILE;
  $("#pfName").textContent = P.name;
  $("#pfRole").textContent = P.role;
  $("#pfIntro").textContent = P.intro;
  $("#pfFacts").innerHTML = `
    <span>📍 ${P.city}</span>
    ${P.available ? `<span class="avail"><i></i> متاح لمشاريع جديدة</span>` : ""}`;

  $("#pfAbout").innerHTML = P.about.map((t) => `<p>${t}</p>`).join("");
  $("#pfStats").innerHTML = P.stats.map((s) => `<div><b>${s.value}</b><span>${s.label}</span></div>`).join("");

  $("#pfSkills").innerHTML = P.skills.map((g, i) => `
    <div class="skill-group">
      <span class="num">٠${arNum(i + 1)}</span>
      <h3>${g.group}</h3>
      <ul>${g.items.map((x) => `<li>${x}</li>`).join("")}</ul>
    </div>`).join("");

  $("#pfWork").innerHTML = P.projects.map((p, i) => `
    <a class="project" href="${p.link}">
      <div class="project-cover ${p.bg}"><span>${arNum(i + 1).padStart(2, "٠")}</span></div>
      <div class="project-body">
        <div class="project-top"><h3>${p.title}</h3><span class="year">${p.year}</span></div>
        <p>${p.desc}</p>
        <div class="tags">${p.tags.map((t) => `<span class="chip sky">${t}</span>`).join("")}</div>
      </div>
    </a>`).join("");

  $("#pfExp").innerHTML = P.experience.map((e) => `
    <li>
      <span class="period">${e.period}</span>
      <div><h3>${e.title} <small>· ${e.place}</small></h3><p>${e.desc}</p></div>
    </li>`).join("");

  $("#pfPosts").innerHTML = POSTS.slice(0, 3).map((p) => postCard(p)).join("");

  $("#pfEmail").textContent = P.contact.email;
  $("#pfEmail").href = "mailto:" + P.contact.email;
  $("#pfLinks").innerHTML = P.contact.links.map((l) => `<a class="btn btn-ghost" href="${l.url}" target="_blank" rel="noopener">${l.label} ↗</a>`).join("");

  // ظهور تدريجي للأقسام أثناء التمرير
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { threshold: 0.12 });
    $$(".reveal").forEach((el) => io.observe(el));
  } else {
    $$(".reveal").forEach((el) => el.classList.add("in"));
  }
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
  if (page === "home") initPortfolio();
  if (page === "blog") initBlog();
  if (page === "apps") { renderApps($("#appsAll")); initNewsletter(); }
  if (page === "article" && typeof initArticle === "function") initArticle();
});
