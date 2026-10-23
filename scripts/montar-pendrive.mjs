// Monta a pasta para pen drive / HD externo: site + servidor local + instruções.
// Uso: npm run pendrive   (ou node scripts/montar-pendrive.mjs [destino])
import { cpSync, rmSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const raiz = resolve(import.meta.dirname, '..');
const destino = resolve(process.argv[2] ?? join(raiz, 'dist-pendrive', 'Nautilus'));
const site = join(destino, 'site');

rmSync(destino, { recursive: true, force: true });
mkdirSync(site, { recursive: true });
cpSync(join(raiz, 'pendrive-kit'), destino, { recursive: true });
for (const item of ['index.html', 'css', 'js', 'data', 'assets']) cpSync(join(raiz, item), join(site, item), { recursive: true });

const tamanho = dir => readdirSync(dir, { withFileTypes: true }).reduce((t, e) => t + (e.isDirectory() ? tamanho(join(dir, e.name)) : statSync(join(dir, e.name)).size), 0);
console.log(`Pacote pronto em ${destino} (${(tamanho(destino) / 1048576).toFixed(1)} MB). Copie a pasta "Nautilus" para o pen drive.`);
