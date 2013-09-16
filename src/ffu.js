//<nowiki>
// Script should be located at [[MediaWiki:Gadget-afchelper.js/ffu.js]]
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
			header = header.slice(2, (header.length - 2));
			var submission = {
				type: 'ffu',
				from: new Array(),
				section: i,
				to: '',
				title: header,
				notify: 1,
				talkpage: 1,
				append: '',
				recent: 1,
				recenttext: '',
				action: 'none',
				comment: ''
			};
			var urllinks_re = /(http|gopher|https|ftp|ftps)\:\/\/[^\s\n]*/gi;
			var links = afcHelper_ffuSections[i].match(urllinks_re);
			if (links === null) {
				var linkscounter = 1;
				var links = new Array();
				links.push('');
			} else var linkscounter = links.length;
			for (var j = 0; j < linkscounter; j++) {
				var sub = {
					type: 'ffu',
					to: header,
					id: afcHelper_numTotal,
					title: links[j],
					action: ''
				};
				submission.from.push(sub);
				afcHelper_Submissions.push(sub);
				afcHelper_numTotal++;
			}
			afcHelper_ffuSubmissions.push(submission);
		} else {
			// if a submission has been "done" already, kill it with fire
			var sub = {
				type: 'done-ffu',
			};
			afcHelper_Submissions.push(sub);
			afcHelper_numTotal++;
		}
	}
	var afcHelper_ffu_temp = new Array();
	for (var k = 0; k < afcHelper_ffuSubmissions.length; k++) {
		var text = '<ul>';
		if (afcHelper_ffuSubmissions[k].type == 'ffu') {
			for (var l = 0; l < afcHelper_ffuSubmissions[k].from.length; l++) {
				var from = afcHelper_ffuSubmissions[k].from[l];
				text += '<li>Original URL: ';
				var temp = from.title;
				temp = temp.replace(/\s*/, '');
				if (temp == '') {
					afcHelper_ffu_temp.push(from.id);
					text += '<b>no URL found!</b>';
					selectoptions = [{
						label: 'Accepted (already uploaded)',
						value: 'accept'
					}, {
						label: 'Decline',
						value: 'decline'
					}, {
						label: 'Set on hold',
						selected: ((afcHelper_ffuSections[k].indexOf('on hold') == -1) ? true : false),
						value: 'hold'
					}, {
						label: 'Comment',
						value: 'comment'
					}, {
						label: 'None/ignore this URL',
						selected: ((afcHelper_ffuSections[k].indexOf('on hold') == -1) ? false : true),
						value: 'none'
					}];
				} else {
					text += '<a href="' + from.title + '" target="_blank">' + from.title + '</a>';
					selectoptions = [{
						label: 'Accepted (already uploaded)',
						value: 'accept'
					}, {
						label: 'Decline',
						value: 'decline'
					}, {
						label: 'Set on hold',
						value: 'hold'
					}, {
						label: 'Comment',
						value: 'comment'
					}, {
						label: 'None/ignore this URL',
						selected: true,
						value: 'none'
					}];
				}
				if (/flickr.com/gi.test(from.title)) text += ' (<a href="http:// toolserver.org/~bryan/flickr/upload?username=' + wgUserName + '&link=' + from.title + '" target="_blank"><b>launch Flickuploadbot</b></a> in a new window)';
				text += '<br/><label for="afcHelper_ffu_action_' + from.id + '">Action: </label>' + afcHelper_generateSelect('afcHelper_ffu_action_' + from.id, selectoptions, 'afcHelper_ffu_onActionChange(' + from.id + ')') + '<div id="afcHelper_ffu_extra_' + from.id + '"></div></li>';
			}
			text += '</ul></li>';
			text += '</ul>';
			text += '<input type="button" id="afcHelper_ffu_done_button" name="afcHelper_ffu_done_button" value="Done" onclick="afcHelper_ffu_performActions()" />';
			displayMessage_inline(text, 'ffu-review-' + afcHelper_ffuSubmissions[k].section);
		}
	}
	if (afcHelper_ffu_temp) {
		for (m = 0; m < afcHelper_ffu_temp.length; m++)
			afcHelper_ffu_onActionChange(afcHelper_ffu_temp[m]);
	}
}

function afcHelper_ffu_onActionChange(id) {
	var extra = $("#afcHelper_ffu_extra_" + id);
	var selectValue = $("#afcHelper_ffu_action_" + id).val();
	if (selectValue == 'none') extra.html('');
	else if (selectValue == 'accept') {
		extra.html('<label for="afcHelper_ffu_to_' + id + '">Destination where you uploaded the file (without the <i>File:</i> part): </label><input type="text" ' + 'name="afcHelper_ffu_to_' + id + '" id="afcHelper_ffu_to_' + id + '" />' +      
		'<br/><label for="afcHelper_ffu_comment_' + id + '">Comment:</label>' + '<input type="text" id="afcHelper_ffu_comment_' + id + '" name="afcHelper_ffu_comment_' + id + '"/>' +
		'<br/><label for="afcHelper_ffu_filetalkpage_' + id + '">Place {{subst:<a href="' + wgArticlePath.replace("$1", 'Template:WPAFCF') + '" title="Template:WPAFCF" target="_blank">WPAFCF</a>}} on the local files\'s decription\'s talk page: </label><input type="checkbox" id="afcHelper_ffu_filetalkpage_' + id + '" name="afcHelper_ffu_filetalkpage_' + id + '" checked="checked" />' +
		'<br/><label for="afcHelper_ffu_append_' + id + '">Additional wikicode to append on the local talk page file (e.g. other WikiProjects): </label><input type="text" id="afcHelper_ffu_append_' + id + '" name="afcHelper_ffu_append_' + id + '"/>' +
		'<br/><label for="afcHelper_ffu_recent_' + id + '">Is the file freely licensed? (auto-update <a href="' + wgArticlePath.replace("$1", 'Wikipedia:Files for upload/recent') + '" title="Wikipedia:Files for upload/recent" target="_blank">Wikipedia:Files for upload/recent</a>): </label><input type="checkbox" id="afcHelper_ffu_recent_' + id + '" name="afcHelper_ffu_recent_' + id + '" />' +
		'<br/><label for="afcHelper_ffu_recenttext_' + id + '">File description for <a href="' + wgArticlePath.replace("$1", 'Wikipedia:Files for upload/recent') + '" title="Wikipedia:Files for upload/recent" target="_blank">Wikipedia:Files for upload/recent</a>: </label><input type="text" id="afcHelper_ffu_recenttext_' + id + '" name="afcHelper_ffu_recenttext_' + id + '"/>' +
		'<br/><label for="afcHelper_ffu_notify_' + id + '">Notify requestor: </label>' + '<input type="checkbox" id="afcHelper_ffu_notify_' + id + '" name="afcHelper_ffu_notify_' + id + '" checked="checked" />');     
		// !todo Only show the recenttext option if `recent` is checked
	} else if (selectValue == 'decline') {
		extra.html('<label for="afcHelper_ffu_decline_' + id + '">Reason for decline: </label>' + afcHelper_generateSelect('afcHelper_ffu_decline_' + id, [{ 
			label: 'Not a FFU request',
			value: 'notffu'
		}, {
			label: 'No permission',
			value: 'permission'
		}, {
			label: 'Copyrighted and non-free',
			value: 'copyrighted'
		}, {
			label: 'Corrupt',
			value: 'corrupt'
		}, {
			label: 'Blank',
			value: 'blank'
		}, {
			label: 'Low quality',
			value: 'quality'
		}, {
			label: 'Redundant/already exists',
			value: 'redundant'
		}, {
			label: 'Useless',
			value: 'useless'
		}, {
			label: 'Nonsense',
			value: 'nonsense'
		}, {
			label: 'BLP/attack',
			value: 'blp'
		}, {
			label: 'Advert',
			value: 'advert'
		}, {
			label: 'Vandalism',
			value: 'van'
		}, {
			label: 'Lack of response',
			value: 'lackof'
		}, {
			label: 'Broken or invalid URL',
			value: 'badlink'
		}, {
			label: 'Custom - reason below',
			selected: true,
			value: 'custom'
		}]) + '<br/><label for="afcHelper_ffu_addcomment_' + id + '">Additional comment:</label>' + '<input type="text" id="afcHelper_ffu_comment_' + id + '" name="afcHelper_ffu_comment_' + id + '"/>' + '<br/><label for="afcHelper_ffu_notify_' + id + '">Notify requestor: </label>' + '<input type="checkbox" id="afcHelper_ffu_notify_' + id + '" name="afcHelper_ffu_notify_' + id + '" checked="checked" />');
	} else if (selectValue == 'hold') {
		extra.html('<label for="afcHelper_ffu_hold_' + id + '">Reason for setting it on hold: </label>' + afcHelper_generateSelect('afcHelper_ffu_hold_' + id, [{
			label: 'On hold (generic)',
			value: 'h'
		}, {
			label: 'Article is at AfD',
			value: 'afd'
		}, {
			label: 'Pending AfC submission',
			value: 'afc'
		}, {
			label: 'No URL',
			value: 'nourl'
		}]) + '<br/><label for="afcHelper_ffu_comment_' + id + '">Additional comment: </label>' + '<input type="text" id="afcHelper_ffu_comment_' + id + '" name="afcHelper_ffu_comment_' + id + '"/>' + '<br/><label for="afcHelper_ffu_notify_' + id + '">Notify requestor: </label>' + '<input type="checkbox" id="afcHelper_ffu_notify_' + id + '" name="afcHelper_ffu_notify_' + id + '" checked="checked" />'); 
	} else if (selectValue == 'comment') {
		extra.html('<label for="afcHelper_ffu_prefmtcomment_' + id + '">Adding a comment: </label>' + afcHelper_generateSelect('afcHelper_ffu_prefmtcomment_' + id, [{
			label: 'No license',
			value: 'license'
		}, {
			label: 'License\'s link provides unsuitable license',
			value: 'flickr'
		}, {
			label: 'Please upload the image at Wikimedia Commons on your own',
			value: 'commons'
		}, {
			label: 'Non-free rationale needed',
			value: 'rat'
		}, {
			label: 'Custom - comment below',
			selected: true,
			value: 'custom'
		}]));
		extra.html(extra.html() + '<br/><label for="afcHelper_ffu_comment_' + id + '">Additional comment: </label>' + '<input type="text" id="afcHelper_ffu_comment_' + id + '" name="afcHelper_ffu_comment_' + id + '"/>');
		extra.html(extra.html() + '<br/><label for="afcHelper_ffu_notify_' + id + '">Notify requestor: </label>' + '<input type="checkbox" id="afcHelper_ffu_notify_' + id + '" name="afcHelper_ffu_notify_' + id + '" checked="checked" />');
	}
}

function afcHelper_ffu_performActions() {
	// Load all of the data.
	for (var i = 0; i < afcHelper_Submissions.length; i++) {
		if (afcHelper_Submissions[i].type == 'ffu') {
			var action = $("#afcHelper_ffu_action_" + i).val();
			afcHelper_Submissions[i].action = action;
			if (action == 'none') continue;
			if (action == 'accept') {
				afcHelper_Submissions[i].to = $("#afcHelper_ffu_to_" + i).val();
				afcHelper_Submissions[i].talkpage = $("#afcHelper_ffu_filetalkpage_" + i).attr("checked");				afcHelper_Submissions[i].append = $("#afcHelper_ffu_append_" + i).val();
				afcHelper_Submissions[i].recent = $("#afcHelper_ffu_recent_" + i).attr("checked");
				afcHelper_Submissions[i].recenttext = $("#afcHelper_ffu_recenttext_" + i).val();
			} else if (action == 'decline') {
				afcHelper_Submissions[i].reason = $('#afcHelper_ffu_decline_' + i).val();
			} else if (action == 'hold') {
				afcHelper_Submissions[i].holdrat = $('#afcHelper_ffu_hold_' + i).val();
			} else if (action == 'comment') {
				afcHelper_Submissions[i].prefmtcomment = $("#afcHelper_ffu_prefmtcomment_" + i).val();
			}
			afcHelper_Submissions[i].comment = $("#afcHelper_ffu_comment_" + i).val();
			afcHelper_Submissions[i].notify = $("#afcHelper_ffu_notify_" + i).attr("checked");
		}
	}
	// Data loaded. Show progress screen and get WP:FFU page text.
	displayMessage('<ul><li><b>Now processing...</li></ul><ul id="afcHelper_status"></ul><ul id="afcHelper_finish"></ul>');
	$("html, body").animate({
		scrollTop: 0
	}, "slow"); // Takes up back up to the top for the displayMessage() dialog, __slowly__
	$('afcHelper_finish').innerHTML += '<span id="afcHelper_finished_wrapper"><span id="afcHelper_finished_main" style="display:none"><li id="afcHelper_done"><b>Done (<a href="' + wgArticlePath.replace("$1", encodeURI(afcHelper_ffuPageName)) + '?action=purge" title="' + afcHelper_ffuPageName + '">Reload page</a>)</b></li></span></span>';
	pagetext = afcHelper_getPageText(afcHelper_ffuPageName, true);
	var totalaccept = 0;
	var totaldecline = 0;
	var totalcomment = 0;
	// traverse the submissions and locate the relevant sections.
	for (var i = 0; i < afcHelper_ffuSubmissions.length; i++) {
		var sub = afcHelper_ffuSubmissions[i];
		if (pagetext.indexOf(afcHelper_ffuSections[sub.section]) == -1) {
			// Someone has modified the section in the mean time. Skip.
			$('#afcHelper_status').html($('#afcHelper_status').html() + '<li>Skipping ' + sub.title + ': Cannot find section. Perhaps it was modified in the mean time?</li>');
			continue;
		}
		var origtext = afcHelper_ffuSections[sub.section];
		var text = afcHelper_ffuSections[sub.section];
		var startindex = pagetext.indexOf(afcHelper_ffuSections[sub.section]);
		var endindex = startindex + text.length;
		for (var count = 0; count < sub.from.length; count++) {
			if (text === origtext) { // This way, we don't modify a section more than once
				var mainid = sub.from[count].id;
				var sub_m = afcHelper_Submissions[mainid];
				// First notify the user so we don't have to process yet another signature
				// todo list: if more files in one request were handled, only notify once (would require change in structure of program)
				if ((sub_m.action != 'none') && (sub_m.notify == true)) {
					// assuming the first User/IP is the requester
					match = /\[\[(?:User[_ ]talk:|User:|Special:Contributions\/)([^\||\]\]]*)([^\]]*?)\]\]/i.exec(text)
					// only notify if we can find a user to notify
					if (match) {
						var requestinguser = match[1];
						var userpagetext = afcHelper_getPageText('User talk:' + requestinguser, true);
						if (sub_m.action == 'decline') userpagetext += '\n== Your request at \[\[WP:FFU|Files for upload\]\] ==\n\{\{subst:ffu talk|decline\}\} \~\~\~\~\n';
						else if (sub_m.action == 'comment') userpagetext += '\n== Your request at \[\[WP:FFU|Files for upload\]\] ==\n\{\{subst:ffu talk|comment\}\} \~\~\~\~\n';
						else if (sub_m.action == 'hold') userpagetext += '\n== Your request at \[\[WP:FFU|Files for upload\]\] ==\n\{\{subst:ffu talk|h\}\} \~\~\~\~\n';
						else if (sub_m.action == 'accept') if (sub_m.to === '') userpagetext += '\n== Your request at \[\[WP:FFU|Files for upload\]\] ==\n\{\{subst:ffu|comment\}\} \~\~\~\~\n';
						else userpagetext += '\n== Your request at \[\[WP:FFU|Files for upload\]\] ==\n\{\{subst:ffu talk|file=' + sub_m.to + '\}\} \~\~\~\~\n';
						afcHelper_editPage('User talk:' + requestinguser, userpagetext, 'Notifying user about [[WP:FFU|FFU]] request', false);
					} else {
						$('#afcHelper_status').html($('#afcHelper_status').html() += '<li>Unable to notify user for ' + sub.title + ': Could not find a username to notify!</li>');
					}
				}
				if (sub_m.action == 'accept') {
					// create local file description talkpage
					if ((sub_m.talkpage == true) && (sub_m.to != '')) {
						afcHelper_editPage('File talk\:' + sub_m.to, '\{\{subst:WPAFCF\}\}\n' + sub_m.append, 'Placing [[WP:AFC|WPAFC]] project banner', true);
					}
					// update text of the FFU page
					var header = text.match(/==[^=]*==/)[0];
					text = header + "\n\{\{subst:ffu a\}\}\n" + text.substring(header.length);
					if (sub_m.to === '') text += '\n*\{\{subst:ffu|a\}\} \~\~\~\~\n';
					else text += '\n*\{\{subst:ffu|file=' + sub_m.to + '\}\} \~\~\~\~\n';
					text += '\{\{subst:ffu b\}\}\n';
					totalaccept++;
					// update [[Wikipedia:Files for upload/recent]]
					if (sub_m.recent == true) {
						recentpagetext = afcHelper_getPageText('Wikipedia:Files_for_upload/recent', true)
						var newentry = "\| File:" + sub_m.to + " | " + (typeof sub_m.recenttext !== "undefined" ? sub_m.recenttext : "") + "\n";
						var lastentry = recentpagetext.toLowerCase().lastIndexOf("| file:");
						var firstentry = recentpagetext.toLowerCase().indexOf("| file:");
						recentpagetext = recentpagetext.substring(0, lastentry);
						recentpagetext = recentpagetext.substring(0, firstentry) + newentry + recentpagetext.substring(firstentry) + '}}';
						afcHelper_editPage("Wikipedia:Files for upload/recent", recentpagetext, 'Updating recently uploaded FFUs', false);
					}
				} else if (sub_m.action == 'decline') {
					var header = text.match(/==[^=]*==/)[0];
					if (sub_m.reason == 'custom' && sub_m.comment == '') {
						$('#afcHelper_status').html($('#afcHelper_status').html() + '<li>Skipping ' + sub_m.title + ': No decline reason specified.</li>');
						continue;
					}
					text = header + "\n\{\{subst:ffu d\}\}\n" + text.substring(header.length);
					if (sub_m.comment == '') text += '\n*\{\{subst:ffu|' + sub_m.reason + '\}\} \~\~\~\~\n';
					else if (sub_m.reason == 'custom') text += '\n*{{subst:ffu|d}} ' + sub_m.comment + ' \~\~\~\~\n';
					else text += '\n*\{\{subst:ffu|' + sub_m.reason + '\}\} ' + sub_m.comment + ' \~\~\~\~\n';
					text += '\{\{subst:ffu b\}\}\n';
					totaldecline++;
				} else if (sub_m.action == 'comment') {
					if ((sub_m.prefmtcomment != '') && (sub_m.prefmtcomment != 'custom')) {
						if (sub_m.comment == '') text += '\n:\{\{subst:ffu|' + sub_m.prefmtcomment + '\}\} \~\~\~\~\n';
						else text += '\n:\{\{subst:ffu|' + sub_m.prefmtcomment + '\}\} ' + sub_m.comment + ' \~\~\~\~\n';
					} else if (sub_m.comment != '') {
						text += '\n:\{\{subst:ffu|c\}\} ' + sub_m.comment + ' \~\~\~\~\n';
					}
					totalcomment++;
				} else if (sub_m.action == 'hold') {
					if (sub_m.comment == '') text += '\n:\{\{subst:ffu|' + sub_m.holdrat + '\}\} \~\~\~\~\n';
					else text += '\n:\{\{subst:ffu|' + sub_m.holdrat + '\}\} ' + sub_m.comment + ' \~\~\~\~\n';
					totalcomment++; // a "hold" is basically equal to a comment
				}
				pagetext = pagetext.substring(0, startindex) + text + pagetext.substring(endindex);
			}
		}
	}
	// Here's where we generate the summary
	var summary = "Updating submission status:";
	if (totalaccept > 0) summary += " accepting " + totalaccept + " request" + (totalaccept > 1 ? 's' : '');
	if (totaldecline > 0) {
		if (totalaccept > 0) summary += ',';
		summary += " declining " + totaldecline + " request" + (totaldecline > 1 ? 's' : '');
	}
	if (totalcomment > 0) {
		if (totalaccept > 0 || totaldecline > 0) summary += ',';
		summary += " commenting on " + totalcomment + " request" + (totalcomment > 1 ? 's' : '');
	}

	// Clean up the page
	pagetext = pagetext.replace(/[\n\r]{3,}/g,"\n\n");
	pagetext = pagetext.replace(/[\n\r]+==/g,"\n\n==");

	// And now finally update the WP:FFU page
	afcHelper_editPage(afcHelper_ffuPageName, pagetext, summary, false);
	$('#afcHelper_finished_main').css("display", "");
}

function add_review_links() {
	// Based on [[User:Writ_Keeper/Scripts/autoCloser.js]]
	var sectionHeaders = $("#mw-content-text h2");
	var offset = 1;
	sectionHeaders.each(function(index, element) {
		var not_archived = $(element).next().html().indexOf('This is an archived discussion.') == -1;
		if (index > 0) // Hack so we don't add display-messsage inside the TOC
			var idtitle = "ffu-review-" + (index - 1);
		$('<div id="' + idtitle + '" style="display:none;"></div>').insertAfter(element);
		var editSectionLink = $(element).children(".mw-editsection");
		if ((editSectionLink.length > 0) && (not_archived)) {
			editSectionLink = editSectionLink[0];
			var reviewlink = document.createElement("a");
			reviewlink.href = "#" + idtitle;
			$(reviewlink).attr("sectionIndex", index + offset);
			reviewlink.innerHTML = "Review request";
			var editSectionContents = $(editSectionLink).html();
			editSectionLink.innerHTML = "[";
			editSectionLink.appendChild(reviewlink);
			editSectionLink.innerHTML = editSectionLink.innerHTML + "] " + editSectionContents;
			reviewlink.onclick = (function() {
				$(reviewlink).html("Reviewing requests...");
				afcHelper_ffu_init();
			});
		} else {
			offset = offset - 1;
		}
	});
	$("#bodyContent [sectionIndex]").click((function() {
		$("#bodyContent [sectionIndex]").each(function(i) {
			$(this).html("Reviewing requests...");
		});
		afcHelper_ffu_init();
	}));
}

function displayMessage_inline(message, div, className) {
	// a reimplementation of [[User:Timotheus Canens/displaymessage.js]] that displays messages inline
	var divtitle = '#' + div
	if (!arguments.length || message === '' || message === null) {
		$(divtitle).empty().hide();
		return true; // Emptying and hiding message is intended behaviour, return true
	} else {
		// We special-case skin structures provided by the software. Skins that
		// choose to abandon or significantly modify our formatting can just define
		// an mw-js-message div to start with.
		var $messageDiv = $(divtitle);
		$messageDiv.attr('style', "margin:1em;padding:0.5em 2.5%;border:solid 1px #ddd;background-color:#fcfcfc");
		if (!$messageDiv.length) {
			if (mw.util.$content.length) {
				mw.util.$content.prepend($messageDiv);
			} else {
				return false;
			}
		}
		if (typeof message === 'object') {
			$messageDiv.empty();
			$messageDiv.append(message);
		} else {
			$messageDiv.html(message);
		}
		$messageDiv.slideDown();
		return true;
	}
}
add_review_links();
