SHELL = /bin/bash
.SHELLFLAGS := -eu -o pipefail -c
.DEFAULT_GOAL := build
.DELETE_ON_ERROR:
.SUFFIXES:

build: pkg

.PHONY: setup-rust

pkg: dev-utility
	wasm-pack build --target bundler --scope dev-utility --out-name core --out-dir ../pkg dev-utility
	sed 's/@dev-utility\/dev-utility-core/@dev-utility\/core/g' pkg/package.json > pkg/package.json.tmp
	mv pkg/package.json.tmp pkg/package.json

prebuild-desktop:
	pnpm merge-license
	pnpm --filter @dev-utility/frontend build

build-desktop:
	pnpm tauri build

build-web: pkg
	WASM=true pnpm --filter @dev-utility/frontend build

.PHONY: license
license:
	addlicense -f ./LICENSE dev-utility-workers
	addlicense -f ./LICENSE dev-utility-tauri
	addlicense -f ./LICENSE dev-utility

.PHONY: version
version:
	pnpm tsx version

merge-license: LICENSE.FULL
	pnpm tsx merge-license