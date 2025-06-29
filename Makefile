SHELL = /bin/bash
.SHELLFLAGS := -eu -o pipefail -c
.DEFAULT_GOAL := build
.DELETE_ON_ERROR:
.SUFFIXES:

build: pkg

.PHONY: setup-rust
setup-rust:
	set -ex; \
	if ! command -v rustc >/dev/null 2>&1; then \
		curl https://sh.rustup.rs -sSf | sh -s -- -y; \
	fi; \
	. "$HOME/.cargo/env" 2>/dev/null || true; \
	if ! command -v wasm-pack >/dev/null 2>&1; then \
		curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh; \
	fi; \

pkg: src-utility
	$(MAKE) setup-rust
	wasm-pack build --target bundler --scope dev-utility --out-name core --out-dir ../pkg src-utility --features web
	sed -i '.bak' -e 's/@dev-utility\/dev-utility-core/@dev-utility\/core/g' pkg/package.json
	rm pkg/package.json.bak

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