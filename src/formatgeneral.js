function Ohc_formats() {
//html, superscripted ordinals
	regex(/\[\[[\w]*_\d{4}#\d{4}_[\w]*_\d\d?\|(Jan(?:uary|\.|)|Feb(?:ruary|\.|)|Mar(?:ch|\.|)|Apr(?:il|\.|)|May\.?|Jun(?:e|\.|)|Jul(?:y|\.|)|Aug(?:ust|\.|)|Sep(?:tember|\.|t\.|)|Oct(?:ober|\.|)|Nov(?:ember|\.|)|Dec(?:ember|\.|))( \d\d?)\]\]/g, '$1$2');
//	regex(/<br>/gi, '<br/>');
	regex(/(\d)(?:<(?:small|sup)>){2}(th|st|nd|rd)(?:<\/(?:small|sup)>){2}/gi, '$1$2');
	regex(/(\d)<(?:small|sup)>(th|st|nd|rd)(?:<\/(?:small|sup)>|<(?:small|sup)\/>)/gi, '$1$2');

//rem linking within section headings
	regex(/(==[ ]?(?:[^\[=]*|))\[\[([^\|\]]+?)\]\]((?:[^\[=\n]*|)[ ]?==)/gi, '$1$2$3');
	regex(/(==[ ]?(?:[^\[=]*|))\[\[[^\|\]]+?\|([^\]]+?)\]\]((?:[^\[=\n]*|)[ ]?==)/gi, '$1$2$3');
	regex(/(==[ ]?(?:[^\[=]*|))\[\[(?:[^\|\]]+?\||)([^\]]+?)\]\]([^\[\|]*)\[\[(?:[^\|\]]+?\||)([^\]]+?)\]\](?:([^\[\|]*)\[\[(?:[^\|\]]+?\||)([^\]]+?)\]\]|)((?:[^\[=\n]*|)[ ]?==)/gi, '$1$2$3$4$5$6$7');
	regex(/(==[ ]?)\d{1,2}px([^\|\]]+?)((?:[^\[=\n]*|)[ ]?==)/gi, '$1$2$3'); //rem artefact after removing file from title

//rem empty parameters
// 	regex(/\|[\n]*[ ]*[a-zA-Z][a-z0-9_ ]*=[ ]*[\n]?[ ]*(?=[\|\}])/g, "");

//rem deprecated parameters
 	regex(/\|\s*influence[sd]\s*=[^\|\{\}]*(?=[\|\}])/g, ""); //rfc infobox person July 2013

//add correct hyphenation
 	regex(/\b([2-9]|\d{2,3}|half|quarter|two|three|four|five|six|seven|eight|nine|ten) (minute|hour|day|week|month|year|litre|litre|degree|inch|foot|yard|mile|metre|metre|man|page|point|word|dollar|cent|floor|store?y|room)\b/g, "$1-$2");
 	regex(/\b(two|three|four|five|six|seven|eight|nine|ten) (halves|thirds|quarters|(?:four|fif|six|seven|eigh|nin|ten)ths)\b/g, "$1-$2");
 	regex(/(\bnon) ([A-Z]?[a-z]+)/g, "$1-$2");

//improper capitalisation within section headings
	regex(/(==[ ]*External )(Links)(?=[ ]*=)/g, '$1links');
	regex(/(==[ ]*See )(Also)(?=[ ]*=)/g, '$1also');
	regex(/(==[ ]*)Notable ([A-Z]\w*?)/g, '$1$2');
	regex(/(==[ ]*Box )O(ffice)(?=[ ]*=)/g, '$1o$2');
	regex(/(==[ ]*[\w]+? and )A(wards?|chievements?)(?=[ ]*=)/g, '$1a$2');
	regex(/(==[ ]*[\w\s]+? )C(areer|hampionships|haracters|ompositions)(?=[ ]*=)/g, '$1c$2');
	regex(/(==[ ]*[\w\s]+? )E(ducation)(?=[ ]*=)/g, '$1e$2');
//	regex(/(==[ ]*[\w\s]+? )G(roup)(?=[ ]*=)/g, '$1g$2');
	regex(/(==[ ]*[\w\s]+? )H(istory|onou?rs)(?=[ ]*=)/g, '$1h$2');
	regex(/(==[ ]*[\w\s]+? )L(evel|ife|isting)(?=[ ]*=)/g, '$1l$2');
	regex(/(==[ ]*(?:1st|2nd|3rd|\dth) )M(atch)/g, '$1m$2');
	regex(/(==[ ]*(?:1st|2nd|3rd|\dth) )F(inal)/g, '$1f$2');
	regex(/(==[ ]*(?:First|Second|Third|Fourth|[1-4](?:st|nd|rd|th)) )P(lace)(?=[ ]*==)/g, '$1p$2');
	regex(/(==[ ]*(?:First|Second|Third|Fourth|[1-4](?:st|nd|rd|th)) )Q(uarter)(?=[ ]*==)/g, '$1q$2');
	regex(/(==[ ]*(?:First|Second|Third|Fourth|[1-4](?:st|nd|rd|th)) )R(ound)(?=[ ]*==)/g, '$1r$2');
	regex(/(==[ ]*(?:CFL|N[BFH]L) )C(oaching )[Rr](ecords?)(?=[ ]*=)/g, '$1c$2r$3');
	regex(/(==[ ]*[\w\s]+? )R(ankings?|eading|esults?|ecords?|eception|ecognition)(?=[ ]*=)/g, '$1r$2');
	regex(/(==[ ]*[-\w\s]+? )C(areer )S(tatistics)(?=[ ]*=)/g, '$1c$2s$3');
	regex(/(==[ ]*[\w\s]+? )S(eason|quad|tyle|tage|tatistics)(?=[ ]*=)/g, '$1s$2');
	regex(/(==[ ]*[\w\s]+? )T(ournaments?)(?=[ ]*=)/g, '$1t$2');
	regex(/(==[ ]*[\w\s]+? )Y(ears)(?=[ ]*=)/g, '$1y$2');

	regex(/(==[ ]*Exhibition )Schedule(?=[ ]*=)/g, '$1schedule');
	regex(/(==[ ]*Regular )Season Schedule(?=[ ]*=)/g, '$1season schedule');
	regex(/(==[ ]*Terminated )(Destinations)(?=[ ]*=)/g, '$1destinations');
	regex(/(==[ ]*Twin )(Towns)(?=[ ]*=)/g, '$1towns');
	regex(/(==[ ]*Twin )(Towns [Aa]nd [Ss]ister [Cc]ities)(?=[ ]*=)/g, '$1towns and sister cities');
	regex(/(==[ ]*Heraldic )(Items)(?=[ ]*=)/g, '$1items');
	regex(/(==[ ]*Campaign )(Credits)(?=[ ]*=)/g, '$1credits');
	regex(/(==[ ]*Combat )(Chronicle)(?=[ ]*=)/g, '$1chronicle');

//other improper capitalisation
//	regex(/(\d(?:st|nd|rd|th) )C(entur(?:ies|y))(?=[ ]*(=|BC|AD|CE))/g, '$1c$2'); //transferring to MOSNUM script
//	regex(/(\d(?:st|nd|rd|th) )C(entur(?:ies|y))(?![ -]*(?:Fox|[A-Z]\w*))/g, '$1c$2');

	regex(/\b(Career )T(otal)\b/g, '$1T$2');
	regex(/\b(st|nd|rd|th) G(rade)\b/g, '$1 g$2');
//	regex(/(Official )S(ite)/g, '$1s$2');
//	regex(/([A-Z][a-z]+ )O(fficial )W(ebsite\])/g, '$1o$2w$3');
	regex(/(\'Further )R(eading)(?=\')/g, '$1r$2');

        regex(/(\w )A(nd|t) A(n? \w)/g, '$1a$2 a$3');
        regex(/(\w )A(nd|t) (My \w)/g, '$1a$2 $3');
        regex(/(\w )A(nd|t) T(he \w)/g, '$1a$2 t$3');
        regex(/(\w )By A(n? \w)/g, '$1by a$2');
        regex(/(\w )By (My \w)/g, '$1by $2');
        regex(/(\w )By T(he \w)/g, '$1by t$2');
        regex(/(\w )For A(n? \w)/g, '$1for a$2');
        regex(/(\w )For (My \w)/g, '$1for $2');
        regex(/(\w )For T(he \w)/g, '$1for t$2');
        regex(/(\w )In A(n? \w)/g, '$1in a$2');
        regex(/(\w )In (My \w)/g, '$1in $2');
        regex(/(\w )In T((?:he|o) \w)/g, '$1in t$2');
        regex(/(\w )I(nto \w)/g, '$1i$2');
        regex(/(\w )O(f|n|r) A(n? \w)/g, '$1o$2 a$3');
        regex(/(\w )O(f|n|r) (My \w)/g, '$1o$2 $3');
        regex(/(\w )O(f|n|r) T(he \w)/g, '$1o$2 t$3');
        regex(/(\w )To A(n? \w)/g, '$1to a$2');
        regex(/(\w )To (My \w)/g, '$1to m$2');
        regex(/(\w )To T(he \w)/g, '$1to t$2');
        regex(/(\w )With A(n? \w)/g, '$1with a$2');
        regex(/(\w )With M(y \w)/g, '$1with M$2');
        regex(/(\w )With T(he \w)/g, '$1with t$2');

        regex(/(\w )A(t \w)/g, '$1a$2');
        regex(/(\w )I(n \w)/g, '$1i$2');
        regex(/(\w )O([fn] \w)/g, '$1o$2');  //'Or' - false positive (with heraldric Or); 'On' - name (e.g. Ma On Shan)

        regex(/([Rr]unner)[\- ]U(p\b)/g, '$1-u$2');
        regex(/([Rr]unner)[\- ][Uu](?:ps)\b/g, '$1s-up');
        regex(/([Pp]lay)[\- ][Oo](ffs?)/g, '$1-o$2');
        regex(/(\W[^A-Z]+ )[Qq](uarter)[\- ]F(inal)/g, '$1q$2-f$3');
        regex(/([Qq]uarter)[\- ]F(inal)/g, '$1-f$2');
        regex(/(\W[^A-Z]+ )[Ss](emi)[\- ]F(inal)/g, '$1s$2-f$3');
        regex(/([Ss]emi)[\- ]F(inal)/g, '$1-f$2');

        regex(/(Bring |Turn )[Ii]t o(n)/g, '$1It O$2');   //reverting proper name - title of song or work
        regex(/(Carry )o(n [A-Z]\w*|n film)/g, '$1O$2');   //reverting proper name - 'Carry On' film series
        regex(/(Ma )o(n Shan)/g, '$1O$2');   //reverting proper name - 'Ma On Shan'
        regex(/(NZ |New Zealand )o(n Air|n Screen)/g, '$1O$2');   //reverting proper name - 'NZ On Air'
        regex(/in t(he [Aa]ir [Tt]onight)/g, 'In t$1');   //reverting per "In the Air Tonight"
        regex(/in t(he Flesh [Tt]our)/g, 'In t$1');   //reverting per "In the Flesh tour"
        regex(/(\W)o(n This Day)/g, '$1O$2');   //reverting per "on This Day"
        regex(/(Star Trek )into( Darkness)/g, '$1Into$2');   //reverting proper name - title of work

//remove flagicons from birth and death
	regex(/((?:birth|death)(?:_?place|)\s*=\s*)\{\{flagicon\|([^{}]+)\}\}/gi, '$1');
	regex(/((?:country(?:_represented)?|nationality|residence)\s*=\s*)\{\{flag(?:country|icon|)\|([^{}]+)\}\}/gi, '$1');
	regex(/((?:birth|death)(?:_?place|)\s*=\s*)\{\{flagu\|([^{}]+)\}\}/gi, '$1$2');
	regex(/((?:country(?:_represented)?|nationality|residence)\s*=\s*)\{\{flagu\|([^{}]+)\}\}/gi, '$1$2');
//remove scroll bar for reflists
	regex(/(References ?={1,4}[\n\r])[\r\n\s]*<div class=[^>]*>([\S\s]*?)<\/div>/g, '$1$2'); 	
	regex(/((?:Notes ?|References ?)={2,4}\s?[\n\r])[\r\n\s]*(?:\{\{[Rr]eflist\}\}|<[Rr]eferences ?\/>)/g, '$1{{reflist|colwidth=30em}}');

//rem redundant spaces underlining and punctuation
	regex(/(\s)[“”]((?:\w+ )*(?:\w+))[“”]([\s\.,])/gi, '$1\"$2\"$3');
	regex(/(\s)[‘`´’′]((?:\w+ )*(?:\w+))[‘`´’′]([\s\.,])/gi, '$1\'$2\'$3');
	regex(/(\w)[´’′]s/g, '$1\'s');		// replace various single quotes and prime symbol with straight apostrophe
	regex(/([\w;,.\]\)>] ) +([\[\w(])/gi, '$1$2');
	regex(/(^\.U\.)[ ]+((?:S|K)\.)/gi, '$1$2');  //U. S. and U. K. to U.S. and U.K.
	regex(/(<ref(?: name=[^\>\/]*?|)\/?>)[ ,\. ]*(<ref)/gi, '$1$2');	// remove punctuation between ref tags
	regex(/[ ]{1,3}(<ref(?:>| >| n))/g, '$1');		// remove spaces preceding ref tags and templates
	regex(/[ ]+(\n|\r)/g, '$1');	//removes multiple spaces preceding line break
	regex(/(\d),&nbsp;([12]\d{3}\b)+/g, '$1, $2');	//removes nbsp preceding year
	regex(/(\d)(?:&nbsp;| )%/g, '$1%');	//removes nbsp preceding '%'
	regex(/(&nbsp;)[ ](–|&ndash;)/g, '$1$2');	//Palliative for dashes script insertion of space after nbsp

	regex(/\b(US|UK|A(?:US|)|C(?:AN|)|NZ|HK) ([$£¥€])(\d)/g, '$1$2$3');
	regex(/([$£¥€]) (\d)/g, '$1$2');
	regex(/(\{\{(?:INR|Indian Rupee)\}\}|Rs\.?)(\d+)/g, '$1 $2');
	regex(/\{\{AUD\}\} ?(\d+)/g, 'A\$$1');

//rem bolding from linked AND bolded terms
//	regex(/'''(\[\[)([^\|\]]+?\||)([^\]]+?\]\][:-–]?)'''/g, '$1$2$3');

//rem 'external' wiktionary links
	regex(/\[https?:\/\/en\.wiktionary\.org\/wiki\/[\w]*[ ](\w[^\]]*)\]/g, '$1');

//rem linked copyright symbol
	regex(/(\[\[copyright\|©\]\] |©)/g, '');

//rem leading and lagging spaces within wikilinks
	regex(/(\[\[)[ ]+([^\[\]\|]*?)[ ]*(\]\])/g, '$1$2$3');
	regex(/(\[\[)[ ]*([^\[\]\|]*?)[ ]+(\]\])/g, '$1$2$3');
	regex(/(\[\[[^\[\]\|]*?[ ])[ ]+([^\[\]]*?\]\])/g, '$1$2');
	regex(/(\[\[[^\[\]\|]*?)[ ]+\|[ ]*([^\[\]]*?\]\])/g, '$1|$2');
	regex(/(\[\[[^\[\]\|]*?)[ ]*\|[ ]+([^\[\]]*?\]\])/g, '$1|$2');

//symbol for 'times' and dashes
//	regex(/&times;/gi, '×');
//	regex(/([ \.][\d]+)x([\d]+(?:\.[\d]+|)\s)/gi, '$1&nbsp;×&nbsp;$2'); //disabling - never ending false positives
	regex(/(\d) x (\d )/gi, '$1&nbsp;×&nbsp;$2');
	regex(/\s(A[cglmrstu]|B[ahikrad]?|C[adeflmno]|D[bsyrsu]|E[rsu]|F[elmr]?|G[adef]|H[fgos]|I[nr]?|Kr?|L[aruv]|M[dgnot]|N[abdeiop]?|Os?|P[abdmortu]?|R[abefghnu]|S[bcegimnr]?|T[abcehilm]?|U[ub][neopst]|V|W|Xe|Yb?|Z[nr])-(?=\1)/g, ' $1–'); //signifying chemical bonds and dash-linking of repeated names
	regex(/\s(A[cglmrstu]|B[ahikrad]?|C[adeflmno]|D[bsyrsu]|E[rsu]|F[elmr]?|G[adef]|H[fgos]|I[nr]?|Kr?|L[aruv]|M[dgnot]|N[abdeiop]?|Os?|P[abdmortu]?|R[abefghnu]|S[bcegimnr]?|T[abcehilm]?|U[ub][neopst]|V|W|Xe|Yb?|Z[nr])-(A[cglmrstu]|B[ahikrad]?|C[adeflmno]|D[bsyrsu]|E[rsu]|F[elmr]?|G[adef]|H[fgos]|I[nr]?|Kr?|L[aruv]|M[dgnot]|N[abdeiop]?|Os?|P[abdmortu]?|R[abefghnu]|S[bcegimnr]?|T[abcehilm]?|U[ub][neopst]|V|W|Xe|Yb?|Z[nr])\s/g, ' $1–$2 '); //signifying chemical bonds abbrev
//	regex(/([^<][^!] *)--( *[^>])/gi, '$1–$2'); //disabling - causes false positives with urls and some images
	regex(/&mdash;/gi, '—');
	regex(/([\w\d]) — (?=[\w\d])/gi, '$1 – ');		// tweak to avoid replacing emdashes in strings that are in non-roman unicode characters
	regex(/(\D7\d7)–(\d(?:00|)\D)/gi, '$1-$2');  //airplane model numbers taking hyphen

//inserting a white space between wikilinks to avoid errors upon unlinking
	regex(/(\]\][\.,]?)(\[\[)(?!file|image)/gi, '$1 $2');

//hash fixes
	regex(/([^=] )#(\d{1,3}[,\.]?\s)/g, '$1No. $2');

//full stop and nbsp fixes
	//protection for strings within wikilinks
	regex(/(\[(?:[^\|\]]*)\d\.\d?\d| \d{1,3}| \d{1,3},\d{3})([ ]*(?:[cgkm])[^\|\]]*?[\|\]])/gi, '$1♭$2');
	regex(/(\[(?:[^\|\]]*)(?:\d?\d[:\.]\d?\d| \d?\d))([ ]*(?:[ap]\.m\.|[ap]m)[^\|\]]*?[\|\]])/gi, '$1♭$2');

	//degrees
	regex(/(Ph)(?:\.\s?|\s)(D)\.?/g, '$1$2');
	regex(/(B|M)(?:\.\s?|\s)(Arch|Comm|Ed|Eng|Sc|Tech)\.?(?=\W)/g, '$1$2');

	//times of day, time ranges
//	regex(/((?:\d?\d[:\.]\d?\d| \d?\d)&nbsp;[ap])(?:\.m\.)(?=[^\w\-])/gi, '$1m');

//	regex(/(\d?\d[:\.]\d?\d| \d?\d)(?:[ ]*|&nbsp;)(?:a\.m\.|am)(?:[ ]*|&nbsp;)[-–—](?:[ ]*|&nbsp;)(\d?\d[:\.]\d?\d|\d?\d)(?:[ ]*|&nbsp;)(?:p\.m\.|pm)(?=[^\w\-])/gi, '$1&nbsp;am&nbsp;– $2&nbsp;pm');
//	regex(/(\d?\d[:\.]\d?\d| \d?\d)(?:[ ]*|&nbsp;)(?:p\.m\.|pm)(?:[ ]*|&nbsp;)[-–—](?:[ ]*|&nbsp;)(\d?\d[:\.]\d?\d|\d?\d)(?:[ ]*|&nbsp;)(?:a\.m\.|am)(?=[^\w\-])/gi, '$1&nbsp;pm&nbsp;– $2&nbsp;am');
//	regex(/(\d?\d[:\.]\d?\d| \d?\d)(?:[ ]*|&nbsp;)(?:a\.m\.|am)(?:[ ]*|&nbsp;)[-–—](?:[ ]*|&nbsp;)(\d?\d[:\.]\d?\d|\d?\d)(?:[ ]*|&nbsp;)(?:a\.m\.|am)(?=[^\w\-])/gi, '$1&nbsp;am&nbsp;– $2&nbsp;am');
//	regex(/(\d?\d[:\.]\d?\d| \d?\d)(?:[ ]*|&nbsp;)(?:p\.m\.|pm)(?:[ ]*|&nbsp;)[-–—](?:[ ]*|&nbsp;)(\d?\d[:\.]\d?\d|\d?\d)(?:[ ]*|&nbsp;)(?:p\.m\.|pm)(?=[^\w\-])/gi, '$1&nbsp;pm&nbsp;– $2&nbsp;pm');
//	regex(/(\d?\d[:\.]\d?\d| \d?\d)(?:[ ]*|&nbsp;)(?:a\.m\.|am)(?:[ ]*|&nbsp;)[-–—](?:[ ]*|&nbsp;)(noon|midnight)(?=[^\w\-])/gi, '$1&nbsp;am&nbsp;– $2');
//	regex(/(\d?\d[:\.]\d?\d| \d?\d)(?:[ ]*|&nbsp;)(?:p\.m\.|pm)(?:[ ]*|&nbsp;)[-–—](?:[ ]*|&nbsp;)(noon|midnight)(?=[^\w\-])/gi, '$1&nbsp;pm&nbsp;– $2');
//	regex(/\b(\d?\d[:\.]\d?\d| \d?\d)(?:[ ]*|&nbsp;)(?:a\.m\.|am)(?=[^\w\-])/gi, '$1&nbsp;am');
//	regex(/\b(\d?\d[:\.]\d?\d| \d?\d)(?:[ ]*|&nbsp;)(?:p\.m\.|pm)(?=[^\w\-])/gi, '$1&nbsp;pm');

	regex(/(\d\.\d?\d| \d{1,3}| \d{1,3},\d{3})[ ]*(?:kw)\b/gi, '$1&nbsp;kW');
	regex(/(\d\.\d?\d| \d{1,3}| \d{1,3},\d{3})[ ]*(?:khz)\b/gi, '$1&nbsp;kHz');
	regex(/(\d\.\d?\d| \d{1,3}| \d{1,3},\d{3})[ ]*(?:m[Hh]z)\b/gi, '$1&nbsp;MHz');
	regex(/(\d\.\d?\d| \d{1,3}| \d{1,3},\d{3})[ ]*(?:g[Hh]z)\b/gi, '$1&nbsp;GHz');
	regex(/(\d\.\d?\d| \d{1,3}| \d{1,3},\d{3})[ ]*(?:kph|kphr|kmh|kmhr|kmph|kmphr|km\/hr)\b/gi, '$1&nbsp;km/h');
	regex(/(\d\.\d?\d| \d{1,3}| \d{1,3},\d{3})[ ]*(?:m\.p\.h\.)\b/gi, '$1&nbsp;mph');
	regex(/(\d\.\d?\d| \d{1,3}| \d{1,3},\d{3})[ ]*(gm|kg|km)s?\b/g, '$1&nbsp;$2');
	regex(/(\d\.\d?\d| \d{1,3}| \d{1,3},\d{3})[ ]*(?:K(g|m))s?\b/g, '$1&nbsp;k$2');
	regex(/(\d\.\d?\d| \d{1,3}| \d{1,3},\d{3})[ ]*cms?/gi, '$1&nbsp;cm');
//	regex(/([^\|\[=]\d{1,3})\s(m|b|tr)illion(\b[^}])/g, '$1&nbsp;$2illion$3');

//turn letter 'x' into symbol '×'
	regex(/(\d)\sx\s(\d{1,3})\sin\s\(/gi, '$1 × $2 in (');
	regex(/(\d)\sx\s(\d{1,3})\sinch\s/gi, '$1 × $2 inch ');

// Convert degree symbols into ° symbol, ensure preceding space
	regex(/&deg;/g, '°');
//	regex(/º/g, '°');

// Celsius spelling errors
	regex(/(?:celsius|celcius|centigrade)/gi, 'Celsius');

//Fix common naming error (be careful with this one)
//	regex(/centigrade/gi, 'Celsius');
//Celsius or Fahrenheit
	regex(/(\d)&nbsp;(?:[°º]|deg|degree|degrees)&nbsp;([CF]\W)/g, '$1&nbsp;°$2');
	regex(/(\d)(?:[°º]|deg|degree|degrees)&nbsp;([CF]\W)/g, '$1&nbsp;°$2');
	regex(/(\d)&nbsp;(?:[°º]|deg|degree|degrees)([CF]\W)/g, '$1&nbsp;°$2');
	regex(/(\d)(?:\s|)(?:[°º]|deg|degree|degrees)(?:\s|)([CF]\W)/g, '$1&nbsp;°$2');
	regex(/(\d)(?:\s|&nbsp;)?(?=\[\[Celsius\|[°º]C\]\])/gi, '$1&nbsp;$2');
	regex(/(\d)(?:\s|&nbsp;)?(?=\[\[Fahrenheit\|[°º]F\]\])/gi, '$1&nbsp;$2');
	regex(/([^\d\(\)\/\\]\s)(-?\d[\d,\.]*)(?:\s|-|&nbsp;|)[°º]F([:;,\.?!]?\s[^\d\(\)\/\\])/g, '$1{{convert|$2|°F|°C|abbr=on}}$3');
	regex(/([^\d\(\)\/\\]\s)(-?\d[\d,\.]*)(?:\s|-|&nbsp;|)(?:deg|degree|degrees)(?:\s|-|&nbsp;|)Fahrenheit([:;,\.?!]?\s[^\d\(\)\/\\])/gi, '$1{{convert|$2|°F|°C}}$3');

// Convert &sup to superscript
//	regex(/(m)(?:&sup2;|²);/g, '$1<sup>2</sup>');
//	regex(/(m)(?:&sup3;|³);/g, '$1<sup>3</sup>');

//remove commas from numerical values in convert template
	regex(/(\{convert\|\d+),(\d)/g, '$1$2');
	regex(/(\{convert\|\d+),(\d)/g, '$1$2');
	regex(/(\{convert\|\d+),(\d)/g, '$1$2');
	regex(/(\{convert\|\d+),(\d)/g, '$1$2');
	regex(/(\{convert\|\d+),(\d)/g, '$1$2');

//remove leading zeros from convert template
	regex(/(\{\{convert\s*\|)\s*0+(?=[1-9])/g, '$1$2');

///per WP:COMMONALITY
	regex(/([Ff])reshman (year)/g, '$1irst $2');
	regex(/([Ss])ophomore (album|year)/g, '$1econd $2');

//remove Crores and Lakhs in templates converting to USD
	regex(/\{\{INR Convert[ ]*\|[ ]*/gi, '{{INRConvert|'); //removing spaces (redirects to shortcut)

	regex(/(\{INRConvert\|)(-?\d+)0000[ ]*\|l(\|\d|)(?:\|nolink=yes|)(\}\})/g, '$1$2|b$3$4');
	regex(/(\{INRConvert\|)(-?\d+)0[ ]*\|l(\|\d|)(?:\|nolink=yes|)(\}\})/g, '$1$2|m$3$4');
	regex(/(\{INRConvert\|)(-?\d+)(\d)[ ]*\|l(\|\d|)(?:\|nolink=yes|)(\}\})/g, '$1$2.$3|m$4$5');
	regex(/(\{INRConvert\|)(-?\d+)[ ]*\|l(\|\d|)(?:\|nolink=yes|)(\}\})/g, '$1$200000$3$4');
	regex(/(\{INRConvert\|)(-?\d+)\.(\d)[ ]*\|l(\|\d|)(?:\|nolink=yes|)(\}\})/g, '$1$2$30000$4$5');
	regex(/(\{INRConvert\|)(-?\d+)\.(\d)(\d)[ ]*\|l(\|\d|)(?:\|nolink=yes|)(\}\})/g, '$1$2$3$4000$5$6');
	regex(/(\{INRConvert\|)(-?\d+)(\d)[ ]*\|l(\|\d|)(?:\|nolink=yes|)(\}\})/g, '$1$2.$3|m$4$5');
	regex(/(\{INRConvert\|)(-?\d+)\.(\d)[ ]*\|c(\|\d|)(?:\|nolink=yes|)(\}\})/g, '$1$2$3|m$4$5');
	regex(/(\{INRConvert\|)(-?\d+)\.(\d)(\d+)[ ]*\|c(\|\d|)(?:\|nolink=yes|)(\}\})/g, '$1$2$3.$4|m$5$6');
	regex(/(\{INRConvert\|)(-?\d+)00[ ]*\|c(\|\d|)(?:\|nolink=yes|)(\}\})/g, '$1$2|b$3$4');
	regex(/(\{INRConvert\|)(-?\d+)(\d)0[ ]*\|c(\|\d|)(?:\|nolink=yes|)(\}\})/g, '$1$2.$3|b$4$5');
	regex(/(\{INRConvert\|)(-?\d+)(\d\d)[ ]*\|c(\|\d|)(?:\|nolink=yes|)(\}\})/g, '$1$2.$3|b$4$5');
	regex(/(\{INRConvert\|)(-?\d+)[ ]*\|c(\|\d|)(?:\|nolink=yes|)(\}\})/g, '$1$20|m$3$4');

//Currency notation placements  [$£₤¥€]
	regex(/\s(\$(?:\d+\.\d\d?|\d{1,3}|\d{1,3},\d{3}))((?:\s|&nbsp;)(?:m|b|tr)illion|)[ ]*(?:US(?:[D$]|\s?dollars?))\b/gi, ' US$1$2');

//Remove surprise or 'Easter egg' diversions linking unit name to orders of magnitude articles
	regex(/\[\[1\s?_?E\s?[\-\+]?\d{1,2}\s?..?\|([^\]]{1,50})\]\]/gi, '$1');
	regex(/\[\[Orders\sof\smagnitude\s\([^\)]+\)\|([^\]]{1,50})\]\]/gi, '$1');

	regex(/(\d)♭(\w| )/g, '$1$2');

//remove useless comments
	regex(/<!-- Metadata: see \[\[Wikipedia:Persondata\]\]\. -->/g, '');

//Deleted image cleanup
	regex(/<!-- Deleted image removed:[^>]*? -->\n*/g, '');

//	setoptions(minor='true'); 		//removed ",watch='false'" in response to user notification 13 Nov. 2010
//	setreason('remove bold formatting', 'append');
}

/** ------------------------------------------------------------------------ **/
/// PROTECTION BY STRING SUBSTITUTION

var linkmap=[];
function ohc_downcase_CEO()
{
    // protects categories, templates, link pipings, quotes, etc
    // the sensitive part is stored and replaced with a unique identifier,
    // which is later replaced with the stored part.

    var protect_function = function(s, begin, replace, end) {
        linkmap.push(replace);
        return begin + "⍌"+(linkmap.length-1)+"⍍" + end;
    };
    regex(/(<(?:imagemap)>)([\s\S]*)(<\/(?:imagemap)>)/gi, protect_function);
    regex(/(\{Wikisource\|)([\}]*)(\})/gi, protect_function);
    regex(/((?:Category|File|Image):)([^|\]]*)([\|\]])/gi, protect_function);
    regex(/(\|\s*edition\s*=)([^|\]]*)([\|\]])/gi, protect_function);
    regex(/(\|\s*\w*\s*=\s*)(\d(?:st|nd|rd|th)[^|\]]*)([\|\]])/gi, protect_function);
    regex(/(\D)(\d(?:st|nd|rd|th)(?: (?:to |and )(?:the |)\d{1,2}(?:st|nd|rd|th)|) (?:centur|ed[i\. ]|grade|millenni[au]|parallel|round))(.)/gi, protect_function); //protecting lower case terms only; code does not expand where ordinal num is followed by a block cap
    regex(/(\{(?:See ?also|Main))(\|[^{}]*)(\})/gi, protect_function);
    regex(/((?:cover|file(?:name|)|image\d?|image_skyline|image[ _]location\d?|image[ _]name|img|pic|map|title|quote)\s*=)([^\|\}]*)([\|\}])/gi, protect_function);
    regex(/(\[(?:https?:|ftp:))([^\]]*)(\])/gi, protect_function);
    regex(/(\[\[\w*)([^\|\]]*)(\|)/gi, protect_function);
    regex(/(\{\{\w*)([^\|=\[\]]*)(\}\})/gi, protect_function);
    regex(/(<ref name=)([^<>]*)(>)/gi, protect_function);
    regex(/(\{Infobox)( non Test)( cricket)/gi, protect_function);
    regex(/(.)((?:Chairman's|President'?s) (?:XI|Cup))(.)/g, protect_function);
    regex(/(.)(100\scrore club)(.)/gi, protect_function);
    regex(/(.)(Conference of Presidents)(.)/g, protect_function);

        regex(/C(hief )E(xecutive )O(fficer\W)/g, 'c$1e$2o$3');
        regex(/C(hief )E(xecutive\W)/g, 'c$1e$2');
        regex(/C(hief )F(inancial )O(fficer\W)/g, 'c$1f$2o$3');
        regex(/C(hief )O(perating )O(fficer\W)/g, 'c$1o$2o$3');
        regex(/C(hief )I(nformation )O(fficer\W)/g, 'c$1i$2o$3');
        regex(/C(hief )M(arketing )O(fficer\W)/g, 'c$1m$2o$3');
        regex(/M(anaging )D(irector\W)/g, 'm$1d$2');
        regex(/G(eneral )M(anager\W)(?!of)/g, 'g$1m$2');
        regex(/B(oard (?:of |))D(irectors?\W)/g, 'b$1d$2');
        regex(/B(oard )M(embers?\W)/g, 'b$1m$2');
        regex(/C(ommittee )M(embers?\W)/g, 'c$1m$2');
        regex(/I(ndependent )D(irectors?\W)/g, 'i$1d$2');
        regex(/I(ndependent )N(on[\s\-])[Ee](xecutive )D(irectors?\W)/g, 'I$1n$2e$3d$4');
        regex(/N(on[\s\-])[Ee](xecutive )D(irectors?\W)/g, 'n$1e$2d$3');
        regex(/C(hair(?:man|) of the )B(oard\W)/g, 'c$1b$2');
        regex(/(\w\s)V(ice)[\s\-]C(hair(?:man|)\W)(?!of)/g, '$1v$2-c$3');
        regex(/(\w\s)C(hairman\W)(?!of)/g, '$1c$2');
        regex(/C(ompany )S(ecretary\W)(?!of)/g, 'c$1s$2');
        regex(/G(eneral )S(ecretary\W)(?!of)/g, 'g$1s$2');
//        regex(/(\b[^A-Z]\w*[^neS]\.?\s)V(ice)[\s\-]P(resident\W|rincipal)(?!of)/g, '$1v$2-p$3');
        regex(/(\w\s+)P(residents)/g, '$1p$2');
//        regex(/(\b[^A-Z]\w*[^neS]\.?\s)P(resident\W)(?!of)/g, '$1p$2');
//        regex(/(\w\s)D(eputy) P(rime)[\s\-]M(inister\W)(?!of)/g, '$1d$2 p$3 m$4');
        regex(/([Aa]\s)M(ember of )P(arliament\W)/g, '$1m$2p$3');
        regex(/(\w\s)M(embers of )P(arliament\W)/g, '$1m$2p$3');

// replace space as separator
	regex(/(\W)(\d+) (\d{3}) (\d{3}) (\d{3}) (\d{3})(?=\W)/g, '$1$2,$3,$4,$5,$6');
	regex(/(\W)(\d+) (\d{3}) (\d{3}) (\d{3})(?=\W)/g, '$1$2,$3,$4,$5');
	regex(/(\W)(\d+) (\d{3}) (\d{3})(?=\W)/g, '$1$2,$3,$4');
	regex(/(\W)(\d{3}) (\d{3})(?=\W)/g, '$1$2,$3');

// replace comma as decimal separator, or full stop as thousands separator
	regex(/([€])[ ]*(\d+).(\d\d\d).(\d\d\d)(?=\W)/g, '$1$2,$3,$4');
	regex(/([€])(\d+),(\d\d?)(?=\W)/g, '$1$2.$3');
	regex(/(\W)(\d+),(\d\d?)[ ]*(?=%)/g, '$1$2.$3');

//remove Crores and Lakhs not in templates
	regex(/(\d+)[ ]?(?:lakh|\[\[lakh\]\])[\- ](?:crores?|\[\[crores?\]\])/g, '$1&nbsp;trillion ([[Long and short scales|short scale]])');

	regex(/(?:(\d+),|)(\d+)0,000\s?(?:lacs?|lakhs?|\[\[lakhs?(?:\|l|\|lacs?|\|lakhs|)\]\])(?=[^\-\w])/gi, '$1$2&nbsp;billion');
	regex(/(?:(\d+),|)(\d+)\.(\d)\s?(?:lacs?|lakhs?|\[\[lakhs?(?:\|l|\|lacs?|\|lakhs|)\]\])(?=[^\-\w])/gi, '$1$2$30,000');
	regex(/(?:(\d+),|)(\d+)\.(\d)(\d)\s?(?:lacs?|lakhs?|\[\[lakhs?(?:\|l|\|lacs?|\|lakhs|)\]\])(?=[^\-\w])/gi, '$1$2$3$4,000');
	regex(/(?:(\d+),|)(\d+)0\s?(?:lacs?|lakhs?|\[\[lakhs?(?:\|l|\|lacs?|\|lakhs|)\]\])(?=[^\-\w])/gi, '$1$2&nbsp;million');
	regex(/(?:(\d+),|)(\d+)(\d+)\s?(?:lacs?|lakhs?|\[\[lakhs?(?:\|l|\|lacs?|\|lakhs|)\]\])(?=[^\-\w])/gi, '$1$2.$3&nbsp;million');
	regex(/(?:(\d+),|)(\d+)\s?(?:lacs?|lakhs?|\[\[lakhs?(?:\|l|\|lacs?|\|lakhs|)\]\])(?=[^\-\w])/gi, '$1$200,000');
	regex(/(?:(\d+),|)(\d+)\.(\d)\s?(?:crs?|crores?|\[\[crores?(?:\|crs|\|crores|)\]\])(?=[^\-\w])/gi, '$1$2$3&nbsp;million');
	regex(/(?:(\d+),|)(\d+)\.(\d)(\d+)\s?(?:crs?|crores?|\[\[crores?(?:\|crs|\|crores|)\]\])(?=[^\-\w])/gi, '$1$2$3.$4&nbsp;million');
	regex(/(?:(\d+),|)(\d+)00\s?(?:crs?|crores?|\[\[crores?(?:\|crs|\|crores|)\]\])(?=[^\-\w])/gi, '$1$2&nbsp;billion');
	regex(/(?:(\d+),|)(\d+)(\d\d)\s?(?:crs?|crores?|\[\[crores?(?:\|crs|\|crores|)\]\])(?=[^\-\w])/gi, '$1$2.$3&nbsp;billion');
	regex(/(?:(\d+),|)(\d+)\s?(?:crs?|crores?|\[\[crores?(?:\|crs|\|crores|)\]\])(?=[^\-\w])/gi, '$1$20&nbsp;million');

// Indian commas
	regex(/(\W)(\d{1,3}),(\d\d),(\d\d),(\d\d),(\d\d),(\d\d\d)(?=[\s\.,–])/g, '$1{{formatnum:$2$3$4$5$6$7}}');
	regex(/(\W)(\d{1,3}),(\d\d),(\d\d),(\d\d),(\d\d\d)(?=[\s\.,–])/g, '$1{{formatnum:$2$3$4$5$6}}');
	regex(/(\W)(\d{1,3}),(\d\d),(\d\d),(\d\d\d)(?=[\s\.,–])/g, '$1{{formatnum:$2$3$4$5}}');
	regex(/(\W)(\d\d?),(\d\d),(\d\d\d)(?=[\s\.,–])/g, '$1{{formatnum:$2$3$4}}');

	regex(/(\{INR)\}\}[ ]*\{\{formatnum:(\d+\}\})/g, '$1Convert|$2');
//	regex(/(\{\{(?:INR|Indian Rupee)\}\}|Rs\.?) (\d+)/g, '$1$2');

    //removes protection put in place by function ohc_protect_fmt (all cats, templates etc.)
    regex(/⍌([0-9]+)⍍/g, function(x, n) {
        var res = linkmap[n];
        res = res.replace(/⍌([0-9]+)⍍/g, function(x, n) {
            var res = linkmap[n];
            res = res.replace(/⍌([0-9]+)⍍/g, function(x, n) {
                var res = linkmap[n];
                res = res.replace(/⍌([0-9]+)⍍/g, function(x, n) {
                    return linkmap[n];
                });
                return res;
            });
            return res;
        });
        return res;
    });
}

function make_dates_bold(){
//**********************************************************************************************
// This script was originally written by Lightmouse to make dates bold - for timelines, etc.
// For use mainly with timelines, it makes dates after bullet points into bold type

//process date ranges containing a hyphen '* month dd - month dd:'
	regex(/\*\s?((?:January|February|March|April|May|June|July|August|September|October|November|December) \d\d?\s?[\-–]\s?(?:January|February|March|April|May|June|July|August|September|October|November|December) \d\d?)\s?:\s?/gi, '* \'\'\'$1:\'\'\' ');

//process date ranges containing a hyphen '* month dd dd:'
	regex(/\*\s?((?:January|February|March|April|May|June|July|August|September|October|November|December) \d\d?\s?[\-–]\s?\d\d?)\s?:\s?/gi, '* \'\'\'$1:\'\'\' ');

//protect date ranges containing a hyphen
	regex(/\*\s?((?:January|February|March|April|May|June|July|August|September|October|November|December) \d\d?\s?)[\-–](\s?(?:January|February|March|April|May|June|July|August|September|October|November|December) \d\d?)\s?:\s?/gi, '$1xx$2');
	regex(/\*\s?((?:January|February|March|April|May|June|July|August|September|October|November|December) \d\d?\s?)[\-–](\s?\d\d?)\s?:\s?/gi, '$1xx$2');

//process dates containing a hyphen
	regex(/\*\s?((?:January|February|March|April|May|June|July|August|September|October|November|December) \d\d?\s?)[\-–]\s?/gi, '* \'\'\'$1:\'\'\' ');

//unprotect date ranges containing a hyphen
	regex(/\*\s?((?:January|February|March|April|May|June|July|August|September|October|November|December) \d\d?\s?)xx(\s?(?:January|February|March|April|May|June|July|August|September|October|November|December) \d\d?)\s?:\s?/gi, '$1–$2');
	regex(/\*\s?((?:January|February|March|April|May|June|July|August|September|October|November|December) \d\d?\s?)xx(\s?\d\d?)\s?:\s?/gi, '$1–$2');

//process other dates
	regex(/\*\s?((?:January|February|March|April|May|June|July|August|September|October|November|December)\s\d\d?(?:,\s?\d{1,4})?\s?[\-–—:])\s/gi, '* \'\'\'$1\'\'\' ');
	regex(/\*\s?(\d\d?\s(?:January|February|March|April|May|June|July|August|September|October|November|December)(?:\s\d{1,4})?\s?[\-–—:])\s/gi, '* \'\'\'$1\'\'\' ');

}

function ohc_change_type(){

//update syntax of 'File'
//	regex(/\[\[(file|[Ii]mage):/g, '[[File:');

	regex(/(\[\[(?:2. |))Fußball-(Bundesliga‎\|)/gi, '$1$2');
	regex(/(\[\[\d{4})-(\d{2} in [\w ]*football\|)/gi, '$1–$2');
	regex(/(\[\[\d{4})-(\d{2} [A-Z]* season\|)/gi, '$1–$2');
	regex(/(\[\[\d{4})-(\d{2} (?:Asian Club Championship|AFC Champions League|Ekstraklasa|Eredivisie|Serie [A-Z]\d?|UEFA (?:Cup Winners' |)Cup|UEFA (?:Champions|Europa) League|Danish (?:Superliga|[1-3](?:st|nd|rd) Division)|French football Division \d|Czechoslovak First League|Gambrinus liga|Czech Cup|Coppa Italia|[A-Z]* (?:Premier|Super) League|KNVB Cup|Liga (?:Arzit|Leumit))\|)/gi, '$1–$2');
//plus retraining
	regex(/(\[\[)(Asian Club Championship|AFC Champions League|Ekstraklasa|Eredivisie|Serie [A-Z]\d?|UEFA (?:Cup Winners' |)Cup|UEFA (?:Champions|Europa) League|Danish (?:Superliga|[1-3](?:st|nd|rd) Division)|French football Division \d|Czechoslovak First League|Gambrinus liga|Czech Cup|Coppa Italia|[A-Z]* (?:Premier|Super) League|KNVB Cup|Liga (?:Arzit|Leumit)) (\d{4})[--](\d{2})(#|\|)/gi, '$1$3–$4 $2$5');

	regex(/(\[\[)(Ten Years)(\]\])/gi, '$110 Years (band)|10 Years$3');
	regex(/(\[\[)(10 Years)(\]\])/gi, '$1$2 (band)|$2$3');

}

/** ------------------------------------------------------------------------ **/
/// PROTECTION BY STRING SUBSTITUTION

var linkmap=[];
function ohc_protect_fmt()
{
    // protects categories, templates, link pipings, quotes, etc
    // the sensitive part is stored and replaced with a unique identifier,
    // which is later replaced with the stored part.

    var protect_function = function(s, begin, replace, end) {
        linkmap.push(replace);
        return begin + "⍌"+(linkmap.length-1)+"⍍" + end;
    };
    regex(/(\{Wikisource\|)([\}]*)(\})/gi, protect_function);
    regex(/((?:Category|File|Image):)([^|\]]*)([\|\]])/gi, protect_function);
    regex(/((?:[a-z]{2,3}):)([^|\]]*)([\|\]])/gi, protect_function);
    regex(/(\{(?:See ?also|Main))(\|[^\}]*)(\})/gi, protect_function);
    regex(/((?:cover|file(?:name|)|image\d?|image_skyline|image[ _]location\d?|image[ _]name|img|pic|map)\s*=)([^\|\}]*)([\|\}])/gi, protect_function);
    regex(/(\[\[\w*)([^\|\]]*)(\|)/gi, protect_function);
    regex(/(\{\{\w*)([^\|=\[\]]*)(\}\})/gi, protect_function);
    regex(/(<ref name=)([^<>]*)(>)/gi, protect_function);
    regex(/(\{Infobox)( non Test)( cricket)/gi, protect_function);
    regex(/(.)(On a Friday)(.)/gi, protect_function);
    regex(/(.)(Carry On [A-Z][a-z]*)(.)/g, protect_function);
    regex(/(.)(10 metre (?:air|running) \w*)(.)/g, protect_function);

}


function ohc_unprotect_fmt()
{
    //removes protection put in place by function ohc_protect_fmt (all cats, templates etc.)
    regex(/⍌([0-9]+)⍍/g, function(x, n) {
        var res = linkmap[n];
        res = res.replace(/⍌([0-9]+)⍍/g, function(x, n) {
            var res = linkmap[n];
            res = res.replace(/⍌([0-9]+)⍍/g, function(x, n) {
                var res = linkmap[n];
                res = res.replace(/⍌([0-9]+)⍍/g, function(x, n) {
                    return linkmap[n];
                });
                return res;
            });
            return res;
        });
        return res;
    });
}

/** ------------------------------------------------------------------------ **/

function Ohc_formatgeneral() {
	ohc_change_type();
	ohc_protect_fmt();
	Ohc_formats();
	ohc_unprotect_fmt();
	ohc_downcase_CEO();
}
