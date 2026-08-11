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
    { name: "Folders", description: "Folder create, rename, move, and delete" },
    { name: "Files", description: "File upload and storage" },
    {
      name: "Recently Opened",
      description: "Track and list recently opened files",
    },
    { name: "Starred Folders", description: "Star and list favorite folders" },
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
                schema: {
                  $ref: "#/components/schemas/ValidationErrorResponse",
                },
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
                schema: {
                  $ref: "#/components/schemas/ValidationErrorResponse",
                },
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
                schema: {
                  $ref: "#/components/schemas/TokenPairSuccessResponse",
                },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationErrorResponse",
                },
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
                schema: {
                  $ref: "#/components/schemas/ValidationErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/auth/forgot-password": {
      post: {
        tags: ["Auth"],
        summary: "Forgot password",
        description:
          "Sends a password reset link if a credentials account exists for the email. Always returns the same message to avoid email enumeration. In development the reset link is logged to the server console.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ForgotPasswordBody" },
              example: { email: "rishi@example.com" },
            },
          },
        },
        responses: {
          "200": {
            description: "Generic success response",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ForgotPasswordSuccessResponse",
                },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/auth/reset-password": {
      post: {
        tags: ["Auth"],
        summary: "Reset password",
        description:
          "Sets a new password using a valid reset token from the forgot-password email. Revokes all active refresh sessions for the user.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ResetPasswordBody" },
              example: {
                token: "paste-token-from-email-or-console",
                password: "newsecret1",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Password reset successful",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ResetPasswordSuccessResponse",
                },
              },
            },
          },
          "400": {
            description: "Validation failed or invalid/expired reset token",
            content: {
              "application/json": {
                schema: {
                  oneOf: [
                    { $ref: "#/components/schemas/ValidationErrorResponse" },
                    { $ref: "#/components/schemas/ErrorResponse" },
                  ],
                },
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
                schema: {
                  $ref: "#/components/schemas/ValidationErrorResponse",
                },
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
    "/folders": {
      post: {
        tags: ["Folders"],
        summary: "Create folder",
        description:
          "Creates a folder for the authenticated user. Omit or null `parent_id` for a root folder.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateFolderBody" },
            },
          },
        },
        responses: {
          "201": {
            description: "Folder created",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/FolderSuccessResponse",
                },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationErrorResponse",
                },
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
            description: "Parent folder not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "409": {
            description: "Folder name already exists in this location",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/folders/{id}": {
      patch: {
        tags: ["Folders"],
        summary: "Rename folder",
        description: "Renames an owned folder.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Folder id",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RenameFolderBody" },
            },
          },
        },
        responses: {
          "200": {
            description: "Folder renamed",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/FolderSuccessResponse",
                },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationErrorResponse",
                },
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
            description: "Folder not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "409": {
            description: "Folder name already exists in this location",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Folders"],
        summary: "Soft-delete folder",
        description:
          "Soft-deletes a folder and cascades to nested folders and files.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Folder id",
          },
        ],
        responses: {
          "200": {
            description: "Folder soft-deleted",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SoftDeleteFolderSuccessResponse",
                },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationErrorResponse",
                },
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
            description: "Folder not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/folders/{id}/move": {
      patch: {
        tags: ["Folders"],
        summary: "Move folder",
        description:
          "Moves a folder under a new parent. Pass `null` for `parent_id` to move to root.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Folder id",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MoveFolderBody" },
            },
          },
        },
        responses: {
          "200": {
            description: "Folder moved",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/FolderSuccessResponse",
                },
              },
            },
          },
          "400": {
            description:
              "Validation failed, invalid move target, or already in location",
            content: {
              "application/json": {
                schema: {
                  oneOf: [
                    { $ref: "#/components/schemas/ValidationErrorResponse" },
                    { $ref: "#/components/schemas/ErrorResponse" },
                  ],
                },
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
            description: "Folder or parent folder not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "409": {
            description: "Folder name already exists in destination",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/folders/{id}/permanent": {
      delete: {
        tags: ["Folders"],
        summary: "Permanently delete folder",
        description:
          "Permanently deletes a soft-deleted folder tree from the database and disk. Soft-delete first.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Folder id",
          },
        ],
        responses: {
          "200": {
            description: "Folder permanently deleted",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PermanentDeleteFolderSuccessResponse",
                },
              },
            },
          },
          "400": {
            description:
              "Validation failed, or folder has not been soft-deleted yet",
            content: {
              "application/json": {
                schema: {
                  oneOf: [
                    { $ref: "#/components/schemas/ValidationErrorResponse" },
                    { $ref: "#/components/schemas/ErrorResponse" },
                  ],
                },
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
            description: "Folder not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/files": {
      post: {
        tags: ["Files"],
        summary: "Upload file",
        description:
          "Uploads a single file (multipart field `file`, max 50MB). Omit or null `folder_id` to upload to root.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["file"],
                properties: {
                  file: {
                    type: "string",
                    format: "binary",
                    description: "File to upload",
                  },
                  folder_id: {
                    type: "string",
                    format: "uuid",
                    nullable: true,
                    description: "Destination folder id, or null for root",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "File uploaded",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/FileSuccessResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed or missing file",
            content: {
              "application/json": {
                schema: {
                  oneOf: [
                    { $ref: "#/components/schemas/ValidationErrorResponse" },
                    { $ref: "#/components/schemas/ErrorResponse" },
                  ],
                },
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
            description: "Folder not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "409": {
            description: "File name already exists in this location",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/recently-opened": {
      get: {
        tags: ["Recently Opened"],
        summary: "List recently opened files",
        description:
          "Returns recently opened files for the authenticated user, newest first.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "limit",
            in: "query",
            required: false,
            schema: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              default: 20,
            },
            description: "Max number of items to return",
          },
        ],
        responses: {
          "200": {
            description: "Recently opened list",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/RecentlyOpenedListSuccessResponse",
                },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationErrorResponse",
                },
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
        },
      },
      post: {
        tags: ["Recently Opened"],
        summary: "Track recently opened file",
        description:
          "Records or refreshes that the authenticated user opened a file.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/TrackRecentlyOpenedBody",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Recently opened entry upserted",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/RecentlyOpenedSuccessResponse",
                },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationErrorResponse",
                },
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
            description: "File not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/starred-folders": {
      get: {
        tags: ["Starred Folders"],
        summary: "List starred folders",
        description:
          "Returns starred folders for the authenticated user, most recently starred first.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "limit",
            in: "query",
            required: false,
            schema: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              default: 20,
            },
            description: "Max number of items to return",
          },
        ],
        responses: {
          "200": {
            description: "Starred folders list",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/StarredFolderListSuccessResponse",
                },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationErrorResponse",
                },
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
        },
      },
      post: {
        tags: ["Starred Folders"],
        summary: "Star folder",
        description:
          "Stars a folder (or refreshes `starred_at` if already starred).",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/StarFolderBody" },
            },
          },
        },
        responses: {
          "201": {
            description: "Folder starred",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/StarredFolderSuccessResponse",
                },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationErrorResponse",
                },
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
            description: "Folder not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/starred-folders/{folderId}": {
      delete: {
        tags: ["Starred Folders"],
        summary: "Unstar folder",
        description: "Removes a folder from the authenticated user's stars.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "folderId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Folder id to unstar",
          },
        ],
        responses: {
          "200": {
            description: "Folder unstarred",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UnstarFolderSuccessResponse",
                },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationErrorResponse",
                },
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
            description: "Folder not found or not starred",
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
      ForgotPasswordBody: {
        type: "object",
        required: ["email"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "rishi@example.com",
          },
        },
      },
      ResetPasswordBody: {
        type: "object",
        required: ["token", "password"],
        properties: {
          token: {
            type: "string",
            description: "Password reset token from email / console",
            example: "paste-token-from-email-or-console",
          },
          password: {
            type: "string",
            format: "password",
            minLength: 8,
            maxLength: 72,
            example: "newsecret1",
          },
        },
      },
      ForgotPasswordSuccessResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          data: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example:
                  "If an account with that email exists, a password reset link has been sent.",
              },
            },
          },
        },
      },
      ResetPasswordSuccessResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          data: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Password has been reset. You can sign in now.",
              },
            },
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
      CreateFolderBody: {
        type: "object",
        required: ["name"],
        properties: {
          name: {
            type: "string",
            minLength: 1,
            maxLength: 255,
            example: "Documents",
          },
          parent_id: {
            type: "string",
            format: "uuid",
            nullable: true,
            description: "Parent folder id, or null/omit for root",
          },
        },
      },
      RenameFolderBody: {
        type: "object",
        required: ["name"],
        properties: {
          name: {
            type: "string",
            minLength: 1,
            maxLength: 255,
            example: "Work docs",
          },
        },
      },
      MoveFolderBody: {
        type: "object",
        required: ["parent_id"],
        properties: {
          parent_id: {
            type: "string",
            format: "uuid",
            nullable: true,
            description: "New parent folder id, or null for root",
          },
        },
      },
      Folder: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          parent_id: { type: "string", format: "uuid", nullable: true },
          owner_id: { type: "string", format: "uuid" },
          deleted_at: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },
      FolderSuccessResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          data: { $ref: "#/components/schemas/Folder" },
        },
      },
      SoftDeleteFolderSuccessResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          data: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              deleted_folders: {
                type: "integer",
                description: "Number of folders soft-deleted in the tree",
                example: 3,
              },
            },
          },
        },
      },
      PermanentDeleteFolderSuccessResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          data: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              deleted_folders: {
                type: "integer",
                description: "Number of folders permanently deleted",
                example: 3,
              },
              deleted_files: {
                type: "integer",
                description: "Number of files permanently deleted",
                example: 5,
              },
            },
          },
        },
      },
      File: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "report.pdf" },
          extension: { type: "string", example: "pdf" },
          mime_type: { type: "string", example: "application/pdf" },
          storage_name: { type: "string" },
          storage_path: { type: "string" },
          size: {
            type: "string",
            description: "File size in bytes as a string",
            example: "1024",
          },
          folder_id: { type: "string", format: "uuid", nullable: true },
          owner_id: { type: "string", format: "uuid" },
          deleted_at: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },
      FileSuccessResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          data: { $ref: "#/components/schemas/File" },
        },
      },
      TrackRecentlyOpenedBody: {
        type: "object",
        required: ["file_id"],
        properties: {
          file_id: {
            type: "string",
            format: "uuid",
            description: "Id of the file that was opened",
          },
        },
      },
      RecentlyOpened: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          user_id: { type: "string", format: "uuid" },
          file_id: { type: "string", format: "uuid" },
          opened_at: { type: "string", format: "date-time" },
          file: { $ref: "#/components/schemas/File" },
        },
      },
      RecentlyOpenedSuccessResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          data: { $ref: "#/components/schemas/RecentlyOpened" },
        },
      },
      RecentlyOpenedListSuccessResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/RecentlyOpened" },
          },
        },
      },
      StarFolderBody: {
        type: "object",
        required: ["folder_id"],
        properties: {
          folder_id: {
            type: "string",
            format: "uuid",
            description: "Id of the folder to star",
          },
        },
      },
      StarredFolder: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          user_id: { type: "string", format: "uuid" },
          folder_id: { type: "string", format: "uuid" },
          starred_at: { type: "string", format: "date-time" },
          folder: { $ref: "#/components/schemas/Folder" },
        },
      },
      StarredFolderSuccessResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          data: { $ref: "#/components/schemas/StarredFolder" },
        },
      },
      StarredFolderListSuccessResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/StarredFolder" },
          },
        },
      },
      UnstarFolderSuccessResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          data: {
            type: "object",
            properties: {
              folder_id: { type: "string", format: "uuid" },
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
