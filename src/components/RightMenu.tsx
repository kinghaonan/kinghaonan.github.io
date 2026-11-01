import { useEffect, useRef, useState } from 'react';

/**
 * 全功能右键菜单 — 对齐 Volantis rightmenus 功能面
 * 导航 / 打印 / 阅读模式 / 输入框操作 / 选区搜索 / 元素与图片 / 上下篇 / 暗色 / 链接 / 音乐
 */
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
            <span className="ico" aria-hidden>{it.ico}</span>
            {it.label}
          </button>
        )
      )}
    </div>
  );
}
