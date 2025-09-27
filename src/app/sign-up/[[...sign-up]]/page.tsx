import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Mobile4U Business System
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your account to get started
          </p>
        </div>
        <SignUp />
      </div>
    </div>
  );
}
