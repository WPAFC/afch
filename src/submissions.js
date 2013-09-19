//<nowiki>
// Script should be located at [[MediaWiki:Gadget-afchelper.js/submissions.js]]
var afcHelper_PageName = wgPageName.replace(/_/g, ' ');
var afcHelper_AJAXnumber = 0;
var afcHelper_submissionTitle = wgTitle.replace(/Articles for creation\//g, '');
var disambig_re = /Disambig|Mil-unit-dis|Hndis|Geodis|Numberdis/i;
var typetemplate_re = /\{\{\s*documentation\s*(?:\{\{[^\{\}]*\}\}|[^\}\{])*\}\}/i;
var afcdab_re = /\{\{\s*afc submission\s*\|(?:\{\{[^\{\}]*\}\}|[^\}\{])*\|\s*type\s*=\s*dab\s*(?:\{\{[^\{\}]*\}\}|[^\}\{])*\}\}/i;
var afctemplate_re = /\{\{\s*afc submission\s*\|(?:\{\{[^\{\}]*\}\}|[^\}\{])*\|\s*type\s*=\s*template\s*(?:\{\{[^\{\}]*\}\}|[^\}\{])*\}\}/i;
var afc_re = /\{\{\s*afc submission\s*\|(?:\{\{[^\{\}]*\}\}|[^\}\{])*\}\}/i;
var all_afc_re = /\{\{\s*afc submission\s*\|(?:\{\{[^\{\}]*\}\}|[^\}\{])*\}\}/gi;
var pending_afc_re = /((\{\{\s*afc submission\s*\|)(\s*[||r])+((?:\{\{[^\{\}]*\}\}|[^\}\{])*\}\})|\{\{subst:submit\|?.*?\}\})/i;
var declined_afc_re = /(\{\{\s*afc submission\s*\|)(\s*[d])+((?:\{\{[^\{\}]*\}\}|[^\}\{])*)(\|small=yes)(\}\})/i;
var reviewing_afc_re = /\{\{\s*afc submission\s*\|\s*r\s*\|(?:\{\{[^\{\}]*\}\}|[^\}\{])*\}\}/gi;
var template_status_re = /(\{\{\s*afc submission\s*\|)(\s*|r|d)+((?:\{\{[^\{\}]*\}\}|[^\}\{])*\}\})/i;
var afc_comment_re = /\{\{\s*afc comment(?:\{\{[^\{\}]*\}\}|[^\}\{])*\}\}/i;
var draft_afc_re = /\{\{\s*afc submission\s*\|\s*t(?:\{\{[^\{\}]*\}\}|[^\}\{])*\}\}/i;
var not_draft_afc_re = /\{\{\s*afc submission\s*\|\s*[^t](?:\{\{[^\{\}]*\}\}|[^\}\{])*\}\}/i;
var submissiontemplate_re = /(\{\{\s*afc submission\s*\|\s*([||t|r|d])(?:\{\{[^\{\}]*\}\}|[^\}\{])*)(\|\s*ts\s*=\s*([0-9]{14})|\{\{subst:LOCALTIMESTAMP\}\}|\{\{REVISIONTIMESTAMP\}\})((?:\{\{[^\{\}]*\}\}|[^\}\{]))*\}\}/i;
var exclusive_pending_afc_re = /(\{\{\s*afc submission\s*\|)(\s*[\|]\s*)((?:\{\{[^\{\}]*\}\}|[^\}\{])*\}\})/i;
var afcHelper_cache = {};
var afcHelper_longcomments = {};
var afcHelper_reasonhash = [{
	label: 'DUPLICATE ARTICLES',
	value: 'Duplicate articles',
	disabled: true
}, {
	label: 'exists - Submission is duplicated by another article already in mainspace',
	value: 'exists',
	reason: 'submission already exists in main space'
}, {
	label: 'dup - Submission is a duplicate of another existing submission',
	value: 'dup',
	reason: 'submission is a duplicate of another submission'
}, {
	label: 'TEST EDITS',
	value: 'Test edits',
	disabled: true
}, {
	label: 'blank - Submission is blank',
	value: 'blank',
	reason: 'submission is blank'
}, {
	label: 'test - Submission appears to be a test edit',
	value: 'test',
	reason: 'submission is a test edit'
}, {
	label: 'BLP/VANDALISM',
	value: 'BLP/Vandalism',
	disabled: true
}, {
	label: 'van - Submission is vandalism, a negative unsourced BLP, or an attack page (please blank the page and mark it for deletion)',
	value: 'van',
	reason: 'submission is vandalism, a negative unsourced BLP, or an attack page'
}, {
	label: 'ilc - Submission is a BLP that does not meet minimum inline citation requirements (WP:MINREF)',
	value: 'ilc',
	reason: 'submission does not contain minimum citations'
}, {
	label: 'blp - BLP contains unsourced, possibly defamatory claims, but WP:AGF and wait for sources (blank the page but do not CSD it)',
	value: 'blp',
	reason: 'submission does not conform to BLP'
}, {
	label: 'MERGING',
	value: 'Merging',
	disabled: true
}, {
	label: 'mergeto - Submission should be merged into another article (indicate which article in the comment box)',
	value: 'mergeto',
	reason: 'submission is too short but can be merged'
}, {
	label: 'BLATANT [[WP:NOT]] VIOLATIONS',
	value: 'Blatant [[WP:NOT]] violations',
	disabled: true
}, {
	label: 'joke - Submission appears to be a joke or hoax',
	value: 'joke',
	reason: 'submission appears to be a joke'
}, {
	label: 'not - Submission fails [[Wikipedia:What Wikipedia is not]]',
	value: 'not',
	reason: 'submission is covered by WP:NOT'
}, {
	label: 'PROSE ISSUES',
	value: 'Prose issues',
	disabled: true
}, {
	label: 'lang - Submission is not in English',
	value: 'lang',
	reason: 'submission is not in English'
}, {
	label: 'cv - Submission is a copyright violation (blank the article, enter links in the box below, and mark for deletion)',
	value: 'cv',
	reason: 'submission is a copyright violation'
}, {
	label: 'redirect - Submission is a redirect request',
	value: 'redirect',
	reason: 'submission is a redirect request'
}, {
	label: 'news - Submission appears to be a news story of a single event',
	value: 'news',
	reason: 'submission appears to be a news report of a single event'
}, {
	label: 'dict - Submission is a dictionary definition',
	value: 'dict',
	reason: 'submission is a dictionary definition'
}, {
	label: 'plot - Submission consists mostly of a plot summary',
	value: 'plot',
	reason: 'submission is a plot summary'
}, {
	label: 'adv - Submission reads like an advertisement',
	value: 'adv',
	reason: 'submission is written like an advertisement'
}, {
	label: 'context - Submission provides insufficient context',
	value: 'context',
	reason: 'submission provides insufficient context'
}, {
	label: 'essay - Submission reads like an essay',
	value: 'essay',
	reason: 'submission reads like an essay'
}, {
	label: 'npov - Submission is not written in a formal, neutral encyclopedic tone',
	value: 'npov',
	reason: 'submission is not written from a formal, neutral point of view'
}, {
	label: 'NOTABILITY',
	value: 'Notability',
	disabled: true
}, {
	label: 'neo - Submission is about a neologisim that does not meet notability guidelines',
	value: 'neo',
	reason: 'submission is a neologism'
}, {
	label: 'web - Submission is about web content does not meet notability guidelines',
	value: 'web',
	reason: 'subject appears to be non-notable web content'
}, {
	label: 'prof - Submission is about a professor does not meet notability guidelines',
	value: 'prof',
	reason: 'subject appears to be a non-notable academic'
}, {
	label: 'athlete - Submission is about an athlete does not meet notability guidelines',
	value: 'athlete',
	reason: 'subject appears to be a non-notable athlete'
}, {
	label: 'music - Submission is about a musician or musical work does not meet notability guidelines',
	value: 'music',
	reason: 'subject appears to be a non-notable musical performer or work'
}, {
	label: 'film - Submission is about a film does not meet notability guidelines',
	value: 'film',
	reason: 'subject appears to be a non-notable film'
}, {
	label: 'corp - Submission is about a company or organization does not meet notability guidelines',
	value: 'corp',
	reason: 'subject appears to be a non-notable company or organization'
}, {
	label: 'bio - Submission is about a person does not meet notability guidelines',
	value: 'bio',
	reason: 'subject appears to be a non-notable person'
}, {
	label: 'nn - Submission does not meet general notability guidelines (use a more specific reason if possible)',
	value: 'nn',
	reason: 'subject appears to be non-notable'
}, {
	label: 'SOURCING',
	value: 'Sourcing',
	disabled: true
}, {
	label: 'v - Submission is improperly sourced',
	value: 'v',
	reason: 'submission is unsourced or contains only unreliable sources'
}, {
	label: 'OTHER',
	value: 'Other',
	disabled: true
}, {
	label: 'custom - Enter a decline reason in the box below, linking to relevant policies',
	value: 'reason',
	reason: ''
}, {
	label: 'Select a reason for declining',
	selected: true,
	value: 'reason',
	disabled: true,
	reason: ''
}];

function afcHelper_init() {
	displayMessage('<div id="afcHelper_loadingmsg">Loading the Article for creation helper script...</div>');

	if (!wfSupportsAjax()) {
		displayMessage('<span class="notice">Uh-oh! Your browser appears to be too old to handle the helper script or does not support AJAX. Please <a href="http://browsehappy.com">upgrade</a> to the latest version of Firefox, Safari, Chrome, or Opera for best results. Sorry about that; please <a href="https://en.wikipedia.org/wiki/Wikipedia_talk:WikiProject_Articles_for_creation/Helper_script" target="_blank">let us know</a> if you need further assistance.</span>');
		return;
	}

	form = '<div id="afcHelper_initialform">';
	form += afcHelper_setup();
	form += '<h3>Reviewing ' + afcHelper_PageName + '</h3>';

	if (BETA) form += '<div id="afcHelper_betanotice">You are currently running a <b>beta version</b> of the Articles for creation helper script. Some features may not work as intended; please report errors <a href="https://en.wikipedia.org/wiki/Wikipedia_talk:WikiProject_Articles_for_creation/Helper_script" target="_blank">here</a>.</div>';

	var template_status_re = /\{\{\s*afc submission\s*\|\s*(\S|\s*)\s*\|/gi;
	var temp_statuses = new Array();
	var match;
	while (match = template_status_re.exec(pagetext)) {
		temp_statuses.push(match[1]);
	}
	var template_statuses = new Array();
	for (var i = 0; i < temp_statuses.length; i++) {
		status = temp_statuses[i];
		if (status === "|") status = "";
		template_statuses[i] = status.toLowerCase();
	}
	if (template_statuses.length == 0) template_statuses = false; // if there is no template on page

	if ($.inArray("", template_statuses) != -1 || $.inArray("r", template_statuses) != -1) {
		form += '<button class="afcHelper_button" type="button" id="afcHelper_accept_button" onclick="afcHelper_prompt(\'accept\')">Accept</button>';
		form += '<button class="afcHelper_button" type="button" id="afcHelper_decline_button" onclick="afcHelper_prompt(\'decline\')">Decline</button>';
	}

	if (afcHelper_g13_eligible(afcHelper_PageName) && $.inArray("", template_statuses) == -1 && $.inArray("r", template_statuses) == -1) {
		form += '<button class="afcHelper_button" type="button" id="afcHelper_accept_button" onclick="afcHelper_prompt(\'accept\')">Accept G13-eligible submission</button>';
		form += '<button class="afcHelper_button" type="button" id="afcHelper_g13_button" onclick="afcHelper_act(\'g13\')">Tag the submission for G13 speedy deletion</button>';
		form += '<button class="afcHelper_button" type="button" id="afcHelper_postpone_g13_button" onclick="afcHelper_prompt(\'postpone_g13\')">Postpone G13 deletion</button>';
	}

	if ($.inArray("", template_statuses) != -1 || $.inArray("r", template_statuses) != -1 || $.inArray("d", template_statuses) != -1) form += '<button class="afcHelper_button" type="button" id="afcHelper_comment_button" onclick="afcHelper_prompt(\'comment\')">Comment</button>';

	if (template_statuses === false || $.inArray("t", template_statuses) != -1 || (($.inArray("d", template_statuses) != -1) && ($.inArray("", template_statuses) == -1) && ($.inArray("r", template_statuses) == -1))) form += '<button class="afcHelper_button" type="button" id="afcHelper_submit_button" onclick="afcHelper_prompt(\'submit\')">Submit</button>';

	if (template_statuses === false) form += '<button class="afcHelper_button" type="button" id="afcHelper_draft_button" onclick="afcHelper_prompt(\'draft\')">Mark as draft submission</button>';

	if ($.inArray("r", template_statuses) != -1) {
		form += '<button class="afcHelper_button" type="button" id="afcHelper_unmark_button" onclick="afcHelper_act(\'unmark\')">Unmark as reviewing</button>';
	} else if ($.inArray("", template_statuses) != -1) {
		form += '<button class="afcHelper_button" type="button" id="afcHelper_mark_button" onclick="afcHelper_prompt(\'mark\')">Mark as reviewing</button>';
	}

	if (template_statuses === false || $.inArray("", template_statuses) != -1 || $.inArray("r", template_statuses) != -1 || $.inArray("d", template_statuses) != -1 || $.inArray("t", template_statuses) != -1) form += '<button class="afcHelper_button" type="button" id="afcHelper_cleanup_button" onclick="afcHelper_act(\'cleanup\')">Clean the submission</button>';

	form += '<div id="afcHelper_extra"></div>';

	displayMessage(form);
}

function afcHelper_prompt(type) {
	if (type === 'accept') {
		var afcHelper_assessment = [{
			label: 'B-class',
			value: 'B'
		}, {
			label: 'C-class',
			value: 'C'
		}, {
			label: 'Start-class',
			value: 'start'
		}, {
			label: 'Stub-class',
			value: 'stub'
		}, {
			label: 'List-class',
			value: 'list'
		}];
		// checking for ANY submission template (doesn't matter if declined) for the type parameter
		// TODO: use boolean variables and add the disambiguation check to the accept stuff deeper
		if ((afcdab_re.test(pagetext)) || (disambig_re.test(pagetext))) {
			afcHelper_assessment.push(
				{
				label: 'Disambig-class',
				value: 'disambig',
				selected: true
				});
		}else{
			afcHelper_assessment.push(
				{
				label: 'Disambig-class',
				value: 'disambig'
				});
		}
		if ((afctemplate_re.test(pagetext)) || (typetemplate_re.test(pagetext))) {
			afcHelper_assessment.push(
				{
				label: 'Template-class',
				value: 'template',
				selected: true
				});
		}else{
			afcHelper_assessment.push(
				{
				label: 'Template-class',
				value: 'template'
				});
		}
		afcHelper_assessment.push(
			{
				label: 'Redirect-class',
				value: 'redirect'
			}, {
				label: 'Portal-class',
				value: 'portal'
			}, {
				label: 'Project-class',
				value: 'project'
			}, {
				label: 'Template-class',
				value: 'template'
			}, {
				label: 'NA-class',
				value: 'na'
			});
		if ((afctemplate_re.test(pagetext)) || (disambig_re.test(pagetext)) || (afcdab_re.test(pagetext)) || (typetemplate_re.test(pagetext))){
			afcHelper_assessment.push(
			{
				label: 'None',
				value: ''
			});
		}else{
			afcHelper_assessment.push(
			{
				label: 'None',
				selected: true,
				value: ''
			});
		}
		var text = '<h3>Accepting ' + afcHelper_PageName + '</h3>' +
		'<label for="afcHelper_movetarget">Move submission to: </label><input type="text" id="afcHelper_movetarget" value="' + afcHelper_escapeHtmlChars(afcHelper_submissionTitle) + '" />' +
		'<br /><label for="afcHelper_assessment">Assessment (optional): </label>';
		var assessmentSelect = afcHelper_generateSelect("afcHelper_assessment", afcHelper_assessment, null);
		text += assessmentSelect;

		// First load the list of wikiprojects and store it to afcHelper_wikiprojectindex
		$.ajax({
			url: "//en.wikipedia.org/w/index.php?title=User:Theo%27s_Little_Bot/afchwikiproject.js&action=raw&ctype=text/javascript",
			dataType: "json",
			success: function (data) { afcHelper_wikiprojectindex = data; },
			async: false
		});
		// Then generate a dynamic menu for them
		var wikiprojectSelect = afcHelper_generateChzn("afcHelper_wikiproject_selection",'Start typing to filter the list of WikiProjects...',afcHelper_wikiprojectindex);
		text += '<br /><label for="afcHelper_wikiproject_selection">Choose associated WikiProjects to be automatically be added to the talk page: </label><br>' + wikiprojectSelect;
		text += '<br /><label for="afcHelper_pagePrepend">Prepend wikicode to page (optional, e.g. maintenance boxes): </label><br><textarea class="afcHelper_expand" rows="1" cols="60" id="afcHelper_pagePrepend" spellcheck="true"></textarea>' +
		'<br /><label for="afcHelper_pageAppend">Append wikicode to page (optional, e.g. categories or stub templates): </label><br><textarea class="afcHelper_expand" rows="1" cols="60" id="afcHelper_pageAppend" spellcheck="true"></textarea>' +
		'<br /><label for="afcHelper_talkAppend">Append wikicode to talk page (optional, e.g. WikiProject templates): </label><br><textarea class="afcHelper_expand" rows="1" cols="60" id="afcHelper_talkAppend" spellcheck="true"></textarea>' +
		'<br /><label for="afcHelper_reqphoto">Does the article need a photo/image? (will add &#123;&#123;<a href="'+ wgArticlePath.replace("$1", 'Template:Reqphoto') + '" title="Template:Reqphoto" target="_blank">reqphoto</a>&#125;&#125; to talk page) </label><input type="checkbox" id="afcHelper_reqphoto"/>' +
		'<br /><label for="afcHelper_reqinfobox">Does the article need an infobox? (will add &#123;&#123;<a href="'+ wgArticlePath.replace("$1", 'Template:Reqinfobox') + '" title="Template:Reqinfobox" target="_blank">reqinfobox</a>&#125;&#125; to talk page) </label><input type="checkbox" id="afcHelper_reqinfobox"/>' +
		'<br /><label for="afcHelper_biography">Is the article a biography? </label><input type="checkbox" id="afcHelper_biography" onchange=afcHelper_trigger(\'afcHelper_biography_blp\') />' +
		'<div id="afcHelper_biography_blp" style="display:none"><label for="afcHelper_dateofbirth">Month and day of birth (if known/given, e.g. <i>November 2</i>): </label><input type="text" id="afcHelper_dateofbirth" spellcheck="true"/>' +
		'<br /><label for="afcHelper_yearofbirth">Year of birth (if known/given, e.g. <i>1901</i>): </label><input type="text" id="afcHelper_yearofbirth" />' +
		'<br /><label for="afcHelper_listas">Surname, Name (if known/given, for <a href="' + wgArticlePath.replace("$1", 'Wikipedia:Listas') + '" title="Wikipedia:Listas" target="_blank">LISTAS</a> &ndash; e.g. <i>Magellan, Ferdinand</i>): </label><input type="text" id="afcHelper_listas" />' +
		'<br /><label for="afcHelper_shortdescription">A very short description about the person (e.g. <i>sea explorer</i> &ndash; <a href="' + wgArticlePath.replace("$1", 'Wikipedia:Persondata#Short_description') + '" title="Wikipedia:Persondata#Short_description" target="_blank">more details</a>): </label><input type="text" id="afcHelper_shortdescription" spellcheck="true"/>' +
		'<br /><label for="afcHelper_alternativesname">Alternative names (e.g. <i>Magallanes, Fernando de</i>): </label><input type="text" id="afcHelper_alternativesname" />' +
		'<br /><label for="afcHelper_placeofbirth">Place of birth (if known/given): </label><input type="text" id="afcHelper_placeofbirth" spellcheck="true"/>' +
		'<br /><label for="afcHelper_biography_status">Is the article about a living person? </label>' + afcHelper_generateSelect('afcHelper_biography_status', [{
			label: 'Living',
			value: 'live'
		}, {
			label: 'Dead',
			value: 'dead'
		}, {
			label: 'Unknown',
			selected: true,
			value: 'unknown'
		}], "afcHelper_trigger(\'afcHelper_biography_status_box\')") + '<div id="afcHelper_biography_status_box" style="display:none"><label for="afcHelper_placeofdeath">Place of death (if known/given): </label><input type="text" id="afcHelper_placeofdeath" spellcheck="true"/>' +
		'<br /><label for="afcHelper_dateofdeath">Month and day of death (if known/given, e.g. <i>September 3</i>): </label><input type="text" id="afcHelper_dateofdeath" spellcheck="true"/>' +
		'<br /><label for="afcHelper_yearofdeath">Year of death (if known/given): </label><input type="text" id="afcHelper_yearofdeath" />' +
		'</div></div><div id="afcHelper_extra_inline"></div>' +
		'<button class="afcHelper_button" type="button" id="afcHelper_accept_button" onclick="afcHelper_act(\'accept\')">Accept and publish to mainspace</button>';
		$("#afcHelper_extra").html(text);
		// Set up chosen wikiproject menu
		$("#afcHelper_wikiproject_selection").chosen({no_results_text: "Oops, couldn't find any WikiProjects matching your input!"}); 
		// Expand textareas on click so they don't take up space, and then...
		$('textarea.afcHelper_expand').focus(function () {
			$(this).animate({ height: "4em" }, 500);
		});
		// ...shrink them back on blur if they have no content
		$('textarea.afcHelper_expand').blur(function () {
			if (!this.value) $(this).animate({ height: "1em" }, 500);
		});
	} else if (type === 'decline') {
		var text = '<h3>Declining ' + afcHelper_PageName + '</h3>' + '<label for="afcHelper_reason">Reason for ' + type + ': </label>';
		var reasonSelect = afcHelper_generateSelect("afcHelper_reason", afcHelper_reasonhash, "afcHelper_onChange(this)");
		text += reasonSelect;
		text += '<div id="afcHelper_extra_inline"></div>'; 
		text += '<label for="afcHelper_comments">Additional comments (optional, signature is automatically added): </label><textarea rows="3" cols="60" id="afcHelper_comments" spellcheck="true"></textarea>' +
		'<label for="afcHelper_blank">Blank the submission (replace the content with {{<a href="' + wgArticlePath.replace("$1", 'Template:Afc_cleared') + '" title="Template:Afc cleared" target="_blank">afc cleared</a>}}):</label><input type="checkbox" id="afcHelper_blank" onchange=afcHelper_trigger(\'afcHelper_afcccleared\') /><br/>' +
		'<div id="afcHelper_extra_afccleared" style="display:none"><label for="afcHelper_afccleared">Trigger the \'csd\' parameter and nominate the submission for speedy deletion?</label> <input type="checkbox" id="afcHelper_blank_csd"/><br/></div>' +
		'<label for="afcHelper_notify">Notify author:</label><input type="checkbox" onchange=afcHelper_trigger(\'afcHelper_notify_Teahouse\') id="afcHelper_notify" checked="checked" /><br/>' +
		'<div id="afcHelper_notify_Teahouse"><label for="afcHelper_notify_Teahouse">Notify author about <a href="' + wgArticlePath.replace("$1", 'Wikipedia:Teahouse') + '" title="Wikipedia:Teahouse" target="_blank">Wikipedia:Teahouse</a>:</label><input type="checkbox" id="afcHelper_Teahouse" /><br/></div><button type="button" class="afcHelper_button decline" id="afcHelper_prompt_button" onclick="afcHelper_act(\'decline\')">Decline</button>';
		$("#afcHelper_extra").html(text);
	} else if (type === 'submit') {
		// !todo have "first" be pre-selected if submission template includes "t", else have "last" pre-selected
		var text = '<h3>Place a submission template on ' + afcHelper_PageName + '</h3>';
		text += '<input type="radio" name="afcHelper_submit" id="afcHelper_submit1" value="first" /> <label for="afcHelper_submit1">submit with the original submitter</label><br>' +
		'<input type="radio" name="afcHelper_submit" id="afcHelper_submit2" value="last" /> <label for="afcHelper_submit2">submit with the last non-bot editor as the submitter</label><br>' +
		'<input type="radio" name="afcHelper_submit" id="afcHelper_submit3" value="creator" checked /> <label for="afcHelper_submit3">submit with the page creator as the submitter</label><br>' +
		'<input type="radio" name="afcHelper_submit" id="afcHelper_submit4" value="self" checked /> <label for="afcHelper_submit3">submit with yourself as the submitter</label><br>' +
		'<input type="radio" name="afcHelper_submit" id="afcHelper_submit5" value="custom" /> <label for="afcHelper_submit4">submit with a custom submitter:</label> <input type="text" id="afcHelper_custom_submitter" /><br>' +
		'<button class="afcHelper_button" type="button" id="afcHelper_submit_button" onclick="afcHelper_act(\'submit\')">Place a submit template</button>';
		$("#afcHelper_extra").html(text);
	} else if (type === 'draft') {
		var text = '<h3>Place a draft submission template on ' + afcHelper_PageName + '</h3>';
		text += '<input type="radio" name="afcHelper_draft" id="afcHelper_draft1" value="self" checked /> <label for="afcHelper_submit1">tag with yourself as the submitter</label><br>' +
		'<input type="radio" name="afcHelper_draft" id="afcHelper_draft2" value="last" /> <label for="afcHelper_submit2">tag with the last non-bot editor as the submitter</label><br>' +
		'<input type="radio" name="afcHelper_draft" id="afcHelper_draft3" value="creator" checked /> <label for="afcHelper_submit3">tag with the page creator as the submitter</label><br>' +
		'<input type="radio" name="afcHelper_draft" id="afcHelper_draft4" value="custom" /> <label for="afcHelper_submit4">tag with a custom submitter:</label> <input type="text" id="afcHelper_draft_submitter" /><br>' +
		'<button class="afcHelper_button" type="button" id="afcHelper_draft_button" onclick="afcHelper_act(\'draft\')">Place {{AFC draft}} template</button>';
		$("#afcHelper_extra").html(text);
	} else if (type === 'mark') {
		var text = '<h3>Marking submission ' + afcHelper_PageName + ' as under review</h3>' +
		'<label for="afcHelper_comments">Additional comment (signature is automatically added): </label><textarea rows="3" cols="60" id="afcHelper_comments" spellcheck="true"></textarea><br/><button type="button" class="afcHelper_button mark" id="afcHelper_prompt_button" onclick="afcHelper_act(\'mark\')">Place under review</button>';
		$("#afcHelper_extra").html(text);
	} else if (type === 'comment') {
		var text = '<h3>Commenting on ' + afcHelper_PageName + ' </h3>' +
		'<label for="afcHelper_comments">Comment (signature is automatically added): </label><textarea rows="3" cols="60" id="afcHelper_comments" spellcheck="true"></textarea><br/><button type="button" class="afcHelper_button comment" id="afcHelper_prompt_button" onclick="afcHelper_act(\'comment\')">Add comment</button>';
		$("#afcHelper_extra").html(text);
	} else if (type === 'postpone_g13') {
		var text = '<h3>Additional comment when postponing speedy deletion</h3>' +
		'<label for="afcHelper_comments">Comment (signature is automatically added): </label><textarea rows="3" cols="60" id="afcHelper_comments" spellcheck="true"></textarea><br/><button type="button" class="afcHelper_button" id="afcHelper_prompt_button" onclick="afcHelper_act(\'postpone_g13\')">Postpone G13 speedy deletion</button>';
		$("#afcHelper_extra").html(text);
	}
}

function afcHelper_act(action) {
	if (action === 'draft') {
		var typeofsubmit = $("input[name=afcHelper_draft]:checked").val();
		var customuser = $("#afcHelper_draft_submitter").val();
		displayMessage('<ul id="afcHelper_status"></ul><ul id="afcHelper_finish"></ul>');
		afcHelper_displaymessagehelper('done','standard');
		if (typeofsubmit == "last") {
			user = afcHelper_last_nonbot(afcHelper_PageName)['user'];
			var submit = "{{subst:AFC draft|" + user + "}}\n";
		} else if (typeofsubmit == 'self') {
			var submit = "{{subst:AFC draft}}\n";
		} else if (typeofsubmit == 'creator') {
			var submit = "{{subst:AFC draft|"+afcHelper_page_creator(afcHelper_PageName)+"}}\n";
		} else if (typeofsubmit == 'custom' && customuser != null && customuser != "") {
			var submit = "{{subst:AFC draft|" + customuser + "}}\n";
		} else {
			alert("No valid submitter was specified, aborting...");
			return;
		}
		newtext = submit + pagetext;
		newtext = afcHelper_cleanup(newtext);
		afcHelper_editPage(afcHelper_PageName, newtext, "Tagging [[Wikipedia:Articles for creation]] draft", false);
	} else if (action === 'postpone_g13') {
		var comment = $("#afcHelper_comments").val();
		displayMessage('<ul id="afcHelper_status"></ul><ul id="afcHelper_finish"></ul>');
		afcHelper_displaymessagehelper('done','standard');
		pagetext = afcHelper_addcomment(comment) + pagetext;
		postpone_re = /\{\{AfC postpone G13\s*(?:\|\s*(\d*)\s*)?\}\}/ig;
		var match = postpone_re.exec(pagetext);
		if (match) {
			if (match[1] != undefined) {
				addition = "{{AfC postpone G13|"+(parseInt(match[1])+1)+"}}";
			} else {
				addition = "{{AfC postpone G13|2}}";
			}
			newtext = pagetext.replace(match[0],addition);
		} else {
			newtext = pagetext+"\n{{AfC postpone G13|1}}";
		}
		newtext = afcHelper_cleanup(newtext);
		afcHelper_editPage(afcHelper_PageName, newtext, "Postponing [[WP:G13|G13]] speedy deletion", false);
	} else if (action === 'g13') {
		displayMessage('<ul id="afcHelper_status"></ul><ul id="afcHelper_finish"></ul>');
		afcHelper_displaymessagehelper('done','standard');
		timestamp = afcHelper_cache.afcHelper_lastedited;
		newtext = "{{Db-g13|ts=" + timestamp + "}}\n" + pagetext;
		newtext = afcHelper_cleanup(newtext);
		afcHelper_editPage(afcHelper_PageName, newtext, "Tagging abandoned [[Wikipedia:Articles for creation]] draft for speedy deletion under [[WP:G13|G13]]", false);
		// notify users
		var users = new Array();
		var templates = pagetext.match(all_afc_re);
		var author_re = /\|\s*u=\s*[^\|]*\|/i;
		if (templates) {
			for (var i = 0; i < templates.length; i++) {
				if (author_re.test(templates[i])) {
					user = author_re.exec(templates[i])[0];
					username = user.split(/=/)[1];
					username = username.replace(/\|/g, '');
					users.push(username);
				}
			}
		}
		users.push(afcHelper_page_creator(afcHelper_PageName)); // page creator 
		var uniqueUsers = [];
		$.each(users, function(i, l) {
			if ($.inArray(l, uniqueUsers) === -1) uniqueUsers.push(l);
		});
		for (var i = 0; i < uniqueUsers.length; i++) {
			username = uniqueUsers[i];
			usertalkpage = "User talk:" + username;
			var usertext = afcHelper_getPageText(usertalkpage, true, true);
			usertext += "\n{{subst:Db-afc-notice|" + afcHelper_PageName + "}} ~~~~";
			afcHelper_editPage(usertalkpage, usertext, 'Notification: [[WP:G13|G13]] speedy deletion nomination of [[' + afcHelper_PageName + ']]', false);
		}
		afcHelper_logcsd(afcHelper_PageName,"[[CSD:G13]] ({{tl|db-afc}})",uniqueUsers);
	} else if (action === 'submit') {
		var typeofsubmit = $("input[name=afcHelper_submit]:checked").val();
		var customuser = $("#afcHelper_custom_submitter").val();
		displayMessage('<ul id="afcHelper_status"></ul><ul id="afcHelper_finish"></ul>');
		afcHelper_displaymessagehelper('done','standard');

		// First we handle "last", since this uses a different method than the others
		if (typeofsubmit == 'last') {
			// Get the last non-bot editor to the page
			var submitinfo = afcHelper_last_nonbot(afcHelper_PageName);
			if (submitinfo) {
				dt = new Date(submitinfo['timestamp']);
				// output the date in the correct format
				date = dt.getUTCFullYear() + ('0' + (dt.getUTCMonth() + 1)).slice(-2) + ('0' + dt.getUTCDate()).slice(-2) + ('0' + dt.getUTCHours()).slice(-2) + ('0' + dt.getUTCMinutes()).slice(-2) + ('0' + dt.getUTCSeconds()).slice(-2);
				var submit = "{{AFC submission|||ts=" + date + "|u=" + submitinfo['user'] + "|ns=" + wgNamespaceNumber + "}}\n";
				newtext = submit + pagetext;
				newtext = afcHelper_cleanup(newtext);
				afcHelper_editPage(afcHelper_PageName, newtext, "Submitting [[Wikipedia:Articles for creation]] submission", false);
			} else {
				alert("Unable to find a non-bot editor; please check the page history.");
			}
		} else {
			if (typeofsubmit == 'first') {
				if (afc_re.test(pagetext)) {
					var afctemplate = afc_re.exec(pagetext)[0];
					var author_re = /\|\s*u=\s*[^\|]*\|/i;
					if (author_re.test(afctemplate)) {
						var user = author_re.exec(afctemplate)[0];
						username = user.split(/=/)[1];
						submitter = username.replace(/\|/g, '');
					} else {
						alert("Could not find the original submitter, aborting...");
						return;
					}
				} else {
					alert("Could not find an AfC submission template, aborting...");
					return;
				}
				var submit = "{{subst:submit|user=" + submitter + "}}\n";
			} else if (typeofsubmit == 'self') {
				var submit = "{{subst:submit}}\n";
			} else if (typeofsubmit == 'custom' && customuser != null && customuser != "") {
				var submit = "{{subst:submit|user=" + customuser + "}}\n";
			} else if (typeofsubmit == 'creator') {
				var submit = "{{subst:submit|user="+afcHelper_page_creator(afcHelper_PageName)+"}}\n";
			} else {
				alert("No valid submitter was specified, aborting...");
				return;
			}
			newtext = submit + pagetext;
			newtext = afcHelper_cleanup(newtext);
			afcHelper_editPage(afcHelper_PageName, newtext, "Submitting [[Wikipedia:Articles for creation]] submission", false);
		}
	} else if (action === 'accept') {
		afcHelper_underreview();
		var newtitle = $("#afcHelper_movetarget").val();
		var assessment = $("#afcHelper_assessment").val();
		var pagePrepend = $("#afcHelper_pagePrepend").val();
		var pageAppend = $("#afcHelper_pageAppend").val();
		var talkAppend = $("#afcHelper_talkAppend").val();
		var biography = $("#afcHelper_biography").attr("checked");
		var reqinfobox = $("#afcHelper_reqinfobox").attr("checked");
		var reqphoto = $("#afcHelper_reqphoto").attr("checked");

		var selectedwikiprojects = new Array();
		$("#afcHelper_wikiproject_selection option:selected").each(function() {
			selectedwikiprojects.push($(this).val());
		});

		if (biography) {
			var living = $("#afcHelper_biography_status").val(); //dropdown menu
			var yearofbirth = $("#afcHelper_yearofbirth").val();
			var dateofbirth = $("#afcHelper_dateofbirth").val();
			var listas = $("#afcHelper_listas").val();
			var shortdescription = $("#afcHelper_shortdescription").val();
			var alternativesname = $("#afcHelper_alternativesname").val();
			var placeofbirth = $("#afcHelper_placeofbirth").val();
			var placeofdeath = '';
			var yearofdeath = '';
			var dateofdeath = '';
			if (living === 'dead') {
				yearofdeath = $("#afcHelper_yearofdeath").val();
				dateofdeath = $("#afcHelper_dateofdeath").val();
				placeofdeath = $("#afcHelper_placeofdeath").val();
			}
		}
		displayMessage('<ul id="afcHelper_status"></ul><ul id="afcHelper_finish"></ul>');
		afcHelper_displaymessagehelper('done','standard');
		var callback = function() {
			var username = '';
			// clean up page
			if (afc_re.test(pagetext)) {
				var afctemplate = afc_re.exec(pagetext)[0];
				var author_re = /\|\s*u=\s*[^\|]*\|/i;
				if (author_re.test(afctemplate)) {
					var user = author_re.exec(afctemplate)[0];
					username = user.split(/=/)[1];
					username = username.replace(/\|/g, '');
					usertalkpage = "User talk:" + username;
					var usertext = afcHelper_getPageText(usertalkpage, true, true);
					usertext += "\n== Your submission at AfC \[\[" + wgPageName + "|" + newtitle + "\]\] was accepted ==";
					usertext += "\n\{\{subst:afc talk|1=" + newtitle + "|class=" + assessment + "|sig=yes\}\}";
					afcHelper_editPage(usertalkpage, usertext, 'Your submission at \[\[WP:AFC|Articles for creation\]\]', false);
				}
			}
			var recenttext = afcHelper_getPageText("Wikipedia:Articles for creation/recent", true, false);
			var newentry = "\{\{afc contrib|" + assessment + "|" + newtitle + "|" + username + "\}\}\n";
			var lastentry = recenttext.toLowerCase().lastIndexOf("\{\{afc contrib");
			var firstentry = recenttext.toLowerCase().indexOf("\{\{afc contrib");
			if (afcHelper_countString(recenttext,'\{\{afc contrib') >= 10){
				// Only remove the old entry if there are 10+ entries in the list
				recenttext = recenttext.substring(0, lastentry);
			}
			recenttext = recenttext.substring(0, firstentry) + newentry + recenttext.substring(firstentry);
			afcHelper_editPage("Wikipedia:Articles for creation/recent", recenttext, 'Updating recent AFC creations', false);

			var talktext = "";
			if (biography) {
				talktext += "\{\{WikiProject Biography|living=";
				if (living === 'live') talktext += "yes";
				else if (living === 'dead') talktext += "no";
				talktext += "|class=" + assessment + "|listas=" + listas;
				if (reqphoto) talktext += "|needs-photo=yes";
				if (reqinfobox) talktext += "|needs-infobox=yes";
				talktext += "\}\}\n";
			}

			talktext += "\{\{subst:WPAFC/article|class=" + assessment + "\}\}\n";

			// For each selected WikiProject, append it to the talk page
			for (var i = 0; i < selectedwikiprojects.length; i++) {
				var project = selectedwikiprojects[i];
				talktext += "{{"+project+"|class="+assessment+"}}\n";
			};

			if (talkAppend) talktext += talkAppend + "\n"; 
			if (assessment === 'disambig') {
				talktext += '\{\{WikiProject Disambiguation\}\}\n';
			}
			if (reqinfobox && !biography) talktext += "\{\{Infobox requested\}\}\n";
			if (reqphoto && !biography) talktext += "\{\{Image requested\}\}\n";

			var newtalktitle = newtitle.replace(/(Template|Category|Wikipedia|Portal):/,"$1 talk:");
			if (newtalktitle == newtitle) newtalktitle = 'Talk:' + newtitle;

			afcHelper_editPage(newtalktitle, talktext, 'Placing [[Wikipedia:Articles for creation]] project banner', false);

			// clean up the page
			pagetext = afcHelper_cleanup(pagetext,'accept');

			// [[Template:L]]
			var templatel = '\n';
			if (biography) {
				templatel = '\n\{\{Persondata\n| NAME              =' + listas + '\n| ALTERNATIVE NAMES = ' + alternativesname + '\n| SHORT DESCRIPTION = ' + shortdescription + '\n| DATE OF BIRTH     = ' + dateofbirth + ', ' + yearofbirth + '\n| PLACE OF BIRTH    = ' + placeofbirth;
				if (living === 'dead') {
					templatel += '\n| DATE OF DEATH     = ' + dateofdeath + ', ' + yearofdeath + '\n| PLACE OF DEATH    = ' + placeofdeath + '\n\}\}';
				} else {
					templatel += '\n| DATE OF DEATH     = ' + '\n| PLACE OF DEATH    = \n\}\}';
				}
				templatel += '\n\{\{subst:L|';
				if (yearofbirth === '') templatel += 'MISSING|';
				else templatel += yearofbirth + '|';
				if (living === 'dead') {
					if (yearofdeath === '') templatel += 'MISSING|';
					else templatel += yearofdeath + '|';
				} else {
					templatel += 'LIVING|';
				}
				templatel += '|' + listas + '\}\}\n';
			}
			pagetext = pagePrepend + '\n' + pagetext + templatel + pageAppend;
			// test if the submission contains any category and if not, add {{uncategorized}}
			cat_re = /\[\[Category/gi;
			if (!cat_re.test(pagetext) && (assessment !== 'disambig') && (assessment !== 'redirect') && (assessment !== 'project') && (assessment !== 'portal') && (assessment !== 'template')) {
				if (biography) {
					pagetext += '\{\{subst:dated|Improve categories\}\}';
				} else {
					pagetext += '\{\{subst:dated|uncategorized\}\}';
				}
			}
			var stub_re = /stub\}\}/gi;
			if ((assessment === 'stub') && (!stub_re.test(pagetext))) {
				if (biography) {
					pagetext += '\n\{\{bio-stub\}\}';
				} else {
					pagetext += '\n\{\{stub\}\}';
				}
			}
			// disambig check
			if ((assessment === 'disambig') && (!disambig_re.test(pagetext))) {
				pagetext += '\n\{\{disambig\}\}';
			}

			// automatic tagging of linkrot
			// TODO: Use non-regex for html
			var linkrotre = /((<\s*ref\s*(name\s*=|group\s*=)*\s*.*[\/]{1}>)|(<\s*ref\s*(name\s*=|group\s*=)*\s*[^\/]*>))+(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#/%=~_|$?!:,.]*\)|[A-Z0-9+&@#/%=~_|$])+(\<\/ref\>)+/gi;
			if(linkrotre.test(pagetext)){	
				pagetext = "{{subst:dated|Cleanup-bare URLs}}" + pagetext;
			}
			//check if page is orphaned (mainspace) and tag it!
			if ((assessment !== 'disambig') && (assessment !== 'redirect') && (assessment !== 'project') && (assessment !== 'portal') && (assessment !== 'template')) {
				afcHelper_displaymessagehelper('status','orphan');
				var request = {
					'action': 'query',
					'list': 'backlinks',
					'format': 'json',
					'blnamespace': 0,
					'bllimit': 10,
					'bltitle' : newtitle
				};
				var response = JSON.parse(
					$.ajax({
						url: mw.util.wikiScript('api'),
						data: request,
						async: false
					})
					.responseText
				);
				var isorphaned = response['query']['backlinks'].length;
				if (isorphaned) {
					$("#afcHelper_orphan").html("Orphan check: all ok. No tagging needed.");
				} else {
					pagetext = '\{\{subst:dated|Orphan\}\}' + pagetext;
					$("#afcHelper_orphan").html("Page is orphaned, adding tag.");
				}
			}
			afcHelper_editPage(newtitle, pagetext, "Cleanup following [[Wikipedia:Articles for creation]] creation", false);
		};
		afcHelper_movePage(afcHelper_PageName, newtitle, 'Created via \[\[WP:AFC|Articles for creation\]\] (\[\[WP:WPAFC|you can help!\]\])', callback, true);
	} else if (action === 'decline') {
		afcHelper_underreview();
		var code = $("#afcHelper_reason").val();
		for (i = 0; i < (afcHelper_reasonhash.length + 1); i++) {
			if ((typeof(afcHelper_reasonhash[i]) !== 'undefined') && (afcHelper_reasonhash[i].value === code)) var reasontext = afcHelper_reasonhash[i].reason;
		}
		var customreason = $("#afcHelper_comments").val();
		var append = false;
		var keep = false;
		var blank = $("#afcHelper_blank").attr("checked");
		var blank_csd = $("#afcHelper_blank_csd").attr("checked");
		var notify = $("#afcHelper_notify").attr("checked");
		var teahouse = $("#afcHelper_Teahouse").attr("checked");
		var extra = '';
		if (code === 'cv' || code === 'dup' || code === 'mergeto' || code === 'exists' || code === 'lang' || code === 'plot') {
			extra = $("#afcHelper_extra_inlinebox").val();
		}
		if (extra === null) {
			return;
		}

		displayMessage('<ul id="afcHelper_status"></ul><ul id="afcHelper_finish"></ul>');
		afcHelper_displaymessagehelper('done','standard');
		// Find the first pending submission or marked as review on the page.
		if (!pending_afc_re.test(pagetext)) {
			alert("Unable to locate a pending AFC submission template, aborting...");
			return;
		}
		
		if (code === 'reason' && customreason === '') {
			alert("You must enter a reason!");
			return;
		}
		var afctemplate = pending_afc_re.exec(pagetext)[0];
		var startindex = pagetext.indexOf(afctemplate);
		var endindex = startindex + afctemplate.length;
		//data is always between the first pipe and the one before the timestamp.
		var firstpipe = afctemplate.indexOf('|');
		var endpipe = afctemplate.indexOf('|ts');
		var newtemplate = afctemplate.substring(0, firstpipe);
		var summary = '';
		var newcomment = '';
		// overwrite any reason that was there.
		newtemplate += '|d|' + (code || 'reason');
		if (code === 'reason' || code === null) {
			newtemplate += '|3=' + customreason;
		} else if (extra !== '') {
			newtemplate += '|3=' + extra;
		}
		newtemplate += '|declinets=\{\{subst:CURRENTTIMESTAMP\}\}|decliner=\{\{subst:REVISIONUSER\}\}' + afctemplate.substring(endpipe);

		if (code !== null && code !== 'reason' && customreason !== '') {
			newcomment = afcHelper_addcomment(customreason);
		}

		summary = "Declining submission";
		if (code === 'reason' || code === null) {
			summarycustom = customreason.match(/[^\s]+/g).slice(0,5).join(" "); // Get the first five words of the custom decline rationale
			if (summarycustom != customreason) summarycustom += "..."; // Add an ellipsis if the rationale if >5 words
			summary += ': ' + summarycustom;
		} else {
			summary += ': ' + reasontext;
		}

		// Stores the author of the submission to afcHelper_authorusername
		var author_re = /\|\s*u\s*=\s*(.*?)\|/i;
		if (author_re.test(afctemplate)) {
			var username = author_re.exec(afctemplate)[1];
			if (username !== 'Example') {
				afcHelper_authorusername = username;
			} else {
				afcHelper_authorusername = afcHelper_page_creator(afcHelper_PageName);
			}
		} else {
			afcHelper_authorusername = afcHelper_page_creator(afcHelper_PageName);
		}

		if (notify) {
			usertalkpage = "User talk:" + afcHelper_authorusername;
			var usertext = afcHelper_getPageText(usertalkpage, true, true);
			var reason = 'Your submission at \[\[Wikipedia:Articles for creation|Articles for creation\]\]';
			usertext += "\n== Your submission at \[\[Wikipedia:Articles for creation|Articles for creation\]\]: \[\[" + afcHelper_PageName + "|" + afcHelper_PageName.replace(/(Wikipedia( talk)*:Articles for creation\/)+/i, '') + "\]\] ({{subst:CURRENTMONTHNAME}} {{subst:CURRENTDAY}}) ==";
			usertext += "\n\{\{subst:afc decline|1=" + afcHelper_submissionTitle.replace(" ", "{{subst:Sp}}");
			if (code === 'cv') usertext += "|cv=yes";
			usertext += "|sig=yes\}\}";

			if (teahouse) {
				document.getElementById('afcHelper_status').innerHTML += '<div id="afcHelper_get_teahouse"></div>';
				$("#afcHelper_get_teahouse").html('<li id="afcHelper_get_teahouse">Checking for existing Teahouse Invitation for <a href="' + wgArticlePath.replace("$1", encodeURI('User_talk:' + username)) + '" title="User talk:' + username + '">User talk:' + username + '</a></li>');
				var request = {
					'action': 'query',
					'prop': 'categories',
					'format': 'json',
					'indexpageids': true,
					'redirects': true,
					'titles' : usertalkpage
				};
				var response = JSON.parse(
					$.ajax({
						url: mw.util.wikiScript('api'),
						data: request,
						async: false
					})
					.responseText
				);
				var pageid = response['query']['pageids'][0];
				var foundTH = 0;
				if (pageid !== "-1") {
					if (response['query']['redirects']) { /* If there is no redirect, this stops here from getting an error */
						var oldusername = response['query']['redirects'][0]['from'];
						var newusername = response['query']['redirects'][0]['to'];
						if ((typeof(oldusername) !== 'undefined') && (typeof(newusername) !== 'undefined') && (oldusername != newusername)) {
							document.getElementById('afcHelper_get_teahouse').innerHTML += '<li id="afcHelper_get_teahouse2">User talk page is redirect to <a href="' + wgArticlePath.replace("$1", encodeURI('User_talk:' + newusername)) + '" title="User talk:' + newusername + '">User talk:' + newusername + '</a> - checking there for TeaHouse invitations.</li>';
							params = "action=query&prop=categories&format=json&indexpageids=1&titles=User_talk:" + encodeURIComponent(newusername);
							req.send(params);
							response = eval('(' + req.responseText + ')');
							pageid = response['query']['pageids'][0];
						}
					}
					if (pageid !== "-1") {
						var pagecats = new Array();
						pagecats = response['query']['pages'][pageid]['categories'];
					}
					if ((typeof pagecats !== 'undefined') && (pageid !== "-1")) {
						for (var i = 0; i < pagecats.length; i++) {
							if ((pagecats[i].title === ("Category:Wikipedians who have received a Teahouse invitation")) || (pagecats[i].title === ("Category:Wikipedians who have received a Teahouse invitation through AfC"))) {
								foundTH = 1;
								break;
							}
						}
					}
				}
				if (foundTH === 0) {
					$("#afcHelper_get_teahouse").html('<li id="afcHelper_get_teahouse">Sent <a href="' + wgArticlePath.replace("$1", encodeURI('User talk:' + username)) + '" title="User talk:' + username + '">User talk:' + username + '</a> an invitation.</li>');
					usertext += "\n\n\n\{\{subst:Wikipedia:Teahouse/AFC_invitation\}\}";
					reason += '; adding invitation to the \[\[Wikipedia:Teahouse|Teahouse\]\]!';
				} else {
					$("#afcHelper_get_teahouse").html('<a href="' + wgArticlePath.replace("$1", encodeURI('User talk:' + username)) + '" title="User talk:' + username + '">' + username + '</a> already has an invitation.');
				}
			} //end TH stuff
			afcHelper_editPage(usertalkpage, usertext, reason, false);
		}
		if (!blank) {
			pagetext = newtemplate + newcomment + pagetext;
		} else {
			if (blank_csd) {
				if (code === 'cv') {
					// If article is a copyvio add db-g12 to the top
					if (extra != "http://" || extra != "") {
						pagetext = "\{\{Db-g12|url=" + extra + "\}\}\n" + newtemplate + '\n' + newcomment + '\n\{\{afc cleared\}\}';
					} else {
						pagetext = "\{\{Db-g12\}\}\n" + newtemplate + '\n' + newcomment + '\n\{\{afc cleared\}\}';
					}
					// And for good measure log the CSD nomination
					afcHelper_logcsd(afcHelper_PageName,"[[CSD:G12]] ({{tl|db-copyvio}})",[afcHelper_authorusername]);
				} else {
					pagetext = newtemplate + '\n' + newcomment + '\n\{\{afc cleared|csd\}\}';
					afcHelper_logcsd(afcHelper_PageName,"{{tl|db-reason}} ([[WP:AFC|Articles for creation]])",[afcHelper_authorusername]);
				}
			} else {
				// If we just need to blank the submission, *just blank it*
				pagetext = newtemplate + '\n' + newcomment + '\n\{\{afc cleared\}\}';
			}
		}
		pagetext = afcHelper_cleanup(pagetext);
		afcHelper_editPage(afcHelper_PageName, pagetext, summary, false);
	} else if (action === 'comment') {
		var comment = $("#afcHelper_comments").val();
		displayMessage('<ul id="afcHelper_status"></ul><ul id="afcHelper_finish"></ul>');
		afcHelper_displaymessagehelper('done','standard');

		if (comment !== '') {
			pagetext = afcHelper_addcomment(comment) + pagetext;
		} else {
			alert("No comment was entered, aborting...");
			return;
		}
		pagetext = afcHelper_cleanup(pagetext);
		afcHelper_editPage(afcHelper_PageName, pagetext, "Commenting on [[Wikipedia:Articles for creation]] submission", false);
	} else if (action === 'mark') {
		afcHelper_underreview();
		var comment = $("#afcHelper_comments").val();
		if (comment == undefined) comment = window.overwrite_comment; // This handles the overwrite_redirect scenario
		displayMessage('<ul id="afcHelper_status"></ul><ul id="afcHelper_finish"></ul>');
		afcHelper_displaymessagehelper('done','standard');

		if (!exclusive_pending_afc_re.test(pagetext)) {
			alert("Unable to locate AFC submission template, aborting...");
			return;
		}
		pagetext = pagetext.replace(exclusive_pending_afc_re, "$1r\|$3");
		pagetext = afcHelper_addcomment(comment) + pagetext;
		pagetext = afcHelper_cleanup(pagetext);
		afcHelper_editPage(afcHelper_PageName, pagetext, "Marking [[Wikipedia:Articles for creation]] submission as being reviewed", false);
	} else if (action === 'unmark') {
		afcHelper_underreview();
		displayMessage('<ul id="afcHelper_status"></ul><ul id="afcHelper_finish"></ul>');
		afcHelper_displaymessagehelper('done','standard');
		if (!reviewing_afc_re.test(pagetext)) {
			alert("Unable to locate AFC submission template or page is not marked as being reviewed, aborting...");
			return;
		}
		pagetext = pagetext.replace(/\{\{\s*afc submission\s*\|\s*r\s*\|\s*/gi, "{{AFC submission||");
		pagetext = afcHelper_cleanup(pagetext);
		afcHelper_editPage(afcHelper_PageName, pagetext, "Unmarking [[Wikipedia:Articles for creation]] submission as being reviewed", false);
	} else if (action === 'cleanup') {
		displayMessage('<ul id="afcHelper_status"></ul><ul id="afcHelper_finish"></ul>');
		pagetext = afcHelper_cleanup(pagetext);
		var text = afcHelper_getPageText(afcHelper_PageName, true, false);
		if (text === pagetext) {
			afcHelper_displaymessagehelper('done','cleanednochange');
		} else {
			afcHelper_editPage(afcHelper_PageName, pagetext, "Cleaning [[Wikipedia:Articles for creation]] submission", false);
			afcHelper_displaymessagehelper('done','standard');
		}
	}

	// Display the "Done" text only after all ajax requests are completed
	$(document).ajaxStop(function () {
		$("#afcHelper_finished_main").css("display", "");
	});
}

function afcHelper_movePage(oldtitle, newtitle, summary, callback, overwrite_redirect) {
	var token = mw.user.tokens.get('editToken');
	$("#afcHelper_finished_wrapper").html('<span id="afcHelper_AJAX_finished_' + afcHelper_AJAXnumber + '" style="display:none">' + $("#afcHelper_finished_wrapper").html() + '</span>');
	var func_id = afcHelper_AJAXnumber;
	afcHelper_AJAXnumber++;
	document.getElementById('afcHelper_status').innerHTML += '<li id="afcHelper_move' + escape(oldtitle) + '">Moving <a href="' + wgArticlePath.replace("$1", encodeURI(oldtitle)) + '" title="' + oldtitle + '">' + oldtitle + '</a> to <a href="' + wgArticlePath.replace("$1", encodeURI(newtitle)) + '" title="' + newtitle + '">' + newtitle + '</a></li>';
	var request = {
				'action': 'move',
				'from': oldtitle,
				'to': newtitle,
				'reason': summary + afcHelper_advert,
				'format': 'json',
				'token': token
			};
	var response = JSON.parse(
		$.ajax({
			type: "POST",
			url: mw.util.wikiScript('api'),
			data: request,
			async: false
		})
		.responseText
	);
	error = true;
	try {
		if (typeof(response['move']) !== "undefined") {
			document.getElementById('afcHelper_move' + escape(oldtitle)).innerHTML = 'Moved <a href="' + wgArticlePath.replace("$1", encodeURI(oldtitle)) + '" title="' + oldtitle + '">' + oldtitle + '</a>';
			error = false;
		} else {
			if (overwrite_redirect) {
				if (response['error']['code'] == "articleexists") {
					text = afcHelper_getPageText(newtitle);
					if (text.search(/#redirect\s*\[\[/gi) != -1) { // Should probably use &redirects= to check if it's a redirect, rather than this hack...but this seemed simpler and more concise, rather than yet another API call
						if ($.inArray('sysop', mw.config.get('wgUserGroups')) !== -1) {
							del = confirm("The target title, " + newtitle + ", is a redirect. Would you like to automatically delete it under {{db-move}} and then accept and move the submission?");
							if (del) {
								document.getElementById('afcHelper_move' + escape(oldtitle)).innerHTML = '<div id="afcHelper_delete' + escape(oldtitle)+'"></div>'; // to allow for messages from the editor
								deleted = afcHelper_deletePage(newtitle, "[[CSD:G6]]: redirect in the way of move of accepted [[Wikipedia:Articles for creation]] submission");
								if (deleted) {
									afcHelper_movePage(oldtitle, newtitle, summary, callback, overwrite_redirect); // Then just move the page again as if nothing happened
									return; // So we don't run callback() twice
								} else {
									document.getElementById('afcHelper_move' + escape(oldtitle)).innerHTML = '<div style="color:red"><b>Unable to automatically delete <a href="' + wgArticlePath.replace("$1", encodeURI(oldtitle)) + '" title="' + oldtitle + '">' + oldtitle + '</a></b></div>';
								}
							} else {
								document.getElementById('afcHelper_move' + escape(oldtitle)).innerHTML = '<div style="color:red"><b>Move failed on <a href="' + wgArticlePath.replace("$1", encodeURI(oldtitle)) + '" title="' + oldtitle + '">' + oldtitle + '</a></b></div>. Error info: User canceled automatically deleting the blocking redirect';
							}
						} else {
							del = confirm("The target title, "+newtitle+", is a redirect. Would you like to automatically tag it for deletion under {{db-move}} to make way for the approved submission?");
							if (del) {
								rat = "{{db-move|1="+oldtitle+"|2=redirect preventing move of accepted [[WP:AFC|article submission]].}}\n";
								afcHelper_editPage(newtitle, rat+text, "Tagging redirect in the way of [[Wikipedia:Articles for creation]] submission for deletion under {{[[Template:Db-move|db-move]]}}");
								window.overwrite_comment = 'This article submission has been approved, but a [[WP:REDIRECT|redirect]] is blocking it from being moved into the article space. An administrator should delete the redirect and move the article within the next few days. Thanks for your patience!';
								document.getElementById('afcHelper_move' + escape(oldtitle)).innerHTML = '<div id="afcHelper_edit' + escape(oldtitle)+'"></div>'; // to allow for messages from the editor
								afcHelper_act('mark'); // We mark the submission as "under review"
								document.getElementById('afcHelper_move' + escape(oldtitle)).innerHTML += '<div><b>Successfully tagged redirect page <a href="' + wgArticlePath.replace("$1", encodeURI(newtitle)) + '" title="' + newtitle + '">' + newtitle + '</a> for deletion</b> under {{db-move}}. The article should be moved by the administrator who deletes the redirect.</div>';
							} else {
								document.getElementById('afcHelper_move' + escape(oldtitle)).innerHTML = '<div style="color:red"><b>Move failed on <a href="' + wgArticlePath.replace("$1", encodeURI(oldtitle)) + '" title="' + oldtitle + '">' + oldtitle + '</a></b></div>. Error info: User canceled automatically tagging the target for deletion';
							}
						}
					} else {
						document.getElementById('afcHelper_move' + escape(oldtitle)).innerHTML = '<div style="color:red"><b>Move failed on <a href="' + wgArticlePath.replace("$1", encodeURI(oldtitle)) + '" title="' + oldtitle + '">' + oldtitle + '</a></b></div> Error info: <b>' + response['error']['code'] + '</b>: ' + response['error']['info'];
					}
				}
			} else {
				document.getElementById('afcHelper_move' + escape(oldtitle)).innerHTML = '<div style="color:red"><b>Move failed on <a href="' + wgArticlePath.replace("$1", encodeURI(oldtitle)) + '" title="' + oldtitle + '">' + oldtitle + '</a></b></div>. Error info:' + response['error']['code'] + ' : ' + response['error']['info'];
			}
		}
	} catch (err) {
		document.getElementById('afcHelper_move' + escape(oldtitle)).innerHTML = '<div style="color:red"><b>Move failed on <a href="' + wgArticlePath.replace("$1", encodeURI(oldtitle)) + '" title="' + oldtitle + '">' + oldtitle + '</a></b></div>';
	}
	if (!error) {
		if (callback !== null) callback();
	}
	$("#afcHelper_AJAX_finished_" + func_id).css("display", '');
}

function afcHelper_onChange(select) {
	var value = select.options[select.selectedIndex].value;
	if (value === 'cv') $("#afcHelper_extra_inline").html('<label for="afcHelper_extra">Please enter the URL if available: </label><input type="text" id="afcHelper_extra_inlinebox" value="http://" size="100%"/>');
	else if (value === 'dup') $("#afcHelper_extra_inline").html('<label for="afcHelper_extra_inline">Please enter the title of the duplicate submission (do not include namespace): </label><input type="text" id="afcHelper_extra_inlinebox" value="" />');
	else if (value === 'mergeto') $("#afcHelper_extra_inline").html('<label for="afcHelper_extra_inline">Please enter the title of the article to merge to, if possible: </label><input type="text" id="afcHelper_extra_inlinebox" value="" />');
	else if (value === 'lang') $("#afcHelper_extra_inline").html('<label for="afcHelper_extra_inline">Please enter the language the article is written in, if possible/known (e.g. German): </label><input type="text" id="afcHelper_extra_inlinebox" value="" spellcheck="true"/>');
	else if (value === 'exists') $("#afcHelper_extra_inline").html('<label for="afcHelper_extra_inline">Please enter the title of the existing article, if possible: </label><input type="text" id="afcHelper_extra_inlinebox" value="" />');
	else if (value === 'plot') $("#afcHelper_extra_inline").html('<label for="afcHelper_extra_inline">Please enter the title of the existing article on the fiction, if there is one: </label><input type="text" id="afcHelper_extra_inlinebox" value="" />');
	else $("#afcHelper_extra_inline").html("");

	if (value === 'cv' || value === 'van') {
		// If it is a copyvio or vandalism, display the blank and csd options
		$("#afcHelper_blank").attr("checked", "checked");
		$("#afcHelper_blank").attr("data-typeof", "cv_van");
		afcHelper_turnvisible("afcHelper_extra_afccleared", true);
		afcHelper_turnvisible("afcHelper_afccleared", true);
		$("#afcHelper_blank_csd").attr("checked","checked"); // check the checkbox automagically
	} else if (value === 'blp') {
		// If it is just a BLP violation only display the blank option; do NOT csd
		$("#afcHelper_blank").attr("checked", "checked");
		$("#afcHelper_blank").attr("data-typeof", "blp");
		afcHelper_turnvisible("afcHelper_afccleared", true);
		afcHelper_turnvisible("afcHelper_extra_afccleared", false);
		$("#afcHelper_blank_csd").attr("checked",false); // so (!blank_csd) works correctly
	} else {
		// Otherwise leave these empty
		$("#afcHelper_blank").attr("checked", false);
		$("#afcHelper_blank").attr("data-typeof", "other");
		afcHelper_turnvisible("afcHelper_extra_afccleared", false);
		afcHelper_turnvisible("afcHelper_afccleared", false);
		$("#afcHelper_blank_csd").attr("checked",false); // so (!blank_csd) works correctly
	}
}

function afcHelper_cleanup(text,type) {
	// type can be either `initial`, `accept`, or `default`
	// it determines which fixes are run
	if (!type) type = 'default';

	// Remove html comments (<!--) that surround categories
	text = text.replace(/\<!--\s*((\[\[:{0,1}(Category:.*?)\]\]\s*)+)--\>/gi, "$1");

	// Fix {{afc comment}} when possible (takes rest of text on line and converts to a template parameter)
	text = text.replace(/\{\{afc comment(?!\s*\|\s*1\s*=)\s*\}\}\s*(.*?)\s*[\r\n]/ig, "\{\{afc comment\|1=$1\}\}\n");

	// Convert external links to Wikipedia articles to proper wikilinks 
	var wikilink_re = /(\[){1,2}(?:https?:)?\/\/(en.wikipedia.org\/wiki|enwp.org)\/([^\s\|\]\[]+)(\s|\|)?((?:\[\[[^\[\]]*\]\]|[^\]\[])*)(\]){1,2}/gi;
	var temptext = text;
	var match;
	while (match = wikilink_re.exec(temptext)) {
		var pagename = match[3].replace(/_/g,' ');
		var displayname = match[5].replace(/_/g,' ');
		if (pagename === displayname) displayname = '';
		var replacetext = '[[' + pagename + ((displayname) ? '|' + displayname : '') + ']]';
		text = text.replace(match[0],replacetext);
	}

	//KISS: for the case at the end of the url is a <ref> it detects all < symbols and stops there
	text = text.replace(/https?:\/\/(en.wikipedia.org\/wiki|enwp.org)\/([^\s\<]+)/gi, "\[\[$2\]\]");
	//remove boldings and big-tags from headlines; ignore level 1 headlines for not breaking URLs and other stuff!
	text = text.replace(/[\s\n]*(={2,})\s*(?:\s*<big>|\s*''')*\s*(.*?)\s*(?:\s*<\/big>|\s*''')*\s*?(={2,})[\n\s]*/gi, "\n\n$1 $2 $1\n\n");

	if (type === 'accept') {
		// Remove {{AFC...}} templates
		text = text.replace(/\{\{\s*afc\s*submission\s*\|(?:\{\{[^\{\}]*\}\}|[^\}\{])*\}\}/gim, "");
		text = text.replace(/\{\{\s*afc\s*comment\s*\|(?:\{\{[^\{\}]*\}\}|[^\}\{])*\}\}/gim, "");
		// Uncomment cats
		text = text.replace(/\[\[:Category/gi, "\[\[Category");
		text = text.replace(/\{\{:?DEFAULTSORT:/gi, "\{\{DEFAULTSORT:"); //fixes upper and lowercase problems!
		// Remove Doncram's category on accept per issue #39
		text = text.replace(/\[\[:?Category:Submissions by Doncram ready for review\]\]/gi, "");
		// Template uncommenting -- covert {{tl}}'d templates to the real thing
		text = text.replace(/\{\{(tl|tlx|tlg)\|(.*?)\}\}/ig, "\{\{$2\}\}");
	} else {
		// If we're not accepting, comment out categories
		text = text.replace(/\[\[Category:/gi, "\[\[:Category:");
	}

	if (type !== 'initial') {
		/* Don't run external cleanup scripts on initial load to speed up opening */
		// Run AutoEd automatically
		var AutoEd_baseurl = '//en.wikipedia.org/w/index.php?action=raw&ctype=text/javascript&title=Wikipedia:AutoEd/';
		importScriptURI(AutoEd_baseurl + 'unicodify.js', function() {
			text = autoEdUnicodify(text);
		});
		importScriptURI(AutoEd_baseurl + 'isbn.js', function() {
			text = autoEdISBN(text);
		});
		importScriptURI(AutoEd_baseurl + 'whitespace.js', function() {
			text = autoEdWhitespace(text);
		});
		importScriptURI(AutoEd_baseurl + 'wikilinks.js', function() {
			text = autoEdWikilinks(text);
		});
		importScriptURI(AutoEd_baseurl + 'htmltowikitext.js', function() {
			text = autoEdHTMLtoWikitext(text);
		});
		importScriptURI(AutoEd_baseurl + 'headlines.js', function() {
			text = autoEdHeadlines(text);
		});
		importScriptURI(AutoEd_baseurl + 'unicodecontrolchars.js', function() {
			text = autoEdUnicodeControlChars(text);
		});
		importScriptURI(AutoEd_baseurl + 'unicodehex.js', function() {
			text = autoEdUnicodeHex(text);
		});
		importScriptURI(AutoEd_baseurl + 'templates.js', function() {
			text = autoEdTemplates(text);
		});
		importScriptURI(AutoEd_baseurl + 'tablestowikitext.js', function() {
			text = autoEdTablestoWikitext(text);
		});
		importScriptURI(AutoEd_baseurl + 'extrabreaks.js', function() {
			text = autoEdExtraBreaks(text);
		});
		importScriptURI(AutoEd_baseurl + 'links.js', function() {
			text = autoEdLinks(text);
		});

		// Run formatgeneral.js automatically
		importScriptURI(mw.config.get('wgServer') + '/w/index.php?action=raw&ctype=text/javascript&title=User:Ohconfucius/test/formatgeneral.js/core.js', function() {
			function regex(search,replace,repeat) {
				// regex() function stolen from [[meta:User:Pathoschild/Scripts/Regex_menu_framework.js]]
				if(!repeat || repeat<0)	var repeat = 1;
				for(var i=0; i<repeat; i++) {
					text = text.replace(search,replace);
				}
			}
			ohc_change_type();
			Ohc_football_retrain();
			ohc_protect_fmt();
			Ohc_formats();
			ohc_unprotect_fmt();
			ohc_downcase_CEO();
			Ohc_final_cleanup();
		});
	}

	//Ref tag correction part #1: remove whitespaces and commas between the ref tags and whitespaces before ref tags
	text = text.replace(/\s*(\<\/\s*ref\s*\>)\s*[,]*\s*(<\s*ref\s*(name\s*=|group\s*=)*\s*[^\/]*>)\s*$/gim, "$1$2");
	text = text.replace(/\s*(<\s*ref\s*(name\s*=|group\s*=)*\s*.*[^\/]+>)\s*$/gim, "$1");
	//Ref tag correction part #2: move :;.,!? before ref tags
	text = text.replace(/\s*((<\s*ref\s*(name\s*=|group\s*=)*\s*.*[\/]{1}>)|(<\s*ref\s*(name\s*=|group\s*=)*\s*[^\/]*>(?:\\<[^\<\>]*\>|[^><])*\<\/\s*ref\s*\>))\s*([.!?,;:])+$/gim, "$6$1");

	// Remove all unneeded HTML comments and wizards stuff
	text = text.replace("\* \[http\:\/\/www.example.com\/ example.com\]", "");
	text = text.replace(/'''Subject of my article''' is.../ig, "");
	text = text.replace(/\<\!--- Carry on from here, and delete this comment. ---\>/ig, "");
	text = text.replace(/\<\!--- Enter template purpose and instructions here. ---\>/ig, "");
	text = text.replace(/\<\!--- Enter the content and\/or code of the template here. ---\>/ig, "");
	text = text.replace(/\<\!-- EDIT BELOW THIS LINE --\>/ig, "");
	text = text.replace(/\<\!-- This will add a notice to the bottom of the page and won't blank it! The new template which says that your draft is waiting for a review will appear at the bottom; simply ignore the old \(grey\) drafted templates and the old \(red\) decline templates. A bot will update your article submission. Until then, please don't change anything in this text box\s*(and|.\s*Just)+ press "Save page". --\>/ig, "");
	text = text.replace(/\<\!--Do not include any categories - these don't need to be added until the article is accepted; They will just get removed by a bot!--\>/ig, "");
	text = text.replace(/\<\!--- Categories ---\>/gi, '');
	text = text.replace(/\<\!--- After listing your sources please cite them using inline citations and place them after the information they cite. Please see \[\[Wikipedia:REFB\]\] for instructions on how to add citations. ---\>/ig, "");
	text = text.replace(/\<\!-- Be sure to cite all of your sources in \<ref\>...\<\/ref\> tags and they will automatically display when you hit save. The more reliable sources added the better! See \[\[Wikipedia:REFB\]\] for more information--\>/ig, "");
	text = text.replace(/\<\!--- See \[\[Wikipedia:Footnotes\]\] on how to create references using (?:\<ref\>\<\/ref\> tags|tags) which will then appear here automatically --\>/ig, "");
	text = text.replace(/\<\!--Please don't change anything and press save --\>/ig, "");
	text = text.replace(/\<\!-- Please leave this line alone! --\>/ig, "");
	text = text.replace(/\<\!-- Do not include any categories - these don't need to be added until the article is accepted; They will just get removed by a bot! --\>/ig, "");
	text = text.replace(/\<\!-{1,3}\s*Important, do not remove this line before (template|article) has been created.\s*-{1,3}\>/ig, "");
	text = text.replace(/\<\!-- Just press the \"Save page\" button below without changing anything! Doing so will submit your article submission for review. Once you have saved this page you will find a new yellow 'Review waiting' box at the bottom of your submission page. If you have submitted your page previously, the old pink 'Submission declined' template or the old grey 'Draft' template will still appear at the top of your submission page, but you should ignore them. Again, please don't change anything in this text box. Just press the \"Save page\" button below. --\>/ig, "");
	text = text.replace(/== Request review at \[\[WP:AFC\]\] ==\n/ig, "");
	text = text.replace(/(?:<\s*references\s*>([\S\s]*)<\/references>|<\s*references\s*\/\s*>)/gi, "\n{{reflist|refs=$1}}");
	text = text.replace("{{reflist|refs=}}", "{{reflist}}"); // hack to make sure we don't leave an unneeded |refs=
	text = text.replace(/\{\{(userspacedraft|userspace draft|user sandbox|Please leave this line alone \(sandbox heading\))(?:\{\{[^{}]*\}\}|[^}{])*\}\}/ig, "");
	text = text.replace(/<!--\s*-->/ig, ""); // Remove empty HTML comments
	text = text.replace(/^----+$/igm, ""); // Removes horizontal rules
	text = text.replace(/\[\[:Category:Articles created via the Article Wizard\]\]/gi, "[[Category:Articles created via the Article Wizard]]");
	if (afc_re.test(text)) // Remove "AfC submission with missing AfC template" maintenace category - a cleanup will remove the cat without adding any!
		text = text.replace(/\[\[:?Category:AfC(_|\s*)+submissions(_|\s*)+with(_|\s*)+missing(_|\s*)+AfC(_|\s*)+template\]\]/gi, "");

	// Remove empty list elements and empty headers
	text = text.replace(/^\s*[\*#:;]\s*$/igm, "");

	// Move stub templates to the bottom, see [[WP:FOOTER]]
	var temptext = text;
	var stub_re = /\s*(\{\{(?:.+?-|)stub\}\})\s*/gi;
	var stubmatch;
	while (stubmatch = stub_re.exec(temptext)) {
		text = text.replace(stubmatch[0],'\n\n' /* since stub templates previously made a line break wherever they were placed */);
		text += '\n' + stubmatch[1];
	}

	//create an array, strip the submission templates, then AFC comments and then add them back to the page
	var submissiontemplates = new Array();
	var commentstemplates = new Array();
	while (submissiontemplate_re.test(text)) {
		var temptemplate = submissiontemplate_re.exec(text)[0].toString();
		text = text.replace(temptemplate, "");

		temptemplate = temptemplate.replace("\{\{subst:LOCALTIMESTAMP\}\}", "99999999999999");
		temptemplate = temptemplate.replace("\{\{REVISIONTIMESTAMP\}\}", "99999999999998");
		// remove the shrinked parameter, will be added back later
		temptemplate = temptemplate.replace(/\s*\|\s*small\s*=\s*yes\s*/gi, "");
		//correcting namespace number after page moves mostly from userspace
		temptemplate = temptemplate.replace(/\s*\|\s*ns\s*=\s*[0-9]{0,2}\s*/gi, '\|ns=' + wgNamespaceNumber); 
		
		var temptimestamp = temptemplate.replace(submissiontemplate_re, "$4");
		var tempstatus = temptemplate.replace(submissiontemplate_re, "$2");

		submissiontemplates.push([
				{template: temptemplate},
				{timestamp: temptimestamp},
				{status: tempstatus}
		]);
	}
	while (afc_comment_re.test(text)) {
		var temptemplate = afc_comment_re.exec(text).toString();
		var temptimestamp = temptemplate.replace(/([0-9]{2}):([0-9]{2}), ([0-9]{1,2}) (January|February|March|April|May|June|July|August|September|October|November|December) ([0-9]{4}) \(UTC\)/gi, "$5$4$3$1$2");
		temptimestamp = temptimestamp.replace(/January/g, "01").replace(/February/g, "02").replace(/March/g, "03").replace(/April/g, "04").replace(/May/g, "05").replace(/June/g, "06").replace(/July/g, "07").replace(/August/g, "08").replace(/September/g, "09").replace(/October/g, "10").replace(/November/g, "11").replace(/December/g, "12");
		if (/[0-9]{11,12}/.test(temptimestamp)){
			temptimestamp = /[0-9]{11,12}/.exec(temptimestamp)[0].toString();
			if (temptimestamp.length == 11){
				var temptemptimestamp = temptimestamp;
				temptimestamp = temptemptimestamp.slice(0, 6) + '0' +temptemptimestamp.slice(6, 11);
			}
		}else{
			temptimestamp = '000000000000';
			if (/~~~~/.test(temptemplate))
				temptimestamp = '999999999999';
		}
		commentstemplates.push([
				{template: temptemplate},
				{timestamp: temptimestamp}
		]);
		text = text.replace(temptemplate, "");
	}

	//adding the submission templates and comment templates back
	if (commentstemplates.length > 0) {
		//sorting on basis of timestamp
		commentstemplates.sort(function(a, b){
			return b[1].timestamp-a[1].timestamp;
		});
		text = '----\n' + text;
		for ((i = commentstemplates.length - 1); i >= 0; i--)
		text = commentstemplates[i][0].template + '\n\n' + text;
	}
	var submissiontemplates_length = submissiontemplates.length;
	if (submissiontemplates_length > 0) {
		//sorting on basis of TS
		submissiontemplates.sort(function(a, b){
			return b[1].timestamp-a[1].timestamp;
		});
		// Remove all draft templates if there is any other submission template
		// Remove any duplicate open review requests before saving the page (only affects open requests)
		// Find the first pending template and remove it; if one was removed too much, revert the last removal
		var multiple_draft_submission = false;
		var not_draft_submission = false;
		var pending_submission = false;
		for(i = 0; i< submissiontemplates_length; i++){
			if((submissiontemplates[i][2].status == "t") && (not_draft_submission || pending_submission || multiple_draft_submission )){
				submissiontemplates.splice(i, 1);
				i = 0; //rerun for removing all draft templates
				submissiontemplates_length = submissiontemplates.length;
			}
			else if((submissiontemplates[i][2].status == "t") && (!not_draft_submission || !pending_submission)){
				multiple_draft_submission = true;
			}
			else if ((!pending_submission) && ((submissiontemplates[i][2].status == "|")||(submissiontemplates[i][2].status == "r"))){
				pending_submission = true;
				not_draft_submission = true;
			}
			else if ((pending_submission) && ((submissiontemplates[i][2].status == "|")||(submissiontemplates[i][2].status == "r"))){
				submissiontemplates.splice(i, 1);
				i--;
				submissiontemplates_length = submissiontemplates.length;
			}
			else{ //only drafts on that page
				not_draft_submission = true;
			}
		}
		for ((i = submissiontemplates_length - 1); i >= 0; i--){
			var temp = submissiontemplates[i][0].template;
			temp = temp.replace("99999999999999", "\{\{subst:LOCALTIMESTAMP\}\}");
			temp = temp.replace("99999999999998", "\{\{REVISIONTIMESTAMP\}\}");
			if (submissiontemplates[i][2].status == "d")
				temp = temp.slice(0, (temp.length-2)) + '|small=yes\}\}';
			text = temp + text;
		}
		// declined_afc_re
		if (!pending_submission || declined_afc_re.test(text))
			text = text.replace(declined_afc_re, "$1$2$3$5");

		// Moving pending template back to the top
		if(pending_afc_re.test(text)){
			var temptemplate = pending_afc_re.exec(text)[0].toString();
			text = text.replace(temptemplate, "");
			text = temptemplate + "\n" + text;
		}
	}

	//Moving DB templates back to the top
	var dbtemplates_re = /\{\{\s*db(?:\{\{[^\{\}]*\}\}|[^\}\{])*\}\}/i;
	if(dbtemplates_re.test(text)){
		var temptemplate = dbtemplates_re.exec(text)[0].toString();
		text = text.replace(temptemplate, "");
		text = temptemplate + "\n" + text;
	}

	// Remove excess newlines
	text = text.replace(/(?:[\t ]*(?:\r?\n|\r)){3,}/ig,'\n\n');

	return text;
}

function afcHelper_setup() {
	/* Gets the pagetext, does some cleanup, lists previous deletions,
	and displays warnings about long comments and bad reference styles */
	textdata = afcHelper_getPageText(afcHelper_PageName, false, false, true); // get page text AND timestamp to save API calls
	pagetext = textdata.pagetext;
	afcHelper_cache.afcHelper_lastedited = textdata.timestamp; // Store the last edited date to the cache

	// Fix utterly invalid templates so cleanup doesn't mangle them
	pagetext = pagetext.replace(/\{\{\s*AFC submission(\s*\|){0,}ts\s*=\s*/gi, "{{AFC submission|||ts=");
	pagetext = pagetext.replace(/\{\{\s*AFC submission\s*\}\}/gi, "{{AFC submission|||ts=99999999999999|u=Example|ns="+ wgNamespaceNumber + "}}");
	pagetext = afcHelper_cleanup(pagetext,'initial');
	var bla = /({\{\s*afc submission\s*\|\s*r\s*((?:\{\{[^\{\}]*\}\}|[^\}\{])*\s*))(\|\s*reviewer\s*=\s*([^\|]+)*)*((\s*\|\s*reviewts\s*=\s*([0-9]{14})*)*((?:\{\{[^\{\}]*\}\}|[^\}\{]|)*\}\}))/i;
	warnings = afcHelper_warnings(pagetext); // Warn about problems with given pagetext

	return warnings; // Prepends the warnings
}

function afcHelper_warnings(pagetext) {
	// longer than 30 characters, but commonly added to the source code
	var texttest = pagetext.replace(/\<\!--\s*(See Wikipedia\:WikiProject Musicians|Only for images narrower than 220 pixels|Metadata\: see \[\[Wikipedia\:Persondata\]\])\s*--\>/gi, "");
	var errormsg = '';

	// test if there are 30+ character html comments in the page text
	var recomment = /\<!--(([^\-]|[\r\n]|-[^\-]){30,})(--[ \r\n\t]*\>|$)/gi;
	var matched;
	var matchct = 0;
	while (matched = recomment.exec(texttest)) {
		matchct += 1;
		if (errormsg == '') errormsg += '<div id="afcHelper_hiddenheader"><h3 class="notice">Please check the source code! This page contains one or more long (30+ characters) HTML comments, listed below:</h3></div>';
		errormsg += '<div class="afcHelper_hidden" id="'+ matchct +'"><a href="#">(Delete the following hidden comment)</a>: <b><i>' + matched[1] + '</b></i></div>';
		afcHelper_longcomments[matchct.toString()] = matched[0];
	}

	// When "remove comment" is clicked, trigger afcHelper_removehtmlcomment()
	$('body').on('click', '.afcHelper_hidden a', afcHelper_removehtmlcomment);

	//Check the deletion log and list it!
	var request = {
				'action': 'query',
				'list': 'logevents',
				'format': 'json',
				'leprop': 'user|timestamp|comment',
				'leaction': 'delete/delete',
				'letype': 'delete',
				'lelimit': 10,
				'leprop': 'user|timestamp|comment',
				'letitle': afcHelper_submissionTitle
			};
	var response = JSON.parse(
		$.ajax({
			url: mw.util.wikiScript('api'),
			data: request,
			async: false
		})
		.responseText
	);
	var deletionlog = response['query']['logevents'];
	if (deletionlog.length) {
		errormsg += ('<h3><div class="notice">The page ' + afcHelper_escapeHtmlChars(afcHelper_submissionTitle) + ' was deleted ' + deletionlog.length + ' time' + ((deletionlog.length != 1) ? "s" : "") + '. Here ' + ((deletionlog.length != 1) ? "are" : "is") + ' the edit summar' + ((deletionlog.length != 1) ? "ies" : "y") + ' from the <a href="' + wgScript + '?title=Special%3ALog&type=delete&page=' + afcHelper_submissionTitle + '" target="_blank">deletion log</a>:</div></h3><table class="wikitable"><tr><td><b>Timestamp</b></td><td><b>User</b></td><td><b>Reason</b></td></tr>');
		for (var i = 0; i < deletionlog.length; i++) {
			var deletioncomment = deletionlog[i].comment;
			var deletioncomment1_re = /\[\[([^\[\]]*?[^\]\|]*?)(\|([^\[\]]*?))\]\]/gi;
			var deletioncomment2_re = /\[\[((?:\[\[[^\[\]]*\]\]|[^\]\[[])*)\]\]/gi;
			//first handle wikilinks with piped links
			while (dlmatch = deletioncomment1_re.exec(deletioncomment)) {
				deletioncomment = deletioncomment.replace(dlmatch[0], "<a href=\"" + wgArticlePath.replace("$1", encodeURIComponent(dlmatch[1])) + "\" target=\"_blank\" title=\"" + dlmatch[1] + "\"></a>");
				deletioncomment = deletioncomment.replace("\"></a>", "\">" + dlmatch[3] + "</a>");
				deletioncomment = deletioncomment.replace("</a>|" + dlmatch[3], "</a>");
			}
			//now the rest
			while (dlmatch = deletioncomment2_re.exec(deletioncomment)) {
				deletioncomment = deletioncomment.replace(dlmatch[0], "<a href=\"" + wgArticlePath.replace("$1", encodeURIComponent(dlmatch[1])) + "\" target=\"_blank\" title=\"" + dlmatch[1] + "\">" + dlmatch[1] + "</a>");
			}
			errormsg += '<tr><td>' + deletionlog[i].timestamp + '</td><td><a href="' + wgArticlePath.replace("$1", encodeURIComponent("User:" + deletionlog[i].user)) + '" target="_blank" title="User:' + deletionlog[i].user + '">' + deletionlog[i].user + '</a> (<a href="' + wgArticlePath.replace("$1", encodeURIComponent("User talk:" + deletionlog[i].user)) + '" target="_blank" title="User talk:' + deletionlog[i].user + '">talk</a>)</td><td>' + deletioncomment + '</td></tr>';
		}
		errormsg += '</table>';
	}

	// count <ref> and </ref> and check if it fits
	var rerefbegin = /\<\s*ref\s*(name\s*=|group\s*=)*\s*[^\/]*>/ig;
	var rerefend = /\<\/\s*ref\s*\>/ig;
	var reflistre = /(\{\{reflist(?:\{\{[^\{\}]*\}\}|[^\}\{])*\}\})|(\<\s*references\s*\/\s*\>)/i;
	refbegin = texttest.match(rerefbegin);
	refend = texttest.match(rerefend);
	if (refbegin) { //Firefox workaround!
		if (refend) { //Firefox workaround!
			if (refbegin.length !== refend.length) {
				errormsg += '<h3><div class="notice">Please check the source code! This page contains unclosed &lt;ref&gt; tags!</div></h3>';
			}
		} else {
			errormsg += '<h3><div class="notice">Please check the source code! This page contains unbalanced &lt;ref&gt; and &lt;/ref&gt; tags!</div></h3>';
		}
	}
	//test if ref tags are used, but no reflist available
	if ((!reflistre.test(pagetext)) && refbegin) {
		errormsg += '<h3><div class="notice">Be careful, there is a &lt;ref&gt; tag used, but no references list (reflist)! You might not see all references.</div></h3>';
	}

	// test if <ref> foo <ref> on the page and place the markup on the box
	var rerefdouble = /\<\s*ref\s*(name\s*=|group\s*=)*\s*[^\/]*\>?(\<\s*[^\/]*\s*ref\s*(name\s*=|group\s*=)*)/ig;
	var refdouble = texttest.match(rerefdouble);
	if (refdouble) {
		errormsg += 'The script found following malformed references:<br/><i>';
		for (i = 0; i < refdouble.length; i++)
		errormsg += afcHelper_escapeHtmlChars(refdouble[i].toString()) + '&gt;<br/>';
		errormsg += '</i>';
	}
	// test if there are ref tags after reflist
	var temppagetext = pagetext;
	var n = temppagetext.search(reflistre);
	var o = temppagetext.match(reflistre);
	if (o) {
		temppagetext = temppagetext.slice(n + o[0].length);
		if ((temppagetext.search(rerefbegin)) > -1) {
			errormsg += '<h3><div class="notice">Be careful, there is a &lt;ref&gt; tag after the references list! You might not see all references.</div></h3>';
		}
	}
	return errormsg;
}

function afcHelper_trigger(type) {
	var e = document.getElementById(type);
	if (type === "afcHelper_biography_status_box") {
		var f = document.getElementById("afcHelper_biography_status");
		if (f.value === "dead") {
			e.style.display = 'block';
		} else {
			e.style.display = 'none';
		}
	} else if (type === "afcHelper_afcccleared") {
		if ($("#afcHelper_blank").attr("data-typeof") == "cv_van" && $('#afcHelper_blank').attr("checked")) {
			var f = document.getElementById("afcHelper_extra_afccleared");
			f.style.display = 'block';
		} else if (!$('#afcHelper_blank').attr("checked")) {
			var f = document.getElementById("afcHelper_extra_afccleared");
			f.style.display = 'none';
		}
	} else {
		e.style.display = ((e.style.display !== 'none') ? 'none' : 'block');
	}
}

function afcHelper_displaymessagehelper(type,detail) {
	// type == "done" for messages that should be displayed when ajax is completely finished
	// type == "status" for messages that should be displayed as they occur
	if (type === "done") {
		if (detail === "standard") {
			document.getElementById('afcHelper_finish').innerHTML += '<span id="afcHelper_finished_wrapper"><span id="afcHelper_finished_main" style="display:none"><li id="afcHelper_done"><b>Done (<a href="' + wgArticlePath.replace("$1", encodeURI(afcHelper_PageName)) + '?action=purge" title="' + afcHelper_PageName + '">Reload page</a>)</b></li></span></span>';
		} else if (detail === "cleanednochange") {
			document.getElementById('afcHelper_finish').innerHTML += '<span id="afcHelper_finished_wrapper"><span id="afcHelper_finished_main"><span id="afcHelper_done"><li id="afcHelper_done"><b>This submission is already cleaned. Nothing changed. (<a href="' + wgArticlePath.replace("$1", encodeURI(afcHelper_PageName)) + '?action=purge" title="' + afcHelper_PageName + '">Reload page</a>)</b></li></span></span>';
		}
	} else if (type === "status") {
		if (detail === "orphan") {
			document.getElementById('afcHelper_status').innerHTML += '<li id="afcHelper_orphan">Checking if article is an orphan...</li>';
		}
	} else {
		// Unrecognized
		return false;
	}
}

function afcHelper_last_nonbot(title) {
	var request = {
				'action': 'query',
				'prop': 'revisions',
				'format': 'json',
				'rvprop': 'user|timestamp',
				'rvlimit': 1,
				'rvdir': 'older',
				'rvexcludeuser': 'ArticlesForCreationBot',
				'indexpageids': true,
				'titles' : title
			};

	var response = JSON.parse(
		$.ajax({
			url: mw.util.wikiScript('api'),
			data: request,
			async: false
		})
		.responseText
	);
	pageid = response['query']['pageids'][0];
	revisions = response['query']['pages'][pageid]['revisions'];
	return response['query']['pages'][pageid]['revisions'][0];
}

function afcHelper_logcsd(title,reason,usersnotified) {
	// Update the user's Twinkle CSD log if they have one
	var speedyLogPageName = "User:" + mw.config.get('wgUserName') + "/" + (Twinkle.getPref('speedyLogPageName') || "CSD log");
	CSDlogtext = afcHelper_getPageText(speedyLogPageName);
	if (CSDlogtext) { // Only update the log if it exists
		var appendText = "";
		// Add header for new month if necessary (this `date` bit is directly from the Twinkle source code)
		var date = new Date();
		var headerRe = new RegExp("^==+\\s*" + date.getUTCMonthName() + "\\s+" + date.getUTCFullYear() + "\\s*==+", "m");
		if (!headerRe.exec(CSDlogtext)) {
			appendText += "\n\n=== " + date.getUTCMonthName() + " " + date.getUTCFullYear() + " ===";
		}
		appendText += "\n# [[:" + title + "]]: " + reason;
		if (usersnotified) appendText += "; notified ";
		$.each(usersnotified, function(index, user) {
			if (index > 0) appendText += ", ";
			appendText += "{{user|1=" + user + "}}";
		});
		appendText += " ~~~~~\n";
		afcHelper_editPage(speedyLogPageName,CSDlogtext + appendText,"Logging speedy deletion nomination of [[" + title + "]]");
	}
}

function afcHelper_g13_eligible(title) {
	var timeNow = new Date();
	var timeNowMonth = timeNow.getMonth();
	var sixMonthsAgo = new Date();
	sixMonthsAgo.setMonth(timeNowMonth - 6);
	var lastEdited = new Date(afcHelper_cache.afcHelper_lastedited);
	if ((timeNow.getTime() - lastEdited.getTime()) > (timeNow.getTime() - sixMonthsAgo.getTime())){
		return true;
	} else {
		return false;
	}
}

function afcHelper_page_creator(title) {
	if (afcHelper_cache[title]) return afcHelper_cache[title];
	var request = {
				'action': 'query',
				'prop': 'revisions',
				'rvprop': 'user',
				'format': 'json',
				'rvdir': 'newer',
				'rvlimit': 1,
				'indexpageids': true,
				'titles' : title
			};
	var response = JSON.parse(
		$.ajax({
			url: mw.util.wikiScript('api'),
			data: request,
			async: false
		})
		.responseText
	);
	pageid = response['query']['pageids'][0];
	user = response['query']['pages'][pageid]['revisions'][0]['user'];
	afcHelper_cache[title] = user;
	return user;
}

function afcHelper_addcomment(comment) {
	if (comment == "")
		return "";
	else
		return "\{\{afc comment|1=" + comment + " \~\~\~\~\}\}";
}

function afcHelper_underreview() {
	//TODO: check for a marked template and notify that a user is in review since TIME
	return true;
}

function afcHelper_turnvisible(id, visible) {
	if (visible) $("#" + id).css("display", "block");
	else $("#" + id).css("display", "none");
}

function afcHelper_removehtmlcomment() {
	// Removes the selected HTML comment from wikitext
	var parent = $(this).parent();
	var comment = afcHelper_longcomments[parent.attr('id')];
	pagetext = pagetext.replace(comment,'');
	parent.html('<span class="success">Comment removed!</span>');
	setTimeout(function() {
		parent.fadeOut();
		if ($('.afcHelper_hidden:visible').length < 2) $('#afcHelper_hiddenheader').fadeOut();
	},1000);
}

// Finally display the Review link
var afcportletLink = mw.util.addPortletLink('p-cactions', '#', 'Review', 'ca-afcHelper', 'Review', 'a');
$(afcportletLink).click(function(e) {
	e.preventDefault();
	afcHelper_init();
});

//</nowiki>
