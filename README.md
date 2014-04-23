# Fun with javascript AST on top of esprima.

Transformations, pattern matching, substitution, reification. The gist
of the library is that you can reify pure javascript functions
seamlessly to abstract syntax trees.

    var src = astjs.reify.reify(function block() {
        var a = 1;
        var b = 2;
    })

The format we use is the one used by Esprima.

Reifying just regular functions is maybe not so useful but we can also
reify pattern functions i.e. functions which contains `splice
variables` denoted by `$[0-9]+`.

    var pattern = astjs.reify.pattern(function block() {
        var a = $1;
        var $2 = 2;
    }

This pattern can be used for pattern matching in AST trees, mapping of
AST trees or as a place where you just substitute some AST values in to
the splice variables.


# Testing

Run tests with `mocha`

# License (MIT style)

Copyright (C) 2012 Sakari Jokinen

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/sakari/astjs/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

