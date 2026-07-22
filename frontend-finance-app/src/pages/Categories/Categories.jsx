import styles from "./Categories.module.css";
import Navbar from "../../components/Navbar/Navbar";
import { useState } from "react";
import { useCategories } from "../../context/CategoriesContext";
import { Trash2, LoaderCircle } from "lucide-react";

const Categories = () => {
    const [name, setName] = useState("");
    const [error, setError] = useState(null);
    const { categories, loading, addCategory, removeCategory, adding, deletingId } = useCategories();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await addCategory(name.trim());
            setName("");
        } catch (err) {
            setError(err.message || "Could not add category");
        }
    };

    return (
        <div>
            <Navbar />
            <main className="page">
                <section>
                    <h2 className={styles.sectionTitle}>Categories</h2>
                    <p className={styles.hint}>
                        Every transaction belongs to a category. Deleting a category keeps its
                        transactions, but they become uncategorized.
                    </p>

                    <form className={styles.form} onSubmit={handleSubmit}>
                        <input
                            className={styles.categoryInput}
                            value={name}
                            placeholder="New category name"
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <button className={styles.addButton} disabled={adding}>
                            {adding ? <LoaderCircle className="spin" size={16} /> : "Add"}
                        </button>
                    </form>

                    {error && <p className={styles.error}>{error}</p>}

                    <ul className={styles.categoryWrapper}>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <li className={styles.categoryBar} key={index}>
                                    <div className={`${styles.skeletonText} shimmer`}></div>
                                    <div className={`${styles.skeletonIcon} shimmer`}></div>
                                </li>
                            ))
                        ) : categories.length === 0 ? (
                            <p className={styles.empty}>
                                No categories yet. Add one above to start tracking transactions.
                            </p>
                        ) : (
                            categories.map((category) => (
                                <li className={styles.categoryBar} key={category.category_id}>
                                    <p className={styles.categoryName}>{category.name}</p>
                                    {deletingId === category.category_id ? (
                                        <LoaderCircle className={`${styles.loader} spin`} size={16} />
                                    ) : (
                                        <button
                                            className={styles.categoryDelete}
                                            onClick={() => removeCategory(category.category_id)}
                                            aria-label={`Delete ${category.name}`}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </li>
                            ))
                        )}
                    </ul>
                </section>
            </main>
        </div>
    );
};

export default Categories;
