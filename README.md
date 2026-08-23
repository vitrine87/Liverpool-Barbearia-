# Liverpool Barbearia — site institucional

React + Tailwind + GSAP + Supabase, sem bundler (React/Tailwind/GSAP via CDN,
`htm` no lugar de JSX). Roda direto abrindo os `.html` num servidor estático —
nenhum passo de build necessário, compatível com edição no Spck Editor.

**Sem import map.** Cada módulo importa suas dependências (React, GSAP,
Supabase, htm) direto pela URL completa do `esm.sh`, todas fixadas na mesma
versão (ex.: `https://esm.sh/react@18.3.1`), então o cache de módulos do
navegador já deduplica sozinho pela URL — não precisa de `<script
type="importmap">`. Isso foi proposital: alguns WebViews mobile usados como
preview em editores de código (ex.: o preview interno do Spck Editor) ainda
não suportam import maps, e falham silenciosamente sem erro no console. Se o
preview do editor continuar em branco mesmo assim, teste a URL do preview no
Chrome do celular, ou publique num host real (Netlify/Vercel/GitHub Pages) —
o navegador de quem acessa o site publicado não tem essa limitação.

## Estrutura

```
index.html          → site público (Header, Hero, About, Carrossel, Preços,
                       Contato, Depoimentos, CTA final, Footer)
admin.html           → painel administrativo (restrito a role = 'admin')
consulta.html        → consulta pública de agendamento (nome + telefone)

src/
  siteConfig.js      → EDITE AQUI: nome, telefone, endereço, horários, preços,
                       depoimentos — sem precisar mexer em componente nenhum
  lib/
    html.js          → htm ligado ao React.createElement (JSX sem build step)
    supabaseClient.js
  hooks/
    useScrollReveal.js        → entrada suave de texto (fade + Y curto, stagger)
    useScrollFrameSequence.js → sequência de frames em canvas reativa ao scroll (não usa <video>)
    usePrefersReducedMotion.js
  context/AuthContext.js      → sessão Supabase + role (admin/client)
  components/                 → seções do site público + BookingModal + LampLogin
  components/admin/           → dashboard, tabela de agendamentos, upload de fotos
  pages/AdminApp.js           → guarda de rota (client-side; RLS garante no backend)
  pages/BookingLookupPage.js
  main.js / main-admin.js / main-consulta.js → um entry point por página

supabase/schema.sql  → tabelas, RLS, função de consulta pública, buckets
_headers             → security headers para Netlify
vercel.json          → security headers para Vercel
```

## 1. Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Abra **SQL Editor** e rode o conteúdo de `supabase/schema.sql` (cria
   tabelas, RLS, buckets e a função `consultar_agendamento`).
3. Em **Authentication > Providers**, habilite Email e Google.
4. Depois que a conta do dono da barbearia se cadastrar uma vez, torne-a
   admin rodando no SQL Editor:
   ```sql
   update public.profiles set role = 'admin' where email = 'DONO@EXEMPLO.COM';
   ```
5. Em **Project Settings > API**, copie a **Project URL** e a **anon public key**.

## 2. Colocar as chaves do Supabase

Cole a URL e a anon key em **três arquivos** (cada página tem seu próprio
bloco, já que não há um `.env` sem build step):

- `index.html`
- `admin.html`
- `consulta.html`

Em cada um, procure:

```html
<script>
  window.__SUPABASE_CONFIG__ = {
    url: "https://YOUR-PROJECT.supabase.co",
    anonKey: "YOUR-SUPABASE-ANON-KEY",
  };
</script>
```

⚠️ **Nunca** cole a `service_role key` aqui — só a `anon public key`. A anon
key é segura de expor no frontend porque toda a segurança real está nas
políticas de RLS do banco.

## 3. Substituir os assets de exemplo

Coloque os arquivos reais nestes caminhos (os componentes já apontam pra eles):

- `assets/frames/frame-001.jpg` … `frame-060.jpg` — sequência de imagens que
  compõe o vídeo de fundo (ver "Vídeo de fundo" abaixo para gerar a sua)
- `assets/img/hero-poster.jpg` — aparece enquanto os frames carregam
- `assets/img/interior.jpg` — foto da seção Sobre e do CTA final
- `assets/carrossel/1.jpg` … `8.jpg` — fallback do carrossel (some assim que
  o admin subir fotos reais pelo painel, que vão para o bucket
  `carrossel-fotos`)

### Vídeo de fundo (sequência de frames, não um arquivo de vídeo)

O fundo reativo ao scroll não usa uma tag `<video>` — ele desenha uma
sequência de imagens (`assets/frames/frame-NNN.jpg`) num `<canvas>`, trocando
de frame conforme a posição do scroll. Isso existe porque `video.currentTime`
exige uma decodificação real a cada busca, o que engasga em hardware mais
fraco mesmo com keyframes frequentes; um frame de canvas já está decodificado,
então o desenho é instantâneo em qualquer aparelho.

Para trocar pelo vídeo real da barbearia, com `ffmpeg` instalado:

```bash
ffmpeg -i seu-video.mp4 -vf "fps=4,scale=720:-2" -q:v 5 assets/frames/frame-%03d.jpg
```

- `fps=4` → ~60 frames pra um vídeo de 15s (ajuste a duração de origem à
  vontade; o número de frames só precisa bater com `FRAME_COUNT` em
  `src/components/BackgroundVideo.js`)
- `scale=720:-2` → 720px de largura é suficiente pra um plano de fundo; não
  vale a pena ir maior, só aumenta o tamanho total baixado
- Gere também um `assets/img/hero-poster.jpg` (um frame único, ex.:
  `ffmpeg -i seu-video.mp4 -ss 00:00:01 -vframes 1 assets/img/hero-poster.jpg`)

## 4. Preencher os TODOs de conteúdo

Em `src/siteConfig.js`, alguns campos ficaram marcados como TODO porque não
tínhamos o dado real:

- `stats.yearsHistory`, `stats.clients`, `stats.barbers`
- Preço de "Corte + Barba" (ilegível na foto da tabela de preços)
- `contact.mapEmbedUrl` — troque pelo embed gerado em Google Maps > Compartilhar
  > Incorporar um mapa, para o pin ficar exatamente correto

## 5. Checklist de deploy (CORS + headers)

- [ ] No Supabase, em **Authentication > URL Configuration**, defina o
      **Site URL** como o domínio final de produção (nunca deixe `*`)
- [ ] Em **Authentication > URL Configuration > Redirect URLs**, adicione a
      URL de produção (necessário para o login Google funcionar)
- [ ] Confirme que `_headers` (Netlify) ou `vercel.json` (Vercel) está na raiz
      do projeto publicado — GitHub Pages não aplica headers customizados, então
      se for usar GitHub Pages, esses dois arquivos não terão efeito
- [ ] Teste o CSP em produção: abra o console do navegador e confira que nada
      foi bloqueado (ajuste `connect-src`/`frame-src` em `_headers`/`vercel.json`
      se adicionar novos domínios externos)
- [ ] Confirme que `window.__SUPABASE_CONFIG__` está preenchido nos três HTMLs
      com a anon key (nunca a service role key)
- [ ] Rode `supabase/schema.sql` no projeto de produção (se for um projeto
      Supabase diferente do de teste)
- [ ] Marque a conta do dono como `role = 'admin'` no projeto de produção

## Performance em dispositivos fracos

Já implementado nos hooks:

- Fundo animado como sequência de frames em `<canvas>` (não um `<video>`) —
  cada frame já está decodificado, então trocar de frame no scroll é
  praticamente instantâneo, sem o engasgo típico de buscar um tempo
  arbitrário num vídeo real
- `prefers-reduced-motion` carrega só um frame estático (sem baixar a
  sequência inteira) e desliga as animações de entrada
  de texto
- Carrossel infinito anima `transform: translateX` (GPU-accelerated), nunca
  `left`/`margin`, e pausa via listeners de hover/drag
- `useScrollReveal` toca a animação uma única vez (`toggleActions: "play none
  none none"`) e libera `will-change` assim que termina
