import { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client";
import { ZodError } from "zod";

function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let success = false;
  let statusCode = 500;
  let message = "Internal Server Error";
  let errors: any = null;

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((issue) => ({
      path: issue.path[issue.path.length - 1],
      message: issue.message,
    }));

    statusCode = 400;
    message = "Validation Error";
    errors = formattedErrors;
  }

  // Handle PrismaClientKnownRequestError
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;
    switch (err.code) {
      case "P2002":
        statusCode = 409;
        message = (
          err.meta?.driverAdapterError as
            | { cause?: { constraint?: { fields?: string[] } } }
            | undefined
        )?.cause?.constraint?.fields
          ? `Unique constraint failed on the field(s): ${(err.meta?.driverAdapterError as { cause?: { constraint?: { fields?: string[] } } } | undefined)!.cause!.constraint!.fields!.join(", ")}.`
          : "Unique constraint failed.";
        errors = err.meta?.driverAdapterError
          ? [err.meta?.driverAdapterError]
          : null;
        break;

      case "P2021":
        statusCode = 404;
        message = `The table ${err.meta?.modelName} does not exist in the current database.`;
        errors = err.meta?.driverAdapterError
          ? [err.meta?.driverAdapterError]
          : null;
        break;

      case "P2025":
        statusCode = 404;
        message = err.meta?.modelName
          ? `${err.meta.modelName} not found.`
          : "Record not found.";
        errors = [err.meta];
        break;

      default:
        message = `Prisma Error: ${err.code}`;
        errors = err.meta ? [err.meta] : null;
        break;
    }
  }

  // Handle Node.js built-in errors and other generic errors
  else if (err instanceof Error) {
    message = err.message;
    errors = [
      {
        name: err.name,
        cause: err.cause,
      },
    ];
  }

  // Handle PrismaClientValidationError
  // Handle PrismaClientUnknownRequestError
  // Handle PrismaClientRustPanicError
  // Handle PrismaClientInitializationError

  res.status(statusCode).json({ success, message, errors });
}

export default errorHandler;
