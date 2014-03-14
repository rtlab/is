/// <reference path="../vendor/underscore.d.ts" />

interface HashTable<T> {
	[key:string]: T;
}

interface IndexTable<T> {
	[key:number]: T;
}

class StringsList {

	static toArray( strings:DOMStringList ):string[] {
		var result:string[] = [];
		for ( var i:number = 0, n:number = strings.length; i < n; ++i ) {
			result.push( strings.item( i ) );
		}
		return result;
	}
}

module IndexedStorage {
	export module Query {
		export function keyName( fields:string[], isUnique:boolean = false ):string {
			return ( isUnique ? 'ux_' : 'ix_' ) + fields.join( '.' );
		}

		export function filter( value:any, rangeFrom:any, rangeTo:any, openFrom:boolean, openTo:boolean ):boolean {
			return ( _.isUndefined( rangeFrom ) || rangeFrom === null || value > rangeFrom || ( openFrom && (value == rangeFrom )))
				&& ( _.isUndefined( rangeTo ) || rangeTo === null || value < rangeTo || ( openTo && (value == rangeTo )));
		}
	}
}

