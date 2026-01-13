import { query } from "../db.js";
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

  const newContent = content.replace(tempImgRegex, (match, filename) => {
    const tempAbsPath = path.join(
      CLIENT_PUBLIC_DIR,
      `/upload/publications/temp/${filename}`
    );
    const targetAbsPath = path.join(targetAbsDir, filename);

    if (fs.existsSync(tempAbsPath)) {
      try {
        fs.renameSync(tempAbsPath, targetAbsPath);
      } catch (e) {
        console.error(`Error moving file ${filename}:`, e);
      }
    }

    return `src="${targetRelDir}/${filename}"`;
  });

  return newContent;
};

const resolveContent = (contentData) => {
  if (contentData && contentData.startsWith("/upload/")) {
    const filePath = path.join(CLIENT_PUBLIC_DIR, contentData);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, "utf-8");
    }
    return "";
  }

  return contentData || "";
};

export const uploadPublicationImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { publicationId } = req.body;

    const folderName =
      publicationId && publicationId !== "undefined" ? publicationId : "temp";

    const relDir = `/upload/publications/${folderName}`;
    const absDir = path.join(CLIENT_PUBLIC_DIR, relDir);

    if (!fs.existsSync(absDir)) {
      fs.mkdirSync(absDir, { recursive: true });
    }

    const ext = path.extname(req.file.originalname);
    const fileName = `img_${Date.now()}_${Math.round(
      Math.random() * 1e9
    )}${ext}`;
    const targetPath = path.join(absDir, fileName);

    fs.renameSync(req.file.path, targetPath);

    const fileUrl = `${relDir}/${fileName}`;
    return res.status(200).json({ url: fileUrl });
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
        g.title AS game_title,
        (SELECT COUNT(*) FROM comments WHERE publication_id = p.id) AS comments_count
      FROM publications p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN games g ON p.game_id = g.id
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
      gameTitle: row.game_title,
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
        g.id AS game_id, g.title AS game_title, g.slug AS game_slug, g.background_image AS game_image,
        (SELECT COUNT(*) FROM comments WHERE publication_id = p.id) AS comments_count,
        CASE 
          WHEN $2::bigint IS NOT NULL THEN 
            EXISTS(SELECT 1 FROM publication_likes pl WHERE pl.publication_id = p.id AND pl.user_id = $2)
          ELSE FALSE 
        END as is_liked
      FROM publications p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN games g ON p.game_id = g.id
      WHERE p.id = $1
    `;

    const result = await query(q, [id, currentUserId]);

    if (!result.rows.length) {
      return res.status(404).json({ error: "Публикация не найдена" });
    }

    const row = result.rows[0];

    const htmlContent = resolveContent(row.content);

    const gameData = row.game_id
      ? {
          id: row.game_id,
          title: row.game_title,
          slug: row.game_slug,
          image: row.game_image || "/img/default.jpg",
        }
      : null;

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
      gameId: row.game_id,
      gameTitle: row.game_title,
      game: gameData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

export const addPublication = async (req, res) => {
  try {
    const { title, content, type, game_id } = req.body;
    const { id: userId, role } = req.userInfo;

    if (role !== "staff" && role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const validType = type === "news" ? "news" : "article";
    const validGameId = game_id && !isNaN(game_id) ? Number(game_id) : null;

    const initialQ = `
        INSERT INTO publications (user_id, game_id, type, title, content, image, created_at, likes, views)
        VALUES ($1, $2, $3, $4, '', '', NOW(), 0, 0)
        RETURNING id
    `;
    const result = await query(initialQ, [
      userId,
      validGameId,
      validType,
      title,
    ]);
    const newId = result.rows[0].id;

    const processedContent = processContentImages(content, newId);

    const pubDirRel = `/upload/publications/${newId}`;
    const pubDirAbs = path.join(CLIENT_PUBLIC_DIR, pubDirRel);

    if (!fs.existsSync(pubDirAbs)) {
      fs.mkdirSync(pubDirAbs, { recursive: true });
    }

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
      fs.renameSync(req.file.path, newPathAbs);
      dbImagePath = path.join(pubDirRel, newFileName).replace(/\\/g, "/");
    }

    await query(
      `UPDATE publications SET content = $1, image = $2 WHERE id = $3`,
      [dbContentPath, dbImagePath, newId]
    );

    res.status(200).json({ id: newId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

export const updatePublication = async (req, res) => {
  try {
    const { id } = req.params;
    let { title, content, type, game_id } = req.body;
    const { id: userId, role } = req.userInfo;

    const check = await query("SELECT * FROM publications WHERE id = $1", [id]);
    if (!check.rows.length)
      return res.status(404).json({ error: "Публикация не найдена" });

    const pub = check.rows[0];
    if (pub.user_id !== userId && role !== "staff" && role !== "admin") {
      return res.status(403).json({ error: "Нет прав" });
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
      fs.renameSync(req.file.path, newPathAbs);

      if (pub.image && pub.image.startsWith("/upload/")) {
        const oldPath = path.join(CLIENT_PUBLIC_DIR, pub.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      dbImagePath = path.join(pubDirRel, newFileName).replace(/\\/g, "/");
    }

    const validType = type === "news" ? "news" : "article";
    const validGameId = game_id && !isNaN(game_id) ? Number(game_id) : null;

    await query(
      `UPDATE publications SET title=$1, content=$2, type=$3, game_id=$4, image=$5, updated_at=NOW() WHERE id=$6`,
      [title, dbContentPath, validType, validGameId, dbImagePath, id]
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
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
