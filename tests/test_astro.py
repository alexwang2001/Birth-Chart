
import subprocess
import json
import os
import sys
from nasa_data import TEST_DATA

# ============================================================================
# TEST/ASTRO_BRIDGE_TEST.PY
# Verifies JS logic directly by calling node bridge.
# ============================================================================

def run_node_bridge():
    # Start node process
    bridge_path = os.path.join(os.path.dirname(__file__), 'bridge.js')
    
    # Check if bridge exists
    if not os.path.exists(bridge_path):
        print(f"Error: Bridge script not found at {bridge_path}")
        sys.exit(1)
    
    # Attempt to call 'node'
    # If 'node' is not in PATH, use absolute path found
    node_path = r'C:\Program Files\nodejs\node.exe'
    if not os.path.exists(node_path):
        node_path = 'node' # Fallback to PATH

    try:
        proc = subprocess.Popen(
            [node_path, bridge_path], 
            stdin=subprocess.PIPE, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE, 
            text=True
        )
    except FileNotFoundError:
        print("Error: 'node' executable not found. Please install Node.js and ensure it is in your PATH.")
        # Fallback explanation for user
        print("Cannot run JS tests without a JS runtime.")
        sys.exit(1)
        
    # Send requests to the bridge
    results = {}
    
    # Send all requests
    for i, case in enumerate(TEST_DATA):
        req = {'id': i, 'date': case['date'], 'time': case['time']}
        try:
            proc.stdin.write(json.dumps(req) + '\n')
            proc.stdin.flush()
        except BrokenPipeError:
            print("Error: Node process exited unexpectedly.")
            break
            
    proc.stdin.close()
    
    # Read output
    # The bridge prints one JSON line per request
    for line in proc.stdout:
        try:
            res = json.loads(line)
            if 'error' in res:
                print(f"JS Error: {res['error']}")
                continue
            results[res['id']] = res['planets']
        except json.JSONDecodeError:
            print(f"Invalid JSON from bridge: {line}")
            
    # Check stderr
    stderr = proc.stderr.read()
    if stderr:
        print(f"Node stderr: {stderr}")

    proc.wait()
    return results

def main():
    if sys.platform == 'win32':
        sys.stdout.reconfigure(encoding='utf-8')

    print("RUNNING ASTRO CORE VERIFICATION (JS DIRECT CALL)")
    print("========================================================================\n")
    
    # Execute the bridge
    try:
        results = run_node_bridge()
    except Exception as e:
        print(f"Bridge execution failed: {e}")
        return

    total_planets = 0
    total_error = 0.0
    max_error = 0.0
    
    for i, case in enumerate(TEST_DATA):
        date = case['date']
        time = case['time']
        
        calc_planets = results.get(i, {})
        
        if not calc_planets:
            print(f"Warning: No results for case {date}")
            continue
        
        print(f"Date (UTC): {date} {time}")
        print(f"{'Planet':<10} {'NASA':<10} {'Calc':<10} {'Diff':<10}")
        print("-" * 45)
        
        planet_map = calc_planets
        
        for p_name, p_target in case['planets'].items():
            if p_name in planet_map:
                p_calc = float(planet_map[p_name])
                
                # handles wraparound difference (e.g. 359 vs 1)
                diff = abs(p_target - p_calc)
                if diff > 180: diff = 360 - diff
                
                total_planets += 1
                total_error += diff
                max_error = max(max_error, diff)
                
                status = "(!)" if diff > 2.0 else ""
                print(f"{p_name:<10} {p_target:<10.2f} {p_calc:<10.2f} {diff:<10.2f} {status}")
        print("")

    print("========================================================================")
    print(f"Summary:")
    print(f"Total Comparison Points: {total_planets}")
    if total_planets > 0:
        print(f"Average Error: {total_error / total_planets:.2f} degrees")
    print(f"Max Error:     {max_error:.2f} degrees")

if __name__ == "__main__":
    main()
