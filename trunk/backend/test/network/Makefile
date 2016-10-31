.PHONY: all
GLOBAL_INSTALL=/usr/local/lib/node_modules
LOCAL_WEB_INSTALL=../../../frontend/html/include/js/forms/worldclass
NODE_PATH=$(GLOBAL_INSTALL):$(LOCAL_WEB_INSTALL)

all:
	export NODE_PATH=$(NODE_PATH) && \
	./worldclass-ws.js
