import { query } from "../db.js";

export const getAllUsers = async (req, res) => {
  try {
    const q = `
      SELECT id, username, email, role, created_at, avatar_url 
      FROM users 
      ORDER BY id ASC
    `;
    const { rows } = await query(q);
    return res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
};

export const toggleUserRole = async (req, res) => {
  try {
    const { userId } = req.body;

    const userRes = await query("SELECT role FROM users WHERE id = $1", [
      userId,
    ]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    const currentRole = userRes.rows[0].role;

    if (currentRole === "admin") {
      return res
        .status(400)
        .json({ error: "Нельзя изменить роль администратора" });
    }

    const newRole = currentRole === "staff" ? "user" : "staff";

    await query("UPDATE users SET role = $1 WHERE id = $2", [newRole, userId]);

    return res.status(200).json({ message: "Роль обновлена", newRole });
  } catch (err) {
    console.error("Error toggling role:", err);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
};
