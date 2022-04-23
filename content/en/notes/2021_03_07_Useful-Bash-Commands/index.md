---
title: "Useful Bash Commands"
date: 2021-03-07
lastmod: 2022-04-23
author: "SpiffyGoose"
description: Random but useful Linux bash commands
type: note
hideToc: false
enableToc: true
enableTocContent: false
tocFolding: false
tocPosition: inner
tocLevels: ["h2", "h3"]
pinned: false
draft: false
tags:
- linux
series:
-
categories:
-
image: note-logo.png
---

## Archiving

### Archive and compress files to tar and xz 
```bash
tar -I pxz -cf NAME-OF-COMPRESSED-FILE.tar.xz SOURCEDIRECTORY/
```

### When using pigz for parallel gz compresion 
```bash
tar -c --use-compress-program=pigz -f NAME.tar.gz directory/
```

### Create tar.xz with more options
The `-9` signifies compression level from 1 - 9, with 9 being highest compression. It is preferable to use 4-5 for best peformance to compression tradeoff. The `-T` is CPU cores. 0 uses all cores.
```bash
tar -c -I 'xz -9 -T0' -f archivename.tar.xz filesAndor directories/
```

## General Disk Management

These can be useful when managing a remote server

### View disk info on system

```bash
sudo lsblk -o NAME,SIZE,FSTYPE,LABEL,UUID,MOUNTPOINT
```

### Manage disk with fdisk
Where {} is the identifier for the disk of interest
```bash
sudo fdisk /dev/sd{}
```

### Get disk UUID and info

```bash
sudo blkid
```

### Format new partition to ext4
Where x is the disk identifier and n is the partition number
```bash
sudo mkfs.ext4 /dev/sdxn
``` 

### Change partition label
```bash
sudo e2label /dev/sdxn NAME
```


## Fun with directories

### Replace all directory names with spaces with underscores
```bash
for f in *\ *; do mv "$f" "${f// /_}"; done
```
