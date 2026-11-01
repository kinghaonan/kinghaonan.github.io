/**
 * 原生液态玻璃 — 按 liquid-glass-react（rdev, MIT）的核心技术原理实现：
 *   SVG 位移折射滤镜 + backdrop-filter(饱和/模糊) + 半透明底/边缘高光
 * 注：原 npm 包在"静态多页 + React islands"架构下内部定位层错位（实测），故原生实现。
 * - Chrome：完整折射；Safari / Firefox / 低端设备：自动降级为磨砂玻璃（默认 .card/.glass 外观）
 * - 排除 .post-wrap：几万像素高的正文层有合成极限
 */
(function () {
  'use strict';
  if (window.__liquidGlass) return;
  window.__liquidGlass = true;

  var TARGETS = '.card:not(.post-wrap), .navbar, .cover-dock, .search-popup, .toast';

  function apply() {
    var supportsUrlBackdrop = false;
    try {
      supportsUrlBackdrop = window.CSS &&
        CSS.supports('backdrop-filter', 'url(#liquid-glass-distortion)');
    } catch (e) {}

    var lowEnd = (navigator.hardwareConcurrency || 8) <= 4 ||
                 (navigator.deviceMemory || 8) <= 4;

    if (!supportsUrlBackdrop || lowEnd) {
      document.documentElement.classList.add('liquid-glass-fallback');
      return;
    }

    // 位移折射贴图：低频分形噪声经模糊后驱动 feDisplacementMap，
    // 产生平滑的水波式折射（与全站水效主题呼应），对应原库 displacementScale
    var DISPLACEMENT = 22;
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'liquid-glass-defs');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.style.position = 'absolute';
    svg.style.width = '0';
    svg.style.height = '0';
    svg.innerHTML =
      '<defs>' +
      '<filter id="liquid-glass-distortion" x="-20%" y="-20%" width="140%" height="140%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.006 0.009" numOctaves="2" seed="7" result="noise"/>' +
      '<feGaussianBlur in="noise" stdDeviation="1.6" result="map"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="map" scale="' + DISPLACEMENT + '" xChannelSelector="R" yChannelSelector="G"/>' +
      '</filter>' +
      '</defs>';
    document.body.appendChild(svg);

    var nodes = document.querySelectorAll(TARGETS);
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].classList.add('has-liquid-glass');
    }
    document.documentElement.classList.add('liquid-glass-on');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})();
