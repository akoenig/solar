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
	    SPLITTER = ' ';

	return {
		exists : function (pathToDatabase, callback) {
			path.exists(pathToDatabase, callback);
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
							console.log(value);
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
							var stream = fs.createWriteStream(database, {
								encoding: DEFAULT_ENCODING,
								flags: 'w'
							});

							stream.once('open', function () {
								docs.forEach(function (doc) {
									var key,
									    name;

									for (name in doc) {
									    if (doc.hasOwnProperty(name)) {
									        key = name;
									        break;
									    }
									}

									stream.write(key + SPLITTER + JSON.stringify(doc[key]) + DEFAULT_LD);
								});

								stream.end();

								if (typeof callback === 'function') {
									callback();
								}
							});
						}
					};
				}
			};
		}
	};
};