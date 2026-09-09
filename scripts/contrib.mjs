/**
 * Gera contrib.svg: o calendário de contribuições do GitHub, desenhado no
 * sistema visual do portfólio (carvão quente, um acento âmbar, grotesk
 * técnica) e animado em CSS.
 *
 * Roda sem dependência: só o fetch do Node 18+ e um token no ambiente.
 *   GITHUB_TOKEN=$(gh auth token) node scripts/contrib.mjs
 *
 * O workflow em .github/workflows/contrib.yml chama isto todo dia, porque um
 * calendário de contribuições parado no tempo é pior do que nenhum.
 */

const LOGIN = process.env.GH_LOGIN || 'Vinicius-Duran';
const TOKEN = process.env.GITHUB_TOKEN;

if (!TOKEN) {
  console.error('Falta GITHUB_TOKEN no ambiente.');
  process.exit(1);
}

const QUERY = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount weekday } }
      }
    }
  }
}`;

const res = await fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers: {
    Authorization: `bearer ${TOKEN}`,
    'Content-Type': 'application/json',
    'User-Agent': 'contrib-svg',
  },
  body: JSON.stringify({ query: QUERY, variables: { login: LOGIN } }),
});

if (!res.ok) {
  console.error(`GitHub respondeu ${res.status}: ${await res.text()}`);
  process.exit(1);
}

const body = await res.json();
if (body.errors) {
  console.error(JSON.stringify(body.errors, null, 2));
  process.exit(1);
}

const cal = body.data.user.contributionsCollection.contributionCalendar;
const weeks = cal.weeks;
const days = weeks.flatMap((w) => w.contributionDays);

/**
 * Os níveis saem dos quartis dos dias com contribuição, e não do máximo:
 * um único dia de 149 commits jogaria o ano inteiro para o nível 1 e a
 * grade leria como vazia.
 */
const active = days.map((d) => d.contributionCount).filter((c) => c > 0).sort((a, b) => a - b);
const quantile = (p) => (active.length ? active[Math.min(active.length - 1, Math.floor(active.length * p))] : 1);
const cuts = [quantile(0.25), quantile(0.5), quantile(0.75)];
const levelOf = (count) => {
  if (count <= 0) return 0;
  if (count <= cuts[0]) return 1;
  if (count <= cuts[1]) return 2;
  if (count <= cuts[2]) return 3;
  return 4;
};

const CELL = 11;
const PITCH = 14;
const GRID_X = 52;
const GRID_Y = 64;
const W = GRID_X + weeks.length * PITCH + 12;
const H = GRID_Y + 7 * PITCH + 44;

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const fmt = new Intl.NumberFormat('pt-BR');

// Rótulo de mês na primeira semana em que o mês aparece, com folga entre eles.
const monthLabels = [];
let lastMonth = -1;
let lastLabelWeek = -3;
weeks.forEach((week, i) => {
  const first = week.contributionDays[0];
  if (!first) return;
  const month = Number(first.date.slice(5, 7)) - 1;
  if (month !== lastMonth && i - lastLabelWeek >= 3) {
    monthLabels.push({ x: GRID_X + i * PITCH, label: MESES[month] });
    lastMonth = month;
    lastLabelWeek = i;
  } else if (month !== lastMonth) {
    lastMonth = month;
  }
});

const cells = weeks
  .map((week, wi) =>
    week.contributionDays
      .map((day) => {
        const level = levelOf(day.contributionCount);
        // O atraso desenha uma varredura da esquerda para a direita, como a
        // montagem do site: a grade é construída, não revelada de uma vez.
        const delay = (wi * 0.032 + day.weekday * 0.012).toFixed(3);
        const x = GRID_X + wi * PITCH;
        const y = GRID_Y + day.weekday * PITCH;
        const title = `${day.date}: ${day.contributionCount} contribuiç${day.contributionCount === 1 ? 'ão' : 'ões'}`;
        return `    <rect class="c l${level}" x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2.5" style="animation-delay:${delay}s"><title>${title}</title></rect>`;
      })
      .join('\n')
  )
  .join('\n');

const periodo = `${MESES[Number(days[0].date.slice(5, 7)) - 1]} ${days[0].date.slice(0, 4)} → ${
  MESES[Number(days[days.length - 1].date.slice(5, 7)) - 1]
} ${days[days.length - 1].date.slice(0, 4)}`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"
     role="img" aria-label="${fmt.format(cal.totalContributions)} contribuicoes no ultimo ano no GitHub.">
  <title>Contribuições no GitHub — ${fmt.format(cal.totalContributions)} no último ano</title>

  <!-- Gerado por scripts/contrib.mjs. Não editar à mão: o workflow reescreve. -->

  <defs>
    <style><![CDATA[
      .mono { font-family: 'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace; font-weight: 500; }
      /* Entrada única, e não laço: um cartão que pisca a cada volta faz o
         leitor que chega na hora errada ver um quadro vazio. O atraso por
         célula é que desenha a varredura. */
      .c { transform-box: fill-box; transform-origin: center; animation: pop .45s cubic-bezier(0.23,1,0.32,1) both; }
      @keyframes pop {
        from { opacity: 0; transform: scale(.4); }
        to   { opacity: 1; transform: scale(1); }
      }

      .l0 { fill: #efe8dc; fill-opacity: .11; }
      .l1 { fill: #d9743f; fill-opacity: .3; }
      .l2 { fill: #d9743f; fill-opacity: .55; }
      .l3 { fill: #d9743f; fill-opacity: .8; }
      .l4 { fill: #eb8f5f; }

      .fade { animation: fade .6s cubic-bezier(0.23,1,0.32,1) both; }
      @keyframes fade {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .late { animation-delay: 1.6s; }

      @media (prefers-reduced-motion: reduce) {
        .c, .fade { animation: none; opacity: 1; transform: none; }
        .l0 { fill-opacity: .11; }
      }
    ]]></style>

    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  </defs>

  <rect width="${W}" height="${H}" rx="14" fill="#14100c"/>
  <rect width="${W}" height="${H}" rx="14" fill="#221c18" opacity=".55"/>
  <rect width="${W}" height="${H}" rx="14" filter="url(#grain)" opacity=".05"/>
  <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="12"
        fill="none" stroke="#d9743f" stroke-opacity=".3" stroke-width="1"/>

  <text class="mono fade" x="28" y="40" font-size="14" fill="#d9743f">${fmt.format(
    cal.totalContributions
  )} contribuições no último ano</text>
  <text class="mono fade" x="${W - 28}" y="40" font-size="12" fill="#efe8dc" fill-opacity=".42" text-anchor="end">${periodo}</text>

  <g class="mono fade" font-size="10" fill="#efe8dc" fill-opacity=".38">
${monthLabels.map((m) => `    <text x="${m.x}" y="${GRID_Y - 10}">${m.label}</text>`).join('\n')}
    <text x="${GRID_X - 10}" y="${GRID_Y + PITCH + 9}" text-anchor="end">seg</text>
    <text x="${GRID_X - 10}" y="${GRID_Y + 3 * PITCH + 9}" text-anchor="end">qua</text>
    <text x="${GRID_X - 10}" y="${GRID_Y + 5 * PITCH + 9}" text-anchor="end">sex</text>
  </g>

  <g>
${cells}
  </g>

  <g class="fade late">
    <text class="mono" x="${W - 148}" y="${H - 16}" font-size="10" fill="#efe8dc" fill-opacity=".38" text-anchor="end">menos</text>
${[0, 1, 2, 3, 4]
  .map(
    (l) =>
      `    <rect class="l${l}" x="${W - 140 + l * 15}" y="${H - 25}" width="11" height="11" rx="2.5"/>`
  )
  .join('\n')}
    <text class="mono" x="${W - 56}" y="${H - 16}" font-size="10" fill="#efe8dc" fill-opacity=".38">mais</text>
  </g>
</svg>
`;

const { writeFileSync } = await import('node:fs');
writeFileSync(new URL('../contrib.svg', import.meta.url), svg, 'utf8');
console.log(
  `contrib.svg escrito: ${cal.totalContributions} contribuições, ${weeks.length} semanas, cortes de nível em ${cuts.join('/')}.`
);
