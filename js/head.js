// Author: jonathanong
// https://github.com/component/emitter


function Emitter(obj) {
    if (obj) return mixin(obj);
}


function mixin(obj) {
    for (var key in Emitter.prototype) {
        obj[key] = Emitter.prototype[key];
    }
    return obj;
}

var EVENT_SEPARATOR = " ";

Emitter.prototype.on =
    Emitter.prototype.addEventListener = function(event, fn) {
        event = event.push ? event : event.split(EVENT_SEPARATOR);
        for (var i = 0, len = event.length; i < len; i++) {
            this._addOneEventListener(event[i], fn);
        }
    };

Emitter.prototype._addOneEventListener = function(event, fn) {
    this._callbacks = this._callbacks || {};
    (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
    return this;
};

Emitter.prototype.once = function(event, fn) {
    function on() {
        this.off(event, on);
        fn.apply(this, arguments);
    }

    on.fn = fn;
    this.on(event, on);
    return this;
};

Emitter.prototype.off =
    Emitter.prototype.removeListener =
    Emitter.prototype.removeAllListeners =
    Emitter.prototype.removeEventListener = function(event, fn) {
        if (!this._callbacks) {
            return this;
        }
        // all
        if (0 === arguments.length) {
            this._callbacks = {};
            return this;
        }
        event = event.push ? event : event.split(EVENT_SEPARATOR);
        for (var i = 0, len = event.length; i < len; i++) {
            this._removeOneEventListener(event[i], fn);
        }
        return this;
    };

Emitter.prototype._removeOneEventListener = function(event, fn) {
    this._callbacks = this._callbacks || {};

    // all
    if (0 === arguments.length) {
        this._callbacks = {};
        return this;
    }

    // specific event
    var callbacks = this._callbacks['$' + event];
    if (!callbacks) return this;

    // remove all handlers
    if (1 == arguments.length) {
        delete this._callbacks['$' + event];
        return this;
    }

    // remove specific handler
    var cb;
    for (var i = 0; i < callbacks.length; i++) {
        cb = callbacks[i];
        if (cb === fn || cb.fn === fn) {
            callbacks.splice(i, 1);
            break;
        }
    }

    // Remove event specific arrays for event types that no
    // one is subscribed for to avoid memory leak.
    if (callbacks.length === 0) {
        delete this._callbacks['$' + event];
    }

    return this;
};

Emitter.prototype.emit = function(event) {
    this._callbacks = this._callbacks || {};
    var args = [].slice.call(arguments, 1),
        callbacks = this._callbacks['$' + event];

    if (callbacks) {
        callbacks = callbacks.slice(0);
        for (var i = 0, len = callbacks.length; i < len; ++i) {
            callbacks[i].apply(this, args);
        }
    }

    return this;
};

Emitter.prototype.listeners = function(event) {
    this._callbacks = this._callbacks || {};
    return this._callbacks['$' + event] || [];
};

Emitter.prototype.hasListeners = function(event) {
    return !!this.listeners(event).length;
};


/* ********************************************************* */


(function(window) {

	function ModulesMediator() {
		Emitter(this);
	}

	window.modulesMediator = new ModulesMediator();

})(window);

/* ********************************************************* */


(function() {

	var _columns = {},

		HTML = document.documentElement,
		devicePixelRatio = (typeof localStorage.pixelRatio != "undefined" && localStorage.pixelRatio === "true") ? window.devicePixelRatio : 1,
		viewportWidth, disable4columns = true;

	_columns.oldColumnsQuantity = 0;
	_columns.newColumnsQuantity = 0;

	_columns.containers = {
		1: {
			HTMLcontainer: 'showContainer1',
			placesContainer: '.container1'
		},
		2: {
			HTMLcontainer: 'showContainer2',
			placesContainer: '.container2'
		},
		3: {
			HTMLcontainer: 'showContainer3',
			placesContainer: '.container3'
		},
		4: {
			HTMLcontainer: 'showContainer4',
			placesContainer: '.container4'
		}
	};

	function hideColumns() {

		var oldClass = _columns.containers[_columns.oldColumnsQuantity].HTMLcontainer;

		// Based on "Change an element's class with JavaScript": http://stackoverflow.com/a/196038
		var regExp = new RegExp('(?:^|\\s)' + oldClass + '(?!\\S)', 'g');
		HTML.className = HTML.className.replace(regExp, '');

	}
	modulesMediator.on('columns.hideColumns', hideColumns);

	function showColumns() {

		var newClass = _columns.containers[_columns.newColumnsQuantity].HTMLcontainer;

		HTML.className += ' ' + newClass;

		_columns.oldColumnsQuantity = _columns.newColumnsQuantity;

	}
	modulesMediator.on('columns.showColumns', showColumns);


	function detectWidth() {

		viewportWidth = (HTML.clientWidth || document.getElementsByTagName('body')[0].clientWidth) * devicePixelRatio;

		if (viewportWidth > 1300) {

			_columns.newColumnsQuantity = 4;

			if (disable4columns) _columns.newColumnsQuantity = 3;

			if (_columns.newColumnsQuantity != _columns.oldColumnsQuantity) {

				if (!disable4columns && _columns.oldColumnsQuantity === 0) showColumns();

				modulesMediator.emit('columns.widthChanged');
			}

		} else if (viewportWidth >= 1060 && viewportWidth <= 1300) {

			_columns.newColumnsQuantity = 3;
			if (_columns.newColumnsQuantity != _columns.oldColumnsQuantity) {
				modulesMediator.emit('columns.widthChanged');
			}

		} else if (viewportWidth >= 740 && viewportWidth < 1060) {

			_columns.newColumnsQuantity = 2;
			if (_columns.newColumnsQuantity != _columns.oldColumnsQuantity) {
				modulesMediator.emit('columns.widthChanged');
			}
		} else if (viewportWidth < 740) {

			_columns.newColumnsQuantity = 1;
			if (_columns.newColumnsQuantity != _columns.oldColumnsQuantity) {
				modulesMediator.emit('columns.widthChanged');
			}
		}

	}

	if (window.addEventListener) {
		window.addEventListener("resize", detectWidth, false);
	} else if (window.attachEvent) {
		window.attachEvent("onresize", detectWidth);
	} else {
		window.onresize = detectWidth;
	}

	detectWidth();

	modulesMediator.columns = _columns;

})();