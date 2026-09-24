/* صفحة المقال: عرض المقال + تتبع القراءة كأنه تتبع طلب */

function initArticle() {
  const id = new URLSearchParams(location.search).get("id");
  const post = POSTS.find((p) => p.id === id) || POSTS[0];
  const cat = catOf(post.cat);

  document.title = `${post.title} — وصلة`;

  $("#articleHero").innerHTML = `
    <div class="cover ${post.bg}">${post.emoji}</div>
    <a class="chip" href="index.html?cat=${cat.id}#menu">${cat.name}</a>
    <h1>${post.title}</h1>
    <div class="meta">
      <span>${post.author}</span>
      <span>${fmtDate(post.date)}</span>
      <span>${arNum(post.read)} دقائق قراءة</span>
    </div>`;

  $("#articleBody").innerHTML = post.body;

  // جدول المحتويات
  const heads = $$("#articleBody h2");
  $("#toc").innerHTML = heads.map((h) => `<li><a href="#${h.id}">${h.textContent}</a></li>`).join("");
  const tocLinks = $$("#toc a");

  // مراحل تتبع القراءة
  const stages = [
    [0, "📋 جاري تجهيز طلبك"],
    [0.15, "👨‍🍳 المطبخ يحضّر المقال"],
    [0.45, "🛵 المندوب في الطريق"],
    [0.8, "📍 المندوب قريب منك"],
    [0.98, "✅ تم التوصيل"],
  ];
  const body = $("#articleBody");
  const fill = $("#trackFill"), scooter = $("#trackScooter"), text = $("#trackText");
  let delivered = false;

  function onScroll() {
    const rect = body.getBoundingClientRect();
    // النسبة = كم من المقال مرّ فوق ٨٥٪ من ارتفاع الشاشة
    const p = Math.min(1, Math.max(0, (innerHeight * 0.85 - rect.top) / rect.height));
    fill.style.width = p * 100 + "%";
    scooter.style.insetInlineStart = `calc(${p * 100}% - 12px)`;
    text.textContent = stages.filter((s) => p >= s[0]).pop()[1];

    if (p >= 0.98 && !delivered) {
      delivered = true;
      $("#delivered").classList.add("show");
    }

    // تمييز القسم الحالي في المحتويات
    let current = 0;
    heads.forEach((h, i) => { if (h.getBoundingClientRect().top < 180) current = i; });
    tocLinks.forEach((a, i) => a.classList.toggle("active", i === current));
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  // تقييم الطلب
  const labels = ["", "بارد مرة 🥶", "فاتر 😐", "زين 🙂", "ساخن 🔥", "طازج من الفرن 🤩"];
  const key = "wasla-rate-" + post.id;
  const stars = $("#stars");
  stars.innerHTML = [1, 2, 3, 4, 5].map((n) => `<button data-n="${n}" aria-label="${n} من ٥">⭐</button>`).join("");
  const paint = (n) => $$("button", stars).forEach((b) => b.classList.toggle("on", +b.dataset.n <= n));
  const saved = +store(key) || 0;
  if (saved) { paint(saved); $("#rateMsg").textContent = "تقييمك: " + labels[saved]; }
  stars.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const n = +b.dataset.n;
    paint(n);
    store(key, n);
    $("#rateMsg").textContent = "شكرًا! تقييمك: " + labels[n];
  });

  // مقالات ذات صلة: نفس التصنيف أولًا
  const related = POSTS.filter((p) => p.id !== post.id)
    .sort((a, b) => (b.cat === post.cat) - (a.cat === post.cat))
    .slice(0, 3);
  $("#related").innerHTML = related.map((p) => postCard(p)).join("");
}
