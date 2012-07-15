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

var fs = require('fs'),
    path = require('path');

module.exports = function () {
	var DEFAULT_ENCODING = 'utf-8',
	    DEFAULT_LD = '\n',
	    SPLITTER = '$';

	return {
		exists : function (pathToDatabase, callback) {
			fs.exists || (fs.exists = path.exists);

			fs.exists(pathToDatabase, callback);
		},
		read : function (pathToDatabase, callback) {
			var docs = [];

			fs.readFile(pathToDatabase, DEFAULT_ENCODING, function (error, data) {
				if (!error) {
					data.split(DEFAULT_LD).forEach(function (line) {

						// 0 = key
						// 1 = value
						line = line.split(SPLITTER);

						var doc = {},
						    key = line[0],
						    value = line[1];

						if (key && value) {
							doc[key] = JSON.parse(value);
							docs.push(doc);
						}
					});
				}

				callback(error, docs);
			});
		},
		write : function (docs) {
			return {
				to : function (database) {
					return {
						andThenCall : function (callback) {
							var content = "";

							docs.forEach(function (doc) {
								var key,
								    name;

								for (name in doc) {
								    if (doc.hasOwnProperty(name)) {
								        key = name;
								        break;
								    }
								}

								content = content + (key + SPLITTER + JSON.stringify(doc[key]) + DEFAULT_LD);
							});

							fs.writeFile(database, content, DEFAULT_ENCODING, function (err) {
								if (err) throw err;

								callback();
							});
						}
					};
				}
			};
		}
	};
}