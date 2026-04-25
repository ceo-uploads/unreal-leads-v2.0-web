
# Initialize the local directory as a Git repository
    git init

# Add all files to the staging area
    git add .

# Commit the files
    git commit -m "Initial commit"

# Rename the main branch (standard for GitHub)
    git branch -M main

# Link your local repository to GitHub
    git remote add origin https://github.com/ceo-uploads/unreal-leads-v2.0-web

# Pull the remote changes
    git pull origin main --allow-unrelated-histories

# Push your code to the main branch
    git push -u origin main

# Force Push (Caution): If you don't care about what is currently on GitHub and just want your local code to replace everything there, you can use a "force" push. Warning: This deletes anything currently on the GitHub repo.
    git push origin main --force

# Run the Deployment
    npm run deploy