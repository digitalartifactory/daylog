import { cleanup, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Page from './page';

vi.mock('./partials/LoginForm', () => ({
  default: vi.fn(() => <div>LoginForm</div>),
}));

describe('Login Page', () => {
  beforeEach(() => {
    cleanup();
  });

  it('should render LoginForm', () => {
    render(Page());
    expect(screen.getByText('LoginForm')).toBeInTheDocument();
  });
});
