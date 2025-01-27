import { readFileSync } from 'fs';
import path  from 'path';

export const cwd = process.cwd();
export const pkg = JSON.parse(readFileSync(path.resolve(cwd, './package.json'), 'utf-8'));
export const types = path.resolve(cwd, 'dist/types/');

const normalize = name => name
  .replace(/[@\s\/\.]+/g, ' ')
  .trim()
  .replace(/\s+/, '-')
  .toLowerCase();

export const name = normalize(pkg.name);

export const sources = pkg.exports
  ? Object.keys(pkg.exports).map(entry => {
    if (entry === './package.json') return undefined;
    const exports = pkg.exports[entry];
    const dir = normalize(entry);
    return {
      name: dir ? `${name}-${dir}` : name,
      dir: dir || '.',
      main: exports.require,
      module: exports.import,
      types: exports.types,
      source: exports.source,
    };
  }).filter(Boolean) : [{
    name,
    source: pkg.source || './src/index.ts'
  }];

export const externalModules = ['dns', 'fs', 'path', 'url'];
if (pkg.peerDependencies)
  externalModules.push(...Object.keys(pkg.peerDependencies));
if (pkg.devDependencies)
  externalModules.push(...Object.keys(pkg.devDependencies));
if (pkg.dependencies)
  externalModules.push(...Object.keys(pkg.dependencies));
if (pkg.optionalDependencies)
  externalModules.push(...Object.keys(pkg.optionalDependencies));

const prodDependencies = new Set([
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.dependencies || {}),
]);

const externalPredicate = new RegExp(`^(${externalModules.join('|')})($|/)`);

export const isExternal = id => {
  if (id === 'babel-plugin-transform-async-to-promises/helpers')
    return false;
  return externalPredicate.test(id);
};

export const hasReact = prodDependencies.has('react');
export const hasPreact = prodDependencies.has('preact');
export const hasSvelte = prodDependencies.has('svelte');
export const hasVue = prodDependencies.has('vue');
export const mayReexport = hasReact || hasPreact || hasSvelte || hasVue;
export const isAnalyze = !!process.env.ANALYZE;
