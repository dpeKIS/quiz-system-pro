import { eq } from "drizzle-orm";
import { InsertAttempt, InsertSession, attempts, questions, sessions, quizzes } from "../drizzle/schema";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Quiz queries
export async function getQuizzes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quizzes);
}

export async function getQuizById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(quizzes).where(eq(quizzes.id, id)).limit(1);
  return result[0];
}

// Question queries
export async function getQuestionsByQuizId(quizId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(questions).where(eq(questions.quizId, quizId));
}

export async function getQuestionByQrCode(qrCode: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(questions).where(eq(questions.qrCode, qrCode)).limit(1);
  return result[0];
}

// Session queries
export async function createSession(data: InsertSession) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(sessions).values(data);
  return result;
}

export async function getSessionByUserQrCode(userQrCode: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(sessions).where(eq(sessions.userQrCode, userQrCode)).limit(1);
  return result[0];
}

export async function getSessionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
  return result[0];
}

// Attempt queries
export async function recordAttempt(data: InsertAttempt) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(attempts).values(data);
  return result;
}

export async function getSessionAttempts(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(attempts).where(eq(attempts.sessionId, sessionId));
}

// Statistics
export async function getSessionStats(sessionId: number) {
  const db = await getDb();
  if (!db) return null;
  const sessionAttempts = await db.select().from(attempts).where(eq(attempts.sessionId, sessionId));
  const totalQuestions = sessionAttempts.length;
  const correctAnswers = sessionAttempts.filter(a => a.isCorrect).length;
  const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  return { totalQuestions, correctAnswers, score };
}

export async function getQuizRankings(quizId: number) {
  const db = await getDb();
  if (!db) return [];
  // Get all completed sessions for this quiz
  const quizSessions = await db.select().from(sessions).where(eq(sessions.quizId, quizId));
  
  const rankings = [];
  for (const session of quizSessions) {
    const stats = await getSessionStats(session.id);
    if (stats) {
      rankings.push({
        sessionId: session.id,
        userName: session.userName,
        score: stats.score,
        correctAnswers: stats.correctAnswers,
        totalQuestions: stats.totalQuestions,
        completedAt: session.completedAt,
      });
    }
  }
  
  return rankings.sort((a, b) => b.score - a.score);
}
