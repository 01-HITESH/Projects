import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Enter at least 2 characters."),
  email: z.string().email("Enter a valid email."),
  company: z.string().optional(),
  inquiryType: z.enum(["investor", "partnership", "press", "general"]),
  message: z.string().min(20, "Message must be at least 20 characters."),
});

export type ContactInput = z.infer<typeof contactSchema>;
