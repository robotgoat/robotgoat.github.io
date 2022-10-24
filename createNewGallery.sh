#!/bin/bash

# Create new Hugo post

Help()
{
	# Help message
	echo "Script to create a new gallery in this Hugo website"
	echo 
	echo "Syntax: ./createNewGallery Title-Of-Gallery"
	echo "Ensure spaces in title are replaced with dashes"
	echo
}


while getopts ":h" option; do
	case $option in
		h)
			Help
			exit;;
	esac
done

TODAY=$(date "+%Y_%m_%d")
hugo new --kind gallery-bundle gallery/${TODAY}_${1}
mkdir static/gallery/${TODAY}_${1}
