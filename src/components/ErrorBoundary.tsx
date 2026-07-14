"use client";
import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: { componentStack?: string | null }) {
    console.error("Aviram crashed:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
          textAlign: "center",
          fontFamily: "var(--font-sans, system-ui, sans-serif)",
        }}
      >
        <p style={{ fontSize: 16, fontWeight: 500 }}>Something went wrong.</p>
        <p style={{ fontSize: 14, color: "#888", maxWidth: 380 }}>
          Refresh the page or go back to dashboard.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => window.location.reload()}
          >
            Refresh page
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => { window.location.href = "/dashboard"; }}
          >
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }
}
