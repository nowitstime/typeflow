#!/usr/bin/env python3
"""
TypeFlow Offline Biomechanical Word Scorer & Progression Ranker
Scores all 1,000 words offline using QWERTY geometry, key effort, transition costs (SFB, rolls, jumps),
and corpus commonality to produce the Asymmetric Rarity Pyramid:
  - Tier 0: Starter (40 words, Ranks 1-40)
  - Tier 1: Common (260 words, Ranks 41-300)
  - Tier 2: Uncommon (300 words, Ranks 301-600)
  - Tier 3: Rare (250 words, Ranks 601-850)
  - Tier 4: Epic (150 words, Ranks 851-1000)
"""

import os
import re
import json

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORDS_MODEL_PATH = os.path.join(BASE_DIR, "src", "models", "WordsModel.js")

# 2.1 Keyboard Geometry Map: [hand (0=L, 1=R), finger (0=Index..3=Pinky), row (0=Top, 1=Home, 2=Bottom), centerStretch (0 or 1)]
KEY_MAP = {
    # Left Hand
    'q': [0, 3, 0, 0], 'w': [0, 2, 0, 0], 'e': [0, 1, 0, 0], 'r': [0, 0, 0, 0], 't': [0, 0, 0, 1],
    'a': [0, 3, 1, 0], 's': [0, 2, 1, 0], 'd': [0, 1, 1, 0], 'f': [0, 0, 1, 0], 'g': [0, 0, 1, 1],
    'z': [0, 3, 2, 0], 'x': [0, 2, 2, 0], 'c': [0, 1, 2, 0], 'v': [0, 0, 2, 0], 'b': [0, 0, 2, 1],
    # Right Hand
    'y': [1, 0, 0, 1], 'u': [1, 0, 0, 0], 'i': [1, 1, 0, 0], 'o': [1, 2, 0, 0], 'p': [1, 3, 0, 0],
    'h': [1, 0, 1, 1], 'j': [1, 0, 1, 0], 'k': [1, 1, 1, 0], 'l': [1, 2, 1, 0],
    'n': [1, 0, 2, 1], 'm': [1, 0, 2, 0]
}

ROW_COST = {1: 1.0, 0: 1.3, 2: 1.6}
FINGER_COST = {0: 1.0, 1: 1.0, 2: 1.3, 3: 1.8}

# Standard 1,000 English words in corpus frequency order
CORPUS_1000 = (
    "the be of and to in he have it that for they with as not on she at by this we you do but his from or which what go their can who get if would her all my make about know will up one time there year so think when them some me people take out into just see him your come could now than like other how then its our two more these want way look first also new because day use no man find here thing give many well only those tell very even back any good woman through us life child work down may after should call world over school still try last ask need too feel three state never become between high really something most another much family own leave put old while mean keep student why let great same big group begin seem country help talk where turn problem every start hand might american show part against place such again few case week company system each right program hear question during play government run small number off always move night live point believe hold today bring happen next without before large million must home under water room write mother area national money story young fact month different lot study book eye job word though business issue side kind four head far black long both little house yes since provide service around friend important father sit away until power hour game often yet line political end among ever stand bad lose however member pay law meet car city almost include continue set later community name five once white least learn real change team minute best several idea kid body information nothing ago lead social understand whether watch together follow parent stop face anything create public already speak others read level allow add office spend door health person art sure war history party within grow result open morning walk reason low win research girl guy early food moment himself air teacher force offer enough education across although remember foot second boy maybe toward able age policy everything love process music including consider appear actually buy probably human wait serve market die send expect sense build stay fall nation plan cut college interest death course someone experience behind reach local kill six remain effect suggest class control raise care perhaps late hard field else pass former sell major sometimes require along development themselves report role better economic effort decide rate strong possible heart drug leader light voice wife whole police mind finally pull return free military price less according decision explain son hope develop view relationship carry town road drive arm true federal break difference thank receive value international building action full model join season society tax director position player agree especially record pick wear paper special space ground form support event official whose matter everyone center couple site project hit base activity star table court produce eat teach oil half situation easy cost industry figure street image itself phone either data cover quite picture clear practice piece land recent describe product doctor wall patient worker news test movie certain north personal simply third technology catch step baby computer type attention draw film republican tree source red nearly organization choose cause hair century evidence window difficult listen soon culture billion chance brother energy period summer realize hundred available plant likely opportunity term short letter condition choice single rule daughter administration south husband congress floor campaign material population economy medical hospital church close thousand risk current fire future wrong involve defense anyone increase security bank myself certainly west sport board seek per subject officer private rest behavior deal performance fight throw top quickly past goal bed order author fill represent focus foreign drop blood upon agency push nature color recently store reduce sound note fine near movement page enter share common poor natural race concern series significant similar hot language usually response dead rise animal factor decade article shoot east save artist scene stock career despite central eight thus treatment beyond happy exactly protect approach lie size dog fund serious occur media ready sign thought list individual simple quality pressure accept answer resource identify left meeting determine prepare disease whatever success argue cup particularly amount ability staff recognize indicate character growth loss degree wonder attack herself traditional television box training pretty election everybody physical lay general feeling standard bill message fail outside arrive analysis benefit sex forward lawyer present section environmental glass skill sister professor operation financial crime stage compare authority miss design sort act ten knowledge gun station blue strategy clearly discuss indeed truth song example democratic check environment leg dark various rather laugh guess executive prove hang entire rock forget claim remove manager enjoy network legal religious cold final main science green memory card above seat cell establish nice trial expert spring firm democrat radio visit management avoid imagine tonight huge ball finish yourself theory impact respond statement maintain charge popular onto reveal direction weapon employee cultural contain peace pain apply measure wide shake fly interview manage chair fish particular camera structure politics perform bit weight suddenly discover candidate production treat trip evening affect inside conference unit style adult worry range mention deep front edge specific writer trouble necessary throughout challenge fear shoulder institution middle sea dream bar beautiful property instead improve stuff detail method somebody magazine hotel soldier reflect heavy sexual bag heat marriage tough sing surface purpose exist pattern whom skin agent owner machine gas ahead generation commercial address cancer item reality coach yard beat violence total tend investment discussion finger garden notice collection modern task partner positive civil kitchen consumer shot budget painting scientist safe agreement capital mouth nor victim newspaper threat rich score account wheat audience dinner vote western relate travel debate prevent citizen majority apart fellow born mental traffic colleague scale mountain forest quarter target element release champion journey silence shadow silver golden ocean island whisper thunder diamond castle horizon mystery harmony courage victory legend ancient stellar galaxy crystal spirit starlight"
).split()

def score_word(word):
    """Calculates D_raw = C_key + C_trans + C_len."""
    c_key = sum(
        (ROW_COST[KEY_MAP[c][2]] * FINGER_COST[KEY_MAP[c][1]]) + (0.4 if KEY_MAP[c][3] else 0.0)
        for c in word if c in KEY_MAP
    )
    c_trans = 0.0
    for i in range(len(word) - 1):
        c1, c2 = word[i], word[i+1]
        if c1 not in KEY_MAP or c2 not in KEY_MAP:
            continue
        h1, f1, r1, _ = KEY_MAP[c1]
        h2, f2, r2, _ = KEY_MAP[c2]
        
        if h1 != h2:
            c_trans -= 0.3  # Hand alternation bonus
        else:
            if c1 == c2:
                c_trans += 0.8  # Same key repeat
            elif f1 == f2:
                c_trans += 3.0  # Same-finger bigram (SFB) penalty
            elif f1 > f2:
                c_trans += 0.1  # Inward roll
            else:
                c_trans += 0.4  # Outward roll
            
            if abs(r1 - r2) == 2:
                c_trans += 1.2  # Row jump penalty
                
    c_len = len(word) * 0.2
    return c_key + c_trans + c_len

def generate_ranked_words():
    raw_scores = [score_word(w) for w in CORPUS_1000]
    sorted_scores = sorted(raw_scores)

    scored = []
    for idx, w in enumerate(CORPUS_1000):
        s = raw_scores[idx]
        D = sorted_scores.index(s) / (len(sorted_scores) - 1.0)
        E = 1.0 - D
        C = 1.0 - 0.9 * (idx / (len(CORPUS_1000) - 1.0))
        priority = E * C
        scored.append({
            'word': w,
            'freqRank': idx + 1,
            'dRaw': round(s, 2),
            'ease': round(E, 4),
            'commonality': round(C, 4),
            'priority': round(priority, 5)
        })

    # Sort descending by UnlockPriority
    scored.sort(key=lambda x: x['priority'], reverse=True)

    # Pin 'the' to Rank 1 (Ground Zero)
    the_idx = next(i for i, x in enumerate(scored) if x['word'] == 'the')
    the_item = scored.pop(the_idx)
    scored.insert(0, the_item)

    # Assign ranks and tiers
    for idx, item in enumerate(scored):
        rank = idx + 1
        item['rank'] = rank
        if rank <= 40:
            item['tier'] = 'STARTER'
        elif rank <= 300:
            item['tier'] = 'COMMON'
        elif rank <= 600:
            item['tier'] = 'UNCOMMON'
        elif rank <= 850:
            item['tier'] = 'RARE'
        else:
            item['tier'] = 'EPIC'

    return scored

def main():
    scored = generate_ranked_words()
    ranked_words_str = " ".join([x['word'] for x in scored])
    print(f"Total scored words: {len(scored)}")
    print(f"Tier 0 (Starter 1-40):   {len([x for x in scored if x['tier'] == 'STARTER'])} words")
    print(f"Tier 1 (Common 41-300):  {len([x for x in scored if x['tier'] == 'COMMON'])} words")
    print(f"Tier 2 (Uncommon 301-600): {len([x for x in scored if x['tier'] == 'UNCOMMON'])} words")
    print(f"Tier 3 (Rare 601-850):    {len([x for x in scored if x['tier'] == 'RARE'])} words")
    print(f"Tier 4 (Epic 851-1000):   {len([x for x in scored if x['tier'] == 'EPIC'])} words")

    print("\nStarter pool sample (first 20):")
    print(" ".join([x['word'] for x in scored[:20]]))

    if "--apply" in sys.argv:
        update_words_model(ranked_words_str)

    return scored, ranked_words_str

def update_words_model(ranked_words_str):
    with open(WORDS_MODEL_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    # Replace RAW_WORDS definition
    new_content = re.sub(
        r'const RAW_WORDS =\s*"[^"]+";',
        f'const RAW_WORDS =\n  "{ranked_words_str}";',
        content
    )
    with open(WORDS_MODEL_PATH, "w", encoding="utf-8") as f:
        f.write(new_content)
    print(f"[score_words] Successfully updated RAW_WORDS in {WORDS_MODEL_PATH}")

if __name__ == "__main__":
    import sys
    main()
