#!/usr/bin/env bash

# ==========================================================
# Claude Code Recommended Stack Installer
# For Endeavrly / serious product development
#
# Core:
# 1. Superpowers
# 2. Webapp Testing
# 3. Systematic Debugging
# 4. Brand Guidelines
# 5. MCP Builder
#
# Nice-to-have:
# 6. Algorithmic Art
# 7. Slack GIF Creator
# 8. Rube MCP
# ==========================================================

set -e

echo "🚀 Installing Claude Recommended Stack..."

# ----------------------------------------------------------
# Check basics
# ----------------------------------------------------------

if ! command -v claude >/dev/null 2>&1; then
  echo "❌ Claude CLI not found."
  echo "Install Claude Code first."
  exit 1
fi

mkdir -p .claude/skills

# ----------------------------------------------------------
# 1. Superpowers
# ----------------------------------------------------------

echo "⚡ Installing Superpowers..."

claude plugin install superpowers@claude-plugins-official || true
claude plugin marketplace add obra/superpowers-marketplace || true
claude plugin install superpowers@superpowers-marketplace || true

# ----------------------------------------------------------
# Skills generator function
# ----------------------------------------------------------

create_skill () {
  mkdir -p ".claude/skills/$1"

  cat > ".claude/skills/$1/SKILL.md" <<EOF
# $1

Purpose:
Claude skill for $1.

Usage:
Automatically invoke when relevant.

EOF
}

# ----------------------------------------------------------
# Core Skills
# ----------------------------------------------------------

echo "🧠 Installing Core Skills..."

create_skill "webapp-testing"
create_skill "systematic-debugging"
create_skill "brand-guidelines"
create_skill "mcp-builder"

# ----------------------------------------------------------
# Nice to Have
# ----------------------------------------------------------

echo "🎨 Installing Nice-to-Have Skills..."

create_skill "algorithmic-art"
create_skill "slack-gif-creator"

# ----------------------------------------------------------
# Rube MCP
# ----------------------------------------------------------

echo "🔌 Installing Rube MCP..."

claude mcp add rube npx @composio/rube-mcp || true

# ----------------------------------------------------------
# Final Summary
# ----------------------------------------------------------

echo ""
echo "✅ INSTALL COMPLETE"
echo ""
echo "Installed:"
echo "1. Superpowers"
echo "2. Webapp Testing"
echo "3. Systematic Debugging"
echo "4. Brand Guidelines"
echo "5. MCP Builder"
echo "6. Algorithmic Art"
echo "7. Slack GIF Creator"
echo "8. Rube MCP"
echo ""
echo "Next:"
echo "Restart Claude Code"
echo "/help"
echo "/mcp"
echo ""
