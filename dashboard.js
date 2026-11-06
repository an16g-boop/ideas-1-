const orderData = [
  { id: "TG-2048", customer: "María Fernanda", initials: "MF", date: "25 oct 2026", amount: 2489, status: "Pendiente" },
  { id: "TG-2047", customer: "Carlos Ramírez", initials: "CR", date: "25 oct 2026", amount: 6899, status: "Completado" },
  { id: "TG-2046", customer: "Ana Sofía López", initials: "AS", date: "24 oct 2026", amount: 1299, status: "En tránsito" },
  { id: "TG-2045", customer: "Jorge Martínez", initials: "JM", date: "24 oct 2026", amount: 5499, status: "Completado" },
  { id: "TG-2044", customer: "Lucía Hernández", initials: "LH", date: "23 oct 2026", amount: 4799, status: "Cancelado" },
  { id: "TG-2043", customer: "Pedro Sánchez", initials: "PS", date: "23 oct 2026", amount: 1899, status: "Pendiente" },
  { id: "TG-2042", customer: "Sofía Torres", initials: "ST", date: "22 oct 2026", amount: 3299, status: "En tránsito" },
  { id: "TG-2041", customer: "Diego Flores", initials: "DF", date: "22 oct 2026", amount: 2499, status: "Completado" }
];

const catalogData = [
  { name: "Máquina clásica M100", category: "Máquinas de coser", sku: "TG-MAQ-001", stock: 18, price: 2499, status: "Activo" },
  { name: "StitchPro Digital 300", category: "Máquinas de coser", sku: "TG-MAQ-002", stock: 7, price: 6899, status: "Activo" },
  { name: "Overlock Remalladora 4H", category: "Máquinas de coser", sku: "TG-MAQ-003", stock: 0, price: 5499, status: "Agotado" },
  { name: "Laptop Gaming RTX", category: "Laptops gaming", sku: "TG-LAP-001", stock: 12, price: 18999, status: "Activo" },
  { name: "Mini Sew Compacta", category: "Máquinas de coser", sku: "TG-MAQ-004", stock: 3, price: 1299, status: "Activo" },
  { name: "Heavy Stitch 500", category: "Máquinas de coser", sku: "TG-MAQ-005", stock: 9, price: 4799, status: "Activo" },
  { name: "Creativa Bordadora 800", category: "Máquinas de coser", sku: "TG-MAQ-006", stock: 5, price: 8999, status: "Activo" }
];

const customerData = [
  { name: "María Fernanda", email: "maria.fernanda@email.com", orders: 8, spent: 18240, joined: "12 ago 2026" },
  { name: "Carlos Ramírez", email: "carlos.r@email.com", orders: 5, spent: 24190, joined: "03 jul 2026" },
  { name: "Ana Sofía López", email: "ana.lopez@email.com", orders: 3, spent: 7697, joined: "19 sep 2026" },
  { name: "Jorge Martínez", email: "jorge.mtz@email.com", orders: 4, spent: 13897, joined: "28 jun 2026" },
  { name: "Lucía Hernández", email: "lucia.h@email.com", orders: 2, spent: 6298, joined: "01 oct 2026" },
  { name: "Pedro Sánchez", email: "pedro.s@email.com", orders: 6, spent: 14950, joined: "11 may 2026" },
  { name: "Sofía Torres", email: "sofia.t@email.com", orders: 1, spent: 3299, joined: "21 oct 2026" }
];

const pageSize = 5;
let orderPage = 1;
let dataPage = 1;
let orderQuery = "";
let dataQuery = "";
let orderSort = { key: "id", direction: "desc" };
let activeView = "dashboard";
let activeFormStep = 0;
let toastTimeout;

const elements = {
  shell: document.querySelector(".app-shell"),
  sidebar: document.querySelector("#sidebar"),
  orderRows: document.querySelector("#orderRows"),
  pagination: document.querySelector("#pagination"),
  tableSummary: document.querySelector("#tableSummary"),
  dashboardView: document.querySelector("#dashboardView"),
  dataView: document.querySelector("#dataView"),
  catalogView: document.querySelector("#catalogView"),
  catalogFrame: document.querySelector("#catalogFrame"),
  settingsView: document.querySelector("#settingsView"),
  loadingBar: document.querySelector("#loadingBar"),
  globalSearch: document.querySelector("#globalSearch"),
  dataSearch: document.querySelector("#dataSearch"),
  productModal: document.querySelector("#productModal"),
  productForm: document.querySelector("#productForm"),
  blockingLoader: document.querySelector("#blockingLoader"),
  toastRegion: document.querySelector("#toastRegion")
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function currency(value) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(value);
}

function statusClass(status) {
  if (status === "Completado" || status === "Activo") return "status-completed";
  if (status === "Pendiente") return "status-pending";
  if (status === "Cancelado" || status === "Agotado") return "status-cancelled";
  return "status-transit";
}

function showToast(message, type = "success") {
  window.clearTimeout(toastTimeout);
  const toast = document.createElement("div");
  toast.className = `toast${type === "error" ? " error" : ""}`;
  toast.setAttribute("role", "status");
  toast.innerHTML = `<span class="toast-icon" aria-hidden="true">${type === "error" ? "!" : "✓"}</span><span>${escapeHtml(message)}</span>`;
  elements.toastRegion.append(toast);
  window.setTimeout(() => toast.remove(), 3600);
}

function filteredOrders() {
  const query = orderQuery.trim().toLocaleLowerCase("es");
  return orderData.filter((order) => !query || Object.values(order).some((value) => String(value).toLocaleLowerCase("es").includes(query)));
}

function renderPagination(container, current, total, onPage) {
  container.replaceChildren();
  const previous = document.createElement("button");
  previous.className = "page-button";
  previous.type = "button";
  previous.textContent = "‹";
  previous.setAttribute("aria-label", "Página anterior");
  previous.disabled = current <= 1;
  previous.addEventListener("click", () => onPage(current - 1));
  container.append(previous);
  for (let page = 1; page <= total; page += 1) {
    const button = document.createElement("button");
    button.className = `page-button${page === current ? " is-current" : ""}`;
    button.type = "button";
    button.textContent = String(page);
    button.setAttribute("aria-label", `Página ${page}`);
    button.setAttribute("aria-current", page === current ? "page" : "false");
    button.addEventListener("click", () => onPage(page));
    container.append(button);
  }
  const next = document.createElement("button");
  next.className = "page-button";
  next.type = "button";
  next.textContent = "›";
  next.setAttribute("aria-label", "Página siguiente");
  next.disabled = current >= total;
  next.addEventListener("click", () => onPage(current + 1));
  container.append(next);
}

function renderOrders() {
  const filtered = filteredOrders().sort((left, right) => {
    const a = left[orderSort.key];
    const b = right[orderSort.key];
    const comparison = typeof a === "number" ? a - b : String(a).localeCompare(String(b), "es", { numeric: true });
    return comparison * (orderSort.direction === "asc" ? 1 : -1);
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  orderPage = Math.min(orderPage, totalPages);
  const start = (orderPage - 1) * pageSize;
  const rows = filtered.slice(start, start + pageSize);

  elements.orderRows.innerHTML = rows.length ? rows.map((order) => `
    <tr>
      <td class="order-id">#${escapeHtml(order.id)}</td>
      <td><span class="customer-cell"><span class="customer-avatar">${escapeHtml(order.initials)}</span>${escapeHtml(order.customer)}</span></td>
      <td>${escapeHtml(order.date)}</td><td>${currency(order.amount)}</td>
      <td><span class="status-badge ${statusClass(order.status)}">${escapeHtml(order.status)}</span></td>
      <td><button class="row-action" type="button" aria-label="Eliminar pedido ${escapeHtml(order.id)}" data-delete-order="${escapeHtml(order.id)}">···</button></td>
    </tr>`).join("") : '<tr><td class="empty-row" colspan="6">No se encontraron pedidos.</td></tr>';
  elements.tableSummary.textContent = filtered.length
    ? `Mostrando ${start + 1}–${Math.min(start + pageSize, filtered.length)} de ${filtered.length} pedidos`
    : "No hay pedidos para mostrar";
  renderPagination(elements.pagination, orderPage, totalPages, (page) => {
    orderPage = page;
    renderOrders();
  });
}

const dataConfig = {
  products: {
    title: "Productos",
    description: "Administra el inventario y el estado de tus productos.",
    headers: [["name", "Producto"], ["category", "Categoría"], ["sku", "SKU"], ["stock", "Existencias"], ["price", "Precio"], ["status", "Estado"]],
    rows: catalogData
  },
  orders: {
    title: "Pedidos",
    description: "Revisa, busca y gestiona las órdenes de tu tienda.",
    headers: [["id", "Pedido"], ["customer", "Cliente"], ["date", "Fecha"], ["amount", "Total"], ["status", "Estado"]],
    rows: orderData
  },
  customers: {
    title: "Clientes",
    description: "Consulta la actividad y compras de tus clientes.",
    headers: [["name", "Cliente"], ["email", "Correo electrónico"], ["orders", "Pedidos"], ["spent", "Total comprado"], ["joined", "Se unió"]],
    rows: customerData
  }
};

function dataCell(row, key) {
  if (key === "status") return `<span class="status-badge ${statusClass(row[key])}">${escapeHtml(row[key])}</span>`;
  if (key === "price" || key === "amount" || key === "spent") return currency(row[key]);
  if (key === "name" || key === "customer") {
    const name = row[key];
    const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("");
    return `<span class="customer-cell"><span class="customer-avatar">${escapeHtml(initials)}</span>${escapeHtml(name)}</span>`;
  }
  return escapeHtml(row[key]);
}

function renderDataView() {
  const config = dataConfig[activeView];
  if (!config) return;
  const query = dataQuery.trim().toLocaleLowerCase("es");
  const matches = config.rows.filter((row) => Object.values(row).some((value) => String(value).toLocaleLowerCase("es").includes(query)));
  const totalPages = Math.max(1, Math.ceil(matches.length / pageSize));
  dataPage = Math.min(dataPage, totalPages);
  const start = (dataPage - 1) * pageSize;
  const shown = matches.slice(start, start + pageSize);
  document.querySelector("#dataTableTitle").textContent = config.title;
  document.querySelector("#dataTableDescription").textContent = config.description;
  document.querySelector("#dataAddButton").hidden = activeView === "customers";
  document.querySelector("#dataHeaders").innerHTML = `<tr>${config.headers.map(([, label]) => `<th>${escapeHtml(label)}</th>`).join("")}${activeView === "products" ? "<th><span class=\"sr-only\">Acciones</span></th>" : ""}</tr>`;
  document.querySelector("#dataRows").innerHTML = shown.length ? shown.map((row) => `
    <tr>${config.headers.map(([key]) => `<td>${dataCell(row, key)}</td>`).join("")}${activeView === "products" ? `<td><button class="row-action" type="button" aria-label="Eliminar ${escapeHtml(row.name)}" data-delete-product="${escapeHtml(row.sku)}">···</button></td>` : ""}</tr>
  `).join("") : `<tr><td class="empty-row" colspan="${config.headers.length + 1}">No se encontraron resultados.</td></tr>`;
  document.querySelector("#dataSummary").textContent = matches.length
    ? `Mostrando ${start + 1}–${Math.min(start + pageSize, matches.length)} de ${matches.length} registros`
    : "No hay registros para mostrar";
  renderPagination(document.querySelector("#dataPagination"), dataPage, totalPages, (page) => {
    dataPage = page;
    renderDataView();
  });
}

function animatePanels(container) {
  const panels = [
    ...(container.matches(".panel") ? [container] : []),
    ...container.querySelectorAll(".panel")
  ];
  panels.forEach((panel) => panel.classList.remove("animate-in"));
  void container.offsetWidth;
  panels.forEach((panel) => panel.classList.add("animate-in"));
}

function animateDateChange() {
  const panels = elements.dashboardView.querySelectorAll(".kpi-card, .sales-panel, .status-panel");
  panels.forEach((panel) => panel.classList.remove("date-changing"));
  void elements.dashboardView.offsetWidth;
  panels.forEach((panel) => panel.classList.add("date-changing"));
}

let catalogContentObserver;
elements.catalogFrame.addEventListener("load", () => {
  const catalogDocument = elements.catalogFrame.contentDocument;
  if (!catalogDocument) {
    showToast("No se pudo cargar el catálogo dentro del panel.", "error");
    return;
  }
  const resizeFrame = () => {
    const height = Math.max(catalogDocument.documentElement.scrollHeight, catalogDocument.body.scrollHeight);
    elements.catalogFrame.style.height = `${height}px`;
  };
  catalogContentObserver?.disconnect();
  catalogContentObserver = new ResizeObserver(resizeFrame);
  catalogContentObserver.observe(catalogDocument.documentElement);
  catalogContentObserver.observe(catalogDocument.body);
  resizeFrame();
  requestAnimationFrame(resizeFrame);
});

function setView(view) {
  activeView = view;
  document.querySelectorAll(".nav-link[data-view]").forEach((link) => {
    const isActive = link.dataset.view === view;
    link.classList.toggle("is-active", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  elements.dashboardView.hidden = view !== "dashboard";
  elements.dataView.hidden = !dataConfig[view];
  elements.catalogView.hidden = view !== "catalog";
  elements.settingsView.hidden = view !== "settings";
  const viewTitle = view === "dashboard" ? "Resumen de ventas" : view === "settings" ? "Ajustes" : view === "catalog" ? "Catálogo" : dataConfig[view].title;
  document.querySelector("#pageTitle").textContent = viewTitle;
  document.querySelector("#breadcrumbCurrent").textContent = view === "dashboard" ? "Dashboard" : viewTitle;
  document.querySelector("#pageDescription").textContent = view === "dashboard"
    ? "Aquí tienes lo que está pasando en tu tienda hoy."
    : view === "settings" ? "Personaliza la información y preferencias de tu tienda."
      : view === "catalog" ? "Explora los productos de tu tienda."
      : dataConfig[view].description;
  document.querySelector("#dateRange").closest(".date-select").hidden = view === "catalog" || view === "settings";
  document.querySelector("#addButton").hidden = view !== "dashboard" && view !== "products";
  if (view === "catalog" && !elements.catalogFrame.hasAttribute("src")) {
    elements.catalogFrame.src = "producto2.html";
  }
  if (dataConfig[view]) {
    dataQuery = "";
    elements.dataSearch.value = "";
    dataPage = 1;
    renderDataView();
  }
  animatePanels(view === "dashboard" ? elements.dashboardView : view === "settings" ? elements.settingsView : view === "catalog" ? elements.catalogView : elements.dataView);
  elements.sidebar.classList.remove("mobile-open");
  document.body.classList.remove("mobile-nav-open");
  document.querySelector("#mobileMenu").setAttribute("aria-expanded", "false");
  document.querySelector("#mobileBackdrop").hidden = true;
}

function changeOrderSearch(query) {
  orderQuery = query;
  orderPage = 1;
  document.querySelectorAll(".table-filter").forEach((input) => {
    if (input.closest("#dashboardView")) input.value = query;
  });
  renderOrders();
}

function togglePopover(button, popover) {
  const opening = popover.hidden;
  document.querySelectorAll(".popover").forEach((item) => { item.hidden = true; });
  document.querySelectorAll(".popover-wrap > button").forEach((item) => item.setAttribute("aria-expanded", "false"));
  popover.hidden = !opening;
  button.setAttribute("aria-expanded", String(opening));
}

function openProductModal() {
  elements.productForm.reset();
  activeFormStep = 0;
  updateFormStep();
  elements.productModal.hidden = false;
  document.querySelector("#productForm [name='name']").focus();
}

function closeProductModal() {
  elements.productModal.hidden = true;
}

function updateFormStep() {
  document.querySelectorAll(".form-step").forEach((step, index) => {
    const isActive = index === activeFormStep;
    step.hidden = !isActive;
    step.classList.toggle("is-active", isActive);
  });
  document.querySelectorAll(".step-tab").forEach((tab, index) => {
    const isActive = index === activeFormStep;
    tab.classList.toggle("is-active", isActive);
    tab.classList.toggle("is-complete", index < activeFormStep);
    tab.setAttribute("aria-selected", String(isActive));
  });
  document.querySelector("#nextStep").hidden = activeFormStep === 1;
  document.querySelector("#saveProduct").hidden = activeFormStep === 0;
}

function focusFirstInvalid(step) {
  const invalid = [...step.querySelectorAll("input, select, textarea")].find((field) => !field.checkValidity());
  if (invalid) {
    invalid.reportValidity();
    invalid.focus();
    return false;
  }
  return true;
}

document.querySelectorAll("[data-view]").forEach((control) => control.addEventListener("click", () => setView(control.dataset.view)));
const collapseSidebarButton = document.querySelector("#collapseSidebar");
function setSidebarCollapsed(collapsed) {
  document.body.classList.toggle("sidebar-collapsed", collapsed);
  const label = collapsed ? "Expandir menú" : "Contraer menú";
  collapseSidebarButton.setAttribute("aria-label", label);
  collapseSidebarButton.setAttribute("title", label);
  collapseSidebarButton.setAttribute("aria-expanded", String(!collapsed));
}
try {
  setSidebarCollapsed(localStorage.getItem("glass-dashboard-sidebar-collapsed") === "true");
} catch (error) {
  showToast("No se pudo cargar la preferencia del menú lateral.", "error");
}
collapseSidebarButton.addEventListener("click", () => {
  const collapsed = !document.body.classList.contains("sidebar-collapsed");
  setSidebarCollapsed(collapsed);
  try {
    localStorage.setItem("glass-dashboard-sidebar-collapsed", String(collapsed));
  } catch (error) {
    showToast("No se pudo guardar la preferencia del menú lateral.", "error");
  }
});
document.querySelector("#mobileMenu").addEventListener("click", (event) => {
  const isOpen = document.body.classList.toggle("mobile-nav-open");
  event.currentTarget.setAttribute("aria-expanded", String(isOpen));
  document.querySelector("#mobileBackdrop").hidden = !isOpen;
});
document.querySelector("#mobileBackdrop").addEventListener("click", () => {
  document.body.classList.remove("mobile-nav-open");
  document.querySelector("#mobileMenu").setAttribute("aria-expanded", "false");
  document.querySelector("#mobileBackdrop").hidden = true;
});
document.querySelector("#themeToggle").addEventListener("click", (event) => {
  const root = document.documentElement;
  const theme = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = theme;
  try {
    localStorage.setItem("glass-dashboard-theme", theme);
  } catch (error) {
    showToast("No se pudo guardar la preferencia de tema.", "error");
  }
  event.currentTarget.setAttribute("aria-label", `Cambiar a modo ${theme === "dark" ? "claro" : "oscuro"}`);
});
document.querySelector("#notificationButton").addEventListener("click", (event) => togglePopover(event.currentTarget, document.querySelector("#notificationPopover")));
document.querySelector("#profileButton").addEventListener("click", (event) => togglePopover(event.currentTarget, document.querySelector("#profilePopover")));
document.querySelector("#markRead").addEventListener("click", () => {
  document.querySelector(".notification-dot").hidden = true;
  document.querySelector("#notificationButton").setAttribute("aria-label", "Notificaciones");
  document.querySelector("#notificationPopover .unread-label").textContent = "Todo al día";
  showToast("Notificaciones marcadas como leídas.");
});
document.querySelector("#signOut").addEventListener("click", () => {
  document.querySelector("#profilePopover").hidden = true;
  document.querySelector("#profileButton").setAttribute("aria-expanded", "false");
  showToast("Esta demostración no tiene una sesión conectada.", "error");
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".popover-wrap")) {
    document.querySelectorAll(".popover").forEach((popover) => { popover.hidden = true; });
    document.querySelectorAll(".popover-wrap > button").forEach((button) => button.setAttribute("aria-expanded", "false"));
  }
});
document.querySelectorAll(".table-filter").forEach((input) => input.addEventListener("input", (event) => changeOrderSearch(event.currentTarget.value)));
elements.globalSearch.addEventListener("input", (event) => {
  const query = event.currentTarget.value;
  if (activeView === "dashboard" || activeView === "orders") {
    changeOrderSearch(query);
    if (activeView === "orders") {
      dataQuery = query;
      elements.dataSearch.value = query;
      renderDataView();
    }
  } else if (dataConfig[activeView]) {
    dataQuery = query;
    elements.dataSearch.value = query;
    renderDataView();
  }
});
elements.dataSearch.addEventListener("input", (event) => {
  dataQuery = event.currentTarget.value;
  dataPage = 1;
  renderDataView();
});
document.querySelectorAll(".sort-button").forEach((button) => button.addEventListener("click", () => {
  const key = button.dataset.sort;
  orderSort = { key, direction: orderSort.key === key && orderSort.direction === "asc" ? "desc" : "asc" };
  renderOrders();
}));
document.querySelector("#filterButton").addEventListener("click", () => {
  changeOrderSearch(elements.globalSearch.value ? "" : "Pendiente");
  elements.globalSearch.value = orderQuery;
  showToast(orderQuery ? "Mostrando pedidos pendientes." : "Se quitaron los filtros.");
});
document.querySelector("#dateRange").addEventListener("change", (event) => {
  const values = {
    today: ["$24,580.00", "48", "3.24%"],
    week: ["$86,420.00", "176", "3.08%"],
    month: ["$312,890.00", "684", "3.31%"]
  };
  const [sales, orders, conversion] = values[event.currentTarget.value];
  document.querySelector("#salesValue").textContent = sales;
  document.querySelector("#chartTotal").textContent = sales;
  document.querySelector("#ordersValue").textContent = orders;
  document.querySelector("#conversionValue").textContent = conversion;
  animateDateChange();
});
document.querySelector("#chartRange").addEventListener("change", (event) => {
  animateDateChange();
  showToast(`Gráfico actualizado: ${event.currentTarget.value.toLocaleLowerCase("es")}.`);
});
document.querySelector("#addButton").addEventListener("click", openProductModal);
document.querySelector("#dataAddButton").addEventListener("click", openProductModal);
document.querySelector("#closeModal").addEventListener("click", closeProductModal);
document.querySelector("#cancelProduct").addEventListener("click", closeProductModal);
elements.productModal.addEventListener("click", (event) => {
  if (event.target === elements.productModal) closeProductModal();
});
document.querySelector("#nextStep").addEventListener("click", () => {
  const currentStep = document.querySelector(`.form-step[data-form-step="${activeFormStep}"]`);
  if (focusFirstInvalid(currentStep)) {
    activeFormStep = 1;
    updateFormStep();
    document.querySelector("#productForm [name='price']").focus();
  }
});
document.querySelectorAll(".step-tab").forEach((tab) => tab.addEventListener("click", () => {
  const targetStep = Number(tab.dataset.step);
  if (targetStep > activeFormStep) {
    const currentStep = document.querySelector(`.form-step[data-form-step="${activeFormStep}"]`);
    if (!focusFirstInvalid(currentStep)) return;
  }
  activeFormStep = targetStep;
  updateFormStep();
}));
elements.productForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!elements.productForm.reportValidity()) return;
  elements.blockingLoader.hidden = false;
  window.setTimeout(() => {
    const form = new FormData(elements.productForm);
    const name = String(form.get("name")).trim();
    const sku = String(form.get("sku")).trim() || `TG-NUE-${String(catalogData.length + 1).padStart(3, "0")}`;
    catalogData.unshift({
      name, category: String(form.get("category")), sku,
      stock: Number(form.get("stock")), price: Number(form.get("price")),
      status: Number(form.get("stock")) > 0 ? "Activo" : "Agotado"
    });
    elements.blockingLoader.hidden = true;
    closeProductModal();
    if (activeView !== "products") setView("products");
    else renderDataView();
    showToast(`Producto “${name}” añadido al inventario.`);
  }, 700);
});
document.querySelector("#settingsForm").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!event.currentTarget.reportValidity()) return;
  elements.blockingLoader.hidden = false;
  window.setTimeout(() => {
    elements.blockingLoader.hidden = true;
    showToast("Los ajustes se guardaron correctamente.");
  }, 450);
});
document.addEventListener("click", (event) => {
  const deleteOrder = event.target.closest("[data-delete-order]");
  const deleteProduct = event.target.closest("[data-delete-product]");
  if (deleteOrder) {
    const index = orderData.findIndex((order) => order.id === deleteOrder.dataset.deleteOrder);
    if (index !== -1 && window.confirm("¿Eliminar este pedido de la lista de demostración?")) {
      orderData.splice(index, 1);
      renderOrders();
      if (activeView === "orders") renderDataView();
      showToast("El pedido se eliminó.");
    }
  }
  if (deleteProduct && window.confirm("¿Eliminar este producto del inventario de demostración?")) {
    const index = catalogData.findIndex((product) => product.sku === deleteProduct.dataset.deleteProduct);
    if (index !== -1) {
      catalogData.splice(index, 1);
      renderDataView();
      showToast("El producto se eliminó.");
    }
  }
});
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    elements.globalSearch.focus();
  }
  if (event.key === "Escape") {
    closeProductModal();
    document.querySelectorAll(".popover").forEach((popover) => { popover.hidden = true; });
    document.body.classList.remove("mobile-nav-open");
    document.querySelector("#mobileMenu").setAttribute("aria-expanded", "false");
    document.querySelector("#mobileBackdrop").hidden = true;
  }
});
document.querySelector("#dateRange").value = "today";
try {
  const savedTheme = localStorage.getItem("glass-dashboard-theme");
  if (savedTheme === "dark" || savedTheme === "light") document.documentElement.dataset.theme = savedTheme;
} catch (error) {
  showToast("No se pudo cargar la preferencia de tema.", "error");
}
document.querySelector("#themeToggle").setAttribute("aria-label", `Cambiar a modo ${document.documentElement.dataset.theme === "dark" ? "claro" : "oscuro"}`);
renderOrders();
animatePanels(elements.dashboardView);
