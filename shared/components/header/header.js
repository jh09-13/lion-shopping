import { authService } from "../../services/auth.service.js";

export function initHeader(container) {
  const userLabel = container.querySelector("[data-header-user]");
  const logoutButton = container.querySelector("[data-header-logout]");
  const loginLink = container.querySelector("[data-header-login]");

  const currentUser = authService.getCurrentUser();

  if (currentUser) {
    userLabel.textContent = `${currentUser.name}님`;
    logoutButton.hidden = false;
    loginLink.hidden = true;
  } else {
    userLabel.textContent = "";
    logoutButton.hidden = true;
    loginLink.hidden = false;
  }

  logoutButton.addEventListener("click", () => {
    authService.logout();
    window.location.reload();
  });
}
