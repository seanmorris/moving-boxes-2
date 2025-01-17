import { Task } from 'subspace-console/Task';

export class Spawn extends Task
{
	static viewport = null;

	static helpText = 'Spawn an object.';

	init(typeName)
	{
		if(!Spawn.viewport || !Spawn.viewport.controlActor)
		{
			return;
		}

		const palette = Spawn.viewport.objectPalette;
		const actor   = Spawn.viewport.controlActor;

		if(!typeName)
		{
			this.print(Object.keys(palette).join(', '));
			return;
		}

		if(!(typeName in palette))
		{
			this.print(`Type not found: "${typeName}".`);
			return;
		}

		const type = palette[typeName];

		const mouse = Spawn.viewport.mouse.position;

		Spawn.viewport.spawn.add({object: new type({
			x: mouse[0]
			, y: mouse[1]
		})});
	}
}
