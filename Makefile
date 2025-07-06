SHELL = /bin/bash
.SHELLFLAGS := -eu -o pipefail -c
.DEFAULT_GOAL := build
.DELETE_ON_ERROR:
.SUFFIXES:

.PHONY: license
license:
	addlicense -f ./LICENSE dev-utility-workers
	addlicense -f ./LICENSE dev-utility-tauri
	addlicense -f ./LICENSE dev-utility

merge-license: LICENSE.FULL
	pnpm tsx merge-license

.PHONY: version
version:
	pnpm tsx version


CORE_NAME = core
CORE_PKG_DIR = packages/core
CORE_WASM_FILE = $(CORE_PKG_DIR)/$(CORE_NAME)_bg.wasm $(CORE_PKG_DIR)/$(CORE_NAME)_bg.wasm.d.ts
CORE_JS_FILE = $(CORE_PKG_DIR)/$(CORE_NAME).js $(CORE_PKG_DIR)/$(CORE_NAME)_bg.js $(CORE_PKG_DIR)/$(CORE_NAME).d.ts 
CORE_BUILD_OUTPUTS = $(CORE_WASM_FILE) $(CORE_JS_FILE) $(CORE_PKG_DIR)/package.json

CORE_SRC_FILES = $(shell find dev-utility -name "*.rs")
CORE_CARGO_TOML = dev-utility/Cargo.toml

core: $(CORE_BUILD_OUTPUTS)

$(CORE_BUILD_OUTPUTS): $(CORE_SRC_FILES) $(CORE_CARGO_TOML)
	wasm-pack build --target bundler --scope dev-utility --out-name $(CORE_NAME) --out-dir ../$(CORE_PKG_DIR) dev-utility
	sed 's/@dev-utility\/dev-utility-core/@dev-utility\/core/g' $(CORE_PKG_DIR)/package.json > $(CORE_PKG_DIR)/package.json.tmp
	mv $(CORE_PKG_DIR)/package.json.tmp $(CORE_PKG_DIR)/package.json
	rm packages/LICENSE

prebuild-desktop:
	make merge-license
	pnpm --filter @dev-utility/frontend build

build-desktop:
	pnpm tauri build

build-web: core
	WASM=true pnpm --filter @dev-utility/frontend build