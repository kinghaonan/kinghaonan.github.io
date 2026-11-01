/**
 * 主题脚本：壁纸轮换(联动水效) / 暗色初始化 / 返回顶部 / TOC scrollspy /
 * tabs 交互 / 代码复制 / 复制版权 / 搜索联动 / 液态玻璃挂载
 */
import './liquid-glass.js';
(function () {
  'use strict';

  /* ---- 暗色初始化（首帧前需运行：本脚本放 head 执行） ---- */
  var saved = localStorage.getItem('color-scheme');
  var sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  var scheme = saved || (sysDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-scheme', scheme);

  window.addEventListener('DOMContentLoaded', function () {
    /* ---- 壁纸轮换（17 张，12s，派发事件供水效交叉溶解） ---- */
    var wallpapers = [];
    for (var i = 1; i <= 12; i++) wallpapers.push('/image/bg/cover-' + (i < 10 ? '0' + i : i) + '.jpg');
    var order = wallpapers.slice();
    for (var j = order.length - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1));
      var t = order[j]; order[j] = order[k]; order[k] = t;
    }
    var idx = 0;
    document.documentElement.style.backgroundImage = 'url("' + order[0] + '")';
    window.dispatchEvent(new CustomEvent('wallpaper:change', { detail: { src: order[0] } }));
    setInterval(function () {
      idx = (idx + 1) % order.length;
      document.documentElement.style.backgroundImage = 'url("' + order[idx] + '")';
      window.dispatchEvent(new CustomEvent('wallpaper:change', { detail: { src: order[idx] } }));
    }, 12000);

    /* ---- 返回顶部 ---- */
    var backtop = document.querySelector('.backtop');
    if (backtop) {
      window.addEventListener('scroll', function () {
        backtop.classList.toggle('is-show', window.scrollY > 480);
      }, { passive: true });
      backtop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }

    /* ---- TOC scrollspy ---- */
    var tocLinks = Array.prototype.slice.call(document.querySelectorAll('.toc-widget a[href^="#"]'));
    if (tocLinks.length) {
      var heads = tocLinks.map(function (a) { return document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1))); });
      var spy = function () {
        var cur = -1;
        for (var m = 0; m < heads.length; m++) {
          if (heads[m] && heads[m].getBoundingClientRect().top < 100) cur = m;
        }
        tocLinks.forEach(function (a, n) { a.classList.toggle('is-active', n === cur); });
      };
      window.addEventListener('scroll', spy, { passive: true });
      spy();
    }

    /* ---- v-tabs 点击切换 ---- */
    document.querySelectorAll('.v-tabs').forEach(function (tabs) {
      tabs.addEventListener('click', function (e) {
        var btn = e.target.closest('.v-tabs-tab');
        if (!btn) return;
        var i = btn.getAttribute('data-vtab');
        tabs.querySelectorAll('.v-tabs-tab').forEach(function (b) { b.classList.toggle('is-active', b === btn); });
        tabs.querySelectorAll('.v-tabs-pane').forEach(function (p) { p.classList.toggle('is-active', p.getAttribute('data-vtab-pane') === i); });
      });
    });

    /* ---- 折叠面板内代码块复制（事件委托） ---- */
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.copy-code');
      if (!btn) return;
      var pre = btn.closest('pre');
      var code = pre && pre.querySelector('code');
      if (code) {
        navigator.clipboard.writeText(code.innerText).then(function () {
          btn.textContent = '已复制';
          setTimeout(function () { btn.textContent = '复制'; }, 1200);
        });
      }
    });

    /* ---- 复制版权（>30 字符时附加声明 + toast） ---- */
    var toast = document.querySelector('.toast');
    var toastTimer = null;
    function showToast(msg) {
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add('is-show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toast.classList.remove('is-show'); }, 2200);
    }
    document.addEventListener('copy', function () {
      var sel = (window.getSelection() || '').toString();
      if (sel.length > 30) {
        showToast('已复制，转载请注明出处（CC BY-NC-SA 4.0）');
      }
    });

    /* ---- 右键菜单搜索联动 ---- */
    window.addEventListener('search-fill', function (e) {
      var input = document.querySelector('.search-popup input');
      if (input) {
        input.value = e.detail || '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    /* ---- APlayer/MetingJS 失败自动隐藏（歌单拉取失败时会出现空壳压住页脚） ---- */
    var metingEl = document.querySelector('meting-js');
    if (metingEl) {
      var metingChecks = 0;
      var metingTimer = setInterval(function () {
        metingChecks += 1;
        var ap = metingEl.aplayer;
        if (ap) {
          clearInterval(metingTimer);
          var hideIfBroken = function () {
            var audios = (ap.list && ap.list.audios) || [];
            if (!audios.length) metingEl.style.display = 'none';
          };
          hideIfBroken();
          if (typeof ap.on === 'function') ap.on('error', function () {
            metingEl.style.display = 'none';
          });
          return;
        }
        // 超时仍未初始化（API 完全不可达）
        if (metingChecks > 20 && !metingEl.querySelector('.aplayer-body')) {
          clearInterval(metingTimer);
          metingEl.style.display = 'none';
        }
      }, 500);
      setTimeout(function () { clearInterval(metingTimer); }, 15000);
    }

    /* ---- busuanzi ---- */
    var bs = document.createElement('script');
    bs.src = 'https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.minicount.js';
    bs.async = true;
    document.body.appendChild(bs);
  });
})();
