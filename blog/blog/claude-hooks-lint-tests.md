---
title: "Using Claude Hooks to Run Lint and Tests Before Pushing Code"
date: 2026-04-29
description: "Claude hooks let you run lint and tests automatically before code leaves your machine. Here is why that matters and how to set it up."
image: /logo-og.png
featured: true
---

# Using Claude Hooks to Run Lint and Tests Before Pushing Code

If you use Claude Code as part of your development workflow, you have probably noticed that most of the safety net lives in the prompt. You ask Claude to run tests, Claude runs tests. You forget to ask, it does not. That gap is where Claude hooks come in.

Hooks are lifecycle callbacks you configure in Claude Code that run shell commands automatically at defined points in the agent loop—no reminder needed, no extra prompt required. This post covers how to use them to enforce lint and tests before code gets pushed, and why that matters beyond just convenience.

## What Are Claude Hooks

Hooks are entries in your Claude configuration (`.claude/settings.json` or `.claude/settings.local.json`) that tell Claude Code to run a command when a specific event fires. The main events are:

- `PreToolUse` — runs before Claude executes a tool call
- `PostToolUse` — runs after a tool call completes
- `Stop` — runs when the agent finishes a task
- `Notification` — fires when Claude sends a notification

Each hook receives context about what Claude is about to do or just did. You can use that context to allow, block, or log the action. If a hook exits with a non-zero status, Claude treats it as a hard block and will not proceed.

## Setting Up Lint and Tests Before a Push

The most useful pattern is blocking any `git push` until lint and tests pass. Here is a minimal setup.

In your project root, create or edit `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/pre-bash.js"
          }
        ]
      }
    ]
  }
}
```

Then create `.claude/hooks/pre-bash.js`:

```js
const input = JSON.parse(await new Promise(resolve => {
  let data = '';
  process.stdin.on('data', chunk => data += chunk);
  process.stdin.on('end', () => resolve(data));
}));

const cmd = input.tool_input?.command ?? '';

if (cmd.includes('git push')) {
  const { execSync } = await import('child_process');
  try {
    execSync('npm run lint', { stdio: 'inherit' });
    execSync('npm test', { stdio: 'inherit' });
  } catch {
    process.exit(1); // block the push
  }
}
```

When Claude tries to run `git push`, the hook fires first. If lint or tests fail, the hook exits with code 1 and the push never happens. Claude sees the failure and can report it back to you.

Adjust `npm run lint` and `npm test` to match your stack. For PHP projects, `./vendor/bin/phpstan analyse` and `./vendor/bin/phpunit` work the same way.

## Why This Is Better Than Prompt Context

The usual alternative is adding something like "always run lint and tests before pushing" to your CLAUDE.md or system prompt. That works until it does not. A few problems:

**Prompt instructions are suggestions.** They can be outweighed by other context, skipped when the model is working through a long chain of steps, or just missed when the conversation drifts.

**Hooks are code.** They run every time, regardless of what is in the prompt. You do not have to trust the model to remember your rule—you encode it in the project itself.

**Hooks are version controlled.** Commit `.claude/settings.json` and everyone on the team gets the same enforcement automatically. A CLAUDE.md instruction only helps if everyone has it and the model respects it.

**Hooks compose with your existing toolchain.** They run real shell commands, so you can reuse the same scripts CI already uses. There is no translation layer between what you ask in a prompt and what actually runs.

## Security Benefits

This is where hooks pay off beyond convenience.

**They close the gap between AI action and human review.** Without a hook, Claude can write a change, stage it, and push it in a single uninterrupted run. A lint hook creates a mandatory checkpoint. Anything that would normally cause a CI failure gets caught on your machine before it becomes a PR or a deploy.

**They block unsafe patterns before they leave your repo.** You can extend the pre-push hook to run a secrets scanner (`trufflehog filesystem .` or `git-secrets --scan`) in addition to lint. That means accidentally committed credentials or tokens are caught locally, not in a GitHub secret scan alert hours later.

**They reduce the blast radius of a misguided AI action.** Claude occasionally makes confident mistakes—pushing a breaking change, committing a debug statement, or ignoring a test file it was supposed to update. A failing test suite stops the push. You review, correct, and push manually. The hook does not judge intent; it just enforces the rule.

**They work even when you are not watching.** If you run Claude in a longer autonomous session, you may not catch every tool call in real time. Hooks act as a safety layer that does not require your attention to do its job.

## A Minimal Real-World Config

Here is a more complete example that covers lint, tests, and a basic secrets check before any push:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/pre-bash.js"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Claude finished. Review changes before pushing.'"
          }
        ]
      }
    ]
  }
}
```

And the hook script with secrets scanning added:

```js
const input = JSON.parse(await new Promise(resolve => {
  let data = '';
  process.stdin.on('data', chunk => data += chunk);
  process.stdin.on('end', () => resolve(data));
}));

const cmd = input.tool_input?.command ?? '';

if (cmd.includes('git push')) {
  const { execSync } = await import('child_process');
  try {
    execSync('npm run lint', { stdio: 'inherit' });
    execSync('npm test', { stdio: 'inherit' });
    execSync('git-secrets --scan', { stdio: 'inherit' });
  } catch {
    process.exit(1);
  }
}
```

Keep the hook fast. If tests take five minutes, a pre-push hook becomes a blocker rather than a safety net. A good split is running only the affected test suite in the hook and letting full CI cover the rest.

## What Hooks Are Not

Hooks are not a substitute for code review or CI. They are a local enforcement layer. CI should still run the full suite on every PR. A hook just means you catch the obvious stuff before it ever gets there.

They are also not magic. A hook that calls `exit 0` unconditionally is useless. Keep the script minimal, readable, and easy to audit. If a teammate cannot understand it in thirty seconds, it will get deleted or bypassed.

## Closing

Prompt context is a good start, but hooks are the step that makes AI-assisted development actually reliable. They are small, composable, and version controlled. Set one up on your next project and you will stop thinking about whether Claude remembered your rules.

Happy building.
