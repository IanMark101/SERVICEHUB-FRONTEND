/* eslint-disable @typescript-eslint/no-require-imports -- This plugin must load from Next's CommonJS config transpiler. */
const path = require('node:path');
const { randomUUID } = require('node:crypto');

const patched = Symbol('servicehub.atomic-dev-manifests');

// Webpack truncates emitted JSON files before writing. A simultaneous Next
// request can read that empty file. Publish complete manifests with rename.
class AtomicDevManifestsPlugin {
  constructor(devDirectory) {
    this.devDirectory = path.resolve(devDirectory);
  }

  apply(compiler) {
    compiler.hooks.afterEnvironment.tap('AtomicDevManifests', () => {
      const fileSystem = compiler.outputFileSystem;
      if (fileSystem[patched]) return;
      fileSystem[patched] = true;
      const original = fileSystem.writeFile;
      const devDirectory = this.devDirectory;
      fileSystem.writeFile = function (filename, ...args) {
        const relative = typeof filename === 'string' ? path.relative(devDirectory, filename) : '..';
        if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)
          || !path.basename(relative).endsWith('-manifest.json')) {
          return original.call(this, filename, ...args);
        }
        const callback = args.pop();
        const temporary = `${filename}.${randomUUID()}.tmp`;
        const cleanup = error => this.unlink(temporary, () => callback(error));
        return original.call(this, temporary, ...args, error => {
          if (error) { cleanup(error); return; }
          this.rename(temporary, filename, error => {
            if (error) cleanup(error);
            else callback(null);
          });
        });
      };
    });
  }
}

module.exports = AtomicDevManifestsPlugin;
