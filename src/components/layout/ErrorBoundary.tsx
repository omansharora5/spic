import { Component, type ErrorInfo, type ReactNode } from "react";
import { buttonStyles } from "@/components/ui/kit";

interface State {
  error: Error | null;
}

/** Keeps a failing view from taking down the whole application shell. */
export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[SPIC] Unhandled UI error:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="shell flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
        <p className="eyebrow">Something went wrong</p>
        <h1 className="mt-3 font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-[-0.035em] text-ink">
          This view could not be rendered
        </h1>
        <p className="mt-3 max-w-md text-[14.5px] text-muted">{this.state.error.message}</p>
        <div className="mt-8 flex gap-3">
          <button type="button" onClick={() => this.setState({ error: null })} className={buttonStyles("primary", "md")}>
            Try again
          </button>
          <a href="/" className={buttonStyles("outline", "md")}>
            Back home
          </a>
        </div>
      </div>
    );
  }
}
