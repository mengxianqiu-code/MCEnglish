import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'lingoteen.db'));

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS packs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      theme TEXT NOT NULL,
      difficulty_level INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pack_id INTEGER NOT NULL,
      word TEXT NOT NULL,
      meaning TEXT NOT NULL,
      FOREIGN KEY(pack_id) REFERENCES packs(id)
    );
  `);

  // Seed data if empty
  const packCount = db.prepare('SELECT COUNT(*) as count FROM packs').get() as { count: number };
  
  if (packCount.count === 0) {
    console.log('Seeding initial vocabulary packs...');
    
    const insertPack = db.prepare('INSERT INTO packs (name, description, theme, difficulty_level) VALUES (?, ?, ?, ?)');
    const insertWord = db.prepare('INSERT INTO words (pack_id, word, meaning) VALUES (?, ?, ?)');

    db.transaction(() => {
      // Pack 1: Overworld (Basic 8th Grade)
      const pack1 = insertPack.run('主世界群系', '初二基础词汇 (Lexile ~600L)。适合作为热身，包含日常环境与生存基础词汇。', 'overworld', 1);
      const p1Id = pack1.lastInsertRowid;
      insertWord.run(p1Id, 'environment', 'n. 环境；周围状况');
      insertWord.run(p1Id, 'provide', 'v. 提供；供应');
      insertWord.run(p1Id, 'protect', 'v. 保护；防卫');
      insertWord.run(p1Id, 'natural', 'adj. 自然的；天然的');
      insertWord.run(p1Id, 'surface', 'n. 表面；表层');
      insertWord.run(p1Id, 'material', 'n. 材料；物质');
      insertWord.run(p1Id, 'collect', 'v. 收集；搜集');
      insertWord.run(p1Id, 'build', 'v. 建筑；建造');

      // Pack 2: The Nether (Intermediate 8th Grade)
      const pack2 = insertPack.run('下界要塞', '初二进阶词汇 (Lexile ~800L)。包含更抽象的动词和形容词，适合应对复杂阅读。', 'nether', 2);
      const p2Id = pack2.lastInsertRowid;
      insertWord.run(p2Id, 'temperature', 'n. 温度；体温');
      insertWord.run(p2Id, 'extreme', 'adj. 极端的；极度的');
      insertWord.run(p2Id, 'dangerous', 'adj. 危险的');
      insertWord.run(p2Id, 'survive', 'v. 生存；存活');
      insertWord.run(p2Id, 'resource', 'n. 资源；财力');
      insertWord.run(p2Id, 'explore', 'v. 探索；探测');
      insertWord.run(p2Id, 'discover', 'v. 发现；发觉');
      insertWord.run(p2Id, 'condition', 'n. 条件；状况');

      // Pack 3: The End (Advanced 8th Grade)
      const pack3 = insertPack.run('末地城', '初二挑战词汇 (Lexile ~1000L)。包含较难的学术词汇，为高中英语打基础。', 'end', 3);
      const p3Id = pack3.lastInsertRowid;
      insertWord.run(p3Id, 'mysterious', 'adj. 神秘的；不可思议的');
      insertWord.run(p3Id, 'invisible', 'adj. 看不见的；无形的');
      insertWord.run(p3Id, 'teleport', 'v. 瞬间移动；传送');
      insertWord.run(p3Id, 'conquer', 'v. 征服；战胜');
      insertWord.run(p3Id, 'ultimate', 'adj. 最终的；极限的');
      insertWord.run(p3Id, 'fascinating', 'adj. 迷人的；极有吸引力的');
      insertWord.run(p3Id, 'independent', 'adj. 独立的；自主的');
      insertWord.run(p3Id, 'observe', 'v. 观察；观测');
    })();
  }
}

export function getPacks() {
  return db.prepare('SELECT * FROM packs ORDER BY difficulty_level ASC').all();
}

export function getWordsByPack(packId: number) {
  return db.prepare('SELECT * FROM words WHERE pack_id = ?').all(packId);
}
