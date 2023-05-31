---
title: "Frigate NVR Setup With Homeassistant Using Podman"
date: 2023-05-24
lastmod: 2023-05-31
author: "SpiffyGoose"
description: Guide for setting up a rootless containerized instance of Frigate NVR interfaced with Homeassistant using Podman
type: post
hideToc: false
enableToc: true
enableTocContent: false
tocFolding: false
tocPosition: inner
tocLevels: ["h2", "h3", "h4"]
pinned: false
draft: false
tags:
- podman
series:
- Linux
categories:
- containers
image: tux.png # thumbnail for home page left of title bmw-e38-logo.png or bmw-e46-logo.png
---

## Intro
Video surveillence software has come a long way since the days of analog CCTV cameras and dedicated NVR units that used propietary software and annoying licenses. Now there's quite a variety of free and open source alternatives that have no such restrictions - the caveat being you have to spend time learning how it works and do your own troubleshooting if problems arise. With the ability to use cheap IP cameras on the market, using these open source NVR software is very appealing. 

One of the best NVR software that has emerged as of recent is the one called [Frigate NVR](https://github.com/blakeblackshear/frigate). With Frigate, there are no weird freemium paid plans or antsy devs like you see with Shinobi, and its strong integration with Homeassistant makes it all the more appealing. The other added benefit is Frigate is designed to be deployed as a Docker container, which makes migrating your data and configs super easy between server updates. 

This guide will show you how to install and configure Frigate not using Docker, instead using Podman. With Podman, we will setup Frigate to run in the user space as a rootless container. We will also configure Homeassistant and Eclipse MQTT Podman containers in rootless mode to work with Frigate to enable alerts and remote viewing of your cameras in real time. 


## Create a Podman Pod and Containers
Podman is a great alternative to Docker that allows one to run containers in rootless mode, an argueably a safer way to run them. A neat feature in Podman is the ability to create groups called pods. Pods allow for an easy way for all the containers running in the same pod to share network connectivity. For this use case with Frigate, HA, and MQTT, it is most useful. By placing all of our containers in this pod, we do not have to worry about what internal address is being given to each container. Instead, we can simply use localhost (127.0.0.1) and the required port to communicate between containers in the same pod. 

With the rationale for creating pods established, we first create the pod. Pods group containers to allow the sharing of resources such as networks space. Creating a pod is very similar to creating a container:

```bash
podman pod create 
    --name hapod \
    --network=slirp4netns:port_handler=slirp4netns \
    -p 8123:8123 \
    -p 1883:1883 \
    -p 9001:9001 \
    -p 5000:5000 \
    -p 1935:1935 \
    --security-opt label=disable
```

Since all containers are run in rootless, the pod is also rootless and therefore we use the `slip4netns` network interface. The port mappings will remain the same for all the services as they are all in the unrestricted range. Check that your pod was created with `podman pod ls`. The ports specified above correspond to the services that will run in the pod.

### Create Mosquitto Container

```bash
podman run -d \
    --name mosquitto \
    --pod=hapod \
    --restart=no \
    -v "SOMEPATH/Containers/mosquitto/config:/mqtt/config" \
    -v "SOMEPATH/Containers/mosquitto/data:/mqtt/data" \
    -v "SOMEPATH/Containers/mosquitto/log:/mqtt/log" \
docker.io/library/eclipse-mosquitto
```

### Create Frigate Container

The configuration for the Frigate container is a bit more involved and dependent on your host's hardware. The parameters such as `shm-size` and `LIBVA_DRIVE_NAME` will depend on the kind of graphics hardware and camera settings you have. Additionally, there is a specific paramter if you are using the Google Coral USB accelerator. Please refer to the Frigate docs for more details. 

```bash
podman run -d \
  --name frigate \
  --pod=hapod \
  --restart=no \
  --security-opt label=disable \
  --mount type=tmpfs,target=/tmp/cache,tmpfs-size=1000000000 \
  --device /dev/dri/renderD128 \
  --shm-size=64m \
  -v "PATHTODRIVE/frigate:/media/frigate" \
  -v "PATHTODRIVE/frigate/config/config.yml:/config/config.yml:ro" \
  -v "/etc/localtime:/etc/localtime:ro" \
  -e FRIGATE_MQTT_USER="MAKEUPUSER" \
  -e FRIGATE_RTSP_PASSWORD="MAKEUPAPASSWORD" \
  -e LIBVA_DRIVER_NAME=radeonsi ghcr.io/blakeblackshear/frigate:stable
```


### Create Homeassistant Container

```bash
podman run -d \
    --name homeassistant \
    --pod=hapod \
    --restart=no \
    -v "SOMEPATH/Containers/homeassistant/config:/config" \
    -e TZ="YOUR/TIMEZONE" ghcr.io/home-assistant/home-assistant:stable
```

## Persist Rootless Containers

Because the containers are running in rootless mode in the local user space, they will not persist when the user logs off. This is obviously not what we want for Home Assistant and Frigate, which is meant to run 24/7. To make them persist as rootless, the containers have to be made into systemd processes and enable linger.

### Create Systemd Processes

If you put the continers in a pod, you only need to run one command:

```bash
podman generate systemd --new --name PODNAME -f
```

This creates individual files for each container and the pod with the prefix of `container-xxxxxx.service`. For rootless, move those files to the `~/.config/systemd/user/` directory. Then, enable the service with `systemctl --user daemon-reload`. Then enable the pod with `systemctl --user enable PODNAME.service`. Lastly, linger mode needs to be enabled with `sudo loginctl enable-linger`. There you have it.