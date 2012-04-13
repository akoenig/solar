/*
 * solar
 *
 * Licensed under the MIT:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright (c) 2012, André König (andre.koenig -[at]- gmail [*dot*] com)
 *
 */
"use strict";

var events = require('events'),
    IO = require('./io')();

function Solar(pathToDatabase) {
	var that = this;

	events.EventEmitter.call(this);

	that.database = pathToDatabase;
	that.docs = [];

	IO.exists(that.database, function (YES) {
		if (YES) {
			IO.read(that.database, function (error, docs) {
				if (error) {
					console.log('Error while trying to open the database: ' + error.code);
					return;
				}

				that.docs = docs;

				that.emit('loaded');
			});
		} else {
			that.emit('loaded');
		}
	});

	that.save = function (callback) {
		IO.write(that.docs).to(that.database).andThenCall(callback);
	};
}

Solar.super_ = events.EventEmitter;
Solar.prototype = Object.create(events.EventEmitter.prototype, {
    constructor: {
        value: Solar,
        enumerable: false
    }
});

Solar.prototype.forEach = function (callback) {
	var that = this;

	that.docs.forEach(function (doc) {
		var key,
		    name;

		for (name in doc) {
		    if (doc.hasOwnProperty(name)) {
		        key = name;
		        break;
		    }
		}

		callback(key, doc[key]);
	});
};

Solar.prototype.get = function (key) {
	var that = this,
	    value;

	that.docs.forEach(function (doc) {
		var content = doc[key];

		if (content) {
			value = content;

			return false;
		}
	});

	return value;
};

Solar.prototype.set = function (key, value, callback) {
	var that = this,
	    doc = {},
	    exists = false,
	    index = 0;

	doc[key] = value;

	that.docs.forEach(function (currentDoc) {
		if (currentDoc[key]) {
			that.docs.splice(index, 1, doc);

			exists = true;

			return false;
		}

		index = index + 1;
	});

	if (!exists) {
		that.docs.push(doc);
	}

	that.save(callback);
};

Solar.prototype.rm = function (key, callback) {
	var that = this,
	    index = 0;

	that.docs.forEach(function (doc) {
		if (doc[key]) {
			that.docs.splice(index, 1);

			return false;
		}

		index = index + 1;
	});

	that.save(callback);
};

module.exports = Solar;