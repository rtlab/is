/// <reference path="../../vendor/underscore.d.ts" />
/// <reference path="../promises/promises.ts" />
/// <reference path="../common.ts" />
/// <reference path="../table.ts" />
/// <reference path="./record.ts" />
/// <reference path="./transaction.ts" />
/// <reference path="./callbacks.ts" />
/// <reference path="./exceptions.ts" />
/// <reference path="./base.ts" />

module IndexedStorage {

	export module Query {

		export enum KeyType {
			primary,
			unique,
			index,
			range,
			none
		}

		export interface KeyStats {
			type: KeyType;
			name:string;
			fields:string[];
			values:any;
		}

		export interface FieldRange {
			equal:any[];
			from:any;
			to:any;
			openFrom:boolean;
			openTo:boolean;
		}

		export class Selectable extends Base {

			public keyValue:any[] = null;
			public fields:HashTable<FieldRange> = {};
			public customFilters:Callbacks.CustomFilter[] = [];
			public isReadOnlyMode:boolean = true;

			/**
			 * Get items by primary key value
			 * @param value
			 * @returns {IndexedStorage.Query.Selectable}
			 */
			public key( value:any ):Selectable {
				this.keyValue = [value];
				return this;
			}

			/**
			 * Get items by primary key velues
			 * @param values
			 * @returns {IndexedStorage.Query.Selectable}
			 */
			public keys( values:any[] ):Selectable {
				this.keyValue = values;
				return this;
			}

			/**
			 * field == value
			 * @param field
			 * @param value
			 * @returns {IndexedStorage.Query.Selectable}
			 */
			public eq( field:string, value:any ):Selectable {
				this.where( field, '=', [value] );
				return this;
			}

			/**
			 * field == value[0] || field == value[...]
			 * @param field
			 * @param values
			 * @returns {IndexedStorage.Query.Selectable}
			 */
			public inArray( field:string, values:any[] ):Selectable {
				this.where( field, '=', values );
				return this;
			}

			/**
			 * field > value
			 * @param field
			 * @param value
			 * @returns {IndexedStorage.Query.Selectable}
			 */
			public gt( field:string, value:any ):Selectable {
				return this.where( field, '>', value );
			}

			/**
			 * field < value
			 * @param field
			 * @param value
			 * @returns {IndexedStorage.Query.Selectable}
			 */
			public lt( field:string, value:any ):Selectable {
				return this.where( field, '<', value );
			}

			/**
			 * field >= value
			 * @param field
			 * @param value
			 * @returns {IndexedStorage.Query.Selectable}
			 */
			public gteq( field:string, value:any ):Selectable {
				return this.where( field, '>=', value );
			}

			/**
			 * field <= value
			 * @param field
			 * @param value
			 * @returns {IndexedStorage.Query.Selectable}
			 */
			public lteq( field:string, value:any ):Selectable {
				return this.where( field, '<=', value );
			}

			public custom( callback:Callbacks.CustomFilter ):Selectable {
				this.customFilters.push( callback );
				return this;
			}

			/**
			 *
			 * @param field
			 * @param op
			 * @param value
			 * @returns {IndexedStorage.Query.Selectable}
			 */
			public where( field:string, op:string, value:any ):Selectable {
				if ( !this.stateEndOfQueries ) {
					var fieldRange:FieldRange = this.fields[ field ] || { equal: null, from: undefined, to: undefined, openFrom: false, openTo: false };
					switch ( op ) {
						case '>':
						case '>=':
							if ( !( value < fieldRange.from ) ) {
								fieldRange.from = value;
								fieldRange.openFrom = ( op === '>=');
							} else if ( value == fieldRange.from ) {
								fieldRange.openFrom = (op === '>=');
							}
							break;

						case '<':
						case '<=':
							if ( !( value > fieldRange.to ) ) {
								fieldRange.to = value;
								fieldRange.openTo = ( op === '<=');
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
					this.addWarning( Exception.noMoreQueries() );
				}
				return this;
			}

			private fixRanges( structure:Table.Info ):HashTable<FieldRange> {

				if ( structure.key && _.isArray( this.keyValue ) && this.keyValue.length > 0 ) {
					var fieldRange:FieldRange = this.fields[ structure.key ] || { equal: null, from: undefined, to: undefined, openFrom: false, openTo: false };
					if ( _.isArray( fieldRange.equal ) ) {
						fieldRange.equal = this.keyValue;
					}
					this.fields[structure.key] = fieldRange;
				}
				_.each( this.fields, function ( range:FieldRange ):void {

					if ( _.isArray( range.equal ) ) {
						range.equal = _.filter( range.equal, function ( value:any ):boolean {
							return Query.filter( value, range.from, range.to, range.openFrom, range.openTo );
						} );
					}
					if ( !range.equal || (_.isArray( range.equal ) && range.equal.length == 0) ) {
						range.equal = null;
					}
					if ( range.equal === null ) {

						if ( range.from === range.to && range.openFrom && range.openTo ) {
							range.equal = [range.from];
						} else if ( range.from > range.to ) {
							//@todo
							throw new Error( '"from" greater then "to"' );
						}
					}
					if ( range.equal !== null ) {
						var rangeMinValue = range.equal[0];
						var rangeMaxValue = range.equal[1];
						if ( range.equal.length > 1 ) {
							_.each( range.equal, function ( value:any ):void {
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
			}

			private getBestKeyToUse( structure:Table.Info, filterRanges:HashTable<FieldRange> ):KeyStats {

				var keyStats:KeyStats = {type: KeyType.none, name: null, fields: null, values: null };
				do {

					// primary key (  key(value) or keys( [value1, value2])
					if ( this.keyValue !== null ) {
						keyStats.type = KeyType.primary;
						keyStats.values = this.keyValue;
						if ( structure.key ) {
							keyStats.fields = [structure.key];
						}
						break;
					}

					// eq(primary key,  value) or inArray( primary key, [value1,value2])
					if ( structure.key && this.fields[structure.key].equal !== null ) {
						keyStats.type = KeyType.primary;
						keyStats.values = this.fields[structure.key].equal;
						break;
					}

					// find by unique index and field === value
					var uxKeys:string[][] = null;
					var uxKey:string[] = _.min( uxKeys = _.filter( this.table.getStructure().ux, function ( fields:string[] ):boolean {

						return _.every( fields, function ( field:string ):boolean {
							return !!( !_.isUndefined( filterRanges[ field ] ) && filterRanges[field].equal);
						}, this );
					}, this ), function ( fields:string[] ):number {

						var counter:number = fields.length;
						_.each( fields, function ( field:string ):void {
							counter *= filterRanges[field].equal.length;
						} );
						return counter;
					}, this );
					if ( uxKey && _.isArray( uxKey ) ) {
						keyStats.type = KeyType.unique;
						keyStats.name = Query.keyName( uxKey, true );
						keyStats.fields = uxKey;
						break;
					}

					var keysCanUse:KeyStats[] = [];
					_.each( [ structure.ux, structure.ix ], function ( indexGroup:string[][], indexType?:number ):void {

						_.each( indexGroup, function ( fields:string[] ):void {

							var hasEqual:number = fields.length;
							var canUseLessThen:boolean = true;
							var canUseMoreThen:boolean = true;
							var rangeOpenFrom:boolean = null;
							var rangeOpenTo:boolean = null;

							_.map( fields, function ( field:string ):void {

								var fieldRange:FieldRange = filterRanges[field];
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

							if ( hasEqual === 0 || (canUseMoreThen && canUseLessThen ) ) {
								keysCanUse.push( { type: indexType ? ( hasEqual === 0 ? KeyType.index : KeyType.range ) : KeyType.unique, name: Query.keyName( fields, !indexType ), fields: fields, values: null } )
							}
						} );
					} );
					if ( keysCanUse.length > 0 ) {

						var bestKey:KeyStats = _.min( keysCanUse, function ( item:KeyStats ):number {
							return (item.type === KeyType.unique ? 0 : item.fields.length * ( item.type === KeyType.index ? 1 : 2  ) );
						} );

						if ( bestKey && _.isObject( bestKey ) ) {
							keyStats.type = bestKey.type;
							keyStats.fields = bestKey.fields;
						}
						break;
					}
				} while ( false );
				return keyStats;
			}

			private fillKeyValues( keyToUse:KeyStats, filterRanges:HashTable<FieldRange> ):void {

				switch ( keyToUse.type ) {
					case KeyType.index:
					case KeyType.unique:

						var indexValues:any[][] = [];

						var counter:number[] = [];
						var total:number = 1;
						_.each( keyToUse.fields, function ( field:string ):void {
							var length:number = filterRanges[field].equal.length;
							total *= length;
							counter.push( length );
						} );
						for ( var i:number = 0; i < total; ++i ) {

							var equalRow:any[] = [];
							var itemsToRepeat:number = 1;
							for ( var j:number = counter.length - 1; j >= 0; --j ) {
								equalRow[j] = filterRanges[ keyToUse.fields[j] ].equal[ Math.floor( ( i % (itemsToRepeat * counter[j])) / itemsToRepeat ) ];
								itemsToRepeat *= counter[j];
							}
							indexValues.push( equalRow );
						}
						keyToUse.values = indexValues;
						break;

					case KeyType.range:

						var fromValues:any[][] = [];
						var toValues:any[][] = [];
						var rangeOpenFrom:boolean = null;
						var rangeOpenTo:boolean = null;
						_.each( keyToUse.fields, function ( field:string ):void {
							var fieldParams:FieldRange = filterRanges[ field ];
							fromValues.push( fieldParams.from );
							toValues.push( fieldParams.to );
							rangeOpenFrom = rangeOpenFrom || fieldParams.openFrom;
							rangeOpenTo = rangeOpenTo || fieldParams.openTo;
						} );
						keyToUse.values = [fromValues, toValues, rangeOpenFrom, rangeOpenTo];
						break;
				}
			}

			private removeFiltersAlreadyUseInKey( keyToUse:KeyStats, filterRange:HashTable<FieldRange> ):void {
				//@todo проблема с equal в range.
				_.each( keyToUse.fields, function ( field:string ):void {
					if ( filterRange[ field ] ) {
						delete filterRange[field];
					}
				} );
			}

			private startRequest( database:IDBDatabase ):void {

				var tableName:string = this.table.getName();
				var structure:Table.Info = this.table.getStructure();
				console.log( 'fields', JSON.stringify( this.fields ) );
				var filterRanges:HashTable<FieldRange> = this.fixRanges( structure );

				console.log( filterRanges );

				var keyToUse:KeyStats = this.getBestKeyToUse( structure, filterRanges );
				console.log( keyToUse );
				if ( keyToUse.values === null && keyToUse.type !== KeyType.none ) {
					this.fillKeyValues( keyToUse, filterRanges );
					//this.removeFiltersAlreadyUseInKey( keyToUse, filterRanges );
				}

				var storeObject:IDBObjectStore = database.transaction( tableName, this.isReadOnlyMode ? 'readonly' : 'readwrite' ).objectStore( tableName );

				switch ( keyToUse.type ) {

					case KeyType.primary :
						this.selectByPrimaryKey( storeObject, keyToUse );
						break;

					case KeyType.index:
					case KeyType.unique:
						var index:IDBIndex = storeObject.index( keyToUse.name );
						_.each( keyToUse.values, function ( value:any ):void {
							this.selectByCursor( index.openCursor( IDBKeyRange.only( value ) ) );
						} );
						break;

					case KeyType.range:
						this.selectByCursor(
							storeObject.index( keyToUse.name ).openCursor( IDBKeyRange.bound( keyToUse.values[0], keyToUse.values[1], keyToUse.values[2], keyToUse.values[3] ) )
						);
						break;

					case KeyType.none:
						this.selectByCursor( storeObject.openCursor() );
						break;

					/*
					 case KeyType.index:
					 case KeyType.unique:
					 var keyName:string = Query.keyName( keyToUse.fields, keyToUse.type === KeyType.unique );
					 _.each( keyToUse.values, function ( value:any ):void {
					 request.equal( tableName, keyName, value );
					 } );
					 request.end();
					 break;

					 case KeyType.range:
					 var keyName:string = Query.keyName( keyToUse.fields, keyToUse.type === KeyType.unique );
					 request.range( tableName, keyName, keyToUse.values[0], keyToUse.values[1], keyToUse.values[2], keyToUse.values[3] );
					 request.end();
					 break;

					 case KeyType.none:
					 request.all( tableName );
					 request.end();
					 break;*/
				}
			}

			/**
			 * @abstract
			 * @param storeObject
			 * @param keyToUse
			 */
			public selectByPrimaryKey( storeObject:IDBObjectStore, keyToUse:KeyStats ):void {
			}

			/**
			 * @abstract
			 * @param cursor
			 */
			public selectByCursor( cursor:IDBRequest ):void {
			}

			/**
			 * @deprecated
			 * @param records
			 */
			public setTransactionResults( records:Record[] ):void {
				console.log( 'toadd', JSON.stringify( records ) );
				var filters:Callbacks.CustomFilter[] = this.customFilters;
				this.objects = _.filter( records, function ( record:Record ):boolean {

					console.log( record );

					var result:boolean = true;
					for ( var i:number = 0; i < filters.length; ++i ) {
						if ( !filters[i]( record ) ) {
							result = false;
							break;
						}
					}
					console.log( 'cf', result );

					result = result && _.all( this.fields, function ( range:FieldRange, field?:string ):boolean {
						var value:any = record.get()[ field ];
						return range.equal ? range.equal.indexOf( value ) >= 0 : Query.filter( value, range.from, range.to, range.openFrom, range.openTo );
					} );
					console.log( 'eof', result );
					return result;
				}, this );
				console.log( 'toadd', JSON.stringify( this.objects ) );
			}

			public filterValue( record:IndexedStorage.Query.Record ):boolean {

				var result:boolean = true;

				var filters:Callbacks.CustomFilter[] = this.customFilters;
				for ( var i:number = 0; i < filters.length; ++i ) {
					if ( !filters[i]( record ) ) {
						result = false;
						break;
					}
				}
				result = result && _.all( this.fields, function ( range:FieldRange, field?:string ):boolean {
					try {
						var value:any = record.get()[ field ];
						return range.equal ? range.equal.indexOf( value ) >= 0 : Query.filter( value, range.from, range.to, range.openFrom, range.openTo );
					} catch ( e ) {
						return false;
					}
				} );
				return result;
			}

			public execute():Selectable {
				if ( !this.stateEndOfQueries ) {
					var that:Selectable = this;
					this.whenReady.getPromise().then( function ( database:IDBDatabase ):void {
						that.startRequest( database );
					} );
				}
				this.stateEndOfQueries = true;
				return this;
			}

			public each( callback:Callbacks.Each ):Selectable {
				this.addCallback( 'each', callback );
				return this.execute();
			}
		}
	}
}