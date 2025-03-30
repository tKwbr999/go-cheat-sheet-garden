# Makefile for go-cheat-sheet-garden project

.PHONY: format-go-md, clean-branches

# Format Go code blocks within Markdown files
format-go-md:
	@echo "Formatting Go code blocks in Markdown files..."
	@bun run scripts/format-go-in-md.ts
	@echo "Formatting complete."

clean-branches:
	@echo "Cleaning up local branches..."
	@git checkout main
	@git branch | grep -v "main" | xargs -r git branch -D
	@echo "Local branch cleanup complete."