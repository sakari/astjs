var match = require('../src').match;
var reify = require('../src').reify;
var should = require('should');
var map = require('../src').map;

describe('.match', function() {
    it('return null if ast does not match',
       function() {
           should.strictEqual(
               match(reify.stmt(function _() {
                   var b;
               }
                                , reify.stmt(function _() {
                                    var a;
                                })))
               , null);
       });
    it('returns an empty substitution if it matches without variable', function() {
        var template = reify.stmt(function _() {
            var b;
        });
        var matchee = reify.stmt(function _() {
            var b;
        });
        match(template, matchee)
            .should
            .eql([]);
    });

    it('returns a substitution if it matches', function() {
        var template = reify.stmt(function _() {
            var $0;
        });
        var matchee = reify.stmt(function _() {
            var b;
        });
        var subst = match(template, matchee);
        map.substitute(template
                       , subst)
            .should
            .eql(matchee);
    });

    it('matches multiple occurrences with the same substitution', function() {
        var template = reify.block(function _() {
            var $0;
            $0 = 1;
        });
        var matchee = reify.block(function _() {
            var b;
            b = 1;
        });
        var subst = match(template, matchee);
        map.substitute(template
                       , subst)
            .should
            .eql(matchee);
    });

    it('returns null if required substitutions are not equal', function() {
        var template = reify.block(function _() {
            var $0;
            $0 = 1;
        });
        var matchee = reify.block(function _() {
            var b;
            c = 1;
        });
        should.strictEqual(match(template, matchee), null);
    });

    it('matches expressions', function() {
        var template = reify.stmt(function _() {
            var a = $0;
        });
        var matchee = reify.stmt(function _() {
            var a = 1 + k();
        });
        var subst = match(template, matchee);
        map.substitute(template
                       , subst)
            .should
            .eql(matchee);
    });

    it('matches many statements', function() {
        var template = reify.block(function _() {
            $0_;
        });
        var matchee = reify.block(function _() {
            var a;
            var b;
        });
        var subst = match(template, matchee);
        map.substitute(template
                       , subst)
            .should
            .eql(matchee);
    });

    it('matches statements as far as possible', function() {
        var template = reify.block(function _() {
            $0_;
            var a;
        });
        var matchee = reify.block(function _() {
            var a;
            var a;
            var a;
        });
        var subst = match(template, matchee);
        subst[0]
            .should
            .eql(reify.block(function _() {
                var a;
                var a;
            }));
    });

    it('matches greedily', function() {
        var template = reify.block(function _() {
            $0_;
            $1_;
        });
        var matchee = reify.block(function _() {
            var a;
            var a;
        });
        var subst = match(template, matchee);
        subst[0].length.should.eql(2);
        subst[1].should.eql([]);
    });


    it('matches zero statements', function() {
        var template = reify.block(function _() {
            $0_;
            var a;
        });
        var matchee = reify.block(function _() {
            var a;
        });
        var subst = match(template, matchee);
        subst[0].should.eql([]);
    });

    it('matches argument lists', function() {
        var template = reify.block(function _() {
            function a($0_) {
            }
        });
        var matchee = reify.block(function _() {
            function a(m, k) {
            }
        });
        var subst = match(template, matchee);
        subst[0].length.should.eql(2);
        map.substitute(template
                       , subst)
            .should
            .eql(matchee);
    });

    it('matches apply lists', function() {
        var template = reify.block(function _() {
            a($0_, $1);
        });
        var matchee = reify.block(function _() {
            a(1, a, k(), 1 + 2);
        });
        var subst = match(template, matchee);
        map.substitute(template
                       , subst)
            .should
            .eql(matchee);
    });

    it('matches locations', function() {
        var ast = reify.reify(function block() {
            var a;
            if(a) {
                b;
            }
        }, {loc: true});
        var pattern = reify.pattern(function block() {
            var a;
            if($1) {
                b;
            }
        });
        var subst = match(pattern, ast);
        subst.loc[2].should.eql(ast[0].loc);
    });
});
