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

export class BackgroundMusic {
    constructor(tracks, options = {}) {
        this.tracks = tracks;
        this.waveforms = options.waveforms || ['sawtooth', 'sine', 'triangle', 'square'];
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
        this.loadError = '';
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

            console.log(`MIDI 加载成功: ${track.label}`);
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
            console.error('MIDI 加载失败:', err);
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
            console.warn('音频上下文尚未解锁，等待用户交互后重试。', err);
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
            console.warn('当前音色不支持该波形设置:', err);
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

    getWaveformLabel() {
        return this.waveforms[this.waveformIndex];
    }

    getTrackLabel() {
        return this.currentTrack ? this.currentTrack.label : '';
    }
}
