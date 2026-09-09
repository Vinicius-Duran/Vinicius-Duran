/**
 * Gera os cartões do perfil: sobre.svg e cards/<slug>.svg, no mesmo sistema
 * visual do banner e do calendário — carvão quente, um acento âmbar, grotesk
 * técnica, e a gramática de montagem do portfólio.
 *
 *   node scripts/cards.mjs
 *
 * Um cartão por projeto, e não uma imagem só com todos: no README cada um vai
 * embrulhado num link, e imagem dentro de <a> é o único jeito de o clique
 * sobreviver — SVG servido por <img> não carrega link nem script.
 *
 * O texto vem quebrado em linhas à mão porque SVG não tem quebra automática.
 */

import { writeFileSync, mkdirSync } from 'node:fs';

const AMBER = '#d9743f';
const PAPER = '#efe8dc';

/** SVG é XML: um & solto no meio de um título quebra o arquivo inteiro. */
const esc = (t) =>
  String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const FONTS = `      .display { font-family: 'Archivo','Helvetica Neue',Helvetica,Arial,sans-serif; font-weight: 800; }
      .body    { font-family: 'Archivo','Helvetica Neue',Helvetica,Arial,sans-serif; font-weight: 500; }
      .mono    { font-family: 'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace; font-weight: 500; }
      .anim { transform-box: fill-box; }`;

const GRAIN = `    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>`;

const fundo = (w, h) => `  <rect width="${w}" height="${h}" rx="14" fill="#14100c"/>
  <rect width="${w}" height="${h}" rx="14" fill="#221c18" opacity=".55"/>
  <rect width="${w}" height="${h}" rx="14" filter="url(#grain)" opacity=".05"/>
  <rect x="12" y="12" width="${w - 24}" height="${h - 24}" rx="12" fill="none" stroke="${AMBER}" stroke-opacity=".3" stroke-width="1"/>`;

/* ---------------------------------------------------------------- sobre.svg */

const SOBRE_W = 806;
const SOBRE_H = 268;

const linhasSobre = [
  ['Desenvolvedor full-stack em Florianópolis.', 'strong'],
  ['Trabalho nas três camadas: a interface que as pessoas', ''],
  ['usam, a API que a sustenta e o banco onde o dado de', ''],
  ['fato mora.', ''],
  ['', ''],
  ['No front, React com Vite, design system em CSS custom', ''],
  ['properties e motion com GSAP e anime.js. No back, C#', ''],
  ['com ASP.NET Core e Node com Express, sobre SQL Server', ''],
  ['ou MySQL.', ''],
];

// As três camadas, ditas de novo em desenho: é do que o texto fala.
const camadas = [
  { nome: 'interface', detalhe: 'React · Vite · GSAP' },
  { nome: 'API', detalhe: 'C# · .NET · Node' },
  { nome: 'banco', detalhe: 'SQL Server · MySQL' },
];

const sobre = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SOBRE_W} ${SOBRE_H}" width="${SOBRE_W}" height="${SOBRE_H}"
     role="img" aria-label="Desenvolvedor full-stack em Florianopolis. Trabalho nas tres camadas: interface, API e banco.">
  <title>Sobre — Vinicius Duran</title>

  <!-- Gerado por scripts/cards.mjs. Não editar à mão. -->

  <defs>
    <style><![CDATA[
${FONTS}

      /* Entrada única: o cartão monta e fica. Laço aqui faria o conteúdo
         sumir por um instante a cada volta. */
      .linha { animation: linha .6s cubic-bezier(0.23,1,0.32,1) both; }
      @keyframes linha {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      .camada { animation: camada .7s cubic-bezier(0.23,1,0.32,1) both; }
      @keyframes camada {
        from { opacity: 0; transform: translateX(14px); }
        to   { opacity: 1; transform: translateX(0); }
      }

      /* O fio que liga as três camadas é desenhado depois delas. */
      .fio { stroke-dasharray: 150; animation: fio 1s cubic-bezier(0.23,1,0.32,1) 1.5s both; }
      @keyframes fio {
        from { stroke-dashoffset: 150; }
        to   { stroke-dashoffset: 0; }
      }

      .tag { animation: linha .6s cubic-bezier(0.23,1,0.32,1) both; }

      @media (prefers-reduced-motion: reduce) {
        .linha, .camada, .fio, .tag { animation: none; opacity: 1; transform: none; stroke-dashoffset: 0; }
      }
    ]]></style>

${GRAIN}
  </defs>

${fundo(SOBRE_W, SOBRE_H)}

  <text class="mono tag" x="28" y="46" font-size="13" fill="${AMBER}" letter-spacing="1.4">sobre</text>

  <g>
${linhasSobre
  .filter(([t]) => t)
  .map(([texto, peso], i) => {
    const y = 84 + linhasSobre.findIndex(([t]) => t === texto) * 21;
    return `    <text class="anim linha body" x="28" y="${y}" font-size="${
      peso === 'strong' ? 16 : 15
    }" fill="${PAPER}" fill-opacity="${peso === 'strong' ? '.92' : '.62'}" style="animation-delay:${(
      i * 0.09
    ).toFixed(2)}s">${esc(texto)}</text>`;
  })
  .join('\n')}
  </g>

  <g>
    <line class="fio" x1="524" y1="86" x2="524" y2="214" stroke="${AMBER}" stroke-opacity=".55" stroke-width="1" stroke-dasharray="150"/>
${camadas
  .map((c, i) => {
    const y = 72 + i * 62;
    return `    <g class="anim camada" style="animation-delay:${(0.9 + i * 0.16).toFixed(2)}s">
      <circle cx="524" cy="${y + 22}" r="4" fill="${AMBER}"/>
      <rect x="544" y="${y}" width="234" height="46" rx="10" fill="${PAPER}" fill-opacity="${
      i === 1 ? '.04' : '.06'
    }" stroke="${i === 1 ? AMBER : PAPER}" stroke-opacity="${i === 1 ? '.4' : '.16'}"/>
      <text class="mono" x="562" y="${y + 21}" font-size="13" fill="${PAPER}" fill-opacity=".9">${esc(c.nome)}</text>
      <text class="mono" x="562" y="${y + 36}" font-size="10" fill="${PAPER}" fill-opacity=".42">${esc(c.detalhe)}</text>
    </g>`;
  })
  .join('\n')}
  </g>
</svg>
`;

writeFileSync(new URL('../sobre.svg', import.meta.url), sobre, 'utf8');

/* ------------------------------------------------------------- cards/*.svg */

const CARD_W = 392;
const CARD_H = 150;

const projetos = [
  {
    slug: 'sistema-financeiro',
    titulo: 'Sistema Financeiro',
    linhas: ['CRUD de usuários, centros de custo, receitas,', 'contas e lançamentos, com token e validação.'],
    chips: ['React', 'Node', 'MySQL', 'JWT'],
    destaque: 0,
    nota: '2025',
  },
  {
    slug: 'todah-producoes',
    titulo: 'Todah Produções',
    linhas: ['Site institucional e vitrine de artistas de', 'um agenciamento musical.'],
    chips: ['React 19', 'Vite 6', 'Tailwind'],
    destaque: 0,
    nota: '2026',
  },
  {
    slug: 'taki-rastreadores',
    titulo: 'Taki Rastreadores',
    linhas: ['Site B2B de rastreamento e gestão de frotas,', 'com SEO técnico.'],
    chips: ['HTML', 'CSS', 'JS', 'SEO'],
    destaque: 3,
    nota: '2026',
  },
  {
    slug: 'meta-marketing',
    titulo: 'Meta&Marketing',
    linhas: ['Site de agência de marketing digital, com', 'uma página por serviço.'],
    chips: ['HTML', 'CSS', 'JS'],
    destaque: 0,
    nota: '2026',
  },
  {
    slug: 'loja-csharp',
    titulo: 'Loja em C#',
    linhas: ['Solução .NET 6 em quatro projetos, com domínio', 'e dados isolados da camada de API.'],
    chips: ['C#', 'ASP.NET', '.NET 6'],
    destaque: 0,
    nota: '2024',
  },
  {
    slug: 'portfolio',
    titulo: 'Este portfólio',
    linhas: ['Design system próprio, motion com GSAP e a', 'camada de dados separada da apresentação.'],
    chips: ['React 19', 'Vite', 'GSAP', 'anime.js'],
    destaque: 2,
    nota: '2026',
  },
];

mkdirSync(new URL('../cards/', import.meta.url), { recursive: true });

// Mono de 11px mede perto de 6,6px por caractere; a folga de 22px é o padding.
const larguraChip = (texto) => Math.round(texto.length * 6.6) + 22;

for (const p of projetos) {
  let x = 26;
  const chips = p.chips
    .map((c, i) => {
      const w = larguraChip(c);
      const realce = i === p.destaque;
      const bloco = `    <g class="anim chip" style="animation-delay:${(0.5 + i * 0.09).toFixed(2)}s">
      <rect x="${x}" y="112" width="${w}" height="24" rx="8" fill="${realce ? AMBER : PAPER}" fill-opacity="${
        realce ? '.18' : '.06'
      }" stroke="${realce ? AMBER : PAPER}" stroke-opacity="${realce ? '.5' : '.16'}"/>
      <text class="mono" x="${x + w / 2}" y="${128}" font-size="11" fill="${PAPER}" fill-opacity="${
        realce ? '.95' : '.72'
      }" text-anchor="middle">${esc(c)}</text>
    </g>`;
      x += w + 8;
      return bloco;
    })
    .join('\n');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CARD_W} ${CARD_H}" width="${CARD_W}" height="${CARD_H}"
     role="img" aria-label="${esc(p.titulo)}: ${esc(p.linhas.join(' '))}">
  <title>${esc(p.titulo)}</title>

  <!-- Gerado por scripts/cards.mjs. Não editar à mão. -->

  <defs>
    <style><![CDATA[
${FONTS}

      /* O título é escrito da esquerda para a direita, como no banner. */
      /* O título é escrito da esquerda para a direita, uma vez. */
      .wipe { transform-origin: left center; animation: wipe .8s cubic-bezier(0.77,0,0.175,1) both; }
      @keyframes wipe {
        from { transform: scaleX(0); }
        to   { transform: scaleX(1); }
      }
      .rule { transform-origin: left center; animation: rule .6s cubic-bezier(0.23,1,0.32,1) .5s both; }
      @keyframes rule {
        from { transform: scaleX(0); }
        to   { transform: scaleX(1); }
      }
      .linha { animation: sobe .6s cubic-bezier(0.23,1,0.32,1) both; }
      .chip  { animation: sobe .6s cubic-bezier(0.23,1,0.32,1) both; }
      @keyframes sobe {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .nota { animation: sobe .6s cubic-bezier(0.23,1,0.32,1) .9s both; }

      @media (prefers-reduced-motion: reduce) {
        .wipe, .rule, .linha, .chip, .nota { animation: none; opacity: 1; transform: none; }
      }
    ]]></style>

${GRAIN}

    <clipPath id="t"><rect class="anim wipe" x="26" y="24" width="${CARD_W - 78}" height="34"/></clipPath>
  </defs>

${fundo(CARD_W, CARD_H)}

  <g clip-path="url(#t)">
    <text class="display" x="26" y="50" font-size="21" letter-spacing="-.5" fill="${PAPER}">${esc(p.titulo)}</text>
  </g>
  <text class="mono nota anim" x="${CARD_W - 26}" y="48" font-size="11" fill="${PAPER}" fill-opacity=".35" text-anchor="end">${
    p.nota
  }</text>
  <rect class="anim rule" x="26" y="60" width="86" height="2" fill="${AMBER}"/>

${p.linhas
  .map(
    (linha, i) =>
      `  <text class="body linha anim" x="26" y="${84 + i * 18}" font-size="12.5" fill="${PAPER}" fill-opacity=".6" style="animation-delay:${(
        0.25 +
        i * 0.08
      ).toFixed(2)}s">${esc(linha)}</text>`
  )
  .join('\n')}

${chips}
</svg>
`;
  writeFileSync(new URL(`../cards/${p.slug}.svg`, import.meta.url), svg, 'utf8');
}

console.log(`sobre.svg e ${projetos.length} cartões escritos.`);

/* -------------------------------------------------------------- stack.svg */

const STACK_W = 806;
const grupos = [
  { rotulo: 'front', itens: ['React', 'React Native', 'TypeScript', 'Vite', 'CSS/SCSS', 'Tailwind', 'GSAP', 'anime.js'] },
  { rotulo: 'back', itens: ['C#', '.NET', 'ASP.NET Core', 'Node.js', 'Express', 'Python', 'APIs REST'] },
  { rotulo: 'dados', itens: ['SQL Server', 'MySQL', 'PostgreSQL'] },
  { rotulo: 'plataforma', itens: ['Docker', 'Git', 'GitHub Actions', 'Azure', 'Vercel', 'Vitest', 'ESLint'] },
];

let linhaY = 76;
let indiceChip = 0;
const blocosStack = grupos
  .map((g) => {
    let x = 132;
    const chips = g.itens
      .map((item) => {
        const w = larguraChip(item);
        if (x + w > STACK_W - 28) {
          x = 132;
          linhaY += 34;
        }
        const bloco = `    <g class="anim chip" style="animation-delay:${(indiceChip * 0.045).toFixed(2)}s">
      <rect x="${x}" y="${linhaY - 17}" width="${w}" height="26" rx="8" fill="${PAPER}" fill-opacity=".06" stroke="${PAPER}" stroke-opacity=".16"/>
      <text class="mono" x="${x + w / 2}" y="${linhaY}" font-size="11.5" fill="${PAPER}" fill-opacity=".78" text-anchor="middle">${esc(item)}</text>
    </g>`;
        x += w + 8;
        indiceChip += 1;
        return bloco;
      })
      .join('\n');
    const rotulo = `    <text class="mono anim linha" x="108" y="${linhaY}" font-size="12" fill="${AMBER}" text-anchor="end">${esc(g.rotulo)}</text>`;
    linhaY += 44;
    return `${rotulo}\n${chips}`;
  })
  .join('\n');

const STACK_H = linhaY + 4;

const stack = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${STACK_W} ${STACK_H}" width="${STACK_W}" height="${STACK_H}"
     role="img" aria-label="Stack: ${esc(grupos.map((g) => `${g.rotulo} — ${g.itens.join(', ')}`).join('; '))}.">
  <title>Stack</title>

  <!-- Gerado por scripts/cards.mjs. Não editar à mão. -->

  <defs>
    <style><![CDATA[
${FONTS}

      .chip  { animation: sobe .55s cubic-bezier(0.23,1,0.32,1) both; }
      .linha { animation: sobe .55s cubic-bezier(0.23,1,0.32,1) both; }
      @keyframes sobe {
        from { opacity: 0; transform: translateY(9px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .tag { animation: sobe .55s cubic-bezier(0.23,1,0.32,1) both; }

      @media (prefers-reduced-motion: reduce) {
        .chip, .linha, .tag { animation: none; opacity: 1; transform: none; }
      }
    ]]></style>

${GRAIN}
  </defs>

${fundo(STACK_W, STACK_H)}

  <text class="mono tag" x="28" y="46" font-size="13" fill="${AMBER}" letter-spacing="1.4">stack</text>

${blocosStack}
</svg>
`;

writeFileSync(new URL('../stack.svg', import.meta.url), stack, 'utf8');

/* ------------------------------------------------------------- links/*.svg */

const LINK_W = 262;
const LINK_H = 62;

const contatos = [
  { slug: 'portfolio', rotulo: 'portfólio', valor: 'vduran.vercel.app', realce: true },
  { slug: 'linkedin', rotulo: 'linkedin', valor: 'in/vinicius-duran', realce: false },
  { slug: 'whatsapp', rotulo: 'whatsapp', valor: '(48) 99211-0831', realce: false },
];

mkdirSync(new URL('../links/', import.meta.url), { recursive: true });

for (const c of contatos) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LINK_W} ${LINK_H}" width="${LINK_W}" height="${LINK_H}"
     role="img" aria-label="${esc(c.rotulo)}: ${esc(c.valor)}">
  <title>${esc(c.rotulo)} — ${esc(c.valor)}</title>

  <!-- Gerado por scripts/cards.mjs. Não editar à mão. -->

  <defs>
    <style><![CDATA[
${FONTS}

      /* A seta corre até a borda e volta: o botão diz que leva a algum lugar. */
      .seta { animation: seta 3.4s cubic-bezier(0.23,1,0.32,1) infinite; }
      @keyframes seta {
        0%,60% { transform: translateX(0); opacity: .55; }
        75%    { transform: translateX(6px); opacity: 1; }
        100%   { transform: translateX(0); opacity: .55; }
      }
      .risco { transform-origin: left center; animation: risco 3.4s cubic-bezier(0.23,1,0.32,1) infinite; }
      @keyframes risco {
        0%,60% { transform: scaleX(.28); }
        80%    { transform: scaleX(1); }
        100%   { transform: scaleX(.28); }
      }

      @media (prefers-reduced-motion: reduce) {
        .seta, .risco { animation: none; transform: none; opacity: 1; }
      }
    ]]></style>
  </defs>

  <rect width="${LINK_W}" height="${LINK_H}" rx="12" fill="#14100c"/>
  <rect width="${LINK_W}" height="${LINK_H}" rx="12" fill="#221c18" opacity=".55"/>
  <rect x="1" y="1" width="${LINK_W - 2}" height="${LINK_H - 2}" rx="11" fill="${c.realce ? AMBER : PAPER}" fill-opacity="${
    c.realce ? '.1' : '.03'
  }" stroke="${c.realce ? AMBER : PAPER}" stroke-opacity="${c.realce ? '.45' : '.18'}"/>

  <text class="mono" x="20" y="26" font-size="10.5" fill="${AMBER}" letter-spacing="1.6">${esc(c.rotulo)}</text>
  <text class="body" x="20" y="46" font-size="14" fill="${PAPER}" fill-opacity=".9">${esc(c.valor)}</text>
  <rect class="anim risco" x="20" y="52" width="${LINK_W - 70}" height="1.5" fill="${AMBER}" fill-opacity=".45"/>

  <g class="anim seta">
    <path d="M${LINK_W - 34} 31 h12 m-5 -5 l5 5 l-5 5" fill="none" stroke="${AMBER}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>
`;
  writeFileSync(new URL(`../links/${c.slug}.svg`, import.meta.url), svg, 'utf8');
}

console.log(`stack.svg e ${contatos.length} botões de contato escritos.`);
