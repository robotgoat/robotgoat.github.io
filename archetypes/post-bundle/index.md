---
title: "{{ replace (replaceRE `^\d{4}_\d{2}_\d{2}_*` "" .Name) "-" " " | title }}"
date: {{ now.Format "2006-01-02" }}
lastmod: {{ now.Format "2006-01-02"}}
author: "SpiffyGoose"
description:
type: post
hideToc: false
enableToc: true
enableTocContent: false
tocFolding: false
tocPosition: inner
tocLevels: ["h2", "h3", "h4"]
pinned: false
draft: true
tags:
-
series:
-
categories:
-
image: # thumbnail for home page left of title
---
