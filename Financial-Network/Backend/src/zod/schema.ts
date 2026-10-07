import { z } from "zod"

export const financialNetworkSchema = z.object({

    payment: z.object({
        paymentId: z.number().int().positive(),
        amount: z.coerce.number().positive(),
        currency: z.string().length(3).toUpperCase(),
        merchantReference: z.string().min(1),
    }),

    merchant: z.object({
        merchantAccountId: z.number().int().positive(),
        accountCode: z.string().min(1),
        country: z.string().length(2).toUpperCase(),
    }),

    card: z.object({
        cardNumber: z.string().min(1),
        expMonth: z.number().int().min(1).max(12),
        expYear: z.number().int().positive(),
        cvv: z.string().length(3),
    }),

})