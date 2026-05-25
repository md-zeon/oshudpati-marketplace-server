import { Request, Response } from "express";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
    description: `The route ${req.originalUrl} does not exist on this server.`,
    path: req.originalUrl,
    date: new Date().toDateString(),
  });
}
