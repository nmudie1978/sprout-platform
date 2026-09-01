#!/usr/bin/env bash
#
# Create an isolated git worktree for a piece of work.
#
# WHY THIS EXISTS
#
# Several sessions/agents share this checkout. When two are active at once,
# one switching branches yanks the ground out from under the other: files
# change mid-edit, and commits made on the old branch stop being reachable
# from HEAD. That happened twice in a single day — once discarding a finished,
# tested commit that had to be recovered from the object store by hash.
#
# A worktree gives each piece of work its own directory and its own checked-out
# branch, sharing one .git. Two sessions then cannot disturb each other's files
# or HEAD, which is the entire failure mode.
#
# USAGE
#   ./scripts/new-worktree.sh fix/some-thing          # branch from origin/main
#   ./scripts/new-worktree.sh feat/x origin/some-base # branch from elsewhere
#
set -euo pipefail

BRANCH="${1:-}"
BASE="${2:-origin/main}"

if [[ -z "$BRANCH" ]]; then
  echo "usage: $0 <branch-name> [base-ref]" >&2
  echo "example: $0 fix/verification-copy" >&2
  exit 1
fi

REPO_ROOT="$(git rev-parse --show-toplevel)"
REPO_NAME="$(basename "$REPO_ROOT")"
# Sibling of the repo, name-mangled so branches with slashes are safe.
DEST="${REPO_ROOT}/../${REPO_NAME}-wt-${BRANCH//\//-}"

if [[ -e "$DEST" ]]; then
  echo "✋ $DEST already exists." >&2
  echo "   Either use it, or remove it with: git worktree remove '$DEST'" >&2
  exit 1
fi

echo "→ fetching $BASE"
git fetch origin --quiet

if ! git rev-parse --verify --quiet "$BASE" >/dev/null; then
  echo "✋ base ref '$BASE' not found." >&2
  exit 1
fi

echo "→ creating worktree at $DEST"
if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  # Branch exists already — check it out rather than trying to recreate it.
  git worktree add "$DEST" "$BRANCH"
else
  git worktree add -b "$BRANCH" "$DEST" "$BASE"
fi

# Dependencies and env aren't tracked, so a fresh worktree can't build without
# them. Symlink node_modules (identical lockfile) and copy .env.
if [[ -d "$REPO_ROOT/node_modules" && ! -e "$DEST/node_modules" ]]; then
  ln -s "$REPO_ROOT/node_modules" "$DEST/node_modules"
  echo "→ linked node_modules"
fi
for f in .env .env.local; do
  if [[ -f "$REPO_ROOT/$f" && ! -f "$DEST/$f" ]]; then
    cp "$REPO_ROOT/$f" "$DEST/$f"
    echo "→ copied $f"
  fi
done

cat <<EOS

✅ Worktree ready.

   cd $DEST

   It has its own branch ($BRANCH) and its own working files, so another
   session switching branches in the main checkout cannot disturb it.

   Note: .env was copied, so DATABASE_URL still points at PRODUCTION.
   See docs/local-database.md.

   When finished:
     git -C "$REPO_ROOT" worktree remove "$DEST"

EOS
