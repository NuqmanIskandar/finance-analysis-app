import styles from "./Navbar.module.css";
import { useAuth } from "../../context/AuthContext";
import { NavLink } from "react-router-dom";

const links = [
    { to: "/", label: "Dashboard" },
    { to: "/transactions", label: "Transactions" },
    { to: "/categories", label: "Categories" },
    { to: "/insights", label: "Insights" },
];

const Navbar = () => {
    const { logout } = useAuth();

    return (
        <header className={styles.wrapper}>
            <span className={styles.brand}>Finance</span>
            <nav className={styles.links}>
                {links.map(({ to, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === "/"}
                        className={({ isActive }) =>
                            isActive ? `${styles.link} ${styles.active}` : styles.link
                        }
                    >
                        {label}
                    </NavLink>
                ))}
            </nav>
            <button className={styles.signOut} onClick={logout}>Sign out</button>
        </header>
    );
};

export default Navbar;
