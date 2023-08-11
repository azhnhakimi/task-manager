import React from "react";
import styles from "./ContextMenu.module.css";

const ContextMenu = ({ xPos, yPos, handleClick }) => {
	return (
		<div
			onClick={handleClick}
			className={styles.menu}
			style={{ top: yPos, left: xPos }}
		>
			<div className={styles.upperRow}>
				<div
					className={`${styles.color} ${styles.red}`}
					title="Red"
				></div>
				<div
					className={`${styles.color} ${styles.sandy}`}
					title="Sandy"
				></div>
				<div
					className={`${styles.color} ${styles.yellow}`}
					title="Yellow"
				></div>
				<div
					className={`${styles.color} ${styles.green}`}
					title="Green"
				></div>
			</div>
			<div className={styles.lowerRow}>
				<div
					className={`${styles.color} ${styles.turquoise}`}
					title="Turquoise"
				></div>
				<div
					className={`${styles.color} ${styles.blue}`}
					title="Blue"
				></div>
				<div
					className={`${styles.color} ${styles.mauve}`}
					title="Mauve"
				></div>
				<div
					className={`${styles.color} ${styles.iris}`}
					title="Iris"
				></div>
			</div>
		</div>
	);
};

export default ContextMenu;
