//<nowiki>
// Script should be located at [[MediaWiki:Gadget-afchelper.js/core.js]]

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

// Manually load mw.api() only if we're not using the gadget...with the gadget, it's already a dependency
if (BETA) mw.loader.load('mediawiki.api');

function afcHelper_generateSelect(title, options, onchange) {
	var menu = []; // use an array for speed
	menu.push('<select name="' + title + '" id="' + title + '" ');
	if (onchange !== null) menu.push('onchange = "' + onchange + '" ');
	menu.push('>');
	for (var i = 0; i < options.length; i++) {
		var o = options[i];
		menu.push('<option value="' + afcHelper_escapeHtmlChars(o.value) + '" ');
		if (o.selected) menu.push('selected="selected" ');
		if (o.disabled) menu.push('disabled ');
		menu.push('>' + o.label + '</option>');
	}
	menu.push("</select>");
	return menu.join();
}

function afcHelper_escapeHtmlChars(original) {
	return original.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function afcHelper_getPageText(title, show, redirectcheck) {
	if (show) document.getElementById('afcHelper_status').innerHTML += '<li id="afcHelper_get' + escape(title) + '">Getting <a href="' + wgArticlePath.replace("$1", encodeURI(title)) + '" title="' + title + '">' + title + '</a></li>';

	request = {
				'action': 'query',
				'prop': 'revisions',
				'rvprop': 'content',
				'format': 'json',
				'indexpageids': true,
				'titles' : title
			};
	if (redirectcheck) request.redirects = true;

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
		if (show) document.getElementById('afcHelper_get' + escape(title)).innerHTML = 'The page <a class="new" href="' + wgArticlePath.replace("$1", encodeURI(title)) + '" title="' + title + '">' + title + '</a> does not exist';
		return '';
	}
	var newtext = response['query']['pages'][pageid]['revisions'][0]['*'];
	if (redirectcheck && response['query']['redirects'] /* If &redirects if specified but there is no redirect, this stops us from getting an error */){
		var oldusername = response['query']['redirects'][0]['from'];
		var newusername = response['query']['redirects'][0]['to'];
		if ((typeof(oldusername) !== 'undefined') && (typeof(newusername) !== 'undefined') && (oldusername != newusername)){
			usertalkpage = newusername;
			if (show) {
				document.getElementById('afcHelper_status').innerHTML += '<li id="afcHelper_get' + escape(title) + '">Got <a href="' + wgArticlePath.replace("$1", encodeURI(title)) + '" title="' + newusername + '">' + newusername + '</a> (page was renamed from ' + oldusername + ')</li>';
			}
		} else {
			redirectcheck = false;
		}
	} else {
			redirectcheck = false;
	}		
	if (show && !redirectcheck)	document.getElementById('afcHelper_status').innerHTML += '<li id="afcHelper_get' + escape(title) + '">Got <a href="' + wgArticlePath.replace("$1", encodeURI(title)) + '" title="' + title + '">' + title + '</a></li>';
	return newtext;
}

function afcHelper_editPage(title, newtext, summary, createonly) {
	var edittoken = mw.user.tokens.get('editToken');
	summary += afcHelper_advert;
	$("#afcHelper_finished_wrapper").html('<span id="afcHelper_AJAX_finished_' + afcHelper_AJAXnumber + '" style="display:none">' + $("#afcHelper_finished_wrapper").html() + '</span>');
	var func_id = afcHelper_AJAXnumber;
	afcHelper_AJAXnumber++;
	document.getElementById('afcHelper_status').innerHTML += '<li id="afcHelper_edit' + escape(title) + '">Editing <a href="' + wgArticlePath.replace("$1", encodeURI(title)) + '" title="' + title + '">' + title + '</a></li>';
	request = {
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
					document.getElementById('afcHelper_edit' + escape(title)).innerHTML = 'Saved <a href="' + wgArticlePath.replace("$1", encodeURI(title)) + '" title="' + title + '">' + title + '</a>';
				} else {
					document.getElementById('afcHelper_edit' + escape(title)).innerHTML = '<div style="color:red"><b>Edit failed on <a href="' + wgArticlePath.replace("$1", encodeURI(title)) + '" title="' + title + '">' + title + '</a></b></div>. Error info:' + error;
				}
			} )
			.fail( function ( error ) {
				if (createonly && error == "articleexists")
					document.getElementById('afcHelper_edit' + escape(title)).innerHTML = '<div style="color:red"><b>Edit failed on <a href="' + wgArticlePath.replace("$1", encodeURI(title)) + '" title="' + title + '">' + title + '</a></b></div>. Error info: The article already exists!';
				else
					document.getElementById('afcHelper_edit' + escape(title)).innerHTML = '<div style="color:red"><b>Edit failed on <a href="' + wgArticlePath.replace("$1", encodeURI(title)) + '" title="' + title + '">' + title + '</a></b></div>. Error info:' + error;
			})
			.always( function () {
				$("#afcHelper_AJAX_finished_" + func_id).css("display", '');
			});
}	
//</nowiki>
