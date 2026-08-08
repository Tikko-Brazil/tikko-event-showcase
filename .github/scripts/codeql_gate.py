#!/usr/bin/env python3
"""Fail the build on high/critical CodeQL findings.

CodeQL's own action never fails a run — it only publishes alerts, and on a
repository without GitHub Advanced Security it cannot even do that. This script
turns the SARIF it produces into an exit code so SAST can be a required check.

Findings are matched against .github/security/codeql-suppressions.json, where
every entry must carry a reason and an expiry date. An expired suppression is
itself a failure, so a silenced finding cannot be forgotten.

Usage: codeql_gate.py <sarif-file-or-directory> [...]
"""

from __future__ import annotations

import datetime as dt
import json
import os
import pathlib
import sys

# CodeQL reports severity on the CVSS 0-10 scale. 7.0 is the high/critical
# boundary, matching the threshold used for dependency and container scanning
# so that "high or above blocks" means one thing across the whole pipeline.
THRESHOLD = 7.0

SUPPRESSIONS = pathlib.Path(".github/security/codeql-suppressions.json")


def sarif_files(argv: list[str]) -> list[pathlib.Path]:
    out: list[pathlib.Path] = []
    for raw in argv:
        p = pathlib.Path(raw)
        if p.is_dir():
            out.extend(sorted(p.rglob("*.sarif")))
        elif p.is_file():
            out.append(p)
    return out


def rule_severities(run: dict) -> dict[str, float]:
    """Map ruleId -> security-severity.

    CodeQL puts the bundled query metadata under tool.extensions, not
    tool.driver, so reading only the driver silently yields no severities and
    the gate passes everything.
    """
    severities: dict[str, float] = {}
    tool = run.get("tool", {})
    for source in [tool.get("driver", {})] + list(tool.get("extensions", []) or []):
        for rule in source.get("rules", []) or []:
            raw = (rule.get("properties") or {}).get("security-severity")
            if raw is None:
                continue
            try:
                severities[rule["id"]] = float(raw)
            except (TypeError, ValueError):
                continue
    return severities


def load_suppressions() -> tuple[dict[str, dict], list[str]]:
    if not SUPPRESSIONS.exists():
        return {}, []
    entries = json.loads(SUPPRESSIONS.read_text()).get("suppressions", [])
    today = dt.date.today()
    active: dict[str, dict] = {}
    expired: list[str] = []
    for entry in entries:
        key = f"{entry['rule']}@{entry['path']}"
        try:
            until = dt.date.fromisoformat(entry["expires"])
        except (KeyError, ValueError):
            expired.append(f"{key} (missing or malformed `expires`)")
            continue
        if until < today:
            expired.append(f"{key} (expired {entry['expires']})")
        else:
            active[key] = entry
    return active, expired


def main() -> int:
    files = sarif_files(sys.argv[1:])
    if not files:
        print("::error::No SARIF produced — CodeQL did not run, so SAST was not enforced.")
        return 1

    active, expired = load_suppressions()
    blocking: list[tuple[str, str, int, float, str]] = []
    suppressed = 0

    for path in files:
        sarif = json.loads(path.read_text())
        for run in sarif.get("runs", []):
            severities = rule_severities(run)
            for result in run.get("results", []):
                rule = result.get("ruleId") or "unknown"
                severity = severities.get(rule)
                if severity is None or severity < THRESHOLD:
                    continue

                locations = result.get("locations") or []
                phys = (locations[0].get("physicalLocation", {}) if locations else {})
                file_path = (phys.get("artifactLocation", {}) or {}).get("uri", "unknown")
                line = (phys.get("region", {}) or {}).get("startLine", 0)
                message = (result.get("message", {}) or {}).get("text", "")

                if f"{rule}@{file_path}" in active:
                    suppressed += 1
                    continue
                blocking.append((rule, file_path, line, severity, message))

    for rule, file_path, line, severity, message in blocking:
        # Only the rule, location and CodeQL's own message are printed. Source
        # snippets are deliberately left out: a SAST hit can sit on a line that
        # contains a credential, and the run log is not the place for it.
        print(f"::error file={file_path},line={line}::[{rule} {severity}] {message}")

    summary = [
        "## CodeQL gate",
        "",
        f"- Threshold: security-severity >= {THRESHOLD} (high/critical)",
        f"- Blocking findings: **{len(blocking)}**",
        f"- Suppressed by policy: {suppressed}",
        f"- SARIF files inspected: {len(files)}",
    ]
    if blocking:
        summary += ["", "| Rule | Location | Severity |", "| --- | --- | --- |"]
        summary += [
            f"| `{rule}` | `{file_path}:{line}` | {severity} |"
            for rule, file_path, line, severity, _ in blocking
        ]
    if expired:
        summary += ["", "### Expired suppressions", ""] + [f"- {e}" for e in expired]

    step_summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if step_summary:
        with open(step_summary, "a", encoding="utf-8") as fh:
            fh.write("\n".join(summary) + "\n")
    print("\n".join(summary))

    for entry in expired:
        print(f"::error::Expired CodeQL suppression: {entry}")

    return 1 if blocking or expired else 0


if __name__ == "__main__":
    sys.exit(main())
