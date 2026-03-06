const kick = new Tone.MembraneSynth({
    pitchDecay: 0.08,
    octaves: 8,
    envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 },
    volume: -6
}).toDestination();

const snare = new Tone.MembraneSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.05 },
    volume: -16
}).toDestination();

const hihat = new Tone.MembraneSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.01 },
    volume: -18
}).connect(new Tone.Filter(8000, 'highpass')).toDestination();

const bass = new Tone.MembraneSynth({
    pitchDecay: 0.5,
    octaves: 4,
    envelope: { attack: 0.001, decay: 0.6, sustain: 0, release: 0.2 },
    volume: -4
}).toDestination();


const PATTERNS = {
    'old school': {
        bpm: 95,
        kick: [1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0],
        snare: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
        hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
        bass: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    },
    'trap': {
        bpm: 140,
        kick: [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
        snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
        hihat: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        bass: [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0],
    },
    'boom bap': {
        bpm: 90,
        kick: [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
        snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
        hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1],
        bass: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    },
    'drill': {
        bpm: 145,
        kick: [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0],
        snare: [0,0,0,0,1,0,0,1,0,0,0,0,1,0,1,0],
        hihat: [1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
        bass: [1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0],
    },
    'conscious': {
        bpm: 88,
        kick: [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
        snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
        hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
        bass: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    },
    'funny comedic': {
        bpm: 100,
        kick: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,1,0],
        snare: [0,0,1,0,0,0,1,0,0,0,1,0,0,1,0,1],
        hihat: [1,1,0,1,1,0,1,0,1,1,0,1,1,0,1,1],
        bass: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    },
};

let kickSeq = null;
let snareSeq = null;
let hihatSeq = null;
let bassSeq = null;
let isPlaying = false;

function buildSequences(pattern) {
    kickSeq = new Tone.Sequence((time, val) => {
        if (val) kick.triggerAttackRelease('C1', '8n', time);
    }, pattern.kick, '16n');
    
    snareSeq = new Tone.Sequence((time, val) => {
        if (val) snare.triggerAttackRelease('8n', time);
    }, pattern.snare, '16n');
    
    hihatSeq = new Tone.Sequence((time, val) => {
        if (val) hihat.triggerAttackRelease('16n', time);
    }, pattern.hihat, '16n');

    bassSeq = new Tone.Sequence((time, val) => {
        if (val) bass.triggerAttackRelease('C0', '8n', time);
    }, pattern.bass, '16n');
}

function disposeSequences() {
    [kickSeq, snareSeq, hihatSeq, bassSeq].forEach(seq => {
        if (seq) { seq.stop(); seq.dispose(); }
    });
    kickSeq = snareSeq = hihatSeq = bassSeq = null;
}

async function startBeat(style) {
    await Tone.start();

    const pattern = PATTERNS[style] || PATTERNS['old school'];

    if (isPlaying) stopBeat();

    Tone.Transport.bpm.value = pattern.bpm;
    buildSequences(pattern);

    kickSeq.start(0);
    snareSeq.start(0);
    hihatSeq.start(0);
    bassSeq.start(0);

    Tone.Transport.start();
    isPlaying = true;
}

function stopBeat() {
    Tone.Transport.stop();
    disposeSequences();
    isPlaying = false;
}

function isBeatPlaying() {
    return isPlaying;
}