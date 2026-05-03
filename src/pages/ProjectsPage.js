import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProjects, createProject, deleteProject } from "../api";
import "../App.css";

function ProjectsPage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);

  
  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);
    let data = await getProjects();
    setProjects(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function handleCreateProject() {
    if (!projectName) {
      setErrorMsg("Project name is required");
      return;
    }

    setSaving(true);
    setErrorMsg("");

    let data = await createProject(projectName, projectDesc);

    setSaving(false);

    if (data.id) {
      setShowModal(false);
      setProjectName("");
      setProjectDesc("");
      loadProjects(); 
    } else {
      setErrorMsg(data.message || "Failed to create project");
    }
  }

  async function handleDelete(projectId) {
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    await deleteProject(projectId);
    loadProjects(); 
  }

  if (loading) return <div className="page"><p>Loading projects...</p></div>;

  return (
    <div className="page">
      <div className="top-bar">
        <h1 className="page-title" style={{ margin: 0 }}>Projects</h1>
        <button className="btn-small btn-blue" onClick={() => setShowModal(true)}>
          + New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <p className="empty-msg">No projects yet. Create your first project!</p>
      ) : (
        <div className="grid-2">
          {projects.map((project) => (
            <div className="card" key={project.id}>
              <div className="card-header">
                <h3>{project.name}</h3>
                <div style={{ display: "flex", gap: "6px" }}>
                  <Link to={`/projects/${project.id}`}>
                    <button className="btn-small btn-blue">Open</button>
                  </Link>
                  {/* Only owner or admin can delete */}
                  {(user.id === project.owner_id || user.role === "Admin") && (
                    <button
                      className="btn-small btn-red"
                      onClick={() => handleDelete(project.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <p>{project.description || "No description"}</p>
              <p style={{ fontSize: "12px", color: "#aaa", marginTop: "8px" }}>
                Owner: {project.owner_name}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Create New Project</h3>

            {errorMsg && <p className="error-msg">{errorMsg}</p>}

            <div className="form-group">
              <label>Project Name *</label>
              <input
                type="text"
                placeholder="Enter project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                placeholder="What is this project about?"
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
              />
            </div>

            <div className="modal-buttons">
              <button className="btn-small btn-green" onClick={handleCreateProject} disabled={saving}>
                {saving ? "Creating..." : "Create Project"}
              </button>
              <button className="btn-small btn-gray" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectsPage;
