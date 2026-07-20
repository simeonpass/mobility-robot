import {z} from 'zod';

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name'),
  email: z.string().trim().email('Please enter a valid email'),
  phone: z.string().trim().min(7, 'Please enter a valid phone number'),
  topic: z.enum([
    'Product advice',
    'Order or delivery',
    'VAT relief',
    'Warranty or parts',
    'Demo booking',
    'Trade or stockist',
    'Something else',
  ]),
  orderRef: z.string().trim().optional(),
  message: z.string().trim().min(10, 'Please enter a message (at least 10 characters)'),
});

export const warrantyRegisterSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name'),
  email: z.string().trim().email('Please enter a valid email'),
  orderRef: z.string().trim().min(3, 'Please enter your order reference'),
  serial: z.string().trim().min(3, 'Please enter the serial number'),
  purchaseDate: z.string().trim().min(1, 'Please enter the purchase date'),
});

export const demoRequestSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name'),
  email: z.string().trim().email('Please enter a valid email'),
  phone: z.string().trim().min(7, 'Please enter a valid phone number'),
  postcode: z.string().trim().min(3, 'Please enter your postcode'),
  model: z.enum(['M4', 'M4 Pro', 'M4B', 'EzGo2', 'X12', 'X12 Pro']),
  preferredDate: z.string().trim().optional(),
  preferredTime: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const quoteRequestSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name'),
  email: z.string().trim().email('Please enter a valid email'),
  phone: z.string().trim().min(7, 'Please enter a valid phone number'),
  company: z.string().trim().optional(),
  model: z.enum(['M4', 'M4 Pro', 'M4B', 'EzGo2', 'X12', 'X12 Pro', 'Multiple / Unsure']),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
  vatReliefEligible: z.enum(['yes', 'no']),
  notes: z.string().trim().optional(),
});

export const vatReliefRegistrationSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name'),
  email: z.string().trim().email('Please enter a valid email'),
  address: z.string().trim().min(10, 'Please enter your full address'),
  condition: z
    .string()
    .trim()
    .min(3, 'Please briefly describe your condition'),
  declaration: z.enum(['yes'], {
    message:
      'You must confirm you are eligible for HMRC VAT relief on mobility aids',
  }),
});

export const RETURN_REASONS = [
  'Changed my mind',
  'Not suitable / fit',
  'Damaged in transit',
  'Faulty or defective',
  'Other',
] as const;

export const returnRequestSchema = z.object({
  orderRef: z.string().trim().min(3, 'Order reference is required'),
  reason: z.enum(RETURN_REASONS, {
    message: 'Please select a reason for return',
  }),
  details: z
    .string()
    .trim()
    .min(10, 'Please provide a few more details (at least 10 characters)'),
  unusedConfirmation: z.enum(['yes'], {
    message:
      'You must confirm the product is unused and in resalable condition',
  }),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
export type ReturnRequestValues = z.infer<typeof returnRequestSchema>;
export type WarrantyRegisterValues = z.infer<typeof warrantyRegisterSchema>;
export type DemoRequestValues = z.infer<typeof demoRequestSchema>;
export type QuoteRequestValues = z.infer<typeof quoteRequestSchema>;
export type VatReliefRegistrationValues = z.infer<
  typeof vatReliefRegistrationSchema
>;

export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
}
