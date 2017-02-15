.PHONY: local/plugins/compile_katex
local/plugins/compile_katex:
	grep -rl "\\\(.*\\\)" static | xargs node local/plugins/compile_katex/compile_katex.js --css css/katex.css
