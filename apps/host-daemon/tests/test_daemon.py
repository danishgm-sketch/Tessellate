import threading
import unittest
import os
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from unittest.mock import patch

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import daemon


class TestHostDaemonTransport(unittest.TestCase):
    def test_retry_delay_backs_off_and_is_bounded(self):
        self.assertEqual(daemon.retry_delay(0), 1.0)
        self.assertEqual(daemon.retry_delay(1), 1.0)
        self.assertEqual(daemon.retry_delay(2), 2.0)
        self.assertEqual(daemon.retry_delay(5), 16.0)
        self.assertEqual(daemon.retry_delay(6), 30.0)
        self.assertEqual(daemon.retry_delay(100), 30.0)

    def test_model_adapter_emits_only_the_shared_command_contract(self):
        command = daemon.to_intent_command({
            "action": "apply-feel",
            "summary": "Apply calm precision",
            "feel": "calm precision",
            "confidence": 0.2,
            "divergenceLevel": 50,
            "preserveLockedNodes": False,
            "targetNodeIds": ["section-1"],
        })
        self.assertEqual(command["action"], "apply-feel")
        self.assertEqual(command["feelDescriptors"], "calm precision")
        self.assertEqual(command["targetNodeIds"], ["section-1"])
        self.assertTrue(command["preserveLockedNodes"])
        self.assertNotIn("confidence", command)
        self.assertNotIn("divergenceLevel", command)

    def test_model_adapter_rejects_missing_required_command_fields(self):
        with self.assertRaises(ValueError):
            daemon.to_intent_command({"confidence": 0.9})

    def test_remote_http_and_url_credentials_are_rejected(self):
        with self.assertRaises(ValueError):
            daemon.validate_api_url("http://api.example.test")
        with self.assertRaises(ValueError):
            daemon.validate_api_url("https://user:password@api.example.test")
        with self.assertRaises(ValueError):
            daemon.validate_api_url("https://api.example.test/path?token=secret")

    def test_local_and_https_api_urls_are_accepted(self):
        self.assertEqual(daemon.validate_api_url("http://localhost:8787/"), "http://localhost:8787")
        self.assertEqual(daemon.validate_api_url("http://api:8787"), "http://api:8787")
        self.assertEqual(daemon.validate_api_url("https://api.example.test"), "https://api.example.test")

    def test_redirect_does_not_forward_the_host_secret_to_another_origin(self):
        class TargetHandler(BaseHTTPRequestHandler):
            def do_GET(self):
                self.server.received_headers = dict(self.headers)
                self.send_response(200)
                self.end_headers()

            def log_message(self, *_args):
                return

        target = ThreadingHTTPServer(("127.0.0.1", 0), TargetHandler)
        target.received_headers = None
        target_thread = threading.Thread(target=target.serve_forever, daemon=True)
        target_thread.start()

        class RedirectHandler(BaseHTTPRequestHandler):
            def do_GET(self):
                self.send_response(302)
                self.send_header("Location", f"http://127.0.0.1:{target.server_port}/credential-capture")
                self.end_headers()

            def log_message(self, *_args):
                return

        redirect = ThreadingHTTPServer(("127.0.0.1", 0), RedirectHandler)
        redirect_thread = threading.Thread(target=redirect.serve_forever, daemon=True)
        redirect_thread.start()
        try:
            with patch.object(daemon, "HOST_SECRET", "test-secret-value"):
                response = daemon.make_request(f"http://127.0.0.1:{redirect.server_port}/api/inference/poll")
            self.assertIn("error", response)
            self.assertIsNone(target.received_headers)
        finally:
            redirect.shutdown()
            target.shutdown()
            redirect.server_close()
            target.server_close()
            redirect_thread.join(timeout=2)
            target_thread.join(timeout=2)


if __name__ == "__main__":
    unittest.main()
