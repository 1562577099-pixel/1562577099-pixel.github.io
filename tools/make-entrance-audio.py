from pathlib import Path
import wave
import numpy as np

RATE = 44100
RNG = np.random.default_rng(2711)
OUT = Path(__file__).resolve().parents[1] / 'dist/assets/audio'
OUT.mkdir(exist_ok=True)


def noise(length, low, high):
    size = round(length * RATE)
    spectrum = np.fft.rfft(RNG.normal(size=size))
    frequencies = np.fft.rfftfreq(size, 1 / RATE)
    weight = np.exp(-(frequencies / high) ** 4)
    weight *= 1 - np.exp(-(frequencies / low) ** 4)
    signal = np.fft.irfft(spectrum * weight, n=size)
    return signal / max(np.std(signal), .0001)


def place(track, signal, start, level=1):
    offset = round(start * RATE)
    count = min(len(signal), len(track) - offset)
    if count > 0:
        track[offset:offset + count] += signal[:count] * level


def metal_click(length=.18, pitch=1500):
    t = np.arange(round(length * RATE)) / RATE
    strike = noise(length, 900, 6500) * np.exp(-t / .006) * .34
    for ratio, decay, level in [(1, .055, .32), (1.61, .035, .15), (2.34, .023, .08)]:
        strike += np.sin(2 * np.pi * pitch * ratio * t) * np.exp(-t / decay) * level
    strike[:44] *= np.linspace(0, 1, 44)
    return strike


def body_click(length=.18, pitch=150):
    t = np.arange(round(length * RATE)) / RATE
    body = noise(length, 100, 2000) * np.exp(-t / .025) * .24
    body += np.sin(2 * np.pi * pitch * t) * np.exp(-t / .045) * .34
    body[:44] *= np.linspace(0, 1, 44)
    return body


def save(name, track):
    dry = track.copy()
    for delay, level in [(.023, .08), (.047, .045), (.079, .022)]:
        place(track, dry, delay, level)
    track -= np.mean(track)
    edge = round(.012 * RATE)
    track[:edge] *= np.linspace(0, 1, edge)
    track[-edge:] *= np.linspace(1, 0, edge)
    track *= .70 / max(np.max(np.abs(track)), .0001)
    pcm = np.round(track * 32767).astype('<i2')
    with wave.open(str(OUT / name), 'wb') as file:
        file.setnchannels(1)
        file.setsampwidth(2)
        file.setframerate(RATE)
        file.writeframes(pcm.tobytes())
    print(f'{name}: {len(track) / RATE:.2f}s, peak {np.max(np.abs(track)):.2f}, RMS {np.sqrt(np.mean(track ** 2)):.3f}')


unlock = np.zeros(round(.88 * RATE))
for start, pitch, level in [(.008, 1930, .43), (.07, 2430, .16), (.19, 1360, .28), (.29, 1740, .18), (.39, 1150, .22)]:
    place(unlock, metal_click(pitch=pitch), start, level)
t = np.arange(round(.34 * RATE)) / RATE
scrape = noise(.34, 450, 3300) * np.sin(np.pi * np.arange(len(t)) / len(t)) ** 2
scrape *= .4 + .6 * np.sin(2 * np.pi * 29 * t) ** 2
place(unlock, scrape, .18, .035)
place(unlock, body_click(pitch=240), .52, .65)
place(unlock, metal_click(.17, 830), .56, .22)
save('key-unlock.wav', unlock)

opening = np.zeros(round(1.75 * RATE))
place(opening, body_click(.14, 110), .008, .28)
t = np.arange(round(1.28 * RATE)) / RATE
envelope = np.sin(np.pi * np.arange(len(t)) / len(t)) ** 1.3
friction = (.55 + .45 * np.sin(2 * np.pi * (6.7 * t + .8 * np.sin(3.2 * t))) ** 2)
frequency = 178 - 49 * t + 10 * np.sin(2 * np.pi * 2.1 * t) + 3 * np.sin(2 * np.pi * 19 * t)
phase = 2 * np.pi * np.cumsum(frequency) / RATE
creak = (np.sin(phase) * .22 + np.sin(phase * 2.03) * .07 + np.sin(phase * 3.11) * .025)
creak += noise(1.28, 170, 2100) * .043
creak *= envelope * friction
place(opening, creak, .06)
place(opening, body_click(.22, 92), 1.24, .30)
save('door-open.wav', opening)
