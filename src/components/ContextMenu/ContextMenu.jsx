import styles from "./ContextMenu.module.css";

const ContextMenu = ({ xPos, yPos }) => {
	return (
		<>
			<div className={styles.menu} style={{ top: yPos, left: xPos }}>
				hello
			</div>
		</>
	);
};

export default ContextMenu;
