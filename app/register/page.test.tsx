import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Page from './page';

vi.mock('./partials/RegisterForm', () => ({
  default: vi.fn(() => <div>RegisterForm</div>),
}));

describe('Page', () => {
  it('renders RegisterForm', () => {
    render(Page());
    expect(screen.getByText('RegisterForm')).toBeDefined();
  });
});
