// src/test/renderWithQuery.tsx
import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function renderWithQuery(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false }, // no retries in unit tests
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
}
