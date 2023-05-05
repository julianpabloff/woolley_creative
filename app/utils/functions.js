export function forEachElement(HTMLCollection, callback) {
	const childCount = HTMLCollection.length;
	let i = 0;
	while (i < childCount) {
		callback(HTMLCollection[i], i);
		i++;
	}
}
