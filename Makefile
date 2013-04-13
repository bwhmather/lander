all: data/lander.js data/lander.png

data/lander.js: data/lander.blend
	blender -b data/lander.blend -P scripts/export-js.blender.py -- data/lander.js

data/lander.png: data/lander.xcf
	gm convert -flatten data/lander.xcf data/lander.png

