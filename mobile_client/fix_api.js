const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;
      // Replace api.get('/api/ to api.get('/
      content = content.replace(/api\.(get|post|put|patch|delete)\('\/api\//g, "api.$1('/");
      // Replace api.get(`/api/ to api.get(`/
      content = content.replace(/api\.(get|post|put|patch|delete)\(`\/api\//g, "api.$1(`/");
      
      if (original !== content) {
        fs.writeFileSync(fullPath, content);
        console.log('Fixed:', fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, 'screens'));
processDir(path.join(__dirname, 'context'));
processDir(path.join(__dirname, 'components'));
console.log('Done');
