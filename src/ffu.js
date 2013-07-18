/* TODO - some notes

   * Need to integrate the two lists, so that sub.action=afcHelper_Submissions[i].action;
     and such works -- hmm...
       * afcHelper_Submissions contains the bullet points, broken down by link
       * afcHelper_ffuSubmissions, meanwhile, is broken down by file
*/

//<nowiki>
// Script should be located at [[MediaWiki:Gadget-afchelper.js/ffu.js]]
// WARNING: dysfunctional and in development
var afcHelper_ffuPageName = wgPageName.replace(/_/g, ' ');
var afcHelper_ffuSubmissions = new Array();
var afcHelper_ffuSections = new Array();
var afcHelper_numTotal = 0;
var afcHelper_AJAXnumber = 0;
var afcHelper_Submissions = new Array();

function afcHelper_ffu_init() {
	pagetext = afcHelper_getPageText(afcHelper_ffuPageName, false);
	// let the parsing begin.
	// first, strip out the parts before the first section.
	var section_re = /==[^=]*==/;
	pagetext = pagetext.substring(pagetext.search(section_re));
	// now parse it into sections.
	section_re = /==[^=]*==/g;
		var section_headers = pagetext.match(section_re);
		for (var i = 0; i < section_headers.length; i++) {
			var section_start = pagetext.indexOf(section_headers[i]);
			var section_text = pagetext.substring(section_start);
			if (i < section_headers.length - 1) {
				var section_end = section_text.substring(section_headers[i].length).indexOf(section_headers[i + 1]) + section_headers[i].length;
				section_text = section_text.substring(0, section_end);
			}
			afcHelper_ffuSections.push(section_text);
		}
 
	// parse the sections.
	for (var i = 0; i < afcHelper_ffuSections.length; i++) {
		var closed = /\{\{\s*ifu-c/i.test(afcHelper_ffuSections[i]);
		if (!closed) {
			// parse.
			var header = afcHelper_ffuSections[i].match(section_re)[0];
			header=header.slice(2, (header.length-2));
				var submission = {
					type : 'ffu',
					from : new Array(),
					section : i,
					to : '',
					title : header,
					notify : 1,
					talkpage : 1,
					append : '',
					recent : 1,
					recenttext : '',
					action : 'none',
					comment : ''
					};
 
					var urllinks_re = /(http|gopher|https|ftp|ftps)\:\/\/[^\s\n]*/gi;
				var links = afcHelper_ffuSections[i].match(urllinks_re);
				if (links === null){
					var linkscounter=1;
					var links = new Array();
						links.push('');
				}
				else
					var linkscounter=links.length;
				for (var j = 0; j < linkscounter; j++) {
					var sub = {
						type : 'ffu',
						to : header,
						id : afcHelper_numTotal,
						title : links[j],
						action : ''
					};
					if(j==0){
					submission.from.push(sub);
					afcHelper_Submissions.push(sub);
					afcHelper_numTotal++;
					}
					else
					{
						for (var k = 0; k < j; k++){
							if(links[j]!=links[k]){
								submission.from.push(sub);
								afcHelper_Submissions.push(sub);
								afcHelper_numTotal++;
							}
						}
					}
				}
				afcHelper_ffuSubmissions.push(submission);
		}
	}
	var text = '<h3>Reviewing Files for upload requests</h3>';
	// now layout the text.
	var afcHelper_ffu_empty = 1;
	var afcHelper_ffu_temp=new Array();
	for (var k = 0; k < afcHelper_ffuSubmissions.length; k++) {
		text += '<ul>';
		if (afcHelper_ffuSubmissions[k].type == 'ffu') {
			if (( typeof (afcHelper_ffuSubmissions[k].title) == 'undefined') || (afcHelper_ffuSubmissions[k].title == '')) {
				text += '<li><b>No headline \#' + afcHelper_ffu_empty + '</b>: <ul>';
				afcHelper_ffu_empty++;
			} else {
				text += '<li><b>'+afcHelper_ffuSubmissions[k].title +'</b>: <ul>';
				}
 
				var afcHelper_ffu_empty = 1;
				for (var l = 0; l < afcHelper_ffuSubmissions[k].from.length; l++) {
					var from = afcHelper_ffuSubmissions[k].from[l];
					text += '<li>Original URL: ';
				var temp = from.title;
				temp=temp.replace(/\s*/, '');
				if(temp==''){
					afcHelper_ffu_temp.push(from.id);
					text += '<b>no URL found!</b>';
					selectoptions=[{
					label : 'Accepted (already uploaded)',
					value : 'accept'
				}, {
					label : 'Decline',
					value : 'decline'
				}, {
					label : 'Set on hold',
					selected : true,
					value : 'hold'
				}, {
					label : 'Comment',
					value : 'comment'
				}, {
					label : 'None/ignore this URL',
					value : 'none'	}];
				}
				else{
					text += '<a href="' +from.title + '" target="_blank">' + from.title + '</a>';
					selectoptions=[{
					label : 'Accepted (already uploaded)',
					value : 'accept'
				}, {
					label : 'Decline',
					value : 'decline'
				}, {
					label : 'Set on hold',
					value : 'hold'
				}, {
					label : 'Comment',
					value : 'comment'
				}, {
					label : 'None/ignore this URL',
					selected : true,
					value : 'none'	}];
				}
				if(/flickr.com/gi.test(from.title))
					text += ' (<a href="http://toolserver.org/~bryan/flickr/upload?username=' +wgUserName+ '&link='+from.title+'" target="_blank"><b>launch Flickuploadbot</b></a> in a new window)';
				text += '<br/><label for="afcHelper_ffu_action_' + from.id + '">Action: </label>' + afcHelper_ffu_generateSelect('afcHelper_ffu_action_' + from.id, selectoptions, 'afcHelper_ffu_onActionChange(' + from.id + ')') + '<div id="afcHelper_ffu_extra_' + from.id + '"></div></li>';
			} 	
			text += '</ul></li>';
		}
		text += '</ul>';
	}
	text += '<input type="button" id="afcHelper_ffu_done_button" name="afcHelper_ffu_done_button" value="Done" onclick="afcHelper_ffu_performActions()" />';
	displayMessage(text);
	if(afcHelper_ffu_temp)
	{
		for(m=0; m<afcHelper_ffu_temp.length; m++)
			afcHelper_ffu_onActionChange(afcHelper_ffu_temp[m]);
	}
}
function afcHelper_ffu_onActionChange(id) {
	var extra = document.getElementById("afcHelper_ffu_extra_" + id);
	var selectValue = document.getElementById("afcHelper_ffu_action_" + id).value;
	if (selectValue == 'none')
		extra.innerHTML = '';
	else if (selectValue == 'accept') {
		extra.innerHTML = '<label for="afcHelper_ffu_to_' + id + '">Destination where you uploaded the file (without the <i>File:</i> part): </label><input type="text" ' + 'name="afcHelper_ffu_to_' + id + '" id="afcHelper_ffu_to_' + id + '" />'+
		'<br/><label for="afcHelper_ffu_comment_' + id + '">Comment:</label>' + '<input type="text" id="afcHelper_ffu_comment_' + id + '" name="afcHelper_ffu_comment_' + id + '"/>'+
		'<br/><label for="afcHelper_ffu_filetalkpage_' + id + '">Place {{subst:<a href="' + wgArticlePath.replace("$1", 'Template:WPAFCF') + '" title="Template:WPAFCF" target="_blank">WPAFCF</a>}} on the local files\'s decription\'s talk page: </label><input type="checkbox" id="afcHelper_ffu_filetalkpage_' + id + '" name="afcHelper_ffu_filetalkpage_' + id + '" checked="checked" onchange=afcHelper_trigger(\'afcHelper_ffu_append_' + id + '\') />'+
		'<br/><label for="afcHelper_ffu_append_' + id + '">Additional wikicode to append on the local talk page file (e.g. other WikiProjects): </label><input type="text" id="afcHelper_ffu_append_' + id + '" name="afcHelper_ffu_append_' + id +'"/>'+
		'<br/><label for="afcHelper_ffu_recent_' + id + '">Update <a href="' + wgArticlePath.replace("$1", 'Wikipedia:Files for upload/recent') + '" title="Wikipedia:Files for upload/recent" target="_blank">Wikipedia:Files for upload/recent</a>: </label><input type="checkbox" id="afcHelper_ffu_recent_' + id + '" name="afcHelper_ffu_recent_' + id + '" checked="checked"  onchange=afcHelper_trigger(\'afcHelper_ffu_recenttext_' + id + '\') />'+
		'<div id="afcHelper_ffu_recenttext_' + id + '"><label for="afcHelper_ffu_recenttext_' + id + '">File description for <a href="' + wgArticlePath.replace("$1", 'Wikipedia:Files for upload/recent') + '" title="Wikipedia:Files for upload/recent" target="_blank">Wikipedia:Files for upload/recent</a>: </label><input type="text" id="afcHelper_ffu_recenttext_' + id + '" name="afcHelper_ffu_recenttext_' + id + '"/></div>'+
		'<label for="afcHelper_ffu_notify_' + id + '">Notify requestor: </label>' + '<input type="checkbox" id="afcHelper_ffu_notify_' + id + '" name="afcHelper_ffu_notify_' + id + '" checked="checked" />'//+
		//'<br/><label for="afcHelper_ffu_addcomment_' + id + '">Additional comment for this page:</label>' + '<input type="text" id="afcHelper_ffu_addcomment_' + id + '" name="afcHelper_ffu_addcomment_' + id + '"/>';
	} else if (selectValue == 'decline') {
		extra.innerHTML = '<label for="afcHelper_ffu_decline_' + id + '">Reason for decline: </label>' + afcHelper_ffu_generateSelect('afcHelper_ffu_decline_' + id, [{
			label : 'Already exists',
			value : 'exists'
		}, {
			label : 'Blank request',
			value : 'blank'
		}, {
			label : 'Lack of response',
			value : 'lackof'
		}, {
			label : 'No permission',
			value : 'permission'
		}, {
			label : 'Copyrighted and non-free',
			value : 'copyrighted'
		}, {
			label : 'Not a FFU request',
			value : 'notffu'
		}, {
			label : 'Corrupt',
			value : 'corrupt'
		}, {
			label : 'Low quality',
			value : 'quality'
		}, {
			label : 'Redundant',
			value : 'redundant'
		}, {
			label : 'Useless',
			value : 'useless'
		}, {
			label : 'Nonsense',
			value : 'nonsense'
		}, {
			label : 'BLP',
			value : 'blp'
		}, {
			label : 'Advert',
			value : 'advert'
		}, {
			label : 'Vandalism',
			value : 'van'
		}, {
			label : 'Custom - reason below',
			selected : true,
			value : 'custom'
		}])+
		'<br/><label for="afcHelper_ffu_notify_' + id + '">Notify requestor: </label>' + '<input type="checkbox" id="afcHelper_ffu_notify_' + id + '" name="afcHelper_ffu_notify_' + id + '" checked="checked" />'//+
		//'<br/><label for="afcHelper_ffu_addcomment_' + id + '">Additional comment:</label>' + '<input type="text" id="afcHelper_ffu_addcomment_' + id + '" name="afcHelper_ffu_addcomment_' + id + '"/>';
	} else if (selectValue == 'hold') {
		extra.innerHTML = '<label for="afcHelper_ffu_hold_' + id + '">Reason for setting it on hold: </label>' + afcHelper_ffu_generateSelect('afcHelper_ffu_hold_' + id, [{
			label : 'On hold (generic)',
			value : 'h'
		}, {
			label : 'Article is at AFD',
			value : 'afd'
		}, {
			label : 'No URL',
			value : 'nourl'
		}])+
		'<br/><label for="afcHelper_ffu_notify_' + id + '">Notify requestor: </label>' + '<input type="checkbox" id="afcHelper_ffu_notify_' + id + '" name="afcHelper_ffu_notify_' + id + '" checked="checked" />'+
		'<br/><label for="afcHelper_ffu_comment_' + id + '">Additional comment:</label>' + '<input type="text" id="afcHelper_ffu_comment_' + id + '" name="afcHelper_ffu_comment_' + id + '"/>';
	 } else if (selectValue == 'comment') {
		extra.innerHTML = '<label for="afcHelper_ffu_comment_' + id + '">Placing a comment: </label>' + afcHelper_ffu_generateSelect('afcHelper_ffu_comment_' + id, [{
			label : 'No license',
			value : 'license'
		}, {
			label : 'License\'s link provides unsuitable license',
			value : 'flickr'
		}, {
			label : 'Please upload the image at Commons on your own',
			value : 'commons'
		}, {
			label : 'Non-free rationale needed',
			value : 'rat'
		}, {
			label : 'Custom - reason below',
			selected : true,
			value : 'custom'
		}]);
		if(document.getElementById('afcHelper_ffu_comment_' + id).value == 'custom')
			extra.innerHTML += '<br/><label for="afcHelper_ffu_comment_' + id + '">Additional comment:</label>' + '<input type="text" id="afcHelper_ffu_comment2_' + id + '" name="afcHelper_ffu_comment2_' + id + '"/>';
		extra.innerHTML += '<br/><label for="afcHelper_ffu_notify_' + id + '">Notify requestor: </label>' + '<input type="checkbox" id="afcHelper_ffu_notify_' + id + '" name="afcHelper_ffu_notify_' + id + '" checked="checked" />';
		}
	}
 
function afcHelper_ffu_performActions() {
	// Load all of the data.
for (var i = 0; i < afcHelper_Submissions.length; i++) {
	var action = document.getElementById("afcHelper_ffu_action_" + i).value;
	afcHelper_Submissions[i].action = action;
	console.log("Selected action:"+action)
	if (action == 'none')
		continue;
	if (action == 'accept') {
			afcHelper_Submissions[i].to = document.getElementById("afcHelper_ffu_to_" + i).value;
			afcHelper_Submissions[i].notify = document.getElementById("afcHelper_ffu_notify_" + i).value;
			afcHelper_Submissions[i].talkpage = document.getElementById("afcHelper_ffu_filetalkpage_" + i).value;
			afcHelper_Submissions[i].append = document.getElementById("afcHelper_ffu_append_" + i).value;
			afcHelper_Submissions[i].recent = document.getElementById("afcHelper_ffu_recent_" + i).value;
			afcHelper_Submissions[i].recenttext = document.getElementById("afcHelper_ffu_recenttext_" + i).value;
 
			/* We don't need this block; let's just let users enter wikicode...
			if (afcHelper_Submissions[i].append == 'custom') {
				afcHelper_Submissions[i].append = prompt("Please enter the template to append for " + afcHelper_Submissions[i].title + ". Do not include the curly brackets.");
			}
			if (afcHelper_Submissions[i].append == 'none' || afcHelper_Submissions[i].append == null)
				afcHelper_Submissions[i].append = '';
			else
				afcHelper_Submissions[i].append = '\{\{' + afcHelper_Submissions[i].append + '\}\}'; */
	} else if (action == 'decline') {
		afcHelper_Submissions[i].reason = document.getElementById('afcHelper_ffu_decline_' + i).value;
	}
	afcHelper_Submissions[i].comment = $('#afcHelper_ffu_comment_' + i).val();
}
// Data loaded. Show progress screen and get edit token and WP:FFU page text.
displayMessage('<ul id="afcHelper_status"></ul><ul id="afcHelper_finish"></ul>');
document.getElementById('afcHelper_finish').innerHTML += '<span id="afcHelper_finished_wrapper"><span id="afcHelper_finished_main" style="display:none"><li id="afcHelper_done"><b>Done (<a href="' + wgArticlePath.replace("$1", encodeURI(afcHelper_ffuPageName)) + '?action=purge" title="' + afcHelper_ffuPageName + '">Reload page</a>)</b></li></span></span>';
var token = mw.user.tokens.get('editToken');
pagetext = afcHelper_getPageText(afcHelper_ffuPageName, true);
var totalaccept = 0;
var totaldecline = 0;
var totalcomment = 0;
// traverse the submissions and locate the relevant sections.
for (var i = 0; i < afcHelper_ffuSubmissions.length; i++) {
	var sub = afcHelper_ffuSubmissions[i];
	console.log(sub)
	if (pagetext.indexOf(afcHelper_ffuSections[sub.section]) == -1) {
		// Someone has modified the section in the mean time. Skip.
		document.getElementById('afcHelper_status').innerHTML += '<li>Skipping ' + sub.title + ': Cannot find section. Perhaps it was modified in the mean time?</li>';
		continue;
	}
	var text = afcHelper_ffuSections[sub.section];
	var startindex = pagetext.indexOf(afcHelper_ffuSections[sub.section]);
	var endindex = startindex + text.length;
	
	sub.action=afcHelper_Submissions[i].action;
	console.log(sub.action)
		if (sub.action == 'accept'){
			//create local file description talkpage?
			if((sub.talkpage==true)&&(sub.to!='')){
				afcHelper_editPage('File talk\:'+afcHelper_Submissions[i].to, '\{\{subst:WPAFCF\}\}\n'+afcHelper_Submissions[i].append, token, 'Placing [[WP:AFC|WPAFC]] project banner', true);
					}

			//First notify the user so we don't have to process yet another signature
			//todo list: if more files in one request were handled
			if(sub.notify==true){
				//assuming the first User/IP is the requester
				var requestinguser=/\[\[(User[_ ]talk:|User:|Special:Contributions\/)([^\||\]\]]*)([^\]]*?)\]\]/i.exec(text)[2];
				var userpagetext = afcHelper_getPageText('User talk:'+requestinguser, true);
				if (sub.to === '')
					userpagetext += '\n== Your request at \[\[WP:FFU|Files for upload\]\] ==\n\{\{subst:ffu talk\}\} \~\~\~\~\n';
				else
					userpagetext += '\n== Your request at \[\[WP:FFU|Files for upload\]\] ==\n\{\{subst:ffu talk|file=' + afcHelper_Submissions[i].to + '\}\} \~\~\~\~\n';
				afcHelper_editPage('User talk:'+requestinguser, userpagetext, token, 'Notifying about the [[WP:FFU|FFU]] request', true);
					}
 
			//update text of the FFU page
			var header = text.match(/==[^=]*==/)[0];
			text = header + "\n\{\{subst:ffu a\}\}\n" + text.substring(header.length);
			if (sub.to === '')
				text += '\n*\{\{subst:ffu|a\}\} \~\~\~\~\n';
			else
				text += '\n*\{\{subst:ffu|file=' + sub.to + '\}\} \~\~\~\~\n';
			text += '\{\{subst:ffu b\}\}\n';
					totalaccept++;					
 
			// update [[Wikipedia:Files for upload/recent]]
			if(sub.recent==true){
				recenttext = afcHelper_getPageText('Wikipedia:Files_for_upload/recent',true)
				var newentry = "\|File:" + sub.to + "|" + ( typeof sub.filedescription  !== "undefined" ? sub.filedescription : "" ) + "\n";
				var lastentry = recenttext.toLowerCase().lastIndexOf("| file:");
				var firstentry = recenttext.toLowerCase().indexOf("| file:");
				recenttext = recenttext.substring(0, lastentry);
				recenttext = recenttext.substring(0, firstentry) + newentry + recenttext.substring(firstentry) + '\n}}';
				afcHelper_editPage("Wikipedia:Files for upload/recent", recenttext, token, 'Updating recently uploaded FFUs');
			}
		} else if (sub.action == 'decline') {
			var header = text.match(/==[^=]*==/)[0];
			var reason = sub.reason;
			console.log('Reason: '+reason)
			if (reason == '')
				reason = sub.comment;
			else if (sub.comment != '')
				reason = reason + ': ' + sub.comment;
			if (reason == '') {
				document.getElementById('afcHelper_status').innerHTML += '<li>Skipping ' + sub.title + ': No decline reason specified.</li>';
				continue;
			}
			text = header + "\n\{\{subst:ffu d\}\}\n" + text.substring(header.length);
			if (sub.comment == '')
				text += '\n*\{\{subst:ffu|' + sub.reason + '\}\} \~\~\~\~\n';
			else
				text += '\n*\{\{subst:ffu|' + sub.reason + '\}\} ' + sub.comment + ' \~\~\~\~\n';
			text += '\{\{subst:ffu b\}\}\n';
			console.log('Text: '+text)
			totaldecline++;

		} else if (sub.action == 'comment') {
			if (sub.comment != '')
				text += '\n\{\{subst:ffu|c\}\} ' + sub.comment + '\~\~\~\~\n';
					totalcomment++;
				}
			pagetext = pagetext.substring(0, startindex) + text + pagetext.substring(endindex);
		}
 
		var summary = "Updating submission status:";
if (totalaccept > 0)
	summary += " accepting " + totalaccept + " request" + (totalaccept > 1 ? 's' : '');
if (totaldecline > 0) {
	if (totalaccept > 0)
		summary += ',';
	summary += " declining " + totaldecline + " request" + (totaldecline > 1 ? 's' : '');
}
if (totalcomment > 0) {
	if (totalaccept > 0 || totaldecline > 0)
		summary += ',';
	summary += " commenting on " + totalcomment + " request" + (totalcomment > 1 ? 's' : '');
		}
 
		afcHelper_editPage(afcHelper_ffuPageName, pagetext, token, summary, false);
		document.getElementById('afcHelper_finished_main').style.display = '';
	}

	function afcHelper_ffu_generateSelect(title, options, onchange) {
		var text = '<select name="' + title + '" id="' + title + '" ';
if (onchange != null)
	text += 'onchange = "' + onchange + '" ';
text += '>';
for (var i = 0; i < options.length; i++) {
	var o = options[i];
	text += '<option value="' + afcHelper_escapeHtmlChars(o.value) + '" ';
	if (o.selected)
		text += 'selected="selected" ';
	text += '>' + o.label + '</option>';
}
text += "</select>";
		return text;
	}
 
// Create portlet link
var redirectportletLink = mw.util.addPortletLink('p-cactions', '#', 'Review', 'ca-afcHelper', 'Review', 'a');
// Bind click handler
$(redirectportletLink).click(function(e) {
	e.preventDefault();
	afcHelper_ffu_init();
});
//</nowiki>
