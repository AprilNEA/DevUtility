SHELL = /bin/bash
.SHELLFLAGS := -eu -o pipefail -c
.DEFAULT_GOAL := build
.DELETE_ON_ERROR:
.SUFFIXES:

build: pkg

.PHONY: setup-rust

pkg: src-utility
	wasm-pack build --target bundler --scope dev-utility --out-name core --out-dir ../pkg src-utility
	sed 's/@dev-utility\/dev-utility-core/@dev-utility\/core/g' pkg/package.json > pkg/package.json.tmp
	mv pkg/package.json.tmp pkg/package.json

prebuild-desktop:
	pnpm merge-license
	pnpm build

build-desktop:
	pnpm tauri build

build-web: pkg
	pnpm build

.PHONY: license
license:
	addlicense -f ./LICENSE src-tauri
	addlicense -f ./LICENSE src-utility
	addlicense -f ./LICENSE src

version:
	pnpm run version

merge-license:
	pnpm run merge-license