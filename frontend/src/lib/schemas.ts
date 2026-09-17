import z from "zod";

export const passwordSchema = z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." })

export const credentialsSchema = z.object({
    username: z.string().min(4),
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