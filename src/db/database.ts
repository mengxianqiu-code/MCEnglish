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

    CREATE TABLE IF NOT EXISTS user_progress (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      emeralds INTEGER DEFAULT 0,
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_type TEXT NOT NULL,
      count INTEGER DEFAULT 1,
      name TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS saved_words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT NOT NULL,
      meaning TEXT NOT NULL,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS quiz_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      options TEXT NOT NULL, -- JSON array of options
      correct_answer TEXT NOT NULL,
      explanation TEXT NOT NULL,
      type TEXT NOT NULL -- 'multiple_choice', 'fill_blank', 'listening'
    );

    CREATE TABLE IF NOT EXISTS study_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      activity_type TEXT NOT NULL,
      xp_earned INTEGER DEFAULT 0,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migration: Add new columns to user_progress if they don't exist
  try {
    db.prepare('ALTER TABLE user_progress ADD COLUMN created_at TEXT DEFAULT CURRENT_TIMESTAMP').run();
  } catch (e) { /* Column likely exists */ }
  
  try {
    db.prepare('ALTER TABLE user_progress ADD COLUMN total_study_time INTEGER DEFAULT 0').run();
  } catch (e) { /* Column likely exists */ }

  try {
    db.prepare('ALTER TABLE user_progress ADD COLUMN mastered_words_count INTEGER DEFAULT 0').run();
  } catch (e) { /* Column likely exists */ }

  // Seed data if empty
  const packCount = db.prepare('SELECT COUNT(*) as count FROM packs').get() as { count: number };
  
  // Initialize user progress if not exists
  const userCount = db.prepare('SELECT COUNT(*) as count FROM user_progress').get() as { count: number };
  if (userCount.count === 0) {
    db.prepare('INSERT INTO user_progress (id, emeralds, xp, level) VALUES (1, 0, 0, 1)').run();
    
    // Seed initial inventory
    const insertItem = db.prepare('INSERT INTO inventory (item_type, count, name, description) VALUES (?, ?, ?, ?)');
    insertItem.run('ender_chest', 1, '末影箱', '存放你的生词和难点');
    insertItem.run('compass', 1, '探险指南针', '记录你的连续学习天数');
    insertItem.run('book_quill', 1, '冒险日记', '查看你的学习统计数据');
  }

  // Seed Quiz Questions
  const quizCount = db.prepare('SELECT COUNT(*) as count FROM quiz_questions').get() as { count: number };
  if (quizCount.count === 0) {
    const insertQuiz = db.prepare('INSERT INTO quiz_questions (question, options, correct_answer, explanation, type) VALUES (?, ?, ?, ?, ?)');
    db.transaction(() => {
      // Multiple Choice
      insertQuiz.run('What is the meaning of "environment"?', JSON.stringify(['提供', '环境', '保护', '自然']), '环境', 'Environment means the surroundings or conditions in which a person, animal, or plant lives.', 'multiple_choice');
      insertQuiz.run('Which word means "to build"?', JSON.stringify(['collect', 'achieve', 'build', 'allow']), 'build', 'Build means to construct something by putting parts or material together.', 'multiple_choice');
      
      // Fill in the Blank
      insertQuiz.run('The ____ provides everything we need to survive.', JSON.stringify(['nature', 'building', 'computer', 'car']), 'nature', 'Nature provides resources like food, water, and shelter.', 'fill_blank');
      
      // Listening (Simulated with text for now, but UI will use TTS)
      insertQuiz.run('Listen and select the correct word: "mysterious"', JSON.stringify(['mysterious', 'material', 'mountain', 'monster']), 'mysterious', 'The word spoken was "mysterious".', 'listening');
    })();
  }
  
  if (packCount.count === 0) {
    console.log('Seeding initial vocabulary packs...');
    
    const insertPack = db.prepare('INSERT INTO packs (name, description, theme, difficulty_level) VALUES (?, ?, ?, ?)');
    const insertWord = db.prepare('INSERT INTO words (pack_id, word, meaning) VALUES (?, ?, ?)');

    db.transaction(() => {
      // Level 1: Grade 3 (Peaceful Plains)
      const pack1 = insertPack.run('和平草原 (三年级)', '三年级基础词汇 (Lexile ~200L)。包含动物、食物、颜色等基础名词。', 'plains', 1);
      const p1Id = pack1.lastInsertRowid;
      const p1Words = [
        ['apple', 'n. 苹果'], ['banana', 'n. 香蕉'], ['cat', 'n. 猫'], ['dog', 'n. 狗'], 
        ['egg', 'n. 蛋'], ['fish', 'n. 鱼'], ['girl', 'n. 女孩'], ['hat', 'n. 帽子'], 
        ['ice', 'n. 冰'], ['jump', 'v. 跳跃'], ['kite', 'n. 风筝'], ['lion', 'n. 狮子'], 
        ['milk', 'n. 牛奶'], ['nose', 'n. 鼻子'], ['orange', 'n. 橙子'], ['pen', 'n. 钢笔'], 
        ['queen', 'n. 女王'], ['red', 'adj. 红色的'], ['sun', 'n. 太阳'], ['tree', 'n. 树'], 
        ['under', 'prep. 在...下面'], ['van', 'n. 货车'], ['water', 'n. 水'], ['box', 'n. 盒子'], 
        ['yellow', 'adj. 黄色的'], ['zoo', 'n. 动物园'], ['book', 'n. 书'], ['desk', 'n. 书桌'], 
        ['school', 'n. 学校'], ['teacher', 'n. 老师'], ['bird', 'n. 鸟'], ['cake', 'n. 蛋糕'],
        ['door', 'n. 门'], ['eye', 'n. 眼睛'], ['face', 'n. 脸'], ['game', 'n. 游戏'],
        ['hand', 'n. 手'], ['leg', 'n. 腿'], ['map', 'n. 地图'], ['name', 'n. 名字']
      ];
      p1Words.forEach(w => insertWord.run(p1Id, w[0], w[1]));

      // Level 2: Grade 4 (Oak Forest)
      const pack2 = insertPack.run('橡木森林 (四年级)', '四年级进阶词汇 (Lexile ~400L)。包含日常活动、职业、自然景观等。', 'forest', 2);
      const p2Id = pack2.lastInsertRowid;
      const p2Words = [
        ['breakfast', 'n. 早餐'], ['lunch', 'n. 午餐'], ['dinner', 'n. 晚餐'], ['morning', 'n. 早晨'], 
        ['afternoon', 'n. 下午'], ['evening', 'n. 晚上'], ['doctor', 'n. 医生'], ['nurse', 'n. 护士'], 
        ['driver', 'n. 司机'], ['farmer', 'n. 农民'], ['hospital', 'n. 医院'], ['station', 'n. 车站'], 
        ['cinema', 'n. 电影院'], ['library', 'n. 图书馆'], ['chicken', 'n. 鸡'], ['duck', 'n. 鸭'], 
        ['sheep', 'n. 绵羊'], ['horse', 'n. 马'], ['flower', 'n. 花'], ['grass', 'n. 草'], 
        ['river', 'n. 河流'], ['hill', 'n. 小山'], ['cloudy', 'adj. 多云的'], ['rainy', 'adj. 下雨的'], 
        ['snowy', 'adj. 下雪的'], ['windy', 'adj. 有风的'], ['spring', 'n. 春天'], ['summer', 'n. 夏天'], 
        ['autumn', 'n. 秋天'], ['winter', 'n. 冬天'], ['clock', 'n. 时钟'], ['photo', 'n. 照片'],
        ['music', 'n. 音乐'], ['math', 'n. 数学'], ['sport', 'n. 运动'], ['swim', 'v. 游泳'],
        ['run', 'v. 跑'], ['dance', 'v. 跳舞'], ['sing', 'v. 唱歌'], ['draw', 'v. 画画']
      ];
      p2Words.forEach(w => insertWord.run(p2Id, w[0], w[1]));

      // Level 3: Grade 5 (Ocean Monument)
      const pack3 = insertPack.run('深海神殿 (五年级)', '五年级核心词汇 (Lexile ~600L)。包含形容词、情感、反义词等。', 'ocean', 3);
      const p3Id = pack3.lastInsertRowid;
      const p3Words = [
        ['beautiful', 'adj. 美丽的'], ['clever', 'adj. 聪明的'], ['friendly', 'adj. 友好的'], ['polite', 'adj. 有礼貌的'], 
        ['helpful', 'adj. 有帮助的'], ['active', 'adj. 积极的'], ['careful', 'adj. 小心的'], ['popular', 'adj. 受欢迎的'], 
        ['quiet', 'adj. 安静的'], ['noisy', 'adj. 吵闹的'], ['cheap', 'adj. 便宜的'], ['expensive', 'adj. 昂贵的'], 
        ['dangerous', 'adj. 危险的'], ['safe', 'adj. 安全的'], ['heavy', 'adj. 重的'], ['light', 'adj. 轻的'], 
        ['thick', 'adj. 厚的'], ['thin', 'adj. 薄的'], ['empty', 'adj. 空的'], ['full', 'adj. 满的'], 
        ['hungry', 'adj. 饿的'], ['thirsty', 'adj. 渴的'], ['tired', 'adj. 累的'], ['excited', 'adj. 兴奋的'], 
        ['bored', 'adj. 无聊的'], ['interested', 'adj. 感兴趣的'], ['surprised', 'adj. 惊讶的'], ['worried', 'adj. 担心的'], 
        ['angry', 'adj. 生气的'], ['happy', 'adj. 快乐的'], ['travel', 'v. 旅行'], ['visit', 'v. 参观'],
        ['picnic', 'n. 野餐'], ['party', 'n. 聚会'], ['present', 'n. 礼物'], ['holiday', 'n. 假期'],
        ['festival', 'n. 节日'], ['world', 'n. 世界'], ['country', 'n. 国家'], ['city', 'n. 城市']
      ];
      p3Words.forEach(w => insertWord.run(p3Id, w[0], w[1]));

      // Level 4: Grade 6 (Mineshaft)
      const pack4 = insertPack.run('废弃矿井 (六年级)', '六年级综合词汇 (Lexile ~700L)。包含动词短语、过去式、未来计划等。', 'mineshaft', 4);
      const p4Id = pack4.lastInsertRowid;
      const p4Words = [
        ['invite', 'v. 邀请'], ['accept', 'v. 接受'], ['refuse', 'v. 拒绝'], ['agree', 'v. 同意'], 
        ['disagree', 'v. 不同意'], ['discuss', 'v. 讨论'], ['argue', 'v. 争论'], ['explain', 'v. 解释'], 
        ['describe', 'v. 描述'], ['imagine', 'v. 想象'], ['guess', 'v. 猜'], ['wonder', 'v. 想知道'], 
        ['notice', 'v. 注意到'], ['realize', 'v. 意识到'], ['recognize', 'v. 认出'], ['remember', 'v. 记得'], 
        ['forget', 'v. 忘记'], ['decide', 'v. 决定'], ['promise', 'v. 承诺'], ['finish', 'v. 完成'], 
        ['start', 'v. 开始'], ['begin', 'v. 开始'], ['continue', 'v. 继续'], ['stop', 'v. 停止'], 
        ['wait', 'v. 等待'], ['expect', 'v. 期待'], ['hope', 'v. 希望'], ['wish', 'v. 祝愿'], 
        ['dream', 'n./v. 梦想'], ['believe', 'v. 相信'], ['history', 'n. 历史'], ['science', 'n. 科学'],
        ['geography', 'n. 地理'], ['language', 'n. 语言'], ['culture', 'n. 文化'], ['hobby', 'n. 爱好'],
        ['collect', 'v. 收集'], ['stamp', 'n. 邮票'], ['coin', 'n. 硬币'], ['model', 'n. 模型']
      ];
      p4Words.forEach(w => insertWord.run(p4Id, w[0], w[1]));

      // Level 5: Grade 7 (Nether Fortress)
      const pack5 = insertPack.run('下界要塞 (七年级)', '七年级抽象词汇 (Lexile ~850L)。包含抽象名词、复杂动词、社会概念。', 'nether', 5);
      const p5Id = pack5.lastInsertRowid;
      const p5Words = [
        ['ability', 'n. 能力'], ['activity', 'n. 活动'], ['advice', 'n. 建议'], ['attention', 'n. 注意'], 
        ['background', 'n. 背景'], ['behavior', 'n. 行为'], ['century', 'n. 世纪'], ['challenge', 'n. 挑战'], 
        ['chance', 'n. 机会'], ['choice', 'n. 选择'], ['communication', 'n. 交流'], ['community', 'n. 社区'], 
        ['competition', 'n. 比赛'], ['condition', 'n. 条件'], ['confidence', 'n. 自信'], ['connection', 'n. 连接'], 
        ['conversation', 'n. 对话'], ['courage', 'n. 勇气'], ['culture', 'n. 文化'], ['custom', 'n. 习俗'], 
        ['danger', 'n. 危险'], ['decision', 'n. 决定'], ['difference', 'n. 差异'], ['direction', 'n. 方向'], 
        ['discussion', 'n. 讨论'], ['education', 'n. 教育'], ['effort', 'n. 努力'], ['energy', 'n. 能量'], 
        ['experience', 'n. 经验'], ['expression', 'n. 表达'], ['government', 'n. 政府'], ['population', 'n. 人口'],
        ['pollution', 'n. 污染'], ['environment', 'n. 环境'], ['technology', 'n. 技术'], ['invention', 'n. 发明'],
        ['information', 'n. 信息'], ['knowledge', 'n. 知识'], ['memory', 'n. 记忆'], ['method', 'n. 方法']
      ];
      p5Words.forEach(w => insertWord.run(p5Id, w[0], w[1]));

      // Level 6: Grade 8 (End City)
      const pack6 = insertPack.run('末地城 (八年级)', '八年级学术词汇 (Lexile ~1000L)。包含学术形容词、高级副词、文学词汇。', 'end', 6);
      const p6Id = pack6.lastInsertRowid;
      const p6Words = [
        ['absolute', 'adj. 绝对的'], ['academic', 'adj. 学术的'], ['acceptable', 'adj. 可接受的'], ['accidental', 'adj. 意外的'], 
        ['accurate', 'adj. 准确的'], ['actual', 'adj. 实际的'], ['additional', 'adj. 额外的'], ['adequate', 'adj. 充足的'], 
        ['administrative', 'adj. 行政的'], ['advanced', 'adj. 高级的'], ['aggressive', 'adj. 侵略性的'], ['agricultural', 'adj. 农业的'], 
        ['alternative', 'adj. 供替代的'], ['ambitious', 'adj. 有雄心的'], ['ancient', 'adj. 古代的'], ['annual', 'adj. 每年的'], 
        ['apparent', 'adj. 明显的'], ['appropriate', 'adj. 适当的'], ['artificial', 'adj. 人造的'], ['artistic', 'adj. 艺术的'], 
        ['ashamed', 'adj. 羞愧的'], ['asleep', 'adj. 睡着的'], ['assistant', 'n. 助手'], ['athletic', 'adj. 运动的'], 
        ['attractive', 'adj. 有吸引力的'], ['automatic', 'adj. 自动的'], ['available', 'adj. 可获得的'], ['average', 'adj. 平均的'], 
        ['aware', 'adj. 意识到的'], ['awful', 'adj. 可怕的'], ['biology', 'n. 生物学'], ['chemistry', 'n. 化学'],
        ['physics', 'n. 物理'], ['literature', 'n. 文学'], ['philosophy', 'n. 哲学'], ['psychology', 'n. 心理学'],
        ['economics', 'n. 经济学'], ['politics', 'n. 政治'], ['sociology', 'n. 社会学'], ['engineering', 'n. 工程学']
      ];
      p6Words.forEach(w => insertWord.run(p6Id, w[0], w[1]));

      // Level 7: Grade 9 (Ancient City)
      const pack7 = insertPack.run('远古城市 (九年级)', '九年级高阶词汇 (Lexile ~1150L)。包含复杂动词、新闻词汇、抽象概念。', 'deep_dark', 7);
      const p7Id = pack7.lastInsertRowid;
      const p7Words = [
        ['abandon', 'v. 放弃'], ['accompany', 'v. 陪伴'], ['accomplish', 'v. 完成'], ['accumulate', 'v. 积累'], 
        ['accuse', 'v. 指责'], ['acknowledge', 'v. 承认'], ['acquire', 'v. 获得'], ['adapt', 'v. 适应'], 
        ['adjust', 'v. 调整'], ['admire', 'v. 钦佩'], ['admit', 'v. 承认'], ['adopt', 'v. 收养'], 
        ['adore', 'v. 崇拜'], ['advocate', 'v. 提倡'], ['affect', 'v. 影响'], ['afford', 'v. 买得起'], 
        ['agency', 'n. 代理机构'], ['agenda', 'n. 议程'], ['aggressive', 'adj. 侵略性的'], ['agreement', 'n. 协议'], 
        ['agriculture', 'n. 农业'], ['aid', 'n. 援助'], ['alarm', 'n. 警报'], ['alcohol', 'n. 酒精'], 
        ['alert', 'adj. 警惕的'], ['alien', 'n. 外星人'], ['align', 'v. 对齐'], ['allegation', 'n. 指控'], 
        ['alleviate', 'v. 减轻'], ['alliance', 'n. 联盟'], ['anticipate', 'v. 预期'], ['appreciate', 'v. 欣赏'],
        ['approach', 'v. 接近'], ['approve', 'v. 批准'], ['arise', 'v. 出现'], ['arrest', 'v. 逮捕'],
        ['assess', 'v. 评估'], ['assign', 'v. 分配'], ['assist', 'v. 协助'], ['associate', 'v. 联想']
      ];
      p7Words.forEach(w => insertWord.run(p7Id, w[0], w[1]));

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

// User Progress & Inventory Functions
export function getUserProgress() {
  return db.prepare('SELECT * FROM user_progress WHERE id = 1').get();
}

export function updateUserProgress(emeralds: number, xp: number) {
  return db.prepare('UPDATE user_progress SET emeralds = emeralds + ?, xp = xp + ? WHERE id = 1').run(emeralds, xp);
}

export function getInventory() {
  return db.prepare('SELECT * FROM inventory').all();
}

export function getSavedWords() {
  return db.prepare('SELECT * FROM saved_words ORDER BY added_at DESC').all();
}

export function addSavedWord(word: string, meaning: string) {
  // Check if word already exists
  const exists = db.prepare('SELECT id FROM saved_words WHERE word = ?').get(word);
  if (!exists) {
    return db.prepare('INSERT INTO saved_words (word, meaning) VALUES (?, ?)').run(word, meaning);
  }
  return null;
}

export function removeSavedWord(id: number) {
  return db.prepare('DELETE FROM saved_words WHERE id = ?').run(id);
}

export function getQuizQuestions() {
  return db.prepare('SELECT * FROM quiz_questions ORDER BY RANDOM() LIMIT 5').all();
}

export function getStudyLogs() {
  return db.prepare('SELECT * FROM study_logs ORDER BY timestamp DESC LIMIT 10').all();
}

export function logActivity(activityType: string, xpEarned: number) {
  return db.prepare('INSERT INTO study_logs (activity_type, xp_earned) VALUES (?, ?)').run(activityType, xpEarned);
}

export function incrementStudyTime(minutes: number) {
  return db.prepare('UPDATE user_progress SET total_study_time = total_study_time + ? WHERE id = 1').run(minutes);
}

export function incrementMasteredWords() {
  return db.prepare('UPDATE user_progress SET mastered_words_count = mastered_words_count + 1 WHERE id = 1').run();
}
