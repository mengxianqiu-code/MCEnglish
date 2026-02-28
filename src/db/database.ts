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

    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      difficulty_level INTEGER NOT NULL,
      theme TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS scenarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      character_name TEXT NOT NULL,
      character_gender TEXT NOT NULL,
      initial_message TEXT NOT NULL
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
      const p1Words = [
        ['environment', 'n. 环境；周围状况'],
        ['provide', 'v. 提供；供应'],
        ['protect', 'v. 保护；防卫'],
        ['natural', 'adj. 自然的；天然的'],
        ['surface', 'n. 表面；表层'],
        ['material', 'n. 材料；物质'],
        ['collect', 'v. 收集；搜集'],
        ['build', 'v. 建筑；建造'],
        ['achieve', 'v. 达到；完成'],
        ['allow', 'v. 允许；准许'],
        ['amazing', 'adj. 令人惊异的'],
        ['ancient', 'adj. 古老的；古代的'],
        ['appear', 'v. 出现；显露'],
        ['area', 'n. 面积；地区'],
        ['believe', 'v. 相信；认为'],
        ['benefit', 'n. 利益；好处'],
        ['brave', 'adj. 勇敢的'],
        ['bright', 'adj. 明亮的；聪明的'],
        ['busy', 'adj. 忙碌的'],
        ['careful', 'adj. 小心的；仔细的']
      ];
      p1Words.forEach(w => insertWord.run(p1Id, w[0], w[1]));

      // Pack 2: The Nether (Intermediate 8th Grade)
      const pack2 = insertPack.run('下界要塞', '初二进阶词汇 (Lexile ~800L)。包含更抽象的动词和形容词，适合应对复杂阅读。', 'nether', 2);
      const p2Id = pack2.lastInsertRowid;
      const p2Words = [
        ['temperature', 'n. 温度；体温'],
        ['extreme', 'adj. 极端的；极度的'],
        ['dangerous', 'adj. 危险的'],
        ['survive', 'v. 生存；存活'],
        ['resource', 'n. 资源；财力'],
        ['explore', 'v. 探索；探测'],
        ['discover', 'v. 发现；发觉'],
        ['condition', 'n. 条件；状况'],
        ['challenge', 'n. 挑战 v. 向...挑战'],
        ['compare', 'v. 比较；对照'],
        ['connect', 'v. 连接；联系'],
        ['control', 'v. 控制；管理'],
        ['create', 'v. 创造；引起'],
        ['culture', 'n. 文化；文明'],
        ['decide', 'v. 决定；下决心'],
        ['degree', 'n. 程度；度数'],
        ['depend', 'v. 依靠；依赖'],
        ['design', 'v. 设计；构思'],
        ['develop', 'v. 发展；形成'],
        ['direct', 'adj. 直接的 v. 指导']
      ];
      p2Words.forEach(w => insertWord.run(p2Id, w[0], w[1]));

      // Pack 3: The End (Advanced 8th Grade)
      const pack3 = insertPack.run('末地城', '初二挑战词汇 (Lexile ~1000L)。包含较难的学术词汇，为高中英语打基础。', 'end', 3);
      const p3Id = pack3.lastInsertRowid;
      const p3Words = [
        ['mysterious', 'adj. 神秘的；不可思议的'],
        ['invisible', 'adj. 看不见的；无形的'],
        ['teleport', 'v. 瞬间移动；传送'],
        ['conquer', 'v. 征服；战胜'],
        ['ultimate', 'adj. 最终的；极限的'],
        ['fascinating', 'adj. 迷人的；极有吸引力的'],
        ['independent', 'adj. 独立的；自主的'],
        ['observe', 'v. 观察；观测'],
        ['complex', 'adj. 复杂的；合成的'],
        ['confuse', 'v. 使困惑；混淆'],
        ['consider', 'v. 考虑；认为'],
        ['contain', 'v. 包含；容纳'],
        ['continue', 'v. 继续；延续'],
        ['creative', 'adj. 创造性的'],
        ['curious', 'adj. 好奇的'],
        ['current', 'adj. 当前的；流通的'],
        ['damage', 'n./v. 损害；毁坏'],
        ['declare', 'v. 宣布；声明'],
        ['decrease', 'v. 减少；减小'],
        ['delicate', 'adj. 微妙的；精美的']
      ];
      p3Words.forEach(w => insertWord.run(p3Id, w[0], w[1]));
    })();

    // Seed Articles
    const insertArticle = db.prepare('INSERT INTO articles (title, content, difficulty_level, theme) VALUES (?, ?, ?, ?)');
    db.transaction(() => {
      // Level 1: Overworld
      insertArticle.run('The Secret of the Forest', 'In the vast Overworld, there is a mysterious forest. Steve likes to explore it every morning. He finds many animals like pigs and cows. One day, he discovered a hidden cave behind a waterfall. Inside the cave, there were glowing mushrooms and ancient stones. He realized that nature provides everything he needs to survive.', 1, 'overworld');
      insertArticle.run('Building a Home', 'Building a house is the first step for any adventurer. You need to collect wood from trees and stones from the ground. A good house protects you from zombies at night. Steve built a small cottage near a lake. He used glass for windows to see the beautiful sunset. It is important to have a safe place to rest after a long day of mining.', 1, 'overworld');
      insertArticle.run('The Friendly Wolf', 'Steve met a wild wolf in the snowy mountains. He gave the wolf some bones, and it became his loyal friend. Now, the wolf follows Steve everywhere. They protect each other from danger. Having a pet in the world of Minecraft makes the journey less lonely. They share many adventures together in the wild.', 1, 'overworld');

      // Level 2: Nether
      insertArticle.run('The Heat of the Nether', 'The Nether is a dangerous dimension filled with fire and lava. The temperature is extremely high, and you must be very careful. To enter the Nether, you need an obsidian portal. Once inside, you can find rare resources like quartz and ancient debris. However, ghasts and piglins are always watching. Survival here requires better armor and quick thinking.', 2, 'nether');
      insertArticle.run('Trading with Piglins', 'Piglins are the inhabitants of the Nether. They love gold more than anything else. If you wear gold armor, they will not attack you. You can trade gold ingots for useful items like ender pearls or fire resistance potions. This "bartering" system is essential for explorers who want to reach the End dimension. It is a unique way of getting resources in a hostile environment.', 2, 'nether');
      insertArticle.run('The Fortress Challenge', 'Deep in the Nether, there are massive fortresses made of nether bricks. These structures are guarded by blazes and wither skeletons. Finding a fortress is a major challenge for any player. Inside, you can find blaze rods, which are necessary for brewing potions. Conquering a fortress is a sign that you are becoming a master adventurer.', 2, 'nether');

      // Level 3: End
      insertArticle.run('The Silent Void', 'The End is a mysterious place consisting of floating islands in a dark void. There is no sun or moon, only the purple glow of ender crystals. The air is silent, and the ground is made of end stone. To reach the outer islands, you must defeat the Ender Dragon. It is an ultimate test of skill and preparation. Many explorers find the End to be the most fascinating part of their journey.', 3, 'end');
      insertArticle.run('The Wings of Flight', 'In the outer islands of the End, you can find End Cities. These tall towers contain the most valuable treasure: the Elytra. The Elytra are magical wings that allow you to glide through the sky. With them, you can explore the world from a new perspective. However, getting them is not easy, as you must navigate through shulkers that can make you float away.', 3, 'end');
      insertArticle.run('The Dragon Egg', 'After defeating the Ender Dragon, a mysterious egg appears on top of the exit portal. This egg is a unique trophy that represents your victory. It is a symbol of power and achievement. Some say the egg holds the potential for a new beginning. Keeping the egg safe in your base is a tradition for many legendary players who have conquered the End.', 3, 'end');
    })();

    // Seed Scenarios
    const insertScenario = db.prepare('INSERT INTO scenarios (name, description, character_name, character_gender, initial_message) VALUES (?, ?, ?, ?, ?)');
    db.transaction(() => {
      insertScenario.run('村庄集市交易', '在阳光明媚的村庄集市，与经验丰富的图书管理员商量附魔书的价格。', 'Barnaby', 'male', 'Hello there, traveler! I have some very rare enchanted books today. Are you looking for something special to upgrade your gear?');
      insertScenario.run('农场丰收对话', '在繁忙的农场，与勤劳的农民讨论农作物的收成和种子的交换。', 'Elara', 'female', 'Oh, hello! The harvest has been quite abundant this year. Would you like to trade some emeralds for my fresh carrots and potatoes?');
    })();
  }
}

export function getPacks() {
  return db.prepare('SELECT * FROM packs ORDER BY difficulty_level ASC').all();
}

export function getWordsByPack(packId: number) {
  return db.prepare('SELECT * FROM words WHERE pack_id = ?').all(packId);
}

export function getArticlesByDifficulty(level: number) {
  return db.prepare('SELECT * FROM articles WHERE difficulty_level = ?').all(level);
}

export function getArticleById(id: number) {
  return db.prepare('SELECT * FROM articles WHERE id = ?').get(id);
}

export function getScenarios() {
  return db.prepare('SELECT * FROM scenarios').all();
}

export function getScenarioById(id: number) {
  return db.prepare('SELECT * FROM scenarios WHERE id = ?').get(id);
}
