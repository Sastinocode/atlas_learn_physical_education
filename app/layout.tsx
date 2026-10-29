import type { Metadata } from 'next';
import '@fontsource/source-sans-3/latin-400.css';
import '@fontsource/source-sans-3/latin-600.css';
import '@fontsource/source-serif-4/latin-600.css';
import '@fontsource/source-serif-4/latin-600-italic.css';
import './globals.css';
export const metadata: Metadata = {title:'El cuerpo en movimiento · TSEAS',description:'Atlas corporal interactivo con retos de anatomía funcional. Explora, localiza, relaciona y explica.'};
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="es"><body>{children}</body></html>; }
