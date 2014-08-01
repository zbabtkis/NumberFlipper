;(function(exports) {
	"use strict";

	var El = function(el) {
		var CLASS_SEPARATOR = " ";

    // To check if el has been extended
    el.isNF = true;

		el.addClass = function(className) {
			var cs = el.className ? CLASS_SEPARATOR : "";
			if(! el.className.match(className)) {
				this.className = this.className + cs + className;
			}
			
			return this;
		};

		el.removeClass = function(className) {
			this.className.replace(CLASS_SEPARATOR + className, "");
			this.className.replace(className, "");

			return this;
		};

		el.remove = function() {
			if(this.parentNode) {
				this.parentNode.removeChild(el);
			}

			return this;
		};

		// hide
		el.hide = function() {
			this.style.display = 'none';

			return this;
		};

		// append
		el.append = function(child) {
			this.appendChild(child);

			return this;
		};

		// appendTo
		el.appendTo = function(par) {
			this.remove();
			par.append(this);

			return this;
		};

		// prependTo
		el.prependTo = function(par) {
			this.remove();
      if(par.children[0]) {
        par.insertBefore(this, par.children[0]);
      } else {
        this.appendTo(par);
      }

			return this;
		};

		// show
		el.show = function() {
			this.style.display = 'block';

			return this;
		};

		el.css = function(attr, style) {
			var _this = this;

			function getSafeStyleName(attr) {
				var split = attr.split('-')
					, safeName = "";

				El.each(split, function(ind, name) {
					if(ind === 0 || ind === 1 && split[0] === "") {
						safeName += name.toLowerCase();
					} else {
						safeName += name.slice(0, 1)
							.toUpperCase() 
						safeName += name.slice(1)
							.toLowerCase();
					}
				});

				return safeName;
			}

			function mapStyle(a, s) {
				_this.style[getSafeStyleName(a)] = s;
			}

			if(typeof attr === 'string') {
				mapStyle(attr, style);
			} else if(typeof attr === 'object') {
				El.each(attr, mapStyle);
			}

			return this;
		};

		el.html = function(html) {
			this.innerHTML = html;

			return this;
		};

		el.text = function(text) {
			var tn = document.createTextNode(text);
			this.html('');
			this.append(tn);

			return this;
		};

		return el;
	};

	El.each = function(list, cb) {
		for(var i = 0, j=list.length; i < j; i++) {
			cb(i, list[i]);
		} 
	};

	El.Deferred = function() {
		var _cbs = [];

		return {
			promise: function() {
				return {
					then: function(fn) {
						_cbs.push(fn); 
					}
				};
			},
			resolve: function(data) {
				El.each(_cbs, function(ind, cb) {
					cb(data);
				});
			}
		};
	};

	El.bind = function(fn, obj) {
		var args = [].slice.call(arguments, 2);
		return function() {
			args = args.concat([].slice.call(arguments, 0));
			fn.apply(obj, args);
		};
	};

	El.extend = function(src, add) {
		for(var i in add) {
			if(!src.hasOwnProperty(i)) {
				src[i] = add[i];
			}
		}
	};

	exports.NumberFlipperEl = El;

}).call(this, this);
