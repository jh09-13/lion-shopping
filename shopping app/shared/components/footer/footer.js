export function initFooter(container) {
  container.querySelector("[data-footer-year]").textContent = new Date().getFullYear();
}
