const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const taroCache = path.join(process.cwd(), '.taro-cache');
if (!fs.existsSync(taroCache)) {
  fs.mkdirSync(taroCache, { recursive: true });
}

const result = spawnSync(
  'node',
  ['node_modules/@tarojs/cli/bin/taro', 'build', '--type', 'h5'],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      TARO_CACHE_DIR: taroCache,
      HOME: process.cwd(),
      USERPROFILE: process.cwd()
    }
  }
);

process.exit(result.status);
