import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const BASE_URL = "https://dashtracker-backend-1.onrender.com";

function Dashboard() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [newSubject, setNewSubject] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [newTask, setNewTask] = useState({});
  const [darkMode, setDarkMode] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  const selectedSubject = subjects[selectedIndex] || { topics: [] };

  /* ================= LOAD SUBJECTS ================= */
  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    setUserEmail(user.email);

    fetch(`${BASE_URL}/subjects/${user.id}`)
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(s => ({
          ...s,
          topics: [],
        }));
        setSubjects(formatted);
      })
      .catch(err => console.log(err));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  /* ================= SUBJECT ================= */

  const addSubject = async () => {
    if (!newSubject.trim()) return;

    const res = await fetch(`${BASE_URL}/subjects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: newSubject,
        user_id: user.id   // 🔥 IMPORTANT FIX
      })
    });

    const data = await res.json();

    setSubjects([...subjects, { ...data, topics: [] }]);
    setNewSubject("");
  };

  const editSubject = (index) => {
    const newName = prompt("Edit subject name:");
    if (!newName) return;

    const updated = [...subjects];
    updated[index].name = newName;
    setSubjects(updated);
  };

  const deleteSubject = (id) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  /* ================= TOPIC ================= */

  const addTopic = async () => {
    if (!newTopic.trim()) return;

    const res = await fetch(`${BASE_URL}/topics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: newTopic,
        subject_id: selectedSubject.id
      })
    });

    const data = await res.json();

    const updated = [...subjects];
    updated[selectedIndex].topics.push({ ...data, tasks: [] });

    setSubjects(updated);
    setNewTopic("");
  };

  const editTopic = (id, index) => {
    const newName = prompt("Edit topic");
    if (!newName) return;

    const updated = [...subjects];
    updated[selectedIndex].topics[index].name = newName;
    setSubjects(updated);
  };

  const deleteTopic = (id, index) => {
    const updated = [...subjects];
    updated[selectedIndex].topics.splice(index, 1);
    setSubjects(updated);
  };

  /* ================= TASK ================= */

  const addTask = async (topicIndex) => {
    if (!newTask[topicIndex]) return;

    const topic = selectedSubject.topics[topicIndex];

    const res = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: newTask[topicIndex],
        topic_id: topic.id
      })
    });

    const data = await res.json();

    const updated = [...subjects];
    updated[selectedIndex].topics[topicIndex].tasks.push(data);

    setSubjects(updated);
    setNewTask({ ...newTask, [topicIndex]: "" });
  };

  const toggleTask = (topicIndex, taskIndex) => {
    const updated = [...subjects];
    const task = updated[selectedIndex].topics[topicIndex].tasks[taskIndex];

    task.completed = !task.completed;
    setSubjects(updated);
  };

  const deleteTask = (id, topicIndex, taskIndex) => {
    const updated = [...subjects];
    updated[selectedIndex].topics[topicIndex].tasks.splice(taskIndex, 1);
    setSubjects(updated);
  };

  /* ================= UI ================= */

  return (
    <div className={`dashboard ${darkMode ? "dark" : "light"}`}>

      {/* SIDEBAR */}
      <div className="sidebar">
        <h2>DashTracker</h2>

        {subjects.map((sub, index) => (
          <div
            key={sub.id}
            className={`subject-item ${index === selectedIndex ? "active" : ""}`}
            onClick={() => setSelectedIndex(index)}
          >
            <span>{sub.name}</span>

            <div className="subject-actions" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => editSubject(index)}>✏️</button>
              <button onClick={() => deleteSubject(sub.id)}>🗑️</button>
            </div>
          </div>
        ))}

        <div className="add-section">
          <input
            type="text"
            placeholder="New Subject"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
          />
          <button onClick={addSubject}>+ Add</button>
        </div>
      </div>

      {/* MAIN */}
      <div className="main-content">

        <div className="topbar">
          <div>
            <h3>Welcome Back 👋</h3>
            <small>{userEmail}</small>
          </div>

          <div className="top-buttons">
            <button onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? "☀ Light" : "🌙 Dark"}
            </button>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <h1>{selectedSubject.name}</h1>

        {/* ADD TOPIC */}
        <div className="add-section">
          <input
            type="text"
            placeholder="New Topic"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
          />
          <button onClick={addTopic}>+ Add Topic</button>
        </div>

        {/* TOPICS */}
        <div className="topics">
          {selectedSubject.topics.map((topic, topicIndex) => (
            <div key={topic.id} className="topic-card">

              <div className="topic-header">
                <h3>{topic.name}</h3>

                <div className="topic-actions">
                  <button onClick={() => editTopic(topic.id, topicIndex)}>✏️</button>
                  <button onClick={() => deleteTopic(topic.id, topicIndex)}>🗑️</button>
                </div>
              </div>

              {/* TASKS */}
              {topic.tasks.map((task, taskIndex) => (
                <div key={task.id} className="task-item">

                  <div
                    className="task-left"
                    onClick={() => toggleTask(topicIndex, taskIndex)}
                  >
                    <div className={`checkbox ${task.completed ? "checked" : ""}`}>
                      {task.completed && "✔"}
                    </div>

                    <span className={task.completed ? "completed" : ""}>
                      {task.title}
                    </span>
                  </div>

                  <div className="task-actions">
                    <button>✏️</button>
                    <button onClick={() =>
                      deleteTask(task.id, topicIndex, taskIndex)
                    }>🗑️</button>
                  </div>

                </div>
              ))}

              {/* ADD TASK */}
              <div className="add-section small">
                <input
                  type="text"
                  placeholder="New Task"
                  value={newTask[topicIndex] || ""}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      [topicIndex]: e.target.value
                    })
                  }
                />
                <button onClick={() => addTask(topicIndex)}>
                  + Add Task
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;