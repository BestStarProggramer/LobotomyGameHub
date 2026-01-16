import { query } from "../db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLIENT_PUBLIC_DIR = path.resolve(__dirname, "../../client/public");

const ROLE_WEIGHTS = {
  user: 1,
  staff: 10,
  moderator: 50,
  admin: 100,
};

export const getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;
    let q = `
      SELECT id, username, email, role, created_at, avatar_url 
      FROM users 
    `;
    const params = [];

    if (search) {
      q += ` WHERE username ILIKE $1 OR email ILIKE $1 `;
      params.push(`%${search}%`);
    }

    q += ` ORDER BY id ASC`;

    const { rows } = await query(q, params);
    return res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { userId, newRole } = req.body;
    const requester = req.userInfo;

    if (!ROLE_WEIGHTS[newRole]) {
      return res.status(400).json({ error: "Недопустимая роль в системе" });
    }

    const userRes = await query("SELECT id, role FROM users WHERE id = $1", [
      userId,
    ]);
    if (userRes.rows.length === 0)
      return res.status(404).json("Пользователь не найден");

    const targetUser = userRes.rows[0];

    if (Number(requester.id) === Number(userId)) {
      return res
        .status(403)
        .json({ error: "Вы не можете менять роль самому себе" });
    }

    if (ROLE_WEIGHTS[requester.role] <= ROLE_WEIGHTS[targetUser.role]) {
      return res
        .status(403)
        .json({ error: "Недостаточно прав для изменения этого пользователя" });
    }

    if (ROLE_WEIGHTS[newRole] > ROLE_WEIGHTS[requester.role]) {
      return res
        .status(403)
        .json({ error: "Вы не можете назначить роль выше вашей" });
    }

    await query(`UPDATE users SET role = $1::user_role WHERE id = $2`, [
      newRole,
      userId,
    ]);

    return res
      .status(200)
      .json({ message: "Роль успешно обновлена", role: newRole });
  } catch (err) {
    console.error("Admin Controller Error:", err);

    return res.status(500).json({
      error: "Ошибка БД при обновлении роли. Проверьте тип user_role.",
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const requester = req.userInfo;

    const userRes = await query("SELECT role FROM users WHERE id = $1", [
      userId,
    ]);
    if (userRes.rows.length === 0)
      return res.status(404).json("Пользователь не найден");

    const targetRole = userRes.rows[0].role;

    if (ROLE_WEIGHTS[requester.role] <= ROLE_WEIGHTS[targetRole]) {
      return res
        .status(403)
        .json({ error: "У вас нет прав на удаление этого пользователя" });
    }

    try {
      const avatarDir = path.join(CLIENT_PUBLIC_DIR, "upload/avatars");
      if (fs.existsSync(avatarDir)) {
        const files = fs.readdirSync(avatarDir);
        const userAvatarPrefix = `avatar_id${userId}.`;
        for (const file of files) {
          if (file.startsWith(userAvatarPrefix)) {
            fs.unlinkSync(path.join(avatarDir, file));
          }
        }
      }
    } catch (fsErr) {
      console.warn(`Could not delete avatar for user ${userId}:`, fsErr);
    }

    await query("DELETE FROM users WHERE id = $1", [userId]);
    return res.status(200).json("Пользователь удален");
  } catch (err) {
    return res.status(500).json(err);
  }
};
