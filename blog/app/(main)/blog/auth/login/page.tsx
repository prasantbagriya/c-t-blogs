import LoginForm from './LoginForm';

export const revalidate = 3600; // Static for 1 hour

export default function AuthLoginPage() {
  return (
    <div className="auth-fullscreen-container animate-fade-in">
      <div className="auth-glow-1" />
      <div className="auth-glow-2" />
      <LoginForm />
    </div>
  );
}

