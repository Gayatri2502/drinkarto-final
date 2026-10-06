export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export type Permission =
  "finance" | "read" | "retailers" | "products" | "stock" | "orders" | "approve";
const roles: Record<string, Permission[]> = {
  OWNER: ["read", "retailers", "products", "stock", "orders", "approve", "finance"],
  MANAGER: ["read", "retailers", "stock", "orders", "approve", "finance"],
  SALES: ["read"],
  WAREHOUSE: ["read", "stock"],
  ACCOUNTS: ["read", "finance"],
};
export function authorize(role: string, permission: Permission) {
  if (!roles[role]?.includes(permission))
    throw new HttpError(403, "Permission denied");
}
export function available(p: {
  physical: number;
  reserved: number;
  damaged: number;
}) {
  return p.physical - p.reserved - p.damaged;
}
export function stockChange(
  p: { physical: number; reserved: number; damaged: number },
  quantity: number,
) {
  if (!Number.isInteger(quantity) || quantity === 0)
    throw new HttpError(400, "Non-zero whole quantity required");
  if (available(p) + quantity < 0)
    throw new HttpError(
      409,
      "Adjustment would consume reserved or damaged stock",
    );
  return p.physical + quantity;
}
export function assertTenant(expected: string, actual: string) {
  if (expected !== actual) throw new HttpError(404, "Record not found");
}
