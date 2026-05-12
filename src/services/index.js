import apiClient from "./apiClient";

// Map backend Title Case → frontend lowercase keys
const backendToFrontend = {
  Food: "food",
  Travel: "travel",
  Shopping: "shopping",
  Entertainment: "entertainment",
  Healthcare: "health",
  Bills: "bills",
  Education: "education",
  Utilities: "utilities",
  Other: "shopping",
  Salary: "bills",
  Freelance: "bills",
  Investments: "bills",
};

// Map frontend lowercase keys → backend Title Case
const frontendToBackend = {
  food: "Food",
  travel: "Travel",
  shopping: "Shopping",
  entertainment: "Entertainment",
  health: "Healthcare",
  bills: "Bills",
  education: "Education",
  utilities: "Utilities",
};

export const mapCategoryToFrontend = (backendCategory) =>
  backendToFrontend[backendCategory] || "shopping";

export const mapCategoryToBackend = (frontendKey) =>
  frontendToBackend[frontendKey] || "Other";

// Transform backend expense object → frontend format
export const transformExpense = (exp) => ({
  id: exp._id,
  title: exp.title,
  amount: exp.amount,
  category: mapCategoryToFrontend(exp.category),
  date: exp.date,
  notes: exp.notes || "",
  paymentMethod: exp.paymentMethod || "Cash",
  recurring: exp.recurring || false,
  tags: exp.tags || [],
  source: exp.tags && exp.tags.includes("auto-synced") ? "bank" : "manual",
});

// ─── Auth Service ──────────────────────────────────────────────
export const authService = {
  register: async (name, email, password) => {
    const { data } = await apiClient.post("/auth/register", {
      name,
      email,
      password,
    });
    if (data.token) localStorage.setItem("fin.token", data.token);
    return data;
  },

  login: async (email, password) => {
    const { data } = await apiClient.post("/auth/login", { email, password });
    if (data.token) localStorage.setItem("fin.token", data.token);
    return data;
  },

  logout: () => {
    localStorage.removeItem("fin.token");
    localStorage.setItem("fin.authed", "0");
  },

  getProfile: async () => {
    const { data } = await apiClient.get("/auth/profile");
    return data;
  },

  updateProfile: async (userData) => {
    const { data } = await apiClient.put("/auth/profile", userData);
    return data;
  },
};

// ─── Expense Service ────────────────────────────────────────────
export const expenseService = {
  getAll: async (params = {}) => {
    const { data } = await apiClient.get("/expenses", { params });
    return {
      expenses: data.expenses.map(transformExpense),
      total: data.total,
      pages: data.pages,
    };
  },

  add: async (expense) => {
    const { data } = await apiClient.post("/expenses", {
      title: expense.title,
      amount: expense.amount,
      category: mapCategoryToBackend(expense.category),
      date: expense.date,
      notes: expense.notes,
      paymentMethod: expense.paymentMethod,
    });
    return transformExpense(data);
  },

  update: async (id, expense) => {
    const payload = { ...expense };
    if (payload.category) payload.category = mapCategoryToBackend(payload.category);
    const { data } = await apiClient.put(`/expenses/${id}`, payload);
    return transformExpense(data);
  },

  delete: async (id) => {
    const { data } = await apiClient.delete(`/expenses/${id}`);
    return data;
  },
};

// ─── Budget Service ─────────────────────────────────────────────
export const budgetService = {
  set: async (month, monthlyBudget, categoryBudgets) => {
    const { data } = await apiClient.post("/budgets", {
      month,
      monthlyBudget,
      categoryBudgets,
    });
    return data;
  },

  get: async (month) => {
    const { data } = await apiClient.get(`/budgets/${month}`);
    return data;
  },
};

// ─── Dashboard Service ──────────────────────────────────────────
export const dashboardService = {
  getSummary: async () => {
    const { data } = await apiClient.get("/dashboard/summary");
    return data;
  },

  getCategories: async () => {
    const { data } = await apiClient.get("/dashboard/categories");
    return data;
  },

  getMonthly: async () => {
    const { data } = await apiClient.get("/dashboard/monthly");
    return data;
  },
};

// ─── AI Service ─────────────────────────────────────────────────
export const aiService = {
  chat: async (message) => {
    const { data } = await apiClient.post("/ai/chat", { message });
    // Returns { reply, action, actionData }
    return data;
  },

  getSummary: async () => {
    const { data } = await apiClient.get("/ai/summary");
    return data.summary;
  },

  getHealthScore: async () => {
    const { data } = await apiClient.get("/ai/health-score");
    return data;
  },
};


// ─── Goal Service ───────────────────────────────────────────────
export const goalService = {
  getAll: async () => {
    const { data } = await apiClient.get("/goals");
    return data;
  },

  create: async (goal) => {
    const { data } = await apiClient.post("/goals", goal);
    return data;
  },

  update: async (id, goal) => {
    const { data } = await apiClient.put(`/goals/${id}`, goal);
    return data;
  },

  delete: async (id) => {
    const { data } = await apiClient.delete(`/goals/${id}`);
    return data;
  },
};

// ─── Notification Service ───────────────────────────────────────
export const notificationService = {
  getAll: async () => {
    const { data } = await apiClient.get("/notifications");
    return data;
  },

  markRead: async (id) => {
    const { data } = await apiClient.put(`/notifications/${id}/read`);
    return data;
  },
};

// ─── Export Service ─────────────────────────────────────────────
export const exportService = {
  downloadCSV: async () => {
    const response = await apiClient.get("/export/csv", {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "expenses.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  downloadPDF: async () => {
    const response = await apiClient.get("/export/pdf", {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "expenses.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
