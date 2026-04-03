#!/bin/bash
# MindVibe Deploy Script
# Run this from the simply-lernen folder

set -e

echo "🚀 MindVibe Deploy to GitHub → Vercel"
echo "======================================="

# Check we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Please run this from the simply-lernen folder"
  exit 1
fi

# Initialize git if needed
if [ ! -d ".git" ] || ! git rev-parse HEAD >/dev/null 2>&1; then
  echo "📦 Initializing git..."
  rm -rf .git
  git init
  git branch -M main
fi

# Set remote
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/xprtc/mindvibe-app.git

# Fetch and reset to include the README commit
echo "📥 Fetching from GitHub..."
git fetch origin main

# Stage all files
echo "📝 Staging files..."
git add -A

# Commit
echo "💾 Committing..."
git commit -m "feat: Einstein Concierge, subject-centric timeline, full redesign

- Complete UI redesign with MindVibe design system
- Einstein Concierge: floating bubble, page-aware chat, quick actions
- Subject-centric navigation with Lehrplan 21 defaults
- Per-subject timeline grouped by Swiss semesters
- Material upload (PDF, DOC, images incl. HEIC)
- Self-test tracking, exam entries with grades
- Einstein chat with file attachments and voice input
- Gemini 2.5 Flash AI integration
- Firebase Firestore persistence
- Responsive timeline (vertical mobile, horizontal desktop)

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>" || echo "Nothing to commit"

# Force push (overwriting the README-only commit)
echo "🚀 Pushing to GitHub..."
git push -f origin main

echo ""
echo "✅ Code pushed to https://github.com/xprtc/mindvibe-app"
echo ""
echo "Next: Connect this repo to Vercel at https://vercel.com/new"
echo "Or run: npx vercel deploy --prod"
