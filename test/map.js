var reify = require('../src').reify;
var util = require('util');
var should = require('should');
var map = require('../src').map;

describe('map', function() {
    describe('.map', function() {
        it('can reify the ast arguments',
           function() {
               map.map(function block() {
                   var p;
               },
                       function block() {
                           var $1;
                       }, {})
                   .should
                   .eql(reify.reify(function block() {
                       var p;
                   }));
           });


        it('maps splices keeping the structure',
           function() {
               map.map(reify.reify(function block() {
                   var p;
                   var k;
               })
                       , reify.reify(function block() {
                           var $1;
                           var $2;
                       })
                       , { 2: function(ast) {
                           return {
                               type: 'Identifier',
                               name: ast.name
                                   .toUpperCase()
                           };
                       }})
                   .should
                   .eql(reify.reify(function block() {
                       var p;
                       var K;
                   }));
           });

        it('keeps locations if present in ast', function() {
            var ast = reify.reify(function block() {
                var a;
                if(k)
                    b;
            }, {loc: true});
            var r = map.map(ast,
                            function block() {
                                var a;
                                if($1)
                                    b;
                            });
            r[0].loc.should.eql(ast[0].loc);
        });

        it('leaves the ast untouched if no match ',
           function() {
               map.map(reify.reify(function block() {
                   var p;
                   var k;
               })
                       , reify.reify(function block() {
                           var $2;
                       })
                       , {$2: function(ast) {
                           throw new Error();
                       }})
                   .should
                   .eql(reify.reify(function block() {
                       var p;
                       var k;
                   }));
           });

    });

    describe('.substitute', function() {
        it('splices an expression',
           function() {
               var fn = reify.block(function _() {
                   var a = $0;
               });
               var expr = reify.expr(function _() {
                   1 + k();
               });
               var expected = reify.block(function _() {
                   var a = 1 + k();
               });
               var got = map.substitute(fn, { 0: expr});
               got.should.eql(expected);
           });

        it('reifies function arguments ',
           function() {
               var fn = function block() {
                   var a = $0;
               };
               var expr = function expr() {
                   1 + k();
               };
               var expected = reify.block(function _() {
                   var a = 1 + k();
               });
               var got = map.substitute(fn, { 0: expr});
               got.should.eql(expected);
           });

        it('splices an identifier',
           function() {
               var fn = reify.block(function _() {
                   var $0;
               });
               var expr = reify.expr(function _() {
                   a;
               });
               var expected = reify.block(function _() {
                   var a;
               });
               var got = map.substitute(fn, {0: expr});
               got.should.eql(expected);
           });

        it('splices a single statement to a block',
           function() {
               var fn = reify.block(function _() {
                   $0;
                   var c;
               });

               var stmt = reify.stmt(function _() {
                   var a;
               });

               var expected = reify.block(function _() {
                   var a;
                   var c;
               });
               var got = map.substitute(fn, {0: stmt});
               got.should.eql(expected);
           });

        it('splices a list of statements to a block',
           function() {
               var fn = reify.block(function _() {
                   $0;
                   var c;
               });
               var block  = reify.block(function _() {
                   var a;
                   var b;
               });
               var expected = reify.block(function _() {
                   var a;
                   var b;
                   var c;
               });
               var got = map.substitute(fn, {0: block});
               got.should.eql(expected);
           });

        it('splices a statements and blocks to a block',
           function() {
               var fn = reify.block(function _() {
                   $0;
                   var c;
                   $1;
               });

               var block  = reify.block(function _() {
                   var a;
                   var b;
               });

               var stmt = reify.stmt(function _() {
                   var d;
               });

               var expected = reify.block(function _() {
                   var a;
                   var b;
                   var c;
                   var d;
               });
               var got = map.substitute(fn, {
                   0: block,
                   1: stmt
               });
               got.should.eql(expected);
           });

        it('throws if trying to splice non existing arg',
           function() {
               var fn = reify.stmt(function _() {
                   $1;
               });
               (function() {
                   map.substitute(fn);
               }).should.throw();
           });
    });

});