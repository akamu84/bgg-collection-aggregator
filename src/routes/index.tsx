import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

const searchSchema = z.object({
  users: z.string().optional(),
});

export const Route = createFileRoute('/')({
  validateSearch: searchSchema,
});
