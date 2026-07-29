import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { forgotPassword } from "@/services/auth.service";
import { toast } from "sonner";
import { Button } from "@/shared/ui/Button";
import { AuthField } from "@/shared/ui/AuthField";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    const { error } = await forgotPassword(email);
    setIsLoading(false);

    if (error) {
      toast.error(error);
    } else {
      toast.success("Reset link generated for testing.");
      // For demo purposes, we redirect directly to reset-password with email in query
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-gray-900">Forgot Password</h1>
          <p className="mt-2 text-sm text-gray-500">Enter your email to receive a reset link.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AuthField
            label="Email Address"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
          />

          <Button type="submit" className="w-full" isLoading={isLoading} disabled={!email}>
            Send Reset Link
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-600">
          Remember your password?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
