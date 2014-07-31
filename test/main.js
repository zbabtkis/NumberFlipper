suite("NightTrain", function() {
	suite("Flipper", function() {
		var nf = new NumberFlipper.Flipper(NumberFlipperEl(document.createElement('div')), [0, 1, 2, 3]);

		test("has class flipper", function() {
			expect(nf.el.className.match('flipper')).to.be.ok;
		});

	});

	suite("Rotation", function() {

		suite("#getRotationAtTime()", function() {

			test("rotation should be 0 when time is 0");
			test("rotation should be 90 when the current time amplified by the accelleration is equal to the base flip time");

		});

	});

});
