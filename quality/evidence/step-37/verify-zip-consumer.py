"""Extract the fflate-generated fixture with Python's independent ZIP reader."""

from __future__ import annotations

import hashlib
import json
import shutil
import sys
import tempfile
import zipfile
from pathlib import Path


archive_path = Path(sys.argv[1]).resolve()
expected = {
    "README.md": "# Tessellate ZIP consumer fixture\n\nIndependent extraction check.\n",
    "package.json": '{\n  "name": "tessellate-zip-consumer-fixture",\n  "version": "1.0.0"\n}',
    "src/App.tsx": "export function App() { return <main>ZIP extraction verified</main>; }\n",
}

with tempfile.TemporaryDirectory(prefix="tessellate-zip-consumer-") as temp_dir:
    extracted = Path(temp_dir) / "clean-extraction"
    extracted.mkdir()
    with zipfile.ZipFile(archive_path) as archive:
        names = archive.namelist()
        if set(names) != set(expected):
            raise SystemExit(f"Unexpected ZIP entry set: {names!r}")
        if archive.testzip() is not None:
            raise SystemExit("ZIP CRC validation failed")
        archive.extractall(extracted)

    files = {}
    for name, expected_content in expected.items():
        path = extracted / name
        content = path.read_text(encoding="utf-8")
        if content != expected_content:
            raise SystemExit(f"Extracted content mismatch for {name}")
        files[name] = {
            "bytes": path.stat().st_size,
            "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        }

    report = {
        "result": "passed",
        "consumer": f"Python {sys.version.split()[0]} zipfile",
        "source": str(archive_path),
        "extraction_directory": "fresh temporary directory (removed automatically)",
        "entry_count": len(files),
        "files": files,
        "archive_crc": "passed",
    }
    report_text = json.dumps(report, indent=2) + "\n"
    (archive_path.parent / "zip-consumer.json").write_text(report_text, encoding="utf-8")
    print(report_text, end="")
