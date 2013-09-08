//<nowiki>
// Script should be located at [[MediaWiki:Gadget-afchelper.js/redirects.js]]
var afcHelper_RedirectPageName = wgPageName.replace(/_/g, ' ');
var afcHelper_RedirectSubmissions = new Array();
var afcHelper_RedirectSections = new Array();
var afcHelper_numTotal = 0;
var afcHelper_AJAXnumber = 0;
var afcHelper_Submissions = new Array();
var afcHelper_redirectDecline_reasonhash = {
	'exists': 'The title you suggested already exists on Wikipedia',
	'blank': 'We cannot accept empty submissions',
	'notarget': ' A redirect cannot be created unless the target is an existing article. Either you have not specified the target, or the target does not exist',
	'unlikely': 'The title you suggested seems unlikely. Could you provide a source showing that it is a commonly used alternate name?',
	'notredirect': 'This request is not a redirect request',
	'custom': ''
};
var afcHelper_categoryDecline_reasonhash = {
	'exists': 'The category you suggested already exists on Wikipedia',
	'blank': 'We cannot accept empty submissions',
	'unlikely': 'It seems unlikely that there are enough pages to support this category',
	'notcategory': 'This request is not a category request',
	'custom': ''
};

function afcHelper_redirect_init() {
	afcHelper_RedirectSubmissions = new Array();
	afcHelper_RedirectSections = new Array();
	afcHelper_numTotal = 0;

	pagetext = afcHelper_getPageText(afcHelper_RedirectPageName, false);
	// let the parsing begin.
	// first, strip out the parts before the first section.
	var section_re = /==[^=]*==/;
	pagetext = pagetext.substring(pagetext.search(section_re));

	// now parse it into sections.
	//		section_re = /==\s*\[\[(\s*[^=]*)\]\]\s*==/g;
	var section_re = /==[^=]*==/g;
	var section_headers = pagetext.match(section_re);
	for (var i = 0; i < section_headers.length; i++) {
		var section_start = pagetext.indexOf(section_headers[i]);
		var section_text = pagetext.substring(section_start);
		if (i < section_headers.length - 1) {
			var section_end = section_text.substring(section_headers[i].length).indexOf(section_headers[i + 1]) + section_headers[i].length;
			section_text = section_text.substring(0, section_end);
		}
		afcHelper_RedirectSections.push(section_text);
	}

	// parse the sections.
	for (var i = 0; i < afcHelper_RedirectSections.length; i++) {
		var closed = /\{\{\s*afc(?!\s+comment)/i.test(afcHelper_RedirectSections[i]);
		if (!closed) {
			// parse.
			var header = afcHelper_RedirectSections[i].match(section_re)[0];
			if (header.search(/Redirect request/i) !== -1) {
				var wikilink_re = /\[\[(\s*[^=]*?)*?\]\]/g;
				var links = header.match(wikilink_re);
				if (!links) continue;
				for (var j = 0; j < links.length; j++) {
					links[j] = links[j].replace(/[\[\]]/g, '');
					if (links[j].charAt(0) === ':') links[j] = links[j].substring(1);
				}
				var re = /Target of redirect:\s*\[\[([^\[\]]*)\]\]/i;
				re.test(afcHelper_RedirectSections[i]);
				var to = RegExp.$1;
				var submission = {
					type: 'redirect',
					from: new Array(),
					section: i,
					to: to,
					title: to
				};
				for (var j = 0; j < links.length; j++) {
					var sub = {
						type: 'redirect',
						to: to,
						id: afcHelper_numTotal,
						title: links[j],
						action: ''
					};
					submission.from.push(sub);
					afcHelper_Submissions.push(sub);
					afcHelper_numTotal++;
				}
				afcHelper_RedirectSubmissions.push(submission);
			} else if (header.search(/Category request/i) !== -1) {
				var wikilink_re = /\[\[[^\[\]]+\]\]/g;
				var links = header.match(wikilink_re);
				if (!links) continue;
				// figure out the parent category.
				var idx = afcHelper_RedirectSections[i].substring(header.length).search(/\[\[\s*:\s*(Category:[^\]\[]*)\]\]/i);
				var parent = '';
				if (idx !== -1) parent = RegExp.$1;
				parent = parent.replace(/:\s*/g, ':');
				for (var j = 0; j < links.length; j++) {
					links[j] = links[j].replace(/[\[\]]/g, '');
					links[j] = links[j].replace(/Category\s*:\s*/gi, 'Category:');
					if (links[j].charAt(0) === ':') links[j] = links[j].substring(1);

					var submission = {
						type: 'category',
						title: links[j],
						section: i,
						id: afcHelper_numTotal,
						action: '',
						parent: parent
					};
					afcHelper_numTotal++;
					afcHelper_RedirectSubmissions.push(submission);
					afcHelper_Submissions.push(submission);
				}
			}
		}
	}
	var text = '<h3>Reviewing AFC redirect requests</h3>';
	// now layout the text.
	var afcHelper_Redirect_empty = 1;
	for (var k = 0; k < afcHelper_RedirectSubmissions.length; k++) {
		text += '<ul>';
		if (afcHelper_RedirectSubmissions[k].type === 'redirect') {
			text += '<li>Redirect(s) to ';
			if (afcHelper_RedirectSubmissions[k] === '' || afcHelper_RedirectSubmissions[k] === ' ') {
				text += 'Empty submission \#' + afcHelper_Redirect_empty + '<ul>';
				afcHelper_Redirect_empty++;
			} else text += '<a href="' + wgArticlePath.replace("$1", encodeURIComponent(afcHelper_RedirectSubmissions[k].to)) + '">' + afcHelper_RedirectSubmissions[k].to + '</a>: <ul>';
			for (var l = 0; l < afcHelper_RedirectSubmissions[k].from.length; l++) {
				var from = afcHelper_RedirectSubmissions[k].from[l];
				text += "<li>From: " + from.title + '<br/><label for="afcHelper_redirect_action_' + from.id + '">Action: </label>' + afcHelper_generateSelect('afcHelper_redirect_action_' + from.id, [{
					label: 'Accept',
					value: 'accept'
				}, {
					label: 'Decline',
					value: 'decline'
				}, {
					label: 'Comment',
					value: 'comment'
				}, {
					label: 'None',
					selected: true,
					value: 'none'
				}], 'afcHelper_redirect_onActionChange(' + from.id + ')') + '<div id="afcHelper_redirect_extra_' + from.id + '"></div></li>';
			}
			text += '</ul></li>';
		} else {
			text += '<li>Category submission: ' + afcHelper_RedirectSubmissions[k].title;
			text += '<br/> <label for="afcHelper_redirect_action_' + afcHelper_RedirectSubmissions[k].id + '">Action: </label>' + afcHelper_generateSelect('afcHelper_redirect_action_' + afcHelper_RedirectSubmissions[k].id, [{
				label: 'Accept',
				value: 'accept'
			}, {
				label: 'Decline',
				value: 'decline'
			}, {
				label: 'Comment',
				value: 'comment'
			}, {
				label: 'None',
				selected: true,
				value: 'none'
			}], 'afcHelper_redirect_onActionChange(' + afcHelper_RedirectSubmissions[k].id + ')') + '<div id="afcHelper_redirect_extra_' + afcHelper_RedirectSubmissions[k].id + '"></div></li>';
		}
		text += '</ul>';
	}
	text += '<input type="button" id="afcHelper_redirect_done_button" name="afcHelper_redirect_done_button" value="Done" onclick="afcHelper_redirect_performActions()" />';
	displayMessage(text);
}

function afcHelper_redirect_onActionChange(id) {
	var extra = $("#afcHelper_redirect_extra_" + id);
	var selectValue = $("#afcHelper_redirect_action_" + id).val();
	if (selectValue === 'none') extra.html('');
	else if (selectValue === 'accept') {
		if (afcHelper_Submissions[id].type === 'redirect') {
			extra.html(extra.html() + '<label for="afcHelper_redirect_from_' + id + '">From: </label><input type="text" ' + 'name="afcHelper_redirect_from_' + id + '" id="afcHelper_redirect_from_' + id + '" value="' + afcHelper_escapeHtmlChars(afcHelper_Submissions[id].title) + '" />');
			extra.html(extra.html() + '&nbsp;<label for="afcHelper_redirect_to_' + id + '">To: </label><input type="text" ' + 'name="afcHelper_redirect_to_' + id + '" id="afcHelper_redirect_to_' + id + '" value="' + afcHelper_escapeHtmlChars(afcHelper_Submissions[id].to) + '" />');
			extra.html(extra.html() + '<label for="afcHelper_redirect_append_' + id + '">Template to append: </label>' + afcHelper_generateSelect('afcHelper_redirect_append_' + id, [{
				label: 'R from alternative name',
				value: 'R from alternative name'
			}, {
				label: 'R from alternative language',
				value: 'R from alternative language'
			}, {
				label: 'R from alternative spelling',
				value: 'R from alternative spelling'
			}, {
				label: 'R to section',
				value: 'R to section'
			}, {
				label: 'R to disambiguation page',
				value: 'R to disambiguation page'
			}, {
				label: 'R from title with diacritics',
				value: 'R from title with diacritics'
			}, {
				label: 'Custom - prompt me',
				value: 'custom'
			}, {
				label: 'None',
				selected: true,
				value: 'none'
			}]));
		} else {
			extra.html('<label for="afcHelper_redirect_name_' + id + '">name: </label><input type="text" ' + 'name="afcHelper_redirect_name_' + id + '" id="afcHelper_redirect_name_' + id + '" value="' + afcHelper_escapeHtmlChars(afcHelper_Submissions[id].title) + '" />');
			extra.html(extra.html() + '<label for="afcHelper_redirect_parent_' + id + '">Parent category:</label>' + '<input type="text" id="afcHelper_redirect_parent_' + id + '" name="afcHelper_redirect_parent_' + id + '" value="' + afcHelper_escapeHtmlChars(afcHelper_Submissions[id].parent) + '" />');
		}
		extra.html(extra.html() + '<label for="afcHelper_redirect_comment_' + id + '">Comment:</label>' + '<input type="text" id="afcHelper_redirect_comment_' + id + '" name="afcHelper_redirect_comment_' + id + '"/>');
	} else if (selectValue === 'decline') {
		if (afcHelper_Submissions[id].type === 'redirect') {
			extra.html('<label for="afcHelper_redirect_decline_' + id + '">Reason for decline: </label>' + afcHelper_generateSelect('afcHelper_redirect_decline_' + id, [{				label: 'Already exists',
				value: 'exists'
			}, {
				label: 'Blank request',
				value: 'blank'
			}, {
				label: 'No valid target specified',
				value: 'notarget'
			}, {
				label: 'Unlikely search term',
				value: 'unlikely'
			}, {
				label: 'Not a redirect request',
				value: 'notredirect'
			}, {
				label: 'Custom - reason below',
				selected: true,
				value: 'custom'
			}]));
		} else {
			extra.html('<label for="afcHelper_redirect_decline_' + id + '">Reason for decline: </label>' + afcHelper_generateSelect('afcHelper_redirect_decline_' + id, [{
				label: 'Already exists',
				value: 'exists'
			}, {
				label: 'Blank request',
				value: 'blank'
			}, {
				label: 'Unlikely category',
				value: 'unlikely'
			}, {
				label: 'Not a category request',
				value: 'notcategory'
			}, {
				label: 'Custom - reason below',
				selected: true,
				value: 'custom'
			}]));
		}
		extra.html(extra.html() + '<label for="afcHelper_redirect_comment_' + id + '">Comment:</label>' + '<input type="text" id="afcHelper_redirect_comment_' + id + '" name="afcHelper_redirect_comment_' + id + '"/>');
    } 
	} else {
		extra.html(extra.html() + '<label for="afcHelper_redirect_comment_' + id + '">Comment:</label>' + '<input type="text" id="afcHelper_redirect_comment_' + id + '" name="afcHelper_redirect_comment_' + id + '"/>');
	}
}

function afcHelper_redirect_performActions() {
	// Load all of the data.
	for (var i = 0; i < afcHelper_Submissions.length; i++) {
		var action = $("#afcHelper_redirect_action_" + i).val();
		afcHelper_Submissions[i].action = action;
		if (action === 'none') continue;
		if (action === 'accept') {
			if (afcHelper_Submissions[i].type === 'redirect') {
				afcHelper_Submissions[i].title = $("#afcHelper_redirect_from_" + i).val();
				afcHelper_Submissions[i].to = $("#afcHelper_redirect_to_" + i).val();
				afcHelper_Submissions[i].append = $("#afcHelper_redirect_append_" + i).val();
				if (afcHelper_Submissions[i].append === 'custom') {
					afcHelper_Submissions[i].append = prompt("Please enter the template to append for " + afcHelper_Submissions[i].title + ". Do not include the curly brackets.");
				}
				if (afcHelper_Submissions[i].append === 'none' || afcHelper_Submissions[i].append === null) afcHelper_Submissions[i].append = '';
				else afcHelper_Submissions[i].append = '\{\{' + afcHelper_Submissions[i].append + '\}\}';
			} else {
				afcHelper_Submissions[i].title = $("#afcHelper_redirect_name_" + i).val();
				afcHelper_Submissions[i].parent = $("#afcHelper_redirect_parent_" + i).val();
			}
		} else if (action === 'decline') {
			afcHelper_Submissions[i].reason = $('#afcHelper_redirect_decline_' + i).val();
		}
		afcHelper_Submissions[i].comment = $("#afcHelper_redirect_comment_" + i).val();
	}
	// Data loaded. Show progress screen and get WP:AFC/R page text.
	displayMessage('<ul id="afcHelper_status"></ul><ul id="afcHelper_finish"></ul>');
	$('#afcHelper_finish').html($('#afcHelper_finish').html() + '<span id="afcHelper_finished_wrapper"><span id="afcHelper_finished_main" style="display:none"><li id="afcHelper_done"><b>Done (<a href="' + wgArticlePath.replace("$1", encodeURI(afcHelper_RedirectPageName)) + '?action=purge" title="' + afcHelper_RedirectPageName + '">Reload page</a>)</b></li></span></span>');
	pagetext = afcHelper_getPageText(afcHelper_RedirectPageName, true);
	var totalaccept = 0;
	var totaldecline = 0;
	var totalcomment = 0;
	// traverse the submissions and locate the relevant sections.
	for (var i = 0; i < afcHelper_RedirectSubmissions.length; i++) {
		var sub = afcHelper_RedirectSubmissions[i];
		if (pagetext.indexOf(afcHelper_RedirectSections[sub.section]) === -1) {
			// Someone has modified the section in the mean time. Skip.
			$('#afcHelper_status').html($('#afcHelper_status').html() + '<li>Skipping ' + sub.title + ': Cannot find section. Perhaps it was modified in the mean time?</li>'); 
			continue;
		}
		var text = afcHelper_RedirectSections[sub.section];
		var startindex = pagetext.indexOf(afcHelper_RedirectSections[sub.section]);
		var endindex = startindex + text.length;

		// First deal with cats. These are easy.
		if (sub.type === 'category') {
			if (sub.action === 'accept') {
				var cattext = '<!--Created by WP:AFC -->';
				if (sub.parent !== '') cattext = '\[\[' + sub.parent + '\]\]';
				afcHelper_editPage(sub.title, cattext, 'Created via \[\[WP:AFC|Articles for Creation\]\] (\[\[WP:WPAFC|you can help!\]\])', true);
				var talktext = '\{\{subst:WPAFC/article|class=Cat\}\}';
				var talktitle = sub.title.replace(/Category:/gi, 'Category talk:');
				afcHelper_editPage(talktitle, talktext, 'Placing WPAFC project banner', true);
				var header = text.match(/==[^=]*==/)[0];
				text = header + "\n\{\{AfC-c|a\}\}\n" + text.substring(header.length);
				if (sub.comment !== '') text += '\n*\{\{subst:afc category|accept|2=' + sub.comment + '\}\} \~\~\~\~\n';
				else text += '\n*\{\{subst:afc category\}\} \~\~\~\~\n';
				text += '\{\{AfC-c|b\}\}\n';
				totalaccept++;
			} else if (sub.action === 'decline') {
				var header = text.match(/==[^=]*==/)[0];
				var reason = afcHelper_categoryDecline_reasonhash[sub.reason];
				if (reason === '') reason = sub.comment;
				else if (sub.comment !== '') reason = reason + ': ' + sub.comment;
				if (reason === '') {
					$('afcHelper_status').html($('#afcHelper_status').html() + '<li>Skipping ' + sub.title + ': No decline reason specified.</li>');       
					continue;
				}
				text = header + "\n\{\{AfC-c|d\}\}\n" + text.substring(header.length);
				if (sub.comment === '') text += '\n*\{\{subst:afc category|' + sub.reason + '\}\} \~\~\~\~\n';
				else text += '\n*\{\{subst:afc category|decline|2=' + reason + '\}\} \~\~\~\~\n';
				text += '\{\{AfC-c|b\}\}\n';
				totaldecline++;
			} else if (sub.action === 'comment') {
				if (sub.comment !== '') text += '\n\{\{afc comment|1=' + sub.comment + '\~\~\~\~\}\}\n';
				totalcomment++;
			}
		} else {
			// redirects......
			var acceptcomment = '';
			var declinecomment = '';
			var othercomment = '';
			var acceptcount = 0,
				declinecount = 0,
				commentcount = 0,
				hascomment = false;
			for (var j = 0; j < sub.from.length; j++) {
				var redirect = sub.from[j];
				if (redirect.action === 'accept') {
					var redirecttext = '#REDIRECT \[\[' + redirect.to + '\]\]\n' + redirect.append;;
					afcHelper_editPage(redirect.title, redirecttext, 'Redirected page to \[\[' + redirect.to + '\]\] via \[\[WP:AFC|Articles for Creation\]\] (\[\[WP:WPAFC|you can help!\]\])', true);
					var talktext = '\{\{subst:WPAFC/redirect\}\}';
					var talktitle = 'Talk:' + redirect.title;
					afcHelper_editPage(talktitle, talktext, 'Placing WPAFC project banner', true);
					acceptcomment += redirect.title + " &rarr; " + redirect.to;
					if (redirect.comment !== '') {
						acceptcomment += ': ' + redirect.comment + '; ';
						hascomment = true;
					} else acceptcomment += '; ';
					acceptcount++;
				} else if (redirect.action === 'decline') {
					var reason = afcHelper_redirectDecline_reasonhash[redirect.reason];
					if (reason === '') reason = redirect.comment;
					else if (redirect.comment !== '') reason = reason + ': ' + redirect.comment;
					if (reason === '') {
						$('#afcHelper_status').html($('#afcHelper_status').html() + '<li>Skipping ' + redirect.title + ': No decline reason specified.</li>');              
						continue;
					}
					declinecomment += redirect.title + " &rarr; " + redirect.to + ": " + reason + "; ";
					declinecount++;
				} else if (redirect.action === 'comment') {
					othercomment += redirect.title + ": " + redirect.comment + ", ";
					commentcount++;
				}
			}
			var reason = '';

			if (acceptcount > 0) reason += '\n*\{\{subst:afc redirect|accept|2=' + acceptcomment + ' Thank you for your contributions to Wikipedia!\}\} \~\~\~\~';
			if (declinecount > 0) reason += '\n*\{\{subst:afc redirect|decline|2=' + declinecomment + '\}\} \~\~\~\~';
			if (commentcount > 0) reason += '\n*\{\{afc comment|1=' + othercomment + '\~\~\~\~\}\}';
			reason += '\n';
			if (!hascomment && acceptcount === sub.from.length) {
				if (acceptcount > 1) reason = '\n*\{\{subst:afc redirect|all\}\} \~\~\~\~\n';
				else reason = '\n*\{\{subst:afc redirect\}\} \~\~\~\~\n';
			}
			if (acceptcount + declinecount + commentcount > 0) {
				if (acceptcount + declinecount === sub.from.length) {
					// Every request disposed of. Close.
					var header = text.match(/==[^=]*==/)[0];
					if (acceptcount > declinecount) text = header + "\n\{\{AfC-c|a\}\}\n" + text.substring(header.length);
					else text = header + "\n\{\{AfC-c|d\}\}\n" + text.substring(header.length);
					text += reason;
					text += '\{\{AfC-c|b\}\}\n';
				} else text += reason + '\n';
			}
			totalaccept += acceptcount;
			totaldecline += declinecount;
			totalcomment += commentcount;
		}
		pagetext = pagetext.substring(0, startindex) + text + pagetext.substring(endindex);
	}

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

	afcHelper_editPage(afcHelper_RedirectPageName, pagetext, summary, false);
	$('afcHelper_finished_main').css("display", '');
}

// Create portlet link
var redirectportletLink = mw.util.addPortletLink('p-cactions', '#', 'Review', 'ca-afcHelper', 'Review', 'a');
// Bind click handler
$(redirectportletLink).click(function(e) {
	e.preventDefault();
	afcHelper_redirect_init();
});
//</nowiki>
