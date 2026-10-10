import { z } from 'zod';

const secureLinkOrEmpty = z.string().trim().superRefine((value, context) => {
  if (value === '') return;
  try {
    if (new URL(value).protocol !== 'https:') {
      context.addIssue({ code: 'custom', message: 'Links must start with https://.' });
    }
  } catch {
    context.addIssue({ code: 'custom', message: 'Enter a valid link, such as https://example.com.' });
  }
});

// Validate only fields being edited; incomplete or legacy contact information
// must not block an unrelated bio, photo or social-link update.
export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name using at least 2 characters.').max(100, 'Your name must be at most 100 characters.').optional(),
  bio: z.string().trim().max(1_000, 'Your bio must be at most 1,000 characters.').optional(),
  phone: z.string().trim().regex(
    /^([+]63\s?9|09)\d{2}\s?\d{3}\s?\d{4}$/,
    'Enter a valid Philippine mobile number, such as 0917 123 4567 or +63 917 123 4567.',
  ).optional(),
  location: z.string().trim().min(1, 'Enter your general city or municipality and barangay.').max(100, 'Your profile area must be at most 100 characters.').optional(),
  avatarUrl: secureLinkOrEmpty.optional(),
  facebookUrl: secureLinkOrEmpty.optional(),
  instagramUrl: secureLinkOrEmpty.optional(),
  websiteUrl: secureLinkOrEmpty.optional(),
}).strict();
