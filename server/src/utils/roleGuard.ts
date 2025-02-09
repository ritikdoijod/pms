import { PermissionType } from "../enums/role.enum";
import { UnauthorizedExceptioin } from "./appError";
import { RolePermissions } from "./role-permission";

export const roleGuard = (
  role: keyof typeof RolePermissions,
  requiredPermission: PermissionType[],
) => {
  const permissions = RolePermissions[role];

  const hasPermission = requiredPermission.every((permission) =>
    permissions.includes(permission),
  );

  if (!hasPermission)
    throw new UnauthorizedExceptioin(
      "You do not have the necessary permissions to perform this action",
    );
};
