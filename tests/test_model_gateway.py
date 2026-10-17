import json
import os
import unittest
from unittest.mock import patch
import model_gateway as m

class GatewayTests(unittest.TestCase):
    def test_disabled_without_config_and_no_network(self):
        with patch.dict(os.environ, {}, clear=True), patch.object(m, 'build_opener') as call:
            self.assertFalse(m.config()['enabled'])
            with self.assertRaises(RuntimeError): m.propose({'text':'很累','consent':True})
            call.assert_not_called()

    def test_no_send_without_consent(self):
        with patch.object(m, 'build_opener') as call:
            with self.assertRaises(ValueError): m.propose({'text':'很累'})
            call.assert_not_called()

    def test_remote_plaintext_and_embedded_credentials_disabled(self):
        for url in ['http://example.org/v1/chat/completions','https://user:password@example.org/v1/chat/completions']:
            with patch.dict(os.environ, {'YUNXIN_MODEL_URL':url,'YUNXIN_MODEL_NAME':'configured-model'}, clear=True):
                self.assertFalse(m.config()['enabled'])

    def test_contract_mock_sends_only_current_expression(self):
        with patch.dict(os.environ, {'YUNXIN_MODEL_URL':'http://127.0.0.1:11434/v1/chat/completions','YUNXIN_MODEL_NAME':'configured-model'}, clear=True), patch.object(m,'build_opener') as opener:
            result={'candidates':[{'category':'休息','evidence':'很累'}]}
            opener.return_value.open.return_value.__enter__.return_value.read.return_value=json.dumps({'choices':[{'message':{'content':json.dumps(result)}}]}).encode()
            self.assertEqual(m.propose({'text':'很累','consent':True,'records':['SHOULD_NOT_SEND']})['result'],result)
            request=opener.return_value.open.call_args.args[0]
            self.assertNotIn('SHOULD_NOT_SEND',request.data.decode())
            self.assertEqual(json.loads(request.data)['messages'][1]['content'],'很累')

    def test_bad_model_content_and_error_details_are_not_returned(self):
        with patch.dict(os.environ, {'YUNXIN_MODEL_URL':'http://localhost:11434/v1/chat/completions','YUNXIN_MODEL_NAME':'configured-model'}, clear=True), patch.object(m,'build_opener') as opener:
            opener.return_value.open.side_effect=RuntimeError('secret-key private-text')
            with self.assertRaisesRegex(RuntimeError,'未返回可核验') as err:m.propose({'text':'很累','consent':True})
            self.assertNotIn('secret',str(err.exception))

    def test_grounding_and_allowlist_reject_extra_or_invented_fields(self):
        for value in [{'candidates':[],'owner':'伴侣'},{'candidates':[{'category':'疾病','evidence':'很累'}]},{'candidates':[{'category':'休息','evidence':'想睡觉'}]}]:
            with self.assertRaises(ValueError):m.validate_result(value,'很累')
