// Design-system adherence check for APP code (the ports in src/lib/ds are the reference and are
// exempt). Mirrors the intent of design-system/_adherence.oxlintrc.json:
//   • no raw hex colors — use var(--token)
//   • no raw px values  — use var(--space-N) / var(--size-*) (the 760px breakpoint is the one literal)
//   • fonts only via var(--font-*)
// Suppress a line deliberately with a trailing `ds-allow` comment and a reason.
import fs from 'node:fs';
import path from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const targets = ['src/routes', 'src/lib/components', 'src/lib/server'];
const exts = new Set(['.svelte', '.ts', '.css', '.js']);
const rules = [
	{ name: 'raw hex color', re: /#[0-9a-fA-F]{3,8}\b(?![\w-])/ },
	{ name: 'raw px value', re: /(?<![\w-])(?!760px)\d+px\b/ },
	{ name: 'off-system font-family', re: /font-family\s*:\s*(?!var\(--font-)/i }
];
const hexInAttrOrId = /(href|id|name|for)=["']#|url\(#|#\{|#\[/; // svelte anchors, svg refs, template syntax

let violations = 0;
function walk(dir) {
	if (!fs.existsSync(dir)) return;
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const p = path.join(dir, entry.name);
		if (entry.isDirectory()) walk(p);
		else if (exts.has(path.extname(entry.name)) && !entry.name.endsWith('.test.ts')) check(p);
	}
}
function check(file) {
	const lines = fs.readFileSync(file, 'utf8').split('\n');
	lines.forEach((line, i) => {
		if (line.includes('ds-allow')) return;
		for (const rule of rules) {
			if (!rule.re.test(line)) continue;
			if (rule.name === 'raw hex color' && hexInAttrOrId.test(line)) continue;
			violations++;
			console.log(
				`${path.relative(root, file)}:${i + 1}  ${rule.name}: ${line.trim().slice(0, 100)}`
			);
		}
	});
}
for (const t of targets) walk(path.join(root, t));
if (violations) {
	console.error(
		`\n${violations} design-system adherence violation(s). Use tokens, or add \`ds-allow <reason>\`.`
	);
	process.exit(1);
}
console.log('design-system adherence: ok');
