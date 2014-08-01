/**
 * NumberFlipper.js
 */

;(function(exports) {
  "use strict";

  // DOM helpers (jQuery alternative)
  var El = exports.NumberFlipperEl;

  var Flipper = function(el, mf) {
    this.el  = el.isNF ? el : new El(el);
    this.mf  = mf;
    this._domLayers = [];

    el.addClass('flipper');

    this.increase = El.bind(this.increase, this);
    this.decrease = El.bind(this.decrease, this);

    this._events = {};

    this.setIndex(0);

    this.setLayer(Flipper.Layers.FLIP, this.createTile(this.mf[this.getIndex()])).show();
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

  /**
   * Provides requestAnimationFrame vendor 
   * prefixes and shim
   *
   * @param {Function} cb - requestAnimationFrame callback
   */
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

    // requestAnimationFrame polyfull function
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

  // Class methods
  Flipper.FlipRange = function (start, end) {
    var arr = [];

    for(var i = start; i <= end; i++) {
      arr.push(i);
    }

    return arr;
  };

  /**
   * @TODO: Make this modulate flip speed
   */
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

  /**
   * Getter
   * @return {Integer} current index in range
   */
  Flipper.prototype.getIndex = function() {
    return this.index;
  };

  /**
   * Setter
   * @param {Integer} index - index in range
   */
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

    // If we've arrived back at the beginning of the 
    // range, trigger loop
    if(next === 0 && curr > next) {
      this.trigger('loop');
    }

    console.log(this.mf);

    // Data needed to animate transition
    return {
      current: this.mf[curr],
      after: this.mf[next],
      speed: speed
    };
  };

  /** 
   * Tile DOMElement builder 
   * @param {Number} number - number to display in DOMElement
   * @return {DOMElement} - new tile
   */
  Flipper.prototype.createTile = function(val) {
    var el = El(document.createElement('div'));
    el.addClass('tile-inner');
    switch(typeof val) {
      case 'number':
        el.text(val);
        break;
      case 'string':
        el.html(val);
        break;
      case 'object':
        if(typeof val.html === 'function') {
          el.html(val.html());
        } else if(val.outerHTML) {
          el.html(val.outerHTML)
        }
        break;
      default:
        break;
    }

    return el;
  };

  /**
   * Creates a tile with half-height
   */
  Flipper.prototype.createHalfTile = function(number, position, step) {
    return this.createTile(number).addClass('mask-inner');
  }

  /**
   * Rendering
   */

  /**
   * Set the content of a layer
   * @param {Integer} index - zIndex of layer
   * @param {DOMElement} el - tile to display in layer
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

  /**
   * Get tile at layer zIndex
   * @param {Integer} index - zIndex
   * @return {DOMElement}
   */
  Flipper.prototype.getLayer = function(index) {
    return this._domLayers[index];
  }

  /**
   * Setup first phase of flip animation
   * @param {Object} flip - returned object from getTransitionNumbers()
   */
  Flipper.prototype.setupFlip = function(flip) {

    // Modulates rotation speed
    this.flipAccelleration = new Flipper.ProgressiveAccelleration();

    this.setLayer(Flipper.Layers.FLIP, this.createTile(flip.current)).show();
    this.setLayer(Flipper.Layers.NEXT, this.createTile(flip.after)).show();
    this.setLayer(Flipper.Layers.MASK_ABOVE, this.createHalfTile(flip.current)).addClass('below').show();

    // Display layer mask on lower section
    // to give appearance of only top half flipping
    this.setLayer(Flipper.Layers.MASK_BELOW,
      this.createHalfTile(flip.current)
    ).addClass('below').show();
  };

  /**
   * Flip top half down animation
   * @param {Object} flip - attributes to use to flip
   * @param {Deferred} d - deferred object carried recursively
   * @param {Integer} start time of animation
   * @param {Integer} time - current time in animation
   *
   * @return {Promise} - resolved when animation complete
   */
  Flipper.prototype.flipAway = function(flip, d, start, time) {
    var d = d || El.Deferred()
      , acc = this.flipAccelleration.getSpeed()
      , progress;

    // If this is the first time running, create a
    // requestAnimationFrame request
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
  };

  Flipper.prototype.flipToNext = function() {
    var flip  = this.transitionNumbers(this.increase, 1)
      , _this = this;

    this.setupFlip(flip);
    this.flipAway(flip)
      .then(function() {
        _this.setupFinalFlip(flip);
        _this.flipIn(flip)
      });
  };

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
  var MultiFlip = function(options) {
    var flippers = [], el, flipper, $flipper;

    El.extend(options, {
      digits: 2
    });


    el = El(options.el);
    el.addClass('multiflip');

    for(var i = 0, digits = options.digits; i < digits; i++) {
      $flipper = El(document.createElement("div"));
      flipper = new Flipper($flipper, Flipper.FlipRange(0, 9));
      flippers.push(flipper);
      $flipper.prependTo(el);

      if(flippers[i-1]) {
        flippers[i - 1].on('loop', El.bind(flipper.run, flipper, flipper.increase, 1, flippers[i-1]));
      }
    }

    this.digits        = options.digits;
    this.currentNumber = 0;
    this.flippers      = flippers;
  };

  MultiFlip.prototype.flipTo = function(number) {
    this._performFlip(this.flippers[0], number);
  };

  MultiFlip.prototype._performFlip = function(controller, number) {
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
