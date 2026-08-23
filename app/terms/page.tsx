import type { Metadata } from "next";
import LegalShell from "@/components/legal-shell";

export const metadata: Metadata = {
  title: "Términos de Servicio - AutoReply",
  description:
    "Términos para usar el software de campañas de comentario/Messenger a DM de Instagram y Facebook de AutoReply.",
};

export default function TermsPage() {
  return (
    <LegalShell
      title="Términos de Servicio"
      description="Estos términos definen el uso aceptable del servicio de campañas de comentario/Messenger a DM de Instagram y Facebook de AutoReply."
      updatedAt="23 de agosto de 2026"
    >
      <section>
        <h2 className="text-xl font-bold text-white">Uso autorizado</h2>
        <p className="mt-3">
          Puedes usar AutoReply solo con cuentas profesionales de Instagram y
          Páginas de Facebook que sean tuyas o que estés autorizado a
          administrar. Eres responsable de las campañas, palabras clave,
          enlaces y mensajes que configures.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Cumplimiento de la plataforma</h2>
        <p className="mt-3">
          Aceptas cumplir con los Términos de Plataforma de Meta, las políticas
          de Instagram y Facebook, las reglas de mensajería aplicables, leyes
          de privacidad, reglas de publicidad, y leyes anti-spam. AutoReply
          puede limitar la frecuencia, pausar, o deshabilitar campañas que
          generen riesgo de cumplimiento, abuso, seguridad, o entregabilidad.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Disponibilidad</h2>
        <p className="mt-3">
          AutoReply depende de plataformas de terceros incluyendo Meta, email,
          hosting, base de datos, y proveedores de cola. Trabajamos para operar
          el servicio de forma confiable, pero no se garantiza disponibilidad
          ininterrumpida.
        </p>
      </section>
    </LegalShell>
  );
}
