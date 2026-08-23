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
    title: "Conexión con Instagram cancelada",
    detail:
      "Rechazaste el permiso en Instagram. Vuelve a intentarlo y acepta todos los permisos solicitados.",
  },
  invalid: {
    tone: "error",
    title: "La conexión con Instagram expiró",
    detail:
      "Faltaba el enlace de inicio de sesión o pasaron más de 10 minutos. Haz clic en Conectar Instagram para intentarlo de nuevo.",
  },
  forbidden: {
    tone: "error",
    title: "No permitido",
    detail:
      "Solo los dueños y administradores del workspace pueden conectar una cuenta de Instagram.",
  },
  already_connected: {
    tone: "warning",
    title: "La cuenta ya está conectada",
    detail:
      "Esa cuenta de Instagram está conectada a otro workspace. Desconéctala ahí primero, o conecta una cuenta distinta.",
  },
};

export function InstagramConnectNotice() {
  const searchParams = useSearchParams();
  const status = searchParams.get("instagram");

  if (!status) return null;

  if (status === "misconfigured") {
    const missing = (searchParams.get("missing") ?? "")
      .split(",")
      .filter(Boolean);

    return (
      <Notice tone="error" title="La app de Instagram no está configurada">
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
        <p className="mt-2">
          Consulta <span className="font-mono text-xs">docs/setup.md</span> para saber cómo
          obtener cada valor. Ten en cuenta que{" "}
          <span className="font-mono text-xs">ENCRYPTION_KEY</span> debe ser
          un string hexadecimal de 64 caracteres.
        </p>
      </Notice>
    );
  }

  if (status === "failed") {
    const reason = searchParams.get("reason");

    return (
      <Notice tone="error" title="Falló la conexión con Instagram">
        <p>
          Instagram aceptó el inicio de sesión pero la conexión no se pudo
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
