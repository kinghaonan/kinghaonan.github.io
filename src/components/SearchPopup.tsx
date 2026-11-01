import { useEffect, useRef, useState } from 'react';

type SearchDoc = {
  title: string;
  url: string;
  date?: string;
  excerpt?: string;
  text: string;
  type: 'post' | 'page';
  tags?: string[];
  categories?: string[];
};

let cache: SearchDoc[] | null = null;
async function loadDocs(): Promise<SearchDoc[]> {
  if (cache) return cache;
  const res = await fetch('/content.json');
  const json = await res.json();
  cache = [...(json.posts || []), ...(json.pages || [])];
  return cache;
}

function excerptAround(text: string, q: string, len = 90) {
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return text.slice(0, len);
  const start = Math.max(0, i - 30);
  return (start > 0 ? '…' : '') + text.slice(start, start + len) + '…';
}

function highlight(text: string, q: string) {
  const esc = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${esc})`, 'gi'));
  return parts.map((p, i) =>
    p.toLowerCase() === q.toLowerCase() ? <mark key={i}>{p}</mark> : <span key={i}>{p}</span>
  );
}

export default function SearchPopup() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<SearchDoc[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const openHandler = () => { setOpen(true); };
    window.addEventListener('open-search', openHandler);
    const keyHandler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen(true); }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', keyHandler);
    return () => { window.removeEventListener('open-search', openHandler); window.removeEventListener('keydown', keyHandler); };
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 60);
    else { setQ(''); setResults(null); }
  }, [open]);

  useEffect(() => {
    const query = q.trim();
    if (!query) { setResults(null); return; }
    let alive = true;
    loadDocs().then((docs) => {
      if (!alive) return;
      const lq = query.toLowerCase();
      const hits = docs
        .filter((d) => d.title.toLowerCase().includes(lq) || d.text.toLowerCase().includes(lq) || (d.tags || []).some((t) => t.toLowerCase().includes(lq)))
        .slice(0, 12);
      setResults(hits);
    });
    return () => { alive = false; };
  }, [q]);

  return (
    <>
      <div className={`overlay-mask${open ? ' is-open' : ''}`} onClick={() => setOpen(false)} />
      <div className={`search-popup${open ? ' is-open' : ''}`} role="dialog" aria-label="站内搜索">
        <div className="search-bar">
          <span aria-hidden>🔍</span>
          <input
            ref={inputRef}
            value={q}
            placeholder="搜索文章…"
            onChange={(e) => setQ(e.target.value)}
          />
          <span className="hint">ESC 关闭</span>
        </div>
        <div className="results">
          {q.trim() && results && results.length === 0 && <div className="empty">没有找到相关内容</div>}
          {results && results.map((r) => (
            <a key={r.url} className="result" href={r.url} onClick={() => setOpen(false)}>
              <div className="r-title">{highlight(r.title, q.trim())}</div>
              <div className="r-excerpt">{highlight(excerptAround(r.text, q.trim()), q.trim())}</div>
            </a>
          ))}
          {!q.trim() && <div className="empty">输入关键词，检索全部 31 篇文章</div>}
        </div>
      </div>
    </>
  );
}
