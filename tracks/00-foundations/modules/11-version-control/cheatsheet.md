# Cheat sheet — Git & Working in the Open

*Companion to [Module 11 — Version Control & Working in the Open](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Daily driver

```bash
git status                        # what's staged, changed, untracked — run it constantly
git add file          # stage one file   (git add -p to stage hunks selectively)
git add -A                        # stage everything (careful — see the secrets note)
git commit -m "message"           # commit staged changes
git commit -am "message"          # stage tracked-file changes AND commit (skips new files)
git log --oneline --graph -20     # compact history with branch structure
git diff                          # unstaged changes   (git diff --staged for staged)
git show <commit>                 # what one commit changed
```

## Branches

```bash
git switch -c feature/x           # create and switch (modern; git checkout -b is the old form)
git switch main                   # move between branches
git branch -d feature/x           # delete a merged branch (-D to force)
git merge feature/x               # merge a branch into the current one
git rebase main                   # replay your commits on top of updated main
```

## Syncing with a remote

```bash
git clone <url>
git remote -v                     # what remotes exist
git fetch                         # download refs WITHOUT changing your files
git pull                          # fetch + merge into current branch
git push                          # push current branch
git push -u origin feature/x      # first push of a new branch (sets upstream)
```

## The undo / recovery moves (the ones people panic-search)

```bash
git restore file                       # discard unstaged changes to a file (was: checkout --)
git restore --staged file              # unstage, keep the edit
git commit --amend                     # fix the LAST commit's message or contents
git reset --soft HEAD~1                # undo last commit, KEEP changes staged
git reset HEAD~1                       # undo last commit, keep changes unstaged
git reset --hard HEAD~1                # undo last commit, DISCARD changes  ← destructive
git revert <commit>                    # undo a commit by making a NEW inverse commit (safe on shared history)
git stash / git stash pop              # shelve changes, then bring them back
git reflog                             # the safety net — every HEAD move; recover "lost" commits
```

- **`revert` vs `reset`:** `revert` adds a new commit that undoes an old one — safe on branches
  others have pulled. `reset` rewrites history — only on commits you haven't shared. Rewriting
  pushed history forces everyone downstream to recover manually.
- **`git reflog` is the undo for your undo.** Almost nothing is truly lost for ~90 days — even after
  a bad `reset --hard`, the old commit is still findable here.

## Keeping secrets out (the security-critical part)

```bash
cat .gitignore                    # patterns git ignores: *.pem, *.key, .env, *.pcap ...
git rm --cached file              # stop tracking a file WITHOUT deleting it locally
git log --all --oneline -- path/to/secret   # was this file ever committed?
git diff --staged                 # ALWAYS review before committing — catch the accidental key
```

- A secret committed once lives in history **forever**, even if the next commit deletes it — anyone
  who clones the repo gets it. `git rm` on a later commit does **not** remove it from history.
- If you push a real secret: **rotate/revoke it first** (assume it's compromised), then scrub history
  with `git filter-repo` or the GitHub secret-scanning flow. Removal is damage control, not a fix.
- Prefer `git add -p` over `git add -A` so you *see* every hunk you're committing — the single best
  habit for not shipping a `.env`.

## Collaborating on GitHub (gh CLI)

```bash
gh auth login
gh repo clone owner/repo
gh pr create --fill               # open a PR from the current branch
gh pr status                      # PRs involving you
gh pr checkout 42                 # check out someone's PR locally to review it
```

## Gotchas worth remembering

- `git commit -am` stages **modified tracked files only** — brand-new files still need `git add`.
  "My new file didn't get committed" is almost always this.
- `git pull` with local changes can trigger a merge or conflict mid-stream; `git fetch` then a
  deliberate `merge`/`rebase` keeps you in control.
- Your commits are stamped with `user.name` / `user.email` (`git config user.email`) — set them per
  project so a work identity doesn't leak into a personal repo, or vice versa.
