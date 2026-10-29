import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import {createRoot} from 'react-dom/client';
import Atlas from './app/atlas';
import '@fontsource/source-sans-3/latin-400.css';
import '@fontsource/source-sans-3/latin-600.css';
import '@fontsource/source-serif-4/latin-600.css';
import '@fontsource/source-serif-4/latin-600-italic.css';
import './app/globals.css';
// atlas3d.js reutiliza este mismo React en vez de llevar el suyo.
(window as unknown as {__ATLAS_REACT:unknown}).__ATLAS_REACT={React,jsxRuntime};
createRoot(document.getElementById('root')!).render(<Atlas/>);
