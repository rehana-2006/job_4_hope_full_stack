# Deployment Guide for Job4Hope

## 1. Database Setup (CRITICAL)
Vercel is a "serverless" platform, meaning it doesn't store files permanently. You cannot use the default SQLite database (`sql_app.db`) because it will be lost every time your app restarts.

**You must use a cloud PostgreSQL database.**

### Option A: Neon.tech (Recommended for Beginners)
1. Go to [Neon.tech](https://neon.tech) and sign up.
2. Create a new Project.
3. Copy the **Connection String** (it starts with `postgres://...`).
4. Replace `postgres://` with `postgresql://` in the string if needed (SQLAlchemy requires this).

### Option B: Supabase
1. Go to [Supabase.com](https://supabase.com).
2. Create a new Project.
3. Go to Project Settings -> Database -> Connection String -> URI.
4. Copy the string.

## 2. Environment Variables on Vercel
When you import your project to Vercel:
1. Go to **Settings** > **Environment Variables**.
2. Add a new variable:
   - **Key**: `DATABASE_URL`
   - **Value**: (Paste your connection string from Step 1)

## 3. Verify `requirements.txt`
Ensure `psycopg2-binary` is in your `requirements.txt`. It is required for connecting to PostgreSQL.

## 4. Deploy
1. Push your code to GitHub.
2. Import the repository in Vercel.
3. Vercel should automatically detect the `vercel.json` and deploy.
