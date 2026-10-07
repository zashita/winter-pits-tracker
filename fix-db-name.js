const fs = require('fs');
let c = fs.readFileSync('yama-server/src/app.module.ts', 'utf8');
c = c.replace("database: 'yama_db',", "database: 'yama-bd',");
fs.writeFileSync('yama-server/src/app.module.ts', c);
console.log('Fixed to yama-bd');
