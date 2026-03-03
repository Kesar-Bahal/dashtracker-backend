import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const BASE_URL = "https://dashtracker-backen.onrender.com";

function Dashboard() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [newSubject, setNewSubject] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [newTask, setNewTask] = useState({});
  const [darkMode, setDarkMode] = useState(true);
  const [visits, setVisits] = useState(0);
  const [userEmail, setUserEmail] = useState("");

  const token = localStorage.getItem("token");
  const selectedSubject = subjects[selectedIndex] || { topics: [] };

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !token) {
      navigate("/");
      return;
    }

    setUserEmail(user.email);

    fetch(`${BASE_URL}/subjects`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSubjects(data);
      });
  }, [navigate, token]);

  /* ================= VISITS ================= */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    const sessionKey = `visited_${user.id}`;
    if (sessionStorage.getItem(sessionKey)) return;

    const key = `visits_${user.id}`;
    const stored = localStorage.getItem(key);
    const count = stored ? +stored + 1 : 1;

    localStorage.setItem(key, count);
    setVisits(count);

    sessionStorage.setItem(sessionKey, "true");
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  /* ================= SUBJECT ================= */

  const addSubject = async () => {
    if (!newSubject.trim()) return;

    const res = await fetch(`${BASE_URL}/subjects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name: newSubject })
    });

    const data = await res.json();
    setSubjects([...subjects, { ...data, topics: [] }]);
    setNewSubject("");
  };

  const editSubject = async (index) => {
    const newName = prompt("Edit subject name:");
    if (!newName?.trim()) return;

    const subject = subjects[index];

    await fetch(`${BASE_URL}/subjects/${subject.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name: newName })
    });

    const updated = [...subjects];
    updated[index].name = newName;
    setSubjects(updated);
  };

  const deleteSubject = async (id) => {
    await fetch(`${BASE_URL}/subjects/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    setSubjects(subjects.filter(s => s.id !== id));
    setSelectedIndex(0);
  };

  /* ================= TOPIC ================= */

  const addTopic = async () => {
    if (!newTopic.trim()) return;

    const res = await fetch(`${BASE_URL}/topics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
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

  const editTopic = async (topicId, topicIndex) => {
    const newName = prompt("Edit topic name:");
    if (!newName?.trim()) return;

    await fetch(`${BASE_URL}/topics/${topicId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name: newName })
    });

    const updated = [...subjects];
    updated[selectedIndex].topics[topicIndex].name = newName;
    setSubjects(updated);
  };

  const deleteTopic = async (topicId, topicIndex) => {
    await fetch(`${BASE_URL}/topics/${topicId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    const updated = [...subjects];
    updated[selectedIndex].topics.splice(topicIndex, 1);
    setSubjects(updated);
  };

  /* ================= TASK ================= */

  const addTask = async (topicIndex) => {
    if (!newTask[topicIndex]?.trim()) return;

    const topic = selectedSubject.topics[topicIndex];

    const res = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
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

  const editTask = async (task, topicIndex, taskIndex) => {
    const newTitle = prompt("Edit task:");
    if (!newTitle?.trim()) return;

    await fetch(`${BASE_URL}/tasks/${task.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title: newTitle })
    });

    const updated = [...subjects];
    updated[selectedIndex].topics[topicIndex].tasks[taskIndex].title = newTitle;
    setSubjects(updated);
  };

  const toggleTask = async (topicIndex, taskIndex) => {
    const updated = [...subjects];
    const task = updated[selectedIndex].topics[topicIndex].tasks[taskIndex];

    await fetch(`${BASE_URL}/tasks/${task.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ completed: !task.completed })
    });

    task.completed = !task.completed;
    setSubjects(updated);
  };

  const deleteTask = async (taskId, topicIndex, taskIndex) => {
    await fetch(`${BASE_URL}/tasks/${taskId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    const updated = [...subjects];
    updated[selectedIndex].topics[topicIndex].tasks.splice(taskIndex, 1);
    setSubjects(updated);
  };

  /* ================= STATS ================= */

  const totalTasks =
    selectedSubject.topics?.reduce(
      (acc, topic) => acc + topic.tasks.length,
      0
    ) || 0;

  const completedTasks =
    selectedSubject.topics?.reduce(
      (acc, topic) =>
        acc + topic.tasks.filter(t => t.completed).length,
      0
    ) || 0;

  const progress =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);

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
              <button onClick={() => editSubject(index)}>✏</button>
              <button onClick={() => deleteSubject(sub.id)}>🗑</button>
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

        <div className="stats-grid">
          <div className="stat-card"><h4>Total Tasks</h4><p>{totalTasks}</p></div>
          <div className="stat-card"><h4>Completed</h4><p>{completedTasks}</p></div>
          <div className="stat-card"><h4>Progress</h4><p>{progress}%</p></div>
          <div className="stat-card"><h4>Visits</h4><p>{visits}</p></div>
        </div>

        <div className="add-section">
          <input
            type="text"
            placeholder="New Topic"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
          />
          <button onClick={addTopic}>+ Add Topic</button>
        </div>

        <div className="topics">
          {selectedSubject.topics?.map((topic, topicIndex) => (
            <div key={topic.id} className="topic-card">

              <div className="topic-header">
                <h3>{topic.name}</h3>
                <div className="topic-actions">
                  <button onClick={() => editTopic(topic.id, topicIndex)}>✏</button>
                  <button onClick={() => deleteTopic(topic.id, topicIndex)}>🗑</button>
                </div>
              </div>

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
                    <button onClick={() => editTask(task, topicIndex, taskIndex)}>✏</button>
                    <button onClick={() =>
                      deleteTask(task.id, topicIndex, taskIndex)
                    }>🗑</button>
                  </div>

                </div>
              ))}

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