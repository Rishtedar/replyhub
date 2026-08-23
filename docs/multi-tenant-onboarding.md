# Multi-tenant y onboarding — estado real (2026-08-23)

Este doc responde una pregunta concreta: ¿qué tan lejos está este repo de
ser un producto que cualquier negocio pueda contratar y conectar solo, sin
que Daniel (o Claude) le toque nada a mano? Y qué falta para portarlo a
ZeroAgent como un canal más.

## Lo que ya es genérico (verificado en código, no supuesto)

- **`Workspace`** (`prisma/schema.prisma`) es la unidad de tenant. Cada
  workspace tiene sus propias cuentas de Instagram/Facebook, campañas
  (`Automation`), logs, enlaces rastreados, miembros con roles.
- **El fallback de IA es configuración de workspace, no código.**
  `Workspace.llmBusinessContext` / `llmRedirectLink` (dirección, horario,
  link de WhatsApp, lo que sea) se pasan a `lib/ai/socialReply.ts` como
  datos, no están hardcodeados a Rishtedar en ningún punto del pipeline.
  Un segundo tenant real hoy solo necesita llenar esos dos campos en
  Configuración — cero deploy nuevo, cero código nuevo.
- **Nada en `lib/`, `components/`, o el worker referencia "Rishtedar"** —
  confirmado con grep sobre todo `.ts`/`.tsx`. La única mención existente
  es un comentario de atribución en `lib/ai/socialReply.ts` explicando de
  dónde se portó la idea, no datos reales.

Conclusión de esta parte: la capa de producto ya está lista para
multi-tenant. No hay trabajo de "generalización" pendiente ahí.

## Lo que NO es código — es una aprobación de plataforma, y es el cuello de botella real

Meta exige que la app (`developers.facebook.com`, una sola app para todo
el SaaS, no una por cliente) tenga **Advanced Access** para poder operar
cuentas de terceros. Sin eso, el modo **Development** de Meta solo permite
autorizar cuentas que un admin agregó a mano como "tester" en el dashboard
de Meta — por cliente, cada vez.

Esto se separa en dos capas que es fácil confundir:

| | Quién lo hace | Cuándo | Repetido por cliente? |
|---|---|---|---|
| App Review / Advanced Access | Daniel, vía el dashboard de Meta | Una vez, para toda la plataforma | No |
| Conectar Instagram/Facebook de un cliente | El cliente mismo, botón "Conectar" → OAuth de Meta | Cada onboarding | Sí, pero es autoservicio (2 clics, sin developer) |

Una vez aprobado el Advanced Access, el flujo de onboarding de un cliente
nuevo es exactamente el que Daniel se imagina que debería ser: entra,
inicia sesión, aprieta "Conectar Instagram", pasa por la pantalla de login
de Meta, acepta permisos, vuelve. Sin Claude, sin código, sin que Daniel
toque nada. Eso ya está construido (`app/api/auth/instagram/*`,
`app/api/auth/facebook/*`, y los avisos de conexión en
`instagram-connect-notice.tsx` / `facebook-connect-notice.tsx`).

**Mientras no esté aprobado el Advanced Access**, cada cliente nuevo
requiere que Daniel entre al dashboard de Meta y lo agregue como tester —
unos minutos, manual, pero no "monstruoso": es un paso, no una lista de
pasos. El checklist completo para cerrar esto está en
`META_APP_REVIEW.md` (Instagram) + lo documentado en la memoria del
proyecto para Facebook — el punto que más puede demorar es la
verificación de negocio (documento legal de Rishtedar).

## Qué falta para portar esto a ZeroAgent

Decisión ya tomada (no reabrir sin razón nueva, ver plan original): **no
se fusiona código con Jarvis/ZeroAgent** — stacks incompatibles (este repo
es Next.js + Prisma + Auth.js + Postgres propia; Jarvis es otra cosa). El
camino es **deploy separado por marca/cliente de ZeroAgent**, igual que
este deploy es el de Rishtedar:

1. Cada cliente de ZeroAgent que quiera este canal = un deploy nuevo de
   este mismo repo (Vercel + worker + Postgres + Redis propios, o
   compartidos según cómo se decida facturar infra).
2. La app de Meta puede ser **una sola compartida** entre todos los
   clientes de ZeroAgent (recomendado — un solo App Review, un solo
   Advanced Access, reutilizable) o una por cliente (más aislamiento,
   pero repite todo el trabajo de App Review por cliente — no
   recomendado).
3. Dentro de cada deploy, cada cliente final de ese negocio sigue siendo
   un `Workspace` — no hace falta un modelo nuevo, ya soporta N
   workspaces por deploy si en algún momento se quiere una sola instancia
   sirviendo varios negocios en vez de un deploy por negocio.
4. Lo único que cambia por marca es cosmético: nombre "AutoReply" →
   nombre del cliente, logo, colores — hoy vive hardcodeado en
   `app/layout.tsx`, `app/page.tsx`, `components/sidebar.tsx`, etc. (no
   hay theming por variable de entorno todavía). Si ZeroAgent va a
   white-labelear esto para varios clientes con el mismo deploy, eso sí
   es trabajo de código pendiente — hoy asume una sola marca por deploy.

## Resumen para decisiones futuras

- Onboarding autoservicio sin intervención manual: **ya construido**,
  condicionado a tener Advanced Access aprobado.
- Generalización de la lógica de negocio: **ya hecha**, verificado en
  código.
- White-labeling multi-marca en un solo deploy: **no existe**, asume una
  marca fija por deploy (aceptable para "un deploy por cliente de
  ZeroAgent", no para "un deploy sirviendo n marcas").
- El paso que bloquea el onboarding autoservicio real: **Meta App
  Review / Advanced Access**, específicamente verificación de negocio.
