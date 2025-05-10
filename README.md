# Symphony Life Manager

A minimalist life management hub with intelligent AI assistance for goal setting, task management, and routines. Built with Next.js, Firebase, and shadcn UI components.

## Core Features

- **Dynamic To-Do List Interface**: A simple, single-column view showing immediate and relevant upcoming tasks, dynamically updated.
- **Natural Language Task Input**: Ability to add tasks using plain language, with initial AI parsing to identify actions, due dates, and potential links to goals.
- **Goal & Task Hierarchy Foundation**: Implement the basic data structure for Goals, Milestones, Tasks, and Routines, allowing manual creation and linking initially. Goals support fixed deadlines or recurring reviews.
- **Basic AI Task Breakdown/Suggestion**: When a task is entered (especially a higher-level one), the AI suggests potential sub-tasks or required steps.
- **Calendar Integration**: Display upcoming calendar events within or alongside the daily task view.
- **Minimalist Design**: Ensure a clean, functional, and visually appealing interface from the outset.

## Technologies Used

- Next.js (App Router)
- Firebase/Firestore
- React Hook Form
- Tailwind CSS
- Shadcn UI Components
- Zod for validation
- TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Firebase account

### Setup

1. Clone the repository:
```bash
git clone https://github.com/scottring/symphony-app.git
cd symphony-app
```

2. Install dependencies:
```bash
npm install
# or
yarn
```

3. Create a Firebase project:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Set up Firebase Authentication (enable Email/Password provider)
   - Create a Firestore database

4. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add your Firebase configuration (see `.env.local.example` for the required variables)

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

5. Run the development server:
```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

### Authentication

- Create an account from the signup page
- Log in using your email and password

### Tasks

- View your tasks on the dashboard or tasks page
- Create new tasks with the "Add New Task" button
- Use natural language input to quickly create tasks
- Generate AI suggested subtasks when creating tasks
- Edit tasks by clicking on them
- Mark tasks as complete

### Future Enhancements

- Goals and Milestones management
- Routines for recurring tasks
- Calendar integration
- Advanced AI features with OpenAI API integration

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Dashboard and main app
│   └── ...
├── components/           # React components
│   ├── ui/               # UI components
│   └── ...
├── lib/                  # Utility functions
│   ├── firebase.ts       # Firebase configuration
│   ├── ai-service.ts     # AI service for task suggestions
│   └── utils.ts          # General utilities
└── ...
```

## Deploying to Production

1. Run the build command:
```bash
npm run build
# or
yarn build
```

2. Deploy to a hosting service:
   - Vercel (recommended for Next.js apps)
   - Netlify
   - Firebase Hosting

## Integrating with OpenAI (Optional)

To enable advanced AI features:

1. Sign up for an OpenAI API key
2. Add your API key to the `.env.local` file:
```
OPENAI_API_KEY=your-openai-api-key
```

3. Modify the AI service to use the OpenAI API for task suggestions and natural language processing.
