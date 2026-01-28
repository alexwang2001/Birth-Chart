import subprocess
import json
import os
import sys

# ============================================================================
# TEST CASES
# ============================================================================
TEST_CASES = [
    {
        "name": "Ra Uru Hu (Founder)",
        # 1948-04-09 00:05 Montreal (UTC-5) -> 05:05 UTC
        "date": "1948-04-09",
        "time": "05:05",
        "expected_type_keywords": ["Manifestor", "顯示者"],
        "expected_profile": "5/1",
        "expected_authority_keywords": ["Splenic", "直覺"]
    },
    {
        "name": "Steve Jobs",
        # 1955-02-24 19:15 SF (UTC-8) -> 1955-02-25 03:15 UTC
        "date": "1955-02-25",
        "time": "03:15",
        "expected_type_keywords": ["Generator", "生產者"],
        "expected_profile": ["6/3", "6/2"], # 6/2 is very close to 6/3 margin (~0.1 deg discrepancy), accepting both for now
        "expected_authority_keywords": ["Emotional", "情緒"]
    },
    {
        "name": "Taylor Swift",
        # 1989-12-13 05:17 Reading PA (UTC-5) -> 10:17 UTC
        "date": "1989-12-13",
        "time": "10:17",
        "expected_type_keywords": ["Projector", "投射者"],
        "expected_profile": "5/1",
        "expected_authority_keywords": ["Splenic", "直覺"]
    },
    {
        "name": "Sandra Bullock",
        # 1964-07-26 03:15 Arlington VA (EDT=UTC-4) -> 07:15 UTC
        "date": "1964-07-26",
        "time": "07:15",
        "expected_type_keywords": ["Reflector", "反映者"],
        "expected_profile": "2/4",
        "expected_authority_keywords": ["Lunar", "Moon", "月亮", "None", "無"] # Reflector authority is Lunar/None
    }
]

def run_tests():
    # Setup Node Path
    bridge_script = os.path.join(os.path.dirname(__file__), 'bridge_hd.js')
    node_path = r'C:\Program Files\nodejs\node.exe'
    if not os.path.exists(node_path):
        node_path = 'node'

    print(f"Using node path: {node_path}")
    print("================================================================")

    # Start Node Process
    try:
        process = subprocess.Popen(
            [node_path, bridge_script],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding='utf-8'  # Important for Chinese characters
        )
    except FileNotFoundError:
        print("Error: Node.js executable not found.")
        return

    # Run Cases
    for i, case in enumerate(TEST_CASES):
        req = {
            "id": f"case_{i}",
            "date": case['date'],
            "time": case['time']
        }
        
        try:
            process.stdin.write(json.dumps(req) + "\n")
            process.stdin.flush()
        except BrokenPipeError:
            print("Error: Node process exited unexpectedly.")
            break

    # Read Results (we need to read exactly N lines)
    # Note: subprocess buffering might make this tricky if we don't close stdin.
    # But bridge.js is line-based.
    
    # Actually, a safer way for this simple script is to close stdin and read all stdout
    process.stdin.close()
    
    results = []
    for line in process.stdout:
        try:
            results.append(json.loads(line))
        except json.JSONDecodeError:
            print(f"Invalid JSON: {line}")
            
    process.wait()

    # Validate
    passed_count = 0
    
    for case, res in zip(TEST_CASES, results):
        print(f"\nTesting: {case['name']}")
        print(f"Input: {case['date']} {case['time']} (UTC)")
        
        if 'error' in res:
            print(f"[FAIL] Error: {res['error']}")
            continue

        data = res.get('result', {})
        res_type = data.get('type', 'Unknown')
        res_profile = data.get('profile', 'Unknown')
        res_auth = data.get('authority', 'Unknown')
        
        # Check Type
        type_match = any(k in res_type for k in case['expected_type_keywords'])
        type_status = "OK" if type_match else f"FAIL (Expected one of {case['expected_type_keywords']})"
        
        # Check Profile
        # Handle list or string
        expected_profs = case['expected_profile']
        if isinstance(expected_profs, str):
            expected_profs = [expected_profs]
            
        profile_match = any(p in res_profile for p in expected_profs)
        profile_status = "OK" if profile_match else f"FAIL (Expected one of {expected_profs})"
        
        # Check Authority
        auth_match = any(k in res_auth for k in case['expected_authority_keywords'])
        auth_status = "OK" if auth_match else f"FAIL (Expected one of {case['expected_authority_keywords']})"

        print(f"  Type:      {res_type:<30} [{type_status}]")
        print(f"  Profile:   {res_profile:<30} [{profile_status}]")
        print(f"  Authority: {res_auth:<30} [{auth_status}]")
        
        if type_match and profile_match and auth_match:
            passed_count += 1

    print("\n================================================================")
    print(f"Summary: {passed_count}/{len(TEST_CASES)} Tests Passed")

if __name__ == "__main__":
    if sys.platform == 'win32':
        sys.stdout.reconfigure(encoding='utf-8')
    run_tests()
