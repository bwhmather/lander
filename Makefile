BLENDER ?= blender
CONVERT ?= gm convert

MODEL_SOURCES := $(wildcard data/*.blend)
MODELS := $(patsubst data/%.blend,data/%.js,$(MODEL_SOURCES))

TEXTURE_SOURCES := $(wildcard data/*.xcf)
TEXTURES := $(patsubst data/%.xcf,data/%.png,$(TEXTURE_SOURCES))

.PHONY: all
all: $(MODELS) $(TEXTURES)

$(MODELS) : %.js : %.blend
	$(BLENDER) -b $< -P scripts/export-js.blender.py -- $@

$(TEXTURES) : %.png : %.xcf
	$(CONVERT) -flatten $< $@

clean:
	rm -f $(MODELS)
	rm -f $(TEXTURES)
