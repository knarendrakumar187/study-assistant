import { Component } from "react";

// Last line of defense: if anything in the tree throws during render, show a
// recoverable message instead of a white screen. Error boundaries must be
// class components — React has no hook equivalent for componentDidCatch.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Render error caught by boundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app">
          <div className="state-panel state-error" role="alert">
            <p>Something went wrong while rendering. Refresh the page and try again.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => this.setState({ hasError: false })}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
