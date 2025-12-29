import { prismaMock } from '@/prisma/singleton';
import { revalidatePath } from 'next/cache';
import { describe, expect, it, vi } from 'vitest';
import { signupInit, validateAdminUserExists } from './actions';
import { InitFormState } from './definitions';
import { User } from '@/prisma/generated/client';

const mocks = vi.hoisted(() => ({
  redirect: vi.fn(),
  revalidatePath: vi.fn(),
  hashPassword: vi.fn().mockReturnValue('hashedPassword'),
}));

vi.mock('next/cache', () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock('@/utils/crypto', () => ({
  hashPassword: mocks.hashPassword,
}));

const admin = {
  role: 'admin',
  id: 1,
  name: null,
  email: '',
  password: '',
  secret: null,
  mfa: false,
  terms: '',
  sortBoardsBy: 'created_desc',
  sortNotesBy: 'created_desc',
} as User;

describe('validateAdminUserExists', () => {
  it('should return true if admin user exists', async () => {
    prismaMock.user.findFirst.mockResolvedValueOnce(admin);

    const result = await validateAdminUserExists();

    expect(result).toBe(true);
  });

  it('should return false if admin user not exists', async () => {
    prismaMock.user.findFirst.mockResolvedValueOnce(null);

    const result = await validateAdminUserExists();

    expect(result).toBe(false);
  });
});

describe('signupInit', () => {
  const securePassword = 'SecurePassword123#';
  it('should return errors if form data is invalid', async () => {
    const formData = new FormData();
    formData.append('name', '');
    formData.append('email', 'invalid-email');
    formData.append('password', 'short');

    const state = {} as InitFormState;

    const result = await signupInit(state, formData);

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('should return message if user already exists', async () => {
    const formData = new FormData();
    formData.append('name', 'Admin');
    formData.append('email', 'admin@example.com');
    formData.append('password', securePassword);

    const state = {} as InitFormState;

    prismaMock.user.findUnique.mockResolvedValueOnce(admin);

    const result = await signupInit(state, formData);

    expect(result.success).toBe(false);
    expect(result.message).toBe('User already exists.');
  });

  it('should create a new admin user if valid data is provided', async () => {
    const formData = new FormData();
    formData.append('name', 'Admin');
    formData.append('email', 'admin@example.com');
    formData.append('password', securePassword);

    const state = {} as InitFormState;

    prismaMock.user.findUnique.mockResolvedValueOnce(null);

    const result = await signupInit(state, formData);

    expect(result.success).toBe(true);
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        name: 'Admin',
        email: 'admin@example.com',
        password: 'hashedPassword',
        terms: 'accept',
        role: 'admin',
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
  });

  it('should return an error message if an exception occurs', async () => {
    const formData = new FormData();
    formData.append('name', 'Admin');
    formData.append('email', 'admin@example.com');
    formData.append('password', securePassword);

    const state = {} as InitFormState;

    prismaMock.user.findUnique.mockRejectedValueOnce(
      new Error('Database error')
    );

    const result = await signupInit(state, formData);

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'An error occurred while creating your admin account.'
    );
  });
});
