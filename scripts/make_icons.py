"""Draws the Untint app icons (no dependencies): a yellow and a blue tile that overlap in white,
like two colour plates almost in register. Run from the project folder:  python scripts/make_icons.py"""
import math
import pathlib
import struct
import zlib

BG = (0x16, 0x1b, 0x26)
YELLOW = (0xf4, 0xc4, 0x30)
BLUE = (0x3a, 0x8d, 0xde)
OUT = pathlib.Path(__file__).resolve().parent.parent / 'icons'


def rrect_cover(px, py, cx, cy, half, radius):
    """Anti-aliased coverage (0..1) of a rounded square centred on (cx, cy)."""
    qx = abs(px - cx) - (half - radius)
    qy = abs(py - cy) - (half - radius)
    d = math.hypot(max(qx, 0), max(qy, 0)) + min(max(qx, qy), 0) - radius
    return min(1.0, max(0.0, 0.5 - d))


def screen(a, b):
    return tuple(255 - (255 - x) * (255 - y) // 255 for x, y in zip(a, b))


def mix(a, b, t):
    return tuple(round(x + (y - x) * t) for x, y in zip(a, b))


def draw(size, full_bleed):
    s = size
    tile_half, tile_r, off = 0.18 * s, 0.07 * s, 0.08 * s
    rows = []
    for y in range(s):
        row = bytearray([0])
        for x in range(s):
            px, py = x + 0.5, y + 0.5
            bg_a = 1.0 if full_bleed else rrect_cover(px, py, s / 2, s / 2, s / 2, 0.22 * s)
            col = BG
            ya = rrect_cover(px, py, s / 2 - off, s / 2 - off, tile_half, tile_r)
            col = mix(col, YELLOW, ya)
            ba = rrect_cover(px, py, s / 2 + off, s / 2 + off, tile_half, tile_r)
            col = mix(col, screen(col, BLUE), ba)
            row += bytes(col) + bytes([round(255 * bg_a)])
        rows.append(bytes(row))
    return b''.join(rows)


def png(path, size, full_bleed):
    raw = draw(size, full_bleed)

    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)

    data = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0))
    data += chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b'')
    path.write_bytes(data)
    print('wrote', path.name)


SVG = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="22" fill="#161b26"/>
  <rect x="24" y="24" width="36" height="36" rx="7" fill="#f4c430"/>
  <rect x="40" y="40" width="36" height="36" rx="7" fill="#3a8dde" style="mix-blend-mode:screen"/>
</svg>
'''

if __name__ == '__main__':
    OUT.mkdir(exist_ok=True)
    png(OUT / 'icon-192.png', 192, False)
    png(OUT / 'icon-512.png', 512, False)
    png(OUT / 'icon-maskable-512.png', 512, True)
    png(OUT / 'apple-touch-icon.png', 180, True)
    (OUT / 'icon.svg').write_text(SVG, encoding='utf-8')
    print('wrote icon.svg')
