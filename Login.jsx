import { useState } from "react";
import { login, register } from "./api/index";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    const apiCall = isLogin ? login : register;

    const res = await apiCall({ email, password });

    if (res?.token) {
      localStorage.setItem("token", res.token);
      window.location.reload();
    } else {
      alert("Authentication failed");
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#0f1117", color: "#fff" }}>
      <div style={{ background: "#161b27", padding: 30, borderRadius: 10, width: 300 }}>
        <h2>{isLogin ? "Login" : "Register"}</h2>

        <input
          style={{ width: "100%", marginBottom: 10, padding: 8 }}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          style={{ width: "100%", marginBottom: 10, padding: 8 }}
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleSubmit} style={{ width: "100%", padding: 10 }}>
          {isLogin ? "Login" : "Register"}
        </button>

        <p
          onClick={() => setIsLogin(!isLogin)}
          style={{ marginTop: 10, cursor: "pointer", fontSize: 12 }}
        >
          {isLogin ? "Create account" : "Already have an account?"}
        </p>
      </div>
    </div>
  );
}