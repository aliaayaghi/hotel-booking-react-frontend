export const USER_ROLES = {
  ADMIN: "ADMIN",
  HOTEL_MANAGER: "HOTEL_MANAGER",
  CUSTOMER: "CUSTOMER",
};

export function normalizeRoles(roles) {
  if (!roles) {
    return [];
  }

  if (Array.isArray(roles)) {
    return roles;
  }

  return [roles];
}

export function getUserRoles(user) {
  return normalizeRoles(user?.roles ?? user?.role);
}

export function userHasRole(user, requiredRole) {
  return getUserRoles(user).includes(requiredRole);
}
