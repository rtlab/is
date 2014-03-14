Indexed Storage
==

#IndexedDB

```typescript

IndexedStorage.Storage.factory( 'test' ).register( IndexedStorage.Table.Structure.factory( 'test', [
		['test', 'param']
	], ['test', 'param'] ) ).changes().add( 'initial',function () {
	console.log( 11111 );
} ).add( 'second', function () {

} );
```

```javascript

IndexedStorage.Storage.factory( 'test' ).register( IndexedStorage.Table.Structure.factory( 'test', [
		['test', 'param']
	], ['test', 'param'] ) ).changes().add( 'initial',function () {
	console.log( 11111 );
} ).add( 'second', function () {

} );
```
