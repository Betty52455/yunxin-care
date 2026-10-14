import copy
import tempfile
import unittest
from server import Storage, empty_state, validate_state

class PregnancyTests(unittest.TestCase):
    def state(self):
        s=empty_state()
        s['pregnancy']={'dueDate':'2027-01-30','preWeight':55,'height':165,'entries':[{'id':'e1','date':'2026-10-13','weight':58.2,'systolic':110,'diastolic':70,'note':'测试'}],'visits':[{'id':'v1','date':'2026-10-15','time':'09:00','title':'复诊','note':'带好资料','done':False}]}
        s['notes']=[{'id':'old','title':'原来的备忘','text':'改版后继续保留','created':'2026-10-01','updated':'2026-10-01','pinned':True}]
        return s
    def test_roundtrip_restart_preserves_old_and_new_records(self):
        with tempfile.TemporaryDirectory() as path:
            s=self.state();Storage(path).save(s,0)
            self.assertEqual(Storage(path).read()['state'],s)
            Storage(path).save(empty_state(),1,reset=True)
            self.assertNotIn('pregnancy',Storage(path).read()['state'])
    def test_reject_incomplete_or_duplicate_health_records(self):
        for mutate in [lambda p:p['entries'][0].update(diastolic=None),lambda p:p['entries'][0].update(weight=float('nan')),lambda p:p['entries'].append({**p['entries'][0],'id':'e2'}),lambda p:p['visits'][0].update(time='24:61')]:
            s=self.state();mutate(s['pregnancy'])
            with self.assertRaises(ValueError): validate_state(s)
    def test_old_backup_still_valid(self):
        self.assertEqual(validate_state(empty_state()),empty_state())
