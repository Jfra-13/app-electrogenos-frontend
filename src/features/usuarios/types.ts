// Employee/admin management DTOs. Mirrors API §4.2 (/api/v1/usuarios).

// Role assignable via the protected channel. Sent WITHOUT the `ROLE_` prefix.
// `USER` is not creatable here (that's the public /auth/register channel).
export type RolCreable = "EMPLEADO" | "ADMIN";

export type UsuarioDTO = {
  id: number;
  username: string;
  email: string;
  roles: string[]; // backend form, e.g. ["ROLE_EMPLEADO"]
};

export type UsuarioCreateDTO = {
  username: string;
  password: string;
  email: string;
  rol: RolCreable;
};
