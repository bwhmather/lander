BLENDER ?= blender
CONVERT ?= gm convert

MODEL_SOURCES := $(wildcard data/*.blend)
MODELS := $(patsubst data/%.blend,build/%.obj,$(MODEL_SOURCES))

TEXTURE_SOURCES := $(wildcard data/*.xcf)
TEXTURES := $(patsubst data/%.xcf,build/%.png,$(TEXTURE_SOURCES))

DIRS := build

.PHONY: all
all: $(MODELS) $(TEXTURES) $(DIRS)

$(MODELS) : build/%.obj : data/%.blend build
	$(BLENDER) -b $< -P scripts/export-obj.blender.py -- $@

$(TEXTURES) : build/%.png : data/%.xcf build
	$(CONVERT) -flatten $< $@

$(DIRS) :
	mkdir -p $@

clean:
	rm -rf build
