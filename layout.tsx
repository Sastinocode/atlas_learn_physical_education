import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'El cuerpo en movimiento · TSEAS',description:'Atlas corporal interactivo con retos de anatomía funcional. Explora, localiza, relaciona y explica.'};
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="es"><body>{children}</body></html>; }
