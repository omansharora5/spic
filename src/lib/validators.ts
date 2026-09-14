import { z } from "zod";

/**
 * Registration field rules.
 *
 * Any valid email is accepted (temporary/disposable addresses are blocked).
 */

export const COLLEGE_EMAIL_DOMAIN = "rkgit.edu.in";

/** 10 digits, Indian mobile prefix (6-9). */
export const PHONE_REGEX = /^[6-9]\d{9}$/;

/** Institute roll numbers: 6–15 alphanumeric characters (e.g. 110CS2425, 2400330120134). */
export const ROLL_REGEX = /^[A-Za-z0-9]{6,15}$/;

// ponytail: short denylist covers common temp-mail abuse, swap for a full disposable-domain list/API if abuse grows.
const TEMP_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "yopmail.com",
  "temp-mail.org",
  "throwaway.email",
  "getnada.com",
  "trashmail.com",
  "fakeinbox.com",
]);

export const collegeEmail = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address")
  .refine((value) => value.includes(".") && (value.split("@")[1]?.includes(".") ?? false), {
    message: "Enter a valid email address",
  })
  .refine((value) => !TEMP_EMAIL_DOMAINS.has(value.split("@")[1]?.toLowerCase() ?? ""), {
    message: "Temporary email addresses are not allowed",
  });

export const phone = z
  .string()
  .min(1, "Phone number is required")
  .regex(PHONE_REGEX, "Enter a valid 10-digit mobile number");

export const rollNumber = z
  .string()
  .min(1, "Roll number is required")
  .regex(ROLL_REGEX, "Enter a valid roll number (6–15 letters/digits)");

export const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year"] as const;
export const BRANCH_OPTIONS = [
  "CSE",
  "IT",
  "ECE",
  "EEE",
  "ME",
  "CE",
  "AI/ML",
  "DS",
  "IOT",
  "CS",
  "Others",
] as const;

/** Shared member schema for team registrations. */
export const teamMemberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: collegeEmail,
  rollNumber,
  year: z.string().min(1, "Select your year"),
  branch: z.string().min(1, "Select your branch"),
  phone,
});

export type TeamMemberValues = z.infer<typeof teamMemberSchema>;

/** Strips spaces/dashes from a phone input as the user types. */
export function normalisePhone(value: string): string {
  return value.replace(/[\s\-()]/g, "").slice(0, 10);
}
