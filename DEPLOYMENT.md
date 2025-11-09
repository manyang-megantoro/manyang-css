# Deployment Guide

## GitHub Pages Setup (One-time setup)

### 1. Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select **Deploy from a branch**
4. Select branch: **gh-pages**
5. Select folder: **/ (root)**
6. Click **Save**

### 2. What happens automatically
When you push to the `main` branch:
- GitHub Actions will run the `deploy-gh-pages` workflow
- It will build your CSS
- It will create a gh-pages structure:
  - Demo at the root (your main page)
  - Docs at `/docs` (your Docsify documentation)
- It will deploy to the `gh-pages` branch
- GitHub Pages will serve your site

### 3. Your URLs (after deployment)
- **Demo (main page)**: `https://yourusername.github.io/manyang-css-hover/`
- **Documentation**: `https://yourusername.github.io/manyang-css-hover/docs/`

## Daily Workflow

### Making changes and deploying
```bash
# 1. Make your changes to SCSS, demo, or docs

# 2. Test locally (optional)
npm run build
npm run watch  # for development

# 3. Commit and push to main branch
git add .
git commit -m "Your commit message"
git push origin main

# 4. That's it! GitHub Actions will automatically deploy
```

### Check deployment status
1. Go to your repository on GitHub
2. Click the **Actions** tab
3. You'll see the "Build and publish demo" workflow running
4. Wait for it to complete (green checkmark)
5. Visit your GitHub Pages URL

## Publishing to npm (for later)

When you're ready to publish to npm:

1. **Restore the npm publishing workflow**:
   - Create `.github/workflows/publish-npm.yml` (check git history or ask for the file)

2. **Add your npm token to GitHub**:
   - Go to npmjs.com → Access Tokens → Generate New Token
   - Copy the token
   - Go to GitHub → Settings → Secrets → New repository secret
   - Name: `NPM_TOKEN`
   - Value: paste your token

3. **Create a GitHub Release**:
   - Go to your repo → Releases → Create a new release
   - Create a tag (e.g., `v1.0.0`)
   - Write release notes
   - Click **Publish release**
   - GitHub Actions will automatically publish to npm

## Troubleshooting

### GitHub Pages not updating
- Check the Actions tab for errors
- Make sure you pushed to the `main` branch
- Wait a few minutes (GitHub Pages can take 1-5 minutes to update)

### Demo or docs not working
- Check that files exist in the `demo/` and `docs/` folders
- Run `node ./scripts/prepare-gh-pages.js` locally to test
- Check the `gh-pages` folder output

### Build failing
- Check the Actions tab for error messages
- Make sure `npm run build` works locally
- Check that all dependencies are in package.json
