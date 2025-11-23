import express, { Router } from "express";
import serverless from "serverless-http";
import { registerRoutes } from "../../server/routes";

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Create a router to hold our routes
const router = Router();

// Lazy initialization of the handler
let handlerPromise: Promise<any>;

async function init() {
    // Register routes on the router
    // We cast router to any because registerRoutes expects an Express app, 
    // but Router is compatible for route definitions.
    // We pass true to skip creating the HTTP server.
    await registerRoutes(router as any, true);

    // Mount the router at the Netlify function path
    // This ensures that requests to /.netlify/functions/api/ocr match /api/ocr in the router
    app.use("/.netlify/functions", router);

    return serverless(app);
}

export const handler = async (event: any, context: any) => {
    if (!handlerPromise) {
        handlerPromise = init();
    }
    const handler = await handlerPromise;
    return handler(event, context);
};
