import { z } from "zod";

export const createPaymentSessionSchema = z.object({
  merchant: z.object({
    name: z.string().min(1),
    legalName: z.string().min(1),
    country: z.string().length(2),
    defaultCurrency: z.string().length(3).toUpperCase(),
  }),

  merchantAccount: z.object({
    accountCode: z.string().min(1),
    country: z.string().length(2),
    currency: z.string().length(3).toUpperCase(),
    status: z.string().min(1),
  }),

  payment: z.object({
    merchantReference: z.string().min(1),
    amount: z.coerce.number().positive(),
    currency: z.string().length(3).toUpperCase(),
  }),
});


export const paymentMethodSchema = z.object({
  params: z.object({
    sessionId: z.string().min(1, "Session ID is required"),
  }),

  body: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),

    cardNumber: z
      .string()
      .regex(/^\d{16}$/, "Card number must contain 16 digits"),

    expMonth: z.coerce.number().int().min(1).max(12),

    expYear: z.coerce
      .number()
      .int()
      .min(new Date().getFullYear(), "Card has expired"),

    cvv: z
      .string()
      .regex(/^\d{3,4}$/, "CVV must contain 3 or 4 digits"),
  }),
});