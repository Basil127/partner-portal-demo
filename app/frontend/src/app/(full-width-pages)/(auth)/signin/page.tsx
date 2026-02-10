import SignInForm from '@/components/auth/SignInForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'SignIn Page | B2B Partner Portal',
	description: 'This is the Signin Page for B2B Partner Portal',
};

export default function SignIn() {
	return <SignInForm />;
}
