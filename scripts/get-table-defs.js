const Database = require(process.cwd() + "/node_modules/better-sqlite3");
const db = new Database("dev.db");
const rows = db.prepare(
  "SELECT sql FROM sqlite_master WHERE type='table' AND name IN ('Refund','RefundItem')"
).all();
rows.forEach(r => console.log(r.sql + ";\n"));

const indexes = db.prepare(
  "SELECT sql FROM sqlite_master WHERE type='index' AND tbl_name IN ('Refund','RefundItem') AND sql IS NOT NULL"
).all();
indexes.forEach(r => console.log(r.sql + ";"));
