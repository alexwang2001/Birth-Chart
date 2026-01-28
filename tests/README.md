# 紫微斗數測試套件 (Zi Wei Dou Shu Test Suite)

## 概述 (Overview)

這個測試套件用於驗證紫微斗數算法的正確性，通過與在線資源和參考實現的已知測試案例進行比較。

This test suite validates the Zi Wei Dou Shu calculation algorithm by comparing results with known test cases from online sources and reference implementations.

## 功能特性 (Features)

- ✅ **農曆轉換測試** - Lunar calendar conversion validation
- ✅ **宮位計算測試** - Palace position calculation tests
- ✅ **五行局判定測試** - Bureau (Five Elements) determination tests
- ✅ **星曜安置測試** - Star placement validation
- ✅ **批量測試模式** - Batch test mode with multiple cases
- ✅ **詳細輸出模式** - Verbose output for debugging
- ✅ **交互式測試** - Interactive mode for custom birth data

## 使用方法 (Usage)

### 1. 運行所有測試 (Run All Tests)

```bash
python tests/test_zwds.py
```

### 2. 詳細輸出模式 (Verbose Mode)

```bash
python tests/test_zwds.py --verbose
```

或

```bash
python tests/test_zwds.py -v
```

### 3. 西洋占星測試 (Western Astrology Test)

此測試將 `js/core/astro-core.js` 中的 JavaScript 邏輯轉換為 Python，以驗證天文算法的準確性。它輸出詳細的行星位置和宮位，供您與在線占星計算器（如 Astro.com）進行對比。

This test checks the `js/core/astro-core.js` logic by porting it to Python to verify the astronomical algorithms. It outputs detailed planetary positions and house cusps for comparison with online calculators (like Astro.com).

### 運行測試 (Run Test)

```bash
python tests/test_astro.py
```

此腳本將針對不同年份（1950、1980、2000、2020）的行星位置進行系統性驗證，並與 NASA JPL Horizons 的歷書數據進行比對，以確保算法在長時間跨度下的穩定性。

This script runs a systematic verification of planetary positions across different years (1950, 1980, 2000, 2020), comparing them against NASA JPL Horizons ephemeris data to ensure algorithm stability over long time spans.

## 測試案例 (Test Cases of ZWDS)


當前包含 10 個測試案例，涵蓋不同的出生時辰、特殊情況及名人案例：
 
 Currently includes 10 test cases covering different birth hours, special scenarios, and famous figures:

1. **測試案例1** - 經典案例 (Classic case)
   - 日期: 1990-05-15 14:00
   - 性別: 男
   - 驗證: 土五局, 命宮在戌

2. **測試案例2** - 子時出生 (Midnight birth)
   - 日期: 1985-01-20 00:00
   - 性別: 女
   - 驗證: 水二局, 命宮在子

3. **測試案例3** - 閏月案例 (Leap month case)
   - 日期: 1995-06-10 10:00
   - 性別: 男
   - 驗證: 水二局, 命宮在丑

4. **測試案例4** - 午時出生 (Noon birth)
   - 日期: 2000-08-25 12:00
   - 性別: 女
   - 驗證: 土五局, 命宮在寅

5. **測試案例5** - 戌時出生 (Evening birth)
   - 日期: 1978-11-03 20:00
   - 性別: 男
   - 驗證: 金四局, 命宮在丑

6. **測試案例6** - Richard Branson (Famous Figure)
   - 日期: 1950-07-18 07:00
   - 性別: 男
   - 驗證: 土五局, 命宮在卯

7. **測試案例7** - Steve Jobs (Famous Figure)
   - 日期: 1955-02-24 19:00
   - 性別: 男
   - 驗證: 火六局, 命宮在巳

8. **測試案例8** - Bruce Lee (Famous Figure)
   - 日期: 1940-11-27 07:00
   - 性別: 男
   - 驗證: 木三局, 命宮在未

9. **測試案例9** - Marilyn Monroe (Famous Figure)
   - 日期: 1926-06-01 09:00
   - 性別: 女
   - 驗證: 水二局, 命宮在子

10. **測試案例10** - Elon Musk (Famous Figure)
    - 日期: 1971-06-28 07:00
    - 性別: 男
    - 驗證: 木三局 (閏月), 命宮在寅

## 驗證項目 (Validation Items)

每個測試案例驗證以下項目：

Each test case validates the following items:

- ✓ 農曆日期 (Lunar date conversion)
- ✓ 五行局 (Five Elements Bureau)
- ✓ 命宮位置 (Ming Palace position)
- ✓ 身宮位置 (Shen Palace position)
- ✓ 紫微星位置 (Zi Wei star position)
- ✓ 天府星位置 (Tian Fu star position)
- ✓ 年干支 (Year stem and branch)

## 添加新測試案例 (Adding New Test Cases)

要添加新的測試案例，請在 `test_zwds.py` 中的 `TEST_CASES` 列表中添加：

To add new test cases, add to the `TEST_CASES` list in `test_zwds.py`:

```python
{
    'name': '測試案例名稱',
    'input': {
        'date': 'YYYY-MM-DD',
        'hour': 0-23,
        'gender': 'male' or 'female'
    },
    'expected': {
        'lunar': {'year': ..., 'month': ..., 'day': ..., 'isLeap': ...},
        'bureau': 2-6,
        'bureauName': '...',
        'mingPos': 0-11,
        'shenPos': 0-11,
        'ziWeiPos': 0-11,
        'tianFuPos': 0-11,
        'yearStem': 0-9,
        'yearBranch': 0-11
    }
}
```

## 在線資源參考 (Online Reference Sources)

測試案例來源於以下在線紫微斗數計算器：

Test cases are sourced from the following online ZWDS calculators:

- 元亨利貞網 (www.china95.net)
- 紫微斗數在線排盤 (www.ziwei.com)
- 靈匣網紫微斗數 (www.lnka.tw)
- 非常運勢網 (www.99166.com)

## 輸出示例 (Output Example)

### 批量測試輸出 (Batch Test Output)

```
======================================================================
紫微斗數算法測試 (Zi Wei Dou Shu Algorithm Tests)
======================================================================

======================================================================
測試結果彙總 (Test Summary)
======================================================================
總測試數 (Total): 45
通過 (Passed): 45 (100.0%)
失敗 (Failed): 0 (0.0%)
```

### 交互式測試輸出 (Interactive Test Output)

```
======================================================================
交互式測試模式 (Interactive Test Mode)
======================================================================

請輸入出生日期 (YYYY-MM-DD): 1990-05-15
請輸入出生時辰 (0-23): 14
請輸入性別 (male/female): male

======================================================================
計算結果 (Calculation Result)
======================================================================

農曆: 1990年 4月 21日

年柱: 庚午
五行局: 土五局

命宮位置: 戌 (命宮)
身宮位置: 子

紫微星位置: 戌
天府星位置: 午

宮位詳情:
  子 - 身宮 (癸子) ☆身
  丑 - 父母 (甲丑)
  寅 - 福德 (乙寅)
  ...
```

## 故障排除 (Troubleshooting)

### Python 版本要求

需要 Python 3.6 或更高版本。

Requires Python 3.6 or higher.

### 常見問題

1. **日期超出範圍**: 僅支持 1900-2100 年的日期
2. **農曆轉換失敗**: 檢查日期格式是否為 YYYY-MM-DD
3. **測試失敗**: 對比在線計算器結果，可能需要調整算法

## 貢獻 (Contributing)

歡迎提供更多測試案例！如果您發現算法問題，請：

1. 使用交互式模式驗證您的案例
2. 與至少 2 個在線計算器對比結果
3. 將測試案例添加到 TEST_CASES
4. 提交 Pull Request

## 許可證 (License)

MIT License
