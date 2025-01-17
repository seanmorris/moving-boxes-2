import { SaveDatabase } from '../save/SaveDatabase';

export const SavestateMenu = (parent) => {

	const children = {};

	SaveDatabase.open('saves', 1).then(database => {

		const store = 'saves';
		const index = 'created';

		const query = {store, index};

		database
		.select(query)
		.each(savestate => {

			const id        = savestate.id;
			const character = savestate.character

			children[`${id} ${character}`] = {
				callback: () => {

					console.log(savestate);

					parent.setCheckpoint(savestate.currentMap, {[character]: savestate.checkpoint});
					parent.loadMap({mapUrl: savestate.currentMap});
				}
			};

		})
		.then(results => console.log(results))
	});

	return {children};

};

