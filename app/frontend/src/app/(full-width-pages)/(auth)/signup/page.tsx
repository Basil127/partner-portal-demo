import SignUpForm from '@/components/auth/SignUpForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'SignUp Page | B2B Partner Portal',
	description: 'This is SignUp Page B2B Partner Portal',
	// other metadata
};

export default function SignUp() {
	return <SignUpForm />;
}
