import git from "isomorphic-git";
import http from "isomorphic-git/http/node";
import fs from "node:fs";
import { execSync } from "node:child_process";

const dir = process.cwd();
const token = execSync(
  `${process.env.HOME}/.local/gh-cli/gh_2.102.0_macOS_arm64/bin/gh auth token`,
  { encoding: "utf8" }
).trim();

const status = await git.statusMatrix({ fs, dir });
const changed = status.filter(([, head, workdir, stage]) => head !== 1 || workdir !== 1 || stage !== 1);
console.log("Changed files:");
for (const [filepath] of changed) console.log(" -", filepath);

for (const [filepath, , workdir] of changed) {
  if (workdir === 0) {
    await git.remove({ fs, dir, filepath });
  } else {
    await git.add({ fs, dir, filepath });
  }
}

const sha = await git.commit({
  fs,
  dir,
  message: `Öğrenciler ve Ödemeler sayfalarını mobil uyumlu hale getir

- Öğrenciler listesinde mobil için kart tasarımı (masaüstünde eski grid aynen duruyor)
- Ödemeler sayfasındaki kur matrisi mobilde kullanılamıyordu; her öğrenci için
  kur'ları saran bir kart görünümü eklendi
- Masaüstü kur matrisinde sabit (sticky) öğrenci adı sütunu artık sabit genişlikte,
  yatay kaydırmada diğer sütunların altında kalıp isimlerin kesilmesi düzeltildi

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`,
  author: { name: "Ali Yavuz", email: "aayavuz94@gmail.com" },
});
console.log("Committed:", sha);

const pushResult = await git.push({
  fs,
  http,
  dir,
  remote: "origin",
  ref: "main",
  onAuth: () => ({ username: token }),
});
console.log("Push result:", JSON.stringify(pushResult, null, 2));
