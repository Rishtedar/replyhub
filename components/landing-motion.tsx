"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/* El contenido de la landing SIEMPRE se renderiza visible — nunca depende
   de que React hidrate para mostrarse. `Reveal`/`RevealGroup` existían
   antes con `initial={{opacity:0}}` + `whileInView`, lo que Next.js
   horneaba como opacity:0 en el HTML servido por SSR: en desktop la
   hidratación es tan rápida que no se notaba, pero en un celular con CPU
   más lenta (o cualquier falla de hidratación) la página se quedaba
   completamente en negro hasta que el JS terminara de correr. Se
   mantienen como wrappers simples (sin animación) para no tener que tocar
   cada sección de app/page.tsx. */
export function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return <div className={className}>{children}</div>;
}

export function RevealGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

/* Resplandor ambiental fijo detrás del contenido — el mismo tipo de
   detalle "premium" que usan los landing de referencia (hojacero). Es
   puramente decorativo (no oculta ni condiciona el texto), así que no
   tiene el mismo riesgo: si la animación no corre, los círculos igual se
   ven, solo sin el pulso. */
export function LandingMotion() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <motion.div
        className="absolute -top-40 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-orange-500/[0.07] blur-[120px]"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-violet-500/[0.05] blur-[120px]"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
    </div>
  );
}
