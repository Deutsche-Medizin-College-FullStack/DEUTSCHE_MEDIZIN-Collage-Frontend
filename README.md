# Deutsche Medizin College Frontend

A modern React + TypeScript + Vite application for managing college operations.

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20
- npm >= 10

### Installation

```bash
# Install dependencies (IMPORTANT: Run this first after cloning/pulling)
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Note:** After pulling the latest changes, make sure to run `npm install` to install the new `@radix-ui/react-radio-group` dependency.

## 📦 Deployment on Vercel

This project is configured for easy deployment on Vercel. Follow these steps:

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI globally:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. For production deployment:
```bash
vercel --prod
```

### Option 2: Deploy via Vercel Dashboard

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import your repository
5. Vercel will auto-detect the settings from `vercel.json`
6. Add environment variables (see below)
7. Click "Deploy"

### Environment Variables

Before deploying, make sure to set the following environment variables in your Vercel project settings:

1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add the following:

```
VITE_API_BASE_URL=https://your-api-url.com/api
```

**Important:** Replace `https://your-api-url.com/api` with your actual backend API URL.

### Build Configuration

The project uses the following build settings (configured in `vercel.json`):

- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`
- **Node Version:** 20+ (specified in `package.json`)

### Troubleshooting

#### Build Errors

If you encounter build errors:

1. **TypeScript Errors:** The project is configured to allow builds even with some TypeScript warnings. Critical errors will still fail the build.

2. **Missing Dependencies:** Make sure all dependencies are listed in `package.json`. Run `npm install` locally to verify.

3. **Environment Variables:** Ensure all required environment variables are set in Vercel dashboard.

#### Common Issues

- **404 on Routes:** The `vercel.json` includes a rewrite rule to handle client-side routing. All routes are redirected to `index.html`.

- **API Connection Issues:** Verify your `VITE_API_BASE_URL` environment variable is correctly set and your backend API is accessible.

- **Build Timeout:** If builds timeout, check for:
  - Large dependencies
  - Slow network connections
  - Complex build processes

## 🛠️ Development

### Project Structure

```
src/
├── components/     # Reusable components
├── pages/         # Page components
├── layouts/       # Layout components
├── hooks/         # Custom React hooks
├── lib/           # Utility functions
├── locales/       # i18n translations
└── assets/        # Static assets
```

### Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client
- **i18next** - Internationalization

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔧 Configuration Files

- `vercel.json` - Vercel deployment configuration
- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration

## 📄 License

Private project - All rights reserved
