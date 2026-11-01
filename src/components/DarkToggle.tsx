import { useEffect, useState } from 'react';

const Sun = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);
const Moon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export default function DarkToggle() {
  const [scheme, setScheme] = useState<'light' | 'dark'>(
    (typeof document !== 'undefined' &&
      (document.documentElement.getAttribute('data-scheme') as 'light' | 'dark')) || 'light'
  );

  useEffect(() => {
    setScheme((document.documentElement.getAttribute('data-scheme') as 'light' | 'dark') || 'light');
    const obs = new MutationObserver(() => {
      setScheme((document.documentElement.getAttribute('data-scheme') as 'light' | 'dark') || 'light');
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-scheme'] });
    return () => obs.disconnect();
  }, []);

  return (
    <button
      className="icon-btn"
      title={scheme === 'dark' ? '切换亮色模式' : '切换暗色模式'}
      onClick={() => {
        const next = scheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-scheme', next);
        localStorage.setItem('color-scheme', next);
      }}
      aria-label="切换暗色模式"
    >
      {scheme === 'dark' ? <Sun /> : <Moon />}
    </button>
  );
}
