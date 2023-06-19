#!/bin/bash
# no verbose
set +x
nextFolder='/app/.next'
# create the config file from environment variables
envFilename='override.conf'
echo "APP_NEXT_OSMOSIS_RPC=$URL_OSMOSIS_RPC" >> $envFilename
echo "APP_NEXT_OSMOSIS_REST=$URL_OSMOSIS_REST" >> $envFilename
echo "APP_NEXT_OSMOSIS_GQL=$URL_OSMOSIS_GQL" >> $envFilename
echo "APP_NEXT_OSMOSIS_TEST_RPC=$URL_OSMOSIS_TEST_RPC" >> $envFilename
echo "APP_NEXT_OSMOSIS_TEST_REST=$URL_OSMOSIS_TEST_REST" >> $envFilename
echo "APP_NEXT_OSMOSIS_TEST_GQL=$URL_OSMOSIS_TEST_GQL" >> $envFilename
echo "APP_NEXT_NEUTRON_TEST_RPC=$URL_NEUTRON_TEST_RPC" >> $envFilename
echo "APP_NEXT_NEUTRON_TEST_REST=$URL_NEUTRON_TEST_REST" >> $envFilename
echo "APP_NEXT_NEUTRON_TEST_GQL=$URL_NEUTRON_TEST_GQL" >> $envFilename
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
