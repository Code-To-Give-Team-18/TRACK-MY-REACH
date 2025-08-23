'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

const signupSchema = z.object({
 name: z.string().min(2, 'Name must be at least 2 characters'),
 email: z.string().email('Invalid email address'),
 password: z.string().min(8, 'Password must be at least 8 characters'),
 confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
 message: "Passwords don't match",
 path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
 const router = useRouter();
 const { signUp, isLoading, error, clearError } = useAuthStore();
 const [showPassword, setShowPassword] = useState(false);
 const [showConfirmPassword, setShowConfirmPassword] = useState(false);

 const {
 register,
 handleSubmit,
 formState: { errors },
 } = useForm<SignupFormData>({
 resolver: zodResolver(signupSchema),
 });

 const onSubmit = async (data: SignupFormData) => {
 try {
 await signUp({
 name: data.name,
 email: data.email,
 password: data.password,
 });
 router.push('/dashboard');
 } catch (error) {
 // Error is handled in the store
 }
 };

 return (
 <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
 <div className="max-w-md w-full space-y-8">
 <div>
 <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 ">
 Create your account
 </h2>
 <p className="mt-2 text-center text-sm text-gray-600 ">
 Or{' '}
 <Link
 href="/login"
 className="font-medium text-indigo-600 hover:text-indigo-500 "
 >
 sign in to your existing account
 </Link>
 </p>
 </div>
 <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
 {error && (
 <div className="rounded-md bg-red-50 p-4">
 <div className="text-sm text-red-800 ">
 {error}
 </div>
 </div>
 )}
 <div className="space-y-4">
 <div>
 <label htmlFor="name" className="block text-sm font-medium text-gray-700 ">
 Full Name
 </label>
 <input
 {...register('name')}
 id="name"
 type="text"
 autoComplete="name"
 className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm "
 placeholder="John Doe"
 onChange={() => clearError()}
 />
 {errors.name && (
 <p className="mt-1 text-sm text-red-600 ">
 {errors.name.message}
 </p>
 )}
 </div>
 <div>
 <label htmlFor="email" className="block text-sm font-medium text-gray-700 ">
 Email Address
 </label>
 <input
 {...register('email')}
 id="email"
 type="email"
 autoComplete="email"
 className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm "
 placeholder="john@example.com"
 onChange={() => clearError()}
 />
 {errors.email && (
 <p className="mt-1 text-sm text-red-600 ">
 {errors.email.message}
 </p>
 )}
 </div>
 <div>
 <label htmlFor="password" className="block text-sm font-medium text-gray-700 ">
 Password
 </label>
 <div className="mt-1 relative">
 <input
 {...register('password')}
 id="password"
 type={showPassword ? 'text' : 'password'}
 autoComplete="new-password"
 className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm "
 placeholder="••••••••"
 onChange={() => clearError()}
 />
 <button
 type="button"
 className="absolute inset-y-0 right-0 pr-3 flex items-center"
 onClick={() => setShowPassword(!showPassword)}
 >
 {showPassword ? (
 <EyeOff className="h-4 w-4 text-gray-400" />
 ) : (
 <Eye className="h-4 w-4 text-gray-400" />
 )}
 </button>
 </div>
 {errors.password && (
 <p className="mt-1 text-sm text-red-600 ">
 {errors.password.message}
 </p>
 )}
 </div>
 <div>
 <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 ">
 Confirm Password
 </label>
 <div className="mt-1 relative">
 <input
 {...register('confirmPassword')}
 id="confirmPassword"
 type={showConfirmPassword ? 'text' : 'password'}
 autoComplete="new-password"
 className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm "
 placeholder="••••••••"
 />
 <button
 type="button"
 className="absolute inset-y-0 right-0 pr-3 flex items-center"
 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
 >
 {showConfirmPassword ? (
 <EyeOff className="h-4 w-4 text-gray-400" />
 ) : (
 <Eye className="h-4 w-4 text-gray-400" />
 )}
 </button>
 </div>
 {errors.confirmPassword && (
 <p className="mt-1 text-sm text-red-600 ">
 {errors.confirmPassword.message}
 </p>
 )}
 </div>
 </div>

 <div className="flex items-center">
 <input
 id="agree-terms"
 name="agree-terms"
 type="checkbox"
 className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded "
 required
 />
 <label
 htmlFor="agree-terms"
 className="ml-2 block text-sm text-gray-900 "
 >
 I agree to the{' '}
 <Link href="/terms" className="text-indigo-600 hover:text-indigo-500 ">
 Terms and Conditions
 </Link>
 </label>
 </div>

 <div>
 <Button
 type="submit"
 disabled={isLoading}
 className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {isLoading ? 'Creating account...' : 'Sign up'}
 </Button>
 </div>
 </form>
 </div>
 </div>
 );
}