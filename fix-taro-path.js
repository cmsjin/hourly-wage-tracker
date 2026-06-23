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
        if (content.includes('getTaroPath') && content.includes('getUserHomeDir')) {
          content = content.replace(/function getTaroPath\(\) \{[\s\S]*?return taroPath;[\s\S]*?\}/, 
            'function getTaroPath() { const taroPath = path.join(process.cwd(), ".taro-cache"); if (!fs.existsSync(taroPath)) { fs.ensureDirSync(taroPath); } return taroPath; }');
          fs.writeFileSync(full, content);
          console.log('Fixed:', full);
        }
      } catch(e) {}
    }
  });
}

findAndFix('node_modules/@tarojs');
