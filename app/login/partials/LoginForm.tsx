'use client';

import FormField from '@/components/FormField';
import Image from 'next/image';
import { useActionState, useEffect, useState } from 'react';
import { signin } from '../lib/actions';
import { validateAllowRegistration } from '@/app/register/lib/actions';

export default function LoginForm() {
  const [state, action, pending] = useActionState(signin, undefined);
  const [isRegAllowed, setIsRegAllowed] = useState(false);

  useEffect(() => {
    // Resolves Bootstrap modal issue when redirects to login from a modal.
    const modal = document.getElementsByClassName('modal-backdrop');
    if (modal.length > 0) modal[0].remove();
    validateAllowRegistration().then((allowReg) => {
      setIsRegAllowed(allowReg);
    });
  }, []);

  return (
    <div className="page page-center">
      <div className="container container-tight py-4">
        <div className="text-center mb-4">
          <a href="." className="navbar-brand navbar-brand-autodark">
            <Image
              src="/daylog.svg"
              width="0"
              height="0"
              alt="daylog"
              priority={true}
              className="navbar-brand-image"
              style={{ width: 'auto', height: '48px' }}
            />
          </a>
        </div>
        {state?.message && (
          <div
            className="d-flex flex-column alert alert-danger alert-dismissible"
            role="alert"
          >
            <h3>Could not login</h3>
            <p>{state.message}</p>
            <a
              className="btn-close"
              data-bs-dismiss="alert"
              aria-label="close"
            ></a>
          </div>
        )}
        <div className="card card-md">
          <div className="card-body">
            <h2 className="h2 text-center mb-4">Login to your account</h2>
            <form action={action} autoComplete="off" noValidate={true}>
              <FormField
                label="Email address"
                name="email"
                type="email"
                placeholder="your@email.com"
                defaultValue={state?.data?.email?.toString()}
                errors={state?.errors?.email}
                autoComplete="off"
              />
              <FormField
                label="Password"
                name="password"
                type="password"
                placeholder="Your password"
                defaultValue={state?.data?.password?.toString()}
                errors={state?.errors?.password}
                autoComplete="off"
              />
              <div className="form-footer">
                <button
                  disabled={pending}
                  type="submit"
                  className={`btn btn-primary w-100 ${
                    pending ? 'btn-loading disabled' : null
                  }`}
                >
                  Sign in
                </button>
                <div className="text-center text-muted mt-3">
                  <a href="/login/reset" tabIndex={-1}>
                    Forgot password?
                  </a>
                </div>
              </div>
            </form>
          </div>
        </div>
        {isRegAllowed && (
          <div className="text-center text-secondary mt-3">
            Don&apos;t have account yet?{' '}
            <a href="./register" tabIndex={-1}>
              Sign up
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
