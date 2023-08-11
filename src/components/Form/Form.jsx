import React, { useState, useEffect, useRef } from "react";
import ContextMenu from "../ContextMenu/ContextMenu";
import styles from "./Form.module.css";
import editIcon from "../../assets/edit.svg";
import editIconBlack from "../../assets/edit-black.svg";
import deleteIcon from "../../assets/delete.svg";
import deleteIconBlack from "../../assets/delete-black.svg";
import tickIcon from "../../assets/tick.svg";
import tickIconBlack from "../../assets/tick-black.svg";
import cancelIcon from "../../assets/cancel.svg";
import cancelIconBlack from "../../assets/cancel-black.svg";
import { getTextColorBasedOnBackgroundColor } from "../../helpers.js";

const Form = () => {
	////////////////////////////////////////////////////////////////////

	// 1 . Declaring the states

	// Used for the new items to be added to the to-do list
	const [newItem, setNewItem] = useState("");

	//  Used to store the text content of the item that is currently being edited
	const [updatingItem, setUpdatingItem] = useState("");

	// Used to store all the items in the to-do list
	const [todoList, setTodoList] = useState([]);

	//  Used to keep track of the item that is currently being edited
	const [editedItemId, setEditedItemId] = useState(null);

	const [contextMenuPos, setContextMenuPos] = useState(null);

	// Used to auto focus on the input element in edit mode
	const editInputRef = useRef(null);

	////////////////////////////////////////////////////////////////////

	// 2 . useEffect hooks

	// Load the to-do list from Local Storage on component mount
	useEffect(() => {
		const storedTodoList = localStorage.getItem("todoItems");
		if (storedTodoList) {
			setTodoList(JSON.parse(storedTodoList));
		}
	}, []);

	// Auto focuses on input element when entering edit mode
	useEffect(() => {
		if (editedItemId !== null && editInputRef.current !== null) {
			editInputRef.current.focus();
		}
	}, [editedItemId]);

	// Click event listener to exit edit mode when clicking outside the edit field or the list
	useEffect(() => {
		const handleClickOutside = (event) => {
			const target = event.target;
			const editInput = editInputRef.current;
			const list = document.querySelector(`.${styles.todoList}`);

			if (
				editedItemId !== null &&
				target !== editInput &&
				!list.contains(target)
			) {
				handleCancelEdit(event);
			}
		};

		// Add the event listener when the component mounts
		document.addEventListener("click", handleClickOutside);

		// Clean up the event listener when the component unmounts
		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	}, [editedItemId]);

	useEffect(() => {
		// Add the event listener when the component mounts
		document.addEventListener("click", handleContextMenuClose);

		// Clean up the event listener when the component unmounts
		return () => {
			document.removeEventListener("click", handleContextMenuClose);
		};
	}, [contextMenuPos]);

	////////////////////////////////////////////////////////////////////

	// 3. Event Handlers

	// Handles submission of new items to the to-do list
	const handleSubmit = (event) => {
		// Prevents the page from reloading
		event.preventDefault();

		// Prevent adding empty tasks
		if (newItem.trim() === "") {
			return;
		}

		// Create a new to-do item object with a unique ID
		const newTodoItem = {
			id: Date.now(), // Using the timestamp as a simple unique ID
			text: newItem,
			completed: false,
			color: "iris",
		};

		// Add the new to-do item to the existing list
		setTodoList([...todoList, newTodoItem]);

		// Save the updated to-do list to Local Storage
		// localStorage.setItem("todoItems", JSON.stringify(todoList));
		localStorage.setItem(
			"todoItems",
			JSON.stringify([...todoList, newTodoItem])
		);

		// Clear the input field after adding the item
		setNewItem("");
		setUpdatingItem("");
	};

	// Handles the deletion of items from the to-do list
	const handleDeleteItem = (id) => {
		// Filter out the item with the specified id from the todoList
		const updatedTodoList = todoList.filter((item) => item.id !== id);

		// Update the todoList state with the filtered list
		setTodoList(updatedTodoList);

		// Update the Local Storage with the filtered list
		localStorage.setItem("todoItems", JSON.stringify(updatedTodoList));
	};

	// Handles when user hits the Enter button in edit mode
	const handleEditKeyDown = (event, id) => {
		if (event.keyCode === 13) {
			handleUpdateItem(event);
		}
	};

	// Function to toggle the selection of an item
	const handleToggleItem = (id) => {
		if (editedItemId !== null) {
			setEditedItemId(null);
		}

		setTodoList((prevTodoList) => {
			const updatedList = prevTodoList.map((item) =>
				item.id === id ? { ...item, completed: !item.completed } : item
			);

			// Save the updated to-do list to Local Storage
			localStorage.setItem("todoItems", JSON.stringify(updatedList));

			return updatedList;
		});
	};

	const handleInputChange = (event) => {
		setNewItem(event.target.value);
	};

	const handleUpdateInput = (event) => {
		setUpdatingItem(event.target.value);
	};

	// Function to start editing an item
	const handleEditItem = (event, id) => {
		event.stopPropagation();
		handleContextMenuClose();
		setEditedItemId(id);
		const selectedItem = todoList.find((item) => item.id === id);
		if (selectedItem) {
			// Set the updatingItem state to the current text value of the item
			setUpdatingItem(selectedItem.text);
		}
		if (editInputRef.current) {
			editInputRef.current.focus();
		}
	};

	// Function to update the edited item
	const handleUpdateItem = (event) => {
		event.stopPropagation();
		if (updatingItem.trim() === "") {
			return; // Prevent adding empty tasks
		}

		const updatedTodoList = todoList.map((item) =>
			item.id === editedItemId ? { ...item, text: updatingItem } : item
		);

		setTodoList(updatedTodoList);
		setEditedItemId(null);
		setNewItem("");
		setUpdatingItem("");
		localStorage.setItem("todoItems", JSON.stringify(updatedTodoList));
	};

	// Function to cancel editing an item
	const handleCancelEdit = (event) => {
		event.stopPropagation();
		setEditedItemId(null);
		setNewItem("");
		setUpdatingItem("");
		setEditedItemId(null);
	};

	const handleDragStart = (event, id) => {
		// When starting to drag an item, set the dragged item's ID to the dataTransfer object
		event.dataTransfer.setData("text/plain", id);
		event.currentTarget.classList.add(styles.dragging);
	};

	const handleDragOver = (event) => {
		event.preventDefault();
	};

	const handleDrop = (event, targetId) => {
		event.preventDefault();
		const draggedItemId = parseInt(event.dataTransfer.getData("text"));

		// Find the indexes of the dragged item and the target item
		const draggedItemIndex = todoList.findIndex(
			(item) => item.id === draggedItemId
		);

		const targetItemIndex = todoList.findIndex(
			(item) => item.id == targetId
		);

		// Do nothing if the item is dropped onto itself
		if (draggedItemIndex === targetItemIndex) {
			return;
		}

		// Create a new array with the items in the desired order
		const updatedTodoList = Array.from(todoList);

		updatedTodoList.splice(
			targetItemIndex,
			0,
			updatedTodoList.splice(draggedItemIndex, 1)[0]
		);

		setTodoList(updatedTodoList);
		localStorage.setItem("todoItems", JSON.stringify(updatedTodoList));
	};

	const handleDragEnd = (event) => {
		event.currentTarget.classList.remove(styles.dragging);
	};

	const handleContextMenu = (event, completed, id) => {
		if (completed || editedItemId) {
			return;
		}
		event.preventDefault();
		const xPos = event.pageX;
		const yPos = event.pageY;
		setContextMenuPos({ xPos, yPos, id }); // Set the id along with xPos and yPos
	};

	const handleContextMenuClose = () => {
		if (contextMenuPos) {
			setContextMenuPos(null);
		}
	};

	const contextClick = (event) => {
		event.stopPropagation();
		const text = event.target.title.toLowerCase();

		if (text === "") {
			return;
		}

		const updatedTodoList = todoList.map((item) =>
			item.id === contextMenuPos.id ? { ...item, color: text } : item
		);
		setTodoList(updatedTodoList);
		localStorage.setItem("todoItems", JSON.stringify(updatedTodoList));
		handleContextMenuClose();
	};

	return (
		<>
			<div className={styles.mainContainer}>
				<h1>What's the plan?</h1>

				<form onSubmit={handleSubmit}>
					<div className={styles.inputGroup}>
						<input
							className={styles.input}
							value={newItem}
							onChange={handleInputChange}
							placeholder="Add item..."
							autoComplete="off"
						/>
						<input
							className={styles.buttonSubmit}
							value="Add"
							type="submit"
						/>
					</div>
				</form>

				<ul className={styles.todoList}>
					{todoList.map((item) => {
						const backgroundColor = item.color
							? `var(--${item.color})`
							: "var(--iris)";

						const textColor =
							getTextColorBasedOnBackgroundColor(backgroundColor);

						return (
							<li
								key={item.id}
								className={
									item.completed === true
										? styles.selected
										: ""
								}
								onClick={() => handleToggleItem(item.id, item)}
								draggable={editedItemId === null} // Make the item draggable only when not in edit mode
								onDragStart={(event) =>
									handleDragStart(event, item.id)
								}
								onDragOver={(event) =>
									handleDragOver(event, item.id)
								}
								onDrop={(event) => handleDrop(event, item.id)}
								onDragEnd={(event) => handleDragEnd(event)}
								onContextMenu={(event) =>
									handleContextMenu(
										event,
										item.completed,
										item.id
									)
								}
								style={{
									backgroundColor: backgroundColor,
									color: textColor,
								}}
							>
								{editedItemId === item.id ? (
									<input
										type="text"
										className={styles.editInput}
										value={updatingItem}
										onChange={handleUpdateInput}
										onKeyDown={(event) =>
											handleEditKeyDown(event, item.id)
										}
										ref={editInputRef}
										style={{
											backgroundColor: backgroundColor,
											color: textColor,
										}}
									/>
								) : (
									item.text
								)}
								<div className={styles.iconContainer}>
									{editedItemId === item.id ? (
										<>
											{textColor === "white" ? (
												<img
													className={
														styles.cancelIcon
													}
													src={cancelIcon}
													alt="cancel-icon"
													onClick={(event) => {
														handleCancelEdit(event);
													}}
												/>
											) : (
												<img
													className={
														styles.cancelIcon
													}
													src={cancelIconBlack}
													alt="cancel-icon"
													onClick={(event) => {
														handleCancelEdit(event);
													}}
												/>
											)}

											{textColor === "white" ? (
												<img
													className={styles.tickIcon}
													src={tickIcon}
													alt="save-icon"
													onClick={(event) => {
														handleUpdateItem(event);
													}}
												/>
											) : (
												<img
													className={styles.tickIcon}
													src={tickIconBlack}
													alt="save-icon"
													onClick={(event) => {
														handleUpdateItem(event);
													}}
												/>
											)}
										</>
									) : (
										<>
											{textColor === "white" ? (
												<img
													className={styles.editIcon}
													src={editIcon}
													alt="edit-icon"
													onClick={(event) =>
														handleEditItem(
															event,
															item.id
														)
													}
													style={{ color: textColor }}
												/>
											) : (
												<img
													className={styles.editIcon}
													src={editIconBlack}
													alt="edit-icon"
													onClick={(event) =>
														handleEditItem(
															event,
															item.id
														)
													}
													style={{ color: textColor }}
												/>
											)}

											{textColor === "white" ? (
												<img
													className={
														styles.deleteIcon
													}
													src={deleteIcon}
													alt="delete-icon"
													onClick={() =>
														handleDeleteItem(
															item.id
														)
													}
												/>
											) : (
												<img
													className={
														styles.deleteIcon
													}
													src={deleteIconBlack}
													alt="delete-icon"
													onClick={() =>
														handleDeleteItem(
															item.id
														)
													}
												/>
											)}
										</>
									)}
								</div>
								{contextMenuPos &&
									contextMenuPos.id === item.id && (
										<ContextMenu
											xPos={contextMenuPos.xPos}
											yPos={contextMenuPos.yPos}
											handleClick={(event) =>
												contextClick(event)
											}
										/>
									)}
							</li>
						);
					})}
				</ul>
			</div>
		</>
	);
};

export default Form;
