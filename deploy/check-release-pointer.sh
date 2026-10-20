#!/usr/bin/env bash
# Exercise the installer's actual pointer resolver using disposable directories.
# No root privileges, service operations, or production paths are involved.
set -euo pipefail

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)
check_dir=$(mktemp -d "${TMPDIR:-/tmp}/fitness-release-pointer.XXXXXX")
check_dir=$(cd "$check_dir" && pwd -P)
trap 'rm -rf -- "$check_dir"' EXIT

awk '$0 == "resolve_previous_release() {" { reading=1 } reading { print } reading && $0 == "}" { exit }' \
  "$script_dir/install.sh" > "$check_dir/actual-function.sh"
source "$check_dir/actual-function.sh"
declare -F resolve_previous_release >/dev/null

app_root="$check_dir/app"
mkdir -p "$app_root/releases/previous" "$app_root/releases/first" "$check_dir/outside"
previous_release=$(resolve_previous_release "$app_root")
[[ -z "$previous_release" ]] || { echo 'FAIL: first deployment captured a nonexistent release'; exit 1; }

# Simulate the point after first activation: the saved value must remain empty.
ln -s "$app_root/releases/first" "$app_root/current"
if [[ -n "$previous_release" && -d "$previous_release" ]]; then action=rollback; else action=stop; fi
[[ "$action" == stop ]] || { echo 'FAIL: first deployment selected a false rollback'; exit 1; }
[[ "$(readlink "$app_root/current")" == "$app_root/releases/first" ]] || exit 1
printf 'PASS: first deployment preserves an empty previous release and selects stop on failure\n'

rm "$app_root/current"
ln -s "$app_root/releases/previous" "$app_root/current"
[[ "$(resolve_previous_release "$app_root")" == "$app_root/releases/previous" ]] || exit 1
printf 'PASS: an existing managed release is eligible for rollback\n'
rm "$app_root/current"

for target in "$app_root/releases/missing" "$app_root/current" "$check_dir/outside" "$app_root/releases"; do
  ln -s "$target" "$app_root/current"
  if resolve_previous_release "$app_root" >/dev/null 2>&1; then
    printf 'FAIL: accepted invalid pointer %s\n' "$target"
    exit 1
  fi
  rm "$app_root/current"
done
printf 'PASS: dangling, self-referential, external and releases-root pointers are rejected\n'

mkdir "$app_root/current"
if resolve_previous_release "$app_root" >/dev/null 2>&1; then
  echo 'FAIL: accepted a directory instead of a current symlink'
  exit 1
fi
printf 'PASS: a regular directory cannot be used as the current pointer\n'
