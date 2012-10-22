var should = require('should');
var astjs = require('../src');

describe('symbols', function() {
    it('has undefined declaration for free variables', function() {
        var symbols = astjs.symbols(astjs.reify.reify(function block() {
            freeVar = 1;
        }, {loc: true}));
        should.not.exist(symbols.get('freeVar', 2, 4));
    });

    it('maps usage to declaration location', function() {
        var symbols = astjs.symbols(astjs.reify.reify(function block() {
            var bound;
            bound = 1;
        }, {loc: true}));
        symbols.get('bound', 3, 12)
            .should
            .eql({line: 2, column: 16});
    });

    it('understands function identifiers', function() {
        var symbols = astjs.symbols(astjs.reify.reify(function block() {
            function bound() {}
            bound();
        }, {loc: true}));
        symbols.get('bound', 3, 12).should.eql({
            line: 2, column: 21
        });
    });

    it('understands variables declared in inner scope', function() {
        var symbols = astjs.symbols(astjs.reify.reify(function block() {
            function fun() {
                var a;
            }
            a;
        }, {loc: true}));
        (null === symbols.get('a', 5, 12)).should.be.true;
    });

    it('understands variables declared in inner scope in function expressions',
       function() {
           var symbols = astjs.symbols(astjs.reify.reify(function block() {
               (function fun() {
                   var a;
               });
               a;
           }, {loc: true}));
           (null === symbols.get('a', 5, 15)).should.be.true;
       });

    it('understands variables declared in outer scope', function() {
        var symbols = astjs.symbols(astjs.reify.reify(function block() {
            function fun() {
                a;
            }
            var a;
        }, {loc: true}));
        symbols.get('a', 3, 16).should.eql({
            line: 5, column: 16
        });
    });

    it('declares variables in the function argument list', function() {
        var symbols = astjs.symbols(astjs.reify.reify(function block() {
            function fun(a) {
                a;
            }
        }, {loc: true}));
        symbols.get('a', 3, 16).should.eql({
            line: 2, column: 25
        });
    });

    it('declares function expression name inside the function scope',
       function() {
           var symbols = astjs.symbols(astjs.reify.reify(function block() {
               var b = function fun(a) {
                   fun();
               }
               fun();
           }, {loc: true}));
           (symbols.get('fun', 5, 15) === null).should.be.true;
           symbols.get('fun', 3, 19).should.eql({
               line: 2, column: 32
           });
       });

    it('declares the function decl name in outer scope', function() {
        var symbols = astjs.symbols(astjs.reify.reify(function block() {
            function fun(a) {
            }
            fun();
        }, {loc: true}));
        symbols.get('fun', 4, 12).should.eql({
            line: 2, column: 21
        });
    });

    it('considers symbol declaration a symbol usage', function() {
        var symbols = astjs.symbols(astjs.reify.reify(function block() {
            var a;
        }, {loc: true}));
        symbols.get('a', 2, 16)
            .should
            .eql({
                line: Number(symbols.getAll('a')[0].line),
                column: Number(symbols.getAll('a')[0].column)
            });
    });

    it('considers symbol declaration a symbol usage in function args', function() {
        var symbols = astjs.symbols(astjs.reify.reify(function block() {
            function fun(a) {};
        }, {loc: true}));
        symbols.get('a', 2, 25)
            .should
            .eql({
                line: Number(symbols.getAll('a')[0].line),
                column: Number(symbols.getAll('a')[0].column)
            });
    });

    it('considers function name a usage of the symbol', function() {
        var symbols = astjs.symbols(astjs.reify.reify(function block() {
            function fun(a) {};
        }, {loc: true}));
        symbols.get('fun', 2, 21)
            .should
            .eql({
                line: 2,
                column: 21
            });
    });

    it('uses the first declaration as the real declaration point', function() {
        var symbols = astjs.symbols(astjs.reify.reify(function block() {
            var a;
            var a;
        }, {loc: true}));
        symbols.get('a', 3, 16)
            .should
            .eql({
                line: 2,
                column: 16
            });
    });

});