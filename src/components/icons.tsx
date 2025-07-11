import type { SVGProps } from 'react';
import Image from 'next/image';

// export const Logo = (props: SVGProps<SVGSVGElement>) => (
//   <svg
//     width="32"
//     height="32"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//     {...props}
//   >
//     <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
//     <path d="M12 5v14" />
//     <path d="M5 12h14" />
//   </svg>
// );

export const Logo = ({ className, ...props }: { className?: string } & Omit<React.ComponentProps<typeof Image>, 'src' | 'alt'>) => {
  return (
    <Image
      src="/Imagenes/real_logo.jpeg" // <--- RUTA A TU IMAGEN DENTRO DE LA CARPETA PUBLIC
      alt="HEALTH_M&J Logo" // Texto alternativo descriptivo
      width={300} // Ancho deseado de tu logo en píxeles (puedes ajustarlo)
      height={300} 
      quality={100}
      priority
      className={className} // Para que las clases pasadas desde page.tsx sigan funcionando
      {...props}
    />
  );
};


export const AppLogoText = (props: SVGProps<SVGSVGElement>) => (
    <span className="font-headline text-xl font-semibold tracking-tight" {...props}>
      HEALTH_M&amp;J
    </span>
);
