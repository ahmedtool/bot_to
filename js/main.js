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
        <span>${PROFILE.name}<small lang="en">${PROFILE.nameEn}</small></span>
      </a>
      <nav class="nav-links" id="navLinks">
        ${link("index.html", "الرئيسية", "home")}
        ${link("index.html#work", "وش أبني", "work")}
        ${link("index.html#about", "نبذة", "about")}
        ${link("index.html#experience", "خبراتي", "experience")}
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
            <li><a href="index.html#work">وش أبني</a></li>
            <li><a href="index.html#experience">خبراتي</a></li>
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
  $("#pfNameEn").textContent = P.nameEn;
  // الاسم: كل كلمة تطلع من تحت قناع
  $("#pfName").innerHTML = P.name.split(" ").map((w, i) =>
    `<span class="w"><span style="--d:${i + 1}">${w}</span></span>`).join(" ");
  $("#pfRole").textContent = P.role;
  $("#pfIntro").textContent = P.intro;
  $("#pfIntroEn").textContent = P.introEn;
  $("#pfFacts").innerHTML = `
    <span>${P.fullName}</span>
    <span>📍 ${P.city}</span>
    ${P.available ? `<span class="avail"><i></i> متاح للتعاون</span>` : ""}`;

  $("#pfWork").innerHTML = P.projects.map((p, i) => `
    <article class="project ${i === 0 ? "lead" : ""}">
      <div class="project-cover ${p.bg}">
        <span class="cover-ar">${p.title}</span>
        <span class="cover-en" lang="en">${p.titleEn}</span>
      </div>
      <div class="project-body">
        <span class="chip">${p.label}</span>
        <h3>${p.title} <small lang="en">${p.titleEn}</small></h3>
        <p>${p.desc}</p>
        <ul class="points">${p.points.map((x) => `<li>${x}</li>`).join("")}</ul>
        <div class="tags">${p.tags.map((t) => `<span class="chip sky">${t}</span>`).join("")}</div>
        ${p.link ? `<a class="btn btn-ghost" href="${p.link}" target="_blank" rel="noopener">زيارة الموقع ↗</a>` : ""}
      </div>
    </article>`).join("");

  $("#pfAbout").innerHTML = P.about.map((t) => `<p>${t}</p>`).join("");
  $("#pfAchievements").innerHTML = P.achievements.map((s) => `<div><b>${s.value}</b><span>${s.label}</span></div>`).join("");

  $("#pfExp").innerHTML = P.experience.map((e) => `
    <li>
      <span class="period">${e.period}</span>
      <div>
        <h3>${e.title}${e.place ? ` <small>· ${e.place}</small>` : ""}</h3>
        ${e.points.length ? `<ul>${e.points.map((x) => `<li>${x}</li>`).join("")}</ul>` : ""}
      </div>
    </li>`).join("");

  $("#pfSkills").innerHTML = P.skills.map((g, i) => `
    <div class="skill-group">
      <span class="num">٠${arNum(i + 1)}</span>
      <h3>${g.group}</h3>
      <ul>${g.items.map((x) => `<li>${x}</li>`).join("")}</ul>
    </div>`).join("");
  $("#pfLangs").innerHTML = P.languages.map((l) => `<li><b>${l.name}</b><span>${l.level}</span></li>`).join("");
  $("#pfInterests").innerHTML = P.interests.map((x) => `<span class="pill">${x}</span>`).join("");

  $("#pfEmail").textContent = P.contact.email;
  $("#pfEmail").href = "mailto:" + P.contact.email;
  $("#pfLinks").innerHTML = P.contact.links.map((l) => `<a class="btn btn-ghost" href="${l.url}" target="_blank" rel="noopener">${l.label} ↗</a>`).join("");

  // شريط الاهتمامات المتحرك (مكرر ليدور بلا انقطاع)
  const words = [...P.interests, ...P.skills.flatMap((g) => g.group)];
  const row = words.map((w) => `<span>${w}</span>`).join("");
  $("#pfMarquee").innerHTML = row + row;

  // ترتيب ظهور العناصر داخل كل قسم
  const groups = ["#pfWork", "#pfAchievements", "#pfExp", "#pfSkills", "#pfLangs", "#pfInterests", "#pfLinks"];
  groups.forEach((g) => [...$(g).children].forEach((el, i) => { el.classList.add("st"); el.style.setProperty("--i", i); }));
  $$(".skill-group li, .points li, .timeline ul li").forEach((el) => {
    el.classList.add("st");
    el.style.setProperty("--i", [...el.parentNode.children].indexOf(el) + 2);
  });

  // ظهور تدريجي أثناء التمرير
  const targets = $$(".reveal, .project");
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    targets.forEach((el) => io.observe(el));
  } else {
    targets.forEach((el) => el.classList.add("in"));
  }

  // شريط تقدم التمرير أعلى الصفحة
  const bar = $("#progress");
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  requestAnimationFrame(() => document.body.classList.add("loaded"));
}

document.addEventListener("DOMContentLoaded", () => {
  renderChrome();
  const page = document.body.dataset.page;
  if (page === "home") initPortfolio();
});
