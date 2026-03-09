import { ReactNode } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';

interface RouterWrapperProps {
  children: ReactNode;
}

function RouterContextChecker({ children }: RouterWrapperProps) {
  try {
    // Try to access router context - this will throw if not inside a router
    useLocation();
    // If we get here, we're already inside a router context
    return <>{children}</>;
  } catch {
    // Not inside router context, so wrap with BrowserRouter
    return <BrowserRouter>{children}</BrowserRouter>;
  }
}

export function RouterWrapper({ children }: RouterWrapperProps) {
  return <RouterContextChecker>{children}</RouterContextChecker>;
}