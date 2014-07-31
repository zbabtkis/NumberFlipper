NumberFlipper.js
=====
Put a train arrivals board in your browser!

NumberFlipper provides a flexible, vanilla JavaScript (yep, no jQuery needed), animated number display widget. As you change the value of your NumberFlipper instance, the rolodex like number cards will flip to the new value.

You can even define how many digits you would like each instance to display.

Use
===

Instantiate a new NumberFlipper:

```javascript
var el     = document.getElementById("myflipper"); // Selector to render the NumberFlipper in
var digits  = 2; // Number of digits number flipper should contain

e.g. myFlipper = new NumberFlipper(el, digits);
```

Flip to a number

```javascript
myFlipper.run(24);
```

Coming Soon
===========

* Set number range to use in single digit displays. For example, 0-6 for second digit of minutes to create a clock!
