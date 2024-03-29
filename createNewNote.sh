#!/bin/bash

# Create new Hugo post

Help()
{
	# Help message
	echo "Script to create a new note in this Hugo website"
	echo 
	echo "Syntax: ./createNewNote Title-Of-Note"
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
hugo new --kind note-bundle notes/${TODAY}_${1}
