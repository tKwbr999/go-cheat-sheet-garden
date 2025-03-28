# Makefile for go-cheat-sheet-garden project

.PHONY: format-go-md

# Format Go code blocks within Markdown files
format-go-md:
	@echo "Formatting Go code blocks in Markdown files..."
	@bun run scripts/format-go-in-md.ts
	@echo "Formatting complete."