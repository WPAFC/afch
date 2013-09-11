Yet another Articles for creation helper script
========
This is a script created to make reviewing Wikipedia AfC submissions, files for upload, AfC submissions missing a template, and redirect submissions easier. The full documentation is available on [Wikipedia](https://en.wikipedia.org/wiki/Wikipedia:WikiProject_Articles_for_creation/Helper_script#Documentation).

## Contributing
If you wish to contribute, that's great! Just fork the repository, make your changes in the `develop` branch, and then create a pull request. Frequent contributors can request to be added to the WPAFC organization on GitHub for the ability to commit directly to the repository, sans pull request.

### Testing
Developers are highly encouraged to test their modifications before committing. Rather than test on the live wiki, you can use [test.wikipedia.org](http://test.wikipedia.org/wiki/Main_Page) and not be afraid of blowing anything up.

On the English Wikipedia, several different scripts mirror different branches.
* [User:Theo's Little Bot/afch/afchelper.js](https://en.wikipedia.org/w/index.php?title=User:Theo%27s_Little_Bot/afch/afchelper.js) &ndash; mirrors the `develop` branch (auto-updates every 10 minutes)
* [MediaWiki:Gadget-afchelper.js](https://en.wikipedia.org/w/index.php?title=MediaWiki:Gadget-afchelper.js) &ndash; for stable releases, mirrors the `master` branch
* [MediaWiki:Gadget-afchelper-beta.js](https://en.wikipedia.org/w/index.php?title=MediaWiki:Gadget-afchelper-beta.js) &ndash; for testing by the general public, mirrors the `beta` branch
* **your page here** &ndash; if you'd like for a feature branch to be copied to a specific page on-wiki, just create a new issue

To import a script, add it to [your common.js page](http://en.wikipedia.org/wiki/Special:MyPage/common.js) (example is for the `develop` script):

    importScript("User:Theo's Little Bot/afch/afchelper.js"); // AFCH script development [[User:Theo's Little Bot/afch]]

The only exception to this is for the `master` script: to use it, you just need to check the box next to "Yet Another AFC Helper Script" in [your preferences](http://en.wikipedia.org/wiki/Special:Preferences#mw-prefsection-gadgets).

If the script isn't showing up (for `beta` and `develop`), try clearing your cache first.

## License
The script is licensed under the [Creative Commons Attribution-ShareAlike 3.0 Unported License](http://en.wikipedia.org/wiki/Wikipedia:Text_of_Creative_Commons_Attribution-ShareAlike_3.0_Unported_License) and the [GNU Free Documentation License](http://en.wikipedia.org/wiki/Wikipedia:Text_of_the_GNU_Free_Documentation_License).

## Chat
If you need help or want to discuss something directly, we have a IRC located at freenode.net #wikipedia-en-afc (Webchat: https://webchat.freenode.net/?channels=wikipedia-en-afc ).
