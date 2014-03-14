/// <reference path="../vendor/underscore.d.ts" />
/// <reference path="./promises/promises.ts" />
/// <reference path="./common.ts" />

module IndexedStorage {

	export module Table {

		export interface Info {
			ix: string[][];
			ux: string[][];
			key:string;
		}

		export class Structure {

			static factory( name:string, uniques:any[] = [], indexes:any[] = [], key:string = '' ):Structure {
				var structure:Structure = new Structure();
				structure.name = name;
				structure.uniques = uniques;
				structure.indexes = indexes;
				structure.key = key;
				return structure;
			}

			// string:keyPath, '':autoIncrement, false/null:onsave
			public key:string = '';
			public indexes:any[] = [];
			public uniques:any[] = [];
			public name:string = '';

			private changeSets:Changes = null;
			private structure:Info = null;

			public changes():Changes {

				if ( this.changeSets === null ) {
					this.changeSets = Changes.factory();
				}
				return this.changeSets;
			}

			public getStructure():Info {

				if ( this.structure === null ) {

					var struct:Info = { ux: [], ix: [], key: this.key };
					_.each( {ix: this.indexes, ux: this.uniques}, function ( structure:any[], param?:string ):void {

						struct[param] = _.map( structure, function ( value:any ) {
							return _.isArray( value ) ? value : [value];
						} );
					} );
					this.structure = struct;
				}
				return this.structure;
			}

			public structureId():string {
				return JSON.stringify( { i: this.indexes, u: this.uniques } );
			}

			public getName():string {
				return this.name;
			}
		}

		export class Changes {

			static factory():Changes {
				return new Changes();
			}

			private items:ChangeSet[] = [];

			public list():ChangeSet[] {
				return this.items;
			}

			public add( name:string, cb:any ):Changes {
				this.items.push( { name: name, callback: cb } );
				return this;
			}
		}

		export interface ChangeSet {
			name:string;
			callback:ChangeSetCallback;
		}

		export interface ChangeSetCallback {
			( database:IDBOpenDBRequest, oldVersion?:number, newVersion?:number ):boolean;
		}
	}
}
