import type { FallbackProps } from "react-error-boundary";
import { Button } from "./ui/button";

function fallbackRender({ error, resetErrorBoundary }: FallbackProps) {
  // Call resetErrorBoundary() to reset the error boundary and retry the render.

  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: "red" }}>{error.message}</pre>
      <Button onClick={resetErrorBoundary}>Retry</Button>
    </div>
  );
}

export default fallbackRender;
