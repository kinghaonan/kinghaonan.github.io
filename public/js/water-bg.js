/**
 * 水效背景 — 基于 Paper Design "Water" shader(@paper-design/shaders,Apache-2.0)
 * 将焦散波光叠加在现有壁纸系统之上:
 *   html CSS 背景(兜底) < parallax 镜像(z-index:-100) < 水效 canvas(z-index:-99) < 页面内容
 * - 壁纸切换由主题脚本派发的 `wallpaper:change` 事件驱动,
 *   在 shader 内部对双纹理做交叉溶解,过渡期间水波扭曲场保持连续
 * - WebGL 失败 / 低端设备 / 减少动态偏好时优雅降级到原有 CSS 壁纸
 */
(function () {
  'use strict';
  if (window.__waterBg) return;
  window.__waterBg = true;

  var P = window.PaperShaders;
  if (!P || typeof P.ShaderMount !== 'function') return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isSmall = window.matchMedia('(max-width: 768px)').matches;
  var lowEnd = (navigator.hardwareConcurrency || 8) <= 2 ||
               (navigator.deviceMemory || 8) <= 2;
  if (lowEnd) return;

  // 幂等：已有挂载（含 canvas）则跳过；已有空壳则复用
  var existing = document.getElementById('water-bg');
  if (existing && existing.querySelector('canvas')) return;
  var host = existing || document.createElement('div');
  if (!existing) {
    host.id = 'water-bg';
    host.setAttribute('aria-hidden', 'true');
    document.body.appendChild(host);
  }

  var mount = null;
  var mixRaf = null;
  var pendingImg = null; // 进行中过渡的目标图

  // 给官方 shader 打补丁:加入 u_image2 / u_mix 两个 uniform,
  // 两张壁纸在同一扭曲场中交叉溶解(GLSL 字符串手术,版本锁定 0.0.82)
  var frag = P.waterFragmentShader
    .replace(
      'uniform sampler2D u_image;\nuniform float u_imageAspectRatio;',
      'uniform sampler2D u_image;\nuniform sampler2D u_image2;\nuniform float u_mix;\nuniform float u_imageAspectRatio;'
    )
    .replace(
      'vec4 image = texture(u_image, imageUV);',
      'vec4 image = mix(texture(u_image, imageUV), texture(u_image2, imageUV), u_mix);'
    );
  if (frag.indexOf('u_image2') === -1) return; // 版本不匹配 → CSS 壁纸兜底

  var CROSSFADE_MS = 1400;

  function colorToVec4(hex, alpha) {
    var c = P.getShaderColorFromString(hex).slice();
    c[3] = alpha;
    return c;
  }

  function currentWallpaper() {
    var m = (document.documentElement.style.backgroundImage || '').match(/url\(["']?(.+?)["']?\)/);
    return m ? m[1] : '/image/bg/cover-01.jpg';
  }

  function loadTexture(src, cb) {
    var img = new Image();
    img.onload = function () { cb(img, img.naturalWidth / (img.naturalHeight || 1)); };
    img.onerror = function () {
      console.warn('[water-bg] 壁纸图片加载失败:', src);
      window.__waterDiag = { stage: 'imgFail', src: src };
      cb(null, 1);
    };
    img.src = src;
  }

  function mountShader(src) {
    loadTexture(src, function (img, aspect) {
      if (!img || mount) return; // 图片失败 → CSS 壁纸兜底
      try {
        mount = new P.ShaderMount(
          host,
          frag,
          {
            u_image: img,
            u_image2: img,
            u_mix: 0,
            u_imageAspectRatio: aspect,
            u_colorBack: colorToVec4('#8f8f8f', 1),
            u_colorHighlight: colorToVec4('#ffffff', 1),
            u_highlights: 0.10,
            u_layering: 0.0,
            u_edges: 0.0,
            u_waves: 0.05,
            u_caustic: 0.02,
            u_size: 1.0,
            u_fit: P.ShaderFitOptions.cover,
            u_scale: 1,
            u_rotation: 0,
            u_originX: 0.5,
            u_originY: 0.5,
            u_offsetX: 0,
            u_offsetY: 0,
            u_worldWidth: 0,
            u_worldHeight: 0
          },
          undefined,
          reducedMotion ? 0 : 0.52,        // speed:慢速流动
          0,                                // frame
          isSmall ? 1.25 : 2,               // minPixelRatio
          isSmall ? 1200000 : 2600000,      // maxPixelCount
          ['u_image', 'u_image2']
        );
        host.classList.add('is-ready');
        window.__waterDiag = { stage: 'ok' };
      } catch (e) {
        console.warn('[water-bg] WebGL 初始化失败，回退 CSS 壁纸:', e && e.message);
        window.__waterDiag = { stage: 'glFail', err: String(e && e.message) };
        host.remove(); // WebGL 不可用 → CSS 壁纸兜底
      }
    });
  }

  // 壁纸切换:新图装入 u_image2,把 u_mix 从 0 缓动到 1 完成交叉溶解
  function swapWallpaper(src) {
    if (!mount || !src) return;
    loadTexture(src, function (img, aspect) {
      if (!img || !mount) return;
      if (mixRaf) { // 上一轮过渡未完成:先定格到其目标图
        cancelAnimationFrame(mixRaf);
        mixRaf = null;
        if (pendingImg) {
          try { mount.setUniforms({ u_image: pendingImg, u_mix: 0 }); } catch (e) { /* 忽略 */ }
        }
      }
      pendingImg = img;
      if (reducedMotion) { // 减少动态:直接切图,不做动画
        try { mount.setUniforms({ u_image: img, u_imageAspectRatio: aspect, u_mix: 0 }); } catch (e) { /* 忽略 */ }
        pendingImg = null;
        return;
      }
      try {
        mount.setUniforms({ u_image2: img, u_imageAspectRatio: aspect, u_mix: 0 });
      } catch (e) { pendingImg = null; return; }
      var t0 = performance.now();
      (function step(now) {
        if (!mount || !pendingImg) { mixRaf = null; return; }
        var p = Math.min(1, (now - t0) / CROSSFADE_MS);
        var e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; // easeInOutQuad
        try { mount.setUniforms({ u_mix: e }); } catch (err) { mixRaf = null; pendingImg = null; return; }
        if (p < 1) {
          mixRaf = requestAnimationFrame(step);
        } else {
          mount.setUniforms({ u_image: pendingImg, u_mix: 0 });
          pendingImg = null;
          mixRaf = null;
        }
      })(t0);
    });
  }

  window.addEventListener('wallpaper:change', function (e) {
    if (e.detail && e.detail.src) swapWallpaper(e.detail.src);
  });

  // 挂载（失败自动重试一次：首帧图片偶发加载失败时兜底）
  var retried = false;
  function tryMount() {
    var before = mount;
    mountShader(currentWallpaper());
    setTimeout(function () {
      if (!mount && !retried) {
        retried = true;
        mount = before;
        console.warn('[water-bg] 首次挂载未完成，重试…');
        tryMount();
      }
    }, 2500);
  }
  tryMount();
})();
