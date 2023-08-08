import React, { useState, useEffect, useRef } from "react";
import styles from "./Form.module.css";
import editIcon from "../../assets/edit.svg";
import deleteIcon from "../../assets/delete.svg";
import tickIcon from "../../assets/tick.svg";
import cancelIcon from "../../assets/cancel.svg";

const Form = () => {
	////////////////////////////////////////////////////////////////////

	// 1 . Declaring the states

	// Used for the new items to be added to the to-do list
	const [newItem, setNewItem] = useState("");

	//
	const [updatingItem, setUpdatingItem] = useState("");

	// Used to store all the items in the to-do list
	const [todoList, setTodoList] = useState([]);

	//
	const [editedItemId, setEditedItemId] = useState(null);

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

	//
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

	const handleEditKeyDown = (event, id) => {
		if (event.keyCode === 13) {
			// If the Enter key is pressed, save the edit
			handleUpdateItem(event);
		}
	};

	// Function to toggle the selection of an item
	const handleToggleItem = (id) => {
		if (editedItemId !== null) {
			// return;		-- can make changes here to implement different actions
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
					{todoList.map((item) => (
						<li
							key={item.id}
							className={
								item.completed === true ? styles.selected : ""
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
								/>
							) : (
								item.text
							)}
							<div className={styles.iconContainer}>
								{editedItemId === item.id ? (
									<>
										<img
											className={styles.cancelIcon}
											src={cancelIcon}
											alt="cancel-icon"
											onClick={(event) => {
												handleCancelEdit(event);
											}}
										/>
										<img
											className={styles.tickIcon}
											src={tickIcon}
											alt="save-icon"
											onClick={(event) => {
												handleUpdateItem(event);
											}}
										/>
									</>
								) : (
									<>
										<img
											className={styles.editIcon}
											src={editIcon}
											alt="edit-icon"
											onClick={(event) =>
												handleEditItem(event, item.id)
											}
										/>
										<img
											className={styles.deleteIcon}
											src={deleteIcon}
											alt="delete-icon"
											onClick={() =>
												handleDeleteItem(item.id)
											}
										/>
									</>
								)}
							</div>
						</li>
					))}
				</ul>
			</div>
		</>
	);
};

export default Form;
