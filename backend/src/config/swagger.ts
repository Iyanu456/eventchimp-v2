import path from "path";
import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env";

const projectRoot = path.resolve(__dirname, "../..");

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
    tags: [
      { name: "Health", description: "Service status endpoints" },
      { name: "Auth", description: "Authentication and session endpoints" },
      { name: "Events", description: "Public and organizer event endpoints" },
      { name: "Event Operations", description: "Event collaborators, scanning, metrics, and settings" },
      { name: "Payments", description: "Canonical payment APIs" },
      { name: "Checkout", description: "Compatibility checkout APIs" },
      { name: "Tickets", description: "Ticket ownership, guest list, and check-in endpoints" },
      { name: "Dashboard", description: "Organizer dashboard data" },
      { name: "Organizer", description: "Organizer payout and account settings endpoints" },
      { name: "Refunds", description: "Refund initiation endpoints" },
      { name: "Branding Kit", description: "Branding template and asset metadata endpoints" },
      { name: "Admin", description: "Administrative operations and review endpoints" }
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
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Something went wrong" },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  path: { type: "string", example: "email" },
                  message: { type: "string", example: "Invalid email address" }
                }
              }
            }
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
        },
        AuthRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "organizer@eventchimp.com" },
            password: { type: "string", format: "password", example: "password123" }
          }
        },
        RegisterRequest: {
          allOf: [
            { $ref: "#/components/schemas/AuthRequest" },
            {
              type: "object",
              required: ["name"],
              properties: {
                name: { type: "string", example: "Whitney Stone" },
                role: {
                  type: "string",
                  enum: ["attendee", "organizer", "admin"],
                  default: "organizer"
                }
              }
            }
          ]
        },
        GoogleCallbackRequest: {
          type: "object",
          required: ["code"],
          properties: {
            code: { type: "string", example: "4/0AbCdEf..." }
          }
        },
        TicketTierInput: {
          type: "object",
          required: ["id", "name", "price", "quantity", "order"],
          properties: {
            id: { type: "string", example: "vip-tier" },
            name: { type: "string", example: "VIP" },
            price: { type: "number", example: 10000 },
            quantity: { type: "number", example: 50 },
            order: { type: "number", example: 0 },
            perks: {
              type: "array",
              items: { type: "string" },
              example: ["Priority entry", "Front-row seating"]
            }
          }
        },
        EventGuestInput: {
          type: "object",
          required: ["id", "name", "role"],
          properties: {
            id: { type: "string", example: "guest-1" },
            name: { type: "string", example: "DJ Nova" },
            role: { type: "string", example: "Headliner" },
            imageUrl: { type: "string", example: "https://example.com/dj-nova.jpg" },
            bio: { type: "string", example: "Award-winning DJ and producer." }
          }
        },
        EventCustomFieldInput: {
          type: "object",
          required: ["id", "label", "type"],
          properties: {
            id: { type: "string", example: "school" },
            label: { type: "string", example: "School / Branch" },
            type: { type: "string", enum: ["text", "number", "select"], example: "select" },
            required: { type: "boolean", example: true },
            placeholder: { type: "string", example: "Select your school" },
            options: {
              type: "array",
              items: { type: "string" },
              example: ["UNILAG", "OAU", "LAUTECH"]
            }
          }
        },
        EventInput: {
          type: "object",
          required: ["title", "category", "description", "location", "startDate", "endDate", "capacity"],
          properties: {
            title: { type: "string", example: "West African Architecture Summit" },
            category: { type: "string", example: "Arts & Culture" },
            description: { type: "string", example: "<p>A premium architecture event.</p>" },
            location: { type: "string", example: "Lagos Continental Hotel" },
            startDate: { type: "string", format: "date-time" },
            endDate: { type: "string", format: "date-time" },
            capacity: { type: "number", example: 500 },
            ticketPrice: { type: "number", example: 0 },
            isFree: { type: "boolean", example: false },
            status: {
              type: "string",
              enum: ["draft", "published", "sold_out", "cancelled"],
              default: "published"
            },
            tags: {
              oneOf: [
                { type: "array", items: { type: "string" } },
                { type: "string" }
              ],
              example: ["Architecture", "Students"]
            },
            scheduleType: {
              type: "string",
              enum: ["single", "recurring"],
              default: "single"
            },
            recurrence: {
              type: "object",
              properties: {
                frequency: { type: "string", enum: ["daily", "weekly", "monthly"] },
                interval: { type: "number", example: 1 },
                until: { type: "string", format: "date-time" },
                daysOfWeek: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            },
            attendanceMode: {
              type: "string",
              enum: ["in_person", "virtual", "hybrid"],
              default: "in_person"
            },
            streaming: {
              type: "object",
              properties: {
                provider: { type: "string", example: "zoom" },
                url: { type: "string", example: "https://zoom.us/j/123456789" },
                meetingCode: { type: "string", example: "123-456-789" },
                password: { type: "string", example: "event123" },
                notes: { type: "string", example: "Room opens 15 minutes early." }
              }
            },
            ticketTiers: {
              oneOf: [
                {
                  type: "array",
                  items: { $ref: "#/components/schemas/TicketTierInput" }
                },
                { type: "string" }
              ]
            },
            guests: {
              oneOf: [
                {
                  type: "array",
                  items: { $ref: "#/components/schemas/EventGuestInput" }
                },
                { type: "string" }
              ]
            },
            customFields: {
              oneOf: [
                {
                  type: "array",
                  items: { $ref: "#/components/schemas/EventCustomFieldInput" }
                },
                { type: "string" }
              ]
            }
          }
        },
        EventMessageRequest: {
          type: "object",
          required: ["content"],
          properties: {
            guestName: { type: "string", example: "Janet" },
            content: { type: "string", maxLength: 280, example: "Can’t wait for this event." }
          }
        },
        CheckoutQuoteRequest: {
          type: "object",
          required: ["eventId", "ticketTypeId", "quantity"],
          properties: {
            eventId: { type: "string", example: "6630f3e1c3d8f8b8c6d00011" },
            ticketTypeId: { type: "string", example: "vip-tier" },
            quantity: { type: "number", minimum: 1, maximum: 20, example: 2 }
          }
        },
        CheckoutAnswerRequest: {
          type: "object",
          required: ["fieldId", "label", "value"],
          properties: {
            fieldId: { type: "string", example: "school" },
            label: { type: "string", example: "School / Branch" },
            value: { type: "string", example: "UNILAG" }
          }
        },
        CheckoutInitializeRequest: {
          allOf: [
            { $ref: "#/components/schemas/CheckoutQuoteRequest" },
            {
              type: "object",
              required: ["attendeeFirstName", "attendeeLastName", "attendeeEmail"],
              properties: {
                attendeeFirstName: { type: "string", example: "Whitney" },
                attendeeLastName: { type: "string", example: "Stone" },
                attendeeEmail: { type: "string", format: "email", example: "whitney@example.com" },
                attendeePhone: { type: "string", example: "+2348012345678" },
                comment: { type: "string", example: "Please send event updates by email." },
                customAnswers: {
                  type: "array",
                  items: { $ref: "#/components/schemas/CheckoutAnswerRequest" }
                }
              }
            }
          ]
        },
        VerifyReferenceRequest: {
          type: "object",
          required: ["reference"],
          properties: {
            reference: { type: "string", example: "ord_1777395055704_9w6goe" }
          }
        },
        PayoutProfileRequest: {
          type: "object",
          required: ["bankCode", "accountNumber"],
          properties: {
            bankCode: { type: "string", example: "058" },
            accountNumber: { type: "string", example: "0123456789" }
          }
        },
        OrganizerSettingsRequest: {
          type: "object",
          properties: {
            organizerNotifications: {
              type: "object",
              properties: {
                ticketPurchaseEmail: { type: "boolean", example: true }
              }
            }
          }
        },
        RefundRequest: {
          type: "object",
          required: ["orderReference"],
          properties: {
            orderReference: { type: "string", example: "ord_1777395055704_9w6goe" },
            amount: { type: "number", example: 10000 },
            reason: { type: "string", example: "Event rescheduled" },
            customerNote: { type: "string", example: "Buyer requested a refund." },
            merchantNote: { type: "string", example: "Approved by organizer." },
            includeServiceFee: { type: "boolean", example: false }
          }
        },
        BrandingMetadataRequest: {
          type: "object",
          required: ["eventId", "type", "eventName", "date", "venue", "organizerName"],
          properties: {
            eventId: { type: "string", example: "6630f3e1c3d8f8b8c6d00011" },
            type: {
              type: "string",
              enum: ["instagram_frame", "wristband", "badge_pass", "sponsor_backdrop"]
            },
            eventName: { type: "string", example: "Summer Gala" },
            date: { type: "string", example: "2026-08-24" },
            venue: { type: "string", example: "Times Square, New York" },
            organizerName: { type: "string", example: "Janet Events" },
            sponsorName: { type: "string", example: "Acme Corp" },
            logo: { type: "string", example: "https://example.com/logo.png" },
            accentColor: { type: "string", example: "#4F46E5" }
          }
        },
        CollaboratorInviteRequest: {
          type: "object",
          required: ["email", "role"],
          properties: {
            email: { type: "string", format: "email", example: "manager@example.com" },
            role: { type: "string", enum: ["manager", "scanner", "viewer"] }
          }
        },
        EventSettingsRequest: {
          type: "object",
          properties: {
            accessStatus: { type: "string", enum: ["active", "suspended"] },
            suspensionReason: { type: "string", maxLength: 240, example: "Compliance review" }
          }
        },
        ScanTicketRequest: {
          type: "object",
          required: ["qrToken"],
          properties: {
            qrToken: { type: "string", example: "qr_4i18j4bk5..." }
          }
        },
        AdminOrganizerReviewRequest: {
          type: "object",
          properties: {
            payoutStatus: {
              type: "string",
              enum: ["not_started", "pending_review", "verified", "rejected", "suspended"]
            },
            riskStatus: {
              type: "string",
              enum: ["clear", "under_review", "blocked"]
            },
            reviewNote: { type: "string", example: "Verified after bank account review." }
          }
        },
        AdminSuspendEventRequest: {
          type: "object",
          required: ["accessStatus"],
          properties: {
            accessStatus: { type: "string", enum: ["active", "suspended"] },
            suspensionReason: { type: "string", example: "Chargeback investigation" }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: [
    path.join(projectRoot, "src/routes/**/*.ts"),
    path.join(projectRoot, "src/docs/**/*.ts"),
    path.join(projectRoot, "dist/routes/**/*.js"),
    path.join(projectRoot, "dist/docs/**/*.js")
  ]
});
