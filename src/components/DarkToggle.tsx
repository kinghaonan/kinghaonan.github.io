import { useEffect, useState } from 'react';

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
      {scheme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
