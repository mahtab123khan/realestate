// Usage: npm run rebrand -- --name "Acme Homes" --legal "Acme Homes Real Estate LLC" --email hi@acme.com --phone "+971 4 111 2222" --whatsapp 971501112222 --address "Marina Plaza, Dubai Marina" --domain https://acme.onrender.com --tagline "Real Estate" --demoBy "Your Agency"
const fs = require('fs'), path = require('path');
const cfgPath = path.join(__dirname, 'brand.json');
const cur = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const args = process.argv.slice(2), next = { ...cur };
for (let i = 0; i < args.length; i += 2) { const k = args[i].replace(/^--/, ''); if (!(k in cur)) { console.error('Unknown option: ' + args[i]); process.exit(1) } next[k] = args[i + 1] }
if (next.name !== cur.name && next.legal === cur.legal) next.legal = next.name + ' ' + cur.tagline;
const digits = s => s.replace(/[^\d+]/g, '');
const pairs = [
  [cur.legal, next.legal], [cur.tagline.length > 3 ? '<small>' + cur.tagline + '</small>' : null, '<small>' + next.tagline + '</small>'],
  [cur.email, next.email], [cur.phone, next.phone], [digits(cur.phone), digits(next.phone)],
  [cur.whatsapp, next.whatsapp], [cur.address, next.address], [cur.domain, next.domain],
  ["by: '" + cur.demoBy + "'", "by: '" + next.demoBy + "'"], [cur.name, next.name]
].filter(p => p[0] && p[0] !== p[1]);
const files = fs.readdirSync(__dirname).filter(f => /\.(html|js|md|xml|txt)$/.test(f) && f !== 'rebrand.js');
let n = 0;
for (const f of files) {
  let t = fs.readFileSync(path.join(__dirname, f), 'utf8'), o = t;
  for (const [a, b] of pairs) t = t.split(a).join(b);
  if (t !== o) { fs.writeFileSync(path.join(__dirname, f), t); n++ }
}
fs.writeFileSync(cfgPath, JSON.stringify(next, null, 2) + '\n');
console.log('Rebranded ' + n + ' files -> ' + next.name + '. Replace assets/paradise-icon.png and paradise-logo-full.png with the client logo.');
