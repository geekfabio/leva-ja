// Servidor estático mínimo para o build web (SPA: rotas desconhecidas → index.html).
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const [root = "dist-e2e", port = "8090"] = process.argv.slice(2);
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".ttf": "font/ttf", ".ico": "image/x-icon" };

createServer((req, res) => {
  const path = normalize(decodeURIComponent((req.url ?? "/").split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  let file = join(root, path);
  if (!existsSync(file) || statSync(file).isDirectory()) file = existsSync(`${file}.html`) ? `${file}.html` : join(root, "index.html");
  res.writeHead(200, { "Content-Type": types[extname(file)] ?? "application/octet-stream" });
  createReadStream(file).pipe(res);
}).listen(Number(port), () => console.log(`e2e: a servir ${root} em http://localhost:${port}`));
