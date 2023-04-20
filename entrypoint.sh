#!/bin/bash
# no verbose
set +x
nextFolder='/app/.next'
# create the config file from environment variables
envFilename='override.conf'
echo "APP_NEXT_NETWORK=$NETWORK" >> $envFilename
echo "APP_NEXT_GQL=$URL_GQL" >> $envFilename
echo "APP_NEXT_REST=$URL_REST" >> $envFilename
echo "APP_NEXT_RPC=$URL_RPC" >> $envFilename
function apply_path {
  # read all config file  
  while read line; do
    # no comment or not empty
    if [ "${line:0:1}" == "#" ] || [ "${line}" == "" ]; then
      continue
    fi
    
    # split
    configName="$(cut -d'=' -f1 <<<"$line")"
    configValue="$(cut -d'=' -f2 <<<"$line")"
    
    # replace all config values in built app with the ones defined in override
    find $nextFolder \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#$configName#$configValue#g"
    
  done < $envFilename
}
apply_path
exec "$@"
