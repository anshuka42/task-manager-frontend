import { useState, useEffect, useRef } from "react";
import { getTaskStats, getMyTasks, getMyOwnedTasks, updateTask } from "../api";
import "../App.css";

function DashboardPage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [stats, setStats] = useState({ total: 0, todo: 0, inprogress: 0, done: 0, overdue: 0 });
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [ownedTasks, setOwnedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("assigned");

  const intervalRef = useRef(null);

  useEffect(() => {
    loadDashboardData();
    intervalRef.current = setInterval(() => {
      loadDashboardData();
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, []);

  async function loadDashboardData() {
    const [statsData, tasksData, ownedData] = await Promise.all([
      getTaskStats(),
      getMyTasks(),
      getMyOwnedTasks(),
    ]);
    setStats(statsData || {});
    setAssignedTasks(Array.isArray(tasksData) ? tasksData : []);
    setOwnedTasks(Array.isArray(ownedData) ? ownedData : []);
    setLoading(false);
  }

  async function handleStatusChange(taskId, newStatus, task) {
    await updateTask(taskId, { ...task, status: newStatus });
    loadDashboardData();
  }

  function getBadgeClass(status) {
    if (status === "Todo") return "badge badge-todo";
    if (status === "In Progress") return "badge badge-inprogress";
    if (status === "Done") return "badge badge-done";
    return "badge";
  }

  function getPriorityClass(priority) {
    if (priority === "Low") return "badge badge-low";
    if (priority === "Medium") return "badge badge-medium";
    if (priority === "High") return "badge badge-high";
    return "badge";
  }

  function isOverdue(dueDate, status) {
    if (!dueDate || status === "Done") return false;
    return new Date(dueDate) < new Date();
  }

  function groupByProject(tasks) {
    const grouped = {};
    tasks.forEach((task) => {
      const key = task.project_name || "Unknown Project";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(task);
    });
    return grouped;
  }

  function TaskCard({ task, showAssignee }) {
    return (
      <div className="task-item">
        <div className="task-info">
          <h4>{task.title}</h4>
          {task.description && <p>{task.description}</p>}
          <p style={{ color: "#aaa", fontSize: "12px" }}>
            {showAssignee && task.assigned_to_name && (
              <span>👤 {task.assigned_to_name} &nbsp;|&nbsp; </span>
            )}
            {task.due_date && (
              <span>📅 Due: {new Date(task.due_date).toLocaleDateString()}</span>
            )}
          </p>
          {task.last_updated_by_name && (
            <p style={{ color: "#bbb", fontSize: "12px" }}>
              ✏️ Last updated by: <strong>{task.last_updated_by_name}</strong>
            </p>
          )}
          <div className="task-badges">
            <span className={getBadgeClass(task.status)}>{task.status}</span>
            <span className={getPriorityClass(task.priority)}>{task.priority}</span>
            {isOverdue(task.due_date, task.status) && (
              <span className="badge badge-overdue">Overdue</span>
            )}
          </div>
        </div>
        <div>
          <select
            className="status-select"
            value={task.status}
            onChange={(e) => handleStatusChange(task.id, e.target.value, task)}
          >
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>
      </div>
    );
  }

  if (loading) return <div className="page"><p>Loading dashboard...</p></div>;

  const groupedOwned = groupByProject(ownedTasks);

  return (
    <div className="page">

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 className="page-title" style={{ margin: 0 }}>Welcome, {user.name}! 👋</h1>
        <span style={{ fontSize: "12px", color: "#aaa" }}>⟳ Auto-refreshes every 5 sec</span>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.total || 0}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: "#f39c12" }}>{stats.todo || 0}</div>
          <div className="stat-label">To Do</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: "#3498db" }}>{stats.inprogress || 0}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: "#27ae60" }}>{stats.done || 0}</div>
          <div className="stat-label">Done</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: "#e94560" }}>{stats.overdue || 0}</div>
          <div className="stat-label">Overdue</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0", marginBottom: "20px", borderBottom: "2px solid #eee" }}>
        <button
          onClick={() => setActiveTab("assigned")}
          style={{
            background: "none", border: "none", padding: "10px 20px", cursor: "pointer",
            fontWeight: activeTab === "assigned" ? "700" : "400",
            color: activeTab === "assigned" ? "#e94560" : "#888",
            borderBottom: activeTab === "assigned" ? "3px solid #e94560" : "3px solid transparent",
            fontSize: "14px", marginBottom: "-2px",
          }}
        >
          📋 Mujhe Assign Hua &nbsp;
          <span style={{
            background: activeTab === "assigned" ? "#e94560" : "#ddd",
            color: activeTab === "assigned" ? "#fff" : "#666",
            borderRadius: "12px", padding: "1px 8px", fontSize: "12px"
          }}>
            {assignedTasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("owned")}
          style={{
            background: "none", border: "none", padding: "10px 20px", cursor: "pointer",
            fontWeight: activeTab === "owned" ? "700" : "400",
            color: activeTab === "owned" ? "#3498db" : "#888",
            borderBottom: activeTab === "owned" ? "3px solid #3498db" : "3px solid transparent",
            fontSize: "14px", marginBottom: "-2px",
          }}
        >
          🗂️ Mere Projects &nbsp;
          <span style={{
            background: activeTab === "owned" ? "#3498db" : "#ddd",
            color: activeTab === "owned" ? "#fff" : "#666",
            borderRadius: "12px", padding: "1px 8px", fontSize: "12px"
          }}>
            {ownedTasks.length}
          </span>
        </button>
      </div>

      {/* === TAB 1: Mujhe Assign Hua === */}
      {activeTab === "assigned" && (
        <div>
          {assignedTasks.length === 0 ? (
            <p className="empty-msg">Abhi koi task assign nahi hua aapko.</p>
          ) : (
            assignedTasks.map((task) => (
              <TaskCard key={task.id} task={task} showAssignee={false} />
            ))
          )}
        </div>
      )}

      {/* === TAB 2: Mere Banaye Projects ke Tasks === */}
      {activeTab === "owned" && (
        <div>
          {ownedTasks.length === 0 ? (
            <p className="empty-msg">Aapke banaye projects mein abhi koi task nahi hai.</p>
          ) : (
            Object.entries(groupedOwned).map(([projectName, tasks]) => (
              <div key={projectName} style={{ marginBottom: "28px" }}>
                <div style={{
                  background: "linear-gradient(135deg, #1a1a2e, #16213e)",
                  color: "#fff",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  marginBottom: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <span style={{ fontWeight: "700", fontSize: "15px" }}>📁 {projectName}</span>
                  <span style={{
                    fontSize: "12px", background: "#e94560",
                    padding: "2px 10px", borderRadius: "20px"
                  }}>
                    {tasks.length} task{tasks.length !== 1 ? "s" : ""}
                  </span>
                </div>
                {tasks.map((task) => (
                  <TaskCard key={task.id} task={task} showAssignee={true} />
                ))}
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}

export default DashboardPage;