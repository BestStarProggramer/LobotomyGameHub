import "./adminPanel.scss";
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const AdminPanel = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/");
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await makeRequest.get("/admin/users");
        setUsers(res.data);
      } catch (err) {
        console.error(err);
        alert("Ошибка загрузки пользователей");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [currentUser, navigate]);

  const handleToggleRole = async (userId) => {
    try {
      const res = await makeRequest.post("/admin/toggle-role", { userId });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, role: res.data.newRole } : u
        )
      );
    } catch (err) {
      alert(err.response?.data?.error || "Ошибка обновления роли");
    }
  };

  if (loading) return <div className="admin-panel">Загрузка...</div>;

  return (
    <div className="admin-panel">
      <div className="container">
        <div className="header">
          <button onClick={() => navigate("/settings")} className="back-btn">
            <ArrowBackIcon /> Назад
          </button>
          <h1>Панель Администратора</h1>
        </div>

        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Пользователь</th>
                <th>Email</th>
                <th>Роль</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    <div className="user-cell">
                      <img
                        src={user.avatar_url || "/img/default-avatar.jpg"}
                        alt=""
                      />
                      <span>{user.username}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    {user.role !== "admin" && (
                      <button
                        className={`action-btn ${
                          user.role === "staff" ? "demote" : "promote"
                        }`}
                        onClick={() => handleToggleRole(user.id)}
                      >
                        {user.role === "staff"
                          ? "Забрать Staff"
                          : "Выдать Staff"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
