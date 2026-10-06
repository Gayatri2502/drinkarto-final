# Development workflow

`main` is the reviewed, integrated branch. Make product changes on a short-lived branch and merge to `main` after the work for the day has been reviewed and verified.

```bash
git switch main
git pull --ff-only
git switch -c work/short-description
# make and verify changes
git add <files>
git commit -m "Describe the change"
git push -u origin work/short-description
```

Open a pull request from the work branch to `main`. Run the checks in the pull request, review the diff and merge at the end of the day when the day’s changes are complete. Do not put credentials or local database dumps in a branch. Use `.env.example` to document variable names, and set real values through local ignored `.env` files or the hosting platform’s secret manager.
