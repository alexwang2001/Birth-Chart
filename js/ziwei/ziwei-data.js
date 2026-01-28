/**
 * Zi Wei Dou Shu (紫微斗數) Data Definitions
 * Contains constants, mappings, and core interpretations for stars and palaces.
 */

const ZIWEI_DATA = {
    /**
     * Lunar Calendar Data (1900-2100)
     * Used for Solar-to-Lunar date conversion.
     */
    LUNAR_INFO: [
        0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
        0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
        0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
        0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
        0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
        0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5d0, 0x14573, 0x052d0, 0x0a9a8, 0x0e950, 0x06aa0,
        0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
        0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b5a0, 0x195a6,
        0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
        0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
        0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
        0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
        0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
        0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
        0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0
    ],

    /**
     * Core Mappings (Stems, Branches, Bureaus)
     */
    MAPS: {
        HEAVENLY_STEMS: ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"],
        EARTHLY_BRANCHES: ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"],
        PALACE_NAMES: ["命宮", "兄弟", "夫妻", "子女", "財帛", "疾厄", "遷移", "交友", "官祿", "田宅", "福德", "父母"],
        NA_YIN_BUREAU: [
            4, 4, 6, 6, 3, 3, 4, 4, 2, 2,
            6, 6, 2, 2, 5, 5, 6, 6, 3, 3,
            4, 4, 5, 5, 2, 2, 3, 3, 4, 4,
            2, 2, 6, 6, 5, 5, 2, 2, 3, 3,
            3, 3, 5, 5, 6, 6, 3, 3, 2, 2,
            5, 5, 4, 4, 3, 3, 5, 5, 6, 6
        ]
    },

    /**
     * Star Definitions & Groupings
     */
    STARS: {
        MAJOR_ZI_WEI: [
            { id: "ZiWei", name: "紫微", color: "#bc8cff", offset: 0, type: "major" },
            { id: "TianJi", name: "天機", color: "#69ff8c", offset: -1, type: "major" },
            { id: "TaiYang", name: "太陽", color: "#ff5f5f", offset: -3, type: "major" },
            { id: "WuQu", name: "武曲", color: "#e1e1e1", offset: -4, type: "major" },
            { id: "TianTong", name: "天同", color: "#ffff70", offset: -5, type: "major" },
            { id: "LianZhen", name: "廉貞", color: "#ff5f5f", offset: -8, type: "major" }
        ],
        MAJOR_TIAN_FU: [
            { id: "TianFu", name: "天府", color: "#e6c27a", offset: 0, type: "major" },
            { id: "TaiYin", name: "太陰", color: "#5fafff", offset: 1, type: "major" },
            { id: "TanLang", name: "貪狼", color: "#69ff8c", offset: 2, type: "major" },
            { id: "JuMen", name: "巨門", color: "#e1e1e1", offset: 3, type: "major" },
            { id: "TianXiang", name: "天相", color: "#e6c27a", offset: 4, type: "major" },
            { id: "TianLiang", name: "天梁", color: "#69ff8c", offset: 5, type: "major" },
            { id: "QiSha", name: "七殺", color: "#ff5f5f", offset: 6, type: "major" },
            { id: "PoJun", name: "破軍", color: "#5fafff", offset: 10, type: "major" }
        ]
    },

    /**
     * Interpretations & Descriptions
     * Smoothly structured explanations for better user understanding.
     */
    INTERPRETATIONS: {
        palaces: {
            "命宮": "代表個人的先天性格、天賦才能、人生觀及一生總體運勢。它是命盤的核心，決定了人生的基本格局與性格底色。",
            "兄弟": "象徵與兄弟姊妹的關係，推及至平輩友人、合夥人的緣分與互動，也反映彼此間的助力或競爭。",
            "夫妻": "展示個人的感情觀、對配偶的期待，以及婚姻關係的品質。可從中觀察理想伴侶的類型與相處模式。",
            "子女": "反映與子女的緣分、後代的素質及教養方式，也可用來觀察個人的才華表現、創造力及性生活。",
            "財帛": "揭示個人的求財模式、理財能力及一生的財運狀況。代表如何賺錢以及對金錢的使用態度。",
            "疾厄": "預示先天的體質強弱、容易患上的疾病，以及心理健康狀況。反映身心整體的能量平衡。",
            "遷移": "代表出外旅行、移民、社交應酬的狀況。展現一個人在社交場合中的表現，以及大眾對您的第一印象。",
            "交友": "象徵與朋友、部屬、下屬的關係。反映您在社群中的號召力，以及能從他人處獲得的助力程度。",
            "官祿": "又稱事業宮，反映個人的職業發展、成就高低及事業性質。代表在職場上的奮鬥歷程與社會地位。",
            "田宅": "代表居住環境、不動產運勢以及家庭氣氛。象徵財富的蓄積能力，及來自家族的傳承與庇蔭。",
            "福德": "展示個人的精神生活、內心享受、福分厚薄。反映晚年的心理狀態，以及潛意識中的安全感來源。",
            "父母": "象徵與父母、長輩、上司的緣分。代表來自長輩的提攜、教育環境，以及與威權對象的溝通模式。"
        },
        stars: {
            "ZiWei": {
                name: "紫微",
                meaning: "帝座，主尊貴。",
                description: "紫微星是十四主星之首，象徵帝王與領導者。具有穩重、尊貴、追求完美的特質，自尊心強且具包容力，但若無百官朝拱，亦容易感到孤高與寂寞。"
            },
            "TianJi": {
                name: "天機",
                meaning: "智多星，主機謀。",
                description: "天機星象徵智力和謀略，思慮敏捷、善於分析與規劃。反應極快且具應變能力，但因過度思慮，人生較多變動，且易有睡眠或神經系統的困擾。"
            },
            "TaiYang": {
                name: "太陽",
                meaning: "光明之星，主博愛。",
                description: "太陽星象徵光明與熱忱，主貴不主財。性格積極開朗、樂於助人，具備領導風範。在命盤中受落陷影響極大，白天出生者較能發揮其輝煌能量。"
            },
            "WuQu": {
                name: "武曲",
                meaning: "財星，主剛直。",
                description: "武曲星是將星，亦是正財星。性格務實、決斷力強、處事嚴謹。具有強大的賺錢動力與韌性，但個性較硬，有時顯得冷板，不擅長軟性溝通。"
            },
            "TianTong": {
                name: "天同",
                meaning: "福星，主和諧。",
                description: "天同星是最具福氣的星曜，主平易近人、知足常樂。注重生活享受與和諧的人際關係，但有時會顯得過於安逸，缺乏積極開創的動力。"
            },
            "LianZhen": {
                name: "廉貞",
                meaning: "囚星，主權威與桃花。",
                description: "廉貞星性格複雜，兼具才華與野心。思慮細膩、觀察力敏銳，在事業上極具衝勁。它也是次桃花，代表極佳的人緣與社交手腕，但性格有時偏向極端。"
            },
            "TianFu": {
                name: "天府",
                meaning: "財庫，主穩健。",
                description: "天府星是南斗主星，象徵穩定與蓄積。具有卓越的管理能力與耐性，性格沈穩保守，能守成且善於理財，給人一種安心可靠的感覺。"
            },
            "TaiYin": {
                name: "太陰",
                meaning: "月亮，主財帛與不動產。",
                description: "太陰星象徵母性與溫柔，注重內心感受與美感。性格細緻感性、注重生活品質。在理財上具有細水長流的傾向，尤其與土地、房產有緣。"
            },
            "TanLang": {
                name: "貪狼",
                meaning: "桃花星，主慾望。",
                description: "貪狼星是第一大桃花星，多才多藝、長於社交。性格活潑外向，對事物充滿好奇心。它代表各種能量的轉化與慾望的追求，人生充滿各種可能性。"
            },
            "JuMen": {
                name: "巨門",
                meaning: "暗星，主口才。",
                description: "巨門星象徵門戶與溝通，洞察力極強，能看穿事物的隱秘面。口才極佳且具分析力，但也因直言不諱而容易招致口舌是非。適合從事需要發言或深度分析的工作。"
            },
            "TianXiang": {
                name: "天相",
                meaning: "印星，主服務。",
                description: "天相星象徵印鑑與平衡，具有極高的服從性與正義感。性格慈悲、熱心公益，善於協調人際衝突。它是帝座旁的掌印官，具備優秀的行政與輔佐能力。"
            },
            "TianLiang": {
                name: "天梁",
                meaning: "蔭星，主成熟與福蔭。",
                description: "天梁星是老人星，象徵清高與長壽。性格老成持重、具備領導風範與護蔭他人的能力。它具有逢凶化吉的特質，但也容易給人喜歡說教、過於嚴肅的印象。"
            },
            "QiSha": {
                name: "七殺",
                meaning: "將星，主肅殺。",
                description: "七殺星是極具戰鬥力的星曜，象徵冒險與開創。性格剛毅果決、不畏艱難，具備強大的突破力。在人生中常有劇烈的變動，適合在動盪中建立功勛。"
            },
            "PoJun": {
                name: "破軍",
                meaning: "耗星，主破舊立新。",
                description: "破軍星象徵破壞與重建。性格敢作敢為、勇於創新，不喜歡受到束縛。在生活中常有推倒重來的勇氣，雖然過程辛勞，但能創造出全新的局面。"
            },
            "ZuoFu": {
                name: "左輔",
                meaning: "助力之星，主外部支援。",
                description: "左輔代表平輩、友人的實質幫助。它能增加主星的穩定性與成功機會，象徵有良好的社交基礎與外援。"
            },
            "YouBi": {
                name: "右弼",
                meaning: "助力之星，主柔性支援。",
                description: "右弼代表來自他人的間接、柔性幫助。它能圓融人際關係，增加處事的彈性與協調性。"
            },
            "WenChang": {
                name: "文昌",
                meaning: "文貴之星，主正途功名。",
                description: "文昌代表學術、考試與正式的文書合約。象徵才華洋溢、氣質高雅，容易在正統學術或官場獲得成就。"
            },
            "WenQu": {
                name: "文曲",
                meaning: "文華之星，主異路功名。",
                description: "文曲代表才藝、口才與特殊技藝。象徵靈感與感性，容易在藝術、表演或非傳統專業領域脫穎而出。"
            },
            "TianKui": {
                name: "天魁",
                meaning: "貴人之星，主陽貴。",
                description: "天魁代表顯而易見的貴人提攜，通常是來自男性或長輩的正面的、公開的幫助。象徵機遇與好運。"
            },
            "TianYue": {
                name: "天鉞",
                meaning: "貴人之星，主陰貴。",
                description: "天鉞代表隱伏的、間接的貴人幫助，通常是來自女性或暗中的協助。象徵在關鍵時刻有人雪中送炭。"
            },
            "QingYang": {
                name: "擎羊",
                meaning: "羊刃，主衝動與刑傷。",
                description: "擎羊是激烈的殺星，象徵衝勁、競爭與突發的衝突。若能正向發揮，是強大的行動力；反之則易有意外或刑剋。"
            },
            "TuoLuo": {
                name: "陀羅",
                meaning: "滯星，主糾纏與延遲。",
                description: "陀羅象徵隱形的阻礙與內心的糾結。它會使事情進展緩慢、好事多磨，但也賦予人深刻的鑽研毅力。"
            },
            "HuoXing": {
                name: "火星",
                meaning: "火煞，主爆發與躁急。",
                description: "火星代表強烈的爆發力與破壞力。性格躁急、缺乏耐心，但能在急難中展現出驚人的處理效率。"
            },
            "LingXing": {
                name: "鈴星",
                meaning: "鈴煞，主陰火與情緒。",
                description: "鈴星代表細碎且持久的干擾。情緒波動較大、性格較倔強，容易將不滿藏在心裡，產生心理壓力。"
            },
            "DiKong": {
                name: "地空",
                meaning: "空亡，主精神落空與變動。",
                description: "地空象徵思想的跳躍與不切實際。容易有孤芳自賞的傾向，在物質上較難留存，但在哲學、宗教或創意上有獨特見解。"
            },
            "DiJie": {
                name: "地劫",
                meaning: "劫煞，主財物損耗與波折。",
                description: "地劫代表實質的損耗與人生的起伏。人生常有「得而復失」的感嘆，需要學會看淡物質名利，轉向內心修為。"
            }
        }
    }
};
