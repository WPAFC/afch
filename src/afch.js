////////////////////////////////////////////
// Yet another AfC helper script
////////////////////////////////////////////
// Home page and documentation: <http://en.wikipedia.org/wiki/Wikipedia:WikiProject_Articles_for_creation/Helper_script>
// Development: <https://github.com/WikiProject-Articles-for-creation/afch>
////////////////////////////////////////////
//<nowiki>
if ((wgPageName.indexOf('Wikipedia:Articles_for_creation') !== -1) || (wgPageName.indexOf('Wikipedia_talk:Articles_for_creation') !== -1) || (wgPageName.indexOf('Wikipedia:Files_for_upload') !== -1) || (wgPageName.indexOf('User:*') !== -1)) {
	var afchelper_baseurl = mw.config.get('wgServer') + '/w/index.php?action=raw&ctype=text/javascript&title=MediaWiki:Gadget-afchelper.js';
	importScriptURI(afchelper_baseurl + '/core.js');
}
//</nowiki>
