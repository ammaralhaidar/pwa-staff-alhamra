import { z } from "zod";

export const permissionFormSchema = z.object({
  studentId: z.number().int().positive(),
  reason: z.string().min(3),
  dateStart: z.string().min(1),
  dateEnd: z.string().min(1),
});

export const violationFormSchema = z.object({
  studentId: z.number().int().positive(),
  violationId: z.number().int().positive(),
  note: z.string().optional(),
  date: z.string().min(1),
});

export const mutabaahFormSchema = z.object({
  studentId: z.number().int().positive(),
  sessionId: z.number().int().positive(),
  activities: z.array(z.object({ id: z.number().int().positive(), checked: z.boolean(), note: z.string().optional() })),
});

export const quranAssessmentSchema = z.object({
  studentId: z.number().int().positive(),
  absenId: z.number().int().positive(),
  surahId: z.number().int().positive(),
  startAyah: z.number().int().positive(),
  endAyah: z.number().int().positive(),
  score: z.string().min(1),
});
