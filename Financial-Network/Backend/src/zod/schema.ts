import { z } from "zod"

export const financialNetworkSchema = z.object({

    payment: z.object({
        amount: z.coerce.number().positive(),
        currency: z.string().length(3).toUpperCase(),
        paymentId: z.string().uuid()
    }),

    card: z.object({
        cardNumber: z.string().min(1),
        expMonth: z.number().int().min(1).max(12),
        expYear: z.number().int().positive(),
        cvv: z.string().length(3),
    }),

})


export const verifyCardSchema = z.object({
  cardNumber: z
    .string()
    .regex(/^\d{13,19}$/, "Card number must contain between 13 and 19 digits"),

  expMonth: z.coerce
    .number()
    .int("Expiration month must be an integer")
    .min(1, "Expiration month must be between 1 and 12")
    .max(12, "Expiration month must be between 1 and 12"),

  expYear: z.coerce
    .number()
    .int("Expiration year must be an integer")
    .min(new Date().getFullYear(), "Card has expired"),

  cvv: z
    .string()
    .regex(/^\d{3,4}$/, "CVV must contain 3 or 4 digits"),

  baseUrl: z.string().url("Invalid base URL"),
});


export const depositWithdrawSchema = z.object({
  amount: z.coerce
    .number()
    .positive("Amount must be greater than 0")
    .finite("Amount must be a finite number"),

  description: z
    .string()
    .trim()
    .min(1, "Description is required"),

  token: z
    .string()
    .min(1, "Card token is required"),

  merchantReference: z
    .string()
    .min(1, "Merchant reference (account number) is required"),

  paymentId: z
    .string()
    .min(1, "Payment ID is required"),
});


export const withdrawSchema = z.object({
    amount: z.coerce
        .number()
        .positive("Amount must be greater than 0")
        .finite("Amount must be a valid number"),

    sourceCardNumber: z
        .string()
        .regex(/^\d{16}$/, "Card number must contain exactly 16 digits"),

    targetCardNumber: z
        .string()
        .regex(/^\d{16}$/, "Card number must contain exactly 16 digits"),    

    description: z
        .string()
        .trim()
        .min(1, "Description is required"),
    
    paymentId: z.string().min(1, "Payment ID is required"),
});


export const networkPaymentSchema = z.object({
  paymentId: z.string().min(1, "Payment ID is required"),
});
