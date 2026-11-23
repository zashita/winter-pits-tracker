const fs = require('fs');
const path = require('path');

module.exports = function loadEnv(projectRoot) {
  const loaded = {};
  for (const fileName of ['.env', '.env.local']) {
    const filePath = path.join(projectRoot, fileName);
    if (!fs.existsSync(filePath)) continue;

    for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!match || match[2].startsWith('#')) continue;

      let value = match[2];
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      } else {
        value = value.replace(/\s+#.*$/, '').trim();
      }
      loaded[match[1]] = value;
    }
  }

  for (const [key, value] of Object.entries(loaded)) {
    if (process.env[key] === undefined) process.env[key] = value;
  }
};
