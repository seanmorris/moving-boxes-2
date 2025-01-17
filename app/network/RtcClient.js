import { Mixin } from 'curvature/base/Mixin';
import { EventTargetMixin } from 'curvature/mixin/EventTargetMixin';

export class RtcClient extends Mixin.with(EventTargetMixin)
{
	candidateTimeout = 500;

	constructor(rtcConfig)
	{
		super();

		this.peerClient = new RTCPeerConnection(rtcConfig);

		this.peerClientChannel = this.peerClient.createDataChannel("chat");

		this.peerClientChannel.addEventListener('open', event => {
			const openEvent = new CustomEvent('open', {detail: event.data});
			openEvent.originalEvent = event;
			this.dispatchEvent(openEvent);
			this.connected = true;
		});

		this.peerClientChannel.addEventListener('close', event => {
			const closeEvent = new CustomEvent('close', {detail: event.data});
			closeEvent.originalEvent = event;
			this.dispatchEvent(closeEvent);
			this.connected = false;
		});

		this.peerClientChannel.addEventListener('message', event => {
			const messageEvent = new CustomEvent('message', {detail: event.data});
			messageEvent.originalEvent = event;
			this.dispatchEvent(messageEvent);
		});

		this.peerClient.addEventListener('icecandidate', event => {
			const messageEvent = new CustomEvent('icecandidate', {detail: event.data});
			messageEvent.originalEvent = event;
			this.dispatchEvent(messageEvent);
		});
	}

	send(input)
	{
		if(!this.peerClientChannel)
		{
			return;
		}

		if(this.peerClientChannel.readyState !== 'open')
		{
			return;
		}

		this.peerClientChannel.send(input);
	}

	close()
	{
		return this.peerClient.close();
	}

	getIceCandidates()
	{
		const candidates = new Set;

		return new Promise(accept => this.peerClient.addEventListener('icecandidate', event => {
			candidates.add(event.candidate);

			if(!event.candidate)
			{
				accept([...candidates]);
				return;
			}
		}));
	}

	addIceCandidate(candidate)
	{
		this.peerClient.addIceCandidate(candidate);
	}

	offer()
	{
		return this.peerClient.createOffer()
		.then(offer => this.peerClient.setLocalDescription(offer))
		.then(() => this.peerClient.localDescription);
	}

	fullOffer()
	{
		return this.offer().then(offer => this.getIceCandidates().then(candidates => ({offer, candidates})));
	}

	accept(answer)
	{
		const session = new RTCSessionDescription(answer);

		return this.peerClient.setRemoteDescription(session);
	}

	fullAccept({answer, candidates})
	{
		return this.accept(answer).then(() => candidates.map(c => this.addIceCandidate(c)));
	}
}
