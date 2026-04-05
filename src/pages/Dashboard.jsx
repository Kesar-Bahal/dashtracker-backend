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
  const [visits, setVisits] = useState(0);
  const [userEmail, setUserEmail] = useState("");

  const selectedSubject = subjects[selectedIndex] || { topics: [] };

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      navigate("/");
      return;
    }

    setUserEmail(user.email);

    // ✅ FIXED: correct route
    fetch(`${BASE_URL}/subjects/${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // topics default add
          const formatted = data.map(s => ({
            ...s,
            topics: []
          }));
          setSubjects(formatted);
        }
      });
  }, [navigate]);

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

    const user = JSON.parse(localStorage.getItem("user"));

    const res = await fetch(`${BASE_URL}/subjects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: newSubject,
        user_id: user.id
      })
    });

    const data = await res.json();

    setSubjects([...subjects, { ...data, topics: [] }]);
    setNewSubject("");
  };

  const deleteSubject = async (id) => {
    await fetch(`${BASE_URL}/subjects/${id}`, {
      method: "DELETE"
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

  const deleteTopic = async (topicId, topicIndex) => {
    await fetch(`${BASE_URL}/topics/${topicId}`, {
      method: "DELETE"
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

  const toggleTask = async (topicIndex, taskIndex) => {
    const updated = [...subjects];
    const task = updated[selectedIndex].topics[topicIndex].tasks[taskIndex];

    await fetch(`${BASE_URL}/tasks/${task.id}`, {
      method: "PUT"
    });

    task.completed = !task.completed;
    setSubjects(updated);
  };

  const deleteTask = async (taskId, topicIndex, taskIndex) => {
    await fetch(`${BASE_URL}/tasks/${taskId}`, {
      method: "DELETE"
    });

    const updated = [...subjects];
    updated[selectedIndex].topics[topicIndex].tasks.splice(taskIndex, 1);
    setSubjects(updated);
  };

  /* ================= UI ================= */

  return (
    <div className={`dashboard ${darkMode ? "dark" : "light"}`}>

      <div className="sidebar">
        <h2>DashTracker</h2>

        {subjects.map((sub, index) => (
          <div
            key={sub.id}
            className={`subject-item ${index === selectedIndex ? "active" : ""}`}
            onClick={() => setSelectedIndex(index)}
          >
            <span>{sub.name}</span>
            <button onClick={() => deleteSubject(sub.id)}>🗑</button>
          </div>
        ))}

        <input
          type="text"
          placeholder="New Subject"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
        />
        <button onClick={addSubject}>+ Add</button>
      </div>

      <div className="main-content">
        <h3>{userEmail}</h3>
        <button onClick={handleLogout}>Logout</button>

        <h1>{selectedSubject.name}</h1>

        <input
          type="text"
          placeholder="New Topic"
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
        />
        <button onClick={addTopic}>+ Add Topic</button>

        {selectedSubject.topics?.map((topic, topicIndex) => (
          <div key={topic.id}>
            <h3>{topic.name}</h3>
            <button onClick={() => deleteTopic(topic.id, topicIndex)}>🗑</button>

            {topic.tasks.map((task, taskIndex) => (
              <div key={task.id}>
                <span
                  onClick={() => toggleTask(topicIndex, taskIndex)}
                  style={{ textDecoration: task.completed ? "line-through" : "none" }}
                >
                  {task.title}
                </span>
                <button onClick={() =>
                  deleteTask(task.id, topicIndex, taskIndex)
                }>❌</button>
              </div>
            ))}

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
            <button onClick={() => addTask(topicIndex)}>+ Task</button>
          </div>
        ))}

      </div>
    </div>
  );
}

export default Dashboard;