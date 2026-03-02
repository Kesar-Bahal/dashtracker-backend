import { useState, useEffect } from "react";
import "./Dashboard.css";

function Dashboard() {
  const [subjects, setSubjects] = useState([
    { name: "DSA", topics: [] }
  ]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [newSubject, setNewSubject] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [newTask, setNewTask] = useState({});
  const [visits, setVisits] = useState(0);
  const [darkMode, setDarkMode] = useState(true);

  const selectedSubject = subjects[selectedIndex] || { topics: [] };

  /* ===== VISITS ===== */
  useEffect(() => {
    const stored = localStorage.getItem("visits");
    const count = stored ? +stored + 1 : 1;
    localStorage.setItem("visits", count);
    setVisits(count);
  }, []);

  /* ===== SUBJECT ===== */

  const addSubject = () => {
    if (!newSubject.trim()) return;
    setSubjects([...subjects, { name: newSubject, topics: [] }]);
    setNewSubject("");
  };

  const editSubject = (index) => {
    const newName = prompt("Edit subject name:");
    if (!newName?.trim()) return;

    const updated = [...subjects];
    updated[index].name = newName;
    setSubjects(updated);
  };

  const deleteSubject = (index) => {
    if (!window.confirm("Delete subject?")) return;
    const updated = subjects.filter((_, i) => i !== index);
    setSubjects(updated);
    setSelectedIndex(0);
  };

  /* ===== TOPIC ===== */

  const addTopic = () => {
    if (!newTopic.trim()) return;

    const updated = [...subjects];
    updated[selectedIndex].topics.push({
      name: newTopic,
      tasks: []
    });

    setSubjects(updated);
    setNewTopic("");
  };

  /* ===== TASK ===== */

  const addTask = (topicIndex) => {
    if (!newTask[topicIndex]?.trim()) return;

    const updated = [...subjects];
    updated[selectedIndex].topics[topicIndex].tasks.push({
      title: newTask[topicIndex],
      completed: false
    });

    setSubjects(updated);
    setNewTask({ ...newTask, [topicIndex]: "" });
  };

  const toggleTask = (topicIndex, taskIndex) => {
    const updated = [...subjects];
    updated[selectedIndex].topics[topicIndex].tasks[
      taskIndex
    ].completed =
      !updated[selectedIndex].topics[topicIndex].tasks[
        taskIndex
      ].completed;

    setSubjects(updated);
  };

  const editTask = (topicIndex, taskIndex) => {
    const newTitle = prompt("Edit task:");
    if (!newTitle?.trim()) return;

    const updated = [...subjects];
    updated[selectedIndex].topics[topicIndex].tasks[
      taskIndex
    ].title = newTitle;

    setSubjects(updated);
  };

  const deleteTask = (topicIndex, taskIndex) => {
    const updated = [...subjects];
    updated[selectedIndex].topics[topicIndex].tasks.splice(
      taskIndex,
      1
    );

    setSubjects(updated);
  };

  /* ===== PROGRESS ===== */

  const totalTasks = selectedSubject.topics.reduce(
    (acc, topic) => acc + topic.tasks.length,
    0
  );

  const completedTasks = selectedSubject.topics.reduce(
    (acc, topic) =>
      acc + topic.tasks.filter((t) => t.completed).length,
    0
  );

  const progress =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className={`dashboard ${darkMode ? "dark" : "light"}`}>

      {/* ===== SIDEBAR ===== */}
      <div className="sidebar">
        <h2>DashTracker</h2>

        {subjects.map((sub, index) => (
          <div
            key={index}
            className={`subject-item ${
              index === selectedIndex ? "active" : ""
            }`}
            onClick={() => setSelectedIndex(index)}
          >
            <span>{sub.name}</span>

            <div
              className="subject-actions"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => editSubject(index)}>
                ✏
              </button>
              <button onClick={() => deleteSubject(index)}>
                🗑
              </button>
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

      {/* ===== MAIN ===== */}
      <div className="main-content">

        {/* ===== TOPBAR ===== */}
        <div className="topbar">
          <h3>Welcome Back 👋</h3>
          <button
            className="mode-toggle"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>

        <h1>{selectedSubject.name}</h1>

        {/* ===== STATS GRID ===== */}
        <div className="stats-grid">
          <div className="stat-card">
            <h4>Total Tasks</h4>
            <p>{totalTasks}</p>
          </div>

          <div className="stat-card">
            <h4>Completed</h4>
            <p>{completedTasks}</p>
          </div>

          <div className="stat-card">
            <h4>Progress</h4>
            <p>{progress}%</p>
          </div>

          <div className="stat-card">
            <h4>Visits</h4>
            <p>{visits}</p>
          </div>
        </div>

        {/* ===== LINE GRAPH STYLE ===== */}
        <div className="analysis-card">
          <h3>Weekly Performance</h3>
          <div className="line-chart">
            {[20, 50, 35, 70, 60, 80, 55].map((val, i) => (
              <div
                key={i}
                className="line-point"
                style={{ height: `${val}%` }}
              ></div>
            ))}
          </div>
        </div>

        {/* ===== ADD TOPIC ===== */}
        <div className="add-section">
          <input
            type="text"
            placeholder="New Topic"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
          />
          <button onClick={addTopic}>+ Add</button>
        </div>

        {/* ===== TOPICS ===== */}
        <div className="topics">
          {selectedSubject.topics.map((topic, topicIndex) => (
            <div key={topicIndex} className="topic-card">

              <h3>{topic.name}</h3>

              {topic.tasks.map((task, taskIndex) => (
                <div
                  key={taskIndex}
                  className="task-item"
                  onClick={() =>
                    toggleTask(topicIndex, taskIndex)
                  }
                >
                  <span
                    className={
                      task.completed ? "completed" : ""
                    }
                  >
                    {task.title}
                  </span>

                  <div
                    className="task-actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() =>
                        editTask(topicIndex, taskIndex)
                      }
                    >
                      ✏
                    </button>
                    <button
                      onClick={() =>
                        deleteTask(topicIndex, taskIndex)
                      }
                    >
                      🗑
                    </button>
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
                  + Add
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