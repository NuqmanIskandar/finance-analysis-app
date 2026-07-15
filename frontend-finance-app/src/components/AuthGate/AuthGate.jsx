import styles from "./AuthGate.module.css";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

const AuthGate = ({ children }) => {
    const { isAuthed, error, login, register } = useAuth();
    const [mode, setMode] = useState("login");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    if (isAuthed) return children;

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        if (mode === "login") {
            await login(username, password);
        } else {
            await register(username, password);
        }
        setUsername("")
        setPassword("")
        setSubmitting(false);
    }

    return (
        <div className={styles.wrap}>
            <div className={styles.card}>
                <p className={styles.title}>Financial App</p>
                <p className={styles.subtitle}>
                    {mode === "login" ? "Sign in to continue" : "Create an account to get started"}
                </p>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                        required
                        autoFocus
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        required
                    />
                    <button className={styles.submit} type="submit" disabled={submitting}>
                        {submitting ? "Loading…" : mode === "login" ? "Sign in" : "Create account"}
                    </button>
                </form>

                {error && <p className={styles.error}>{error}</p>}

                <button className={styles.switchMode} onClick={() => setMode(mode === "login" ? "register" : "login")}>
                    {mode === "login" ? "Need an account? Register" : "Already have an account? Sign in"}
                </button>
            </div>                
        </div>
    )
}

export default AuthGate;