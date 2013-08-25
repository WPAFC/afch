$("#bodyContent").prepend('<div id="qunit"></div><div id="qunit-fixture"></div>')
$('head').append('<link rel="stylesheet" type="text/css" href="//code.jquery.com/qunit/qunit-1.12.0.css">');

$.ajax({
	url: '//code.jquery.com/qunit/qunit-1.12.0.js',
	dataType: "script",
	async: false
});
