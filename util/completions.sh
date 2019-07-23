. ./utils.sh

function _remote_complete()
{
	if [[ ${COMP_WORDS[-1]} =~ "^-" ]]; then
		return
	fi

	if [ "${COMP_WORDS[-2]}" != ":" ]; then
		COMPREPLY=($(compgen -W "$(_remote_hosts && _local_ls ${COMP_WORDS[-1]})" -- ${COMP_WORDS[-1]}))
		return
	fi

	local address="${COMP_WORDS[-3]}:${COMP_WORDS[-1]}"
#_remote_paths ${address} 1 >> a.txt
	COMPREPLY=($(compgen -W "$(_remote_paths ${address})" -- ${COMP_WORDS[-1]}))
}

complete -F _remote_complete rcp
complete -F _remote_complete scp
