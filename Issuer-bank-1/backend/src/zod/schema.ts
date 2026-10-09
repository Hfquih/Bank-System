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


export const updateSchema = z
  .object({
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
      )
      .optional(),

    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: 'passwords do not match',
      path: ['confirmPassword'],
    }
  );


export const moneyOperationSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),

  accountNumber: z
    .string()
    .min(1, "Account number is required"),

  description: z
    .string()
    .optional(),
});


export const createCardSchema = z.object({
  cardType: z.enum(["DEBIT", "CREDIT"]),
  cardBrand: z.enum(["VISA", "MASTERCARD"])
})


export const financialNetworkSchema = z.object({
  payment: z.object({
    paymentId: z.number(),
    amount: z.coerce.number().positive(),
    currency: z.string().length(3),
    merchantReference: z.string().min(1),
  }),

  card: z.object({
    cardNumber: z.string().min(1),
    expMonth: z.number().int().min(1).max(12),
    expYear: z.number().int(),
    cvv: z.string().length(3),
  }),
})


export const withdrawSchema = z.object({
    amount: z.coerce
        .number()
        .positive("Amount must be greater than 0")
        .finite("Amount must be a valid number"),

    cardNumber: z
        .string()
        .regex(/^\d{16}$/, "Card number must contain exactly 16 digits"),

    description: z
        .string()
        .trim()
        .min(1, "Description is required"),
});