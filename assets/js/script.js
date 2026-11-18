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

  // ===== Captura de lead → planilha Google → WhatsApp =====
  // URL do App da Web do Google Apps Script (ver README, seção "Leads na planilha").
  // Enquanto estiver vazia, o formulário funciona e leva ao WhatsApp, mas não grava na planilha.
  var LEADS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwNALlmzJxBVfaW-xWcY2HI02Hr_a-CPrXt20pJ-ff8Tkauq8BO22V2OL8W81elXBI9/exec';

  var modal = document.getElementById('lead-modal');
  var form = document.getElementById('lead-form');
  var fName = document.getElementById('lead-nome');
  var fPhone = document.getElementById('lead-telefone');
  var fErr = document.getElementById('lead-erro');
  var pending = { msg: DEFAULT_MSG, cta: 'cta' };
  var lastFocus = null;

  function track(cta) {
    try { if (typeof window.fbq === 'function') window.fbq('track', 'Contact', { content_name: 'Residencia IAHOF', cta: cta }); } catch (e) {}
    try { if (typeof window.gtag === 'function') window.gtag('event', 'whatsapp_click', { cta: cta }); } catch (e) {}
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'whatsapp_click', cta: cta });
  }

  function savedLead() {
    try { return JSON.parse(localStorage.getItem('iahof_lead') || 'null'); } catch (e) { return null; }
  }

  function goWhatsApp(url) {
    var w = null;
    try { w = window.open(url, '_blank'); if (w) w.opener = null; } catch (e) {}
    if (!w) window.location.href = url;   // pop-up bloqueado: abre na mesma aba
  }

  function personalize(msg, nome) {
    var first = (nome || '').trim().split(/\s+/)[0];
    return first ? msg.replace(/^Olá!/, 'Olá! Meu nome é ' + first + '.') : msg;
  }

  function openModal(cta, msg) {
    pending = { cta: cta, msg: msg };
    lastFocus = document.activeElement;
    fErr.textContent = '';
    modal.hidden = false;
    document.body.classList.add('modal-open');
    requestAnimationFrame(function () { modal.classList.add('is-open'); });
    setTimeout(function () { fName.focus(); }, 60);
  }

  function closeModal() {
    modal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    setTimeout(function () { modal.hidden = true; }, 250);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.querySelectorAll('.js-wa').forEach(function (el) {
    el.setAttribute('href', waLink(el.getAttribute('data-msg')));  // fallback sem JS
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
    el.addEventListener('click', function (ev) {
      var cta = el.getAttribute('data-cta') || 'cta';
      var msg = el.getAttribute('data-msg') || DEFAULT_MSG;
      var lead = savedLead();
      if (lead && lead.nome) {               // já deixou os dados nesta visita/aparelho
        ev.preventDefault();
        track(cta);
        goWhatsApp(waLink(personalize(msg, lead.nome)));
        return;
      }
      ev.preventDefault();
      openModal(cta, msg);
    });
  });

  // Máscara (81) 99999-9999
  fPhone.addEventListener('input', function () {
    var d = fPhone.value.replace(/\D/g, '');
    if (d.length > 11 && d.indexOf('55') === 0) d = d.slice(2);
    d = d.slice(0, 11);
    var out = d;
    if (d.length > 2) out = '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length > 7) out = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(-4);
    fPhone.value = out;
  });

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var nome = fName.value.trim().replace(/\s+/g, ' ');
    var digits = fPhone.value.replace(/\D/g, '');
    if (nome.length < 2) { fErr.textContent = 'Informe seu nome.'; fName.focus(); return; }
    if (digits.length < 10 || digits.length > 11) { fErr.textContent = 'Informe um WhatsApp válido com DDD.'; fPhone.focus(); return; }

    var p = new URLSearchParams(window.location.search);
    var data = {
      nome: nome,
      telefone: fPhone.value,
      cta: pending.cta,
      utm_source: p.get('utm_source') || '',
      utm_medium: p.get('utm_medium') || '',
      utm_campaign: p.get('utm_campaign') || '',
      utm_content: p.get('utm_content') || '',
      utm_term: p.get('utm_term') || '',
      pagina: window.location.href.split('#')[0],
      website: form.website.value   // honeypot
    };

    if (LEADS_ENDPOINT) {
      try {
        fetch(LEADS_ENDPOINT, {
          method: 'POST', mode: 'no-cors', keepalive: true,
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(data)
        }).catch(function () {});
      } catch (e) {}
    }

    try { localStorage.setItem('iahof_lead', JSON.stringify({ nome: nome })); } catch (e) {}
    try { if (typeof window.fbq === 'function') window.fbq('track', 'Lead', { content_name: 'Residencia IAHOF', cta: pending.cta }); } catch (e) {}
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'lead_form_submit', cta: pending.cta });
    track(pending.cta);

    goWhatsApp(waLink(personalize(pending.msg, nome)));
    form.reset();
    closeModal();
  });

  modal.addEventListener('click', function (ev) {
    if (ev.target.hasAttribute('data-close')) closeModal();
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && !modal.hidden) closeModal();
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
