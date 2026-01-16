import "./adminPanel.scss";
import { useEffect, useState, useContext } from "react";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import { ModalContext } from "../../context/modalContext";
import { Link } from "react-router-dom";
import { getRoleConfig } from "../../utils/roles";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";

const AdminPanel = () => {
  const { currentUser } = useContext(AuthContext);
  const { openModal } = useContext(ModalContext);

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const roles = [
    { id: "user", label: "User", color: "#8e8e8e" },
    { id: "staff", label: "Staff", color: "#27ae60" },
    { id: "moderator", label: "Moderator", color: "#2980b9" },
    { id: "admin", label: "Administrator", color: "#e67e22" },
  ];

  const roleWeights = { user: 1, staff: 10, moderator: 50, admin: 100 };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await makeRequest.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await makeRequest.post("/admin/update-role", { userId, newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setIsRoleModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.error || "Ошибка при смене роли");
    }
  };

  const confirmDelete = (userId, username) => {
    openModal(
      "Удаление",
      `Вы уверены, что хотите удалить пользователя ${username}?`,
      async () => {
        try {
          await makeRequest.delete(`/admin/users/${userId}`);
          setUsers((prev) => prev.filter((u) => u.id !== userId));
        } catch (err) {
          alert(err.response?.data?.error);
        }
      }
    );
  };

  return (
    <div className="admin-panel">
      <div className="admin-container">
        <div className="admin-header">
          <h1>Управление пользователями</h1>
          <div className="search-wrapper">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              placeholder="Поиск по нику..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="users-list">
          <table>
            <thead>
              <tr>
                <th>Пользователь</th>
                <th>Email</th>
                <th>Роль</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const roleConfig = getRoleConfig(user.role);
                // Apply border class to the Link wrapper inside the cell
                const linkClass = `user-link-wrapper ${roleConfig.className} ${
                  roleConfig.className ? "role-border" : ""
                }`;

                return (
                  <tr key={user.id}>
                    <td>
                      <Link
                        to={`/profile/${user.id}`}
                        className="user-link-wrapper"
                      >
                        <div className="user-info">
                          <img
                            src={user.avatar_url || "/img/default-avatar.jpg"}
                            alt={user.username}
                          />
                          <span className="username-text">{user.username}</span>
                        </div>
                      </Link>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-tag ${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        {roleWeights[currentUser.role] >
                          roleWeights[user.role] && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setIsRoleModalOpen(true);
                              }}
                              className="edit-btn"
                            >
                              <EditIcon />
                            </button>
                            <button
                              onClick={() =>
                                confirmDelete(user.id, user.username)
                              }
                              className="delete-btn"
                            >
                              <DeleteIcon />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isRoleModalOpen && selectedUser && (
        <div className="role-modal-overlay">
          <div className="role-modal">
            <div className="modal-header">
              <h3>Смена роли: {selectedUser.username}</h3>
              <CloseIcon
                onClick={() => setIsRoleModalOpen(false)}
                className="close-icon"
              />
            </div>
            <div className="roles-grid">
              {roles.map((role) => {
                const isCurrent = selectedUser.role === role.id;
                const isForbidden =
                  roleWeights[currentUser.role] <= roleWeights[role.id] &&
                  role.id !== "user";

                return (
                  <div
                    key={role.id}
                    className={`role-option ${isCurrent ? "active" : ""} ${
                      isForbidden ? "disabled" : ""
                    }`}
                    style={{ "--role-color": role.color }}
                    onClick={() =>
                      !isForbidden && handleUpdateRole(selectedUser.id, role.id)
                    }
                  >
                    <span className="role-label">{role.label}</span>
                    {isCurrent && (
                      <span className="current-badge">Текущая</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
