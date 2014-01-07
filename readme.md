# Amazing64
*Finally, the usable base64 image (and everything else) encoder*

Amazing64 is hosted at [jabher.github.io/amazing64](http://jabher.github.io/amazing64/)

It is based upon the all the experience of work with base64 images in CSS I had.
I've tried to implement - finally - not a proof of concept, but working tool that can be really used by web developers.

It works fast and smooth - as it works fully on client and does not interact with any backend. Actually, it does not has any backend at all!

Amazing64 has following features:

+ File Drag-n-Drop. Actually, it's the only way to encode! Just throw your files and you've got them right inside.
+ Multiple files Drag-n-Drop. You thought you'll have to throw them one-by-one? No way!
+ Uniquesation of dropped files. Yes, there's only one copy of this file existing here encoded.
+ File data preview. Amazing64 stores filename, shows file size and even highlights it with red if it's more than 32kb, that is supported by most of browsers.
+ Image previews: if you dropped an image, you need to see it, right? To see it even closer, just place your mouse over it.
+ More image tricks: Amazing64 also shows you image width and height and even its dominant color (with help of modified and extended [RBGaster](https://github.com/briangonzalez/rgbaster.js))
+ Record manipulation: You can easily remove unnecessary records with a cross on a right side
+ AND YOU KNOW WHAT'S SHE BEST DAMN AMAZING THING IN IT? No, you don't know it yet. I'll tell you. Amazing64 stores every file dropped in localStorage. So when you refresh the pare, you will not lose stored images (well, at least first 2.5 Mb of them).

So. Finally. The first base64 encoder that is developed to aid web developer.
Enjoy it and feel free to extend it. Who knows, maybe you prefer to store fonts or videos in base64, and you are able to make custom preview? I'll be glad to see it.
