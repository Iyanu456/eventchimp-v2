import path from "path";
import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "EventChimp API",
      version: "1.0.0",
      description: "Premium event experience platform API for EventChimp."
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api`
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        ApiResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: { type: "object" }
          }
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            role: { type: "string", enum: ["attendee", "organizer", "admin"] },
            avatar: { type: "string", nullable: true },
            provider: { type: "string", enum: ["local", "google"] }
          }
        },
        Event: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            slug: { type: "string" },
            category: { type: "string" },
            description: { type: "string" },
            coverImage: { type: "string" },
            location: { type: "string" },
            startDate: { type: "string", format: "date-time" },
            endDate: { type: "string", format: "date-time" },
            capacity: { type: "number" },
            ticketPrice: { type: "number" },
            isFree: { type: "boolean" },
            status: {
              type: "string",
              enum: ["draft", "published", "sold_out", "cancelled"]
            },
            attendeesCount: { type: "number" },
            tags: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: [path.join(__dirname, "../routes/*.ts")]
});
