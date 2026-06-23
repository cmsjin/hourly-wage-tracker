const fs = require('fs');
const path = require('path');

function findAndFix(dir) {
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      findAndFix(full);
    } else if (full.endsWith('constants.js')) {
      try {
        let content = fs.readFileSync(full, 'utf8');
        if (content.includes('.taro3.6-rs')) {
          content = content.replace('.taro3.6-rs', '.taro-cache');
          fs.writeFileSync(full, content);
          console.log('Fixed:', full);
        }
      } catch(e) {}
    }
  });
}

findAndFix('node_modules/@tarojs');
