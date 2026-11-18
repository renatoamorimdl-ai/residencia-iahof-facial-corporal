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

## Leads na planilha (Google Sheets)
Todo botão de WhatsApp abre um formulário (Nome + WhatsApp). Ao enviar, os dados vão para a planilha
**Leads IAHOF - Residência Facial e Corporal** e a pessoa é levada à conversa no WhatsApp com o nome já na mensagem.
Quem já preencheu no mesmo aparelho vai direto para o WhatsApp nos próximos cliques.

Colunas: Data/Hora · Nome · Telefone · Botão clicado · utm_source · utm_medium · utm_campaign · utm_content · utm_term · Página

### Ativar a gravação (uma vez)
1. Abra a planilha → **Extensões → Apps Script**.
2. Apague o conteúdo e cole o arquivo `google-apps-script/Code.gs`. Salve.
3. **Implantar → Nova implantação** → tipo **App da Web**.
   - Executar como: **Eu** · Quem pode acessar: **Qualquer pessoa** → Implantar e autorizar.
4. Copie a URL que termina em `/exec` e cole em `LEADS_ENDPOINT` no início de `assets/js/script.js`.

Eventos: `Lead` (Meta Pixel) e `lead_form_submit` (dataLayer) no envio do formulário; `Contact` ao seguir para o WhatsApp.
