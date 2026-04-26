const Tone = window.Tone;
const Midi = window.Midi;

if (!Tone) {
    throw new Error('Tone.js is required before loading FrontEnd/Output/Sound.js');
}

if (!Midi) {
    throw new Error('Midi.js is required before loading FrontEnd/Output/Sound.js');
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function createTonalTrack(notes = []) {
    return {
        type: 'tonal',
        notes,
    };
}

function createNoiseTrack(notes = []) {
    return {
        type: 'noise',
        notes,
    };
}

function buildSoundEffectLibrary() {
    return {
        heroAttack: {
            id: 'heroAttack',
            duration: 0.28,
            tracks: [
                createTonalTrack([
                    { time: 0.0, duration: 0.08, name: 'C4', velocity: 0.9 },
                    { time: 0.08, duration: 0.08, name: 'G3', velocity: 0.65 },
                ]),
                createTonalTrack([
                    { time: 0.02, duration: 0.07, name: 'E4', velocity: 0.55 },
                ]),
                createTonalTrack([
                    { time: 0.0, duration: 0.16, name: 'C3', velocity: 0.4 },
                ]),
                createNoiseTrack([
                    { time: 0.0, duration: 0.04, velocity: 0.35 },
                ]),
            ],
        },
        heroSkill: {
            id: 'heroSkill',
            duration: 0.48,
            tracks: [
                createTonalTrack([
                    { time: 0.0, duration: 0.12, name: 'G4', velocity: 0.8 },
                    { time: 0.14, duration: 0.14, name: 'C5', velocity: 0.72 },
                ]),
                createTonalTrack([
                    { time: 0.04, duration: 0.1, name: 'D5', velocity: 0.5 },
                    { time: 0.2, duration: 0.1, name: 'G4', velocity: 0.45 },
                ]),
                createTonalTrack([
                    { time: 0.0, duration: 0.24, name: 'G3', velocity: 0.42 },
                ]),
                createNoiseTrack([
                    { time: 0.0, duration: 0.05, velocity: 0.22 },
                    { time: 0.18, duration: 0.08, velocity: 0.16 },
                ]),
            ],
        },
        enemySkill: {
            id: 'enemySkill',
            duration: 0.42,
            tracks: [
                createTonalTrack([
                    { time: 0.0, duration: 0.1, name: 'F3', velocity: 0.75 },
                    { time: 0.12, duration: 0.12, name: 'D3', velocity: 0.68 },
                ]),
                createTonalTrack([
                    { time: 0.02, duration: 0.1, name: 'A3', velocity: 0.45 },
                ]),
                createTonalTrack([
                    { time: 0.0, duration: 0.24, name: 'F2', velocity: 0.35 },
                ]),
                createNoiseTrack([
                    { time: 0.0, duration: 0.06, velocity: 0.28 },
                    { time: 0.11, duration: 0.06, velocity: 0.22 },
                ]),
            ],
        },
        enemyKilled: {
            id: 'enemyKilled',
            duration: 0.5,
            tracks: [
                createNoiseTrack([
                    { time: 0.0, duration: 0.5, velocity: 0.5, frequency: 1000 },
                ]),
            ],
        },
        objectiveHit: {
            id: 'objectiveHit',
            duration: 0.5,
            tracks: [
                createTonalTrack([
                    { time: 0.0, duration: 0.14, name: 'D3', velocity: 0.8 },
                    { time: 0.18, duration: 0.18, name: 'A2', velocity: 0.76 },
                ]),
                createTonalTrack([
                    { time: 0.04, duration: 0.12, name: 'F3', velocity: 0.45 },
                ]),
                createTonalTrack([
                    { time: 0.0, duration: 0.28, name: 'D2', velocity: 0.3 },
                ]),
                createNoiseTrack([
                    { time: 0.0, duration: 0.07, velocity: 0.36 },
                    { time: 0.2, duration: 0.1, velocity: 0.22 },
                ]),
            ],
        },
        heroDeath: {
            id: 'heroDeath',
            duration: 0.76,
            tracks: [
                createTonalTrack([
                    { time: 0.0, duration: 0.16, name: 'E4', velocity: 0.75 },
                    { time: 0.2, duration: 0.2, name: 'C4', velocity: 0.68 },
                    { time: 0.44, duration: 0.24, name: 'A3', velocity: 0.62 },
                ]),
                createTonalTrack([
                    { time: 0.04, duration: 0.14, name: 'G3', velocity: 0.4 },
                    { time: 0.28, duration: 0.18, name: 'E3', velocity: 0.34 },
                ]),
                createTonalTrack([
                    { time: 0.0, duration: 0.5, name: 'A2', velocity: 0.28 },
                ]),
                createNoiseTrack([
                    { time: 0.0, duration: 0.08, velocity: 0.24 },
                    { time: 0.4, duration: 0.12, velocity: 0.14 },
                ]),
            ],
        },
        heroRespawn: {
            id: 'heroRespawn',
            duration: 0.56,
            tracks: [
                createTonalTrack([
                    { time: 0.0, duration: 0.1, name: 'C4', velocity: 0.68 },
                    { time: 0.12, duration: 0.1, name: 'E4', velocity: 0.7 },
                    { time: 0.24, duration: 0.14, name: 'A4', velocity: 0.72 },
                ]),
                createTonalTrack([
                    { time: 0.04, duration: 0.08, name: 'G4', velocity: 0.44 },
                    { time: 0.2, duration: 0.1, name: 'C5', velocity: 0.42 },
                ]),
                createTonalTrack([
                    { time: 0.0, duration: 0.24, name: 'A3', velocity: 0.26 },
                ]),
                createNoiseTrack([
                    { time: 0.0, duration: 0.04, velocity: 0.12 },
                ]),
            ],
        },
        waveStart: {
            id: 'waveStart',
            duration: 0.68,
            tracks: [
                createTonalTrack([
                    { time: 0.0, duration: 0.12, name: 'C4', velocity: 0.7 },
                    { time: 0.14, duration: 0.12, name: 'E4', velocity: 0.74 },
                    { time: 0.28, duration: 0.14, name: 'G4', velocity: 0.78 },
                    { time: 0.44, duration: 0.18, name: 'C5', velocity: 0.82 },
                ]),
                createTonalTrack([
                    { time: 0.07, duration: 0.09, name: 'G4', velocity: 0.38 },
                    { time: 0.35, duration: 0.12, name: 'E5', velocity: 0.34 },
                ]),
                createTonalTrack([
                    { time: 0.0, duration: 0.34, name: 'C3', velocity: 0.3 },
                    { time: 0.34, duration: 0.24, name: 'G3', velocity: 0.26 },
                ]),
                createNoiseTrack([
                    { time: 0.0, duration: 0.04, velocity: 0.1 },
                    { time: 0.14, duration: 0.04, velocity: 0.12 },
                    { time: 0.28, duration: 0.04, velocity: 0.14 },
                ]),
            ],
        },
        // victory: {
        //     id: 'victory',
        //     duration: 1.0,
        //     tracks: [
        //         createTonalTrack([
        //             { time: 0.0, duration: 0.12, name: 'C4', velocity: 0.72 },
        //             { time: 0.16, duration: 0.12, name: 'E4', velocity: 0.76 },
        //             { time: 0.32, duration: 0.14, name: 'G4', velocity: 0.8 },
        //             { time: 0.5, duration: 0.28, name: 'C5', velocity: 0.85 },
        //         ]),
        //         createTonalTrack([
        //             { time: 0.08, duration: 0.1, name: 'G4', velocity: 0.42 },
        //             { time: 0.24, duration: 0.1, name: 'C5', velocity: 0.44 },
        //             { time: 0.44, duration: 0.22, name: 'E5', velocity: 0.48 },
        //         ]),
        //         createTonalTrack([
        //             { time: 0.0, duration: 0.34, name: 'C3', velocity: 0.28 },
        //             { time: 0.36, duration: 0.38, name: 'G3', velocity: 0.26 },
        //         ]),
        //         createNoiseTrack([
        //             { time: 0.0, duration: 0.03, velocity: 0.08 },
        //             { time: 0.16, duration: 0.03, velocity: 0.1 },
        //             { time: 0.32, duration: 0.03, velocity: 0.12 },
        //         ]),
        //     ],
        // },
        // defeat: {
        //     id: 'defeat',
        //     duration: 0.96,
        //     tracks: [
        //         createTonalTrack([
        //             { time: 0.0, duration: 0.14, name: 'A3', velocity: 0.78 },
        //             { time: 0.18, duration: 0.16, name: 'F3', velocity: 0.74 },
        //             { time: 0.42, duration: 0.22, name: 'D3', velocity: 0.72 },
        //         ]),
        //         createTonalTrack([
        //             { time: 0.06, duration: 0.12, name: 'C4', velocity: 0.38 },
        //             { time: 0.28, duration: 0.14, name: 'A3', velocity: 0.34 },
        //         ]),
        //         createTonalTrack([
        //             { time: 0.0, duration: 0.48, name: 'D2', velocity: 0.3 },
        //         ]),
        //         createNoiseTrack([
        //             { time: 0.0, duration: 0.08, velocity: 0.2 },
        //             { time: 0.26, duration: 0.12, velocity: 0.16 },
        //         ]),
        //     ],
        // },
    };
}

export class BackgroundMusic {
    constructor(tracks, options = {}) {
        this.tracks = tracks;
        this.waveforms = options.waveforms || ['sine', 'triangle', 'square', 'sawtooth'];
        this.waveformIndex = options.waveformIndex || 0;
        this.defaultLoop = options.loop !== undefined ? options.loop : true;
        this.onTrackChange = options.onTrackChange || null;
        this.onLoadChange = options.onLoadChange || null;
        this.onStateChange = options.onStateChange || null;
        this.onTrackEnded = options.onTrackEnded || null;

        this.midi = null;
        this.synth = null;
        this.part = null;
        this.endEventId = null;
        this.isReady = false;
        this.isPlaying = false;
        this.state = 'stopped';
        this.durationSeconds = 0;
        this.currentTrackIndex = 0;
        this.currentTrack = null;
        this.loadRequestId = 0;
        this.createSynth();
    }

    async loadTrack(index, options = {}) {
        const shouldStart = options.autoplay === true;
        const trackIndex = clamp(index, 0, this.tracks.length - 1);
        const track = this.tracks[trackIndex];
        const requestId = this.loadRequestId + 1;
        this.loadRequestId = requestId;

        try {
            this.stop();
            this.disposePart();
            this.isReady = false;

            const response = await fetch(track.url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} ${response.statusText}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            if (requestId !== this.loadRequestId) {
                return false;
            }

            const midi = new Midi(arrayBuffer);
            if (requestId !== this.loadRequestId) {
                return false;
            }

            this.midi = midi;
            this.durationSeconds = midi.duration;
            this.currentTrackIndex = trackIndex;
            this.currentTrack = track;

            this.configureTransport();
            this.createPart();

            this.isReady = true;
            this.loadError = '';

            if (this.onTrackChange) {
                this.onTrackChange(this.currentTrack, this.currentTrackIndex);
            }
            if (this.onLoadChange) {
                this.onLoadChange(true, this.currentTrack);
            }

            if (shouldStart) {
                await this.play();
            }

            console.log(`Load Complete.: ${track.label}`);
            return true;
        } catch (err) {
            if (requestId !== this.loadRequestId) {
                return false;
            }

            this.loadError = String(err);
            this.isReady = false;
            if (this.onLoadChange) {
                this.onLoadChange(false, track);
            }
            console.error('Failed Loading MIDI:', err);
            return false;
        }
    }

    async play() {
        if (!this.isReady || !this.part) {
            return;
        }

        try {
            await Tone.start();
        } catch (err) {
            this.loadError = String(err);
            console.warn('Unlocked MIDI context.', err);
            return;
        }

        Tone.Transport.stop();
        Tone.Transport.seconds = 0;
        this.clearEndEvent();
        this.scheduleTrackEnd();
        Tone.Transport.start();
        this.isPlaying = true;
        this.state = 'playing';

        if (this.onStateChange) {
            this.onStateChange(this.state);
        }
    }

    pause() {
        if (!this.isPlaying) {
            return;
        }

        Tone.Transport.pause();
        this.isPlaying = false;
        this.state = 'paused';

        if (this.onStateChange) {
            this.onStateChange(this.state);
        }
    }

    stop() {
        Tone.Transport.stop();
        Tone.Transport.seconds = 0;
        this.clearEndEvent();
        this.isPlaying = false;
        this.state = 'stopped';

        if (this.onStateChange) {
            this.onStateChange(this.state);
        }
    }

    async toggle() {
        if (this.isPlaying) {
            this.pause();
        } else {
            await this.play();
        }
    }

    async nextTrack() {
        const nextIndex = (this.currentTrackIndex + 1) % this.tracks.length;
        await this.switchTrack(nextIndex);
    }

    async previousTrack() {
        const previousIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
        await this.switchTrack(previousIndex);
    }

    async switchTrack(index) {
        return this.loadTrack(index, { autoplay: true });
    }

    setWaveform(index) {
        this.waveformIndex = clamp(index, 0, this.waveforms.length - 1);
        this.applyWaveform();
    }

    createSynth() {
        if (this.synth) {
            return;
        }

        this.synth = new Tone.PolySynth(Tone.Synth).toDestination();
        this.applyWaveform();
    }

    applyWaveform() {
        if (!this.synth) {
            return;
        }

        const waveform = this.waveforms[this.waveformIndex];

        try {
            this.synth.set({
                oscillator: {
                    type: waveform
                }
            });
        } catch (err) {
            console.warn('Not supported wave form:', err);
        }
    }

    configureTransport() {
        Tone.Transport.loop = this.currentTrack?.loop ?? this.defaultLoop;
        Tone.Transport.loopStart = 0;
        Tone.Transport.loopEnd = this.durationSeconds;
    }

    createPart() {
        const events = [];
        const synth = this.synth;
        const requestId = this.loadRequestId;

        for (const track of this.midi.tracks) {
            for (const note of track.notes) {
                events.push({
                    time: note.time,
                    duration: note.duration,
                    name: note.name,
                    velocity: note.velocity
                });
            }
        }

        this.part = new Tone.Part((time, note) => {
            if (!synth || requestId !== this.loadRequestId) {
                return;
            }

            synth.triggerAttackRelease(
                note.name,
                note.duration,
                time,
                note.velocity
            );
        }, events);

        this.part.start(0);
    }

    disposePart() {
        if (this.part) {
            this.part.dispose();
            this.part = null;
        }
    }

    clearEndEvent() {
        if (this.endEventId !== null) {
            Tone.Transport.clear(this.endEventId);
            this.endEventId = null;
        }
    }

    scheduleTrackEnd() {
        if (!this.currentTrack || Tone.Transport.loop || this.durationSeconds <= 0) {
            return;
        }

        this.endEventId = Tone.Transport.scheduleOnce(() => {
            this.isPlaying = false;
            this.state = 'stopped';
            this.endEventId = null;

            if (this.onStateChange) {
                this.onStateChange(this.state);
            }
            if (this.onTrackEnded) {
                this.onTrackEnded(this.currentTrack, this.currentTrackIndex);
            }
        }, this.durationSeconds);
    }
}

export class SoundEffect {
    constructor(options = {}) {
        this.masterVolume = clamp(options.volume ?? -10, -36, 6);
        this.voiceVolumes = {
            squareLead: clamp(options.squareLeadVolume ?? -10, -36, 6),
            squareHarmony: clamp(options.squareHarmonyVolume ?? -12, -36, 6),
            triangleBass: clamp(options.triangleBassVolume ?? -14, -36, 6),
            noise: clamp(options.noiseVolume ?? -20, -36, 6),
        };
        this.effectMap = options.effects || buildSoundEffectLibrary();
        this.eventMap = options.eventMap || {};
        this.eventCooldowns = new Map(Object.entries(options.eventCooldowns || {}));
        this.lastEventPlayedAt = new Map();
        this.output = new Tone.Volume(this.masterVolume).toDestination();
        this.ready = false;

        this.squareLead = this.createPolySynth('square', this.voiceVolumes.squareLead);
        this.squareHarmony = this.createPolySynth('square', this.voiceVolumes.squareHarmony);
        this.triangleBass = this.createPolySynth('triangle', this.voiceVolumes.triangleBass);
        this.noiseFilter = new Tone.Filter({
            type: 'bandpass',
            frequency: 1000,
            Q: 1,
        }).connect(this.output);
        this.noise = new Tone.NoiseSynth({
            noise: { type: 'white' },
            envelope: {
                attack: 0.001,
                decay: 0.08,
                sustain: 0,
                release: 0.12,
            },
            volume: this.voiceVolumes.noise,
        }).connect(this.noiseFilter);
    }

    createPolySynth(waveform, volume) {
        return new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: waveform },
            envelope: {
                attack: 0.002,
                decay: 0.08,
                sustain: 0.15,
                release: 0.12,
            },
            volume,
        }).connect(this.output);
    }

    async unlock() {
        if (this.ready) {
            return true;
        }

        try {
            await Tone.start();
            const context = Tone.getContext?.();
            if (context) {
                context.lookAhead = 0;
                context.updateInterval = 0.01;
            }
            this.ready = true;
            return true;
        } catch (err) {
            console.warn('Failed to unlock sound effects audio context.', err);
            return false;
        }
    }

    setEventMap(eventMap = {}) {
        this.eventMap = { ...eventMap };
    }

    setEventCooldown(eventName, cooldownMs) {
        this.eventCooldowns.set(eventName, Math.max(0, Number(cooldownMs) || 0));
    }

    canPlayEvent(eventName) {
        const cooldownMs = this.eventCooldowns.get(eventName);
        if (!cooldownMs) {
            return true;
        }

        const now = performance.now();
        const lastPlayedAt = this.lastEventPlayedAt.get(eventName) ?? -Infinity;
        if (now - lastPlayedAt < cooldownMs) {
            return false;
        }

        this.lastEventPlayedAt.set(eventName, now);
        return true;
    }

    play(effectId, options = {}) {
        const effect = this.effectMap[effectId];
        if (!effect || !this.ready) {
            return false;
        }

        const startTime = Tone.immediate() + Math.max(0, Number(options.delay) || 0);
        for (let trackIndex = 0; trackIndex < effect.tracks.length; trackIndex += 1) {
            const track = effect.tracks[trackIndex];
            this.playTrack(trackIndex, track, startTime);
        }

        return true;
    }

    playTrack(trackIndex, track, startTime) {
        if (!track || !Array.isArray(track.notes) || track.notes.length === 0) {
            return;
        }

        const synth = this.getTrackSynth(trackIndex, track.type);
        if (!synth) {
            return;
        }

        for (const note of track.notes) {
            const time = startTime + Math.max(0, Number(note.time) || 0);
            const duration = Math.max(0.01, Number(note.duration) || 0.05);
            const velocity = clamp(Number(note.velocity) || 0.5, 0, 1);

            if (track.type === 'noise') {
                if (note.frequency) {
                    this.noiseFilter.frequency.setValueAtTime(
                        Math.max(20, Number(note.frequency) || 1000),
                        time
                    );
                }
                synth.triggerAttackRelease(duration, time, velocity);
                continue;
            }

            const noteName = note.name || 'C4';
            synth.triggerAttackRelease(noteName, duration, time, velocity);
        }
    }

    getTrackSynth(trackIndex, trackType) {
        if (trackType === 'noise') {
            return this.noise;
        }

        if (trackIndex === 0) {
            return this.squareLead;
        }

        if (trackIndex === 1) {
            return this.squareHarmony;
        }

        return this.triangleBass;
    }

    handleEvent(eventName, payload = {}) {
        const resolveEffect = this.eventMap[eventName];
        if (!resolveEffect) {
            return false;
        }

        if (!this.canPlayEvent(eventName)) {
            return false;
        }

        const effectId = typeof resolveEffect === 'function'
            ? resolveEffect(payload)
            : resolveEffect;
        if (!effectId) {
            return false;
        }

        return this.play(effectId);
    }
}
