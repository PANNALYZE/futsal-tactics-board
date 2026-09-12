// フットサル分析/setplays/*.json をローカル起動中のアプリ（/api/tactics）に登録する
// 使い方: node scripts/seed-setplays.mjs [setplaysDir] [baseUrl]
// 同名の戦術が既にあれば PUT で上書き、無ければ POST で新規作成する。
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const dir = process.argv[2] ?? "C:/Users/hayat/フットサル分析/setplays";
const base = process.argv[3] ?? "http://localhost:3000";

async function api(method, url, body) {
  const res = await fetch(`${base}${url}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) throw new Error(`${method} ${url}: ${json.error ?? res.status}`);
  return json;
}

const { tactics: existing } = await api("GET", "/api/tactics");
const byName = new Map(existing.map((t) => [t.name, t.id]));

const files = (await readdir(dir)).filter((f) => f.endsWith(".json")).sort();
let failed = 0;
for (const file of files) {
  try {
  const sp = JSON.parse(await readFile(path.join(dir, file), "utf-8"));
  const body = { name: sp.name, steps: sp.steps, category: sp.category, description: sp.description ?? "" };
  const id = byName.get(sp.name);
  if (id) {
    await api("PUT", `/api/tactics/${id}`, body);
    console.log(`上書き: ${sp.name} (${id})`);
  } else {
    const r = await api("POST", "/api/tactics", body);
    console.log(`新規:   ${sp.name} (${r.id})`);
  }
  } catch (err) {
    failed++;
    console.error(`失敗: ${file}: ${err.message}`);
  }
}
console.log(`完了: ${files.length - failed} 件成功 / ${failed} 件失敗`);
process.exit(failed === 0 ? 0 : 1);
