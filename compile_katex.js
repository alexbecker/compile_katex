#! /usr/bin/env node
var fs = require("fs");
var katex = require("katex");

var argv = require("minimist")(process.argv.slice(2));
var katexCSS = argv.css || "//cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css";

var inlineRE = /\\\(.*?\\\)/s;
var displayRE = /(\$\$.*?\$\$)|(\\\[.*?\\\])/s;
var skipTags = ["SCRIPT", "STYLE", "CODE", "PRE"];  // must be non-nestable

var skipTagREs = [/<SCRIPT>.*?<\/SCRIPT>/i];    // FIXME: don't break on <SCRIPT>x='</SCRIPT>'</SCRIPT>
for (var i=1; i<skipTags.length; i++) {         // every case except SCRIPT is simple
    skipTagREs[i] = new RegExp('<' + skipTags[i] + '>.*?</' + skipTags[i] + '>', 'i');
}

function renderString(string) {
    result = "";

    while (true) {
        var skipTagMatch = undefined;
        var skipTagIndex = Infinity;
        for (var i=0; i<skipTagREs.length; i++) {
            match = string.match(skipTagREs[i]);
            if (match) {
                if (match.index < skipTagIndex) {
                    skipTagIndex = match.index;
                    skipTagMatch = match;
                }
            }
        }
    
        var inlineMatch = string.match(inlineRE);
        var displayMatch = string.match(displayRE);
    
        if (inlineMatch && inlineMatch.index < skipTagIndex && (!displayMatch || inlineMatch.index < displayMatch.index)) {
            math = inlineMatch[0].slice(2, inlineMatch[0].length - 2).replace('&lt;', '<').replace('&gt;', '>');
            rendered = katex.renderToString(math, {displayMode: false});
            result += string.slice(0, inlineMatch.index) + rendered;
            string = string.slice(inlineMatch.index + inlineMatch[0].length);
        } else if (displayMatch && displayMatch.index < skipTagIndex && (!inlineMatch || displayMatch.index < inlineMatch.index)) {
            math = displayMatch[0].slice(2, displayMatch[0].length - 2).replace('&lt;', '<').replace('&gt;', '>');
            rendered = katex.renderToString(math, {displayMode: true});
            result += string.slice(0, displayMatch.index) + rendered;
            string = string.slice(displayMatch.index + displayMatch[0].length);
        } else if (skipTagMatch) {
            result += string.slice(0, skipTagMatch.index) + skipTagMatch[0];
            string = string.slice(skipTagMatch.index + skipTagMatch[0].length);
        } else {
            return result + string;
        }
    }
}

function injectDependencies(string) {
    return string.replace(/<\/head>/, '<link rel="stylesheet" href="' + katexCSS + '"></head>');
}

for (var i=0; i<argv._.length; i++) {
    var raw = fs.readFileSync(argv._[i]).toString();
    fs.writeFileSync(argv._[i], injectDependencies(renderString(raw)));
}
