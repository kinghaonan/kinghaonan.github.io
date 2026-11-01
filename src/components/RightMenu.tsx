import { useEffect, useRef, useState } from 'react';

/**
 * 全功能右键菜单 — 对齐 Volantis rightmenus 功能面
 * 导航 / 打印 / 阅读模式 / 输入框操作 / 选区搜索 / 元素与图片 / 上下篇 / 暗色 / 链接 / 音乐
 */

const ICON_PATHS: Record<string, string> = { "copy": '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>', "search": '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>', "globe": '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>', "arrow-left": '<path d="M19 12H5M12 19l-7-7 7-7"/>', "arrow-right": '<path d="M5 12h14M12 5l7 7-7 7"/>', "reload": '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>', "arrow-up": '<path d="M12 19V5M5 12l7-7 7 7"/>', "image": '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>', "link": '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>', "external": '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>', "skip-back": '<polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/>', "skip-forward": '<polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>', "printer": '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>', "book": '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h6z"/>', "sun": '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>', "moon": '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>', "mail": '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>', "user": '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>', "github": '<path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-1.97c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12v3.14c0 .31.21.68.8.56A11.52 11.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/>', "cut": '<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 5V3h6v2"/><path d="M9 12h6"/>', "audio": '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>' };
const RmIcon = ({ name }: { name: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
    dangerouslySetInnerHTML={{ __html: ICON_PATHS[name] || '' }} />
);

type Item =
  | { kind: 'sep' }
  | { kind: 'item'; ico: string; label: string; act: () => void; disabled?: boolean };

export default function RightMenu() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [open, setOpen] = useState(false);
  const [ctx, setCtx] = useState<{
    selection: string;
    inInput: boolean;
    href: string | null;
    img: string | null;
  }>({ selection: '', inInput: false, href: null, img: null });
  const menuRef = useRef<HTMLDivElement>(null);
  const [nav, setNav] = useState({ prev: false, next: false });
  const [scheme, setScheme] = useState<'light' | 'dark'>(
    (typeof document !== 'undefined' &&
      (document.documentElement.getAttribute('data-scheme') as 'light' | 'dark')) || 'light'
  );

  useEffect(() => {
    const obs = new MutationObserver(() => {
      setScheme((document.documentElement.getAttribute('data-scheme') as 'light' | 'dark') || 'light');
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-scheme'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const onCtx = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const input = t.closest('input, textarea') as HTMLInputElement | HTMLTextAreaElement | null;
      const a = t.closest('a') as HTMLAnchorElement | null;
      const img = t.closest('img') as HTMLImageElement | null;
      const sel = (window.getSelection()?.toString() || '').trim();
      setNav({
        prev: !!document.querySelector('.prev-next a.prev'),
        next: !!document.querySelector('.prev-next a.next'),
      });
      setCtx({ selection: sel, inInput: !!input, href: a?.href || null, img: img?.src || null });
      setPos({
        x: Math.min(e.clientX, window.innerWidth - 230),
        y: Math.min(e.clientY, window.innerHeight - 400),
      });
      setOpen(true);
      e.preventDefault();
    };
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('contextmenu', onCtx);
    document.addEventListener('click', onClick);
    window.addEventListener('blur', () => setOpen(false));
    return () => { document.removeEventListener('contextmenu', onCtx); document.removeEventListener('click', onClick); };
  }, []);

  useEffect(() => {
    if (open && menuRef.current) {
      const r = menuRef.current.getBoundingClientRect();
      if (r.bottom > window.innerHeight) setPos((p) => ({ ...p, y: Math.max(8, window.innerHeight - r.height - 10) }));
      if (r.right > window.innerWidth) setPos((p) => ({ ...p, x: Math.max(8, window.innerWidth - r.width - 10) }));
    }
  }, [open, pos]);

  const run = (fn: () => void) => () => { setOpen(false); fn(); };
  const toggleScheme = () => {
    const next = scheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-scheme', next);
    localStorage.setItem('color-scheme', next);
  };
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const goPrev = () => (document.querySelector('.prev-next a.prev') as HTMLAnchorElement | null)?.click();
  const goNext = () => (document.querySelector('.prev-next a.next') as HTMLAnchorElement | null)?.click();
  const copyText = (t: string) => navigator.clipboard.writeText(t);
  const readMode = () => document.documentElement.classList.toggle('reading');

  const items: Item[] = [
    { kind: 'item', ico: '⧉', label: '复制选中文本', act: () => copyText(ctx.selection), disabled: !ctx.selection },
    { kind: 'item', ico: '🔎', label: '站内搜索选中词', act: () => {
        window.dispatchEvent(new CustomEvent('open-search'));
        window.setTimeout(() => window.dispatchEvent(new CustomEvent('search-fill', { detail: ctx.selection })), 80);
      }, disabled: !ctx.selection },
    { kind: 'item', ico: '🌐', label: 'Bing 搜索', act: () => window.open('https://www.bing.com/search?q=' + encodeURIComponent(ctx.selection), '_blank'), disabled: !ctx.selection },
    { kind: 'sep' },
    { kind: 'item', ico: '←', label: '后退', act: () => history.back() },
    { kind: 'item', ico: '→', label: '前进', act: () => history.forward() },
    { kind: 'item', ico: '⟳', label: '刷新', act: () => location.reload() },
    { kind: 'item', ico: '↑', label: '回顶部', act: scrollTop },
    { kind: 'sep' },
    ...(ctx.inInput ? [
      { kind: 'item', ico: '📋', label: '粘贴', act: () => navigator.clipboard.readText().then((t) => {
          const el = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
          if (el) { const s = el.selectionStart ?? el.value.length; el.value = el.value.slice(0, s) + t + el.value.slice(el.selectionEnd ?? s); }
        }) } as Item,
      { kind: 'item', ico: '✂️', label: '剪切选中', act: () => { const el = document.activeElement as HTMLInputElement; const s = el.selectionStart ?? 0, e = el.selectionEnd ?? 0; copyText(el.value.slice(s, e)); el.value = el.value.slice(0, s) + el.value.slice(e); } } as Item,
      { kind: 'sep' } as Item,
    ] : []),
    ...(ctx.img ? [
      { kind: 'item', ico: '🖼', label: '复制图片地址', act: () => copyText(ctx.img!) } as Item,
      { kind: 'item', ico: '🔬', label: 'Google 识图', act: () => window.open('https://lens.google.com/uploadbyurl?url=' + encodeURIComponent(ctx.img!), '_blank') } as Item,
      { kind: 'sep' } as Item,
    ] : []),
    ...(ctx.href ? [
      { kind: 'item', ico: '🔗', label: '复制链接地址', act: () => copyText(ctx.href!) } as Item,
      { kind: 'item', ico: '↗', label: '新标签页打开', act: () => window.open(ctx.href!, '_blank') } as Item,
      { kind: 'sep' } as Item,
    ] : []),
    { kind: 'item', ico: '⏮', label: '上一篇', act: goPrev, disabled: !nav.prev },
    { kind: 'item', ico: '⏭', label: '下一篇', act: goNext, disabled: !nav.next },
    { kind: 'sep' },
    { kind: 'item', ico: '🖨', label: '打印模式', act: () => window.print() },
    { kind: 'item', ico: '📖', label: '阅读模式', act: readMode },
    { kind: 'item', ico: scheme === 'dark' ? '☀️' : '🌙', label: scheme === 'dark' ? '亮色模式' : '暗色模式', act: toggleScheme },
    { kind: 'sep' },
    { kind: 'item', ico: '📮', label: '联系我', act: () => (location.href = '/faqs/') },
    { kind: 'item', ico: '👤', label: '关于站主', act: () => (location.href = '/about/') },
    { kind: 'item', ico: '🏠', label: '本站源码', act: () => window.open('https://github.com/kinghaonan/kinghaonan.github.io', '_blank') },
  ];

  return (
    <div
      ref={menuRef}
      className={`rightmenu${open ? ' is-open' : ''}`}
      style={{ left: pos.x, top: pos.y }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((it, i) =>
        it.kind === 'sep' ? (
          <div className="rm-sep" key={i} />
        ) : (
          <button className="rm-item" key={i} disabled={it.disabled} onClick={run(it.act)}>
            <span className="ico" aria-hidden><RmIcon name={it.ico} /></span>
            {it.label}
          </button>
        )
      )}
    </div>
  );
}
