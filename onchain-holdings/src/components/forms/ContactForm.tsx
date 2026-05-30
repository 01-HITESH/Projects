"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { submitContact } from "@/app/actions/contact";
import { contactSchema, type ContactInput } from "@/lib/validations";

export function ContactForm() {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { inquiryType: "general" },
  });

  async function onSubmit(values: ContactInput) {
    setServerError("");
    const result = await submitContact(values);
    if (result.success) {
      setSuccess(true);
      return;
    }
    setServerError(result.error);
  }

  const fieldClass = "mt-2 min-h-12 w-full border border-border bg-bg px-4 text-light outline-none transition focus:border-accent";

  return (
    <div className="border border-border bg-surface p-6 md:p-8">
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div key="success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid min-h-[30rem] place-items-center text-center">
            <div>
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-accent text-accent">
                <Check className="h-8 w-8" />
              </div>
              <h2 className="display mt-8 text-4xl text-accent">Message received.</h2>
              <p className="mt-4 text-text-secondary">The right person will respond after reviewing your note.</p>
            </div>
          </motion.div>
        ) : (
          <motion.form key="form" exit={{ opacity: 0, y: -20 }} onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
            <div>
              <label htmlFor="name" className="text-sm uppercase tracking-[0.14em] text-light">Name</label>
              <input id="name" className={fieldClass} {...register("name")} aria-describedby="name-error" />
              {errors.name ? <p id="name-error" className="mt-2 text-sm text-light">{errors.name.message}</p> : null}
            </div>
            <div>
              <label htmlFor="email" className="text-sm uppercase tracking-[0.14em] text-light">Email</label>
              <input id="email" type="email" className={fieldClass} {...register("email")} aria-describedby="email-error" />
              {errors.email ? <p id="email-error" className="mt-2 text-sm text-light">{errors.email.message}</p> : null}
            </div>
            <div>
              <label htmlFor="company" className="text-sm uppercase tracking-[0.14em] text-light">Company</label>
              <input id="company" className={fieldClass} {...register("company")} />
            </div>
            <div>
              <label htmlFor="inquiryType" className="text-sm uppercase tracking-[0.14em] text-light">Inquiry Type</label>
              <select id="inquiryType" className={fieldClass} {...register("inquiryType")}>
                <option value="investor">Investor</option>
                <option value="partnership">Partnership</option>
                <option value="press">Press</option>
                <option value="general">General</option>
              </select>
            </div>
            <div>
              <label htmlFor="message" className="text-sm uppercase tracking-[0.14em] text-light">Message</label>
              <textarea id="message" rows={6} className={`${fieldClass} py-3`} {...register("message")} aria-describedby="message-error" />
              {errors.message ? <p id="message-error" className="mt-2 text-sm text-light">{errors.message.message}</p> : null}
            </div>
            {serverError ? <p className="text-sm text-light">{serverError}</p> : null}
            <button className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-accent bg-accent px-6 text-sm uppercase tracking-[0.12em] text-bg transition hover:bg-light disabled:opacity-60" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Submit Inquiry
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
