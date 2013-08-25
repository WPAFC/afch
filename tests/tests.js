/* Unit testing framework for AFCH */

function afcHelpertest_testersetup(functionname,testid) {
	var code = "hello"; /* do some magic to get the wikicode from test_wikicode */
	var params = {'pagename': 'User:Theopolisme', 'checkpagecreator': 'Theopolisme'}; /* then do the same to get this data from test_wikicode */
	return (code,params);
}

QUnit.test( "afcHelper_page_creator() returns the correct page creator", function( assert ) {
	/* Make sure that the page creator function
	returns the correct page creator */
	var wikicode,params = afcHelpertest_testersetup(1);
	var title = params.pagename;
	var result = afcHelper_page_creator(title);

	assert.equal(result, params.checkpagecreator, "pagecreator of "+title+" is "+params.checkpagecreator);
});