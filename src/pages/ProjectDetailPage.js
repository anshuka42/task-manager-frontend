import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask,
  getProjectMembers,
  getAllUsers,
  addProjectMember,
} from "../api";
import "../App.css";

function ProjectDetailPage() {
  const { id: projectId } = useParams();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tasks");

  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskStatus, setTaskStatus] = useState("Todo");
  const [taskPriority, setTaskPriority] = useState("Medium");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskAssignedTo, setTaskAssignedTo] = useState("");
  const [taskError, setTaskError] = useState("");
  const [saving, setSaving] = useState(false);

  const intervalRef = useRef(null);

  useEffect(() => {
    loadData();

    
    intervalRef.current = setInterval(() => {
      loadData();
    }, 5000);

    return () => clearInterval(intervalRef.current);
  }, [projectId]);

  async function loadData() {
    let tasksData = await getTasksByProject(projectId);
    let membersData = await getProjectMembers(projectId);
    let usersData = await getAllUsers();

    setTasks(Array.isArray(tasksData) ? tasksData : []);
    setMembers(Array.isArray(membersData) ? membersData : []);
    setAllUsers(Array.isArray(usersData) ? usersData : []);
    setLoading(false);
  }

  function openCreateTask() {
    setEditingTask(null);
    setTaskTitle("");
    setTaskDesc("");
    setTaskStatus("Todo");
    setTaskPriority("Medium");
    setTaskDueDate("");
    setTaskAssignedTo("");
    setTaskError("");
    setShowTaskModal(true);
  }

  function openEditTask(task) {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDesc(task.description || "");
    setTaskStatus(task.status);
    setTaskPriority(task.priority);
    setTaskDueDate(task.due_date ? task.due_date.split("T")[0] : "");
    setTaskAssignedTo(task.assigned_to || "");
    setTaskError("");
    setShowTaskModal(true);
  }

  async function handleSaveTask() {
    if (!taskTitle) {
      setTaskError("Task title is required");
      return;
    }

    setSaving(true);
    setTaskError("");

    const taskData = {
      title: taskTitle,
      description: taskDesc,
      status: taskStatus,
      priority: taskPriority,
      due_date: taskDueDate || null,
      project_id: projectId,
      assigned_to: taskAssignedTo || null,
    };

    let result;
    if (editingTask) {
      result = await updateTask(editingTask.id, taskData);
    } else {
      result = await createTask(taskData);
    }

    setSaving(false);

    
    if (result.message && result.message.includes("already exists")) {
      setTaskError(result.message);
      return;
    }

    setShowTaskModal(false);
    loadData();
  }

  async function handleDeleteTask(taskId) {
    if (!window.confirm("Remove this task? (Data will be kept safely)")) return;
    await deleteTask(taskId);
    loadData();
  }

  async function handleStatusChange(taskId, newStatus, task) {
    await updateTask(taskId, { ...task, status: newStatus });
    loadData();
  }

  async function handleAddMember(userId) {
    await addProjectMember(projectId, userId);
    loadData();
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

  function getNonMembers() {
    const memberIds = members.map((m) => m.id);
    return allUsers.filter((u) => !memberIds.includes(u.id));
  }

  if (loading) return <div className="page"><p>Loading project...</p></div>;

  return (
    <div className="page">
      <div className="top-bar">
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Project Tasks</h1>
          <span style={{ fontSize: "12px", color: "#aaa" }}>⟳ Auto-refreshes every 5 sec</span>
        </div>
        <button className="btn-small btn-blue" onClick={openCreateTask}>
          + Add Task
        </button>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === "tasks" ? "active" : ""}`} onClick={() => setActiveTab("tasks")}>
          Tasks ({tasks.length})
        </button>
        <button className={`tab ${activeTab === "members" ? "active" : ""}`} onClick={() => setActiveTab("members")}>
          Members ({members.length})
        </button>
      </div>

      {/* Tasks Tab */}
      {activeTab === "tasks" && (
        <div>
          {tasks.length === 0 ? (
            <p className="empty-msg">No tasks yet. Click "+ Add Task" to create one.</p>
          ) : (
            tasks.map((task) => (
              <div className="task-item" key={task.id}>
                <div className="task-info">
                  <h4>{task.title}</h4>
                  {task.description && <p>{task.description}</p>}
                  <p style={{ color: "#aaa", fontSize: "12px" }}>
                    Assigned to: {task.assigned_to_name || "Nobody"}
                    {task.due_date && (
                      <span> | Due: {new Date(task.due_date).toLocaleDateString()}</span>
                    )}
                  </p>
                  {/* Show who last updated */}
                  {task.last_updated_by_name && (
                    <p style={{ color: "#bbb", fontSize: "12px" }}>
                      Last updated by: <strong>{task.last_updated_by_name}</strong>
                      {task.updated_at && (
                        <span> at {new Date(task.updated_at).toLocaleString()}</span>
                      )}
                    </p>
                  )}
                  <div className="task-badges">
                    <span className={getBadgeClass(task.status)}>{task.status}</span>
                    <span className={getPriorityClass(task.priority)}>{task.priority}</span>
                  </div>
                </div>

                <div className="task-actions">
                  <select
                    className="status-select"
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value, task)}
                  >
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                  <button className="btn-small btn-blue" onClick={() => openEditTask(task)}>Edit</button>
                  <button className="btn-small btn-red" onClick={() => handleDeleteTask(task.id)}>Remove</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Members Tab */}
      {activeTab === "members" && (
        <div>
          <h3 style={{ marginBottom: "15px", fontSize: "16px" }}>Project Members</h3>

          {members.map((member) => (
            <div className="card" key={member.id} style={{ padding: "12px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>{member.name}</strong>
                  <span style={{ color: "#888", fontSize: "13px", marginLeft: "8px" }}>{member.email}</span>
                </div>
                <span className="badge" style={{ background: "#dfe6e9" }}>{member.role}</span>
              </div>
            </div>
          ))}

          {user.role === "Admin" && (
            <div style={{ marginTop: "20px" }}>
              <h3 style={{ marginBottom: "12px", fontSize: "16px" }}>Add Members</h3>
              {getNonMembers().length === 0 ? (
                <p className="empty-msg">All users are already members.</p>
              ) : (
                getNonMembers().map((u) => (
                  <div className="card" key={u.id} style={{ padding: "10px 18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>{u.name} ({u.email})</span>
                      <button className="btn-small btn-green" onClick={() => handleAddMember(u.id)}>Add</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editingTask ? "Edit Task" : "Create Task"}</h3>

            {taskError && <p className="error-msg">{taskError}</p>}

            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                placeholder="Task title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                placeholder="Task details..."
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select value={taskStatus} onChange={(e) => setTaskStatus(e.target.value)}>
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="form-group">
              <label>Due Date</label>
              <input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Assign To</label>
              <select value={taskAssignedTo} onChange={(e) => setTaskAssignedTo(e.target.value)}>
                <option value="">-- Nobody --</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="modal-buttons">
              <button className="btn-small btn-green" onClick={handleSaveTask} disabled={saving}>
                {saving ? "Saving..." : editingTask ? "Update Task" : "Create Task"}
              </button>
              <button className="btn-small btn-gray" onClick={() => setShowTaskModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetailPage;
