#!/usr/bin/env node
// Usage: node find-dependents.mjs <pkg> [<pkg>...] [--check]
// Lists every package.json manifest entry whose installed metadata declares a
// dependency / peerDependency / optionalDependency on any target package, with
// the declared range and whether the currently installed target satisfies it.
// --check: exit 1 if any range is unsatisfied or cannot be verified (use after the upgrade).
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const check = args.includes('--check');
const targets = args.filter((a) => !a.startsWith('--'));
if (targets.length === 0) {
    console.error('usage: find-dependents.mjs <pkg> [<pkg>...] [--check]');
    process.exit(2);
}

const root = process.cwd();
const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const manifestDeps = {
    ...manifest.dependencies,
    ...manifest.devDependencies,
    ...manifest.optionalDependencies,
    ...manifest.peerDependencies,
};
// sections whose entries may legitimately be absent from node_modules
const mayBeAbsent = new Set([
    ...Object.keys(manifest.optionalDependencies ?? {}),
    ...Object.keys(manifest.peerDependencies ?? {}),
].filter((name) =>
    name in (manifest.optionalDependencies ?? {}) ||
    (!(name in (manifest.dependencies ?? {})) && !(name in (manifest.devDependencies ?? {})))
));

const require = createRequire(resolve(root, 'package.json'));
let semver = null;
try {
    semver = require('semver');
} catch {
    try {
        semver = createRequire(import.meta.url)('npm/node_modules/semver');
    } catch {
        /* range checking degraded to "unknown" */
    }
}

function installedPkg(name) {
    const p = resolve(root, 'node_modules', name, 'package.json');
    return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null;
}

const installedTargets = Object.fromEntries(targets.map((t) => [t, installedPkg(t)?.version ?? null]));

const rows = [];
for (const name of Object.keys(manifestDeps).sort()) {
    const meta = installedPkg(name);
    if (!meta) {
        const status = mayBeAbsent.has(name) ? 'skipped (optional/peer not installed)' : 'unknown (not installed)';
        rows.push({ dependent: name, kind: 'NOT INSTALLED', target: '-', range: '-', status });
        continue;
    }
    for (const [kind, obj] of [
        ['peerDependencies', meta.peerDependencies],
        ['dependencies', meta.dependencies],
        ['optionalDependencies', meta.optionalDependencies],
    ]) {
        if (!obj) continue;
        for (const t of targets) {
            if (!(t in obj)) continue;
            const range = obj[t];
            // regular deps may be satisfied by a nested copy; peers must resolve to the hoisted one
            const nested = kind === 'peerDependencies' ? null : installedPkg(`${name}/node_modules/${t}`);
            const have = nested?.version ?? installedTargets[t];
            const optionalPeer = meta.peerDependenciesMeta?.[t]?.optional === true;
            let status;
            if (!have) status = 'unknown (target missing)';
            else if (!semver) status = 'unknown (semver unavailable)';
            else status = semver.satisfies(have, range, { includePrerelease: true }) ? 'ok' : 'UNSATISFIED';
            if (optionalPeer && status === 'UNSATISFIED') status = 'UNSATISFIED (optional peer)';
            rows.push({ dependent: name, kind, target: t, range, installed: have ?? 'missing', status });
        }
    }
}

const manifestTargets = targets.filter((t) => t in manifestDeps);
const nonManifestTargets = targets.filter((t) => !(t in manifestDeps));

console.log(`Targets: ${targets.map((t) => `${t}@${installedTargets[t] ?? 'missing'}`).join(', ')}`);
if (nonManifestTargets.length) {
    console.log(`Note: not direct manifest entries (transitive only): ${nonManifestTargets.join(', ')}`);
}
if (manifestTargets.length) {
    console.log(`Manifest ranges: ${manifestTargets.map((t) => `${t}: ${manifestDeps[t]}`).join(', ')}`);
}
console.log('');

if (rows.length === 0) {
    console.log('No manifest entries depend on the target(s). Cohort = target(s) only.');
} else {
    console.table(rows);
    const cohort = [...new Set(rows.filter((r) => r.kind !== 'NOT INSTALLED').map((r) => r.dependent))];
    console.log(`\nCohort (must be reviewed/bumped together with the target): ${cohort.join(', ')}`);
}

if (check) {
    const bad = rows.filter((r) => r.status.startsWith('UNSATISFIED'));
    const unverified = rows.filter((r) => r.status.startsWith('unknown'));
    if (bad.length) console.error(`\n${bad.length} unsatisfied range(s) — upgrade incomplete.`);
    if (unverified.length) console.error(`\n${unverified.length} range(s) could not be verified — install deps / semver and re-run.`);
    if (bad.length || unverified.length) process.exit(1);
}
