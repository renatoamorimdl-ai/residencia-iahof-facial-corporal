(function () {
  'use strict';

  // ===== Configuração do WhatsApp =====
  var WA_NUMBER = '5581991728950'; // (81) 99172-8950
  var DEFAULT_MSG = 'Olá! Quero informações sobre a Residência em Harmonização Facial e Corporal do IAHOF.';

  document.documentElement.classList.add('js');

  // Repassa UTMs da URL para a mensagem (ajuda a identificar a origem do lead no atendimento)
  function originTag() {
    try {
      var p = new URLSearchParams(window.location.search);
      var src = p.get('utm_source');
      var camp = p.get('utm_campaign');
      if (!src && !camp) return '';
      return '\n\n[origem: ' + [src, camp].filter(Boolean).join(' / ') + ']';
    } catch (e) { return ''; }
  }

  function waLink(msg) {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent((msg || DEFAULT_MSG) + originTag());
  }

  document.querySelectorAll('.js-wa').forEach(function (el) {
    el.setAttribute('href', waLink(el.getAttribute('data-msg')));
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
    el.addEventListener('click', function () {
      var cta = el.getAttribute('data-cta') || 'cta';
      try { if (typeof window.fbq === 'function') window.fbq('track', 'Contact', { content_name: 'Residencia IAHOF', cta: cta }); } catch (e) {}
      try { if (typeof window.gtag === 'function') window.gtag('event', 'whatsapp_click', { cta: cta }); } catch (e) {}
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'whatsapp_click', cta: cta });
    });
  });

  // ===== Reveal on scroll =====
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  // ===== Meta Pixel: ViewContent ao ver a seção de investimento (1x por visita) =====
  var priceSec = document.getElementById('investimento');
  if (priceSec && 'IntersectionObserver' in window) {
    var po = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        try { if (typeof window.fbq === 'function') window.fbq('track', 'ViewContent', { content_name: 'Residencia IAHOF - Investimento' }); } catch (e) {}
        po.disconnect();
      }
    }, { threshold: 0.25 });
    po.observe(priceSec);
  }

  // ===== Header + botão flutuante =====
  var topbar = document.getElementById('topbar');
  var float = document.querySelector('.wa-float');
  var final = document.getElementById('inscricao');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    topbar.classList.toggle('is-scrolled', y > 40);
    var nearEnd = final && final.getBoundingClientRect().top < window.innerHeight * 0.6;
    float.classList.toggle('is-visible', y > window.innerHeight * 0.7 && !nearEnd);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  var yEl = document.getElementById('year');
  if (yEl) yEl.textContent = new Date().getFullYear();
})();
