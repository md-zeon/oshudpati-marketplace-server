import { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client";

function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let success = false;
  let statusCode = 500;
  let message = "Internal Server Error";
  let errorDetails: any = null;

  if (err instanceof Error) {
    message = err.message;
    errorDetails = {
      name: err.name,
      cause: err.cause,
    };
  }

  // Handle PrismaClientValidationError
  // Handle PrismaClientKnownRequestError
  // Handle PrismaClientUnknownRequestError
  // Handle PrismaClientRustPanicError
  // Handle PrismaClientInitializationError

  res.status(statusCode).json({ success, message, errorDetails });
}

export default errorHandler;
