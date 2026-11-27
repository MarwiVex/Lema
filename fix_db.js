const sqlite3 = require('node:sqlite');
const db = new sqlite3.DatabaseSync('./dev.db');
db.exec("UPDATE Document SET content = replace(content, 'draw[grid,', 'draw[step=1cm,') WHERE title = 'Test KaTeX'");
console.log('Fixed DB');
