import styles from "./Categories.module.css";
import Navbar from "../../components/Navbar/Navbar";
import { useState } from "react";
import { api } from 

const Categories = () => {
    const [name, setName] = useState("")

    return (
        <div className={styles.wrapper}>
            <Navbar/>
            <form className={styles.form}>
                <input
                    className={styles.categoryInput}
                    placeholder="Category"
                />
                <button className={styles.addButton}>Add</button>
            </form>
        </div>
    )
}

export default Categories;