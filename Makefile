test t:
	NODE_ENV=test mocha -r espower-typescript/guess -r jsdom-global/register -r test/env test/**/*.test.ts

build b:
	npx webpack --config webpack.config.js

.PHONY: test