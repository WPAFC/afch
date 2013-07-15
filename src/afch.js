////////////////////////////////////////////
// Yet another AfC helper script
// v4.1.20b3
////////////////////////////////////////////
// Home page and documentation: <http://en.wikipedia.org/wiki/Wikipedia:WikiProject_Articles_for_creation/Helper_script>
// Development: <https://github.com/WikiProject-Articles-for-creation/afch>
////////////////////////////////////////////
//<nowiki>
if ((wgPageName.indexOf('Wikipedia:Articles_for_creation') !== -1) || (wgPageName.indexOf('Wikipedia_talk:Articles_for_creation') !== -1) || (wgPageName.indexOf('Wikipedia:Files_for_Upload') !== -1) || (wgPageName.indexOf('User:*') !== -1)) {
	importScript('User:Timotheus Canens/displaymessage.js');
	importScriptURI('/core.js');
	var afcHelper_advert = ' ([[WP:AFCH|AFCH]])';
	var pagetext = '';
	var usertalkpage = '';
	
	function afcHelper_escapeHtmlChars(original) {
		return original.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
	}

	if (wgPageName.indexOf('Wikipedia:Articles_for_creation/Redirects') !== -1) {
		importScriptURI('/redirects.js');
	} else if ((wgPageName.indexOf('Wikipedia:Articles_for_creation/') !== -1)
	            || (wgPageName.indexOf('Wikipedia_talk:Articles_for_creation/') !== -1)
	            || (wgPageName.indexOf('User:') !== -1)
	            || (wgPageName.indexOf('User_talk:') !== -1)
	            ){
		importScriptURI('/submissions.js');				
	}
}
//</nowiki>
