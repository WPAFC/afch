//<nowiki>
// Script should be located at [[MediaWiki:Gadget-afchelper.js/prefs.js]]

/* 
	Preferences can be referenced in the code in following manner:
		afcHelper_preferences.prefname

	TODO add more documentation, especially on how to add prefs and such
*/

var afcHelper_defaultPreferences = {
	'summary': '([[WP:AFCH|AFCH]])',
	'afc_logCSD': true,
	'afc_customDeclineRationales': [],
	'afc_customAcceptRationales': [],
	'dosomething': true
}

function afcHelper_assemblePrefSetter() {
	var afcHelper_preferencedetails = [
		{
			'type':'category',
			'id':'general',
			'title':'General',
			'preferences': [
				{
					'id':'summary',
					'type':'text',
					'prompt':'What text should be appended to the edit summary when using the helper script?'
				}
			]
		},{
			'type':'category',
			'id':'afc',
			'title':'Articles for creation',
			'preferences': [
				{
					'id':'afc_logCSD',
					'type':'checkbox',
					'prompt':'Should we automatically log CSD nominations to User:' + mw.config.get('wgUserName') + '/CSD log?'
				},
				{
					'id':'afc_customAcceptRationales',
					'type':'userlist',
					'prompt':'Enter custom accept rationales that will appear when reviewing AFC submissions.'
				},
				{
					'id':'afc_customDeclineRationales',
					'type':'userlist',
					'prompt':'Enter custom decline rationales that will appear when reviewing AFC submissions.'
				}
			]
		}/*,{
			'type':'category',
			'id':'ffu',
			'title':'Files for upload',
			'preferences': [
				{
					'id':'dosomething',
					'type':'checkbox',
					'prompt':'Should we do something?'
				}
			]
		}*/
	];

	$('#afcHelper_prefs').html('<div id="afcHelper_prefheader"><a href="//en.wikipedia.org/wiki/Wikipedia:AFCH">Articles for creation helper script</a> preferences manager<div id="afcHelper_prefstatus"></div></div><div id="afcHelper_prefsetter"></div>')
	$('#afcHelper_prefstatus').html('Loading preferences manager...')

	for (var i = 0; i < afcHelper_preferencedetails.length; i++) {
		// Set up the header
		var category = afcHelper_preferencedetails[i];
		var category_div = $('<div>')
			.attr('id', category.id)
			.append('<h2>' + category.title + '</h2>');
		// Now set up the prefs
		var prefs = category.preferences;
		for (var g = 0; g < prefs.length; g++) {
			var pref = prefs[g];
			var preftype = pref.type;

			if (preftype === 'userlist') {
				var current_vals = afcHelper_preferences[pref.id];
				if (current_vals.length === 0) current_vals.push('Enter text here');

				var maintable = $('<table>')
					.attr('id',pref.id)
					.attr('type','userlist')
					.attr('style','width:80%; margin-left:2em;')
					.attr('class','afcHelper_pref wikitable');

				$.each(current_vals, function(index,value) { maintable.append(afcHelper_makeRowWithInput(value,pref.id)); });

				var buttonrow = $('<tr>')
					.attr('class','afcHelper_addbutton');
				var button = $('<button>Add additional row</button>')
					.attr('onclick',"afcHelper_makeRowWithInput('Enter text here','" + pref.id + "')");
				buttonrow.append($('<td>').append(button));

				maintable.append(buttonrow);

				var pref_div = $('<div>')
					.html('<label for="'+pref.id+'">'+pref.prompt+'</label>')
					.append(maintable);
				category_div.append($('<li>').append(pref_div));
			} else {
				var input_code = $('<input>')
					.attr('id',pref.id)
					.attr('type',preftype)
					.attr('class','afcHelper_pref');
				switch (preftype) {
					case 'checkbox':
						if (afcHelper_preferences[pref.id] == true) input_code.attr('checked', 'checked');
						break;
					default:
						input_code.attr('value',afcHelper_preferences[pref.id]);
						break;
				}
				var pref_div = $('<div>')
					.html('<label for="'+pref.id+'">'+pref.prompt+'</label>')
					.append(input_code);
				category_div.append($('<li>').append(pref_div));
			}
		};
		// And finally add this category to the list
		$('#afcHelper_prefsetter').append(category_div);
	};

	$('#afcHelper_prefs').append('<div id="afcHelper_footer"><button class="afcHelper_button" type="button" id="afcHelper_submitprefs" onclick="afcHelper_savePrefs()">Save preferences</button> or <a href="#" onclick="afcHelper_restoreDefaults()">restore defaults</a></div>');
	$('#afcHelper_prefstatus').html('Preferences manager loaded.')
}

function afcHelper_restoreDefaults() {
	$('#afcHelper_prefstatus').html('Restoring to default preferences...')
	afcHelper_savePrefsApi(afcHelper_defaultPreferences,'restored');
}

function afcHelper_savePrefs() {
	$('.afcHelper_pref').each(function(index,pref) {
		var jqpref = $(pref);
		switch (jqpref.attr('type')) {
			case 'checkbox':
				var value = ((jqpref.attr("checked") != undefined) ? true : false);
				break;
			case 'userlist':
				console.log('its a userlist');
				console.log(jqpref.find('input[type=text]'));
				console.log(jqpref);
				var value = [];
				jqpref.find('input[type=text]').each(function(index,val) {
					jqval = $(val);
					if (jqval.val() !== "Enter text here") value.push($.trim(jqval.val()));
				});
				break;
			default:
				var value = $.trim(jqpref.val());
				break;
		}
		afcHelper_preferences[jqpref.attr('id')] = value;
	});
	$('#afcHelper_prefstatus').html('Saving preferences...')
	afcHelper_savePrefsApi(afcHelper_preferences,'saved');
}

function afcHelper_savePrefsApi(prefs,verb) {
	var tokenreq = {
			'action': 'tokens',
			'type': 'options'
	};

	var api = new mw.Api();
	api.post(tokenreq)
			.done(function(tokendata) {
				if (tokendata) {
					var optionsreq = {
							'action': 'options',
							'token': tokendata.tokens.optionstoken,
							'optionname': 'userjs-afch',
							'optionvalue': JSON.stringify(prefs)
					};
					api.post(optionsreq)
							.done(function(data) {
								$('#afcHelper_prefstatus').html('Preferences ' + verb + ' successfully! (<b><a href="#"" onclick="location.reload(true); return false;">Reload page</a> to see changes</b>)');
							})
							.fail(function(error) {
								$('#afcHelper_prefstatus').html('<span class="afcHelper_notice"><b>Could not save preferences!</b></span> Error info: ' + error); 
							});
				} else {
					$('#afcHelper_prefstatus').html('<span class="afcHelper_notice"><b>Could not save preferences!</b></span> Error info: could not get save token'); 
				}
			} )
			.fail(function(error) {
				$('#afcHelper_prefstatus').html('<span class="afcHelper_notice"><b>Could not save preferences!</b></span> Error info: could not get save token (' + error + ')'); 
			});
}

function afcHelper_makeRowWithInput(value,tableid) {
	var maintable = $('#'+tableid);
	var row = $('<tr>');
	var input = $('<input>')
		.attr('type','text')
		.attr('style','width:89%; float:left;')
		.attr('value',value);
	var deletebutton = $('<a>')
		.attr('class','afchelper_deleterow')
		.attr('style','width:10%; float:right;')
		.attr('onclick','$(this).parent().remove();')
		.text('[remove]');
	row.append($('<td>').append(input,deletebutton));
	maintable.find('.afcHelper_addbutton').before(row);
	return row;
}

function afcHelper_getUserPrefs(defaultprefs) {
	/* 
	Given a dictionary of default preferences, returns a
	dictionary of those prefs += saved prefs, with saved
	preferences taking precedent over defaults
	*/
	var newprefs = $.extend({},defaultprefs);
	// Get previously saved preferences
	var oldprefs = mw.user.options.get('userjs-afch');
	if (oldprefs) oldprefs = JSON.parse(oldprefs)
	else oldprefs = {};
	// Update afcHelper_preferences with user-set preferences
	$.each(oldprefs, function(key, value) {
		if (key in newprefs) {
			// Our lazy way of phasing out old preferences...
			newprefs[key] = value;
		}
	});
	return newprefs;
}

// Update the preferences dictionary with user preferences [critical]
var afcHelper_preferences = afcHelper_getUserPrefs(afcHelper_defaultPreferences);

// If on the prefs page, display the pref setter
if (wgPageName.indexOf('Wikipedia:WikiProject_Articles_for_creation/Helper_script/Preferences') !== -1) {
	afcHelper_assemblePrefSetter();
}

