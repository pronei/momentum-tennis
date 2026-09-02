import { z } from 'zod';

export const loginSchema = z.object({
	email: z.email('Enter a full email address'),
	password: z.string().min(8, 'At least 8 characters')
});

export const signupSchema = z.object({
	fullName: z.string().trim().min(1, 'Enter your name').max(120),
	email: z.email('Enter a full email address'),
	password: z.string().min(8, 'At least 8 characters').max(200)
});
