import { defineMiddleware } from "astro:middleware";
import { isAdmin } from "./lib/api/jwt";

// Routes under /admin that require ROLE_ADMIN. Anything else under /admin is
// open to any authenticated user (catalog, sales, sales history). The API
// still enforces roles with 403; this is UX so non-admins don't hit dead ends.
const ADMIN_ONLY_PREFIXES = [
  "/admin/grupos",
  "/admin/usuarios",
  "/admin/reportes",
];
const EMPLOYEE_HOME = "/admin/ventas";

export const onRequest = defineMiddleware((context, next) => {
  const { pathname } = context.url;
  if (!pathname.startsWith("/admin")) return next();

  const token = context.cookies.get("jwt_token")?.value;
  if (!token) return context.redirect("/login");

  // Admins reach everything.
  if (isAdmin(token)) return next();

  // Non-admin (empleado/user): the dashboard (financial KPIs) and admin-only
  // sections are off-limits — send them to their sales home instead of a 403.
  const isDashboard = pathname === "/admin" || pathname === "/admin/";
  const isAdminOnly =
    isDashboard || ADMIN_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
  if (isAdminOnly) return context.redirect(EMPLOYEE_HOME);

  return next();
});
