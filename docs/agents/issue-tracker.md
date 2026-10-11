# Issue tracker: GitHub

Issues and specifications for this repository live in GitHub Issues:

<https://github.com/Leulsamson/hospital-management-system/issues>

Use the `gh` CLI for issue operations while inside this repository.

## Common operations

```bash
gh issue create --title "..." --body "..."
gh issue view <number> --comments
gh issue list --state open
gh issue comment <number> --body "..."
gh issue edit <number> --add-label "..."
gh issue close <number> --comment "..."
```

Pull requests are not treated as a separate triage request surface by default.
