//<nowiki>
// Script should be located at [[MediaWiki:Gadget-afchelper.js/core.js]]

function jqEsc(expression) {
	return expression.replace(/[!"#$%&'()*+,.\/:;<=>?@\[\\\]^`{|}~]/g, '\\$&'); 
}

importScript('User:Timotheus Canens/displaymessage.js');
var afchelper_baseurl = mw.config.get('wgServer') + '/w/index.php?action=raw&ctype=text/javascript&title=MediaWiki:Gadget-afchelper.js';

var afcHelper_advert = ' ([[WP:AFCH|AFCH]])';
var pagetext = '';
var usertalkpage = '';

// CSS stylesheet
importStylesheetURI(mw.config.get('wgServer') + '/w/index.php?action=raw&ctype=text/css&title=MediaWiki:Gadget-afchelper.css');

if (wgPageName.indexOf('Wikipedia:Articles_for_creation/Redirects') !== -1) {
	importScriptURI(afchelper_baseurl + '/redirects.js');
} else if (wgPageName.indexOf('Wikipedia:Files_for_upload') !== -1) {
	importScriptURI(afchelper_baseurl + '/ffu.js');		
} else if ((wgPageName.indexOf('Wikipedia:Articles_for_creation/') !== -1)
			|| (wgPageName.indexOf('Wikipedia_talk:Articles_for_creation/') !== -1)
			|| (wgPageName.indexOf('User:') !== -1)
			){
	importScriptURI(afchelper_baseurl + '/submissions.js');				
}

// This enables the beta notice for all uses except the official gadget
if (afchelper_baseurl.indexOf('MediaWiki:'+'Gadget-afchelper.js' /* hack to stop upload scripts from find+replacing this */) == -1)
	var BETA = true;
else
	var BETA = false;

if (BETA) {
	// Manually load mw.api() and chosen only if we're not using the gadget...with the gadget, they are already dependencies
	mw.loader.load('mediawiki.api');
	mw.loader.load('jquery.chosen');
	// Set the summary to denote that we're using a "beta" version of the script
	var afcHelper_advert = ' ([[WP:AFCH|AFCH]] beta)';
}

function afcHelper_generateSelect(title, options, onchange) {
	var text = '<select name="' + title + '" id="' + title + '" ';
	if (onchange !== null) text += 'onchange = "' + onchange + '" ';
	text += '>';
	for (var i = 0; i < options.length; i++) {
		var o = options[i];
		text += '<option value="' + afcHelper_escapeHtmlChars(o.value) + '" ';
		if (o.selected) text += 'selected="selected" ';
		if (o.disabled) text += 'disabled ';
		text += '>' + o.label + '</option>';
	}
	text += "</select>";
	return text;
}

function afcHelper_generateChzn(title,placeholder,optionsdict) {
	// given a dictionary of "title","value"
	var text = '<select data-placeholder="' + placeholder + '" id="' + title + '" style="width:350px;" class="chzn-select" multiple>';
	$.each(optionsdict, function(k, v){
		text += '<option value="' + afcHelper_escapeHtmlChars(v) + '" >' + k + '</option>';
	});
	text += "</select>";
	return text;
}

function afcHelper_escapeHtmlChars(original) {
	return original.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function afcHelper_countString(str, search, casesensitive){
	// Returns count of occurances of a "search" string in "str"
	// Casesensitive can be set to true for case sensitive matching
	if (!casesensitive) str = str.toLowerCase();
	var count = 0;
	var index = str.indexOf(search);
	while(index !=- 1){
		count++;
		index = str.indexOf(search,index+1);
	}
	return count;
}

function afcHelper_getPageText(title, show, redirectcheck, timestamp) {
	if (show) $('#afcHelper_status').html($('#afcHelper_status').html() + '<li id="afcHelper_get' + jqEsc(title) + '">Getting <a href="' + wgArticlePath.replace("$1", encodeURI(title)) + '" title="' + title + '">' + title + '</a></li>');

	var request = {
				'action': 'query',
				'prop': 'revisions',
				'rvprop': 'content',
				'format': 'json',
				'indexpageids': true,
				'titles' : title
			};
	if (redirectcheck) request.redirects = true;
	if (timestamp) request.rvprop = 'content|timestamp';

	var response = JSON.parse(
		$.ajax({
			url: mw.util.wikiScript('api'),
			data: request,
			async: false
		})
		.responseText
	);

	pageid = response['query']['pageids'][0];
	if (pageid === "-1") {
		if (show) $('#afcHelper_get' +jqEsc(title)).html('The page <a class="new" href="' + wgArticlePath.replace("$1", encodeURI(title)) + '" title="' + title + '">' + title + '</a> does not exist');
		return '';
	}
	var newtext = response['query']['pages'][pageid]['revisions'][0]['*'];
	if (redirectcheck && response['query']['redirects'] /* If &redirects if specified but there is no redirect, this stops us from getting an error */){
		var oldusername = response['query']['redirects'][0]['from'];
		var newusername = response['query']['redirects'][0]['to'];
		if ((typeof(oldusername) !== 'undefined') && (typeof(newusername) !== 'undefined') && (oldusername != newusername)){
			usertalkpage = newusername;
			if (show) {
				$('#afcHelper_status').html($('#afcHelper_status').html() + '<li id="afcHelper_get' + jqEsc(title) + '">Got <a href="' + wgArticlePath.replace("$1", encodeURI(title)) + '" title="' + newusername + '">' + newusername + '</a> (page was renamed from ' + oldusername + ')</li>');
			}
		} else {
			redirectcheck = false;
		}
	} else {
			redirectcheck = false;
	}		
	if (show && !redirectcheck)	$('#afcHelper_status').html($('#afcHelper_status').html() + '<li id="afcHelper_get' + jqEsc(title) + '">Got <a href="' + wgArticlePath.replace("$1", encodeURI(title)) + '" title="' + title + '">' + title + '</a></li>');
	if (!timestamp) return newtext;
	else return {'pagetext':newtext,'timestamp':response['query']['pages'][pageid]['revisions'][0]['timestamp']}
}

function afcHelper_deletePage(title,reason) {
	// First set up the status log
	$("#afcHelper_finished_wrapper").html('<span id="afcHelper_AJAX_finished_' + afcHelper_AJAXnumber + '" style="display:none">' + $("#afcHelper_finished_wrapper").html() + '</span>');
	var func_id = afcHelper_AJAXnumber;
	afcHelper_AJAXnumber++;
	document.getElementById('afcHelper_status').innerHTML += '<li id="afcHelper_delete' + escape(title) + '">Deleting <a href="' + wgArticlePath.replace("$1", encodeURI(title)) + '" title="' + title + '">' + title + '</a></li>';

	// Then get the deletion token
	var tokenrequest = {
				'action': 'query',
				'prop': 'info',
				'format': 'json',
				'intoken': 'delete',
				'indexpageids': true,
				'titles' : title
			};
	var tokenresponse = JSON.parse(
		$.ajax({
			url: mw.util.wikiScript('api'),
			data: tokenrequest,
			async: false
		})
		.responseText
	);

	pageid = tokenresponse['query']['pageids'][0];
	token = tokenresponse['query']['pages'][pageid]['deletetoken'];

	// And finally delete the page
	var delrequest = {
				'action': 'delete',
				'reason': reason + afcHelper_advert,
				'format': 'json',
				'token': token,
				'title' : title
			}
	var delresponse = JSON.parse(
		$.ajax({
			type: "POST",
			url: mw.util.wikiScript('api'),
			data: delrequest,
			async: false
		})
		.responseText
	);

	if (delresponse && delresponse.delete) {
		document.getElementById('afcHelper_delete' + escape(title)).innerHTML = 'Deleted <a href="' + wgArticlePath.replace("$1", encodeURI(title)) + '" title="' + title + '">' + title + '</a>';
		return true;
	} else {
		document.getElementById('afcHelper_delete' + escape(title)).innerHTML = '<div style="color:red"><b>Deletion failed on <a href="' + wgArticlePath.replace("$1", encodeURI(title)) + '" title="' + title + '">' + title + '</a></b></div>. Error info:' + error;
		return false;
	}
}

function afcHelper_editPage(title, newtext, summary, createonly) {
	var edittoken = mw.user.tokens.get('editToken');
	summary += afcHelper_advert;
	$("#afcHelper_finished_wrapper").html('<span id="afcHelper_AJAX_finished_' + afcHelper_AJAXnumber + '" style="display:none">' + $("#afcHelper_finished_wrapper").html() + '</span>');
	var func_id = afcHelper_AJAXnumber;
	afcHelper_AJAXnumber++;
	$('#afcHelper_status').html($('#afcHelper_status').html() + '<li id="afcHelper_edit' + jqEsc(title) + '">Editing <a href="' + wgArticlePath.replace("$1", encodeURI(title)) + '" title="' + title + '">' + title + '</a></li>');
	var request = {
				'action': 'edit',
				'title': title,
				'text': newtext,
				'summary': summary,
				'token': edittoken
			}
	if (createonly) request.createonly = true;

	var api = new mw.Api();
	api.post(request)
			.done(function ( data ) {
				if ( data && data.edit && data.edit.result && data.edit.result == 'Success' ) {
					$('#afcHelper_edit' + jqEsc(title)).html('Saved <a href="' + wgArticlePath.replace("$1", encodeURI(title)) + '" title="' + title + '">' + title + '</a>');
				} else {
					$('#afcHelper_edit' + jqEsc(title)).html('<div class="notice"><b>Edit failed on <a href="' + wgArticlePath.replace("$1", encodeURI(title)) + '" title="' + title + '">' + title + '</a></b></div>. Error info:' + response['error']['code'] + ' : ' + response['error']['info']);
				}
			} )
			.fail( function ( error ) {
				if (createonly && error == "articleexists")
					$('#afcHelper_edit' + jqEsc(title)).html('<div class="notice"><b>Edit failed on <a href="' + wgArticlePath.replace("$1", encodeURI(title)) + '" title="' + title + '">' + title + '</a></b></div>. Error info: The article already exists!');
				else
					$('#afcHelper_edit' + jqEsc(title)).html('<div class="notice"><b>Edit failed on <a href="' + wgArticlePath.replace("$1", encodeURI(title)) + '" title="' + title + '">' + title + '</a></b></div>. Error info: ' + error); 
			})
			.always( function () {
				$("#afcHelper_AJAX_finished_" + func_id).css("display", '');
			});
}	
//</nowiki>
