# OneFit Development Rules & Git Workflow

## Git Workflow Guidelines

As the OneFit app grows, it's crucial to maintain a clean and organized development process. This document outlines our Git workflow to ensure code quality and collaboration.


We follow a **feature branch workflow** where all new development happens on feature branches, not directly on main.

### Branch Naming Conventions

Use descriptive, consistent naming for all branches:



### Creating a New Feature Branch

1. **Start from main branch** (ensure it's up to date):
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create and switch to new feature branch**:
   ```bash
   git checkout -b your-branch-name
   ```

3. **Verify you're on the new branch**:
   ```bash
   git branch
   ```

### Development Workflow

1. **Make your changes** and commit frequently with clear messages:
   ```bash
   git add .
   git commit -m "feat: add fasting timer component"
   git commit -m "fix: resolve timer state management issue"
   git commit -m "style: improve button styling in fasting screen"
   ```

2. **Push your branch to remote**:
   ```bash
   git push origin your-feature-name
   ```

3. **Keep your branch updated** with main (if needed):
   ```bash
   git fetch origin
   git rebase origin/main
   ```


### Pull Request Process

**NEVER merge directly to main!** Always use Pull Requests (PRs).

#### Creating a Pull Request

1. **Push your feature branch** to remote (if not already done):
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create PR on GitHub**:
   - Go to your repository
   - Click "Compare & pull request" or "New pull request"
   - Set base branch as `main`
   - Set compare branch as your feature branch

3. **Fill out PR template**:
   - **Title**: Clear, descriptive title
   - **Description**: Explain what the PR does
   - **Testing**: How you tested the changes
   - **Screenshots**: If UI changes are involved
   - **Checklist**: Ensure all items are completed

#### PR Review Process

1. **Self-review** your PR before requesting reviews
2. **Request reviews** from team members
3. **Address feedback** and push updates
4. **Wait for approval** from at least one team member
5. **Merge only after approval**

#### Merging the PR

1. **Use "Squash and merge"** for feature branches
2. **Use "Merge commit"** for hotfixes
3. **Delete the feature branch** after successful merge

### Best Practices

#### Before Starting Work
- Always pull latest changes from main
- Create a new branch for each feature/fix
- Use descriptive branch names

#### During Development
- Commit frequently with clear messages
- Keep commits focused and atomic
- Test your changes thoroughly
- Update documentation if needed

#### Before Creating PR
- Ensure all tests pass
- Code follows project style guidelines
- Self-review your changes
- Update any relevant documentation

#### Code Review
- Be constructive and respectful
- Focus on code quality and functionality
- Test the changes locally if needed
- Approve only when satisfied

### Emergency Hotfixes

For critical production issues:

1. **Create hotfix branch** from main:
   ```bash
   git checkout main
   git checkout -b hotfix/critical-issue-description
   ```

2. **Make minimal changes** to fix the issue
3. **Create PR** with high priority
4. **Get expedited review** from team
5. **Merge to main** and deploy immediately
6. **Cherry-pick** to development branches if needed



### Cleanup

After successful merge:
- Delete the feature branch locally:
  ```bash
  git checkout main
  git branch -d feature/your-feature-name
  ```
- Delete the remote branch (usually done automatically by PR merge)

---

