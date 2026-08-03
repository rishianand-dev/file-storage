import type { OpenAPIV3 } from "openapi-types";

export const openApiSpec: OpenAPIV3.Document = {
  openapi: "3.0.3",
  info: {
    title: "File Storage API",
    version: "1.0.0",
    description: "API for cloud file, folder, image, and video storage.",
  },
  servers: [
    {
      url: "/api",
      description: "API base path",
    },
  ],
  tags: [
    { name: "Health", description: "Service health checks" },
    { name: "Auth", description: "Authentication endpoints" },
    { name: "Me", description: "Current authenticated user" },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        description: "Checks API and database connectivity.",
        responses: {
          "200": {
            description: "Service is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    database: { type: "string", example: "connected" },
                  },
                },
              },
            },
          },
          "503": {
            description: "Database unavailable",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "error" },
                    database: { type: "string", example: "disconnected" },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register with credentials",
        description: "Creates a new user account with email and password.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterBody" },
            },
          },
        },
        responses: {
          "201": {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthSuccessResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ValidationErrorResponse" },
              },
            },
          },
          "409": {
            description: "Email already registered",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login with credentials",
        description: "Authenticates a user with email and password.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginBody" },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthSuccessResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ValidationErrorResponse" },
              },
            },
          },
          "401": {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh tokens",
        description:
          "Exchanges a valid refresh token for a new access token and rotated refresh token.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RefreshBody" },
            },
          },
        },
        responses: {
          "200": {
            description: "New token pair issued",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TokenPairSuccessResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ValidationErrorResponse" },
              },
            },
          },
          "401": {
            description: "Invalid, expired, or reused refresh token",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout",
        description: "Revokes the given refresh token.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RefreshBody" },
            },
          },
        },
        responses: {
          "200": {
            description: "Refresh token revoked",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { nullable: true, example: null },
                  },
                },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ValidationErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/me": {
      get: {
        tags: ["Me"],
        summary: "Get current user",
        description: "Returns the authenticated user's profile.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Current user profile",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MeSuccessResponse" },
              },
            },
          },
          "401": {
            description: "Missing or invalid token",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "User not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Me"],
        summary: "Update current user",
        description:
          "Updates the authenticated user's profile. At least one field is required.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateMeBody" },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated user profile",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MeSuccessResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ValidationErrorResponse" },
              },
            },
          },
          "401": {
            description: "Missing or invalid token",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "409": {
            description: "Email already in use",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      RegisterBody: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: {
            type: "string",
            minLength: 1,
            maxLength: 100,
            example: "Rishi Anand",
          },
          email: {
            type: "string",
            format: "email",
            example: "rishi@example.com",
          },
          password: {
            type: "string",
            format: "password",
            minLength: 8,
            maxLength: 72,
            example: "secretpass",
          },
        },
      },
      LoginBody: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "rishi@example.com",
          },
          password: {
            type: "string",
            format: "password",
            example: "secretpass",
          },
        },
      },
      RefreshBody: {
        type: "object",
        required: ["refreshToken"],
        properties: {
          refreshToken: {
            type: "string",
            description: "Refresh token from login/register/refresh",
          },
        },
      },
      AuthUser: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          image: { type: "string", nullable: true },
        },
      },
      UpdateMeBody: {
        type: "object",
        properties: {
          name: {
            type: "string",
            minLength: 1,
            maxLength: 100,
            example: "Rishi Anand",
          },
          email: {
            type: "string",
            format: "email",
            example: "rishi@example.com",
          },
          image: {
            type: "string",
            format: "uri",
            nullable: true,
            example: "https://example.com/avatar.png",
          },
        },
      },
      MeSuccessResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          data: { $ref: "#/components/schemas/AuthUser" },
        },
      },
      AuthSuccessResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          data: {
            type: "object",
            properties: {
              user: { $ref: "#/components/schemas/AuthUser" },
              accessToken: {
                type: "string",
                description: "Short-lived JWT access token",
              },
              refreshToken: {
                type: "string",
                description: "Long-lived refresh token (store securely)",
              },
            },
          },
        },
      },
      TokenPairSuccessResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          data: {
            type: "object",
            properties: {
              accessToken: {
                type: "string",
                description: "Short-lived JWT access token",
              },
              refreshToken: {
                type: "string",
                description: "Rotated refresh token",
              },
            },
          },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "error" },
          message: { type: "string" },
        },
      },
      ValidationErrorResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "error" },
          message: { type: "string", example: "Validation failed" },
          details: {
            type: "array",
            items: {
              type: "object",
              properties: {
                path: { type: "string", example: "email" },
                message: { type: "string", example: "Invalid email address" },
              },
            },
          },
        },
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};
