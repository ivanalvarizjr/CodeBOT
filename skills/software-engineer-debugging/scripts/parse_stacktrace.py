#!/usr/bin/env python3
"""
parse_stacktrace.py — Ekstrak file:line dan pesan error utama dari stack trace Flutter.
Usage: python scripts/parse_stacktrace.py <log_file>
"""
import sys
import re
import os

def parse_log(filepath):
    if not os.path.exists(filepath):
        print(f"Error: File {filepath} not found.")
        return

    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Cari baris yang mengandung file Dart (package:... atau file://...)
    dart_frames = re.findall(r'(package:[\w/]+\.dart:\d+:\d+)', content)
    
    # Cari pesan exception utama
    exceptions = re.findall(r'^(?:Unhandled Exception|Exception|Error):\s*(.+)$', content, re.MULTILINE)

    print("=== STACK TRACE ANALYSIS ===")
    print(f"File: {filepath}")
    
    if exceptions:
        print("\n[Exceptions Found]")
        for exc in set(exceptions): # Hapus duplikat
            print(f"  - {exc}")
    else:
        print("\n[No explicit exceptions found in logs]")

    if dart_frames:
        print("\n[Dart Frames (Top 5)]")
        # Hilangkan duplikat sambil mempertahankan urutan
        seen = set()
        unique_frames = []
        for frame in dart_frames:
            if frame not in seen:
                seen.add(frame)
                unique_frames.append(frame)
                
        for frame in unique_frames[:5]:
            print(f"  -> {frame}")
    else:
        print("\n[No Dart frames found. This might be a native crash.]")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python parse_stacktrace.py <log_file>")
        sys.exit(1)
    parse_log(sys.argv[1])