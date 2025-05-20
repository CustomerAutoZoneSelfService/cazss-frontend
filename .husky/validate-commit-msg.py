#!/usr/bin/env python3

import sys
import re

if len(sys.argv) < 2:
    print("❌ Error: Commit message file argument is missing.")
    sys.exit(1)

commit_message_file = sys.argv[1]

try:
    with open(commit_message_file, 'r') as f:
        commit_message = f.readline().strip()
except FileNotFoundError:
    print(f"❌ Error: Commit message file not found: {commit_message_file}")
    sys.exit(1)

# Allowed commit types (case-insensitive)
types = "refactor|feature|feat|bugfix|docs|chore|bug|hotfix"

# Regex pattern
pattern = rf"^({types}): .+ \(([A-Z]+-[0-9]+)(, [A-Z]+-[0-9]+)*\)$"

if re.match(pattern, commit_message, flags=re.IGNORECASE):
    sys.exit(0)
else:
    print(f"❌ Error: Invalid commit message:\n   \"{commit_message}\"")
    print("   Format must be: <type>: <message> (TICKET-ID[, TICKET-ID...])")
    print("   - Types allowed (case-insensitive): " + types.replace('|', ', '))
    print("   - Ticket IDs must be uppercase, e.g., TI-123")
    print("   Example 1: feat: improve login UX (TI-123, UI-456)")
    print("   NOTE: the space between the colon and the next word matters!")
    sys.exit(1)
