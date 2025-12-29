import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Page from './page';

vi.mock('./partials/InitRegisterForm', () => ({
  default: vi.fn(() => <div>InitRegisterForm</div>),
}));

describe('Page', () => {
  it('should render InitRegisterForm', () => {
    render(Page());

    expect(screen.getByText('InitRegisterForm')).toBeDefined();
  });
});
