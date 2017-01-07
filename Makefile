.PHONY: plugins/compile_katex
plugins/compile_katex:
	grep -rl "\\\(.*\\\)" static | xargs node plugins/compile_katex/compile_katex.js --css css/katex.css
