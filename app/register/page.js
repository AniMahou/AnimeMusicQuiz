import AuthForm from '@/components/AuthForm';

export const metadata = {
  title: 'Register - Anime Music Quiz',
  description: 'Create a new account',
};

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}