import type { Metadata } from "next";
import LegalShell from "@/components/legal-shell";

export const metadata: Metadata = {
  title: "Política de Privacidad - AutoReply",
  description:
    "Cómo AutoReply maneja los datos de cuentas de Instagram y Página de Facebook, payloads de webhook, datos de facturación e información de campañas.",
};

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Política de Privacidad"
      description="AutoReply ayuda a negocios a enviar respuestas privadas y DMs de Messenger conforme a las políticas de Meta cuando alguien comenta en publicaciones o reels de Instagram conectados, en publicaciones de una Página de Facebook, o escribe directamente a la Página."
      updatedAt="23 de agosto de 2026"
    >
      <section>
        <h2 className="text-xl font-bold text-white">Datos que recopilamos</h2>
        <p className="mt-3">
          Recopilamos el email de la cuenta para autenticación, metadata del
          workspace y facturación, identificadores de la cuenta de Instagram y
          la Página de Facebook conectadas, tokens de acceso de Instagram y
          Facebook cifrados, configuración de campañas, payloads de webhook,
          comentarios y mensajes de Messenger necesarios para procesar las
          campañas, registros de envío, y diagnósticos operacionales.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Cómo usamos los datos</h2>
        <p className="mt-3">
          Usamos estos datos para autenticar usuarios, conectar las
          integraciones de Instagram y Facebook, hacer coincidir palabras clave
          en comentarios y mensajes, enviar respuestas privadas y DMs de
          Messenger a través de las APIs oficiales de Meta, prevenir envíos
          duplicados, resolver fallas, y proteger el servicio.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Datos de Instagram y Meta</h2>
        <p className="mt-3">
          AutoReply no pide contraseñas de Instagram o Facebook, no hace
          scraping de ninguna plataforma, ni usa automatización de navegador.
          Los tokens de Instagram y de la Página de Facebook están cifrados en
          reposo y se usan solo para realizar acciones autorizadas por la
          cuenta de negocio o Página conectada.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Subprocesadores</h2>
        <p className="mt-3">
          El servicio en producción puede usar proveedores de hosting, base de
          datos, cola Redis, email, y observabilidad como Vercel, Railway,
          PostgreSQL, Redis, y Resend. Estos proveedores procesan datos solo lo
          necesario para operar el servicio.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Retención y eliminación</h2>
        <p className="mt-3">
          Los clientes pueden desconectar Instagram o una Página de Facebook
          desde Configuración, lo que elimina la conexión guardada y detiene
          las campañas de esa cuenta. Para eliminar cuenta o datos completos,
          sigue la página de Eliminación de Datos enlazada en el pie de página.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Contacto</h2>
        <p className="mt-3">
          Para consultas de privacidad, contacta a soporte desde el email con
          el que inicias sesión en el servicio.
        </p>
      </section>
    </LegalShell>
  );
}
