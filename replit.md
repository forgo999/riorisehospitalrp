# RioRise RP Hospital - Sistema de Gestão Hospitalar

## Overview

A comprehensive hospital management system designed for role-playing (RP) environments. It features robust control over hierarchy, permissions, shifts, attendance, warnings, promotions, and extensive logging. The system aims to provide a realistic and organized hospital management experience for RP communities.

## User Preferences

- Linguagem: Português (BR)
- Comunicação: Simples e objetiva
- Deploy: Render + MongoDB Atlas
- Ambiente: Sem dependências do Replit

## System Architecture

### Stack Tecnológico

**Frontend:**
- React 18 + TypeScript + Vite
- Wouter (routing)
- TanStack Query (server state management)
- Radix UI + Tailwind CSS (components and styling)
- React Hook Form + Zod (forms and validation)

**Backend:**
- Express.js + TypeScript
- MongoDB + Mongoose ODM
- Session-less authentication (access code)
- Role-based permission system

### Core Features and Design

1.  **User Management:** Authentication via unique access codes, 7 hierarchical levels (Estagiário to Administrador), Chief Surgeon role (one per shift), and promotion history.
2.  **Shift System:** Multiple work shifts, Vice Director responsibility per shift, shift-specific access passwords, rules, and commands.
3.  **Promotion System:** Flexible promotion paths, automatic demotion for Chief Surgeon role changes, and comprehensive logging.
4.  **Warning System:** Automatic warning count, automatic termination after 3 warnings, and historical data preservation.
5.  **Termination System:** User deletion with full historical data (warnings, promotions, attendance, logs) preserved for auditing.
6.  **Attendance System:** Daily registration per shift (Present/Absent), optional notes, and complete history.
7.  **Dynamic Commands and Categories (`/me`):** General and shift-specific commands and categories, dynamically created by Vice Directors and higher roles.
8.  **Rules Management:** General and shift-specific rules with versioning (createdAt/updatedAt).
9.  **Covenant Management:** Tracking affiliated organizations, payment values, validity periods, and expiration timers.
10. **Admin-Only Logging:** Comprehensive audit logs for all system actions, visible exclusively to Administrators.

### Security and Access Control

-   **Permission Validation:** Granular control over user creation and resource management based on hierarchical roles (e.g., Vice Director limited to their shift, Director/Admin have broader access).
-   **Endpoint Protection:** All sensitive routes are secured with mandatory authentication, role-based permission validation (`requireAuth`, `requireRole`, `requireAdminOrDirector`), and resource-specific access checks (`canManageResource`, `canManageUser`, `canCreateUserWithRole`).
-   **Auditing:** Detailed logs ensure accountability and traceability of all actions.

### UI/UX Design

-   Utilizes Radix UI and Tailwind CSS for a modern, consistent, and responsive design.

## External Dependencies

-   **MongoDB Atlas:** Cloud-hosted database for data storage.
-   **Render:** Web service for hosting the frontend and backend applications.