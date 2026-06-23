const fs = require('fs');
const path = require('path');

function findAndFix(dir) {
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      findAndFix(full);
    } else if (full.endsWith('utils.js')) {
      try {
        let content = fs.readFileSync(full, 'utf8');
        if (content.includes('getUserHomeDir')) {
          content = content.replace(/function getUserHomeDir\(\) \{[\s\S]*?\}/, 
            'function getUserHomeDir() { return process.cwd(); }');
          fs.writeFileSync(full, content);
          console.log('Fixed getUserHomeDir:', full);
        }
      } catch(e) {}
    }
  });
}

findAndFix('node_modules/@tarojs');
