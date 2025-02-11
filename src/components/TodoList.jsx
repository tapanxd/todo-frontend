import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; // ✅ Import Framer Motion
import API from "../api";

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);

  // Fetch todos from backend
  useEffect(() => {
    API.get("/todos")
      .then((response) => {
        if (Array.isArray(response.data)) {
          setTodos(response.data);
        } else {
          console.error("❌ API response is not an array:", response.data);
          setTodos([]);
        }
      })
      .catch((error) => console.error("🚨 Error fetching todos:", error));
  }, []);

  // Add a new task
  const addTodo = async () => {
    if (!task) return;
    try {
      const response = await API.post("/todos/add", { task });
      setTodos([...todos, response.data]); // ✅ Add with animation
      setTask("");
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  // Toggle task completion
  const toggleCompletion = async (id) => {
    try {
      const response = await API.put(`/todos/toggle/${id}`);
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo._id === id ? { ...todo, completed: response.data.completed } : todo
        )
      );
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const confirmDelete = (id) => {
    setSelectedTodo(id);
    setShowConfirm(true);
  }

  // Delete a task with animation
  const deleteTodo = async () => {
    
    if(!selectedTodo) return;
    
    try {
      await API.delete(`/todos/${selectedTodo}`);
      setTodos((prevTodos) => prevTodos.filter((todo) => todo._id !== selectedTodo));
      setShowConfirm(false);
      setSelectedTodo(null); // ✅ Animate removal
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  // **Sort tasks: Active first, Completed at bottom**
  const sortedTodos = [...todos].sort((a, b) => a.completed - b.completed);

  return (
    <div className="w-full max-w-lg mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center text-white mb-4">To-Do List</h2>

      {/* Input & Button */}
      <div className="flex items-center space-x-2 mb-4">
        <input
          type="text"
          placeholder="Add a task..."
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="flex-1 px-4 py-2 bg-gray-700 text-white border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
        />
        <button
          onClick={addTodo}
          className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 active:scale-95 transition-all"
        >
          Add
        </button>
      </div>

      {/* To-Do List with Sorting & Animations */}
      <ul className="space-y-2">
        <AnimatePresence>
          {sortedTodos.length > 0 ? (
            sortedTodos.map((todo) => (
              <motion.li
                key={todo._id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className={`flex justify-between items-center px-4 py-2 rounded-md shadow-sm border border-gray-600 ${
                  todo.completed ? "bg-gray-600" : "bg-gray-700"
                }`}
              >
                {/* Checkbox */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleCompletion(todo._id)}
                    className="w-5 h-5 text-blue-500 border-gray-300 rounded focus:ring-blue-400"
                  />
                  <span className={`text-white ${todo.completed ? "line-through text-gray-400" : ""}`}>
                    {todo.task}
                  </span>
                </div>

                {/* Delete Button */}
                <motion.button
                  onClick={() => confirmDelete(todo._id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-red-400 hover:text-red-600 transition"
                >
                  ❌
                </motion.button>
              </motion.li>
            ))
          ) : (
            <li className="text-gray-400 text-center">No tasks available</li>
          )}
        </AnimatePresence>
      </ul>
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-lg text-white mb-4">Are you sure you want to delete this task?</h3>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={deleteTodo}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TodoList;
