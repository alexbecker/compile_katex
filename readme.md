# compile_katex

Provides a `compile_katex.js` script that statically runs `katex` on an HTML file and
replaces the `katex`-style LaTeX with HTML nodes. Much lighter weight than including
the whole `katex` library on a page with a little math, and works without JS on the client.

Usage:
```
node compile_katex.js [--css /path/to/katex.css] FILENAME
```
