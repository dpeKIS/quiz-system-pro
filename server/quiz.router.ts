import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getQuizzes,
  getQuizById,
  getQuestionsByQuizId,
  getQuestionByQrCode,
  createSession,
  getSessionByUserQrCode,
  getSessionById,
  recordAttempt,
  getSessionAttempts,
  getSessionStats,
  getQuizRankings,
} from "./db";
import { nanoid } from "nanoid";

// Validation schemas
const CreateQuizSchema = z.object({
  title: z.string().min(1, "Quiz title is required"),
  description: z.string().optional(),
});

const CreateQuestionSchema = z.object({
  quizId: z.number(),
  qrCode: z.string().min(1, "QR code is required"),
  questionText: z.string().min(1, "Question is required"),
  optionA: z.string().min(1, "Option A is required"),
  optionB: z.string().min(1, "Option B is required"),
  optionC: z.string().min(1, "Option C is required"),
  optionD: z.string().min(1, "Option D is required"),
  correctAnswer: z.enum(["A", "B", "C", "D"]),
});

const StartSessionSchema = z.object({
  quizId: z.number(),
  userQrCode: z.string().min(1, "User QR code is required"),
  userName: z.string().min(1, "User name is required"),
});

const SubmitAnswerSchema = z.object({
  userQrCode: z.string().min(1, "User QR code is required"),
  cardQrCode: z.string().min(1, "Card QR code is required"),
  answer: z.enum(["A", "B", "C", "D"]),
  timestamp: z.number().optional(),
});

export const quizRouter = router({
  // Quiz management
  listQuizzes: publicProcedure.query(async () => {
    return getQuizzes();
  }),

  getQuiz: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const quiz = await getQuizById(input.id);
    if (!quiz) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Quiz not found" });
    }
    return quiz;
  }),

  createQuiz: protectedProcedure
    .input(CreateQuizSchema)
    .mutation(async ({ input, ctx }) => {
      const db = await import("./db").then(m => m.getDb());
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      }

      const { quizzes } = await import("../drizzle/schema");
      await db.insert(quizzes).values({
        title: input.title,
        description: input.description,
        createdBy: ctx.user.id,
      });

      return { ...input };
    }),

  // Question management
  getQuestions: publicProcedure
    .input(z.object({ quizId: z.number() }))
    .query(async ({ input }) => {
      return getQuestionsByQuizId(input.quizId);
    }),

  createQuestion: protectedProcedure
    .input(CreateQuestionSchema)
    .mutation(async ({ input }) => {
      const db = await import("./db").then(m => m.getDb());
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      }

      const { questions } = await import("../drizzle/schema");
      await db.insert(questions).values({
        quizId: input.quizId,
        qrCode: input.qrCode,
        questionText: input.questionText,
        optionA: input.optionA,
        optionB: input.optionB,
        optionC: input.optionC,
        optionD: input.optionD,
        correctAnswer: input.correctAnswer,
      });

      return { ...input };
    }),

  // Session management
  startSession: publicProcedure
    .input(StartSessionSchema)
    .mutation(async ({ input }) => {
      // Check if user already has active session
      const existingSession = await getSessionByUserQrCode(input.userQrCode);
      if (existingSession && existingSession.status === "active") {
        return {
          status: "error",
          code: "SESSION_ALREADY_ACTIVE",
          message: "User already has an active session",
          action: "RESET_USER",
        };
      }

      // Verify quiz exists
      const quiz = await getQuizById(input.quizId);
      if (!quiz) {
        return {
          status: "error",
          code: "QUIZ_NOT_FOUND",
          message: "Quiz not found",
          action: "RETRY_ALL",
        };
      }

      const sessionCode = nanoid(12);
      const result = await createSession({
        quizId: input.quizId,
        sessionCode,
        userQrCode: input.userQrCode,
        userName: input.userName,
        status: "active",
      });

      return {
        status: "success",
        code: "SESSION_STARTED",
        message: "Session started successfully",
        action: "SCAN_CARD",
        data: { sessionCode },
      };
    }),

  // Answer submission (main ESP endpoint)
  submitAnswer: publicProcedure
    .input(SubmitAnswerSchema)
    .mutation(async ({ input }) => {
      const startTime = Date.now();

      // Validate user session
      const session = await getSessionByUserQrCode(input.userQrCode);
      if (!session) {
        return {
          status: "error",
          code: "USER_NOT_FOUND",
          message: "User session not found",
          action: "RESET_USER",
          device_message: "Użytkownik nie znaleziony",
        };
      }

      if (session.status !== "active") {
        return {
          status: "error",
          code: "SESSION_INACTIVE",
          message: "Session is not active",
          action: "RESET_USER",
          device_message: "Sesja nie jest aktywna",
        };
      }

      // Validate question
      const question = await getQuestionByQrCode(input.cardQrCode);
      if (!question) {
        return {
          status: "error",
          code: "CARD_NOT_FOUND",
          message: "Question card not found",
          action: "RETRY_CARD",
          device_message: "Karta nie znaleziona",
        };
      }

      // Validate answer format
      if (!["A", "B", "C", "D"].includes(input.answer)) {
        return {
          status: "error",
          code: "INVALID_ANSWER",
          message: "Invalid answer format",
          action: "RETRY_ANSWER",
          device_message: "Niepoprawna odpowiedź",
        };
      }

      // Check if already answered
      const attempts = await getSessionAttempts(session.id);
      const alreadyAnswered = attempts.some(a => a.questionId === question.id);

      if (alreadyAnswered) {
        return {
          status: "error",
          code: "ALREADY_ANSWERED",
          message: "This question was already answered",
          action: "RESET_USER",
          device_message: "Ta karta była już rozwiązana",
        };
      }

      // Record attempt
      const isCorrect = input.answer === question.correctAnswer ? 1 : 0;
      const responseTime = Date.now() - startTime;

      await recordAttempt({
        sessionId: session.id,
        questionId: question.id,
        givenAnswer: input.answer,
        isCorrect,
        attemptNumber: 1,
        responseTime,
      });

      return {
        status: "success",
        code: "ANSWER_SAVED",
        message: "Answer recorded successfully",
        action: "SHOW_RESULT",
        device_message: isCorrect ? "Poprawna!" : "Błędna!",
        data: {
          correct: isCorrect === 1,
          correct_answer: question.correctAnswer,
        },
      };
    }),

  // Statistics
  getSessionStats: publicProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input }) => {
      const stats = await getSessionStats(input.sessionId);
      if (!stats) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Session not found" });
      }
      return stats;
    }),

  getQuizRankings: publicProcedure
    .input(z.object({ quizId: z.number() }))
    .query(async ({ input }) => {
      return getQuizRankings(input.quizId);
    }),

  // Session details
  getSession: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const session = await getSessionById(input.id);
      if (!session) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Session not found" });
      }
      return session;
    }),

  getSessionAttempts: publicProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input }) => {
      return getSessionAttempts(input.sessionId);
    }),
});
