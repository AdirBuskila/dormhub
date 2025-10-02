import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Mobile For You Customer Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your customer dashboard and place orders
          </p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-sm normal-case',
              socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50',
              socialButtonsBlockButtonText: 'text-gray-700 font-medium',
            }
          }}
        />
      </div>
    </div>
  );
}
