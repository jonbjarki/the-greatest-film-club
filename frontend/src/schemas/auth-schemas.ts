import z from "zod";

export const passwordSchema = z
    .string()
    .min(6, { error: "Password must be at least 6 characters long." })
    .max(128, { error: "Password must be at most 128 characters long." })
    // Check for at least one uppercase letter
    .refine((val) => /[A-Z]/.test(val), {
        message: "Password must contain at least one uppercase letter.",
    })
    // Check for at least one lowercase letter
    .refine((val) => /[a-z]/.test(val), {
        message: "Password must contain at least one lowercase letter.",
    })
    // Check for at least one number
    .refine((val) => /[0-9]/.test(val), {
        message: "Password must contain at least one number.",
    })


export const credentialsSchema = z.object({
    username: z.string().min(4, { error: "Username must be at least 4 characters long" }).max(20, { error: "Username must be at most 20 characters long" }),
    password: passwordSchema
})

export const loginResponseSchema = z.object({
    user: z.object({
        id: z.string(),
        username: z.string(),
        email: z.string().optional(),
    }),
    access_token: z.string(),
    token_type: z.string(),
    expires_in: z.number()
});

export type Credentials = z.infer<typeof credentialsSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;