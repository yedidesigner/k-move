import type { ComponentType } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Route as LoginRoute } from "@/routes/login";
import { Route as PasswordRoute } from "@/routes/_app/password";

const auth = vi.hoisted(() => ({
  status: "signedOut",
  user: { user_metadata: { username: "테스트 수강생" } },
  signIn: vi.fn(),
  changePassword: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({ useAuth: () => auth }));
const Login = LoginRoute.options.component as ComponentType;
const Password = PasswordRoute.options.component as ComponentType;

beforeEach(() => {
  auth.status = "signedOut";
  auth.signIn.mockReset().mockResolvedValue(undefined);
  auth.changePassword.mockReset().mockResolvedValue(undefined);
});
afterEach(cleanup);

function fillPassword(current: string, next: string, confirm = next) {
  fireEvent.change(screen.getByLabelText("현재 비밀번호"), { target: { value: current } });
  fireEvent.change(screen.getByLabelText("새 비밀번호", { exact: true }), { target: { value: next } });
  fireEvent.change(screen.getByLabelText("새 비밀번호 확인"), { target: { value: confirm } });
}

describe("Provisioned name login", () => {
  it("offers only name login without signup, a public roster, or the initial password", () => {
    const { container } = render(<Login />);
    expect(screen.getByLabelText("로그인 이름")).toHaveAttribute("autocomplete", "username");
    expect(screen.getByLabelText("비밀번호")).toHaveAttribute("autocomplete", "current-password");
    expect(screen.getByRole("button", { name: "로그인" })).toBeDisabled();
    expect(screen.queryByText("회원가입")).not.toBeInTheDocument();
    expect(container.querySelector("datalist")).toBeNull();
    expect(container.textContent).not.toContain("1111");
    expect(screen.getByText(/메뉴의 ‘비밀번호 변경’/)).toBeVisible();
  });

  it("passes a legacy English login through and prevents repeated submission while busy", async () => {
    let finish!: () => void;
    auth.signIn.mockReturnValue(new Promise<void>(resolve => { finish = resolve; }));
    render(<Login />);
    fireEvent.change(screen.getByLabelText("로그인 이름"), { target: { value: "tomset" } });
    fireEvent.change(screen.getByLabelText("비밀번호"), { target: { value: "2479" } });
    fireEvent.click(screen.getByRole("button", { name: "로그인" }));
    expect(auth.signIn).toHaveBeenCalledWith("tomset", "2479");
    expect(screen.getByRole("button", { name: "로그인 중…" })).toBeDisabled();
    expect(screen.getByLabelText("로그인 이름")).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "로그인 중…" }));
    expect(auth.signIn).toHaveBeenCalledTimes(1);
    finish();
    await waitFor(() => expect(screen.getByRole("button", { name: "로그인" })).toBeEnabled());
  });

  it("shows the same error for an unknown name or incorrect password", async () => {
    auth.signIn.mockRejectedValue({ code: "invalid_credentials" });
    render(<Login />);
    fireEvent.change(screen.getByLabelText("로그인 이름"), { target: { value: "테스트 수강생" } });
    fireEvent.change(screen.getByLabelText("비밀번호"), { target: { value: "2479" } });
    fireEvent.click(screen.getByRole("button", { name: "로그인" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("이름 또는 비밀번호가 올바르지 않습니다.");
  });
});

describe("Self-service password change", () => {
  it("rejects confirmation mismatch without calling the authentication service", () => {
    render(<Password />);
    fillPassword("1111", "2479", "2480");
    fireEvent.click(screen.getByRole("button", { name: "비밀번호 변경" }));
    expect(screen.getByRole("alert")).toHaveTextContent("새 비밀번호와 확인란이 일치하지 않습니다.");
    expect(auth.changePassword).not.toHaveBeenCalled();
  });

  it("rejects the unchanged password before making a request", () => {
    render(<Password />);
    fillPassword("1111", "1111");
    fireEvent.click(screen.getByRole("button", { name: "비밀번호 변경" }));
    expect(screen.getByRole("alert")).toHaveTextContent("현재 비밀번호와 다른 비밀번호를 선택해 주세요.");
    expect(auth.changePassword).not.toHaveBeenCalled();
  });

  it("explains an incorrect current password without showing success", async () => {
    auth.changePassword.mockRejectedValue(new Error("auth/current-password-incorrect"));
    render(<Password />);
    fillPassword("1111", "2479");
    fireEvent.click(screen.getByRole("button", { name: "비밀번호 변경" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("현재 비밀번호가 일치하지 않습니다.");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("changes the password and clears every password input on success", async () => {
    render(<Password />);
    fillPassword("1111", "2479");
    fireEvent.click(screen.getByRole("button", { name: "비밀번호 변경" }));
    await screen.findByRole("status");
    expect(auth.changePassword).toHaveBeenCalledWith("1111", "2479");
    for (const name of ["현재 비밀번호", "새 비밀번호", "새 비밀번호 확인"]) {
      expect(screen.getByLabelText(name, { exact: true })).toHaveValue("");
    }
    expect(screen.getByRole("status")).toHaveTextContent("다음 로그인부터 새 비밀번호를 사용하세요.");
  });
});
