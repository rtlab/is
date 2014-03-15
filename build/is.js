/// <reference path="../vendor/underscore.d.ts" />

var StringsList = (function () {
	function StringsList () {
	}

	StringsList.toArray = function ( strings ) {
		var result = [];
		for ( var i = 0, n = strings.length; i < n; ++i ) {
			result.push( strings.item( i ) );
		}
		return result;
	};
	return StringsList;
})();

var IndexedStorage;
(function ( IndexedStorage ) {
	(function ( Query ) {
		function keyName ( fields, isUnique ) {
			if ( typeof isUnique === "undefined" ) {
				isUnique = false;
			}
			return (isUnique ? 'ux_' : 'ix_') + fields.join( '.' );
		}

		Query.keyName = keyName;

		function filter ( value, rangeFrom, rangeTo, openFrom, openTo ) {
			return (_.isUndefined( rangeFrom ) || rangeFrom === null || value > rangeFrom || (openFrom && (value == rangeFrom))) && (_.isUndefined( rangeTo ) || rangeTo === null || value < rangeTo || (openTo && (value == rangeTo)));
		}

		Query.filter = filter;
	})( IndexedStorage.Query || (IndexedStorage.Query = {}) );
	var Query = IndexedStorage.Query;
})( IndexedStorage || (IndexedStorage = {}) );
var IndexedStorage;
(function ( IndexedStorage ) {
	(function ( MetaData ) {
		(function ( LocalStorage ) {
			var Names = (function () {
				function Names () {
				}

				Names.table = function ( database, table ) {
					return 'STORAGE.SQL[%db].TABLES[%t]'.replace( '%db', database ).replace( '%t', table );
				};

				Names.version = function ( database ) {
					return 'STORAGE.SQL[%db].VERSION'.replace( '%db', database );
				};

				Names.structure = function ( database, table ) {
					return 'STORAGE.SQL[%db].STRUCTURE[%t]'.replace( '%db', database ).replace( '%t', table );
				};
				return Names;
			})();

			var Request = (function () {
				function Request () {
				}

				Request.getMeta = function ( param, def ) {
					if ( typeof def === "undefined" ) {
						def = null;
					}
					var str = localStorage.getItem( param );
					return str ? JSON.parse( str ) : def;
				};

				Request.setMeta = function ( param, value ) {
					localStorage.setItem( param, JSON.stringify( value ) );
				};

				Request.getDatabaseCurrentVersion = function ( database ) {
					return Request.getMeta( Names.version( database ), 0 );
				};

				Request.setDatabaseCurrentVersion = function ( database, version ) {
					Request.setMeta( Names.version( database ), version );
				};

				Request.getDatabaseTableChangeSets = function ( database, table ) {
					return Request.getMeta( Names.table( database, table ), [] );
				};

				Request.setDatabaseTableChangeSet = function ( database, table, changes ) {
					Request.setMeta( Names.table( database, table ), changes );
				};

				Request.getDatabaseTableStructure = function ( database, table ) {
					return Request.getMeta( Names.structure( database, table ), {} );
				};

				Request.setDatabaseTableStructure = function ( database, table, structure ) {
					Request.setMeta( Names.structure( database, table ), structure );
				};
				return Request;
			})();
			LocalStorage.Request = Request;
		})( MetaData.LocalStorage || (MetaData.LocalStorage = {}) );
		var LocalStorage = MetaData.LocalStorage;
	})( IndexedStorage.MetaData || (IndexedStorage.MetaData = {}) );
	var MetaData = IndexedStorage.MetaData;
})( IndexedStorage || (IndexedStorage = {}) );
/// <reference path="./localstorage.ts" />
var IndexedStorage;
(function ( IndexedStorage ) {
	(function ( MetaData ) {
		var Request = (function () {
			function Request () {
			}

			Request.getMeta = function ( param, def ) {
				return IndexedStorage.MetaData.LocalStorage.Request.getMeta( param, def );
			};

			Request.setMeta = function ( param, value ) {
				IndexedStorage.MetaData.LocalStorage.Request.setMeta( param, value );
			};

			Request.getDatabaseCurrentVersion = function ( database ) {
				return IndexedStorage.MetaData.LocalStorage.Request.getDatabaseCurrentVersion( database );
			};

			Request.setDatabaseCurrentVersion = function ( database, version ) {
				IndexedStorage.MetaData.LocalStorage.Request.setDatabaseCurrentVersion( database, version );
			};

			Request.getDatabaseTableChangeSets = function ( database, table ) {
				return IndexedStorage.MetaData.LocalStorage.Request.getDatabaseTableChangeSets( database, table );
			};

			Request.setDatabaseTableChangeSet = function ( database, table, changes ) {
				IndexedStorage.MetaData.LocalStorage.Request.setDatabaseTableChangeSet( database, table, changes );
			};

			Request.getDatabaseTableStructure = function ( database, table ) {
				return IndexedStorage.MetaData.LocalStorage.Request.getDatabaseTableStructure( database, table );
			};

			Request.setDatabaseTableStructure = function ( database, table, structure ) {
				IndexedStorage.MetaData.LocalStorage.Request.setDatabaseTableStructure( database, table, structure );
			};
			return Request;
		})();
		MetaData.Request = Request;
	})( IndexedStorage.MetaData || (IndexedStorage.MetaData = {}) );
	var MetaData = IndexedStorage.MetaData;
})( IndexedStorage || (IndexedStorage = {}) );
/// <reference path="../../vendor/when.d.ts" />
// <reference path="./query/transaction.ts" />
var IndexedStorage;
(function ( IndexedStorage ) {
	(function ( Promises ) {
		var DeferWhen = (function () {
			function DeferWhen () {
				this.defer = null;
				this.promise = null;
				this.defer = when.defer();
			}

			DeferWhen.prototype.notify = function ( update ) {
				this.defer.notify( update );
			};

			DeferWhen.prototype.getPromise = function () {
				if ( this.promise === null ) {
					this.promise = new PromiseWhen( this.defer.promise );
				}
				return this.promise;
			};

			DeferWhen.prototype.reject = function ( reason ) {
				this.defer.reject( reason );
			};

			DeferWhen.prototype.resolve = function ( value ) {
				this.defer.resolve( value );
			};
			return DeferWhen;
		})();
		Promises.DeferWhen = DeferWhen;

		var PromiseWhen = (function () {
			function PromiseWhen ( promise ) {
				this.promise = promise;
			}

			PromiseWhen.prototype.then = function ( onFulfilled, onRejected, onProgress ) {
				this.promise.then( onFulfilled, onRejected, onProgress );
				return this;
			};
			return PromiseWhen;
		})();
		Promises.PromiseWhen = PromiseWhen;

		function whenDatabaseReady () {
			return new DeferWhen();
		}

		Promises.whenDatabaseReady = whenDatabaseReady;

		function whenRequestReady () {
			return new DeferWhen();
		}

		Promises.whenRequestReady = whenRequestReady;

		function whenRequestComplete () {
			return new DeferWhen();
		}

		Promises.whenRequestComplete = whenRequestComplete;

		function whenTransactionComplete () {
			return new DeferWhen();
		}

		Promises.whenTransactionComplete = whenTransactionComplete;

		function all ( promisesOrValues ) {
			return new PromiseWhen( when.all( promisesOrValues ) );
		}

		Promises.all = all;
	})( IndexedStorage.Promises || (IndexedStorage.Promises = {}) );
	var Promises = IndexedStorage.Promises;
})( IndexedStorage || (IndexedStorage = {}) );
/// <reference path="../vendor/underscore.d.ts" />
/// <reference path="./promises/promises.ts" />
/// <reference path="./common.ts" />
var IndexedStorage;
(function ( IndexedStorage ) {
	(function ( Table ) {
		var Structure = (function () {
			function Structure () {
				// string:keyPath, '':autoIncrement, false/null:onsave
				this.key = '';
				this.indexes = [];
				this.uniques = [];
				this.name = '';
				this.changeSets = null;
				this.structure = null;
			}

			Structure.factory = function ( name, uniques, indexes, key ) {
				if ( typeof uniques === "undefined" ) {
					uniques = [];
				}
				if ( typeof indexes === "undefined" ) {
					indexes = [];
				}
				if ( typeof key === "undefined" ) {
					key = '';
				}
				var structure = new Structure();
				structure.name = name;
				structure.uniques = uniques;
				structure.indexes = indexes;
				structure.key = key;
				return structure;
			};

			Structure.prototype.changes = function () {
				if ( this.changeSets === null ) {
					this.changeSets = Changes.factory();
				}
				return this.changeSets;
			};

			Structure.prototype.getStructure = function () {
				if ( this.structure === null ) {
					var struct = { ux : [], ix : [], key : this.key };
					_.each( { ix : this.indexes, ux : this.uniques }, function ( structure, param ) {
						struct[param] = _.map( structure, function ( value ) {
							return _.isArray( value ) ? value : [value];
						} );
					} );
					this.structure = struct;
				}
				return this.structure;
			};

			Structure.prototype.structureId = function () {
				return JSON.stringify( { i : this.indexes, u : this.uniques } );
			};

			Structure.prototype.getName = function () {
				return this.name;
			};
			return Structure;
		})();
		Table.Structure = Structure;

		var Changes = (function () {
			function Changes () {
				this.items = [];
			}

			Changes.factory = function () {
				return new Changes();
			};

			Changes.prototype.list = function () {
				return this.items;
			};

			Changes.prototype.add = function ( name, cb ) {
				this.items.push( { name : name, callback : cb } );
				return this;
			};
			return Changes;
		})();
		Table.Changes = Changes;
	})( IndexedStorage.Table || (IndexedStorage.Table = {}) );
	var Table = IndexedStorage.Table;
})( IndexedStorage || (IndexedStorage = {}) );
/// <reference path="../../vendor/underscore.d.ts" />
/// <reference path="../common.ts" />
/// <reference path="./metadata.ts" />
/// <reference path="../table.ts" />
var IndexedStorage;
(function ( IndexedStorage ) {
	(function ( Sync ) {
		var StrucureHash = (function () {
			function StrucureHash () {
			}

			StrucureHash.get = function ( structure ) {
				return JSON.stringify( { i : structure.ix, u : structure.ux } );
			};
			return StrucureHash;
		})();

		var Processor = (function () {
			function Processor ( database ) {
				this.database = database;
				this.changes = {};
				this.structures = {};
				this.hashes = {};
			}

			Processor.factory = function ( database ) {
				if ( !Processor.instances[database] ) {
					Processor.instances[database] = new Processor( database );
				}
				return Processor.instances[database];
			};

			Processor.prototype.add = function ( table ) {
				this.changes[table.getName()] = table.changes().list();
				this.structures[table.getName()] = table.getStructure();
				this.hashes[table.getName()] = StrucureHash.get( this.structures[table.getName()] );
			};

			Processor.prototype.getDBVersion = function () {
				var increment = 0;
				try {
					_.each( this.hashes, function ( structure, table ) {
						var current = IndexedStorage.MetaData.Request.getDatabaseTableStructure( this['database'], table );
						if ( current !== structure ) {
							throw new Error();
						}
					}, this );

					_.each( this.changes, function ( records, table ) {
						var changes = IndexedStorage.MetaData.Request.getDatabaseTableChangeSets( this['database'], table );
						if ( changes.length >= records.length ) {
							_.each( records, function ( record ) {
								if ( changes.indexOf( record.name ) < 0 ) {
									throw new Error();
								}
							} );
						} else {
							throw new Error();
						}
					}, this );
				} catch ( e ) {
					++increment;
				}
				return Math.max( 1, IndexedStorage.MetaData.Request.getDatabaseCurrentVersion( this.database ) + increment );
			};

			Processor.prototype.update = function ( request, oldVersion, newVersion ) {
				console.log( 'UPDATE' );

				_.each( this.structures, function ( structure, table ) {
					var current = IndexedStorage.MetaData.Request.getDatabaseTableStructure( this['database'], table );
					if ( current !== this['hashes'][table] ) {
						this.updateStructure( request, table, structure );
						IndexedStorage.MetaData.Request.setDatabaseTableStructure( this['database'], table, this['hashes'][table] );
					}
				}, this );

				_.each( this.changes, function ( records, table ) {
					var changes = IndexedStorage.MetaData.Request.getDatabaseTableChangeSets( this['database'], table );
					_.each( records, function ( record ) {
						if ( changes.indexOf( record.name ) < 0 ) {
							if ( false !== record.callback( request, oldVersion, newVersion ) ) {
								changes.push( record.name );
							}
						}
					} );
					IndexedStorage.MetaData.Request.setDatabaseTableChangeSet( this['database'], table, changes );
				}, this );

				IndexedStorage.MetaData.Request.setDatabaseCurrentVersion( this.database, newVersion );
			};

			Processor.prototype.updateStructure = function ( request, table, structure ) {
				console.log( request, table, structure );

				var store = null;
				if ( !request.result.objectStoreNames.contains( table ) ) {
					var config = {};

					if ( structure.key && _.isString( structure.key ) ) {
						config['keyPath'] = structure.key;
					}
					if ( !config['keyPath'] && structure.key ) {
						config['autoIncrement'] = true;
					}
					store = request.result.createObjectStore( table, config );
				} else {
					store = request.transaction.objectStore( table );
				}

				var indexes = StringsList.toArray( store.indexNames );
				_.each( [
					[structure.ux, true],
					[structure.ix, false]
				], function ( indexParams ) {
					_.each( indexParams[0], function ( keyFields ) {
						var keyName = IndexedStorage.Query.keyName( keyFields, indexParams[1] );
						var indexPos = indexes.indexOf( keyName );
						if ( indexPos < 0 ) {
							store.createIndex( keyName, keyFields.length === 1 ? keyFields[0] : keyFields, { unique : indexParams[1] } );
						} else {
							delete indexes[indexPos];
						}
					} );
				} );

				if ( indexes.length > 0 ) {
					_.each( indexes, function ( index ) {
						store.deleteIndex( index );
					} );
				}
			};
			Processor.instances = {};
			return Processor;
		})();
		Sync.Processor = Processor;
	})( IndexedStorage.Sync || (IndexedStorage.Sync = {}) );
	var Sync = IndexedStorage.Sync;
})( IndexedStorage || (IndexedStorage = {}) );
var IndexedStorage;
(function ( IndexedStorage ) {
	(function ( Query ) {
		var Record = (function () {
			function Record ( operation, id, value ) {
				this.operation = operation;
				this.id = id;
				this.value = value;
				this._success = false;
				this._error = null;
			}

			Record.insert = function ( value, id ) {
				return new Record( 'insert', id, value );
			};

			Record.remove = function ( id ) {
				return new Record( 'remove', id, null );
			};

			Record.select = function ( id ) {
				return new Record( 'select', id, null );
			};

			Record.load = function ( id, value ) {
				return new Record( 'select', id, value );
			};

			Record.update = function ( value, id ) {
				return new Record( 'update', id, value );
			};

			Record.prototype.selected = function ( value, id ) {
				if ( typeof id === "undefined" ) {
					id = null;
				}
				this.id = id;
				this._success = true;
				this.value = value;
				this._error = null;
				return this;
			};

			Record.prototype.inserted = function ( id ) {
				if ( id !== null ) {
					this.id = id;
				}
				this._success = true;
				this._error = null;
				return this;
			};

			Record.prototype.completed = function () {
				this._error = null;
				this._success = true;
				return this;
			};

			Record.prototype.failed = function () {
				this._error = null;
				this._success = false;
				return this;
			};

			Record.prototype.error = function ( e ) {
				this._success = false;
				this._error = e;
				return this;
			};

			Record.prototype.key = function () {
				return this.id;
			};

			Record.prototype.get = function () {
				return this.value;
			};

			Record.prototype.getOperation = function () {
				return this.operation;
			};
			return Record;
		})();
		Query.Record = Record;
	})( IndexedStorage.Query || (IndexedStorage.Query = {}) );
	var Query = IndexedStorage.Query;
})( IndexedStorage || (IndexedStorage = {}) );
/// <reference path="../../vendor/underscore.d.ts" />
/// <reference path="../promises/promises.ts" />
/// <reference path="../common.ts" />
/// <reference path="../common.ts" />
/// <reference path="./record.ts" />
var IndexedStorage;
(function ( IndexedStorage ) {
	(function ( Query ) {
		var Transaction = (function () {
			function Transaction ( database, tables, readwrite ) {
				this.database = database;
				this.tables = tables;
				this.readwrite = readwrite;
				this.current = null;
				this.opened = {};
				this.operations = [];
				this.records = [];
				this.callbacksComplete = [];
				this.callbacksFail = [];
			}

			Transaction.factory = function ( database, tables, readwrite ) {
				if ( typeof readwrite === "undefined" ) {
					readwrite = true;
				}
				return new Transaction( database, tables, readwrite );
			};

			Transaction.prototype.createTransaction = function () {
				var transaction = this.database.transaction( this.tables, this.readwrite ? 'readwrite' : 'read' );
				transaction.oncomplete = function ( event ) {
				};
				transaction.onabort = function ( event ) {
				};
				transaction.onerror = function ( event ) {
				};
				return transaction;
			};

			Transaction.prototype.open = function ( table ) {
				try {
					this.current || (this.current = this.createTransaction());
					if ( !this.opened[table] ) {
						this.opened[table] = this.current.objectStore( table );
					}
					return this.opened[table];
				} catch ( e ) {
					return null;
				}
			};

			Transaction.prototype.recover = function ( e ) {
				var isRecoverable = false;
				switch ( e.name ) {
					case 'TransactionInactiveError':
						isRecoverable = true;
						break;

					case 'ReadOnlyError':
						if ( !this.readwrite ) {
							isRecoverable = true;
							this.readwrite = true;
						}
						break;
				}
				if ( isRecoverable ) {
					this.current = null;
					this.opened = {};
				}
				return isRecoverable;
			};

			Transaction.prototype.request = function ( table, record, callback ) {
				var repeatCounter = 3;
				var defer = IndexedStorage.Promises.whenTransactionComplete();
				do {
					try {
						callback( this.open( table ), record, defer );
						this.operations.push( defer.getPromise() );
						repeatCounter = 0;
					} catch ( e ) {
						if ( !this.recover( e ) ) {
							record.error( e );
						} else if ( repeatCounter > 1 ) {
							continue;
						}
					}
					this.records.push( record );
				} while ( --repeatCounter > 0 );
			};

			Transaction.prototype.select = function ( table, index, range ) {
				if ( typeof index === "undefined" ) {
					index = null;
				}
				if ( typeof range === "undefined" ) {
					range = null;
				}
				console.log( 'tr::select', table, index, range );

				var repeatCounter = 3;
				var that = this;
				var defer = IndexedStorage.Promises.whenTransactionComplete();
				do {
					try {
						var request = index ? this.open( table ).index( index ).openCursor( range ) : this.open( table ).openCursor();
						request.onsuccess = function ( e ) {
							var cursor = e.target.result;
							if ( cursor ) {
								that.records.push( IndexedStorage.Query.Record.load( cursor.primaryKey, cursor.value ) );
								cursor.continue();
							} else {
								defer.resolve();
							}
						};
						request.onerror = function ( e ) {
							defer.resolve();
						};
						this.operations.push( defer.getPromise() );
					} catch ( e ) {
						if ( this.recover( e ) ) {
							--repeatCounter;
							continue;
						}
					}
					repeatCounter = 0;
				} while ( repeatCounter > 0 );
			};

			Transaction.prototype.add = function ( table, record ) {
				this.request( table, record, function ( store, record, defer ) {
					var request = store.add( record.get(), record.key() );
					request.onsuccess = function ( event ) {
						console.log( 'success' );
						record.inserted( event.target.result );
						defer.resolve();
					};
					request.onerror = function () {
						console.log( 'fail' );
						defer.resolve( [record.failed()] );
					};
				} );
			};

			Transaction.prototype.put = function ( table, record ) {
				this.request( table, record, function ( store, record, defer ) {
					var request = store.put( record.get(), record.key() );
					request.onsuccess = function ( event ) {
						defer.resolve( record.inserted( event.target.result ) );
					};
					request.onerror = function () {
						defer.resolve( record.failed() );
					};
				} );
			};

			Transaction.prototype.remove = function ( table, record ) {
				this.request( table, record, function ( store, record, defer ) {
					var request = store.delete( record.key() );
					request.onsuccess = function ( event ) {
						defer.resolve( record.completed() );
					};
					request.onerror = function () {
						defer.resolve( record.failed() );
					};
				} );
			};

			Transaction.prototype.get = function ( table, key ) {
				this.request( table, IndexedStorage.Query.Record.select( key ), function ( store, record, defer ) {
					var request = store.get( record.key() );
					request.onsuccess = function ( event ) {
						console.log( 'SELECTED', event.target.result );
						defer.resolve( record.selected( event.target.result ) );
					};
					request.onerror = function () {
						defer.resolve( record.failed() );
					};
				} );
			};

			Transaction.prototype.range = function ( table, index, valueFrom, valueTo, openFrom, openTo ) {
				if ( valueFrom !== null ) {
					var range = (valueTo !== null ? IDBKeyRange.bound( valueFrom, valueTo, !!openFrom, !!openTo ) : IDBKeyRange.upperBound( valueFrom, !!openFrom ));
				} else {
					var range = (valueTo !== null ? IDBKeyRange.lowerBound( valueTo, !!openTo ) : null);
				}
				this.select( table, index, range );
			};

			Transaction.prototype.equal = function ( table, index, value ) {
				this.select( table, index, IDBKeyRange.only( value ) );
			};

			Transaction.prototype.all = function ( table ) {
				this.select( table );
			};

			Transaction.prototype.clear = function ( table ) {
			};

			Transaction.prototype.count = function ( table ) {
			};

			Transaction.prototype.end = function () {
				var that = this;
				IndexedStorage.Promises.all( this.operations ).then( function () {
					_.each( that.callbacksComplete, function ( callback ) {
						console.log( callback, that.records );
						callback( that.records );
					} );
				} );
			};

			Transaction.prototype.complete = function ( callback ) {
				this.callbacksComplete.push( callback );
				return this;
			};

			Transaction.prototype.fail = function ( callback ) {
				this.callbacksFail.push( callback );
				return this;
			};
			return Transaction;
		})();
		Query.Transaction = Transaction;
	})( IndexedStorage.Query || (IndexedStorage.Query = {}) );
	var Query = IndexedStorage.Query;
})( IndexedStorage || (IndexedStorage = {}) );
var IndexedStorage;
(function ( IndexedStorage ) {
	(function ( Query ) {
		var Exception = (function () {
			function Exception ( name, message ) {
				if ( typeof message === "undefined" ) {
					message = '';
				}
				this.name = name;
				this.message = message;
			}

			Exception.noMoreQueries = function () {
				return new Exception( 'NoMoreQueries', 'No more queries after each or similar functions' );
			};
			return Exception;
		})();
		Query.Exception = Exception;
	})( IndexedStorage.Query || (IndexedStorage.Query = {}) );
	var Query = IndexedStorage.Query;
})( IndexedStorage || (IndexedStorage = {}) );
/// <reference path="./exceptions.ts" />
/// <reference path="./record.ts" />
/// <reference path="../../vendor/underscore.d.ts" />
/// <reference path="../promises/promises.ts" />
/// <reference path="../common.ts" />
/// <reference path="../table.ts" />
/// <reference path="./record.ts" />
/// <reference path="./transaction.ts" />
/// <reference path="./callbacks.ts" />
/// <reference path="./exceptions.ts" />
var IndexedStorage;
(function ( IndexedStorage ) {
	(function ( Query ) {
		var Base = (function () {
			function Base ( table, whenDBReady ) {
				this.table = table;
				this.whenDBReady = whenDBReady;
				this.objects = [];
				this.request = null;
				this.whenReady = null;
				this.whenComplete = null;
				this.stateEndOfQueries = false;
				this.callbackWarnings = [];
				this.listOfWarnings = [];
				this.listOfCallbacks = { each : [] };
				var that = this;
				this.whenReady = IndexedStorage.Promises.whenRequestReady();
				this.whenComplete = IndexedStorage.Promises.whenRequestComplete();

				whenDBReady.then( function ( database ) {
					var request = IndexedStorage.Query.Transaction.factory( database, [table.getName()] ).complete(function ( records ) {
						that.setTransactionResults( records );
						that.whenComplete.resolve();
					} ).fail( function () {
					} );
					that.whenReady.resolve( request );
				} );
			}

			Base.prototype.setTransactionResults = function ( records ) {
				this.objects = records;
			};

			Base.prototype.warnings = function ( callback ) {
				this.callbackWarnings.push( callback );
				_.each( this.listOfWarnings, function ( e ) {
					callback( e );
				} );
				return this;
			};

			Base.prototype.addWarning = function ( e ) {
				this.listOfWarnings.push( e );
				_.each( this.callbackWarnings, function ( callback ) {
					callback( e );
				} );
			};

			Base.prototype.addCallback = function ( type, callback ) {
				this.listOfCallbacks[type].push( callback );
			};
			return Base;
		})();
		Query.Base = Base;
	})( IndexedStorage.Query || (IndexedStorage.Query = {}) );
	var Query = IndexedStorage.Query;
})( IndexedStorage || (IndexedStorage = {}) );
/// <reference path="../../vendor/underscore.d.ts" />
/// <reference path="../promises/promises.ts" />
/// <reference path="../common.ts" />
/// <reference path="../table.ts" />
/// <reference path="./record.ts" />
/// <reference path="./transaction.ts" />
/// <reference path="./callbacks.ts" />
/// <reference path="./exceptions.ts" />
/// <reference path="./base.ts" />
var __extends = this.__extends || function ( d, b ) {
	for ( var p in b ) if ( b.hasOwnProperty( p ) ) d[p] = b[p];
	function __ () {
		this.constructor = d;
	}

	__.prototype = b.prototype;
	d.prototype = new __();
};
var IndexedStorage;
(function ( IndexedStorage ) {
	(function ( Query ) {
		var KeyType;
		(function ( KeyType ) {
			KeyType[KeyType["primary"] = 0] = "primary";
			KeyType[KeyType["unique"] = 1] = "unique";
			KeyType[KeyType["index"] = 2] = "index";
			KeyType[KeyType["range"] = 3] = "range";
			KeyType[KeyType["none"] = 4] = "none";
		})( KeyType || (KeyType = {}) );

		var Selectable = (function ( _super ) {
			__extends( Selectable, _super );
			function Selectable () {
				_super.apply( this, arguments );
				this.keyValue = null;
				this.fields = {};
				this.customFilters = [];
			}

			/**
			 * Get items by primary key value
			 * @param value
			 * @returns {IndexedStorage.Query.Selectable}
			 */
			Selectable.prototype.key = function ( value ) {
				this.keyValue = [value];
				return this;
			};

			/**
			 * Get items by primary key velues
			 * @param values
			 * @returns {IndexedStorage.Query.Selectable}
			 */
			Selectable.prototype.keys = function ( values ) {
				this.keyValue = values;
				return this;
			};

			/**
			 * field == value
			 * @param field
			 * @param value
			 * @returns {IndexedStorage.Query.Selectable}
			 */
			Selectable.prototype.eq = function ( field, value ) {
				this.where( field, '=', [value] );
				return this;
			};

			/**
			 * field == value[0] || field == value[...]
			 * @param field
			 * @param values
			 * @returns {IndexedStorage.Query.Selectable}
			 */
			Selectable.prototype.inArray = function ( field, values ) {
				this.where( field, '=', values );
				return this;
			};

			/**
			 * field > value
			 * @param field
			 * @param value
			 * @returns {IndexedStorage.Query.Selectable}
			 */
			Selectable.prototype.gt = function ( field, value ) {
				return this.where( field, '>', value );
			};

			/**
			 * field < value
			 * @param field
			 * @param value
			 * @returns {IndexedStorage.Query.Selectable}
			 */
			Selectable.prototype.lt = function ( field, value ) {
				return this.where( field, '<', value );
			};

			/**
			 * field >= value
			 * @param field
			 * @param value
			 * @returns {IndexedStorage.Query.Selectable}
			 */
			Selectable.prototype.gteq = function ( field, value ) {
				return this.where( field, '>=', value );
			};

			/**
			 * field <= value
			 * @param field
			 * @param value
			 * @returns {IndexedStorage.Query.Selectable}
			 */
			Selectable.prototype.lteq = function ( field, value ) {
				return this.where( field, '<=', value );
			};

			Selectable.prototype.custom = function ( callback ) {
				this.customFilters.push( callback );
				return this;
			};

			/**
			 *
			 * @param field
			 * @param op
			 * @param value
			 * @returns {IndexedStorage.Query.Selectable}
			 */
			Selectable.prototype.where = function ( field, op, value ) {
				if ( !this.stateEndOfQueries ) {
					var fieldRange = this.fields[field] || { equal : null, from : undefined, to : undefined, openFrom : false, openTo : false };
					switch ( op ) {
						case '>':
						case '>=':
							if ( !(value < fieldRange.from) ) {
								fieldRange.from = value;
								fieldRange.openFrom = (op === '>=');
							} else if ( value == fieldRange.from ) {
								fieldRange.openFrom = (op === '>=');
							}
							break;

						case '<':
						case '<=':
							if ( !(value > fieldRange.to) ) {
								fieldRange.to = value;
								fieldRange.openTo = (op === '<=');
							} else if ( value == fieldRange.to ) {
								fieldRange.openTo = (op === '<=');
							}
							break;

						case '=':
							fieldRange.equal = value;
							break;
					}
					this.fields[field] = fieldRange;
				} else {
					this.addWarning( IndexedStorage.Query.Exception.noMoreQueries() );
				}
				return this;
			};

			Selectable.prototype.fixRanges = function ( structure ) {
				if ( structure.key && _.isArray( this.keyValue ) && this.keyValue.length > 0 ) {
					var fieldRange = this.fields[structure.key] || { equal : null, from : undefined, to : undefined, openFrom : false, openTo : false };
					if ( _.isArray( fieldRange.equal ) ) {
						fieldRange.equal = this.keyValue;
					}
					this.fields[structure.key] = fieldRange;
				}
				_.each( this.fields, function ( range ) {
					if ( _.isArray( range.equal ) ) {
						range.equal = _.filter( range.equal, function ( value ) {
							return IndexedStorage.Query.filter( value, range.from, range.to, range.openFrom, range.openTo );
						} );
					}
					if ( !range.equal || (_.isArray( range.equal ) && range.equal.length == 0) ) {
						range.equal = null;
					}
					if ( range.equal === null ) {
						if ( range.from === range.to && range.openFrom && range.openTo ) {
							range.equal = [range.from];
						} else if ( range.from > range.to ) {
							throw new Error( '"from" greater then "to"' );
						}
					}
					if ( range.equal !== null ) {
						var rangeMinValue = range.equal[0];
						var rangeMaxValue = range.equal[1];
						if ( range.equal.length > 1 ) {
							_.each( range.equal, function ( value ) {
								if ( value < rangeMinValue ) {
									rangeMinValue = value;
								}
								if ( value > rangeMaxValue ) {
									rangeMaxValue = value;
								}
							} );
						}
						range.from = rangeMinValue;
						range.to = rangeMaxValue;
						range.openFrom = true;
						range.openTo = true;
					}
				} );
				return this.fields;
			};

			Selectable.prototype.getBestKeyToUse = function ( structure, filterRanges ) {
				var keyStats = { type : 4 /* none */, fields : null, values : null };
				do {
					// primary key (  key(value) or keys( [value1, value2])
					if ( this.keyValue !== null ) {
						keyStats.type = 0 /* primary */;
						keyStats.values = this.keyValue;
						if ( structure.key ) {
							keyStats.fields = [structure.key];
						}
						break;
					}

					// eq(primary key,  value) or inArray( primary key, [value1,value2])
					if ( structure.key && this.fields[structure.key].equal !== null ) {
						keyStats.type = 0 /* primary */;
						keyStats.values = this.fields[structure.key].equal;
						break;
					}

					// find by unique index and field === value
					var uxKeys = null;
					var uxKey = _.min( uxKeys = _.filter( this.table.getStructure().ux, function ( fields ) {
						return _.every( fields, function ( field ) {
							return !!(!_.isUndefined( filterRanges[field] ) && filterRanges[field].equal);
						}, this );
					}, this ), function ( fields ) {
						var counter = fields.length;
						_.each( fields, function ( field ) {
							counter *= filterRanges[field].equal.length;
						} );
						return counter;
					}, this );
					if ( uxKey && _.isArray( uxKey ) ) {
						keyStats.type = 1 /* unique */;
						keyStats.fields = uxKey;
						break;
					}

					var keysCanUse = [];
					_.each( [structure.ux, structure.ix], function ( indexGroup, indexType ) {
						_.each( indexGroup, function ( fields ) {
							var hasEqual = fields.length;
							var canUseLessThen = true;
							var canUseMoreThen = true;
							var rangeOpenFrom = null;
							var rangeOpenTo = null;

							_.map( fields, function ( field ) {
								var fieldRange = filterRanges[field];
								if ( !_.isUndefined( fieldRange ) ) {
									hasEqual -= (fieldRange.equal !== null ? 1 : 0);

									if ( rangeOpenFrom === null ) {
										rangeOpenFrom = fieldRange.openFrom;
									}
									if ( rangeOpenTo === null ) {
										rangeOpenTo = fieldRange.openTo;
									}

									canUseLessThen = canUseLessThen && (!!fieldRange.to && fieldRange.openFrom === rangeOpenFrom);
									canUseMoreThen = canUseMoreThen && (!!fieldRange.from && fieldRange.openTo === rangeOpenTo);
								} else {
									canUseLessThen = canUseMoreThen = false;
								}
							} );

							if ( hasEqual === 0 || (canUseMoreThen && canUseLessThen) ) {
								keysCanUse.push( { type : indexType ? (hasEqual === 0 ? 2 /* index */ : 3 /* range */) : 1 /* unique */, fields : fields, values : null } );
							}
						} );
					} );
					if ( keysCanUse.length > 0 ) {
						var bestKey = _.min( keysCanUse, function ( item ) {
							return (item.type === 1 /* unique */ ? 0 : item.fields.length * (item.type === 2 /* index */ ? 1 : 2));
						} );

						if ( bestKey && _.isObject( bestKey ) ) {
							keyStats.type = bestKey.type;
							keyStats.fields = bestKey.fields;
						}
						break;
					}
				} while ( false );
				return keyStats;
			};

			Selectable.prototype.fillKeyValues = function ( keyToUse, filterRanges ) {
				switch ( keyToUse.type ) {
					case 2 /* index */
					:
					case 1 /* unique */
					:
						var indexValues = [];

						var counter = [];
						var total = 1;
						_.each( keyToUse.fields, function ( field ) {
							var length = filterRanges[field].equal.length;
							total *= length;
							counter.push( length );
						} );
						for ( var i = 0; i < total; ++i ) {
							var equalRow = [];
							var itemsToRepeat = 1;
							for ( var j = counter.length - 1; j >= 0; --j ) {
								equalRow[j] = filterRanges[keyToUse.fields[j]].equal[Math.floor( (i % (itemsToRepeat * counter[j])) / itemsToRepeat )];
								itemsToRepeat *= counter[j];
							}
							indexValues.push( equalRow );
						}
						keyToUse.values = indexValues;
						break;

					case 3 /* range */
					:
						var fromValues = [];
						var toValues = [];
						var rangeOpenFrom = null;
						var rangeOpenTo = null;
						_.each( keyToUse.fields, function ( field ) {
							var fieldParams = filterRanges[field];
							fromValues.push( fieldParams.from );
							toValues.push( fieldParams.to );
							rangeOpenFrom = rangeOpenFrom || fieldParams.openFrom;
							rangeOpenTo = rangeOpenTo || fieldParams.openTo;
						} );
						keyToUse.values = [fromValues, toValues, rangeOpenFrom, rangeOpenTo];
						break;
				}
			};

			Selectable.prototype.removeFiltersAlreadyUseInKey = function ( keyToUse, filterRange ) {
				//@todo проблема с equal в range.
				_.each( keyToUse.fields, function ( field ) {
					if ( filterRange[field] ) {
						delete filterRange[field];
					}
				} );
			};

			Selectable.prototype.startRequest = function ( request ) {
				var tableName = this.table.getName();
				var structure = this.table.getStructure();
				console.log( 'fields', JSON.stringify( this.fields ) );
				var filterRanges = this.fixRanges( structure );

				console.log( filterRanges );

				var keyToUse = this.getBestKeyToUse( structure, filterRanges );
				console.log( keyToUse );
				if ( keyToUse.values === null && keyToUse.type !== 4 /* none */ ) {
					this.fillKeyValues( keyToUse, filterRanges );
					//this.removeFiltersAlreadyUseInKey( keyToUse, filterRanges );
				}

				switch ( keyToUse.type ) {
					case 0 /* primary */
					:
						_.each( keyToUse.values, function ( value ) {
							request.get( tableName, value );
						} );
						request.end();
						break;

					case 2 /* index */
					:
					case 1 /* unique */
					:
						var keyName = IndexedStorage.Query.keyName( keyToUse.fields, keyToUse.type === 1 /* unique */ );
						_.each( keyToUse.values, function ( value ) {
							request.equal( tableName, keyName, value );
						} );
						request.end();
						break;

					case 3 /* range */
					:
						var keyName = IndexedStorage.Query.keyName( keyToUse.fields, keyToUse.type === 1 /* unique */ );
						request.range( tableName, keyName, keyToUse.values[0], keyToUse.values[1], keyToUse.values[2], keyToUse.values[3] );
						request.end();
						break;

					case 4 /* none */
					:
						request.all( tableName );
						request.end();
						break;
				}
			};

			Selectable.prototype.setTransactionResults = function ( records ) {
				console.log( 'toadd', JSON.stringify( records ) );
				var filters = this.customFilters;
				this.objects = _.filter( records, function ( record ) {
					console.log( record );

					var result = true;
					for ( var i = 0; i < filters.length; ++i ) {
						if ( !filters[i]( record ) ) {
							result = false;
							break;
						}
					}
					console.log( 'cf', result );

					result = result && _.all( this.fields, function ( range, field ) {
						var value = record.get()[field];
						return range.equal ? range.equal.indexOf( value ) >= 0 : IndexedStorage.Query.filter( value, range.from, range.to, range.openFrom, range.openTo );
					} );
					console.log( 'eof', result );
					return result;
				}, this );
				console.log( 'toadd', JSON.stringify( this.objects ) );
			};

			Selectable.prototype.each = function ( callback ) {
				console.log( 'each' );

				this.addCallback( 'each', callback );
				if ( !this.stateEndOfQueries ) {
					console.log( 'first each' );

					var that = this;
					this.whenReady.getPromise().then( function ( request ) {
						console.log( 'start' );
						that.startRequest( request );
					} );
				}
				this.stateEndOfQueries = true;
				return this;
			};
			return Selectable;
		})( IndexedStorage.Query.Base );
		Query.Selectable = Selectable;
	})( IndexedStorage.Query || (IndexedStorage.Query = {}) );
	var Query = IndexedStorage.Query;
})( IndexedStorage || (IndexedStorage = {}) );
/// <reference path="../../vendor/underscore.d.ts" />
/// <reference path="../common.ts" />
/// <reference path="../promises/promises.ts" />
/// <reference path="../table.ts" />
/// <reference path="./record.ts" />
/// <reference path="./transaction.ts" />
/// <reference path="./callbacks.ts" />
/// <reference path="./exceptions.ts" />
// <reference path="./base.ts" />
/// <reference path="./selectable.ts" />
var IndexedStorage;
(function ( IndexedStorage ) {
	(function ( Query ) {
		var Select = (function ( _super ) {
			__extends( Select, _super );
			function Select () {
				_super.apply( this, arguments );
			}

			Select.factory = function ( table, whenDBReady ) {
				return new Select( table, whenDBReady );
			};

			Select.prototype.each = function ( callback ) {
				console.log( 'super' );

				_super.prototype.each.call( this, callback );

				console.log( 'super2' );
				var that = this;
				this.whenComplete.getPromise().then( function () {
					console.log( 'whenComplete->each', JSON.stringify( that.objects ) );

					_.each( that.objects, function ( object ) {
						callback( object );
					} );
				} );
				return this;
			};
			return Select;
		})( IndexedStorage.Query.Selectable );
		Query.Select = Select;
	})( IndexedStorage.Query || (IndexedStorage.Query = {}) );
	var Query = IndexedStorage.Query;
})( IndexedStorage || (IndexedStorage = {}) );
/// <reference path="../vendor/underscore.d.ts" />
/// <reference path="./common.ts" />
/// <reference path="./sync/sync.ts" />
/// <reference path="./table.ts" />
/// <reference path="./promises/promises.ts" />
/// <reference path="./query/select.ts" />
// <reference path="./query/insert.ts" />
var IndexedStorage;
(function ( IndexedStorage ) {
	var Storage = (function () {
		function Storage ( name ) {
			this.name = name;
			this.isOpened = false;
			this.tables = {};
			this.whenReady = null;
			this.whenReady = IndexedStorage.Promises.whenDatabaseReady();
		}

		Storage.factory = function ( name ) {
			if ( Storage.indexedDB === null ) {
				Storage.indexedDB = indexedDB || window['indexedDB'] || window['webkitIndexedDB'] || window['mozIndexedDB'] || window['OIndexedDB'] || window['msIndexedDB'] || false;
			}

			if ( !Storage.instances[name] ) {
				Storage.instances[name] = new Storage( name );
			}
			return Storage.instances[name];
		};

		Storage.prototype.getName = function () {
			return this.name;
		};

		Storage.prototype.register = function ( table ) {
			return table ? (this.tables[table.getName()] = table) : null;
		};

		Storage.prototype.select = function ( name ) {
			console.log( 'select' );
			this.isOpened || this.openDatabase();
			return IndexedStorage.Query.Select.factory( this.tables[name], this.whenReady.getPromise() );
		};

		/*
		 public insert( name:string ):Query.Insert {
		 this.isOpened || this.openDatabase();
		 return Query.Insert.factory( this.tables[name], this.whenReady.promise );
		 }

		 public remove( name:string ):Query.Selectable {
		 return null;
		 }*/
		Storage.prototype.openDatabase = function () {
			console.log( 'sync' );

			var syncObj = IndexedStorage.Sync.Processor.factory( this.name );

			_.each( this.tables, function ( table ) {
				syncObj.add( table );
			} );

			//@todo remove
			console.log( 'openDB. version: ', syncObj.getDBVersion() );

			var that = this;
			var request = Storage.indexedDB.open( this.getName(), syncObj.getDBVersion() );
			request.onupgradeneeded = function ( e ) {
				syncObj.update( request, e.oldVersion, e.newVersion );
			};
			request.onsuccess = function ( e ) {
				that.whenReady.resolve( e.target.result );
			};
			this.isOpened = true;
		};
		Storage.indexedDB = null;
		Storage.instances = {};
		return Storage;
	})();
	IndexedStorage.Storage = Storage;
})( IndexedStorage || (IndexedStorage = {}) );
