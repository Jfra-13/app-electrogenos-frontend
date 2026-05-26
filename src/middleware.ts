import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware((context, next) => {
  // Interceptamos peticiones a cualquier ruta bajo /admin
  if (context.url.pathname.startsWith("/admin")) {
    const token = context.cookies.get("jwt_token")?.value;

    // Si no hay token JWT, redirigimos inmediatamente al muro de seguridad
    if (!token) {
      return context.redirect("/login");
    }
  }
  return next();
});
