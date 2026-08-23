"use client";

import { useSearchParams } from "next/navigation";

type Tone = "error" | "warning" | "success";

const TONE_CLASSES: Record<Tone, string> = {
  error: "border-error/20 bg-error/10 text-error",
  warning: "border-warning/20 bg-warning/10 text-warning",
  success: "border-success/20 bg-success/10 text-success",
};

const MESSAGES: Record<string, { tone: Tone; title: string; detail: string }> = {
  denied: {
    tone: "warning",
    title: "Conexión con Facebook cancelada",
    detail:
      "Rechazaste el permiso en Facebook. Vuelve a intentarlo y acepta todos los permisos solicitados.",
  },
  invalid: {
    tone: "error",
    title: "La conexión con Facebook expiró",
    detail:
      "Faltaba el enlace de inicio de sesión o pasaron más de 10 minutos. Haz clic en Conectar Página de Facebook para intentarlo de nuevo.",
  },
  forbidden: {
    tone: "error",
    title: "No permitido",
    detail: "Solo los dueños y administradores del workspace pueden conectar una Página de Facebook.",
  },
  already_connected: {
    tone: "warning",
    title: "La Página ya está conectada",
    detail:
      "Esa Página de Facebook está conectada a otro workspace. Desconéctala ahí primero, o conecta una Página distinta.",
  },
  no_pages: {
    tone: "error",
    title: "No se encontraron Páginas de Facebook",
    detail:
      "Tu cuenta de Facebook no administra ninguna Página, o no otorgó acceso a ninguna durante el inicio de sesión. Asegúrate de ser administrador de la Página y de otorgarle acceso cuando se te pida.",
  },
  multiple_pages: {
    tone: "warning",
    title: "Se encontraron varias Páginas",
    detail:
      "Tu cuenta administra más de una Página de Facebook — por ahora esta app solo permite conectar una Página a la vez. Inicia sesión en Facebook con una cuenta que solo administre la Página que quieres conectar, o pide al administrador que quite las Páginas de más de esa sesión.",
  },
};

export function FacebookConnectNotice() {
  const searchParams = useSearchParams();
  const status = searchParams.get("facebook");

  if (!status) return null;

  if (status === "misconfigured") {
    const missing = (searchParams.get("missing") ?? "")
      .split(",")
      .filter(Boolean);

    return (
      <Notice tone="error" title="La app de Facebook no está configurada">
        <p>
          Configura{" "}
          {missing.length > 0
            ? "estas variables de entorno"
            : "las variables de entorno requeridas"}{" "}
          y reinicia el servidor:
        </p>
        {missing.length > 0 && (
          <ul className="mt-2 space-y-1">
            {missing.map((name) => (
              <li key={name} className="font-mono text-xs">
                {name}
              </li>
            ))}
          </ul>
        )}
      </Notice>
    );
  }

  if (status === "failed") {
    const reason = searchParams.get("reason");

    return (
      <Notice tone="error" title="Falló la conexión con Facebook">
        <p>
          Facebook aceptó el inicio de sesión pero la conexión no se pudo
          completar. Suele ser una URI de redirección que no coincide, o una
          app a la que le faltan permisos requeridos.
        </p>
        {reason && (
          <p className="mt-2 font-mono text-xs break-words opacity-80">
            {reason}
          </p>
        )}
      </Notice>
    );
  }

  const known = MESSAGES[status];
  if (!known) return null;

  return (
    <Notice tone={known.tone} title={known.title}>
      <p>{known.detail}</p>
    </Notice>
  );
}

function Notice({
  tone,
  title,
  children,
}: {
  tone: Tone;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded border p-4 text-sm ${TONE_CLASSES[tone]}`}>
      <p className="font-semibold">{title}</p>
      <div className="mt-1 opacity-90">{children}</div>
    </div>
  );
}
