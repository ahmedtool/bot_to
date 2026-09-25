/* الموقع — السكربت المشترك لكل الصفحات */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const arNum = (n) => Number(n).toLocaleString("ar-SA");

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
        ${link("index.html#skills", "مهاراتي", "skills")}
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
          <h5>روابط</h5>
          <ul>
            <li><a href="index.html#about">نبذة عني</a></li>
            <li><a href="index.html#work">أعمالي</a></li>
            <li><a href="index.html#skills">مهاراتي</a></li>
            <li><a href="index.html#contact">تواصل معي</a></li>
            ${PROFILE.contact.links.map((l) => `<li><a href="${l.url}" target="_blank" rel="noopener">${l.label}</a></li>`).join("")}
          </ul>
        </div>
      </div>
      <div class="copy">
        <span>© ${new Date().getFullYear()} ${PROFILE.name}</span>
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

document.addEventListener("DOMContentLoaded", () => {
  renderChrome();
  const page = document.body.dataset.page;
  if (page === "home") initPortfolio();
});
