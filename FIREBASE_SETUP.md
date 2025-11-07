# Firebase Setup Guide

## Step 1: Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click the gear icon ⚙️ → **Project Settings**
4. Navigate to the **Service Accounts** tab
5. Click **Generate New Private Key**
6. Download the JSON file

## Step 2: Add Environment Variables

From the downloaded JSON file, add these environment variables to your Vercel project (in the Vars section):

\`\`\`env
FIREBASE_PROJECT_ID=your-project-id-here
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour full private key here\n-----END PRIVATE KEY-----\n"
\`\`\`

**Important Notes:**
- The `FIREBASE_PRIVATE_KEY` must include the quotes and keep the `\n` characters
- Copy the entire private key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`

## Step 3: Enable Firestore

1. In Firebase Console, go to **Firestore Database**
2. Click **Create Database**
3. Choose **Start in production mode** (or test mode for development)
4. Select your region

## Step 4: Test the Integration

Visit `/dashboard/api-tokens` to test if Firebase is working correctly. Check the browser console for any error messages.

## Firestore Collections

The app uses these collections:
- `api_users` - Stores API user registration data
- `api_tokens` - Stores generated API tokens
- `api_usage` - Tracks API usage statistics
