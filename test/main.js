suite("NumberFlipper", function() {
	suite("Flipper", function() {
		var nf = new NumberFlipper.Flipper(NumberFlipperEl(document.createElement('div')), [0, 1, 2, 3]);

		test("has class flipper", function() {
			expect(nf.el.className.match('flipper')).to.be.ok;
		});

    suite("FlipRange", function() {

      test("can be ascending", function() {
        var range = NumberFlipper.Flipper.FlipRange(0, 5);

        expect(range[0]).to.equal(0);
        expect(range[5]).to.equal(5);
      });

      test("can be descending", function() {
        var range = NumberFlipper.Flipper.FlipRange(5, 0);

        expect(range[0]).to.equal(5);
        expect(range[5]).to.equal(0);
      });
    });

	});

  suite("NumberFlipper", function() {
    test("can use ranges defined in constructor", function() {
      var fr = NumberFlipper.Flipper.FlipRange(6, 0);

      var nf = new NumberFlipper({
        el: document.createElement('div'),
        digits: 2,
        ranges: [
          fr,
          fr
        ]
      });

      expect(nf.flippers[0].mf).to.equal(fr);
      expect(nf.flippers[1].mf).to.equal(fr);
    });
  });

	suite("Rotation", function() {

		suite("#getRotationAtTime()", function() {

			test("rotation should be 0 when time is 0");
			test("rotation should be 90 when the current time amplified by the accelleration is equal to the base flip time");

		});

	});
});
