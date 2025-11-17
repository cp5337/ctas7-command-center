#!/usr/bin/env bash
# bulk-transfer-repos.sh
# Usage: ./bulk-transfer-repos.sh DEST_OWNER [repo1 repo2 ...]
# If no repo list passed, transfers all non-archived repos in org 5337.
set -euo pipefail

ORG="5337"
DEST_OWNER="${1:-}"
shift || true

if [ -z "$DEST_OWNER" ]; then
  echo "Usage: $0 DEST_OWNER [repo1 repo2 ...]"
  exit 1
fi

# If repos provided as args, use them; otherwise list all non-archived repos
if [ "$#" -gt 0 ]; then
  repos=("$@")
else
  echo "Fetching repo list for ${ORG}..."
  repos=($(gh repo list "${ORG}" --limit 1000 --json name,isArchived -q '.[] | select(.isArchived == false) | .name'))
fi

echo "About to transfer ${#repos[@]} repos from ${ORG} -> ${DEST_OWNER}"
read -p "Proceed? (y/N) " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Aborted."
  exit 0
fi

for repo in "${repos[@]}"; do
  echo "Transferring ${ORG}/${repo} -> ${DEST_OWNER}/${repo} ..."
  # Transfer via gh (requires you have admin on the repo)
  if gh repo transfer "${ORG}/${repo}" --to "${DEST_OWNER}"; then
    echo "Transfer requested for ${repo}."
  else
    echo "Transfer FAILED for ${repo}. Continuing to next repo."
  fi
  # Short sleep to avoid rate limits
  sleep 1
done

echo "Done. Verify transfers in GitHub UI for each repo."