const getUuid = function () {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
	    return v.toString(16);
	});
};

const sinchClient = new SinchClient({
	applicationKey: '5697dd46-131c-48b1-9007-b3ec58362ec0',
	applicationSecret: '9H6d7FVup0eRoAX1/beiUw==', //WARNING: This is insecure, only for demo easy/instant sign-in where we don't care about user identification
	capabilities: {calling: true, video: true, multiCall: true},
	startActiveConnection: true,
	onLogMessage: function(message) {
        console.log(message);
	},
	onLogMxpMessage: function(message) {
		console.log(message);
	},
});

const callClient    = sinchClient.getCallClient();
const username      = getUuid();
const channel       = 'cf7401b7-010b-4fb1-a023-701b0fca95e5';
const remoteCalls     = [];
console.log('Starting with username: ', username);

let video;
let videoCard;
let callIdx;

if(navigator.userAgent.toLowerCase().indexOf('chrome') == -1) {
	document.getElementById('notChromeWarning').style.display = 'inherit';
}
else {
    sinchClient.start({username: username}).then(function() {
        const groupCall = callClient.callGroup(channel);
        
        groupCall.addEventListener({
            onGroupRemoteCallAdded: function(call) {
                remoteCalls.push(call);
                console.log(call);
                callIdx = remoteCalls.indexOf(call);
                videoCard = document.createElement('div');
                videoCard.classList.add('card');
                videoCard.setAttribute('id','call-' + callIdx);
                video = document.createElement('video');
                video.setAttribute('autoplay', 'autoplay');
                video.srcObject = call.incomingStream;
                videoCard.appendChild(video);
                document.getElementById('videos').appendChild(videoCard);
            },
            onGroupLocalMediaAdded: function(stream) {
                videoCard = document.createElement('div');
                videoCard.classList.add('card');
                video = document.createElement('video');
                video.setAttribute('autoplay', 'autoplay');
                video.setAttribute('muted', 'muted');
                video.srcObject = stream;
                videoCard.appendChild(video);
                document.getElementById('videos').appendChild(videoCard);
            },
            onGroupRemoteCallRemoved: function(call) {
                console.log('removed call');
                callIdx = remoteCalls.indexOf(call);
                remoteCalls.splice(callIdx, 1);
                document.getElementById('videos').removeChild(document.getElementById('call-' + callIdx));
                console.log('removed : ' + callIdx);
            },
        });
    });
}