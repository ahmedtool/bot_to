/* مكوّن «تتبع الطلب»: خط رفيع + مندوب يتحرك بنعومة + محطات */

const RIDER_SVG = `
<svg viewBox="0 0 34 26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <rect class="box" x="19" y="3" width="10" height="8" rx="1.5" fill="currentColor" stroke="none"/>
  <path d="M8 19 L11 8 H6.5"/>
  <path d="M12 19 H22 Q26 19 26 15 V12 H30 V19"/>
  <g class="wheel"><circle cx="8" cy="19" r="4"/><path d="M8 15v8M4 19h8" stroke-width="1.1"/></g>
  <g class="wheel"><circle cx="27" cy="19" r="4"/><path d="M27 15v8M23 19h8" stroke-width="1.1"/></g>
  <g class="speed"><path d="M34 9h-2.5M34 13h-4"/></g>
</svg>`;

const HOME_SVG = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path class="check" d="M9 15l2 2 4-4"/>
</svg>`;

/**
 * يبني المتتبع داخل العنصر el.
 * stops: [{ at: 0..1, label }] — المحطات على الخط
 * يرجع { set(p) } لتحديد الهدف، والحركة الفعلية تتم بنعومة تلقائيًا.
 */
function createTracker(el, stops, onStage) {
  el.classList.add("track");
  el.innerHTML = `
    <div class="track-line"><div class="track-fill"></div></div>
    ${stops.map((s) => `<span class="stop" style="--at:${s.at}"><i></i><em>${s.label}</em></span>`).join("")}
    <span class="track-home">${HOME_SVG}</span>
    <span class="track-rider">${RIDER_SVG}</span>`;

  const fill = el.querySelector(".track-fill");
  const rider = el.querySelector(".track-rider");
  const stopEls = [...el.querySelectorAll(".stop")];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let target = 0, current = 0, width = el.clientWidth, stage = -1, raf = 0;
  new ResizeObserver(() => { width = el.clientWidth; draw(); }).observe(el);

  function draw() {
    // الاتجاه من اليمين لليسار: المندوب يتحرك بقيمة سالبة على X
    fill.style.transform = `scaleX(${current})`;
    rider.style.transform = `translateX(${-current * width}px)`;
    stopEls.forEach((s, i) => s.classList.toggle("passed", current >= stops[i].at - 0.001));
    const st = stops.reduce((acc, s, i) => (current >= s.at - 0.001 ? i : acc), 0);
    if (st !== stage) { stage = st; onStage && onStage(st, stops[st]); }
    el.classList.toggle("arrived", current > 0.995);
  }

  function tick() {
    const diff = target - current;
    current = reduce || Math.abs(diff) < 0.0005 ? target : current + diff * 0.09;
    el.classList.toggle("moving", Math.abs(diff) > 0.002);
    el.classList.toggle("reverse", diff < -0.002);
    draw();
    raf = current === target ? 0 : requestAnimationFrame(tick);
  }

  return {
    // قفزة فورية بدون حركة (لإعادة البدء)
    jump(p) {
      target = current = p;
      el.classList.remove("moving", "reverse");
      draw();
    },
    set(p) {
      target = Math.min(1, Math.max(0, p));
      if (!raf) raf = requestAnimationFrame(tick);
    },
  };
}

/* نص الحالة يتبدل بانتقال ناعم */
function swapText(el, text) {
  if (el.textContent === text) return;
  el.classList.add("out");
  setTimeout(() => { el.textContent = text; el.classList.remove("out"); }, 180);
}
