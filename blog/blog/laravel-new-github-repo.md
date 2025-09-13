---
title: "Create a GitHub Repo During “laravel new” (GitHub CLI)"
date: 2021-10-31
description: "Use the Laravel installer with --github and GitHub CLI to initialize a repo, set main as the branch, and choose visibility automatically."
image: /logo-og.png
categories: [laravel, configuration]
---
# Create GitHub Repo on a New Laravel Project
This year, Laravel added a new feature to easily create a new git repository when creating a new project.
This article explains how to use the GitHub CLI to go even further.

## Installing GitHub CLI

In order to utilize the GitHub tooling for the laravel installer, you'll need to have `git` already installed, as well
as [GitHub CLI](https://cli.github.com/) installed globally.
>GitHub CLI brings GitHub to your terminal. Free and open source.

I simply installed the CLI using Homebrew, with `brew install gh` in the terminal. After installation, restart your
terminal, and continue with the Laravel installation.

## Installing Laravel

First, you'll need a basic understanding of how to install Laravel, and you'll need [Composer](https://getcomposer.org/)
installed beforehand. For the purposes of this article, we'll be building on macOS and using GitHub.
You may use the [official Laravel documentation](https://laravel.com/docs/installation) to get you started.

To initialize git, you can now just supply a flag on the Laravel installer command. We will be focusing on the GitHub
portion of this [Laravel installation](https://laravel.com/docs/installation#the-laravel-installer).

## Initializing GitHub

To create a new repository on GitHub when installing the new Laravel project, simply supply the `--github` flag as follows:

```bash
laravel new example-app --github
```

This will put your new project in a private repository at `https://github.com/<your-account>/example-app`.

To change the initial branch name to use `main`:

```bash
laravel new example-app --github --branch="main"
```

To make your repo public, add the `--public` flag:

```bash
laravel new example-app --github="--public"
```

## Conclusion

That's about all there is to it! This saves a lot of time (and potential Googling) trying to set up a new repo and
initialize git with a new Laravel project.

Happy coding!
