"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memberInviteSchema = exports.organizationUpdateSchema = exports.organizationCreateSchema = exports.invitationAcceptanceSchema = exports.signUpSchema = exports.signInSchema = void 0;
const zod_1 = require("zod");
// Auth form schemas
exports.signInSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .min(1, "Email is required")
        .email("Please enter a valid email address"),
    password: zod_1.z
        .string()
        .min(1, "Password is required")
        .min(6, "Password must be at least 6 characters"),
});
exports.signUpSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, "Name is required")
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be less than 50 characters"),
    email: zod_1.z
        .string()
        .min(1, "Email is required")
        .email("Please enter a valid email address"),
    password: zod_1.z
        .string()
        .min(1, "Password is required")
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password must be less than 100 characters"),
});
exports.invitationAcceptanceSchema = zod_1.z.object({
    invitationId: zod_1.z.string().min(1, "Invitation ID is required"),
    name: zod_1.z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be less than 50 characters")
        .optional(),
    password: zod_1.z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password must be less than 100 characters")
        .optional(),
});
// Organization form schemas
exports.organizationCreateSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, "Organization name is required")
        .min(2, "Organization name must be at least 2 characters")
        .max(100, "Organization name must be less than 100 characters"),
    slug: zod_1.z
        .string()
        .min(1, "Slug is required")
        .min(2, "Slug must be at least 2 characters")
        .max(50, "Slug must be less than 50 characters")
        .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
});
exports.organizationUpdateSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, "Organization name must be at least 2 characters")
        .max(100, "Organization name must be less than 100 characters")
        .optional(),
    slug: zod_1.z
        .string()
        .min(2, "Slug must be at least 2 characters")
        .max(50, "Slug must be less than 50 characters")
        .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
        .optional(),
});
exports.memberInviteSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .min(1, "Email is required")
        .email("Please enter a valid email address"),
    role: zod_1.z
        .enum(["admin", "member", "viewer"])
        .default("member"),
});
