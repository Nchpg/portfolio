"use client";

import React from "react";

type Props = { children: React.ReactNode; fallback?: React.ReactNode };
type State = { hasError: boolean };

class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}

export default ErrorBoundary;
