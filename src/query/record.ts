module IndexedStorage {

	export module Query {

		export class Record {
			private _success:boolean = false;
			private _error:Error = null;

			static insert( value:any, id?:any ):Record {
				return new Record( 'insert', id, value );
			}

			static remove( id:any ):Record {
				return new Record( 'remove', id, null );
			}

			static select( id:any ):Record {
				return new Record( 'select', id, null );
			}

			static load( id:any, value:any ):Record {
				return new Record( 'select', id, value );
			}

			static update( value:any, id:any ):Record {
				return new Record( 'update', id, value );
			}

			constructor( private operation:string, private id:any, private value:any ) {
			}

			public selected( value:any, id:any = null ):Record {
				this.id = id;
				this._success = true;
				this.value = value;
				this._error = null;
				return this;
			}

			public inserted( id:any ):Record {
				if ( id !== null ) {
					this.id = id;
				}
				this._success = true;
				this._error = null;
				return this;
			}

			public completed():Record {
				this._error = null;
				this._success = true;
				return this;
			}

			public failed():Record {
				this._error = null;
				this._success = false;
				return this;
			}

			public error( e:Error ):Record {
				this._success = false;
				this._error = e;
				return this;
			}

			public key():any {
				return this.id;
			}

			public get():any {
				return this.value;
			}

			public getOperation():string {
				return this.operation;
			}
		}
	}
}