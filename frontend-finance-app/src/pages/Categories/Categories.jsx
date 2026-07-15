import styles from "./Categories.module.css";
import Navbar from "../../components/Navbar/Navbar";
import { useState } from "react";
import { useCategories } from "../../context/CategoriesContext";
import { Trash2, LoaderCircle } from 'lucide-react';

const Categories = () => {
    const [name, setName] = useState("");
    const { categories, loading, addCategory, removeCategory, adding, deletingId } = useCategories();

    const handleSubmit = (e) => {
        e.preventDefault();
        addCategory(name);
        setName("");
    };

    return (
        <div className={styles.wrapper}>
            <Navbar/>
            <form className={styles.form} onSubmit={handleSubmit}>
                <input
                    className={styles.categoryInput}
                    value={name}
                    placeholder="Category"
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                />
                <button
                    className={styles.addButton}
                    disabled={adding}
                >
                    {adding ? <LoaderCircle className={styles.loader}/> : "Add"}
                </button>
            </form>
            <div className={styles.categoryWrapper}>
                {loading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                        <div className={styles.categoryBar} key={index}>
                            <div className={styles.skeletonText}></div>
                            <div className={styles.skeletonIcon}></div>
                        </div>
                    ))
                ) : (
                    categories.map((category) => (
                        <div className={styles.categoryBar} key={category.category_id}>
                            <p className={styles.categoryName}>{category.name}</p>
                            {deletingId === category.category_id ? (
                                <LoaderCircle className={styles.loader}/>
                            ) : (
                                <Trash2 
                                    className={styles.cateogryDelete}
                                    onClick={() => removeCategory(category.category_id)}
                                />
                            )}
                        </div>
                )))}
            </div>
        </div>
    )
}

export default Categories;