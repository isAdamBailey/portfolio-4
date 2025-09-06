---
title: "Run a PHPUnit Test Multiple Times and Log the Results"
date: 2022-07-25
description: "Loop a single PHPUnit test 100+ times from the shell and capture flaky failures into a log file for triage."
image: /logo-og.png
featured: true
---
# Consecutively Running a Single PHPUnit test
How to run a PHPUnit test multiple times, and log results.

Have you ever had tests fail randomly due to fake or random data? Sometimes it passes 5 times then fails once. Don't you wish you could just set one to run 100 times and walk away, checking the results later? This article outlines how to run a single test (or suite) in PHPUnit multiple times and log the results to its own file.

let's say you have this line that runs a single test:

```bash
./vendor/bin/phpunit tests/Unit/BlogTest.php
```


You run it by pressing the "up" key to find the command in your terminal and press enter. It passes! On a hunch, you run it again, and again. It passes!

But when your teammate runs it, it fails. Or it fails in your CI/CD pipeline. WHYYY????

Let's just run it a hundred times to make sure it won't fail.

Copy the code below and replace the test with your own test (I am running iTerm on macOSX):

```bash
 for run in {1..100}; do ./vendor/bin/phpunit tests/Unit/BlogTest.php &>> storage/logs/test.log; done
```

This runs the test you supply, as many times as you tell it in the for loop. Then it logs each result to a log in `storage/logs`

Enjoy!
