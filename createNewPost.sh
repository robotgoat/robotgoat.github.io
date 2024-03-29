#!/bin/bash

# Create new Hugo post

Help()
{
	# Help message
	echo "Script to create a new post in this Hugo website"
	echo 
	echo "Syntax: ./createNewPost Title-Of-Post"
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
hugo new --kind post-bundle posts/${TODAY}_${1}
