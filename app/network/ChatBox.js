import { View } from 'curvature/base/View';

export class ChatBox extends View
{
	template = require('./chat-box.html');

	constructor(args, parent)
	{
		super(args, parent);

		this.args.outputLines = [];

		const onOpen = event => this.args.outputLines = ['You joined the chat.'];

		const onMessage = event => {
			this.args.outputLines.push(`> ${event.detail}`);

			this.onNextFrame(() => {
				this.tags.chatOutput && this.tags.chatOutput.scrollTo(0, this.tags.chatOutput.scrollHeight);
			});
		};

		this.listen(args.pipe, 'open',    onOpen);
		this.listen(args.pipe, 'message', onMessage);
	}

	send(event)
	{
		if(event && event.key !== 'Enter')
		{
			return;
		}

		const message = this.args.chatInput;

		if(!message)
		{
			return;
		}

		this.args.outputLines.push(`< ${message}`);

		this.args.chatInput = '';

		this.onNextFrame(() => {
			const tag = this.tags.chatOutput;
			tag.scrollTo(0, tag.scrollHeight);
			tag.focus();
		});

		this.args.pipe.send(message);
	}
}