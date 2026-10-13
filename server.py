#!/usr/bin/env python3
"""孕心智护的本机文件服务。仅使用 Python 标准库，不连接外部服务。"""
import argparse
import copy
import json
import math
import os
from pathlib import Path
import tempfile
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
MAX_BYTES = 8 * 1024 * 1024


def empty_state():
    return {"version": 1, "settings": {"name": "", "stage": "产后居家", "preferred": "休息", "available": 15},
            "moods": [], "needs": [], "tasks": [], "notes": [], "practices": [], "activities": [], "contacts": [],
            "helpCard": {"person": "", "place": "", "message": ""}}


def validate_state(s):
    def require(ok, message="备份内容格式不正确"):
        if not ok:
            raise ValueError(message)

    def string(value, maximum=20000):
        require(isinstance(value, str) and len(value) <= maximum)

    def number(value, low, high):
        require(type(value) in (int, float) and math.isfinite(value) and low <= value <= high)

    def obj(value, fields):
        require(isinstance(value, dict) and set(fields) <= set(value))

    def date(value):
        from datetime import date as Date
        string(value, 10)
        Date.fromisoformat(value)

    obj(s, empty_state().keys())
    require(type(s["version"]) is int and s["version"] == 1, "不支持此备份版本")
    obj(s["settings"], ["name", "stage", "preferred", "available"])
    for k in ("name", "stage", "preferred"):
        string(s["settings"][k], 100)
    require(s["settings"]["preferred"] in ("倾听", "休息", "实际帮忙", "信息", "陪伴"))
    number(s["settings"]["available"], 1, 120)
    if "pet" in s["settings"]:
        import re
        pet = s["settings"]["pet"]
        obj(pet, ["name", "face", "eyes", "gap", "smile", "hair", "skin", "hairColor", "outfit", "accessory"])
        string(pet["name"], 12)
        for key in ("face", "eyes", "gap", "smile"):
            number(pet[key], 0, 100)
        for key in ("skin", "hairColor", "outfit"):
            require(isinstance(pet[key], str) and re.fullmatch(r"#[0-9a-fA-F]{6}", pet[key]) is not None)
        require(pet["hair"] in ("bob", "short", "buns"))
        require(pet["accessory"] in ("leaf", "glasses", "none"))
    if "pregnancy" in s:
        p = s["pregnancy"]
        obj(p, ["dueDate", "preWeight", "height", "entries", "visits"])
        if p["dueDate"]:
            date(p["dueDate"])
        else:
            require(p["dueDate"] == "")
        for key, low, high in (("preWeight", 20, 300), ("height", 80, 230)):
            if p[key] is not None:
                number(p[key], low, high)
        import re
        for group in ("entries", "visits"):
            require(isinstance(p[group], list) and len(p[group]) <= 10000)
            ids, dates = set(), set()
            for row in p[group]:
                obj(row, ["id", "date", "note"] + (["weight", "systolic", "diastolic"] if group == "entries" else ["title", "time", "done"]))
                string(row["id"], 100)
                require(row["id"] and row["id"] not in ids)
                ids.add(row["id"])
                date(row["date"])
                string(row["note"], 5000)
                if group == "entries":
                    require(row["date"] not in dates, "同一天的身体记录请合并到一条")
                    dates.add(row["date"])
                    for key, low, high in (("weight", 20, 300), ("systolic", 40, 300), ("diastolic", 20, 200)):
                        if row[key] is not None:
                            number(row[key], low, high)
                    require((row["systolic"] is None) == (row["diastolic"] is None), "血压请同时填写高压和低压")
                    require(row["weight"] is not None or row["systolic"] is not None or row["note"].strip(), "至少填写一项身体记录")
                else:
                    string(row["title"], 100)
                    require(row["title"].strip())
                    string(row["time"], 5)
                    require(not row["time"] or re.fullmatch(r"([01]\d|2[0-3]):[0-5]\d", row["time"]))
                    require(type(row["done"]) is bool)
    obj(s["helpCard"], ["person", "place", "message"])
    for key in ("person", "place", "message"):
        string(s["helpCard"][key])
    shapes = {
        "moods": ["date", "score", "sleep", "note"],
        "needs": ["category", "text", "created"],
        "tasks": ["title", "date", "time", "owner", "details", "status", "shared", "revoked", "category", "feedback", "proposal", "needId"],
        "notes": ["title", "text", "pinned", "created", "updated"],
        "practices": ["scenario", "text", "created"],
        "activities": ["activityId", "help", "note", "created"],
        "contacts": ["name", "phone", "kind", "address", "note"],
    }
    for group, fields in shapes.items():
        require(isinstance(s[group], list) and len(s[group]) <= 10000)
        ids = set()
        for row in s[group]:
            obj(row, ["id"] + fields)
            string(row["id"], 100)
            require(bool(row["id"]) and row["id"] not in ids)
            ids.add(row["id"])
            special = {"score", "sleep", "pinned", "shared", "revoked", "feedback", "help"}
            for key in fields:
                if key not in special:
                    string(row[key])
            if group == "moods":
                date(row["date"])
                number(row["score"], 1, 5)
                require(type(row["score"]) is int)
                number(row["sleep"], 0, 24)
            if group in ("needs", "tasks"):
                require(row["category"] in ("倾听", "休息", "实际帮忙", "信息", "陪伴"))
            if group == "notes":
                require(type(row["pinned"]) is bool)
            if group == "activities":
                require(row["help"] in ("有帮助", "一般", "不适合"))
            if group == "tasks":
                date(row["date"])
                require(row["owner"] in ("妈妈", "伴侣"))
                require(row["status"] in ("draft", "waiting", "accepted", "in_progress", "completed", "cancelled", "proposed"))
                require(type(row["shared"]) is bool and type(row["revoked"]) is bool)
                if row["feedback"] is not None:
                    obj(row["feedback"], ["help", "burden", "note"])
                    require(row["feedback"]["help"] in ("有帮助", "一般", "没有帮助"))
                    require(row["feedback"]["burden"] in ("没有", "一点", "较多"))
                    string(row["feedback"]["note"])
    require(len({x["date"] for x in s["moods"]}) == len(s["moods"]), "同一天只能保留一条心情记录")
    return s


class Storage:
    def __init__(self, directory):
        self.directory = Path(directory)
        self.path = self.directory / "data.json"
        self.lock = threading.RLock()

    def read(self):
        with self.lock:
            if not self.path.exists():
                return {"revision": 0, "state": empty_state()}
            try:
                value = json.loads(self.path.read_text(encoding="utf-8"))
                validate_state(value["state"])
                if type(value["revision"]) is not int:
                    raise ValueError("invalid revision")
                return value
            except (ValueError, KeyError, TypeError, OSError) as exc:
                raise RuntimeError("本地数据文件无法读取。为保护记录，已停止保存；请保留 data 文件夹并恢复备份。") from exc

    def save(self, state, revision, reset=False):
        validate_state(state)
        if reset and state != empty_state():
            raise ValueError("清空操作必须重置全部数据")
        with self.lock:
            old = self.read()
            if type(revision) is not int or revision != old["revision"]:
                raise LookupError("记录已在另一个页面更新，请刷新后重试。")
            self.directory.mkdir(parents=True, exist_ok=True)
            new = {"revision": revision + 1, "state": state}
            # 先完整写入临时文件，再替换正式文件，防止写到一半留下残缺 JSON。
            if not reset:
                self.atomic_write(self.directory / "previous.json", old)
            self.atomic_write(self.path, new)
            if reset:
                (self.directory / "previous.json").unlink(missing_ok=True)
            return new

    def atomic_write(self, path, value):
        fd, name = tempfile.mkstemp(dir=self.directory, prefix=".save-", suffix=".tmp")
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as f:
                json.dump(value, f, ensure_ascii=False, allow_nan=False)
                f.flush()
                os.fsync(f.fileno())
            os.replace(name, path)
        finally:
            if os.path.exists(name):
                os.unlink(name)


def make_handler(storage):
    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *_):
            pass

        def send(self, code, data, content_type="application/json; charset=utf-8"):
            if not isinstance(data, bytes):
                data = json.dumps(data, ensure_ascii=False).encode("utf-8")
            self.send_response(code)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Cache-Control", "no-store")
            self.send_header("X-Content-Type-Options", "nosniff")
            self.send_header("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self' https://api.open-meteo.com https://geocoding-api.open-meteo.com; frame-ancestors 'none'; base-uri 'none'; form-action 'self'")
            self.end_headers()
            self.wfile.write(data)

        def allowed(self):
            port = self.server.server_port
            hosts = {f"127.0.0.1:{port}", f"localhost:{port}"}
            origin = self.headers.get("Origin")
            return self.headers.get("Host") in hosts and (not origin or origin in {f"http://{h}" for h in hosts}) and self.headers.get("Sec-Fetch-Site") != "cross-site"

        def do_GET(self):
            if not self.allowed():
                return self.send(403, {"error": "仅允许本机页面访问"})
            path = urlparse(self.path).path
            if path == "/api/health":
                return self.send(200, {"app": "yunxin-local", "version": 1})
            if path == "/api/state":
                try:
                    return self.send(200, storage.read())
                except RuntimeError as e:
                    return self.send(500, {"error": str(e)})
            files = {"/": ("index.html", "text/html"), "/index.html": ("index.html", "text/html"),
                     "/weather.js": ("weather.js", "text/javascript"),
                     "/care.js": ("care.js", "text/javascript"), "/care.css": ("care.css", "text/css"),
                     "/pregnancy.js": ("pregnancy.js", "text/javascript"),
                     "/assets/plush-bob.png": ("assets/plush-bob.png", "image/png"),
                     "/assets/plush-buns.png": ("assets/plush-buns.png", "image/png"),
                     "/pet.js": ("pet.js", "text/javascript"), "/pet.css": ("pet.css", "text/css"),
                     "/app.js": ("app.js", "text/javascript"), "/styles.css": ("styles.css", "text/css"),
                     "/illustration.svg": ("illustration.svg", "image/svg+xml"), "/favicon.svg": ("favicon.svg", "image/svg+xml")}
            if path not in files:
                return self.send(404, {"error": "页面不存在"})
            name, mime = files[path]
            return self.send(200, (ROOT / "web" / name).read_bytes(), mime + "; charset=utf-8")

        def do_POST(self):
            if not self.allowed():
                return self.send(403, {"error": "仅允许本机页面访问"})
            if urlparse(self.path).path != "/api/state":
                return self.send(404, {"error": "接口不存在"})
            try:
                size = int(self.headers.get("Content-Length", "0"))
                if not 0 < size <= MAX_BYTES:
                    return self.send(413, {"error": "数据过大或为空，最大支持 8 MB"})
                if self.headers.get("Content-Type", "").split(";")[0] != "application/json":
                    return self.send(415, {"error": "需要 JSON 格式"})
                value = json.loads(self.rfile.read(size))
                if not isinstance(value, dict) or not {"state", "revision"} <= value.keys():
                    raise ValueError("缺少记录或版本号")
                result = storage.save(value["state"], value["revision"], value.get("reset") is True)
                return self.send(200, result)
            except LookupError as e:
                return self.send(409, {"error": str(e)})
            except (ValueError, TypeError) as e:
                return self.send(400, {"error": "数据格式不正确：" + str(e)})
            except (RuntimeError, OSError) as e:
                return self.send(500, {"error": str(e)})

    return Handler


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--data-dir", default=str(ROOT / "data"))
    args = parser.parse_args()
    server = ThreadingHTTPServer(("127.0.0.1", args.port), make_handler(Storage(args.data_dir)))
    print(f"孕心智护已启动：http://127.0.0.1:{args.port}  （关闭此窗口会停止服务，已保存的数据不会丢失）", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
