---
title: "{{ replace (replaceRE `^\d{4}_\d{2}_\d{2}_*` "" .Name) "-" " " | title }}"
date: {{ now.Format "2006-01-02" }}
lastmod: {{ now.Format "2006-01-02"}}
author: "SpiffyGoose"
description:
type: gallery
mode: at-once #at-once or one-by-one
draft: false
tags:
-
series:
-
categories:
-
image: # thumbnail image
---
