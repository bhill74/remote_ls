#!/bin/bash

# ************************************************************
# Name: get_cookies()
# Description: Retrieve the cookies that pertain to the specific
# host and user.
# Arguments:
# file -- The file the cookies are stored in.
# host -- The host the cookies were issued by.
# user -- The user login the cookies pertain to.
# Return:
# The relevant cookies concatentated together into a single line.
# ************************************************************
function get_cookies() {
	local file=$1
	local host=$2
	local user=${3:-$USER}
	grep auth $file | awk '{print $6 "=" $7}' | while read cookie; do echo -n "${cookie}; "; done
}

# ************************************************************
# Name: complete()
# Description: Retrieve all matching paths for the given path
# from the remote server.
# Arguments:
# info -- The user, host and path information.
# Return:
# The matching paths from the corresponding host.
# ************************************************************
function complete() {
	# Set the mask to make sure all temporary files are only readable by 
	# the current user.
	local mask=177

	# Process the remote information. 
	local host=$(echo $1 | cut -f1 -d:)
	local path=$(echo $1 | cut -f2 -d:)
	local user=$USER
	if [[ $host =~ "@" ]]; then
		user=$(echo $host | cut -f1 -d@)
		host=$(echo $host | cut -f2 -d@)
	fi

	# Resolve the remote server.
	local access=$(grep "^$host-" ~/.remote_ls | cut -f2 -d- | tail -1)
	local server_host=$host
	local server_port=80
	if [[ $access =~ ":" ]]; then
		server_host=$(echo $access | cut -f1 -d:)
		server_port=$(echo $access | cut -f2 -d:)
	fi

	local new_file=$(mktemp /tmp/remote_ls_XXXXXX)
	local access_file=${CKF:-${new_file}}
	local server=http://${server_host}:${server_port}

	(umask $mask && touch $access_file)
	local cookies=$(get_cookies ${access_file} ${server_host})

	local pass=1
	if [ -z "$cookies" ]; then
		pass=0	
	else
		id=$(curl -s --cookie "${cookies}" ${server}/check)
		if [[ $id != $USER ]]; then
			pass=0
		fi
	fi

echo "$user - $server_host:$server_port - $path - $pass"

	if [[ $pass -eq 0 ]]; then
		local passwd_file=$(mktemp /tmp/access_XXXXXX)
		(umask $mask && touch $passwd_file)
		local passwd=$(zenity --password 2>/dev/null)
		echo "machine ${server_host}" >> $passwd_file
		echo "login ${user}" >> $passwd_file
		echo "password ${passwd}" >> $passwd_file
		curl --netrc-file "${passwd_file}" --cookie-jar "${access_file}" "${server}/auth"
		rm ${passwd_file}
		cookies=$(get_cookies ${access_file} ${server_host})
	fi

ls -l $access_file
		
	curl -s --cookie "${cookies}" ${server}/path${path}
	export CKF=${access_file}
}
