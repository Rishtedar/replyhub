import type { Metadata } from "next";
import LegalShell from "@/components/legal-shell";

export const metadata: Metadata = {
  title: "Eliminación de Datos - AutoReply",
  description:
    "Cómo los clientes de AutoReply pueden desconectar Instagram o una Página de Facebook y solicitar la eliminación de datos de cuenta o campañas.",
};

export default function DataDeletionPage() {
  return (
    <LegalShell
      title="Eliminación de Datos"
      description="Usa esta página para Meta App Review y para solicitudes de clientes sobre eliminar datos de cuenta, workspace, Instagram, Página de Facebook, y campañas de AutoReply."
      updatedAt="23 de agosto de 2026"
    >
      <section>
        <h2 className="text-xl font-bold text-white">
          Desconectar Instagram o una Página de Facebook
        </h2>
        <p className="mt-3">
          Inicia sesión, abre Configuración, y selecciona Desconectar junto a
          la cuenta de Instagram o Página de Facebook. Esto elimina el token
          de conexión guardado y detiene las campañas de esa cuenta.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Eliminar datos del workspace</h2>
        <p className="mt-3">
          Para eliminar datos del workspace, campañas, registros, webhooks,
          referencias de facturación, y diagnósticos operacionales, contacta a
          soporte desde el email con el que inicias sesión. Incluye el nombre
          del workspace y el usuario de Instagram o nombre de la Página de
          Facebook conectada.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Verificación</h2>
        <p className="mt-3">
          Podemos pedirte verificar el control del email o de la cuenta de
          negocio conectada antes de eliminar datos. Las solicitudes de
          eliminación se procesan lo antes posible, salvo que la retención sea
          necesaria por razones legales, de facturación, prevención de fraude,
          o seguridad.
        </p>
      </section>
    </LegalShell>
  );
}
