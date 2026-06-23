const fs = require('fs');
const path = require('path');

function findAndFix(dir) {
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      findAndFix(full);
    } else if (full.endsWith('utils.js') && !full.includes('node_modules/node_modules')) {
      try {
        let content = fs.readFileSync(full, 'utf8');
        if (content.includes('function getUserHomeDir')) {
          content = content.replace(/function getUserHomeDir\(\)[\s\S]*?exports\.getUserHomeDir = getUserHomeDir;/, 
            'function getUserHomeDir() { return process.cwd(); }\nexports.getUserHomeDir = getUserHomeDir;');
          fs.writeFileSync(full, content);
          console.log('Fixed:', full);
        }
      } catch(e) {}
    }
  });
}

findAndFix('node_modules/@tarojs');
