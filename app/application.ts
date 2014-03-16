/// <reference path="../src/storage.ts" />
/// <reference path="../src/table.ts" />

IndexedStorage.Storage.factory( 'test' ).register( IndexedStorage.Table.Structure.factory( 'test', [
		['test', 'param']
	], ['test', 'param'] ) ).changes().add( 'initial',function () {
	console.log( 11111 );
} ).add( 'second', function () {

} );

var databaseObject:IndexedStorage.Storage = IndexedStorage.Storage.factory( 'test' );

//databaseObject.select( 'test' ).inArray( 'test', [2, 10, 20, 44, 22] ).inArray( 'param', [1, 2, 3, 4, 5] )./*eq( 'test', 2 ).*/each( function ( record:InternalStorage.Query.Record ) {
databaseObject.select( 'test' ).key( 30 ).each( function ( record:IndexedStorage.Query.Record ) {
	console.log( 'found row', record.get() );
} );
/*.after( function () {
 databaseObject.insert( 'test' ).set( {test: 45} );
 } )*/
var select = databaseObject.select( 'test' ).eq( 'test', 2 ).each( function ( record:IndexedStorage.Query.Record ) {
	console.log( 'found row2', record.get() );
} );
var select = databaseObject.select( 'test' ).each( function ( record:IndexedStorage.Query.Record ) {
	console.log( 'found row3', record.get() );
} );

//databaseObject.insert( 'test' ).set( {test: (Math.random() * 10 % 10), param: 'xx2'}, 200 + Math.floor( Math.random() * 1000 ) );
/*
 var remove = databaseObject.remove( 'test' ).eq( 'test', 55 ).eq( 'param', 3 ).execute();

 var remove = databaseObject.remove( 'test' ).eq( 'test', 55 ).eq( 'param', 3 ).each( function () {
 // select deleted items
 } );
 /*
 databaseObject.update( 'test' ).gt( 'test', 44 ).set( 'big', true ).each( function ( record:IndexedStorage.Query.Record ) {
 record.update( { test: record.get().test + 1, ok: true } );
 } );

 IndexedStorage.wait( select, remove ).then( function () {
 // do something
 } );
 */