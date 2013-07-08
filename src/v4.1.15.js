/*  _____________________________________________________________________________
 * |                                                                             |
 * |                    === WARNING: GLOBAL GADGET FILE ===                      |
 * |                  Changes to this page affect many users.                    |
 * | Please discuss changes on the talk page or on [[WT:Gadget]] before editing. |
 * |_____________________________________________________________________________|
 *
 * Imported from version 4.1.15.501952101 as of July 12, 2012 from [[User:mabdul/afc push.js]]
 * A helper script for [[Wikipedia:WikiProject Articles for creation]]; see [[Wikipedia:WikiProject Articles for creation/Helper script]]
 */
 
////////////////////////////////////////////
// Yet another AfC helper script
// v.4.1.15
////////////////////////////////////////////
// Changelog is posted at 
// [[Wikipedia:WikiProject Articles for creation/Helper script/Changelog]]
////////////////////////////////////////////

function afcHelper_escapeHtmlChars(original){
 return original
  .replace(/&/g, "&amp;")
	.replace(/</g, "&lt;")
	.replace(/>/g, "&gt;")
	.replace(/"/g, "&quot;")
	.replace(/'/g, "&#039;");
}

if (wgPageName.indexOf('Wikipedia:Articles_for_creation/Redirects') != -1) {
	if(typeof(afcHelper_advert) == 'undefined')
		afcHelper_advert = ' ([[WP:AFCH|AFCH]])';
	var afcHelper_RedirectPageName = wgPageName.replace(/_/g, ' ');
	var afcHelper_RedirectSubmissions = new Array();
	var afcHelper_RedirectSections = new Array();
	var afcHelper_numTotal = 0;
	var afcHelper_Redirect_AJAXnumber = 0;
	var afcHelper_Submissions = new Array();
	var afcHelper_redirectDecline_reasonhash = {
			'exists' : 'The title you suggested already exists on Wikipedia',
			'blank' : 'We cannot accept empty submissions',
			'notarget': ' A redirect cannot be created unless the target is an existing article. Either you have not specified the target, or the target does not exist',
			'unlikely': 'The title you suggested seems unlikely. Could you provide a source showing that it is a commonly used alternate name?',
			'notredirect': 'This request is not a redirect request',
			'custom': ''
	};
	var afcHelper_categoryDecline_reasonhash = {
			'exists' : 'The category you suggested already exists on Wikipedia',
			'blank' : 'We cannot accept empty submissions',
			'unlikely': 'It seems unlikely that there are enough pages to support this category',
			'notcategory':'This request is not a category request',
			'custom': ''
	};
	function afcHelper_redirect_init(){
		afcHelper_RedirectSubmissions = new Array();
		afcHelper_RedirectSections = new Array();
		afcHelper_numTotal = 0;
 
		var pagetext = afcHelper_redirect_getPageText(afcHelper_RedirectPageName, false);
		// let the parsing begin.
		// first, strip out the parts before the first section.
		var section_re = /==[^=]*==/;
		pagetext = pagetext.substring(pagetext.search(section_re));
 
		// now parse it into sections.
//		section_re = /==\s*\[\[(\s*[^=]*)\]\]\s*==/g;
		var section_re = /==[^=]*==/g;
		var section_headers = pagetext.match(section_re);
		for(var i = 0; i < section_headers.length; i++){
			var section_start = pagetext.indexOf(section_headers[i]);
			var section_text = pagetext.substring(section_start);
			if(i < section_headers.length-1){
				var section_end = section_text.substring(section_headers[i].length).indexOf(section_headers[i+1]) + section_headers[i].length;
				section_text = section_text.substring(0, section_end);
			}
			afcHelper_RedirectSections.push(section_text);
		}
 
		// parse the sections.
		for(var i = 0; i < afcHelper_RedirectSections.length; i++){
			var closed = /\{\{\s*afc(?!\s+comment)/i.test(afcHelper_RedirectSections[i]);
			if(!closed){
				// parse.
				var header = afcHelper_RedirectSections[i].match(section_re)[0];
				if(header.search(/Redirect request/i) != -1){
					var wikilink_re = /\[\[(\s*[^=]*)*\]\]/g;
					var links = header.match(wikilink_re);
					if(!links) continue;
					for(var j = 0; j < links.length; j++){
						links[j]=links[j].replace(/[\[\]]/g, '');
						if(links[j].charAt(0) == ':')
							links[j] = links[j].substring(1);
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
					for(var j = 0; j < links.length; j++){
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
				}
				else if(header.search(/Category request/i) != -1){
					var wikilink_re = /\[\[[^\[\]]+\]\]/g;
					var links = header.match(wikilink_re);
					if(!links) continue;
					// figure out the parent category.
					var idx = afcHelper_RedirectSections[i].substring(header.length).search(/\[\[\s*:\s*(Category:[^\]\[]*)\]\]/i);
					var parent = '';
					if(idx != -1)
						parent = RegExp.$1;
					parent = parent.replace(/:\s*/g, ':');
					for(var j = 0; j < links.length; j++){
						links[j]=links[j].replace(/[\[\]]/g, '');
						links[j]=links[j].replace(/Category\s*:\s*/gi, 'Category:');
						if(links[j].charAt(0) == ':')
							links[j] = links[j].substring(1);
 
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
		var afcHelper_Redirect_empty=1;
		for(var k = 0; k < afcHelper_RedirectSubmissions.length; k++){
			text += '<ul>';
			if(afcHelper_RedirectSubmissions[k].type == 'redirect'){
				text += '<li>Redirect(s) to ';
				if(afcHelper_RedirectSubmissions[k]==''||afcHelper_RedirectSubmissions[k]==' '){
						text+='Empty submission \#'+afcHelper_Redirect_empty+'<ul>';
 						afcHelper_Redirect_empty++;
 					}
 					else
 						text+='<a href="' + wgArticlePath.replace("$1", encodeURIComponent(afcHelper_RedirectSubmissions[k].to)) + '">' + afcHelper_RedirectSubmissions[k].to + '</a>: <ul>';
				for(var l = 0; l < afcHelper_RedirectSubmissions[k].from.length; l++){
					var from = afcHelper_RedirectSubmissions[k].from[l];
					text += "<li>From: " + from.title
					+'<br/><label for="afcHelper_redirect_action_'+ from.id+'">Action: </label>'
					+ afcHelper_redirect_generateSelect('afcHelper_redirect_action_'+ from.id,
							[{ label: 'Accept', value: 'accept' },
							 { label: 'Decline', value: 'decline' },
							 { label: 'Comment', value: 'comment' },
							 { label: 'None', selected : true, value: 'none' }
							 ], 'afcHelper_redirect_onActionChange(' + from.id + ')')
							 + '<div id="afcHelper_redirect_extra_' + from.id + '"></div></li>';
				}
				text += '</ul></li>';
			}
			else{
				text += '<li>Category submission: '+ afcHelper_RedirectSubmissions[k].title;
				text += '<br/> <label for="afcHelper_redirect_action_'+ afcHelper_RedirectSubmissions[k].id+'">Action: </label>'
				+ afcHelper_redirect_generateSelect('afcHelper_redirect_action_'+ afcHelper_RedirectSubmissions[k].id,
						[{ label: 'Accept', value: 'accept' },
						 { label: 'Decline', value: 'decline' },
						 { label: 'Comment', value: 'comment' },
						 { label: 'None', selected : true, value: 'none' }
						 ], 'afcHelper_redirect_onActionChange(' + afcHelper_RedirectSubmissions[k].id + ')')
						 + '<div id="afcHelper_redirect_extra_' + afcHelper_RedirectSubmissions[k].id + '"></div></li>';
			}
			text += '</ul>';			
		}
		text += '<input type="button" id="afcHelper_redirect_done_button" name="afcHelper_redirect_done_button" value="Done" onclick="afcHelper_redirect_performActions()" />';
		jsMsg(text);
	}
 
	function afcHelper_redirect_onActionChange(id){
		var extra = document.getElementById("afcHelper_redirect_extra_" + id);
		var selectValue = document.getElementById("afcHelper_redirect_action_"+id).value;
		if(selectValue == 'none')
			extra.innerHTML = '';
		else if(selectValue == 'accept'){
			if(afcHelper_Submissions[id].type == 'redirect'){
				extra.innerHTML = '<label for="afcHelper_redirect_from_' + id + '">From: </label><input type="text" '+
				'name="afcHelper_redirect_from_' + id + '" id="afcHelper_redirect_from_' + id + '" value="'
				+ afcHelper_escapeHtmlChars(afcHelper_Submissions[id].title) + '" />';
				extra.innerHTML += '&nbsp;<label for="afcHelper_redirect_to_' + id + '">To: </label><input type="text" '+
				'name="afcHelper_redirect_to_' + id + '" id="afcHelper_redirect_to_' + id + '" value="'
				+ afcHelper_escapeHtmlChars(afcHelper_Submissions[id].to) + '" />';
				extra.innerHTML += '<label for="afcHelper_redirect_append_'+ id +'">Template to append: </label>'
				+ afcHelper_redirect_generateSelect('afcHelper_redirect_append_'+
						id, [
						     { label: 'R from alternative name', value: 'R from alternative name' },
						     { label: 'R from alternative language', value: 'R from alternative language' },
						     { label: 'R from alternative spelling', value: 'R from alternative spelling' },
						     { label: 'R to section', value: 'R to section' },
						     { label: 'R to disambiguation page', value: 'R to disambiguation page' },
						     { label: 'R from title with diacritics', value: 'R from title with diacritics'},
						     { label: 'Custom - prompt me', value: 'custom' },
						     { label: 'None', selected : true, value: 'none' }
						     ]);
			}
			else{
				extra.innerHTML = '<label for="afcHelper_redirect_name_' + id + '">name: </label><input type="text" '+
				'name="afcHelper_redirect_name_' + id + '" id="afcHelper_redirect_name_' + id + '" value="'
				+ afcHelper_escapeHtmlChars(afcHelper_Submissions[id].title) + '" />';
				extra.innerHTML += '<label for="afcHelper_redirect_parent_' + id +'">Parent category:</label>'
				+ '<input type="text" id="afcHelper_redirect_parent_' + id +'" name="afcHelper_redirect_parent_' + id +
				'" value="' + afcHelper_escapeHtmlChars(afcHelper_Submissions[id].parent) + '" />';
			}
			extra.innerHTML += '<label for="afcHelper_redirect_comment_' + id +'">Comment:</label>'
			+ '<input type="text" id="afcHelper_redirect_comment_' + id +'" name="afcHelper_redirect_comment_' + id +'"/>';
		} else if(selectValue == 'decline'){
			if(afcHelper_Submissions[id].type == 'redirect'){
			extra.innerHTML = '<label for="afcHelper_redirect_decline_'+ id +'">Reason for decline: </label>'
			+ afcHelper_redirect_generateSelect('afcHelper_redirect_decline_'+
					id, [
					     { label: 'Already exists', value: 'exists' },
					     { label: 'Blank request', value: 'blank' },
					     { label: 'No valid target specified', value: 'notarget' },
					     { label: 'Unlikely search term', value: 'unlikely' },
					     { label: 'Not a redirect request', value: 'notredirect' },
					     { label: 'Custom - reason below', selected : true, value: 'custom' }
					     ]);
			}
			else {
				extra.innerHTML = '<label for="afcHelper_redirect_decline_'+ id +'">Reason for decline: </label>'
				+ afcHelper_redirect_generateSelect('afcHelper_redirect_decline_'+
						id, [
						     { label: 'Already exists', value: 'exists' },
						     { label: 'Blank request', value: 'blank' },
						     { label: 'Unlikely category', value: 'unlikely' },
						     { label: 'Not a category request', value: 'notcategory' },
						     { label: 'Custom - reason below', selected : true, value: 'custom' }
						     ]);
			}
			extra.innerHTML += '<label for="afcHelper_redirect_comment_' + id +'">Comment:</label>'
			+ '<input type="text" id="afcHelper_redirect_comment_' + id +'" name="afcHelper_redirect_comment_' + id +'"/>';
		} else{
			extra.innerHTML = '<label for="afcHelper_redirect_comment_' + id +'">Comment:</label>'
			+ '<input type="text" id="afcHelper_redirect_comment_' + id +'" name="afcHelper_redirect_comment_' + id +'"/>';
		}
	}
 
	function afcHelper_redirect_performActions(){
		// Load all of the data.
		for(var i = 0; i < afcHelper_Submissions.length; i++){
			var action = document.getElementById("afcHelper_redirect_action_" + i).value;
			afcHelper_Submissions[i].action = action;
			if(action == 'none')
				continue;
			if(action == 'accept'){
				if(afcHelper_Submissions[i].type == 'redirect'){
					afcHelper_Submissions[i].title = document.getElementById("afcHelper_redirect_from_" + i).value;
					afcHelper_Submissions[i].to = document.getElementById("afcHelper_redirect_to_" + i).value;
					afcHelper_Submissions[i].append = document.getElementById("afcHelper_redirect_append_" + i).value;
					if(afcHelper_Submissions[i].append == 'custom'){
						afcHelper_Submissions[i].append = prompt("Please enter the template to append for " + afcHelper_Submissions[i].title
								+ ". Do not include the curly brackets.");
					}
					if(afcHelper_Submissions[i].append == 'none' || afcHelper_Submissions[i].append == null)
						afcHelper_Submissions[i].append = '';
					else
						afcHelper_Submissions[i].append = '\{\{' + afcHelper_Submissions[i].append + '\}\}';
				}
				else{
					afcHelper_Submissions[i].title = document.getElementById("afcHelper_redirect_name_" + i).value;
					afcHelper_Submissions[i].parent = document.getElementById("afcHelper_redirect_parent_" + i).value;
				}
			}
			else if (action == 'decline'){
				afcHelper_Submissions[i].reason = document.getElementById('afcHelper_redirect_decline_' + i).value;
			}
			afcHelper_Submissions[i].comment = document.getElementById("afcHelper_redirect_comment_" + i).value;
		}
		// Data loaded. Show progress screen and get edit token and WP:AFC/R page text.
		jsMsg('<ul id="afcHelper_status"></ul><ul id="afcHelper_finish"></ul>');
		document.getElementById('afcHelper_finish').innerHTML += '<span id="afcHelper_finished_wrapper"><span id="afcHelper_finished_main" style="display:none"><li id="afcHelper_done"><b>Done (<a href="'+ wgArticlePath.replace("$1", encodeURI(afcHelper_RedirectPageName))+'?action=purge" title="'+afcHelper_RedirectPageName+'">Reload page</a>)</b></li></span></span>';
		var token = afcHelper_redirect_getToken(true);
		var pagetext = afcHelper_redirect_getPageText(afcHelper_RedirectPageName, true);
		var totalaccept = 0;
		var totaldecline = 0;
		var totalcomment = 0;
		// traverse the submissions and locate the relevant sections.
		for(var i = 0; i < afcHelper_RedirectSubmissions.length; i++){
			var sub = afcHelper_RedirectSubmissions[i];
			if(pagetext.indexOf(afcHelper_RedirectSections[sub.section]) == -1){
				// Someone has modified the section in the mean time. Skip.
				document.getElementById('afcHelper_status').innerHTML += '<li>Skipping ' + sub.title + ': Cannot find section. Perhaps it was modified in the mean time?</li>';
				continue;
			}
			var text = afcHelper_RedirectSections[sub.section];
			var startindex = pagetext.indexOf(afcHelper_RedirectSections[sub.section]);
			var endindex = startindex + text.length;
 
			// First deal with cats. These are easy.
			if(sub.type == 'category'){
				if(sub.action == 'accept'){
					var cattext = '<!--Created by WP:AFC -->';
					if(sub.parent != '' )
						cattext = '\[\['+ sub.parent + '\]\]';
					afcHelper_redirect_editPage(sub.title, cattext, token, 'Created via \[\[WP:AFC|Articles for Creation\]\] (\[\[WP:WPAFC|you can help!\]\])', true);
					var talktext = '\{\{subst:WPAFC/article|class=Cat\}\}';
					var talktitle = sub.title.replace(/Category:/gi, 'Category talk:');
					afcHelper_redirect_editPage(talktitle, talktext, token, 'Placing WPAFC project banner', true);
					var header = text.match(/==[^=]*==/)[0];
					text = header + "\n\{\{AfC-c|a\}\}\n" + text.substring(header.length);
					if(sub.comment != '')
						text += '\n*\{\{subst:afc category|accept|2=' + sub.comment +'\}\} \~\~\~\~\n';
					else
						text += '\n*\{\{subst:afc category\}\} \~\~\~\~\n';
					text += '\{\{AfC-c|b\}\}\n';
					totalaccept ++;
				}
				else if (sub.action == 'decline'){
					var header = text.match(/==[^=]*==/)[0];
					var reason = afcHelper_categoryDecline_reasonhash[sub.reason];
					if(reason == '')
						reason = sub.comment;
					else if (sub.comment != '')
						reason = reason + ': ' + sub.comment;
					if(reason == ''){
						document.getElementById('afcHelper_status').innerHTML += '<li>Skipping ' + sub.title + ': No decline reason specified.</li>';
						continue;
					}
					text = header + "\n\{\{AfC-c|d\}\}\n" + text.substring(header.length);
					if(sub.comment == '')
						text += '\n*\{\{subst:afc category|' + sub.reason +'\}\} \~\~\~\~\n';
					else
						text += '\n*\{\{subst:afc category|decline|2=' + reason +'\}\} \~\~\~\~\n';
					text += '\{\{AfC-c|b\}\}\n';
					totaldecline++;
				}
				else if (sub.action == 'comment'){
					if(sub.comment != '')
						text += '\n\{\{afc comment|1=' + sub.comment +'\~\~\~\~\}\}\n';
					totalcomment++;
				}	
			}
			else {
				// redirects......
				var acceptcomment = '';
				var declinecomment = '';
				var othercomment = '';
				var acceptcount = 0, declinecount = 0, commentcount = 0, hascomment = false;
				for(var j = 0; j < sub.from.length; j++){
					var redirect = sub.from[j];
					if(redirect.action == 'accept'){
						var redirecttext = '#REDIRECT \[\[' + redirect.to + '\]\]\n' + redirect.append;;
						afcHelper_redirect_editPage(redirect.title, redirecttext, token, 'Created via \[\[WP:AFC|Articles for Creation\]\] (\[\[WP:WPAFC|you can help!\]\])', true);
					var talktext = '\{\{subst:WPAFC/redirect\}\}';
					var talktitle = 'Talk:' + redirect.title;
					afcHelper_redirect_editPage(talktitle, talktext, token, 'Placing WPAFC project banner', true);
						acceptcomment += redirect.title + " &rarr; " + redirect.to;
						if(redirect.comment != ''){
							acceptcomment += ': ' + redirect.comment + '; ';
							hascomment = true;
						} else
							acceptcomment += '; ';
						acceptcount ++;
					}
					else if (redirect.action == 'decline'){
						var reason = afcHelper_redirectDecline_reasonhash[redirect.reason];
						if(reason == '')
							reason = redirect.comment;
						else if (redirect.comment != '')
							reason = reason + ': ' + redirect.comment;
						if(reason == ''){
							document.getElementById('afcHelper_status').innerHTML += '<li>Skipping ' + redirect.title + ': No decline reason specified.</li>';
							continue;
						}
						declinecomment += redirect.title + " &rarr; " + redirect.to + ": " + reason + "; ";
						declinecount ++;
					}
					else if (redirect.action == 'comment'){
						othercomment += redirect.title + ": " + redirect.comment + ", ";
						commentcount ++;
					}
				}
				var reason = '';
 
				if(acceptcount > 0)
					reason += '\n*\{\{subst:afc redirect|accept|2=' + acceptcomment + ' Thank you for your contributions to Wikipedia!\}\} \~\~\~\~';
				if (declinecount > 0)
					reason += '\n*\{\{subst:afc redirect|decline|2=' + declinecomment + '\}\} \~\~\~\~';
				if(commentcount > 0)
					reason += '\n*\{\{afc comment|1=' + othercomment + '\~\~\~\~\}\}';
				reason += '\n';
				if(!hascomment && acceptcount == sub.from.length){
					if(acceptcount > 1)
						reason = '\n*\{\{subst:afc redirect|all\}\} \~\~\~\~\n';
					else
						reason = '\n*\{\{subst:afc redirect\}\} \~\~\~\~\n';
				}
				if(acceptcount + declinecount + commentcount > 0){
					if(acceptcount + declinecount == sub.from.length){
						// Every request disposed of. Close.
						var header = text.match(/==[^=]*==/)[0];
						if(acceptcount > declinecount)
							text = header + "\n\{\{AfC-c|a\}\}\n" + text.substring(header.length);
						else
							text = header + "\n\{\{AfC-c|d\}\}\n" + text.substring(header.length);
						text += reason;
						text += '\{\{AfC-c|b\}\}\n';
					}
					else
						text += reason +'\n';
				}
				totalaccept += acceptcount;
				totaldecline += declinecount;
				totalcomment += commentcount;
			}
			pagetext = pagetext.substring(0, startindex) + text + pagetext.substring(endindex);
		}
 
		var summary = "Updating submission status:";
		if(totalaccept > 0)
			summary += " accepting " + totalaccept + " request"  + (totalaccept > 1 ? 's' : '');
		if(totaldecline > 0){
			if(totalaccept > 0)
				summary += ',';
			summary += " declining " + totaldecline + " request" + (totaldecline > 1 ? 's' : '');
		}
		if(totalcomment > 0){
			if(totalaccept > 0 || totaldecline > 0)
				summary += ',';
			summary += " commenting on " + totalcomment + " request" + (totalcomment > 1 ? 's' : '');
		}
 
		afcHelper_redirect_editPage(afcHelper_RedirectPageName, pagetext, token, summary, false);
		document.getElementById('afcHelper_finished_main').style.display = '';
	}
 
	function afcHelper_redirect_getToken(show) {
		if (show) {
			document.getElementById('afcHelper_status').innerHTML += '<li id="afcHelper_gettoken">Getting token</li>';
		}
		var req = sajax_init_object();
		req.open("GET", wgScriptPath + "/api.php?action=query&prop=info&indexpageids=1&intoken=edit&format=json&titles="+encodeURIComponent(afcHelper_RedirectPageName), false);
		req.send(null);
		var response = eval('(' + req.responseText + ')');
		pageid = response['query']['pageids'][0];
		token = response['query']['pages'][pageid]['edittoken'];
		delete req;
		if (show) {
			document.getElementById('afcHelper_gettoken').innerHTML = 'Got token';
		}
		return token;
	}
 
	function afcHelper_redirect_editPage(title, newtext, token, summary, createonly) {
		summary += afcHelper_advert;
		document.getElementById('afcHelper_finished_wrapper').innerHTML = '<span id="afcHelper_AJAX_finished_'+afcHelper_Redirect_AJAXnumber+'" style="display:none">' + document.getElementById('afcHelper_finished_wrapper').innerHTML + '</span>';
		var func_id = afcHelper_Redirect_AJAXnumber;
		afcHelper_Redirect_AJAXnumber++;
		document.getElementById('afcHelper_status').innerHTML += '<li id="afcHelper_edit'+escape(title)+'">Editing <a href="'+wgArticlePath.replace("$1", encodeURI(title))+'" title="'+title+'">'+title+'</a></li>';
		var req = sajax_init_object();
		var params = "action=edit&format=json&token="+encodeURIComponent(token)+"&title="+encodeURIComponent(title)+"&text="+encodeURIComponent(newtext)+"&notminor=1&summary="+encodeURIComponent(summary);
		if(createonly)
			params += "&createonly=1";
		url = wgScriptPath + "/api.php";
		req.open("POST", url, true);
		req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		req.setRequestHeader("Content-length", params.length);
		req.setRequestHeader("Connection", "close");
		req.onreadystatechange = function() {
			if(req.readyState == 4 && req.status == 200) {
				response = eval('(' + req.responseText + ')');
				try {
					if (response['edit']['result'] == "Success") {
						document.getElementById('afcHelper_edit'+escape(title)).innerHTML = 'Saved <a href="'+wgArticlePath.replace("$1", encodeURI(title))+'?redirect=no" title="'+title+'">'+title+'</a>';
					} else {
						document.getElementById('afcHelper_edit'+escape(title)).innerHTML = '<div style="color:red"><b>Edit failed on <a href="'+wgArticlePath.replace("$1", encodeURI(title))+'?redirect=no" title="'+title+'">'+title+'</a></b></div>. Error info:' +response['error']['code'] + ' : ' + response['error']['info'];
					}
				}
				catch(err) {
					document.getElementById('afcHelper_edit'+escape(title)).innerHTML = '<div style="color:red"><b>Edit failed on <a href="'+wgArticlePath.replace("$1", encodeURI(title))+'?redirect=no" title="'+title+'">'+title+'</a></b></div>';
				}
				document.getElementById('afcHelper_AJAX_finished_'+func_id).style.display = '';
				delete req;
			}
		};
		req.send(params);
	}
 
	function afcHelper_redirect_getPageText(title, show) {
		if(show){
			document.getElementById('afcHelper_status').innerHTML += '<li id="afcHelper_get'+escape(title)+'">Getting <a href="'+wgArticlePath.replace("$1", encodeURI(title))+'" title="'+title+'">'+title+'</a></li>';
		}
		var req = sajax_init_object();
		req.open("GET", wgScriptPath + "/api.php?action=query&prop=revisions&rvprop=content&format=json&indexpageids=1&titles="+encodeURIComponent(title), false);
		req.send(null);
		var response = eval('(' + req.responseText + ')');
		pageid = response['query']['pageids'][0];
		if (pageid == "-1") {
			if(show){
				document.getElementById('afcHelper_get'+escape(title)).innerHTML = '<a class="new" href="'+wgArticlePath.replace("$1", encodeURI(title))+'" title="'+title+'">'+title+'</a> does not exist';
			}
			delete req;
			return '';
		}
		pagetext = response['query']['pages'][pageid]['revisions'][0]['*'];
		delete req;
		if(show){
			document.getElementById('afcHelper_get'+escape(title)).innerHTML = 'Got <a href="'+wgArticlePath.replace("$1", encodeURI(title))+'" title="'+title+'">'+title+'</a>';
		}
		return pagetext;
	}
	function afcHelper_redirect_generateSelect(title, options, onchange){
		var text = '<select name="' + title + '" id="' + title +'" ';
		if(onchange != null)
			text += 'onchange = "' + onchange + '" ';
		text+= '>';
		for(var i = 0; i < options.length; i ++){
			var o = options[i];
			text += '<option value="' + afcHelper_escapeHtmlChars(o.value) + '" ';
			if(o.selected)
				text += 'selected="selected" ';
			text += '>' + o.label + '</option>';
		}
		text += "</select>";
		return text;
	}
 
	function afcHelper_redirect_addLink() {
		addPortletLink("p-cactions", "javascript:afcHelper_redirect_init()", "Review", "ca-afcHelper", "Review");
	}
	addOnloadHook(afcHelper_redirect_addLink);
} else if (wgPageName.indexOf('Wikipedia:Articles_for_creation/') != -1 || wgPageName.indexOf('Wikipedia_talk:Articles_for_creation/') != -1) {
	if(typeof(afcHelper_advert) == 'undefined')
		afcHelper_advert = ' ([[WP:AFCH|AFCH]])';
	var afcHelper_PageName = wgPageName.replace(/_/g, ' ');
	var afcHelper_AJAXnumber = 0;
	var afcHelper_submissionTitle = wgTitle.replace(/Articles for creation\//g, '');

	var afcHelper_reasonhash = {
			'v': 'submission is unsourced or contains only unreliable sources',
			'blank': 'submission is blank',
			'lang': 'submission is not in English',
			'cv': 'submission is a copyright violation',
			'exists': 'submission already exists in main space',
			'dup': 'submission is a duplicate of another submission',
			'redirect': 'submission is a redirect request',
			'test': 'submission is a test edit',
			'news': 'submission appears to be a news report of a single event',
			'dict': 'submission is a dictionary definition',
			'joke': 'submission appears to be a joke',
			'blp': 'submission does not conform to BLP',
			'neo': 'submission is a neologism',
			'npov': 'submission is not written from a neutral point of view',
			'adv': 'submission is written like an advertisement',
			'context': 'submission provides insufficient context',
			'mergeto': 'submission is too short but can be merged',
			'plot': 'submission is a plot summary',
			'essay': 'submission reads like an essay',
			'not': 'submission is covered by WP:NOT',
			'nn': 'subject appears to be non-notable',
			'web': 'subject appears to be non-notable web content',
			'prof': 'subject appears to be a non-notable academic',
			'athlete': 'subject appears to be a non-notable athlete',
			'music': 'subject appears to be a non-notable musical performer or work',
			'film': 'subject appears to be a non-notable film',
			'corp': 'subject appears to be a non-notable company or organization',
			'bio': 'subject appears to be a non-notable person',
			'reason': ''
	};
 	function afcHelper_init() {
		if (!wfSupportsAjax()) {
			jsMsg('<span style="color:red; font-size:120%">Your browser does not seem to support AJAX, which is required for the afcHelper script v3.</span>');
			return;
		}
		form = '<div id="afcHelper_initialform">';
		form +=	afcHelper_blanking();
		form +='<h3>Reviewing '+afcHelper_PageName+'</h3>'+
		'<input type="button" id="afcHelper_accept_button" name="afcHelper_accept_button" value="Accept" onclick="afcHelper_prompt(\'accept\')" style="border-radius:3px; background-color::#7CFC00" />'+
		'<input type="button" id="afcHelper_decline_button" name="afcHelper_decline_button" value="Decline" onclick="afcHelper_prompt(\'decline\')" style="border-radius:3px; background-color:#DC143C" />'+
		'<input type="button" id="afcHelper_comment_button" name="afcHelper_comment_button" value="Comment" onclick="afcHelper_prompt(\'comment\')" style="border-radius:3px; background-color:#f3eba3" />'+
		'<input type="button" id="afcHelper_mark_button" name="afcHelper_mark_button" value="Mark as reviewing" onclick="afcHelper_prompt(\'mark\')" style="border-radius:3px; background-color:#b1dae8" />'+
		'<input type="button" id="afcHelper_misc_button" name="afcHelper_misc_button" value="Other options" onclick="afcHelper_prompt(\'misc\')" style="border-radius:3px; background-color:#d2d3cc" />'+
		'<div id="afcHelper_extra"></div>';
		jsMsg(form);
	}
 	function afcHelper_prompt(type) {
		if(type == 'accept'){
			var text = '<h3>Accepting '+afcHelper_PageName+'</h3>'+
			'<label for="afcHelper_movetarget">Move submission to: </label><input type="text" id="afcHelper_movetarget" name="afcHelper_movetarget" value="' +afcHelper_escapeHtmlChars(afcHelper_submissionTitle) +'" />'+
			'<br /><label for="afcHelper_assessment">Assessment (optional): </label>';
			var assessmentSelect = afcHelper_generateSelect("afcHelper_assessment",
					[{ label: 'B-class', value: 'B' },
					 { label: 'C-class', value: 'C' },
					 { label: 'Start-class', value: 'start' },
					 { label: 'Stub-class', value: 'stub' },
					 { label: 'List-class', value: 'list' },
					 { label: 'Disambig-class', value: 'disambig' },
					 { label: 'Redirect-class', value: 'redirect' },
					 { label: 'Portal-class', value: 'portal' },
					 { label: 'Disambig-class', value: 'disambig' },
					 { label: 'Project-class', value: 'project' },
					 { label: 'Template-class', value: 'template' },
					 { label: 'NA-class', value: 'na' },
					 { label: 'None', selected : true, value: '' }
					 ], null);
			text += assessmentSelect;
			text += '<br /><label for="afcHelper_pagePrepend">Prepend to page (optional, e.g. maintain boxes, etc.): </label><textarea rows="3" cols="60" name="afcHelper_pagePrepend" id="afcHelper_pagePrepend"></textarea>'+
			'<br /><label for="afcHelper_pageAppend">Append to page (optional): </label><textarea rows="3" cols="60" name="afcHelper_pageAppend" id="afcHelper_pageAppend"></textarea>'+
			'<br /><label for="afcHelper_talkAppend">Append to talk page (optional): </label><textarea rows="3" cols="60" name="afcHelper_talkAppend" id="afcHelper_talkAppend"></textarea><br/><input type="button" id="afcHelper_prompt_button" name="afcHelper_prompt_button" value="Accept and move" onclick="afcHelper_act(\'accept\')" style="border-radius:3px; background-color:#7CFC00" />';
			document.getElementById('afcHelper_extra').innerHTML = text;
		}
		else if(type == 'decline'){
			var text = '<h3>Declining '+afcHelper_PageName+'</h3>'+
			'<label for="afcHelper_reason">Reason for ' + type + ': </label>';
			var reasonSelect = afcHelper_generateSelect("afcHelper_reason",
					[{ label: 'v - submission is unsourced or contain only unreliable sources', value: 'v' },
					 { label: 'blank - submission is blank', value: 'blank' },
					 { label: 'lang - submission is not in English', value: 'lang' },
					 { label: 'cv - submission is a copyright violation', value: 'cv' },
					 { label: 'exists - submission already exists in main space', value: 'exists' },
					 { label: 'dup - submission is a duplicate of another submission', value: 'dup' },
					 { label: 'redirect - submission is a redirect request', value: 'redirect' },
					 { label: 'test - submission is a test edit', value: 'test' },
					 { label: 'news - submission appears to be a news report of a single event', value: 'news' },
					 { label: 'dict - submission is a dictionary definition', value: 'dict' },
					 { label: 'joke - submission appears to be a joke', value: 'joke' },
					 { label: 'blp - submission does not conform to BLP', value: 'blp' },
					 { label: 'neo - submission is a neologism', value: 'neo' },
					 { label: 'npov - submission is not written from a neutral point of view', value: 'npov' },
					 { label: 'adv - submission is written like an advertisement', value: 'adv' },
					 { label: 'context - submission provides insufficient context', value: 'context' },
					 { label: 'mergeto - submission is too short but can be merged', value: 'mergeto' },
					 { label: 'plot - submission is a plot summary', value: 'plot' },
					 { label: 'essay - submission reads like an essay', value: 'essay' },
					 { label: 'not - submission is covered by WP:NOT', value: 'not' },
					 { label: 'nn - subject appears to be non-notable - consider using a more specialized decline reason', value: 'nn' },
					 { label: 'web - subject appears to be non-notable web content', value: 'web' },
					 { label: 'prof - subject appears to be a non-notable academic', value: 'prof' },
					 { label: 'athlete - subject appears to be a non-notable athlete', value: 'athlete' },
					 { label: 'music - subject appears to be a non-notable musical performer or work', value: 'music' },
					 { label: 'film - subject appears to be a non-notable film', value: 'film' },
					 { label: 'corp - subject appears to be a non-notable company or organization', value: 'corp' },
					 { label: 'bio - subject appears to be a non-notable person', value: 'bio' },
					 { label: 'Custom - reason below', selected : true, value: 'reason' }
					 ], "afcHelper_onChange(this)");
			text += reasonSelect;
			text += '<br /><label for="afcHelper_comments">Additional comments (optional, signature is automatically added): </label><textarea rows="3" cols="60" name="afcHelper_comments" id="afcHelper_comments"></textarea>'+
			'<label for="afcHelper_blank">Blank the submission (replace the content with {{<a href="'+wgArticlePath.replace("$1", 'Template:Afc_cleared')+'" title="Template:Afc cleared" target="_blank">afc cleared</a>}}):</label><input type="checkbox" name="afcHelper_blank" id="afcHelper_blank" onchange=afcHelper_trigger(\'afcHelper_extra_afccleared\') /><br/><div id="afcHelper_extra_afccleared" name="afcHelper_extra_afccleared" style="display:none"><label for="afcHelper_afccleared">Trigger the \'csd\' parameter and nominate the submission for CSD? (replace the content with {{<a href="'+wgArticlePath.replace("$1", 'Template:Afc_cleared')+'" title="Template:Afc cleared" target="_blank">afc cleared|csd</a>}}):</label><input type="checkbox" name="afcHelper_blank_csd" id="afcHelper_blank_csd" checked="checked" /><br/></div>' +	
			'<label for="afcHelper_notify">Notify author:</label><input type="checkbox" onchange=afcHelper_trigger(\'afcHelper_notify_Teahouse\') name="afcHelper_notify" id="afcHelper_notify" checked="checked" /><br/>' +
			'<div id="afcHelper_notify_Teahouse"><label for="afcHelper_notify_Teahouse">Notify author about <a href="'+wgArticlePath.replace("$1", 'Wikipedia:Teahouse')+'" title="Wikipedia:Teahouse" target="_blank">Wikipedia:Teahouse</a> <small>(works only in combination with the normal notification)</small>:</label><input type="checkbox" name="afcHelper_notify_Teahouse" id="afcHelper_notify_Teahouse" /><br/></div><div id="afcHelper_extra_inline" name="afcHelper_extra_inline"><br/></div><input type="button" id="afcHelper_prompt_button" name="afcHelper_prompt_button" value="Decline" onclick="afcHelper_act(\'decline\')" style="border-radius:3px; background-color:#DC143C" />';
			document.getElementById('afcHelper_extra').innerHTML = text;
		}
		else if(type == 'misc'){
			var text = '<h3>Other options for '+afcHelper_PageName+'</h3>'+
			'<input type="button" id="afcHelper_cleanup_button" name="afcHelper_cleanup_button" value="Clean the submission" onclick="afcHelper_act(\'cleanup\')" />'+
			'<input type="button" disabled="true" id="afcHelper_resubmit_button" name="afcHelper_resubmit_button" value="*Resubmit*" onclick="afcHelper_prompt(\'resubmit\')" />'+
			'<input type="button" disabled="true" id="afcHelper_resubmit2_button" name="afcHelper_resubmit2_button" value="Placing a draft template" onclick="afcHelper_prompt(\'resubmit2\')" />';
			'<div id="afcHelper_extra"></div>';
			document.getElementById('afcHelper_extra').innerHTML = text;
		}
		else if(type == 'resubmit'){
			var text = '<br /><br /><h3>Place a submission template on '+afcHelper_PageName+'</h3><br />'+
			'<label for="afcHelper_first_submitter">Submitter is the page creator: </label><input type="checkbox" name="afcHelper_first_submitter" id="afcHelper_first_submitter" /><br/>' +
			'<label for="afcHelper_blank_submitter">Without any submitter: </label><input type="checkbox" name="afcHelper_blank_submitter" id="afcHelper_blank_submitter" /><br/>' +
			'<label for="afcHelper_custom_submitter">With any particular submitter: </label><textarea rows="3" cols="60" name="afcHelper_custom_submitter" id="afcHelper_custom_submitter"></textarea>'+
			'<input type="button" id="afcHelper_resubmit_button" name="afcHelper_resubmit2_button" value="Placing a draft template" onclick="afcHelper_act(\'resubmit\')" />';
			document.getElementById('afcHelper_extra').innerHTML += text;
		}
		else if(type == 'mark'){
				var text = '<h3>Marking submission ' +afcHelper_PageName+'for reviewing</h3>'+
				'<br /><label for="afcHelper_comments">Additional comment (signature is automatically added): </label><textarea rows="3" cols="60" name="afcHelper_comments" id="afcHelper_comments"></textarea><br/><input type="button" id="afcHelper_prompt_button" style="padding:.2em .6em; border:1px solid; border-color:#aaa #555 #555 #aaa; border-radius:3px; background-color:#b1dae8" name="afcHelper_prompt_button" value="Marking on hold" onclick="afcHelper_act(\'mark\')" />';
				document.getElementById('afcHelper_extra').innerHTML = text;
		}
		else if(type == 'comment'){
			var text = '<h3>Commenting on ' +afcHelper_PageName+' </h3>'+
			'<br /><label for="afcHelper_comments">Comment (signature is automatically added): </label><textarea rows="3" cols="60" name="afcHelper_comments" id="afcHelper_comments"></textarea><br/><input type="button" id="afcHelper_prompt_button" name="afcHelper_prompt_button" value="add a comment" onclick="afcHelper_act(\'comment\')" style="border-radius:3px; background-color:#f3eba3" />';
			document.getElementById('afcHelper_extra').innerHTML = text;
		}
	}

 	function afcHelper_act(action) {
		if(action == 'accept'){
			var newtitle = document.getElementById("afcHelper_movetarget").value;
			var assessment = document.getElementById("afcHelper_assessment").value;
			var pagePrepend = document.getElementById("afcHelper_pagePrepend").value;
			var pageAppend = document.getElementById("afcHelper_pageAppend").value;
			var talkAppend =  document.getElementById("afcHelper_talkAppend").value;
			jsMsg('<ul id="afcHelper_status"></ul><ul id="afcHelper_finish"></ul>');
			document.getElementById('afcHelper_finish').innerHTML += '<span id="afcHelper_finished_wrapper"><span id="afcHelper_finished_main" style="display:none"><li id="afcHelper_done"><b>Done (<a href="'+wgArticlePath.replace("$1", encodeURI(afcHelper_PageName))+'?action=purge" title="'+afcHelper_PageName+'">Reload page</a>)</b></li></span></span>';
			var token = afcHelper_getToken(true);
			var callback = function(){
				var text = afcHelper_getPageText(newtitle, true);
				var username ='';
				// clean up page
				var afc_re = /\{\{\s*afc submission\s*\|(?:\{\{[^\{\}]*\}\}|[^\}\{])*\}\}/i;
				if( afc_re.test( text ) ) {
					var afctemplate = afc_re.exec(text)[0];
					var author_re = /\|\s*u=\s*[^\|]*\|/i;
					if(author_re.test(afctemplate)){
						var user = author_re.exec(afctemplate)[0];
						username = user.split(/=/)[1];
						username = username.replace(/\|/g,'');
						var usertext = afcHelper_getPageText("User talk:"+username, true);
						usertext += "\n== Your submission at \[\[WP:AFC|Articles for creation\]\] ==";
						usertext += "\n\{\{subst:afc talk|1=" + newtitle + "|class=" + assessment + "|sig=yes\}\}";
						afcHelper_editPage("User talk:"+username, usertext, token, 'Your submission at \[\[WP:AFC|Articles for creation\]\]');
					}
				}
 				var recenttext = afcHelper_getPageText("Wikipedia:Articles for creation/recent", true);
				var newentry = "\{\{afc contrib|" + assessment + "|" + newtitle + "|" + username +"\}\}\n";
				var lastentry = recenttext.toLowerCase().lastIndexOf("\{\{afc contrib");
				var firstentry = recenttext.toLowerCase().indexOf("\{\{afc contrib");
				recenttext = recenttext.substring(0, lastentry);
				recenttext = recenttext.substring(0, firstentry) + newentry + recenttext.substring(firstentry);
				afcHelper_editPage("Wikipedia:Articles for creation/recent", recenttext, token, 'Updating recent AFC creations');

				var talktext = "\{\{talkheader\}\}\n\{\{subst:WPAFC/article|class=" + assessment + "\}\}";
				talktext += "\n";
				talktext += talkAppend;
				var testtemplate = /Template:/i;
				var testcat = /Category:/i;
				var testwp = /Wikipedia:/i;
				var testportal = /Portal:/i;
				var newtalktitle;
				if(testtemplate.test(newtitle)){
					newtalktitle = newtitle.replace(/Template:/i, '');
					newtalktitle = 'Template talk:'+newtalktitle;}
				else if(testcat.test(newtitle)){
					newtalktitle = newtitle.replace(/Category:/i, '');
					newtalktitle = 'Category talk:'+newtalktitle;}
				else if(testwp.test(newtitle)){
					newtalktitle = newtitle.replace(/Wikipedia:/i, '');
					newtalktitle = 'Wikipedia talk:'+newtalktitle;}
				else if(testportal.test(newtitle)){
					newtalktitle = newtitle.replace(/Portal:/i, '');
					newtalktitle = 'Portal talk:'+newtalktitle;}
				else
					newtalktitle = 'Talk:'+newtitle;
				afcHelper_editPage(newtalktitle, talktext, token, 'Placing WPAFC project banner');

				while(afc_re.test(text)){
					var startindex = text.search(afc_re);
					var template = afc_re.exec(text)[0];
					var endindex = startindex + template.length;
					text = text.substring(0, startindex) + text.substring(endindex);
				}
				var cmt_re = /\{\{\s*afc comment\s*\|(?:\{\{[^\{\}]*\}\}|[^\}\{])*\}\}/i;
				while(cmt_re.test(text)){
					var startindex = text.search(cmt_re);
					var template = cmt_re.exec(text)[0];
					var endindex = startindex + template.length;
					text = text.substring(0, startindex) + text.substring(endindex);
				}

				var afcindex = text.search(/\{\{afc/i);
				while (afcindex != -1){
					var endindex = text.indexOf("\}\}", afcindex + 2);
					text = text.substring(0,afcindex) + text.substring(endindex+2);
					afcindex = text.search(/\{\{afc/i);
				}
				if(text.indexOf("\<\!--- Important, do not remove this line before article has been created. ---\>") != -1){
					var startindex = text.indexOf("\<\!--- Important, do not remove this line before article has been created. ---\>");
					var endindex = text.indexOf(">", startindex);
					text = text.substring(0, startindex) + text.substring(endindex+1);
				}

				//Cleaning up the submission
  				text = afcHelper_cleanup(text);

				// Uncomment cats (after the cleanup commented them)
				text = text.replace(/\[\[:Category/gi, "\[\[Category");

				text = pagePrepend + '\n' + text + '\n'+ pageAppend;
				afcHelper_editPage(newtitle, text, token, "Cleanup following AFC creation");
			};
			afcHelper_movePage(afcHelper_PageName, newtitle, token, 'Created via \[\[WP:AFC|Articles for Creation\]\] (\[\[WP:WPAFC|you can help!\]\])' , callback);
		}
		else if(action == 'decline'){
			var code = document.getElementById("afcHelper_reason").value;
			var reasontext = afcHelper_reasonhash[code];
			var customreason = document.getElementById("afcHelper_comments").value;
			var append = false;
			var keep = false;
			var blank = document.getElementById("afcHelper_blank").checked;
			var blank_csd = document.getElementById("afcHelper_blank_csd").checked;
			var notify = document.getElementById("afcHelper_notify").checked;
			var teahouse = document.getElementById("afcHelper_notify_Teahouse").checked;
			var extra = '';
			if(code == 'cv' || code == 'dup' || code == 'mergeto' || code == 'exists' || code == 'lang' || code == 'plot'){
				extra = document.getElementById("afcHelper_extra_inlinebox").value;
			}
			if(extra == null){
				return;
			}

			jsMsg('<ul id="afcHelper_status"></ul><ul id="afcHelper_finish"></ul>');
			document.getElementById('afcHelper_finish').innerHTML += '<span id="afcHelper_finished_wrapper"><span id="afcHelper_finished_main" style="display:none"><li id="afcHelper_done"><b>Done (<a href="'+wgArticlePath.replace("$1", encodeURI(afcHelper_PageName))+'?action=purge" title="'+afcHelper_PageName+'">Reload page</a>)</b></li></span></span>';
			var token = afcHelper_getToken(true);
			var text = afcHelper_getPageText(afcHelper_PageName, true);

			// Find the first pending submission or marked as review on the page.
			var afc_re = /\{\{\s*afc submission\s*\|\s*[||h|r](?:\{\{[^\{\}]*\}\}|[^\}\{])*\}\}/i;

			if( !afc_re.test( text ) ) {
				alert( "Unable to locate AFC submission template, aborting..." );
				return;
			}
			//TEMP: removing after cleanup works
			var afctemplate = afc_re.exec(text)[0];
			//moving the first hit to the top
			text=text.replace(afctemplate, '');
			text=afctemplate+text;
			//TEMP END: removing after cleanup works
			var notifytemplate = "afc decline";
			if(code == 'reason' && customreason == ''){
				alert("You must enter a reason!");
				return;
			}

			var startindex = text.indexOf(afctemplate);
			var endindex = startindex + afctemplate.length;
			//data is always between the first pipe and the one before the timestamp.
			var firstpipe = afctemplate.indexOf('|');
			var endpipe = afctemplate.indexOf('|ts');
			var newtemplate = afctemplate.substring(0, firstpipe);
			var summary = '';
			var newcomment = '';
			// overwrite any reason that was there.
			newtemplate += '|d|'+code;
			if(code == 'reason'){
				newtemplate += '|3=' + customreason;
			}
			else if(extra != ''){
				newtemplate += '|3=' + extra;
			}
			newtemplate += '|declinets=\{\{subst:CURRENTTIMESTAMP\}\}|decliner=\{\{subst:REVISIONUSER\}\}'+afctemplate.substring(endpipe);
			if(code != 'reason' && customreason != ''){
				newcomment = "*\{\{afc comment|1=" + customreason + " \~\~\~\~\}\}";
			}
			summary = "Declining submission";
			if(code == 'reason')
				summary += ': see comment therein';
			else
				summary += ': ' + reasontext;

			if(notify){
				var author_re = /\|\s*u=\s*[^\|]*\|/i;
				if(author_re.test(afctemplate)){
					var user = author_re.exec(afctemplate)[0];
					var username = user.split(/=/)[1];
					username = username.replace(/[\|]/g,'');
                                        var usertext = afcHelper_getPageText("User talk:"+username, true);
					var reason = 'Your submission at \[\[Wikipedia:Articles for creation|Articles for creation\]\]';
					usertext += "\n== Your submission at \[\[Wikipedia:Articles for creation|Articles for creation\]\] ==";
					usertext += "\n\{\{subst:" + notifytemplate + "|1=" + afcHelper_submissionTitle;
					if(code == 'cv')
						usertext += "| cv = yes";
					usertext += "|sig=yes\}\}";

					if(teahouse){
						document.getElementById('afcHelper_status').innerHTML += '<li id="afcHelper_get'+escape(teahouse)+'">Checking for existing Teahouse Invitation for <a href="'+wgArticlePath.replace("$1", encodeURI('User talk:'+username))+'" title="User talk:'+username+'">User talk:'+username+'</a></li>';
// stolen from function afcHelper_getPageText(title)
						var req = sajax_init_object();
						var params = "action=query&prop=categories&format=json&indexpageids=1&titles=User_talk:" + encodeURIComponent(username);
						req.open("POST", wgScriptPath + "/api.php", false);
						req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
						req.setRequestHeader("Content-length", params.length);
						req.setRequestHeader("Connection", "close");
						req.send(params);
						var response = eval('(' + req.responseText + ')');
	                                        var pageid = response['query']['pageids'][0];
 						var foundTH=0;
	 					if (pageid!="-1"){
							var pagecats = new Array ();
							pagecats = response['query']['pages'][pageid]['categories'];
							if(typeof pagecats != 'undefined'){
	 							for(var i = 0; i < pagecats.length; i++){
									if (pagecats[i].title == ("Category:Wikipedia users who received a Teahouse invitation")){
										foundTH=1;
										break;
									}
								}
							}
						}
						if(foundTH==0){
							document.getElementById('afcHelper_get'+escape(teahouse)).innerHTML = '<li id="afcHelper_get'+escape(teahouse)+'">Sent <a href="'+wgArticlePath.replace("$1", encodeURI('User talk:'+username))+'" title="User talk:'+username+'">User talk:'+username+'</a> an invitation.</li>';
							usertext += "\n\n\n\{\{subst:Wikipedia:Teahouse/AFC_invitation\}\}";
							reason += '; adding invitation for the \[\[Wikipedia:Teahouse|Teahouse\]\]!'
						}
						else{
							document.getElementById('afcHelper_get'+escape(teahouse)).innerHTML = '<a href="'+wgArticlePath.replace("$1", encodeURI('User talk:'+username))+'" title="User talk:'+username+'">'+username+'</a> already has an invitation.';
						}
						delete req;
					}
				}//end TH stuff
				afcHelper_editPage("User talk:"+username, usertext, token, reason);
			}
			if(!blank){
				var containComment = (text.indexOf('----') != -1);
				if(newcomment != ''){
					if(!containComment)
						text = text.substring(0, startindex) + newtemplate + '\n' + newcomment + '\n----\n'+ text.substring(endindex);
					else{
						text = text.substring(0, startindex) + newtemplate + text.substring(endindex);
						var idx = text.indexOf('----');
						text = text.substring(0, idx) + newcomment +'\n' + text.substring(idx);
					}
				}
				else
					text = text.substring(0, startindex) + newtemplate + text.substring(endindex);
			}
			else{
				text = newtemplate + '\n' + newcomment + '\n\{\{afc cleared';
				if(blank_csd)
					text+="\|csd\}\}";
				else
					text+="\}\}";
			}

		//first remove the multiple pending templates, otherwise one isn't recognized
		text = text.replace(/\{\{\s*afc submission\s*\|\s*[||h|r](?:\{\{[^{}]*\}\}|[^}{])*\}\}/i, "");
		text = afcHelper_cleanup(text);
		afcHelper_editPage(afcHelper_PageName, text, token, summary);
		}

		else if(action == 'comment'){
			var comment = document.getElementById("afcHelper_comments").value;
			jsMsg('<ul id="afcHelper_status"></ul><ul id="afcHelper_finish"></ul>');
			document.getElementById('afcHelper_finish').innerHTML += '<span id="afcHelper_finished_wrapper"><span id="afcHelper_finished_main" style="display:none"><li id="afcHelper_done"><b>Done (<a href="'+wgArticlePath.replace("$1", encodeURI(afcHelper_PageName))+'?action=purge" title="'+afcHelper_PageName+'">Reload page</a>)</b></li></span></span>';
			var token = afcHelper_getToken(true);
			var text = afcHelper_getPageText(afcHelper_PageName, true);
			var containComment = (text.indexOf('----') != -1);
			var newComment = "\{\{afc comment|1=" + comment + "\~\~\~\~\}\}";
			if(comment != ''){
				if(!containComment){
					var afc_re = /\{\{\s*afc submission\s*\|\s*[||h|r|d](?:\{\{[^\{\}]*\}\}|[^\}\{])*\}\}/i;
					if( !afc_re.test( text ) ) {
						alert( "Unable to locate AFC submission template, aborting..." );
						return;
					}
					var afctemplate = afc_re.exec(text)[0];
					var endindex = text.indexOf(afctemplate) + afctemplate.length;
					text = text.substring(0, endindex) + '\n' + newComment + '\n----\n'+ text.substring(endindex);
				}
				else{
					var idx = text.indexOf('----');
					text = text.substring(0, idx) + newComment +'\n' + text.substring(idx);
				}
				text = afcHelper_cleanup(text);
				afcHelper_editPage(afcHelper_PageName, text, token, "Commenting on submission");
			}
		}
		else if(action == 'mark'){
			var comment = document.getElementById("afcHelper_comments").value;
			jsMsg('<ul id="afcHelper_status"></ul><ul id="afcHelper_finish"></ul>');
			document.getElementById('afcHelper_finish').innerHTML += '<span id="afcHelper_finished_wrapper"><span id="afcHelper_finished_main" style="display:none"><li id="afcHelper_done"><b>Done (<a href="'+wgArticlePath.replace("$1", encodeURI(afcHelper_PageName))+'?action=purge" title="'+afcHelper_PageName+'">Reload page</a>)</b></li></span></span>';
			var token = afcHelper_getToken(true);
			var text = afcHelper_getPageText(afcHelper_PageName, true);
			var containComment = (text.indexOf('----') != -1);
			var newComment = "\{\{afc comment|1=" + comment + "\~\~\~\~\}\}";
			if(comment != ''){
				if(!containComment){
					var afc_re = /\{\{\s*afc submission\s*\|\s*[||h|r|d](?:\{\{[^\{\}]*\}\}|[^\}\{])*\}\}/i;
					if( !afc_re.test( text ) ) {
						alert( "Unable to locate AFC submission template, aborting..." );
						return;
					}
				var afctemplate = afc_re.exec(text)[0];
				var endindex = text.indexOf(afctemplate) + afctemplate.length;
				text = text.substring(0, endindex) + '\n' + newComment + '\n----\n'+ text.substring(endindex);
				}
				else{
				var idx = text.indexOf('----');
				text = text.substring(0, idx) + newComment +'\n' + text.substring(idx);
				}
			}
			var afc_re = /\{\{\s*afc submission\s*\|\s*[||h](?:\{\{[^\{\}]*\}\}|[^\}\{])*\}\}/i;
			if( !afc_re.test( text ) ) {
				alert( "Unable to locate AFC submission template, aborting..." );
				return;
			}
			var afctemplate = afc_re.exec(text)[0];
			var firstpipe = afctemplate.indexOf('|');
			var endpipe = afctemplate.indexOf('|ts');
			var newTemplate = afctemplate.substring(0, firstpipe);
			newTemplate += '|r||';
			newTemplate += afctemplate.substring(endpipe);
			var startindex = text.indexOf(afctemplate);
			var endindex = text.indexOf(afctemplate) + afctemplate.length;
			text = text.substring(0, startindex) + newTemplate + text.substring(endindex);
			text = afcHelper_cleanup(text);
			afcHelper_editPage(afcHelper_PageName, text, token, "Marking submission as being reviewed");
		}
		else if(action == 'cleanup'){
			jsMsg('<ul id="afcHelper_status"></ul><ul id="afcHelper_finish"></ul>');
			document.getElementById('afcHelper_finish').innerHTML += '<span id="afcHelper_finished_wrapper"><span id="afcHelper_finished_main" style="display:none"><li id="afcHelper_done"><b>Done (<a href="'+wgArticlePath.replace("$1", encodeURI(afcHelper_PageName))+'?action=purge" title="'+afcHelper_PageName+'">Reload page</a>)</b></li></span></span>';
			var token = afcHelper_getToken(true);
			var text = afcHelper_getPageText(afcHelper_PageName, true);
			var text2 = afcHelper_cleanup(text);
			if(text==text2)
				document.getElementById('afcHelper_finish').innerHTML += '<span id="afcHelper_finished_wrapper"><span id="afcHelper_finished_main><li id="afcHelper_done"><b>This submission is already cleaned. Nothing changed. (<a href="'+wgArticlePath.replace("$1", encodeURI(afcHelper_PageName))+'?action=purge" title="'+afcHelper_PageName+'">Reload page</a>)</b></li></span></span>';
			else
				afcHelper_editPage(afcHelper_PageName, text2, token, "Cleaning the submission.");
		}
		document.getElementById('afcHelper_finished_main').style.display = '';
	}

	function afcHelper_getPageText(title, status) {
		if (status == 'true')
			document.getElementById('afcHelper_status').innerHTML += '<li id="afcHelper_get'+escape(title)+'">Getting <a href="'+wgArticlePath.replace("$1", encodeURI(title))+'" title="'+title+'">'+title+'</a></li>';
		var req = sajax_init_object();
		var params = "action=query&prop=revisions&rvprop=content&format=json&indexpageids=1&titles=" + encodeURIComponent(title);
		req.open("POST", wgScriptPath + "/api.php", false);
		req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		req.setRequestHeader("Content-length", params.length);
		req.setRequestHeader("Connection", "close");
		req.send(params);
		var response = eval('(' + req.responseText + ')');
		pageid = response['query']['pageids'][0];
		if (pageid == "-1") {
			if(status == 'true')
				document.getElementById('afcHelper_get'+escape(title)).innerHTML = '<a class="new" href="'+wgArticlePath.replace("$1", encodeURI(title))+'" title="'+title+'">'+title+'</a> does not exist';
			delete req;
			return '';
		}
		pagetext = response['query']['pages'][pageid]['revisions'][0]['*'];
		delete req;
		if(status == 'true')
			document.getElementById('afcHelper_get'+escape(title)).innerHTML = 'Got <a href="'+wgArticlePath.replace("$1", encodeURI(title))+'" title="'+title+'">'+title+'</a>';
		return pagetext;
	}
	function afcHelper_getToken(show) {
		if (show) {
			document.getElementById('afcHelper_status').innerHTML += '<li id="afcHelper_gettoken">Getting token</li>';
		}
		var req = sajax_init_object();
		req.open("GET", wgScriptPath + "/api.php?action=query&prop=info&indexpageids=1&intoken=edit&format=json&titles="+encodeURIComponent(afcHelper_PageName), false);
		req.send(null);
		var response = eval('(' + req.responseText + ')');
		pageid = response['query']['pageids'][0];
		token = response['query']['pages'][pageid]['edittoken'];
		delete req;
		if (show) {
			document.getElementById('afcHelper_gettoken').innerHTML = 'Got token';
		}
		return token;
	}

	function afcHelper_movePage(oldtitle, newtitle, token, summary, callback){
		summary += afcHelper_advert;
		document.getElementById('afcHelper_finished_wrapper').innerHTML = '<span id="afcHelper_AJAX_finished_'+afcHelper_AJAXnumber+'" style="display:none">' + document.getElementById('afcHelper_finished_wrapper').innerHTML + '</span>';
		var func_id = afcHelper_AJAXnumber;
		afcHelper_AJAXnumber++;
		document.getElementById('afcHelper_status').innerHTML += '<li id="afcHelper_move'+escape(oldtitle)+'">Moving <a href="'+wgArticlePath.replace("$1", encodeURI(oldtitle))+'" title="'+oldtitle+'">'+oldtitle+'</a> to <a href="'+wgArticlePath.replace("$1", encodeURI(newtitle))+'" title="'+newtitle+'">'+newtitle+'</a></li>';
		var req = sajax_init_object();
		var params = "action=move&format=json&token="+encodeURIComponent(token)+"&from="+encodeURIComponent(oldtitle) +"&to="+encodeURIComponent(newtitle)+"&reason="+encodeURIComponent(summary);
		url = wgScriptPath + "/api.php";
		req.open("POST", url, true);
		req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		req.setRequestHeader("Content-length", params.length);
		req.setRequestHeader("Connection", "close");
		req.onreadystatechange = function() {
			if(req.readyState == 4 && req.status == 200) {
				var error = true;
				response = eval('(' + req.responseText + ')');
				try {
					if (typeof(response['move']) != "undefined") {
						document.getElementById('afcHelper_move'+escape(oldtitle)).innerHTML = 'Moved <a href="'+wgArticlePath.replace("$1", encodeURI(oldtitle))+'" title="'+oldtitle+'">'+oldtitle+'</a>';
						error = false;
					} else {
						document.getElementById('afcHelper_move'+escape(oldtitle)).innerHTML = '<div style="color:red"><b>Move failed on <a href="'+wgArticlePath.replace("$1", encodeURI(oldtitle))+'" title="'+oldtitle+'">'+oldtitle+'</a></b></div>. Error info:' +response['error']['code'] + ' : ' + response['error']['info'];
					}
				}
				catch(err) {
					document.getElementById('afcHelper_move'+escape(oldtitle)).innerHTML = '<div style="color:red"><b>Move failed on <a href="'+wgArticlePath.replace("$1", encodeURI(oldtitle))+'" title="'+oldtitle+'">'+oldtitle+'</a></b></div>';
				}
				if(!error){
					if(callback != null)
						callback();
				}
				document.getElementById('afcHelper_AJAX_finished_'+func_id).style.display = '';
				delete req;
			}

		};
		req.send(params);
	}

	function afcHelper_editPage(title, newtext, token, summary) {
		summary += afcHelper_advert;
		document.getElementById('afcHelper_finished_wrapper').innerHTML = '<span id="afcHelper_AJAX_finished_'+afcHelper_AJAXnumber+'" style="display:none">' + document.getElementById('afcHelper_finished_wrapper').innerHTML + '</span>';
		var func_id = afcHelper_AJAXnumber;
		afcHelper_AJAXnumber++;
		document.getElementById('afcHelper_status').innerHTML += '<li id="afcHelper_edit'+escape(title)+'">Editing <a href="'+wgArticlePath.replace("$1", encodeURI(title))+'" title="'+title+'">'+title+'</a></li>';
		var req = sajax_init_object();
		var params = "action=edit&format=json&token="+encodeURIComponent(token)+"&title="+encodeURIComponent(title)+"&text="+encodeURIComponent(newtext)+"&notminor=1&summary="+encodeURIComponent(summary);
		url = wgScriptPath + "/api.php";
		req.open("POST", url, true);
		req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		req.setRequestHeader("Content-length", params.length);
		req.setRequestHeader("Connection", "close");
		req.onreadystatechange = function() {
			if(req.readyState == 4 && req.status == 200) {
				response = eval('(' + req.responseText + ')');
				try {
					if (response['edit']['result'] == "Success") {
						document.getElementById('afcHelper_edit'+escape(title)).innerHTML = 'Saved <a href="'+wgArticlePath.replace("$1", encodeURI(title))+'" title="'+title+'">'+title+'</a>';
					} else {
						document.getElementById('afcHelper_edit'+escape(title)).innerHTML = '<div style="color:red"><b>Edit failed on <a href="'+wgArticlePath.replace("$1", encodeURI(title))+'" title="'+title+'">'+title+'</a></b></div>. Error info:' +response['error']['code'] + ' : ' + response['error']['info'];
					}
				}
				catch(err) {
					document.getElementById('afcHelper_edit'+escape(title)).innerHTML = '<div style="color:red"><b>Edit failed on <a href="'+wgArticlePath.replace("$1", encodeURI(title))+'" title="'+title+'">'+title+'</a></b></div>';
				}
				document.getElementById('afcHelper_AJAX_finished_'+func_id).style.display = '';
				delete req;
			}
		};
		req.send(params);
	}

	function afcHelper_addLink() {
		addPortletLink("p-cactions", "javascript:afcHelper_init()", "Review", "ca-afcHelper", "Review");
	}

	function afcHelper_onChange(select){
		var value = select.options[select.selectedIndex].value;
		if(value=='cv')
			document.getElementById("afcHelper_extra_inline").innerHTML='<label for="afcHelper_extra">Please enter the URL if available: </label><input type="text" id="afcHelper_extra_inlinebox" name="afcHelper_extra_inlinebox" value="http://" />';
		else if(value=='dup')
			document.getElementById("afcHelper_extra_inline").innerHTML='<label for="afcHelper_extra_inline">Please enter the title of the duplicate submission, if possible. Do not enter the prefix (e.g., John Doe): </label><input type="text" id="afcHelper_extra_inlinebox" name="afcHelper_extra_inlinebox" value="" />';
		else if(value=='mergeto')
			document.getElementById("afcHelper_extra_inline").innerHTML='<label for="afcHelper_extra_inline">Please enter the title of the article to merge to, if possible: </label><input type="text" id="afcHelper_extra_inlinebox" name="afcHelper_extra_inlinebox" value="" />';
		else if(value=='lang')
			document.getElementById("afcHelper_extra_inline").innerHTML='<label for="afcHelper_extra_inline">Please enter the language the article is written in, if possible/known (e.g. German): </label><input type="text" id="afcHelper_extra_inlinebox" name="afcHelper_extra_inlinebox" value="" />';
		else if(value=='exists')
			document.getElementById("afcHelper_extra_inline").innerHTML='<label for="afcHelper_extra_inline">Please enter the title of the existing article, if possible: </label><input type="text" id="afcHelper_extra_inlinebox" name="afcHelper_extra_inlinebox" value="" />';
		else if(value=='plot')
			document.getElementById("afcHelper_extra_inline").innerHTML='<label for="afcHelper_extra_inline">Please enter the title of the existing article on the fiction, if there is one: </label><input type="text" id="afcHelper_extra_inlinebox" name="afcHelper_extra_inlinebox" value="" />';
		else
			document.getElementById("afcHelper_extra_inline").innerHTML='';

		if(value == 'blp' || value == 'cv'){
			document.getElementById("afcHelper_blank").setAttribute("checked", "checked");
		}
		else
			document.getElementById("afcHelper_blank").removeAttribute("checked");

	}

	function afcHelper_cleanup(text)
	{
		//Commenting out cats
		text = text.replace(/\[\[Category:/gi, "\[\[:Category:");

		//Wikilink correction
		var wikiURL=/\[\[(http[s]?\:\/\/en.wikipedia.org\/wiki\/|https\:\/\/secure.wikimedia.org\/wikipedia\/en\/wiki\/)[\|\s]*.*\]\]/i;
		var wikiURL2=/\[(http[s]?\:\/\/en.wikipedia.org\/wiki\/|https\:\/\/secure.wikimedia.org\/wikipedia\/en\/wiki\/)[\|\s]*.*\]/i;

		while(wikiURL.test(text)){
		var firsthit=wikiURL.exec(text);
		var firsthit2=firsthit[0].toString();
		var firsthit_copy=firsthit[0].toString();
		var wikiURL3=/\[\[(http[s]?\:\/\/en.wikipedia.org\/wiki\/|https\:\/\/secure.wikimedia.org\/wikipedia\/en\/wiki\/)/i;
		firsthit2=firsthit2.replace(wikiURL3, "\[\[");
		firsthit2=firsthit2.replace(/[\s\|]+/i, "\|");
		firsthit2=firsthit2.replace(/\]\]/i, "\]\]");
		text=text.replace(firsthit_copy, firsthit2);
		}
		while(wikiURL2.test(text)){
		var firsthit=wikiURL2.exec(text);
		var firsthit2=firsthit[0].toString();
		var firsthit_copy=firsthit[0].toString();
		var wikiURL3=/\[(http[s]?\:\/\/en.wikipedia.org\/wiki\/|https\:\/\/secure.wikimedia.org\/wikipedia\/en\/wiki\/)/i;
		firsthit2=firsthit2.replace(wikiURL3, "\[\[");
		firsthit2=firsthit2.replace(/[\s\|]+/i, "\|");
		firsthit2=firsthit2.replace(/\]/i, "\]\]");
		text=text.replace(firsthit_copy, firsthit2);
		}

		// Remove all unneeded HTML comments and wizards stuff
		text = text.replace("* \[http\:\/\/www.example.com\/ example.com\]", "");
		text = text.replace(/'''Subject of my article''' is.../ig, "");
		text = text.replace(/\<\!--- Carry on from here, and delete this comment. ---\>/ig, "");
		text = text.replace(/\<\!-- This will add a notice to the bottom of the page and won't blank it! The new template which says that your draft is waiting for a review will appear at the bottom; simply ignore the old (grey) drafted templates and the old (red) decline templates. A bot will update your article submission. Until then, please don't change anything in this text box and press "Save page". --\>/ig, "");
		text = text.replace(/\<\!-- EDIT BELOW THIS LINE --\>/ig, "");
		text = text.replace(/\<\!--- Categories ---\>/gi, '');
		text = text.replace(/\<\!--- After listing your sources please cite them using inline citations and place them after the information they cite. Please see http:\/\/en.wikipedia.org\/wiki\/Wikipedia:REFB for instructions on how to add citations. ---\>/ig, "");
		text = text.replace(/\<\!--Please don't change anything and press save --\>/ig, "");
		text = text.replace(/\<\!-- Please leave this line alone! --\>/ig, "");
		text = text.replace(/\<\!--- Important, do not remove this line before article has been created. ---\>/ig, "");
		text = text.replace(/== Request review at \[\[WP:AFC\]\] ==\n/ig, "");
		// Remove {{userspacedraft}}, {{userspace draft}}, {{user sandbox}}
		text = text.replace(/\{\{(userspacedraft|userspace draft|user sandbox)(?:\{\{[^{}]*\}\}|[^}{])*\}\}/ig, "");
		text = text.replace(/---[-]+/ig, "");
		
		var afc_re = /\{\{\s*afc submission\s*\|\s*[||h|r](?:\{\{[^\{\}]*\}\}|[^\}\{])*\}\}/i;
		var afc_alt = /\{\{\s*afc submission\s*\|\s*[^t](?:\{\{[^\{\}]*\}\}|[^\}\{])*\}\}/i;
		var afc_all = /\{\{\s*afc submission\s*\|\s*(?:\{\{[^\{\}]*\}\}|[^\}\{])*\}\}/i;
		var afc_comment = /\{\{\s*afc comment(?:\{\{[^\{\}]*\}\}|[^\}\{])*\}\}/i;
		// Remove all draft templates
		if(afc_alt.test(text))
			text = text.replace(/\{\{\s*afc submission\s*\|\s*t(?:\{\{[^{}]*\}\}|[^}{])*\}\}/ig, "");
		// Find the first pending submission or marked as review on the page.
		var temp = text;
		//Remove any duplicate open review requests before saving the page (only affects open requests)
		//find the first pending template and remove it, if one was removed too much, revert the last removal
		while(afc_re.test(text)){
			temp = text;
			text = text.replace(/\{\{\s*afc submission\s*\|\s*[||h|r](?:\{\{[^{}]*\}\}|[^}{])*\}\}/i, "");
			if(!afc_re.test(text)){
				text=temp;
				break;
			}
		}
		//create an array, strip the submission templates, then AFC comments and then add them back to the page, add then ----
		var submissiontemplates=new Array();
		var commentstemplates=new Array();
		while(afc_all.test(text)){
			submissiontemplates.push(afc_all.exec(text));
			text=text.replace(afc_all.exec(text), "");
		}
		while(afc_comment.test(text)){
			commentstemplates.push(afc_comment.exec(text));
			text=text.replace(afc_comment.exec(text), "");
		}
		//removal of unnecessary new lines, stars, "-", and whitespaces at the top of the page
		text = text.replace(/[*\n\s-]*/m, "");
		//adding back the submission templates and comment templates
		if(commentstemplates.length>0){
			text = '----\n'+text;
			for((i=commentstemplates.length-1);i>=0;i--)
				text=commentstemplates[i]+'\n\n'+text;
		}
		if(submissiontemplates.length>0){
			for((i=submissiontemplates.length-1);i>=0;i--){
				if(i==(submissiontemplates.length-1))
					text=submissiontemplates[i]+'\n'+text;
				else if(i>=0){
					var find_shrinked=/\|\s*small\s*=\s*yes/gi;
					if(find_shrinked.test(submissiontemplates[i])){
						text=submissiontemplates[i]+text;
					}
					else{
						var temp=submissiontemplates[i].toString();
						var templength=temp.length - 2;
						temp=temp.slice(0, templength);
						text=temp+'\|small=yes\}\}'+text;
					}
				}
			}
		}
	return text;
}

	function afcHelper_generateSelect(title, options, onchange){
		var text = '<select name="' + title + '" id="' + title +'" ';
		if(onchange != null)
			text += 'onchange = "' + onchange + '" ';
		text+= '>';
		for(var i = 0; i < options.length; i ++){
			var o = options[i];
			text += '<option value="' + afcHelper_escapeHtmlChars(o.value) + '" ';
			if(o.selected)
				text += 'selected="selected" ';
			text += '>' + o.label + '</option>';
		}
		text += "</select>";
		return text;
	}
	addOnloadHook(afcHelper_addLink);
}

	function afcHelper_blanking(){
		var text = afcHelper_getPageText(afcHelper_PageName, false);
		var text = afcHelper_cleanup(text);
		//test for AFC submission templates with not enough parameter
		//Nmespaces WP (4) and WT (5)
		//var afc_alltemplates= /\{\{\s*afc submission(?:\{\{[^\{\}]*\}\}|[^\}\{])*\}\}/i;
		//afc_all=text.match(afc_alltemplates);

		//longer than 20 characters, but commonly added to the source code
		texttest = text.replace(/\<\!--  Bot generated title --\>/gi, "");
		texttest = texttest.replace(/\<\!-- See Wikipedia\:WikiProject Musicians --\>/gi, "");
		texttest = texttest.replace(/\<\!-- Only for images narrower than 220 pixels --\>/gi, "");
		texttest = texttest.replace(/\<\!-- Metadata\: see \[\[Wikipedia\:Persondata\]\]. --\>/gi, "");
		var recomment = /\<\!--.{20}.*/gi;
		var errormsg ='';
		// test if too long (20+ characters) HTML comments are still in the page text
		if(recomment.test(texttest))
			errormsg = '<h3><div style="color:red">Please check the source code! This page contains a really long HTML comment!</div></h3>';

		// count <ref> and </ref> and check if it fits
		// Special thanks to [[User:Betacommand]] for KISS
		var rerefbegin = /\<\s*ref\s*(name\s*=|group\s*=)*\s*[^\/]*>/ig;
		var rerefend = /\<\/\s*ref\s*\>/ig;
		refbegin=texttest.match(rerefbegin);
		refend=texttest.match(rerefend);
		if(refbegin){//Firefox workaround!
			if(refend){//Firefox workaround!
				if(refbegin.length!=refend.length){
					errormsg += '<h3><div style="color:red">Please check the source code! This page contains unclosed &lt;ref&gt; tags!</div></h3>';
				}
			}
			else{
				errormsg += '<h3><div style="color:red">Please check the source code! This page contains not the same amount of &lt;ref&gt; and &lt;/ref&gt; tags!</div></h3>';
			}
		}
		// test if <ref> foo <ref> on the page and place the markup on the box
		var rerefdouble = /\<\s*ref\s*(name\s*=|group\s*=)*\s*[^\/]*\>?(\<\s*[^\/]*\s*ref\s*(name\s*=|group\s*=)*)/ig;
		var refdouble=text.match(rerefdouble);
		if(refdouble){
			errormsg +='The script found following bad lines:<br/><i>';
			for(i=0;i<refdouble.length;i++)
				errormsg +=afcHelper_escapeHtmlChars(refdouble[i].toString())+'&gt;<br/>';
			errormsg+='</i>';
		}
		return errormsg;
}

//function to add afc cleared (csd) checkbox if afc cleared is checked
function afcHelper_trigger(type){
	var e = document.getElementById(type);
	e.style.display = ((e.style.display!='none') ? 'none' : 'block');
}
//function to disable checkboxes or textfields; not used at the moment, will be used maybe later
//function afcHelper_trigger(){
//	if(afcHelper_optional_replace.checked){
//		afcHelper_reason.disabled=false;
//	}else{
//		afcHelper_reason.disabled=true;
//	}
//}
