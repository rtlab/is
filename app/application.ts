/// <reference path="../src/storage.ts" />
/// <reference path="../src/table.ts" />

IndexedStorage.Storage.factory( 'test' ).register( IndexedStorage.Table.Structure.factory( 'test', [
		['test', 'param']
	], ['test', 'param'] ) ).changes().add( 'initial',function () {
	console.log( 11111 );
} ).add( 'second', function () {

} );

