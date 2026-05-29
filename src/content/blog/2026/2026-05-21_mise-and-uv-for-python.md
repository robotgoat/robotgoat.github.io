---
title: Mise and UV for Python
description: A workflow tip to use UV and Mise
pubDate: May 21 2026
heroImage: "/src/assets/pc.png"
tags: ["musings"]
badge: ""
---

## The Problem 

Since Conda is controversial, poetry is now not as popular, Volta is being deprecated, the question for the next meta in Python project management for reproducibility strikes again. 
In my searches, I have found that the best answer to this is to use Mise and UV together.

## The Solution

The quick steps are:

1. initialize project with UV using `uv init DIRECTORY_NAME`
1. use mise to associate a python version for the project with `mise use python`. this is on per project basis and creates the mise.toml file in the project directory
1. install any extra python packages with uv 
1. run project using uv run main.py
1. optionally use uv to make it a package

## Sanity Checks

Verify current Python with `mise current python`.
