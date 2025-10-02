// import { useState, useEffect } from 'react';
// import axiosInstance from '../axiosConfig';
// import TaskForm from '../components/TaskForm';
// import TaskList from '../components/TaskList';
// import { useAuth } from '../context/AuthContext';

// const Tasks = () => {
//   const { user } = useAuth();
//   const [tasks, setTasks] = useState([]);
//   const [editingTask, setEditingTask] = useState(null);

//   useEffect(() => {
//     const fetchTasks = async () => {
//       try {
//         const response = await axiosInstance.get('/api/tasks', {
//           headers: { Authorization: `Bearer ${user.token}` },
//         });
//         setTasks(response.data);
//       } catch (error) {
//         alert('Failed to fetch tasks.');
//       }
//     };

//     fetchTasks();
//   }, [user]);

//   return (
//     <div className="container mx-auto p-6">
//       <TaskForm
//         tasks={tasks}
//         setTasks={setTasks}
//         editingTask={editingTask}
//         setEditingTask={setEditingTask}
//       />
//       <TaskList tasks={tasks} setTasks={setTasks} setEditingTask={setEditingTask} />
//     </div>
//   );
// };

// export default Tasks;
// src/pages/Tasks.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Fetch all tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axiosInstance.get('/api/tasks', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setTasks(response.data);
      } catch (error) {
        alert('Failed to fetch tasks.');
      }
    };

    if (user) fetchTasks();
  }, [user]);

  // Handle add/update task
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        const response = await axiosInstance.put(
          `/api/tasks/${editingTask._id}`,
          { title, description },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setTasks(tasks.map((t) => (t._id === editingTask._id ? response.data : t)));
        setEditingTask(null);
      } else {
        const response = await axiosInstance.post(
          '/api/tasks',
          { title, description },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setTasks([...tasks, response.data]);
      }
      setTitle('');
      setDescription('');
    } catch (error) {
      alert('Error saving task.');
    }
  };

  // Handle delete task
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await axiosInstance.delete(`/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setTasks(tasks.filter((t) => t._id !== id));
    } catch (error) {
      alert('Failed to delete task.');
    }
  };

  // Populate form when editing
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
    } else {
      setTitle('');
      setDescription('');
    }
  }, [editingTask]);

  return (
    <div className="container mx-auto p-6">
      <form onSubmit={handleSubmit} className="bg-white p-4 shadow-md rounded mb-6">
        <h2 className="text-xl font-bold mb-4">{editingTask ? 'Edit Task' : 'Add Task'}</h2>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {editingTask ? 'Update Task' : 'Add Task'}
        </button>
        {editingTask && (
          <button
            type="button"
            onClick={() => setEditingTask(null)}
            className="ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Cancel
          </button>
        )}
      </form>

      <div className="bg-white p-4 shadow-md rounded">
        <h2 className="text-xl font-bold mb-4">Tasks List</h2>
        {tasks.length === 0 ? (
          <p>No tasks available.</p>
        ) : (
          <ul>
            {tasks.map((task) => (
              <li
                key={task._id}
                className="border-b py-2 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{task.title}</p>
                  <p>{task.description}</p>
                </div>
                <div>
                  <button
                    onClick={() => setEditingTask(task)}
                    className="mr-2 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Tasks;