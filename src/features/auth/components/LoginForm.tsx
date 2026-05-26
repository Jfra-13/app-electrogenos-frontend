import React, { useState } from "react";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // --- Lógica real de Conexión Backend (Comentada) ---
      // const res = await fetch("http://tu-api.com/api/v1/auth/login", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ username, password }) // LoginRequestDTO
      // });
      // const data = await res.json(); // AuthResponseDTO
      // if (!res.ok) throw new Error("Credenciales inválidas");
      // document.cookie = `jwt_token=${data.token}; path=/; max-age=86400`;

      // --- Lógica Simulada para Frontend ---
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulamos latencia

      if (username === "admin" && password === "admin") {
        // Seteamos la cookie simulando el token guardado del backend
        document.cookie =
          "jwt_token=mock_jwt_token_12345; path=/; max-age=86400";
        window.location.href = "/admin"; // Redirige a la Intranet que ahora está desbloqueada
      } else {
        throw new Error(
          "Usuario o contraseña incorrectos. (Pista: admin / admin)",
        );
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-blue-950 mb-2">Bienvenido</h2>
        <p className="text-gray-500">Ingresa tus credenciales para continuar</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Usuario
          </label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
            placeholder="Ingresa tu usuario"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contraseña
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-950 text-white py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors flex justify-center items-center h-12"
        >
          {loading ? (
            // Spinner animado SVG
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            "Ingresar a Intranet"
          )}
        </button>
      </form>
    </div>
  );
}
