# Residência em Harmonização Facial e Corporal — IAHOF

Landing page estática (HTML + CSS + JS puro, sem build) para captação de matrículas via WhatsApp.

## Estrutura
```
index.html            página
assets/css/style.css  estilos (paleta e tipografia da campanha)
assets/js/script.js   links do WhatsApp, rastreamento e animações de scroll
assets/img/           logo, fotos e casos
vercel.json           URLs limpas + cache dos assets
```

## Publicar (GitHub + Vercel)
1. Crie o repositório `residencia-iahof-facial-corporal` no GitHub e envie estes arquivos.
2. Na Vercel: **Add New → Project → Import** o repositório.
   - Framework Preset: **Other** · Build Command: vazio · Output Directory: `./`
   - Project Name: `residencia-iahof-facial-corporal` → URL `https://residencia-iahof-facial-corporal.vercel.app`
3. Domínio próprio (opcional): Settings → Domains.

## Ajustes rápidos
- **WhatsApp**: `WA_NUMBER` em `assets/js/script.js`. Cada botão tem a própria mensagem em `data-msg` no HTML.
- **UTMs**: se a URL tiver `utm_source`/`utm_campaign`, a origem é anexada à mensagem do WhatsApp.
- **Meta Pixel** (ID 567992274670139) já instalado no `<head>`: PageView em toda visita, `Contact` em cada clique de WhatsApp e `ViewContent` quando a seção de investimento aparece. GTM/GA4: cole no `<head>`; os cliques também vão para `gtag('event','whatsapp_click')` e `dataLayer`.
