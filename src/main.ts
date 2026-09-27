import "./styles.css";
import { scenes, type SceneDefinition, type SceneView, type Theme } from "./scenes";
import type { ModelViewer } from "./viewer";

const appElement = document.querySelector<HTMLDivElement>("#app");
if (!appElement) throw new Error("Application root is missing");
const app: HTMLDivElement = appElement;

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let activeViewer: ModelViewer | null = null;
let activeController: AbortController | null = null;
let currentScene = scenes[0];
let currentView = currentScene.views[0];
let currentTheme: Theme = "day";
let themeRequest = 0;
let requestedTheme: Theme = currentTheme;
let themeTransition: ViewTransition | null = null;
let themeAnimation: Animation | null = null;

const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, character => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
})[character] || character);

const stageLabel = (scene: SceneDefinition, view: SceneView, theme: Theme): string =>
  `${view.label} · ${scene.captions[theme]}`;

function pageMarkup(scene: SceneDefinition, view: SceneView, theme: Theme): string {
  const views = scene.views.map(item => `<button type="button" data-view="${escapeHtml(item.id)}" aria-pressed="${item.id === view.id}">${escapeHtml(item.label)}</button>`).join("");
  const story = scene.story.map((section, index) => `
    <div class="story-block" style="--reveal-delay: ${170 + index * 50}ms">
      <small>${escapeHtml(section.label)}</small>
      <h3>${escapeHtml(section.title)}</h3>
      <p>${escapeHtml(section.body)}</p>
    </div>`).join("");
  const sources = scene.sources.map(source => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.label)} ↗</a>`).join("");
  const catalog = scenes.map(item => `
    <button class="catalog-card" type="button" data-scene="${escapeHtml(item.id)}" aria-label="查看 ${escapeHtml(item.title)}">
      <span class="catalog-cover" aria-hidden="true"><span class="catalog-landscape"></span><span class="catalog-cover-number">${escapeHtml(item.id.slice(-2))}</span></span>
      <span class="catalog-caption"><strong><small>${escapeHtml(item.city)}</small>${escapeHtml(item.title)}</strong><b>${escapeHtml(item.id.slice(-2))}</b></span>
    </button>`).join("");

  return `
    <div class="page">
      <header class="topbar">
        <a class="brand" href="./" aria-label="微缩山水首页"><span class="brand-mark">山</span><span class="brand-name">微缩山水<small>MINIATURE SHANSHUI</small></span></a>
        <button class="catalog-trigger" id="catalog-open" type="button" aria-haspopup="dialog"><span>景观目录</span><span class="catalog-count">${scene.id.slice(-2)} / ${String(scenes.length).padStart(2, "0")}</span></button>
      </header>

      <main class="layout">
        <section class="intro" aria-labelledby="scene-title">
          <p class="eyebrow">${escapeHtml(scene.eyebrow)} / ${escapeHtml(scene.id)}</p>
          <h1 id="scene-title"><span class="title-line">${escapeHtml(scene.titleLines[0])}</span><span class="title-line">${escapeHtml(scene.titleLines[1])}</span></h1>
          <div class="intro-rule"></div>
          <p class="verse-label">原创题词</p>
          <p class="verse">${escapeHtml(scene.verse[0])}<br />${escapeHtml(scene.verse[1])}</p>
        </section>

        <section class="viewer" id="viewer" aria-label="${escapeHtml(scene.title)}模型展示区">
          <div class="viewer-surface" aria-hidden="true"></div>
          <div class="viewer-corner"><strong class="swap-text" id="stage-title">${escapeHtml(stageLabel(scene, view, theme))}</strong><em>Miniature scene / ${escapeHtml(scene.id.slice(-2))}</em></div>
          <span class="stage-watermark" aria-hidden="true">${escapeHtml(scene.id.slice(-2))}</span>
          <div class="theme-switch" role="group" aria-label="光照模式">
            <span class="switch-glider" aria-hidden="true"></span>
            <button type="button" data-theme="day" aria-pressed="${theme === "day"}">日游</button>
            <button type="button" data-theme="night" aria-pressed="${theme === "night"}">夜游</button>
          </div>
          <div class="model-viewport" id="model-viewport"></div>
          <div class="loading-scene" id="loading-scene" data-state="loading">
            <svg class="loading-art" viewBox="0 0 360 190" fill="none" aria-hidden="true">
              <path class="loading-mountain-fill loading-back-fill" d="M29 126c25-4 42-35 63-43 16-6 24 17 41 15 20-2 30-49 52-55 22-5 38 37 59 40 17 2 25-18 43-16 22 2 39 36 48 59v26H29z" />
              <path class="loading-mountain-fill loading-front-fill" d="M25 137c24 2 45-22 67-22 17 0 33 18 53 17 25-2 35-29 59-27 18 2 28 20 49 20 23 0 40-17 61-9 10 4 17 13 23 21v18H25z" />
              <path class="loading-ridge loading-ridge-back" d="M29 126c25-4 42-35 63-43 16-6 24 17 41 15 20-2 30-49 52-55 22-5 38 37 59 40 17 2 25-18 43-16 22 2 39 36 48 59" />
              <path class="loading-ridge loading-ridge-front" d="M25 137c24 2 45-22 67-22 17 0 33 18 53 17 25-2 35-29 59-27 18 2 28 20 49 20 23 0 40-17 61-9 10 4 17 13 23 21" />
              <path class="loading-water loading-water-one" d="M54 151c42 7 88 7 130 0 40-6 85-6 125 0" />
              <path class="loading-water loading-water-two" d="M85 165c33 4 65 4 98 0 33-4 66-4 99 0" />
              <ellipse class="loading-ripple" cx="182" cy="175" rx="56" ry="6" />
            </svg>
            <strong>微缩山水</strong>
            <span class="loading-status" id="loading-status" role="status" aria-live="polite">微景渐次成形…</span>
            <button class="retry-model" id="retry-model" type="button" hidden>重新载入</button>
          </div>
          <div class="view-switch" role="group" aria-label="观看视图"><span class="switch-glider" aria-hidden="true"></span>${views}</div>
          <div class="viewer-tools">
            <button class="tool-button" id="reset-button" type="button" aria-label="复位视角" title="复位视角" disabled>↺</button>
            <button class="tool-button" id="expand-view" type="button" aria-label="沉浸观景" aria-pressed="false" title="沉浸观景">⤢</button>
          </div>
        </section>

        <aside class="aside">
          <div class="aside-top"><span class="thin"></span><span class="aside-index">${escapeHtml(scene.id.slice(-2))}</span><span class="aside-label">THE STORY</span><h2 class="swap-text" id="aside-title">${escapeHtml(scene.overviewTitle)}</h2></div>
          <div class="aside-bottom"><button class="story-button" id="story-open" type="button"><span>${escapeHtml(scene.storyButtonLabel)}</span><span aria-hidden="true">↗</span></button></div>
        </aside>
      </main>

      <footer class="footer"><span>MINIATURE SHANSHUI</span><span>© 2026 DarkWinoom · MIT</span></footer>
    </div>

    <div class="drawer-backdrop" id="story-backdrop" aria-hidden="true">
      <section class="drawer-panel story-panel" role="dialog" aria-modal="true" aria-labelledby="story-title">
        <div class="story-panel-head"><span>MINIATURE SHANSHUI / ${escapeHtml(scene.id)}</span><button class="story-close" id="story-close" type="button" aria-label="关闭故事">×</button></div>
        <h2 id="story-title">${escapeHtml(scene.title)}</h2>
        <p class="story-lead">${escapeHtml(scene.storyLead)}</p>
        ${story}
        <div class="story-sources"><span>资料来源 · 页面文字为原创概述</span>${sources}</div>
      </section>
    </div>

    <div class="drawer-backdrop" id="catalog-backdrop" aria-hidden="true">
      <section class="drawer-panel catalog-panel" role="dialog" aria-modal="true" aria-labelledby="catalog-title">
        <div class="story-panel-head"><span>MINIATURE SHANSHUI / INDEX</span><button class="story-close" id="catalog-close" type="button" aria-label="关闭目录">×</button></div>
        <h2 id="catalog-title">景观目录</h2>
        <p class="catalog-intro">从一处风景开始，逐页收藏山水与城市。</p>
        <div class="catalog-list">${catalog}</div>
        <p class="catalog-end">当前收录 ${String(scenes.length).padStart(2, "0")} 景</p>
      </section>
    </div>`;
}

function mountScene(scene: SceneDefinition): void {
  activeController?.abort();
  activeViewer?.dispose();
  activeViewer = null;
  ++themeRequest;
  themeTransition?.skipTransition();
  themeAnimation?.cancel();
  document.documentElement.classList.remove("theme-changing");
  document.body.style.overflow = "";
  document.body.classList.remove("is-immersive");
  activeController = new AbortController();
  const signal = activeController.signal;
  currentScene = scene;
  currentView = scene.views[0];
  requestedTheme = currentTheme;
  document.documentElement.dataset.theme = currentTheme;
  app!.innerHTML = pageMarkup(scene, currentView, currentTheme);
  document.title = `${scene.title} · 微缩山水`;

  const find = <T extends Element>(selector: string): T => {
    const element = app!.querySelector<T>(selector);
    if (!element) throw new Error(`Missing interface element: ${selector}`);
    return element;
  };
  const viewerElement = find<HTMLElement>("#viewer");
  const viewport = find<HTMLElement>("#model-viewport");
  const loadingScene = find<HTMLElement>("#loading-scene");
  const loading = find<HTMLElement>("#loading-status");
  const retryButton = find<HTMLButtonElement>("#retry-model");
  const stageTitle = find<HTMLElement>("#stage-title");
  const asideTitle = find<HTMLElement>("#aside-title");
  const resetButton = find<HTMLButtonElement>("#reset-button");
  const expandButton = find<HTMLButtonElement>("#expand-view");
  const storyBackdrop = find<HTMLElement>("#story-backdrop");
  const catalogBackdrop = find<HTMLElement>("#catalog-backdrop");
  let drawer: HTMLElement | null = null;
  let drawerTrigger: HTMLElement | null = null;
  let modelReady = false;
  let activeViewId = currentView.id;
  let viewRequest = 0;
  let viewExitTimer = 0;
  let viewEnterTimer = 0;
  const textTimers = new WeakMap<HTMLElement, { swap: number; cleanup: number }>();

  function moveGlider(group: HTMLElement): void {
    const selected = group.querySelector<HTMLButtonElement>('button[aria-pressed="true"]');
    if (!selected) return;
    group.style.setProperty("--glider-x", `${selected.offsetLeft}px`);
    group.style.setProperty("--glider-width", `${selected.offsetWidth}px`);
  }

  function selectButton(button: HTMLButtonElement, selector: string): void {
    app!.querySelectorAll<HTMLButtonElement>(selector).forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    moveGlider(button.parentElement as HTMLElement);
  }

  function swapText(element: HTMLElement, value: string, direction: number): void {
    const previous = textTimers.get(element);
    window.clearTimeout(previous?.swap);
    window.clearTimeout(previous?.cleanup);
    if (element.textContent === value) {
      element.classList.remove("text-out", "text-in");
      return;
    }
    if (reducedMotion.matches) {
      element.classList.remove("text-out", "text-in");
      element.textContent = value;
      return;
    }
    element.style.setProperty("--text-out-x", direction > 0 ? "-14px" : "14px");
    element.style.setProperty("--text-in-x", direction > 0 ? "14px" : "-14px");
    element.classList.remove("text-in");
    element.classList.add("text-out");
    const timers = { swap: 0, cleanup: 0 };
    timers.swap = window.setTimeout(() => {
      element.textContent = value;
      element.classList.remove("text-out");
      element.classList.add("text-in");
      timers.cleanup = window.setTimeout(() => element.classList.remove("text-in"), 540);
    }, 170);
    textTimers.set(element, timers);
  }

  function setText(element: HTMLElement, value: string): void {
    const previous = textTimers.get(element);
    window.clearTimeout(previous?.swap);
    window.clearTimeout(previous?.cleanup);
    element.classList.remove("text-out", "text-in");
    element.textContent = value;
  }

  function cancelViewMotion(): void {
    ++viewRequest;
    window.clearTimeout(viewExitTimer);
    window.clearTimeout(viewEnterTimer);
    viewport.classList.remove("view-exit", "view-enter");
  }

  function showView(next: SceneView, direction: number): void {
    if (!modelReady || !activeViewer) return;
    cancelViewMotion();
    if (reducedMotion.matches) {
      activeViewer.setView(next, true);
      activeViewId = next.id;
      return;
    }
    const request = ++viewRequest;
    viewport.style.setProperty("--view-exit-x", direction > 0 ? "-12px" : "12px");
    viewport.style.setProperty("--view-enter-x", direction > 0 ? "12px" : "-12px");
    void viewport.offsetWidth;
    viewport.classList.add("view-exit");
    viewExitTimer = window.setTimeout(() => {
      if (signal.aborted || request !== viewRequest) return;
      activeViewer?.setView(next);
      activeViewId = next.id;
      viewport.classList.remove("view-exit");
      viewport.classList.add("view-enter");
      viewEnterTimer = window.setTimeout(() => viewport.classList.remove("view-enter"), 500);
    }, 180);
  }

  function applyTheme(theme: Theme, button: HTMLButtonElement): void {
    document.documentElement.classList.add("theme-changing");
    currentTheme = theme;
    document.documentElement.dataset.theme = theme;
    selectButton(button, "[data-theme]");
    activeViewer?.setTheme(theme);
    setText(stageTitle, stageLabel(scene, currentView, theme));
    setText(asideTitle, currentView.id === scene.views[0].id ? scene.overviewTitle : currentView.label);
  }

  async function changeTheme(button: HTMLButtonElement): Promise<void> {
    const theme = button.dataset.theme as Theme;
    if (theme === requestedTheme) return;
    requestedTheme = theme;
    const request = ++themeRequest;
    cancelViewMotion();
    if (modelReady && activeViewer) {
      if (activeViewId !== currentView.id) {
        activeViewer.setView(currentView, true);
        activeViewId = currentView.id;
      } else activeViewer.holdView();
    }
    themeAnimation?.cancel();
    themeTransition?.skipTransition();
    themeAnimation = null;
    themeTransition = null;
    document.documentElement.classList.remove("theme-changing");
    if (theme === currentTheme) return;

    if (request !== themeRequest || signal.aborted) return;

    let applied = false;
    const apply = () => {
      if (request !== themeRequest || signal.aborted) return;
      applied = true;
      applyTheme(theme, button);
    };
    if (reducedMotion.matches || typeof document.startViewTransition !== "function") {
      apply();
      requestAnimationFrame(() => { if (request === themeRequest && !signal.aborted) document.documentElement.classList.remove("theme-changing"); });
      return;
    }

    const bounds = button.getBoundingClientRect();
    const x = bounds.left + bounds.width / 2;
    const y = bounds.top + bounds.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    let transition: ViewTransition;
    try { transition = document.startViewTransition(apply); }
    catch {
      apply();
      requestAnimationFrame(() => { if (request === themeRequest && !signal.aborted) document.documentElement.classList.remove("theme-changing"); });
      return;
    }
    themeTransition = transition;
    try {
      await transition.ready;
      if (request !== themeRequest) { transition.skipTransition(); return; }
      themeAnimation = document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 720, easing: "cubic-bezier(0.18, 0.76, 0.22, 1)", pseudoElement: "::view-transition-new(root)" }
      );
      await Promise.allSettled([themeAnimation.finished, transition.finished]);
    } catch {
      if (!applied && request === themeRequest && !signal.aborted) apply();
      transition.skipTransition();
    } finally {
      if (themeTransition === transition) themeTransition = null;
      if (request === themeRequest && !signal.aborted) {
        themeAnimation = null;
        document.documentElement.classList.remove("theme-changing");
      }
    }
  }

  function openDrawer(panel: HTMLElement, trigger: HTMLElement): void {
    if (drawer) closeDrawer(false);
    drawer = panel;
    drawerTrigger = trigger;
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => {
      if (drawer === panel) panel.querySelector<HTMLButtonElement>(".story-close")?.focus();
    });
  }

  function closeDrawer(restoreFocus = true): void {
    if (!drawer) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (restoreFocus) drawerTrigger?.focus();
    drawer = null;
    drawerTrigger = null;
  }

  function toggleImmersive(force?: boolean): void {
    const immersive = force ?? !viewerElement.classList.contains("is-immersive");
    const change = () => {
      viewerElement.classList.toggle("is-immersive", immersive);
      document.body.classList.toggle("is-immersive", immersive);
      expandButton.setAttribute("aria-pressed", String(immersive));
      expandButton.setAttribute("aria-label", immersive ? "退出沉浸观景" : "沉浸观景");
      expandButton.title = immersive ? "退出沉浸观景" : "沉浸观景";
      expandButton.textContent = immersive ? "⤡" : "⤢";
    };
    if (document.startViewTransition && !reducedMotion.matches && !themeTransition) document.startViewTransition(change);
    else change();
  }

  find<HTMLButtonElement>("#catalog-open").addEventListener("click", event => openDrawer(catalogBackdrop, event.currentTarget as HTMLElement), { signal });
  find<HTMLButtonElement>("#story-open").addEventListener("click", event => openDrawer(storyBackdrop, event.currentTarget as HTMLElement), { signal });
  find<HTMLButtonElement>("#catalog-close").addEventListener("click", () => closeDrawer(), { signal });
  find<HTMLButtonElement>("#story-close").addEventListener("click", () => closeDrawer(), { signal });
  for (const panel of [storyBackdrop, catalogBackdrop]) panel.addEventListener("click", event => { if (event.target === panel) closeDrawer(); }, { signal });
  app.querySelectorAll<HTMLButtonElement>("[data-scene]").forEach(button => button.addEventListener("click", () => {
    const next = scenes.find(item => item.id === button.dataset.scene);
    if (next) mountScene(next);
  }, { signal }));
  app.querySelectorAll<HTMLButtonElement>("[data-theme]").forEach(button => button.addEventListener("click", () => { void changeTheme(button); }, { signal }));
  app.querySelectorAll<HTMLButtonElement>("[data-view]").forEach(button => button.addEventListener("click", () => {
    const next = scene.views.find(item => item.id === button.dataset.view);
    if (!next || next.id === currentView.id) return;
    const direction = Math.sign(scene.views.indexOf(next) - scene.views.indexOf(currentView));
    currentView = next;
    selectButton(button, "[data-view]");
    swapText(stageTitle, stageLabel(scene, next, currentTheme), direction);
    swapText(asideTitle, next.id === scene.views[0].id ? scene.overviewTitle : next.label, direction);
    showView(next, direction);
  }, { signal }));
  resetButton.addEventListener("click", () => activeViewer?.resetView(), { signal });
  expandButton.addEventListener("click", () => toggleImmersive(), { signal });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      if (drawer) closeDrawer();
      else if (viewerElement.classList.contains("is-immersive")) toggleImmersive(false);
    }
    if (event.key === "Tab" && drawer) {
      const focusable = [...drawer.querySelectorAll<HTMLElement>("button, a[href]")].filter(item => item.offsetParent !== null);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  }, { signal });

  const switches = [...app.querySelectorAll<HTMLElement>(".theme-switch, .view-switch")];
  window.addEventListener("resize", () => switches.forEach(moveGlider), { signal });
  requestAnimationFrame(() => {
    if (signal.aborted) return;
    switches.forEach(moveGlider);
    requestAnimationFrame(() => switches.forEach(group => group.classList.add("switch-ready")));
  });

  const showFallback = (): void => {
    activeViewer?.dispose();
    activeViewer = null;
    modelReady = false;
    viewerElement.classList.remove("has-model");
    viewport.hidden = true;
    loadingScene.hidden = false;
    loadingScene.dataset.state = "error";
    loading.textContent = "微景暂未成形，请重试载入。";
    retryButton.hidden = false;
    resetButton.disabled = true;
  };

  async function initializeViewer(): Promise<void> {
    try {
      const { ModelViewer } = await import("./viewer");
      if (signal.aborted) return;
      const instance = new ModelViewer(viewport);
      activeViewer = instance;
      await instance.load(scene, progress => {
        loading.textContent = progress === null ? "微景渐次成形…" : `微景渐次成形 ${Math.round(progress * 100)}%`;
      });
      if (signal.aborted || activeViewer !== instance) return;
      modelReady = true;
      resetButton.disabled = false;
      instance.setTheme(currentTheme);
      instance.setView(currentView, true);
      activeViewId = currentView.id;
      viewerElement.classList.add("has-model");
      loadingScene.hidden = true;
    } catch {
      if (!signal.aborted) showFallback();
    }
  }

  retryButton.addEventListener("click", () => {
    retryButton.hidden = true;
    loadingScene.dataset.state = "loading";
    loading.textContent = "微景渐次成形…";
    viewport.hidden = false;
    void initializeViewer();
  }, { signal });

  void initializeViewer();
}

mountScene(currentScene);
