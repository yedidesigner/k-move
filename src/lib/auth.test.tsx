import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ profile: vi.fn(), signIn: vi.fn(), signUp: vi.fn() }));
vi.mock("./supabase", () => ({
  isSupabaseConfigured: () => true,
  getSupabase: () => ({
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: mocks.profile }) }) }),
    auth: {
      getSession: async () => ({
        data: { session: { user: { id: "teacher", user_metadata: { username: "강사" } } } },
        error: null,
      }),
      onAuthStateChange: () => ({
        data: { listener: null, subscription: { unsubscribe: vi.fn() } },
      }),
      signInWithPassword: mocks.signIn,
      signUp: mocks.signUp,
    },
  }),
}));
import { AuthProvider, useAuth } from "./auth";
function Probe() {
  const { status } = useAuth();
  return <span>{status}</span>;
}
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
it("waits for the server role before choosing the instructor destination", async () => {
  let resolve!: (v: unknown) => void;
  mocks.profile.mockImplementation(
    () =>
      new Promise((r) => {
        resolve = r;
      }),
  );
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );
  expect(screen.getByText("loading")).toBeInTheDocument();
  await waitFor(() => expect(mocks.profile).toHaveBeenCalled());
  expect(screen.queryByText("student")).not.toBeInTheDocument();
  resolve({ data: { role: "instructor" }, error: null });
  await screen.findByText("instructor");
});
it("does not grant a default role when the profile lookup fails", async () => {
  mocks.profile.mockResolvedValue({ data: null, error: { message: "denied" } });
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );
  await screen.findByText("error");
  expect(screen.queryByText("student")).not.toBeInTheDocument();
});
