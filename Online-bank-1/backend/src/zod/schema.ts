import {z} from "zod";

export const registerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(3, 'min length for first name is 3')
    .max(15, 'max length for first name is 15'),

  lastName: z
    .string()
    .trim()
    .min(3, 'min length for last name is 3')
    .max(15, 'max length for last name is 15'),

  phone: z
    .string()
    .trim()
    .regex(
      /^(?:\+212|0)[5-7][0-9]{8}$/,
      'please provide a valid phone number'
    ),

  email: z
    .email('please provide a valid email')
    .trim(),

  password: z
    .string()
    .min(8, 'password must be at least 8 characters')
    .regex(/[A-Z]/, 'password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'password must contain at least one number')
    .regex(
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
      'password must contain at least one special character'
    ),

  confirmPassword: z.string(),

  role: z
    .enum(['user']).optional(),
  
})
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });


export const loginSchema = z.object({
  email: z.email('please provide a valid email'),
  password: z.string().min(1, 'please provide a password'),
});


export const updateSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(3, 'min length for first name is 3')
    .max(15, 'max length for first name is 15'),

  lastName: z
    .string()
    .trim()
    .min(3, 'min length for last name is 3')
    .max(15, 'max length for last name is 15'),

  phone: z
    .string()
    .trim()
    .regex(
      /^(?:\+212|0)[5-7][0-9]{8}$/,
      'please provide a valid phone number'
    ),

  email: z
    .email('please provide a valid email')
    .trim(),

  password: z
    .string()
    .min(8, 'password must be at least 8 characters')
    .regex(/[A-Z]/, 'password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'password must contain at least one number')
    .regex(
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
      'password must contain at least one special character'
    ).optional(),

  confirmPassword: z.string().optional() 
})


export const moneyOperationSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),

  accountNumber: z
    .string()
    .min(1, "Account number is required"),

  description: z
    .string()
    .optional(),
});


export const createRefundRequestSchema = z.object({
    transactionId: z.coerce.number().int().positive(),
    reason: z.string().trim().min(1, "Reason is required")
});



export const createAPIKeySchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must not exceed 50 characters"),
});


export const createPaymentSessionSchema = z.object({
  body: z.object({
    amount: z.coerce.number().positive("Amount must be greater than 0"),

    currency: z
      .string()
      .length(3, "Currency must be a 3-letter code")
      .toUpperCase(),

    orderReference: z
      .string()
      .min(1, "Order reference is required"),
  }),

  headers: z.object({
    "x-api-key": z.string().min(1, "API key is required"),
    "x-api-secret": z.string().min(1, "API secret is required"),
  }),
});