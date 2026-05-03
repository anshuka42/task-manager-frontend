// All API calls go here - easy to find and change

const BASE_URL = process.env.REACT_APP_API_URL;
console.log("API Base URL:", BASE_URL);

// Get the saved token from localStorage
function getToken() {
  return localStorage.getItem("token");
}

// ========== AUTH ==========

export async function signup(name, email, password, role) {
  let res = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role }),
  });
  return res.json();
}

export async function login(email, password) {
  let res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

// ========== PROJECTS ==========

export async function getProjects() {
  let res = await fetch(`${BASE_URL}/projects`, {
    headers: { authorization: getToken() },
  });
  return res.json();
}

export async function createProject(name, description) {
  let res = await fetch(`${BASE_URL}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: getToken(),
    },
    body: JSON.stringify({ name, description }),
  });
  return res.json();
}

export async function updateProject(id, name, description) {
  let res = await fetch(`${BASE_URL}/projects/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      authorization: getToken(),
    },
    body: JSON.stringify({ name, description }),
  });
  return res.json();
}

export async function deleteProject(id) {
  let res = await fetch(`${BASE_URL}/projects/${id}`, {
    method: "DELETE",
    headers: { authorization: getToken() },
  });
  return res.json();
}

export async function getProjectMembers(projectId) {
  let res = await fetch(`${BASE_URL}/projects/${projectId}/members`, {
    headers: { authorization: getToken() },
  });
  return res.json();
}

export async function addProjectMember(projectId, userId) {
  let res = await fetch(`${BASE_URL}/projects/${projectId}/members`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: getToken(),
    },
    body: JSON.stringify({ userId }),
  });
  return res.json();
}

// ========== TASKS ==========

export async function getTasksByProject(projectId) {
  let res = await fetch(`${BASE_URL}/tasks/project/${projectId}`, {
    headers: { authorization: getToken() },
  });
  return res.json();
}

export async function getMyOwnedTasks() {
  let res = await fetch(`${BASE_URL}/tasks/my-owned-tasks`, {
    headers: { authorization: getToken() },
  });
  return res.json();
}

export async function getMyTasks() {
  let res = await fetch(`${BASE_URL}/tasks/my-tasks`, {
    headers: { authorization: getToken() },
  });
  return res.json();
}

export async function getTaskStats() {
  let res = await fetch(`${BASE_URL}/tasks/stats`, {
    headers: { authorization: getToken() },
  });
  return res.json();
}

export async function createTask(taskData) {
  let res = await fetch(`${BASE_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: getToken(),
    },
    body: JSON.stringify(taskData),
  });
  return res.json();
}

export async function updateTask(id, taskData) {
  let res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      authorization: getToken(),
    },
    body: JSON.stringify(taskData),
  });
  return res.json();
}

export async function deleteTask(id) {
  let res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: { authorization: getToken() },
  });
  return res.json();
}

// ========== USERS ==========

export async function getAllUsers() {
  let res = await fetch(`${BASE_URL}/users`, {
    headers: { authorization: getToken() },
  });
  return res.json();
}