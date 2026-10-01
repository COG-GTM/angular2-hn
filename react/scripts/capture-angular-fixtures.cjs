// Run from the repo root: node react/scripts/capture-angular-fixtures.cjs
// Runs the Angular pipe/component logic from src/app under Node with stubbed
// Angular decorators and records outputs as JSON fixtures.
const fs = require('fs');
const path = require('path');
const Module = require('module');
const ts = require(path.resolve('react/node_modules/typescript'));

const stubs = {
  '@angular/core': { Pipe: () => (c) => c, Component: () => (c) => c, Input: () => () => {}, Injectable: () => (c) => c },
};
function load(file) {
  const src = fs.readFileSync(file, 'utf8');
  const out = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, experimentalDecorators: true } });
  const m = new Module(file);
  m.paths = [];
  m.require = (id) => {
    if (id in stubs) return stubs[id];
    if (id.startsWith('.')) return {}; // services/models are only used as types
    throw new Error('unexpected import ' + id);
  };
  m._compile(out.outputText, file);
  return m.exports;
}

const { CommentPipe } = load('src/app/shared/pipes/comment.pipe.ts');
const pipe = new CommentPipe();
const commentInputs = [0, 1, 2, 3, 10, 87, 100, 1234, -1];
const commentPipe = commentInputs.map((input) => ({ input, output: pipe.transform(input) }));

const { ItemComponent } = load('src/app/feeds/item/item.component.ts');
const { ItemDetailsComponent } = load('src/app/item-details/item-details.component.ts');
const urls = ['https://example.com/a', 'http://example.com', 'item?id=41000002', '/item/1', 'ftp://x.y', 'httpfoo', 'mailto:a@b.c', ''];
const hasUrl = urls.map((url) => {
  const feedItem = new ItemComponent({ settings: {} });
  feedItem.item = { url };
  const details = new ItemDetailsComponent({}, { settings: {} }, {}, {});
  details.item = { url };
  return { url, feedItem: feedItem.hasUrl, itemDetails: details.hasUrl };
});

fs.writeFileSync('react/src/utils/fixtures/angular-outputs.json', JSON.stringify({ commentPipe, hasUrl }, null, 2) + '\n');
console.log(JSON.stringify({ commentPipe, hasUrl }));
