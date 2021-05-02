import { Mixin } from 'curvature/base/Mixin';
import { EventTargetMixin } from 'curvature/mixin/EventTargetMixin';

export class RtcClient extends Mixin.with(EventTargetMixin)
{
	constructor(rtcConfig)
	{
		super();

		this.peerClient = new RTCPeerConnection(rtcConfig);

		this.peerClientChannel = this.peerClient.createDataChannel("chat");

		this.peerClientChannel.addEventListener('open', event => {
			const openEvent = new CustomEvent('open', {detail: event.data });
			openEvent.originalEvent = event;
			this.dispatchEvent(openEvent);
			this.connected = true;
		});

		this.peerClientChannel.addEventListener('close', event => {
			const closeEvent = new CustomEvent('close', {detail: event.data });
			closeEvent.originalEvent = event;
			this.dispatchEvent(closeEvent);
			this.connected = false;
		});

		this.peerClientChannel.addEventListener('message', event => {
			const messageEvent = new CustomEvent('message', {detail: event.data });
			messageEvent.originalEvent = event;
			this.dispatchEvent(messageEvent);
		});
	}

	send(input)
	{
		this.peerClientChannel && this.peerClientChannel.send(input);
	}

	close()
	{
		this.peerClientChannel && this.peerClientChannel.close();
	}

	offer()
	{
		this.peerClient.createOffer().then(offer => {
			this.peerClient.setLocalDescription(offer);
		});

		const candidates = new Set;

		return new Promise(accept => {
			this.peerClient.addEventListener('icecandidate', event => {

				if(!event.candidate)
				{
					return;
				}
				else
				{
					console.log(event.candidate);

					candidates.add(event.candidate);
				}

				accept(this.peerClient.localDescription);

			});
		});
	}

	accept(answer)
	{
		const session = new RTCSessionDescription(answer);

		this.peerClient.setRemoteDescription(session);
	}
}
