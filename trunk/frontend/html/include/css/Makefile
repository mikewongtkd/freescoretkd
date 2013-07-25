SOURCES = *.scss
SASS := sass

$(SOURCES): %.scss: %.css
	$(SASS) $@ $<

all: *.css
