export const ROLE_CONFIG = {
  admin: { label: "Admin", className: "role-admin" },
  moderator: { label: "Moderator", className: "role-moderator" },
  staff: { label: "Staff", className: "role-staff" },
  user: { label: "", className: "" },
};

export const getRoleConfig = (role) => {
  return ROLE_CONFIG[role] || ROLE_CONFIG.user;
};
