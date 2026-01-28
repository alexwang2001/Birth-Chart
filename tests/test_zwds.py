# -*- coding: utf-8 -*-
"""
Zi Wei Dou Shu (紫微斗數) Test Suite (JS Bridge Version)

This test suite validates the ZWDS calculation logic by calling the JS implementation directly.
"""

import json
import sys
import io
import os
import subprocess
from typing import Dict, List, Optional

# Fix Windows console encoding for Chinese characters
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# ============================================================================
# TEST CASES
# ============================================================================

TEST_CASES = [
    {
        'name': '測試案例1 - 經典案例 (已驗證 - 與JS實現一致)',
        'input': {'date': '1990-05-15', 'hour': 14, 'gender': 'male'},
        'expected': {
            'lunar': {'year': 1990, 'month': 4, 'day': 21, 'isLeap': False},
            'bureau': 5, 'bureauName': '土五局',
            'mingPos': 10, 'shenPos': 0,
            'ziWeiPos': 10, 'tianFuPos': 6,
            'yearStem': 6, 'yearBranch': 6
        }
    },
    {
        'name': '測試案例2 - 子時出生',
        'input': {'date': '1985-01-20', 'hour': 0, 'gender': 'female'},
        'expected': {
            'lunar': {'year': 1984, 'month': 11, 'day': 30, 'isLeap': False},
            'bureau': 2, 'bureauName': '水二局',
            'mingPos': 0, 'shenPos': 0,
            'ziWeiPos': 4, 'tianFuPos': 0,
            'yearStem': 0, 'yearBranch': 0
        }
    },
    {
        'name': '測試案例3 - 閏月案例',
        'input': {'date': '1995-06-10', 'hour': 10, 'gender': 'male'},
        'expected': {
            'lunar': {'year': 1995, 'month': 5, 'day': 13, 'isLeap': False},
            'bureau': 6, 'bureauName': '火六局',
            'mingPos': 1, 'shenPos': 11,
            'ziWeiPos': 11, 'tianFuPos': 5,
            'yearStem': 1, 'yearBranch': 11
        }
    },
    {
        'name': '測試案例4 - 午時出生',
        'input': {'date': '2000-08-25', 'hour': 12, 'gender': 'female'},
        'expected': {
            'lunar': {'year': 2000, 'month': 7, 'day': 26, 'isLeap': False},
            'bureau': 5, 'bureauName': '土五局',
            'mingPos': 2, 'shenPos': 2,
            'ziWeiPos': 11, 'tianFuPos': 5,
            'yearStem': 6, 'yearBranch': 4
        }
    },
    {
        'name': '測試案例5 - 戌時出生',
        'input': {'date': '1978-11-03', 'hour': 20, 'gender': 'male'},
        'expected': {
            'lunar': {'year': 1978, 'month': 10, 'day': 3, 'isLeap': False},
            'bureau': 4, 'bureauName': '金四局',
            'mingPos': 1, 'shenPos': 9,
            'ziWeiPos': 1, 'tianFuPos': 3,
            'yearStem': 4, 'yearBranch': 6
        }
    },
    {
        'name': '測試案例6 (名人) - 郭台銘 (Terry Gou)',
        'input': {'date': '1950-10-18', 'hour': 8, 'gender': 'male'},
        'expected': {
            'lunar': {'year': 1950, 'month': 9, 'day': 8, 'isLeap': False},
            'bureau': 3, 'bureauName': '木三局',
            'mingPos': 6, 'shenPos': 2,
            'ziWeiPos': 3, 'tianFuPos': 1,
            'yearStem': 6, 'yearBranch': 2
        }
    },
    {
        'name': '測試案例7 (名人) - 蔡英文 (Tsai Ing-wen)',
        'input': {'date': '1956-08-31', 'hour': 10, 'gender': 'female'},
        'expected': {
            'lunar': {'year': 1956, 'month': 7, 'day': 26, 'isLeap': False},
            'bureau': 3, 'bureauName': '木三局',
            'mingPos': 3, 'shenPos': 1,
            'ziWeiPos': 9, 'tianFuPos': 7,
            'yearStem': 2, 'yearBranch': 8
        }
    },
    {
        'name': '測試案例8 (名人) - 賴清德 (William Lai)',
        'input': {'date': '1959-10-06', 'hour': 2, 'gender': 'male'},
        'expected': {
            'lunar': {'year': 1959, 'month': 9, 'day': 5, 'isLeap': False},
            'bureau': 4, 'bureauName': '金四局',
            'mingPos': 9, 'shenPos': 11,
            'ziWeiPos': 0, 'tianFuPos': 4,
            'yearStem': 5, 'yearBranch': 11
        }
    },
    {
        'name': '測試案例9 (名人) - 王永慶 (Wang Yung-ching)',
        'input': {'date': '1917-01-18', 'hour': 4, 'gender': 'male'},
        'expected': {
            'lunar': {'year': 1916, 'month': 12, 'day': 25, 'isLeap': False},
            'bureau': 3, 'bureauName': '木三局',
            'mingPos': 11, 'shenPos': 3,
            'ziWeiPos': 0, 'tianFuPos': 4,
            'yearStem': 2, 'yearBranch': 4
        }
    },
    {
        'name': '測試案例10 (名人) - 周杰倫 (Jay Chou)',
        'input': {'date': '1979-01-18', 'hour': 16, 'gender': 'male'},
        'expected': {
            'lunar': {'year': 1978, 'month': 12, 'day': 20, 'isLeap': False},
            'bureau': 5, 'bureauName': '土五局',
            'mingPos': 5, 'shenPos': 9,
            'ziWeiPos': 5, 'tianFuPos': 11,
            'yearStem': 4, 'yearBranch': 6
        }
    }
]

# ============================================================================
# CALCULATION UTILITIES
# ============================================================================

def call_js_bridge(date_str, hour, gender):
    bridge_path = os.path.join(os.path.dirname(__file__), 'bridge_zwds.js')
    
    if not os.path.exists(bridge_path):
        raise FileNotFoundError(f"Bridge not found: {bridge_path}")
        
    req = { 'id': 1, 'date': date_str, 'hour': hour, 'gender': gender }
    
    node_path = r'C:\Program Files\nodejs\node.exe'
    if not os.path.exists(node_path):
        node_path = 'node'

    try:
        proc = subprocess.Popen(
            [node_path, bridge_path],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding='utf-8'
        )
        
        stdout, stderr = proc.communicate(input=json.dumps(req))
        
        if proc.returncode != 0:
            raise RuntimeError(f"Node exited with {proc.returncode}: {stderr}")
            
        if not stdout.strip():
            raise RuntimeError("Empty output from Node")
            
        res = json.loads(stdout)
        if 'error' in res:
            raise RuntimeError(f"JS Error: {res['error']}")
            
        return res['result']
        
    except FileNotFoundError:
        print("Error: 'node' executable not found.")
        sys.exit(1)
    except json.JSONDecodeError:
        raise RuntimeError(f"Invalid JSON: {stdout}")

# ============================================================================
# TEST RUNNER
# ============================================================================

class TestResult:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
    
    def add_pass(self):
        self.passed += 1
    
    def add_fail(self, test_name: str, field: str, expected, actual):
        self.failed += 1
        self.errors.append({
            'test': test_name,
            'field': field,
            'expected': expected,
            'actual': actual
        })
    
    def print_summary(self):
        total = self.passed + self.failed
        print("\n" + "=" * 70)
        print(f"測試結果彙總 (Test Summary)")
        print("=" * 70)
        print(f"總測試數 (Total): {total}")
        if total > 0:
            print(f"通過 (Passed): {self.passed} ({self.passed/total*100:.1f}%)")
            print(f"失敗 (Failed): {self.failed} ({self.failed/total*100:.1f}%)")
        
        if self.errors:
            print("\n" + "-" * 70)
            print("失敗詳情 (Failed Tests):")
            print("-" * 70)
            for error in self.errors:
                print(f"\n測試: {error['test']}")
                print(f"  欄位: {error['field']}")
                print(f"  期望值: {error['expected']}")
                print(f"  實際值: {error['actual']}")

def run_test_case(test_case: Dict, verbose: bool = False) -> TestResult:
    result = TestResult()
    name = test_case['name']
    input_data = test_case['input']
    expected = test_case['expected']
    
    if verbose:
        print(f"\n運行測試: {name}")
    
    try:
        actual = call_js_bridge(
            input_data['date'],
            input_data['hour'],
            input_data['gender']
        )
    except Exception as e:
        print(f"Calculation failed: {e}")
        result.add_fail(name, 'Execution', 'Success', str(e))
        return result
    
    # Compare
    fields_to_check = [
        ('lunar', 'lunar'),
        ('bureau', 'bureau'),
        ('bureauName', 'bureauName'),
        ('mingPos', 'mingPos'),
        ('shenPos', 'shenPos'),
        ('ziWeiPos', 'ziWeiPos'),
        ('tianFuPos', 'tianFuPos'),
        ('yearStem', 'yearStem'),
        ('yearBranch', 'yearBranch')
    ]
    
    for field_name, field_key in fields_to_check:
        if field_name in expected:
            expected_val = expected[field_name]
            actual_val = actual.get(field_key)
            
            # Special handling for lunar object comparison
            if field_name == 'lunar':
                # Compare year, month, day, isLeap
                e_l = expected_val
                a_l = actual_val
                if (e_l['year'] != a_l['year'] or 
                    e_l['month'] != a_l['month'] or 
                    e_l['day'] != a_l['day'] or 
                    e_l['isLeap'] != a_l['isLeap']):
                     result.add_fail(name, field_name, expected_val, actual_val)
                     if verbose: print(f"  ✗ {field_name}")
                else:
                    result.add_pass()
                    if verbose: print(f"  ✓ {field_name}")
                continue

            if expected_val == actual_val:
                result.add_pass()
                if verbose: print(f"  ✓ {field_name}: {actual_val}")
            else:
                result.add_fail(name, field_name, expected_val, actual_val)
                if verbose: print(f"  ✗ {field_name}: Exp {expected_val}, Got {actual_val}")
                
    return result

def run_all_tests(verbose: bool = False):
    print("=" * 70)
    print("紫微斗數 JS Bridge Tests")
    print("=" * 70)
    
    total_result = TestResult()
    
    for test_case in TEST_CASES:
        result = run_test_case(test_case, verbose)
        total_result.passed += result.passed
        total_result.failed += result.failed
        total_result.errors.extend(result.errors)
    
    total_result.print_summary()

def main():
    verbose = False
    if len(sys.argv) > 1 and sys.argv[1] in ['-v', '--verbose']:
        verbose = True
        
    run_all_tests(verbose)

if __name__ == '__main__':
    main()
