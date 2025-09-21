# AuthFlow

AuthFlow is a complete Next.js application with a comprehensive user authentication system. It's built with modern web technologies to provide a secure, fast, and user-friendly experience.

## Features

- **User Authentication**: Secure sign-up, login, and logout.
- **Profile Management**: View and update user profile information.
- **Password Reset**: Secure "forgot password" flow via email.
- **AI-Powered Tools**: Includes an AI Form Validator to suggest UX improvements.
- **Secure by Design**: Implements security best practices like password hashing, CSRF protection, and more.

## Getting Started

Follow these steps to get the application running locally.

### Prerequisites

- Node.js (v18 or later)
- npm or another package manager

### 1. Clone the repository

```bash
# Not applicable in this environment, but for local setup:
git clone <repository-url>
cd <repository-name>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root of your project by copying the example file:

```bash
cp .env.example .env
```

Now, open the `.env` file and fill in the required variables:

- `DATABASE_URL`: The URL for your SQLite database. The default `file:./dev.db` is fine for local development.
- `AUTH_SECRET`: A secret key for NextAuth.js. Generate one using the command: `openssl rand -base64 32`.
- `RESEND_API_KEY`: Your API key from [Resend](https://resend.com) for sending emails.
- `EMAIL_FROM`: The email address you want to send emails from (e.g., `onboarding@resend.dev`).

### 4. Set up the database

Run the Prisma migration to create the database schema and tables:

```bash
npx prisma migrate dev --name init
```

This will also generate the Prisma Client based on your schema.

### 5. Run the development server

```bash
npm run dev
```

The application will be available at [http://localhost:9002](http://localhost:9002).

## Tech Stack

- **Framework**: Next.js (App Router)
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js (Auth.js)
- **Styling**: Tailwind CSS & shadcn/ui
- **Forms**: React Hook Form & Zod
- **Email**: Resend
- **AI**: Genkit
