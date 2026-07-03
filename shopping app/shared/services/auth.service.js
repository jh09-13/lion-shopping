import { userService } from "./data.service.js";

const SESSION_KEY = "shop:session";

// 프로토타입 전용: 비밀번호를 평문으로 localStorage에 저장한다. 백엔드 연동 시 반드시 교체할 것.
export const authService = {
  login(email, password) {
    const user = userService
      .getAll()
      .find((candidate) => candidate.email === email && candidate.password === password);
    if (!user) {
      throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id, role: user.role }));
    return user;
  },

  signup({ email, password, name, role = "consumer" }) {
    const alreadyExists = userService.getAll().some((user) => user.email === email);
    if (alreadyExists) {
      throw new Error("이미 가입된 이메일입니다.");
    }
    return userService.create({ email, password, name, role });
  },

  logout() {
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser() {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    return userService.getById(session.userId);
  },
};
