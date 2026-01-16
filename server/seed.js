import dotenv from "dotenv";
import pg from "pg";
import { fakerRU } from "@faker-js/faker";
import bcrypt from "bcryptjs";

dotenv.config();

const { Pool } = pg;
const faker = fakerRU;

const CONFIG = {
  USERS_COUNT: 20,
  PUBLICATIONS_COUNT: 15,
  REVIEWS_COUNT: 50,
  PASSWORD: "password123"
};

const pool = new Pool({
  user: process.env.PGUSER || "postgres",
  host: process.env.PGHOST || "localhost",
  database: process.env.PGDATABASE || "lobotomy_db",
  password: process.env.PGPASSWORD || "postgres",
  port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
});

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const seed = async () => {
  let client;
  try {
    client = await pool.connect();
    console.log(" Подключение успешно.");
    await client.query("BEGIN");

    // --- ДИАГНОСТИКА ---
    const userColumnsRes = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'users'`);
    const userCols = userColumnsRes.rows.map(r => r.column_name);
    let passwordField = userCols.includes("password_hash") ? "password_hash" : "password";
    let avatarField = userCols.includes("avatar_url") ? "avatar_url" : "avatar";

    const reviewColumnsRes = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'reviews'`);
    const reviewCols = reviewColumnsRes.rows.map(r => r.column_name);
    let likesField = reviewCols.includes("likes_count") ? "likes_count" : "likes";
    
    const pubColumnsRes = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'publications'`);
    const pubCols = pubColumnsRes.rows.map(r => r.column_name);
    let pubImageField = pubCols.includes("image_url") ? "image_url" : "image";
    if (!pubCols.includes(pubImageField) && pubCols.includes("cover_image")) pubImageField = "cover_image";
    
    // 1. Создание пользователей
    console.log(`Creating users...`);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(CONFIG.PASSWORD, salt);
    
    for (let i = 0; i < CONFIG.USERS_COUNT; i++) {
      const username = faker.internet.userName ? faker.internet.userName() : faker.internet.username(); 
      const email = faker.internet.email();
      const avatar = Math.random() > 0.2 ? faker.image.avatar() : null; 
      const createdAt = faker.date.past({ years: 1 });

      try {
        await client.query("SAVEPOINT sp_user");
        await client.query(
          `INSERT INTO users (username, email, ${passwordField}, ${avatarField}, role, created_at)
           VALUES ($1, $2, $3, $4, 'user', $5)
           ON CONFLICT (username) DO NOTHING`,
          [username, email, hashedPassword, avatar, createdAt]
        );
        await client.query("RELEASE SAVEPOINT sp_user");
      } catch (err) {
         await client.query("ROLLBACK TO SAVEPOINT sp_user");
      }
    }
    
    const existingUsers = await client.query("SELECT id FROM users");
    const allUserIds = existingUsers.rows.map(r => r.id);
    console.log(`Users count: ${allUserIds.length}`);

    // 2. Игры
    const gamesRes = await client.query("SELECT id FROM games");
    const gameIds = gamesRes.rows.map(r => r.id);
    console.log(`🎮 Games found: ${gameIds.length}`);

    // 3. Генерация ПУБЛИКАЦИЙ
    console.log(`Generating ${CONFIG.PUBLICATIONS_COUNT} publications...`);
    for (let i = 0; i < CONFIG.PUBLICATIONS_COUNT; i++) {
        const userId = sample(allUserIds);
        const gameId = gameIds.length > 0 && Math.random() > 0.3 ? sample(gameIds) : null;
        const title = faker.lorem.sentence({ min: 3, max: 8 });
        const type = Math.random() > 0.5 ? 'news' : 'article'; // Заполняем поле type
        const content = `
          <p>${faker.lorem.paragraph()}</p>
          <h3>${faker.lorem.sentence()}</h3>
          <p>${faker.lorem.paragraph()}</p>
        `;
        // Используем picsum.photos для валидных картинок
        const imageUrl = `https://picsum.photos/seed/${randomInt(1, 1000)}/800/400`; 
        const createdAt = faker.date.past({ years: 0.5 });
        const views = randomInt(50, 5000);
        const likes = randomInt(0, 200);

        try {
            await client.query("SAVEPOINT sp_pub");
            await client.query(
                `INSERT INTO publications (title, content, user_id, game_id, ${pubImageField}, type, views, likes, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [title, content, userId, gameId, imageUrl, type, views, likes, createdAt]
            );
            await client.query("RELEASE SAVEPOINT sp_pub");
        } catch (e) {
            await client.query("ROLLBACK TO SAVEPOINT sp_pub");
            console.error(` Pub insert failed: ${e.message}`);
        }
    }

    // 4. Комментарии (к новым публикациям)
    const publicationsRes = await client.query("SELECT id FROM publications");
    const pubIds = publicationsRes.rows.map(r => r.id);
    
    if (pubIds.length > 0) {
      console.log(`Generating comments for ${pubIds.length} publications...`);
      const commentsColsRes = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'comments'`);
      const comCols = commentsColsRes.rows.map(r => r.column_name);
      let comLikesField = comCols.includes("likes_count") ? "likes_count" : "likes";

      for (const pubId of pubIds) {
        const commentsCount = randomInt(1, 8);
        for (let k = 0; k < commentsCount; k++) {
            const userId = sample(allUserIds);
            const content = faker.lorem.sentences(randomInt(1, 3));
            const createdAt = faker.date.recent({ days: 30 });
            const likesCount = randomInt(0, 20);

            try {
                await client.query("SAVEPOINT sp_com");
                const commentRes = await client.query(
                    `INSERT INTO comments (user_id, publication_id, content, ${comLikesField}, created_at)
                     VALUES ($1, $2, $3, $4, $5)
                     RETURNING id`,
                    [userId, pubId, content, likesCount, createdAt]
                );
                await client.query("RELEASE SAVEPOINT sp_com");
            } catch(e) {
                 await client.query("ROLLBACK TO SAVEPOINT sp_com");
                 console.error(`Comment failed: ${e.message}`);
            }
        }
      }
    }

    await client.query("COMMIT");
    console.log("Done!");

  } catch (err) {
    if (client) await client.query("ROLLBACK");
    console.error("GLOBAL ERROR:", err);
  } finally {
    if (client) client.release();
    await pool.end();
  }
};

seed();
