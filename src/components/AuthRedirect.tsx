import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Spinner } from "./lms";

export function AuthRedirect({ to }: { to: "/" | "/login" | "/password" }) {
  const navigate = useNavigate();
  // Router updates can re-render the auth guard while its destination is loading.
  useEffect(() => {
    void navigate({ to, replace: true });
  }, [navigate, to]);
  return <Spinner label="화면 이동 중" />;
}
