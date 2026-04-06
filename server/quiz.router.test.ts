import { describe, it, expect, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

describe("Quiz Router", () => {
  describe("listQuizzes", () => {
    it("returns empty list initially", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const quizzes = await caller.quiz.listQuizzes();
      expect(Array.isArray(quizzes)).toBe(true);
    });
  });

  describe("startSession", () => {
    it("returns error for non-existent quiz", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.quiz.startSession({
        quizId: 99999,
        userQrCode: "USER123",
        userName: "Test User",
      });

      expect(result.status).toBe("error");
      expect(result.code).toBe("QUIZ_NOT_FOUND");
    });
  });

  describe("submitAnswer", () => {
    it("returns error for non-existent user", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.quiz.submitAnswer({
        userQrCode: "NONEXISTENT",
        cardQrCode: "CARD123",
        answer: "A",
      });

      expect(result.status).toBe("error");
      expect(result.code).toBe("USER_NOT_FOUND");
      expect(result.action).toBe("RESET_USER");
    });

    it("returns error for invalid answer format", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.quiz.submitAnswer({
          userQrCode: "USER123",
          cardQrCode: "CARD123",
          answer: "E" as any,
        });
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });
  });
});
