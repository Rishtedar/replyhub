import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import Link from "next/link";
import { LandingMotion, Reveal, RevealGroup } from "@/components/landing-motion";

export const metadata: Metadata = {
  title: "AutoReply — Convierte comentarios de Instagram y Facebook en DMs",
  description:
    "Automatiza respuestas privadas cuando alguien comenta una palabra clave, y deja que la IA responda lo que las palabras clave no cubren. Instagram y Facebook, con la API oficial de Meta.",
};

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
});

const heroStats = [
  { value: "2", label: "Canales — Instagram y Facebook" },
  { value: "24/7", label: "Monitoreo de comentarios" },
  { value: "0", label: "Respuestas sin contestar" },
];

const pillars = [
  {
    tag: "01",
    accent: "text-pink-400",
    ring: "group-hover:border-pink-400/40",
    title: "Palabra clave → DM",
    description:
      "Alguien comenta \"LINK\", \"PRECIO\" o la palabra que definas en una publicación o reel, y recibe la respuesta privada segundos después.",
  },
  {
    tag: "02",
    accent: "text-violet-400",
    ring: "group-hover:border-violet-400/40",
    title: "IA de respaldo",
    description:
      "Cuando el comentario no calza con ninguna palabra clave, un modelo de lenguaje responde con el contexto de tu negocio en vez de dejarlo sin respuesta.",
  },
  {
    tag: "03",
    accent: "text-blue-400",
    ring: "group-hover:border-blue-400/40",
    title: "Instagram + Facebook",
    description:
      "Una cuenta de Instagram y una Página de Facebook, en el mismo panel, con la misma trazabilidad — sin duplicar el trabajo de configurar dos herramientas.",
  },
];

const flowSteps = [
  {
    n: "01",
    title: "Vincula tu cuenta de Instagram o tu Página de Facebook",
    description:
      "Inicia sesión y conecta tu cuenta una sola vez. Sin compartir contraseñas, sin automatización de navegador — solo la API oficial de Meta.",
  },
  {
    n: "02",
    title: "Elige una publicación, las palabras clave y el mensaje",
    description:
      "Crea una campaña para un reel o publicación: la palabra que vas a monitorear, la respuesta pública y el DM que se enviará.",
  },
  {
    n: "03",
    title: "Las respuestas salen solas, todo el día",
    description:
      "Los webhooks capturan los comentarios al instante y un barrido periódico recupera lo que se escape. Lo que no calce con ninguna palabra clave, la IA lo toma desde ahí.",
  },
];

const featureGroups = [
  {
    label: "Multicanal",
    items: ["Instagram y Facebook en un solo panel", "Múltiples cuentas por workspace"],
  },
  {
    label: "IA de respaldo",
    items: ["Responde lo que ninguna palabra clave cubre", "Usa el contexto de tu negocio, no respuestas genéricas"],
  },
  {
    label: "Equipo",
    items: ["Invita miembros con rol de admin o editor", "Todos ven el mismo historial de conversaciones"],
  },
  {
    label: "Trazabilidad",
    items: ["Cada envío queda en cola, enviado, omitido o fallido", "Reportes listos para compartir con el cliente"],
  },
  {
    label: "Seguridad",
    items: ["Tokens de Meta cifrados en reposo", "Límite de frecuencia por cuenta, sin baneos"],
  },
  {
    label: "Enlaces",
    items: ["Enlaces rastreados con estadísticas de clics", "Sabes qué comentario convirtió"],
  },
];

/* Copias estáticas y fieles de las pantallas reales de Overview y Dashboard,
   construidas con los mismos tokens de diseño de la app para que lo que ve
   el visitante sea lo que la app realmente parece. */

function AppWindow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.7)]">
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="ml-2 text-xs text-zinc-500">{label}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

const overviewStats = [
  ["Vistas", "847.2K"],
  ["Alcance", "612.4K"],
  ["Me gusta", "38.1K"],
  ["Comentarios", "4,204"],
  ["Guardados", "9,712"],
  ["Compartidos", "2,340"],
];

const overviewPosts = [
  ["Lanzamiento de temporada", "214.8K", "9.1K", "3 abr"],
  ["Reposición de stock", "88.4K", "5.2K", "28 mar"],
  ["Detrás de cámara", "51.3K", "3.4K", "21 mar"],
];

function OverviewPreview() {
  return (
    <AppWindow label="app / overview">
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">Resumen</h3>
          <p className="mt-1 text-xs text-zinc-500">
            Recientes — 24 publicaciones de @tu.negocio
          </p>
        </div>
        <span className="rounded border border-white/10 px-2 py-1 text-xs text-zinc-500">
          Últimas 50
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {overviewStats.map(([label, value]) => (
          <Stat key={label} label={label} value={value} />
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-semibold text-white">Seguidores en el tiempo</p>
          <p className="text-xs text-zinc-500">
            48,210 <span className="text-emerald-400">+1,240</span> · 30d
          </p>
        </div>
        <svg
          viewBox="0 0 300 64"
          preserveAspectRatio="none"
          className="mt-3 h-16 w-full"
          aria-hidden="true"
        >
          <polyline
            points="0,54 43,49 86,51 129,40 171,36 214,26 257,20 300,9"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            className="text-orange-400"
          />
        </svg>
      </div>

      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <p className="text-sm font-semibold text-white">Publicaciones</p>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wide text-zinc-600">
              <th className="pb-2 pr-3 font-medium">Publicación</th>
              <th className="pb-2 px-3 text-right font-medium">Vistas</th>
              <th className="pb-2 px-3 text-right font-medium">Me gusta</th>
              <th className="pb-2 pl-3 text-right font-medium">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {overviewPosts.map(([post, views, likes, date]) => (
              <tr key={post} className="border-b border-white/5 last:border-0">
                <td className="py-2 pr-3 text-zinc-200">{post}</td>
                <td className="py-2 px-3 text-right text-zinc-500">{views}</td>
                <td className="py-2 px-3 text-right text-zinc-500">{likes}</td>
                <td className="py-2 pl-3 text-right text-zinc-600">{date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppWindow>
  );
}

function MatchedCommentCard() {
  return (
    <div className="w-64 rounded-lg border border-white/10 bg-zinc-950 p-4 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.7)]">
      <p className="text-xs text-zinc-500">Comentario nuevo</p>
      <p className="mt-1 text-sm font-semibold text-white">@camila.ml</p>
      <p className="mt-1 text-sm text-zinc-400">Quiero el LINK porfa</p>
      <div className="mt-3 border-t border-white/10 pt-3">
        <p className="text-xs text-zinc-500">
          Coincidencia: <span className="text-pink-400">GUIA</span>
        </p>
        <p className="mt-1 text-sm font-medium text-emerald-400">
          Respuesta privada en cola
        </p>
      </div>
    </div>
  );
}

function AiReplyCard() {
  return (
    <div className="w-64 rounded-lg border border-white/10 bg-zinc-950 p-4 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.7)]">
      <p className="text-xs text-zinc-500">DM sin palabra clave</p>
      <p className="mt-1 text-sm font-semibold text-white">@fundador.ray</p>
      <p className="mt-1 text-sm text-zinc-400">¿Hacen envíos a regiones?</p>
      <div className="mt-3 border-t border-white/10 pt-3">
        <p className="text-xs text-zinc-500">
          Sin coincidencia → <span className="text-violet-400">IA de respaldo</span>
        </p>
        <p className="mt-1 text-sm font-medium text-emerald-400">
          Respuesta generada y enviada
        </p>
      </div>
    </div>
  );
}

const dashboardStats = [
  ["Campañas activas", "8"],
  ["DMs enviados", "1,284"],
  ["Respondidos por IA", "196"],
  ["Fallidos", "3"],
  ["Clics", "356"],
  ["CTR", "27.7%"],
];

const dashboardChart: [string, number][] = [
  ["Lun", 42],
  ["Mar", 68],
  ["Mié", 51],
  ["Jue", 94],
  ["Vie", 120],
  ["Sáb", 86],
  ["Dom", 73],
];

const dashboardActivity = [
  ["@camila.ml", "Respuesta guía de producto", "Enviado", "text-emerald-400"],
  ["@fundador.ray", "IA de respaldo", "Enviado", "text-violet-400"],
  ["@tienda.ava", "Lead magnet", "En cola", "text-amber-400"],
];

function DashboardPreview() {
  const maxDM = Math.max(...dashboardChart.map(([, n]) => n));
  return (
    <AppWindow label="app / dashboard">
      <h3 className="text-base font-semibold text-white">¡Hola, Camila!</h3>
      <p className="mt-1 text-xs text-zinc-500">2 cuentas conectadas · 340 contactos</p>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {dashboardStats.map(([label, value]) => (
          <Stat key={label} label={label} value={value} />
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <p className="text-sm font-semibold text-white">DMs — Últimos 7 días</p>
        <div className="mt-4 flex h-32 items-end gap-2">
          {dashboardChart.map(([day, n]) => (
            <div key={day} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-[10px] text-zinc-500">{n}</span>
              <div
                className="w-full rounded-sm bg-orange-500"
                style={{ height: `${Math.max((n / maxDM) * 100, 4)}%` }}
              />
              <span className="text-[10px] text-zinc-600">{day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <p className="text-sm font-semibold text-white">Actividad reciente</p>
        <div className="mt-3 space-y-2">
          {dashboardActivity.map(([user, automation, status, color]) => (
            <div
              key={user}
              className="flex items-center justify-between gap-3 border-b border-white/5 py-2 text-sm last:border-0"
            >
              <span className="truncate text-zinc-200">{user}</span>
              <span className="truncate text-zinc-500">{automation}</span>
              <span className={`text-sm ${color}`}>{status}</span>
            </div>
          ))}
        </div>
      </div>
    </AppWindow>
  );
}

export default function Home() {
  return (
    <main
      className={`${display.variable} relative min-h-screen bg-zinc-950 text-white [font-family:var(--font-sans)]`}
    >
      <LandingMotion />

      <div className="relative z-10">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold tracking-tight text-white [font-family:var(--font-display)]"
            aria-label="AutoReply, inicio"
          >
            AutoReply
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/manychat-alternative"
              className="hidden text-sm font-medium text-zinc-400 transition hover:text-white sm:block"
            >
              vs. ManyChat
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 border border-white/15 px-4 py-2 text-sm font-bold text-white transition hover:border-white hover:bg-white hover:text-zinc-950"
            >
              Comenzar
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-6xl items-center gap-14 px-5 pb-20 pt-16 sm:px-6 sm:pt-24 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:pb-32">
        <Reveal className="max-w-3xl">
          <div className="inline-flex items-center gap-2 border border-white/15 bg-white/[0.03] px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">
            API oficial de Meta · Instagram + Facebook
          </div>

          <h1 className="mt-7 text-balance text-5xl font-bold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl [font-family:var(--font-display)]">
            Convierte cada comentario en el mensaje correcto
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            Palabra clave conocida → responde al instante. Palabra clave que
            no calza → responde la IA con el contexto de tu negocio. En
            Instagram y en Facebook, siempre con la API oficial de Meta.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-orange-500 px-6 py-3 text-sm font-bold text-zinc-950 transition hover:bg-orange-400"
            >
              Comenzar
            </Link>
            <a
              href="#how"
              className="inline-flex items-center justify-center border border-white/15 px-6 py-3 text-sm font-bold text-white transition hover:border-white/40 hover:bg-white/5"
            >
              Ver cómo funciona
            </a>
          </div>

          <dl className="mt-10 grid max-w-xl grid-cols-3 gap-3">
            {heroStats.map((stat) => (
              <div key={stat.label} className="border border-white/10 bg-white/[0.02] p-4">
                <dt className="text-2xl font-bold text-white [font-family:var(--font-display)]">
                  {stat.value}
                </dt>
                <dd className="mt-1 text-xs leading-5 text-zinc-500">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={0.15} className="relative">
          <OverviewPreview />
          <div className="absolute -bottom-8 -left-6 hidden lg:block">
            <MatchedCommentCard />
          </div>
        </Reveal>
      </section>

      <section className="border-y border-white/10 bg-white/[0.015] py-20">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-orange-400">
              Cómo responde
            </p>
            <h2 className="mt-3 text-4xl font-bold leading-tight text-white sm:text-5xl [font-family:var(--font-display)]">
              Tres capas, una sola bandeja
            </h2>
          </Reveal>

          <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-3">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className={`group border border-white/10 bg-zinc-950 p-6 transition ${pillar.ring}`}
              >
                <span className={`text-xs font-bold tracking-[0.15em] ${pillar.accent}`}>
                  {pillar.tag}
                </span>
                <h3 className="mt-4 text-xl font-bold text-white [font-family:var(--font-display)]">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{pillar.description}</p>
              </div>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section id="how" className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-orange-400">
              Cómo funciona
            </p>
            <h2 className="mt-3 text-4xl font-bold leading-tight text-white sm:text-5xl [font-family:var(--font-display)]">
              Un comentario entra, un DM sale
            </h2>
            <p className="mt-5 text-base leading-8 text-zinc-400">
              Tres pasos. Conecta una cuenta, arma una campaña y déjala
              correr. El webhook lo procesa en vivo y el barrido periódico
              recupera lo que se escape.
            </p>
          </Reveal>

          <RevealGroup className="grid gap-4">
            {flowSteps.map((step) => (
              <article
                key={step.title}
                className="grid gap-4 border border-white/10 bg-white/[0.02] p-5 sm:grid-cols-[70px_1fr]"
              >
                <p className="text-2xl font-bold text-zinc-700 [font-family:var(--font-display)]">
                  {step.n}
                </p>
                <div>
                  <h3 className="text-xl font-bold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{step.description}</p>
                </div>
              </article>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.015] py-20">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:items-center">
          <Reveal className="relative">
            <DashboardPreview />
            <div className="absolute -bottom-8 -right-6 hidden lg:block">
              <AiReplyCard />
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-orange-400">
              El panel
            </p>
            <h2 className="mt-3 text-4xl font-bold leading-tight text-white sm:text-5xl [font-family:var(--font-display)]">
              Ve exactamente qué pasó
            </h2>
            <p className="mt-5 text-base leading-8 text-zinc-400">
              Cada comentario queda trazado: en cola, con coincidencia,
              respondido por IA, enviado, omitido, fallido o limitado por
              frecuencia. Sin caja negra.
            </p>
          </Reveal>
        </div>
      </section>

      <section id="features" className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-orange-400">
            Qué incluye
          </p>
          <h2 className="mt-3 text-4xl font-bold leading-tight text-white sm:text-5xl [font-family:var(--font-display)]">
            Todo lo que necesitas
          </h2>
        </Reveal>

        <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featureGroups.map((group) => (
            <div key={group.label} className="border border-white/10 bg-white/[0.02] p-5">
              <p className="text-sm font-bold uppercase tracking-[0.1em] text-white">
                {group.label}
              </p>
              <ul className="mt-3 space-y-1.5">
                {group.items.map((item) => (
                  <li key={item} className="text-sm leading-6 text-zinc-400">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </RevealGroup>
      </section>

      <section className="border-y border-white/10 bg-white/[0.015] py-16">
        <Reveal className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 px-5 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-orange-400">
              ¿Vienes de ManyChat?
            </p>
            <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
              Mira la comparación línea por línea
            </h2>
          </div>
          <Link
            href="/manychat-alternative"
            className="inline-flex shrink-0 items-center justify-center gap-2 border border-white/15 px-6 py-3 text-sm font-bold text-white transition hover:border-white hover:bg-white hover:text-zinc-950"
          >
            Ver comparación
          </Link>
        </Reveal>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-24 pt-20 sm:px-6 lg:px-8">
        <Reveal className="border border-orange-500/20 bg-gradient-to-br from-orange-500/[0.08] to-transparent p-8 text-center sm:p-16">
          <h2 className="mx-auto max-w-3xl text-balance text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl [font-family:var(--font-display)]">
            Convierte los comentarios de tu próximo reel en DMs
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-zinc-400">
            Configúralo en minutos y no dejes pasar otro comentario sin
            respuesta.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-orange-500 px-8 py-4 text-sm font-bold text-zinc-950 transition hover:bg-orange-400"
            >
              Comenzar
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-white/10 py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-5 text-sm text-zinc-500 sm:flex-row sm:px-6 lg:px-8">
          <span className="font-bold text-zinc-300 [font-family:var(--font-display)]">
            AutoReply
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link href="/manychat-alternative" className="transition hover:text-white">
              vs. ManyChat
            </Link>
            <Link href="/privacy" className="transition hover:text-white">
              Privacidad
            </Link>
            <Link href="/terms" className="transition hover:text-white">
              Términos
            </Link>
            <Link href="/data-deletion" className="transition hover:text-white">
              Eliminación de datos
            </Link>
          </div>
        </div>
      </footer>
      </div>
    </main>
  );
}
