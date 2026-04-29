// app/login/page.js
// Login page - renders the auth form in login mode

import AuthForm from '@/components/AuthForm';

export const metadata = {
  title: 'Login - Anime Music Quiz',
  description: 'Sign in to your account',
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}