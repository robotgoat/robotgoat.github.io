---
title: "Setup Pihole Using Podman"
date: 2023-01-26
lastmod: 2023-01-26
author: "SpiffyGoose"
description: How to setup and configure Pihole using Podman containers in Fedora
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
- networking
- pihole
- podman
series:
- Linux
categories:
- networking
- containers
image: tux.png # thumbnail for home page left of title bmw-e38-logo.png or bmw-e46-logo.png
---

## Intro

Pihole is increasingly becoming one of the essential network tools installed in home networks among power users. Initially, it was created to run on the ever popular Rasperry Pi SBC running Rasperry Pi OS, a derivative of Ubuntu made for the Rpi. However, as many people have experienced, running Pihole on a Rpi is not the best solution. For starters, there is a shortage of Raspberry Pi SBC as of writing this post and from my experience, the Rpi frequently corrupts the SD card and sometimes even the flashdrive if you use it as your boot storage. Additionally, it is simply slow and yet another device that will occupy a port on your router or switch. 

Thankfully, the developers of Pihole have and maintain an official Docker image. This allows for far greater flexibility in how you can install Pihole. Many people have a dedicted server doing something on their network, so that makes it a perfect alternative to deploy Pihole. It can be installed directly on the host OS or through a container like Docker. 

This quick tutorial will show you how to install Pihole using an alternative container system called Podman, which comes preinstalled in Fedora Linux distributions and makes for a much quicker deployment. Podman functions just like Docker but also offers the option to run containers in rootless and daemonless manners.


## Setup Overview

Assuming you are on a Linux distro, the major steps for this guide are summarized below:

1. Create and configure a podman macvlan interface in root
2. Create a macvlan shim interface on the system
3. Create a rootful Pihole container configured to use the macvlan interface
4. Setup systemd services to persist Pihole and system macvlan shim on boot

{{< notice warning "Note" >}}
Though one of the main features of Podman is the ability to create rootless (user only) containers, we have to create Pihole as a rootful container because rootless containers cannot use the macvlan interface as specified in the docs: https://docs.podman.io/en/latest/markdown/podman-network-create.1.html
{{< /notice >}}

## Network Interface Setup

You may be asking, why do we need to use a macvlan interface? The simple answer to that is because the macvlan interface allows us to mount the Podman container as its own device on the network. This means the container gets its own IP address, ports, and such, just like a physical Raspberry Pi would. This allows for greater flexibility for a specific VLAN or router setup.

### Create Macvlan Interface
We must first create the macvlan podman interface as root. Before we do, there are a few things we have to take into account. As specified in the Podman docs, macvlan requires a few parameters: `parent, subnet, gateway, ip-range`. We essentially have to specifiy what addresses the macvlan interface can occupy. Assuming you want to keep the container and physical server on the same subnet, we have to cordone of a specific range for each. For my configuration, I want to give the macvlan containers the address range from 192 to 255. In CIDR notation it is `192.168.10.192/26`. You can of course use your own range. Do not forget to configure the DHCP address pool to stop at .191 for this subnet on your router to prevent any potential address conflict. Lastly, find the name of the physical network inferace on your server using a command like `netstat -i`. This is the parent interface

With that established, we can create the macvlan interface with:
``` bash
sudo podman network create \ 
    --driver macvlan \
    --opt parent=enp4s0 \
    --subnet 192.168.10.0/24 \
    --gateway 192.168.10.1 \
    --ip-range 192.168.10.192/26 mymacvlan
```

Then we can view that it was created with `sudo podman network ls`. You should get an output like this:
```
NETWORK ID    NAME        DRIVER
8ca18663813f  mymacvlan   macvlan
2f259bab93aa  podman      bridge
```

### Create Macvlan Shim
Before we create the container using this newly created macvlan interface, a shim interface has to be created on the server. This is necessary because if we were to use the macvlan podman network interface directly, you will find that the host (server) will not be able to communicate with your Pihole container. This is pretty important if you want all devices to use the Pihole as the DNS server. Therefore we must create a macvlan shim interface to work around this limitation of macvlans.

To create the shim interface:
```
sudo ip link add macnet-shim link enp4s0 type macvlan mode bridge
sudo ip addr add 192.168.10.193/26 dev macnet-shim
sudo ip link set macnet-shim up
```

This shim does not persist on boot, so to make it persistant we can make it a systemd process if using a systemd based distro. A simple service file would be:
```
[Unit]
After=network.target

[Service]
ExecStart=/usr/local/bin/pi-macvlanshim.sh

[Install]
WantedBy=default.target
```
Place this systemd service file in `/etc/systemd/system/macvlanshim.service`. Then you can enable it to start as a service on reboots with `sudo systemctl enable macvlanshim.service`. 


## Podman Pihole Setup

Creating a container with Podman is basically the same as in Docker. With all the proper networking setup, the command to create the pihole container in rootful mode is:

```bash
podman run -d \
--name pihole \
--cap-add=NET_ADMIN \
--net=mymacnet \
--ip=192.168.10.XXX \
-v "~/Containers/pihole/etc-pihole:/etc/pihole" \
-v "~/Containers/pihole/etc-dnsmasq.d:/etc/dnsmasq.d" \
--restart=unless-stopped \
--hostname Pihole \
--security-opt label=disable \
-e TZ="YOUR/TIMEZONE" \
-e FTLCONF_LOCAL_IPV4=192.168.10.XXX \
docker.io/pihole/pihole:latest
```

This will start up the container and you should be able access the Pihole web interface at the IP you specified in the container creation above. Lastly, you can setup the container to persist on reboots as a systemd service as well. To do this, create the service file with:

`sudo podman generate systemd --new --name CONTAINERNAME -f`

Replace CONTAINERNAME with the name you gave to your Pihole container in the creation step. Then move the service file to `/etc/systemd/service/` and enable it with `sudo systemctl enable container-CONTAINERNAME.service`. Finally, you need to configure your router to redirect traffic to the Pihole container's IP address to work as the new DNS server and ad blocker.