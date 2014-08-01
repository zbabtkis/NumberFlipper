/**
 * NumberFlipper.js
 */

;(function(exports) {
  "use strict";

	// DOM helpers (jQuery alternative)
	var El = exports.NumberFlipperEl;

  var Flipper = function(el, mf) {
    this.el = el;
    this.mf  = mf;
    this._domLayers = [];
    
    el.addClass('flipper');
    
    this.increase = El.bind(this.increase, this);
    this.decrease = El.bind(this.decrease, this);
    
    this._events = {};
    
    this.index = 0;
    
    this.setLayer(Flipper.Layers.FLIP, this.createTile(0)).show();
  };

  Flipper.RAM = function(cb) {
  	switch(true) {
			case !!window.requestAnimationFrame:
				window.requestAnimationFrame.apply(window, arguments);
				break;
			case !!window.webkitRequestAnimationFrame:
				window.webkitRequestAnimationFrame.apply(window, arguments);
				break;
			case !!window.mozRequestAnimationFrame:
				window.webkitRequestAnimationFrame.apply(window, arguments);
				break;
			case !!window.oRequestAnimationFrame:
				window.webkitRequestAnimationFrame.apply(window, arguments);
				break;
			default:
				shim.apply(window, arguments);
		}

		function shim() {
			Flipper.RAM.state = Flipper.RAM.state || 0;
			setTimeout(function() {
				var args = [].slice.call(arguments, 0);
				args.push(Flipper.RAM.state)
				cb.apply(window, args);
				Flipper.RAM.state += 1000/60; 
			}, 1000/60);
		}
	};

	// RequestAnimationFrame shim
  Flipper.RAM = Flipper.RAM || function(cb) {
	};

  // Class methods
  Flipper.FlipRange = function (start, end) {
    var arr = [];
    
    for(var i = start; i <= end; i++) {
      arr.push(i);
    }
    
    return arr;
  };

  Flipper.ProgressiveAccelleration = function() {
    this.speed = 1;
  };

  Flipper.ProgressiveAccelleration.prototype.tick = function(progress) {
    /**this.speed = Math.pow(progress / 100, 8);
    
    console.log(progress/100);*/
    
    return this;
  };

  Flipper.ProgressiveAccelleration.prototype.getSpeed = function() {
    return this.speed;
  };

  // Constants
  Flipper.Direction = {};
  Flipper.Layers    = {};
  Flipper.Classes   = {};
  Flipper.Sets      = {};

  Flipper.Direction.UP   = 1;
  Flipper.Direction.DOWN = -1;

  Flipper.Layers.MASK_ABOVE = 400;
  Flipper.Layers.FLIP       = 300;
  Flipper.Layers.MASK_BELOW = 200;
  Flipper.Layers.NEXT       = 100;
  Flipper.Layers.LAST       = 101;

  Flipper.Classes[Flipper.Layers.MASK_ABOVE] = 'mask';
  Flipper.Classes[Flipper.Layers.MASK_BELOW] = 'mask';

  Flipper.Sets.SingleDigit = Flipper.FlipRange(0, 9);

  Flipper.prototype.getIndex = function(index) {
    return this.index;
  };

  Flipper.prototype.setIndex = function(index) {
    this.index = index;
  };

  /**
   * Transition index to a larger numebr
   */
  Flipper.prototype.increase = function() {
    var ind = this.index+1 >= this.mf.length ? 0 : this.index + 1;
    this.setIndex(ind);
  };

  /**
   * Transition index to a lower number
   */
  Flipper.prototype.decrease = function() {
    var ind = this.index-1 <= 0 ? this.mf.length - 1 : this.index - 1;
    this.setIndex(ind);
  };

  /**
   * Get numbers to make tween
   * @param {Integer} direction - 1 or -1 depending on direction of flip
   */
  Flipper.prototype.transitionNumbers = function(transition, speed) {
    var curr = this.getIndex()
      , next = this.getIndex(transition());
      
    if(next === 0 && curr > next) {
      this.trigger('loop');
    }
    
    return {
      current: this.mf[curr],
      after: this.mf[next],
      speed: speed
    };
  };

  /** Tile builders */
  Flipper.prototype.createTile = function(number) {
    var el = El(document.createElement('div'));
    el.addClass('tile-inner');
    el.text(number);

    return el;
  };

  Flipper.prototype.createHalfTile = function(number, position, step) {
    return this.createTile(number).addClass('mask-inner');
  }

  /**
   * Rendering
   */

  Flipper.prototype.setLayer = function(index, el) {
    
    // If a layer exists in DOM, remove it.
    if(this._domLayers[index]) {
      this._domLayers[index].remove();
      this._domLayers[index] = null;
    }
    
    if(!el) return this;
    
    this._domLayers[index] = El(document.createElement('div'));
    this._domLayers[index]
      .hide()
      .append(el)
      .css('z-index', index)
      .addClass('tile')
      .addClass(Flipper.Classes[index])
      .appendTo(this.el);

    return this._domLayers[index];
  };

  Flipper.prototype.getLayer = function(index) {
    return this._domLayers[index];
  }

  /**
   * Setup first phase of flip animation
   * @param {Object} flip - returned object from getTransitionNumbers()
   */
  Flipper.prototype.setupFlip = function(flip) {
    this.flipAccelleration = new Flipper.ProgressiveAccelleration();
    this.setLayer(Flipper.Layers.FLIP, this.createTile(flip.current)).show();
    this.setLayer(Flipper.Layers.NEXT, this.createTile(flip.after)).show();
    this.setLayer(Flipper.Layers.MASK_ABOVE, this.createHalfTile(flip.current)).addClass('below').show();

    this.setLayer(Flipper.Layers.MASK_BELOW,
      this.createHalfTile(flip.current)
    ).addClass('below').show();
  };

  Flipper.prototype.flipAway = function(flip, d, start, time) {
    var d = d || El.Deferred()
      , acc = this.flipAccelleration.getSpeed()
      , progress;
    
    if(!time) {
      Flipper.RAM(El.bind(this.flipAway, this, flip, d, null));
      return d.promise();
    }
    
    start = start || time;
    progress = time - start;
    
    var rotation = this.normalRotation(progress, flip.speed + acc, 1, -90)
      , layer    = this.getLayer(Flipper.Layers.FLIP);
      
    rotation = rotation >= -90 ? rotation : -90;
    
    this.rotateDomElement(layer.children[0], rotation);
    this.flipAccelleration.tick(progress)
    
    if(rotation === -90) {
      return d.resolve();
    }
    
    Flipper.RAM(El.bind(this.flipAway, this, flip, d, start));
  };

  Flipper.prototype.setupFinalFlip = function(flip) {
    this.setLayer(Flipper.Layers.MASK_ABOVE, 
      this.createHalfTile(flip.after)
    ).addClass('above').show();
    
    this.setLayer(Flipper.Layers.FLIP, 
      this.createTile(flip.after)
    );
  };

  Flipper.prototype.flipIn = function(flip, d, start, time) {
    var d = d || El.Deferred()
      , acc = this.flipAccelleration.getSpeed()
      , progress;
      
    if(!time) {
      Flipper.RAM(El.bind(this.flipIn, this, flip, d, null));
      return d.promise();
    }
    
    start = start || time;
    progress = time - start;
    
    var rotation = 90 - this.normalRotation(progress, flip.speed + acc, 1, 90)
      , layer    = this.getLayer(Flipper.Layers.FLIP);
      
    rotation = rotation > 0 ? rotation : 0;
      
    this.rotateDomElement(layer.children[0], rotation);
    this.flipAccelleration.tick(progress);
    
    layer.show();
    
    if(rotation === 0) {
      return d.resolve(time);
    }
    
    Flipper.RAM(El.bind(this.flipIn, this, flip, d, start));
  };

  Flipper.prototype.teardown = function() {
    this.setLayer(Flipper.Layers.MASK_ABOVE, null);
    this.setLayer(Flipper.Layers.FLIP, null);
    this.setLayer(Flipper.Layers.NEXT, null);
    this.setLayer(Flipper.Layers.MASK_BELOW, null);
  }

  Flipper.prototype.rotateDomElement = function (el, movement) {
    El(el).css('-webkit-transform', 'rotateX(' + movement + 'deg)');
  };

  /**
   * Data calculations
   */

  /**
   * calculate rotation position based on time in milleseconds
   * @param {Float} - ct - current time
   * @param {Integer} - acc - accelleration of flip
   * @param {Integer} - bt - base time of one flip
   * @param {Integer} - deg - number of degrees in a complete flip
   */
  Flipper.prototype.normalRotation = function (ct, acc, bt, deg) {
    return parseInt(((ct / 1000) * acc * deg) / bt);
  };

  Flipper.prototype.warpSpeed = function(x, L) {
    return Math.pow(L/2 - Math.abs(x - L/2) + 1, 1.25);
  }

  Flipper.prototype.run = function(strategy, it, curr) {
    var curr, flip, _this = this;
    
    if(curr && curr.flip && curr.flip.speed) {
      flip = this.transitionNumbers(strategy, curr.flip.speed);
    } else {
       curr = curr || 1;
       flip = this.transitionNumbers(strategy, this.warpSpeed(curr, it));
    }
    
    this.flip = flip;
      
    this.setupFlip(flip);
    this.flipAway(flip)
      .then(function() {
        _this.setupFinalFlip(flip);
        _this.flipIn(flip)
          .then(function() {
            if(curr < it) {
              _this.teardown();
              _this.run(strategy, it, curr+1);
            }
          });
      })
  };

  Flipper.prototype.on = function(evt, fn) {
    this._events[evt] = this._events[evt] || [];
    this._events[evt].push(fn);
  };

  Flipper.prototype.trigger = function(evt, data) {
    this._events[evt] = this._events[evt] || [];
    El.each(this._events[evt], function(ind, fn) {
      fn(data);
    });
  };

  /**
   * MULTIFLIP
   * ---------
   * Provides multiple digit flippers
   */
  var MultiFlip = function(el, digits) {
    var flippers = [], flipper, flipper, $flipper;

    el = El(el);
    
    el.addClass('multiflip');
    
    for(var i = 0; i < digits; i++) {
      var margin = digits * 65 - i * 65 - 65;
      $flipper = El(document.createElement("div"));
      $flipper.css('left', margin + 'px');
      flipper = new Flipper($flipper, Flipper.Sets.SingleDigit);
      flippers.push(flipper);
      $flipper.appendTo(el);
      
      if(flippers[i-1]) {
        flippers[i - 1].on('loop', El.bind(flipper.run, flipper, flipper.increase, 1, flippers[i-1]));
      }
    }
    
    this.digits        = digits;
    this.currentNumber = 0;
    this.flippers      = flippers;
  };

  MultiFlip.prototype.run = function(number) {
    this.flipTo(this.flippers[0], number);
  };

  MultiFlip.prototype.flipTo = function(controller, number) {
    var difference = number - this.currentNumber;
      
    if(difference < 0) {
      difference = Math.pow(10, this.digits) + difference;
    }
    
    if(difference) {
      this.currentNumber = number;
      controller.run(controller.increase, Math.abs(difference));
    }
  };

	MultiFlip.Flipper = Flipper;

  exports.NumberFlipper = MultiFlip;

}).call(this, this);
