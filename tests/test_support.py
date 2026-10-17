import copy
import tempfile
import unittest
from server import Storage, empty_state, validate_state


class SupportTests(unittest.TestCase):
    def state(self):
        s = empty_state()
        s['settings']['support'] = {'stage': 'pregnancy', 'energy': 'brief', 'history': False,
                                    'drafts': {'pregnancy': {'step': 1, 'perspective': 'partner', 'choice': 'listen'}}}
        s['notes'] = [{'id': 'existing', 'title': '原备忘', 'text': '保留', 'created': '2026-10-15', 'updated': '2026-10-15', 'pinned': False}]
        return s

    def test_progress_and_existing_notes_survive_restart_and_backup(self):
        with tempfile.TemporaryDirectory() as folder:
            s = self.state()
            Storage(folder).save(s, 0)
            restored = Storage(folder).read()['state']
            self.assertEqual(restored, s)
            self.assertEqual(validate_state(copy.deepcopy(restored)), s)
            Storage(folder).save(empty_state(), 1, reset=True)
            self.assertNotIn('support', Storage(folder).read()['state']['settings'])

    def test_invalid_progress_does_not_overwrite_existing_data(self):
        with tempfile.TemporaryDirectory() as folder:
            store = Storage(folder)
            store.save(self.state(), 0)
            for change in [lambda s: s['settings']['support'].update(energy='unknown'),
                           lambda s: s['settings']['support']['drafts']['pregnancy'].update(choice='own'),
                           lambda s: s['settings']['support']['drafts']['pregnancy'].update(step=2, choice='')]:
                bad = self.state()
                change(bad)
                with self.assertRaises(ValueError):
                    store.save(bad, 1)
                self.assertEqual(store.read()['state'], self.state())

    def test_uncertain_feedback_is_valid_but_blank_is_not(self):
        s = self.state()
        s['activities'] = [{'id': 'a', 'activityId': 'small-pause', 'help': '不确定', 'note': '', 'created': '2026-10-15'}]
        validate_state(s)
        s['activities'][0]['help'] = ''
        with self.assertRaises(ValueError):
            validate_state(s)

    def test_feedback_context_roundtrip_and_invalid_stage(self):
        s = self.state()
        s['activities'] = [{'id': 'a', 'activityId': 'small-pause', 'help': '不确定', 'note': '', 'created': '2026-10-17', 'context': {'stage': 'postpartum'}}]
        with tempfile.TemporaryDirectory() as folder:
            store = Storage(folder)
            store.save(s, 0)
            self.assertEqual(store.read()['state']['activities'][0]['context']['stage'], 'postpartum')
            s['activities'][0]['context']['stage'] = 'guessed'
            with self.assertRaises(ValueError): store.save(s, 1)
            self.assertEqual(store.read()['revision'], 1)
