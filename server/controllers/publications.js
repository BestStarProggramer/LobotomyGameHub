import { pool, query } from "../db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLIENT_PUBLIC_DIR = path.resolve(__dirname, "../../client/public");

const processContentImages = (content, publicationId) => {
  if (!content) return "";
  const tempImgRegex = /src="\/upload\/publications\/temp\/([^"]+)"/g;
  const targetRelDir = `/upload/publications/${publicationId}`;
  const targetAbsDir = path.join(CLIENT_PUBLIC_DIR, targetRelDir);
  if (!fs.existsSync(targetAbsDir)) {
    fs.mkdirSync(targetAbsDir, { recursive: true });
  }
  return content.replace(tempImgRegex, (match, filename) => {
    const tempAbsPath = path.join(
      CLIENT_PUBLIC_DIR,
      `/upload/publications/temp/${filename}`
    );
    const targetAbsPath = path.join(targetAbsDir, filename);
    if (fs.existsSync(tempAbsPath)) {
      try {
        fs.copyFileSync(tempAbsPath, targetAbsPath);
        fs.unlinkSync(tempAbsPath);
      } catch (e) {
        console.error(`Error moving file ${filename}:`, e);
      }
    }
    return `src="${targetRelDir}/${filename}"`;
  });
};

const resolveContent = (contentData) => {
  if (contentData && contentData.startsWith("/upload/")) {
    const filePath = path.join(CLIENT_PUBLIC_DIR, contentData);
    if (fs.existsSync(filePath)) return fs.readFileSync(filePath, "utf-8");
    return "";
  }
  return contentData || "";
};

export const uploadPublicationImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const { publicationId } = req.body;
    const folderName =
      publicationId && publicationId !== "undefined" ? publicationId : "temp";
    const relDir = `/upload/publications/${folderName}`;
    const absDir = path.join(CLIENT_PUBLIC_DIR, relDir);
    if (!fs.existsSync(absDir)) fs.mkdirSync(absDir, { recursive: true });

    const ext = path.extname(req.file.originalname);
    const fileName = `img_${Date.now()}_${Math.round(
      Math.random() * 1e9
    )}${ext}`;
    const targetPath = path.join(absDir, fileName);
    fs.copyFileSync(req.file.path, targetPath);
    fs.unlinkSync(req.file.path);
    return res.status(200).json({ url: `${relDir}/${fileName}` });
  } catch (err) {
    console.error("Upload image error:", err);
    return res.status(500).json({ error: "Ошибка загрузки изображения" });
  }
};

export const getPublications = async (req, res) => {
  try {
    const { type } = req.query;
    let queryText = `
      SELECT 
        p.id, p.type, p.title, p.image, p.created_at, p.views, p.likes,
        u.id AS author_id, u.username, u.avatar_url,
        (SELECT COUNT(*) FROM comments WHERE publication_id = p.id) AS comments_count,
        COALESCE(
          (
            SELECT json_agg(json_build_object('id', g.id, 'title', g.title, 'slug', g.slug))
            FROM publication_games pg
            JOIN games g ON pg.game_id = g.id
            WHERE pg.publication_id = p.id
          ), '[]'
        ) AS games
      FROM publications p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    if (type && type !== "all") {
      queryText += ` AND p.type = $${params.length + 1}`;
      params.push(type);
    }
    queryText += ` ORDER BY p.created_at DESC`;

    const result = await query(queryText, params);

    const publications = result.rows.map((row) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      author: {
        id: row.author_id,
        username: row.username || "Неизвестный",
        avatar: row.avatar_url || "/img/default-avatar.jpg",
      },
      date: new Date(row.created_at).toLocaleDateString("ru-RU"),
      commentsCount: Number(row.comments_count) || 0,
      likesCount: Number(row.likes) || 0,
      views: Number(row.views) || 0,
      imageUrl: row.image || "/img/game_poster.jpg",
      games: row.games || [],
    }));

    res.status(200).json(publications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

export const getPublicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.userInfo ? req.userInfo.id : null;

    const q = `
      SELECT 
        p.id, p.type, p.title, p.content, p.image, p.views, p.likes, p.created_at,
        u.id AS author_id, u.username, u.avatar_url,
        (SELECT COUNT(*) FROM comments WHERE publication_id = p.id) AS comments_count,
        CASE 
          WHEN $2::bigint IS NOT NULL THEN 
            EXISTS(SELECT 1 FROM publication_likes pl WHERE pl.publication_id = p.id AND pl.user_id = $2)
          ELSE FALSE 
        END as is_liked,
        COALESCE(
          (
            SELECT json_agg(json_build_object('id', g.id, 'title', g.title, 'slug', g.slug, 'image', g.background_image))
            FROM publication_games pg
            JOIN games g ON pg.game_id = g.id
            WHERE pg.publication_id = p.id
          ), '[]'
        ) AS games
      FROM publications p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = $1
    `;

    const result = await query(q, [id, currentUserId]);

    if (!result.rows.length) {
      return res.status(404).json({ error: "Публикация не найдена" });
    }

    const row = result.rows[0];
    const htmlContent = resolveContent(row.content);

    res.status(200).json({
      id: row.id,
      type: row.type,
      title: row.title,
      content: htmlContent,
      author: {
        id: row.author_id,
        username: row.username,
        avatar: row.avatar_url,
      },
      date: new Date(row.created_at).toLocaleDateString("ru-RU"),
      commentsCount: Number(row.comments_count),
      views: Number(row.views),
      likes: Number(row.likes),
      isLiked: row.is_liked,
      imageUrl: row.image,
      games: row.games,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

export const addPublication = async (req, res) => {
  const client = await pool.connect();
  try {
    const { title, content, type, game_ids } = req.body;
    const { id: userId, role } = req.userInfo;

    if (role !== "staff" && role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const validType = type === "news" ? "news" : "article";

    let gamesArray = [];
    if (Array.isArray(game_ids)) {
      gamesArray = game_ids;
    } else if (typeof game_ids === "string" && game_ids.trim() !== "") {
      gamesArray = game_ids
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id);
    }

    await client.query("BEGIN");

    const initialQ = `
        INSERT INTO publications (user_id, type, title, content, image, created_at, likes, views)
        VALUES ($1, $2, $3, '', '', NOW(), 0, 0)
        RETURNING id
    `;
    const result = await client.query(initialQ, [userId, validType, title]);
    const newId = result.rows[0].id;

    const processedContent = processContentImages(content, newId);
    const pubDirRel = `/upload/publications/${newId}`;
    const pubDirAbs = path.join(CLIENT_PUBLIC_DIR, pubDirRel);

    if (!fs.existsSync(pubDirAbs)) fs.mkdirSync(pubDirAbs, { recursive: true });

    const contentPath = path.join(pubDirAbs, "content.html");
    fs.writeFileSync(contentPath, processedContent || "");
    const dbContentPath = path
      .join(pubDirRel, "content.html")
      .replace(/\\/g, "/");

    let dbImagePath = null;
    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const newFileName = `cover${ext}`;
      const newPathAbs = path.join(pubDirAbs, newFileName);
      fs.copyFileSync(req.file.path, newPathAbs);
      fs.unlinkSync(req.file.path);
      dbImagePath = path.join(pubDirRel, newFileName).replace(/\\/g, "/");
    }

    await client.query(
      `UPDATE publications SET content = $1, image = $2 WHERE id = $3`,
      [dbContentPath, dbImagePath, newId]
    );

    if (gamesArray.length > 0) {
      const values = gamesArray
        .map((gid) => `(${newId}, ${parseInt(gid)})`)
        .join(",");
      await client.query(`
            INSERT INTO publication_games (publication_id, game_id) 
            VALUES ${values}
            ON CONFLICT DO NOTHING
        `);
    }

    await client.query("COMMIT");
    res.status(200).json({ id: newId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  } finally {
    client.release();
  }
};

export const updatePublication = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    let { title, content, type, game_ids } = req.body;
    const { id: userId, role } = req.userInfo;

    const check = await client.query(
      "SELECT * FROM publications WHERE id = $1",
      [id]
    );
    if (!check.rows.length)
      return res.status(404).json({ error: "Публикация не найдена" });

    const pub = check.rows[0];
    if (pub.user_id !== userId && role !== "staff" && role !== "admin") {
      return res.status(403).json({ error: "Нет прав" });
    }

    let gamesArray = [];
    if (Array.isArray(game_ids)) {
      gamesArray = game_ids;
    } else if (typeof game_ids === "string" && game_ids.trim() !== "") {
      gamesArray = game_ids
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id);
    }

    const processedContent = processContentImages(content, id);
    const pubDirRel = `/upload/publications/${id}`;
    const pubDirAbs = path.join(CLIENT_PUBLIC_DIR, pubDirRel);
    if (!fs.existsSync(pubDirAbs)) fs.mkdirSync(pubDirAbs, { recursive: true });

    fs.writeFileSync(
      path.join(pubDirAbs, "content.html"),
      processedContent || ""
    );
    const dbContentPath = path
      .join(pubDirRel, "content.html")
      .replace(/\\/g, "/");

    let dbImagePath = pub.image;
    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const newFileName = `cover_${Date.now()}${ext}`;
      const newPathAbs = path.join(pubDirAbs, newFileName);
      fs.copyFileSync(req.file.path, newPathAbs);
      fs.unlinkSync(req.file.path);
      if (pub.image && pub.image.startsWith("/upload/")) {
        const oldPath = path.join(CLIENT_PUBLIC_DIR, pub.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      dbImagePath = path.join(pubDirRel, newFileName).replace(/\\/g, "/");
    }

    const validType = type === "news" ? "news" : "article";

    await client.query("BEGIN");

    await client.query(
      `UPDATE publications SET title=$1, content=$2, type=$3, image=$4, updated_at=NOW() WHERE id=$5`,
      [title, dbContentPath, validType, dbImagePath, id]
    );

    await client.query(
      `DELETE FROM publication_games WHERE publication_id = $1`,
      [id]
    );

    if (gamesArray.length > 0) {
      const values = gamesArray
        .map((gid) => `(${id}, ${parseInt(gid)})`)
        .join(",");
      await client.query(`
            INSERT INTO publication_games (publication_id, game_id) 
            VALUES ${values}
            ON CONFLICT DO NOTHING
        `);
    }

    await client.query("COMMIT");
    res.status(200).json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  } finally {
    client.release();
  }
};

export const deletePublication = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.userInfo;

    const check = await query("SELECT * FROM publications WHERE id = $1", [id]);
    if (!check.rows.length)
      return res.status(404).json({ error: "Публикация не найдена" });

    const pub = check.rows[0];
    if (pub.user_id !== userId && role !== "staff" && role !== "admin") {
      return res.status(403).json({ error: "Нет прав" });
    }

    const pubDirAbs = path.join(CLIENT_PUBLIC_DIR, `upload/publications/${id}`);
    if (fs.existsSync(pubDirAbs)) {
      fs.rmSync(pubDirAbs, { recursive: true, force: true });
    }

    await query("DELETE FROM publications WHERE id = $1", [id]);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userInfo.id;

    const checkQ =
      "SELECT 1 FROM publication_likes WHERE user_id = $1 AND publication_id = $2";
    const checkRes = await query(checkQ, [userId, id]);
    let isLiked = false;
    if (checkRes.rows.length > 0) {
      await query(
        "DELETE FROM publication_likes WHERE user_id = $1 AND publication_id = $2",
        [userId, id]
      );
      await query("UPDATE publications SET likes = likes - 1 WHERE id = $1", [
        id,
      ]);
      isLiked = false;
    } else {
      await query(
        "INSERT INTO publication_likes (user_id, publication_id) VALUES ($1, $2)",
        [userId, id]
      );
      await query("UPDATE publications SET likes = likes + 1 WHERE id = $1", [
        id,
      ]);
      isLiked = true;
    }
    const countRes = await query(
      "SELECT likes FROM publications WHERE id = $1",
      [id]
    );
    const likesCount = countRes.rows[0].likes;
    return res.status(200).json({ likesCount, isLiked });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Ошибка при лайке" });
  }
};

export const incrementView = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userInfo ? req.userInfo.id : null;
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    let shouldIncrement = false;

    if (userId) {
      const checkQ = `SELECT 1 FROM publication_views WHERE publication_id = $1 AND user_id = $2`;
      const checkRes = await query(checkQ, [id, userId]);
      if (checkRes.rows.length === 0) {
        await query(
          `INSERT INTO publication_views (publication_id, user_id, ip_address) VALUES ($1, $2, $3)`,
          [id, userId, ip]
        );
        shouldIncrement = true;
      }
    } else {
      const checkQ = `SELECT 1 FROM publication_views WHERE publication_id = $1 AND ip_address = $2`;
      const checkRes = await query(checkQ, [id, ip]);
      if (checkRes.rows.length === 0) {
        await query(
          `INSERT INTO publication_views (publication_id, ip_address) VALUES ($1, $2)`,
          [id, ip]
        );
        shouldIncrement = true;
      }
    }

    if (shouldIncrement) {
      await query("UPDATE publications SET views = views + 1 WHERE id = $1", [
        id,
      ]);
    }

    const resCount = await query(
      "SELECT views FROM publications WHERE id = $1",
      [id]
    );
    const views = resCount.rows[0]?.views || 0;
    return res.status(200).json({ views });
  } catch (err) {
    console.error("Ошибка инкремента просмотра:", err);
    return res.status(500).json({ error: "Ошибка при обновлении просмотров" });
  }
};
