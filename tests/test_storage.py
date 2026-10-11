import copy
import json
from pathlib import Path
import tempfile
import threading
import unittest
import urllib.request
import urllib.error
from http.server import ThreadingHTTPServer
from server import Storage, empty_state, make_handler


class StorageTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.store = Storage(self.temp.name)

    def tearDown(self):
        self.temp.cleanup()

    def with_note(self):
        value = empty_state()
        value['notes'].append({'id':'note-1','title':'想问的问题','text':'恢复后继续保留',
                               'pinned':True,'created':'2026-10-12T00:00:00Z','updated':'2026-10-12T00:00:00Z'})
        return value

    def test_persists_after_storage_restart_and_previous_copy(self):
        first = self.with_note()
        self.store.save(first, 0)
        restarted = Storage(self.temp.name)
        self.assertEqual(restarted.read()['state'], first)
        second = copy.deepcopy(first)
        second['notes'][0]['text'] = '修改后的记录'
        restarted.save(second, 1)
        previous = json.loads((Path(self.temp.name) / 'previous.json').read_text())
        self.assertEqual(previous['state'], first)

    def test_stale_revision_does_not_overwrite(self):
        first = self.with_note()
        self.store.save(first, 0)
        with self.assertRaises(LookupError):
            self.store.save(empty_state(), 0)
        self.assertEqual(self.store.read()['state'], first)

    def test_invalid_backup_leaves_data_untouched(self):
        first = self.with_note()
        self.store.save(first, 0)
        invalid = copy.deepcopy(first)
        invalid['notes'][0]['pinned'] = 'yes'
        with self.assertRaises(ValueError):
            self.store.save(invalid, 1)
        self.assertEqual(self.store.read()['state'], first)

    def test_corrupt_file_is_not_silently_reset(self):
        self.store.directory.mkdir(exist_ok=True)
        self.store.path.write_text('{broken', encoding='utf-8')
        with self.assertRaises(RuntimeError):
            self.store.save(empty_state(), 0)
        self.assertEqual(self.store.path.read_text(), '{broken')

    def test_reset_deletes_previous_private_content(self):
        self.store.save(self.with_note(), 0)
        self.store.save(empty_state(), 1, reset=True)
        self.assertEqual(self.store.read()['state'], empty_state())
        self.assertFalse((self.store.directory / 'previous.json').exists())

    def test_duplicate_day_rejected(self):
        value = empty_state()
        value['moods'] = [{'id':str(i), 'date':'2026-10-12', 'score':3, 'sleep':6, 'note':''} for i in range(2)]
        with self.assertRaises(ValueError):
            self.store.save(value, 0)


class ApiTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.http = ThreadingHTTPServer(('127.0.0.1', 0), make_handler(Storage(self.temp.name)))
        self.thread = threading.Thread(target=self.http.serve_forever, daemon=True)
        self.thread.start()
        self.url = 'http://127.0.0.1:' + str(self.http.server_port)
        self.opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))

    def tearDown(self):
        self.http.shutdown()
        self.http.server_close()
        self.thread.join()
        self.temp.cleanup()

    def request(self, path, data=None, headers=None):
        req = urllib.request.Request(self.url+path, data=None if data is None else json.dumps(data).encode(),
                                     headers={'Content-Type':'application/json', **(headers or {})})
        return self.opener.open(req, timeout=3)

    def test_local_save_and_read(self):
        with self.request('/api/state', {'revision':0, 'state':empty_state()}) as response:
            self.assertEqual(json.load(response)['revision'], 1)
        with self.request('/api/state') as response:
            self.assertEqual(json.load(response)['revision'], 1)

    def test_cross_origin_write_rejected(self):
        with self.assertRaises(urllib.error.HTTPError) as cm:
            self.request('/api/state', {'revision':0,'state':empty_state()}, {'Origin':'https://example.invalid'})
        self.assertEqual(cm.exception.code, 403)

    def test_data_files_not_exposed(self):
        with self.assertRaises(urllib.error.HTTPError) as cm:
            self.request('/data/data.json')
        self.assertEqual(cm.exception.code, 404)


if __name__ == '__main__':
    unittest.main()
