import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

describe('ErrorBoundary Component', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('should render children when there is no error', () => {
    const TestComponent = () => <div>Test Content</div>;

    render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render error UI when child component throws', () => {
    const ThrowError = () => {
      throw new Error('Test error message');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('should display error message', () => {
    const ThrowError = () => {
      throw new Error('Specific error occurred');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/specific error occurred/i)).toBeInTheDocument();
  });

  it('should have retry button', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('should have go home button', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const homeButton = screen.getByRole('link', { name: /go home/i });
    expect(homeButton).toBeInTheDocument();
    expect(homeButton).toHaveAttribute('href', '/');
  });

  it('should reset error when retry is clicked', () => {
    let shouldThrow = true;
    const ConditionalError = () => {
      if (shouldThrow) {
        throw new Error('Conditional error');
      }
      return <div>Success!</div>;
    };

    const { rerender } = render(
      <ErrorBoundary>
        <ConditionalError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

    shouldThrow = false;
    const retryButton = screen.getByRole('button', { name: /try again/i });
    retryButton.click();

    rerender(
      <ErrorBoundary>
        <ConditionalError />
      </ErrorBoundary>
    );

    // After retry, component should attempt to render again
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
  });
});
