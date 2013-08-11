SOURCES = *.scss
SASS := sass

$(SOURCES): %.scss: %.css
	$(SASS) $@ $<

all: $(SOURCES)

# sass -watch staging.scss:staging.css
