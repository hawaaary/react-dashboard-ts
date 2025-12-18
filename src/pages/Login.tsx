import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/http";
import FlashMessage from "../components/FlashMessage";
import "./Login.css";

interface LoginResponse {
  status: number;
  message: string;
  token?: string;
  data?: any;
  errors?: { email?: string[] };
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [flash, setFlash] = useState<{ type: string; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFlash(null);
    setLoading(true);

    try {
      console.log("Attempting login with:", { email, password: "****" });
      const response = await API.post<LoginResponse>("/auth/login", { email, password });
      console.log("Login response:", response);

      if (response.data.status === 200) {
        console.log("Login successful, storing token and user data");
        localStorage.setItem("token", response.data.token!);
        localStorage.setItem("user", JSON.stringify(response.data.data));
        setEmail("");
        setPassword("");
        console.log("Navigating to dashboard");
        navigate("/dashboard");
      } else {
        console.error("Login response status not 200:", response.data);
        setFlash({ type: "error", message: response.data.message || "Login failed" });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const res = error.response;

      if (!res) {
        setFlash({ type: "error", message: "Network error. Please try again." });
      } else if (res.status === 400) {
        const firstError = res.data.errors?.email ? res.data.errors.email[0] : res.data.message;
        setFlash({ type: "error", message: firstError });
      } else if (res.status === 403) {
        setFlash({ type: "error", message: res.data.message });
      } else {
        setFlash({ type: "error", message: res.data.message || "Login failed. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2>Login</h2>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {flash && <FlashMessage type={flash.type as "success" | "error"} message={flash.message} />}

        <div className="form-footer">
          <p>© 2025 Dashboard. All rights reserved.</p>
        </div>
      </form>
    </div>
  );
}
