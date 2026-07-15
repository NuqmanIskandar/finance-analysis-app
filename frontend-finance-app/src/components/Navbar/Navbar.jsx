import styles from "./Navbar.module.css";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className={styles.wrapper}>
            <button className={styles.navButton} onClick={logout}>Sign out</button>
            <button className={styles.navButton} onClick={() => navigate("/")}>Dashboard</button>
            <button className={styles.navButton} onClick={() => navigate("/categories")}>Categories</button>
            <button className={styles.navButton} onClick={() => navigate("/transactions")}>Transactions</button>
            <button className={styles.navButton} onClick={() => navigate("/insights")}>Insights</button>
        </div>
    )
}

export default Navbar;