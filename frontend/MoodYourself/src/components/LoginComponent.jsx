import React from 'react';

/**
 * LoginComponent
 *
 * A minimal, calm login and landing screen for "Mood Yourself".
 * Triggers the parent-provided `onLogin` callback when continuing with Google.
 */
function LoginComponent({ onLogin }) {
  const handleGoogleClick = () => {
    if (typeof onLogin === 'function') {
      onLogin();
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center flex flex-col items-center">
        
        {/* Brand & Reflection Icon */}
        <header className="flex items-center gap-2 mb-6" aria-label="Mood Yourself Brand">
          <div 
            className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white"
            aria-hidden="true"
          >
            {/* Minimal daily reflection symbol */}
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="8" opacity="0.4" />
              <path d="M12 4a8 8 0 0 1 8 8" />
              <circle cx="12" cy="12" r="2.5" fill="currentColor" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-wide text-violet-950 uppercase">
            Mood Yourself
          </span>
        </header>

        {/* Narrative */}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
          Take a moment for yourself.
        </h1>
        <p className="text-sm leading-relaxed text-slate-500 mb-6">
          Capture one small reflection about how you feel each day.
        </p>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleGoogleClick}
          aria-label="Continue with Google"
          className="w-full h-11 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium text-sm flex items-center justify-center gap-3 transition-colors hover:bg-slate-50 active:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
        >
          {/* Google 'G' Mark */}
          <svg
            className="w-4 h-4 shrink-0"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27a7.17 7.17 0 0 1 0-4.54V6.58H1.25a11.96 11.96 0 0 0 0 10.84l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Privacy Note */}
        <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-4">
          <svg
            className="w-3.5 h-3.5 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>Your daily reflections stay private to your account.</span>
        </p>

      </div>
    </main>
  );
}

export default LoginComponent;