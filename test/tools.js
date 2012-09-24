var tools = require('../src').tools;
var reify = require('../src').reify.reify;

describe('tools', function() {
	     describe('hoist', function() {
			  it('hoists var decls to top', function() {
				 tools.hoist(reify(function block() {
						       anything;
						       var a;
						   }))
				     .should
				     .eql(reify(function block() {
						    var a;
						    anything;
						}));
			     });
			  it('leaves var assingments in place', function() {
				 tools.hoist(reify(function block() {
						      anything;
						      var a = 1;
						  }))
				     .should
				     .eql(reify(function block() {
						    var a;
						    anything;
						    a = 1;
						}));
			     });
			  it('moves multiple vardecls to separate statements', 
			     function() {
				tools.hoist(reify(function block() {
						      anything;
						      var a, b;
						  }))
				     .should
				     .eql(reify(function block() {
						    var a;
						    var b;
						    anything;
						}));
			     });

			  it('leaves var assingments as sequence expression', 
			     function() {
				tools.hoist(reify(function block() {
						      anything;
						      var a = 1, b, c = 2;
						  }))
				     .should
				     .eql(reify(function block() {
						    var a;
						    var b;
						    var c;
						    anything;
						    a = 1, c = 2;
						}));
			     });
			  it('hoists vardecls from for', function() {
				 tools.hoist(reify(function block() {
						      for(var a, b = 0;;){}
						  }))
				 .should
				     .eql(reify(function block() {
						    var a;
						    var b;
						    for(b = 0;;){}
						}));
			     });

			  it('hoists vardecls to top of encloding functnio', 
			     function() {
				 tools.hoist(reify(function block() {
						       a = 1;
						       var b;
						       function c(r, k) {
							   k = 1;
							   var t;
						       }
						  }))
				 .should
				     .eql(reify(function block() {
						    var b;
						    a = 1;
						    function c(r, k) {
							var t;
							k = 1;
						    }
						}));
			     });


		      });
	     describe('block', function() {
			  it('transforms if', function() {
				 tools.block(reify(function block() {
						       if(a) b;
						   }))
				     .should
				     .eql(reify(function block() {
						    if(a) {
							b;
						    }
						}));
			     });

			  it('transforms for', function() {
				 tools.block(reify(function block() {
						       for(;;) a;
						   }))
				     .should
				     .eql(reify(function block() {
						    for(;;) {
							a;
						    }
						}));
			     });

			  it('leaves for with a block as is', function() {
				 tools.block(reify(function block() {
						       for(;;) {
							   a;
						       }
						   }))
				     .should
				     .eql(reify(function block() {
						    for(;;) {
							a;
						    }
						}));
			     });

			  it('transforms while', function() {
				 tools.block(reify(function block() {
						       while(1) 2;
						   }))
				     .should
				     .eql(reify(function block() {
						    while(1) {
							2;
						    }
						}));
			     });
	
		      });
	 });