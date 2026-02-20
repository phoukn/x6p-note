#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Surge/Clash/mihomo 规则 → sing-box rule-set (v2, source format)
优化：处理 +. 前缀、去重、正则规范化、智能分类
"""

import json
import re
import sys
from collections import defaultdict


def is_comment_or_empty(line):
    line = line.strip()
    return not line or line.startswith('#') or line.startswith('//')


def extract_rule_value(line):
    """提取规则值，支持 Clash/Surge/mihomo 多种格式"""
    line = line.strip()
    
    # 去行内注释
    for sep in ['#', '//']:
        if sep in line:
            line = line.split(sep)[0].strip()
    if not line:
        return None
    
    # 处理标准格式：TYPE,value[,policy]
    if ',' in line:
        parts = [p.strip() for p in line.split(',')]
        rule_type = parts[0].upper()
        if rule_type in ['DOMAIN', 'DOMAIN-SUFFIX', 'DOMAIN-KEYWORD', 'IP-CIDR', 'IP-CIDR6', 'GEOIP', 'DOMAIN-WILDCARD']:
            return parts[1] if len(parts) > 1 else None
        return line  # 其他格式原样返回
    
    return line


def normalize_rule(raw):
    """
    规范化规则字符串：
    - 去掉 mihomo 的 + 前缀：+.xxx → .xxx, ++.xxx → .xxx
    - 清理多余空格/点
    """
    rule = raw.strip()
    # 处理 +. 或 ++. 前缀（mihomo 风格）
    rule = re.sub(r'^\++\.?', '', rule)
    # 清理开头多余的点（保留一个用于 suffix 识别）    if rule.startswith('..'):
    rule = '.' + rule.lstrip('.')
    return rule


def simplify_regex(regex):
    """
    简化正则表达式：
    - 去掉 ^+ 中的 +
    - 合并冗余的 .* 和 \\.
    """
    # 去掉 ^+ 或 $+ 中的 +
    regex = re.sub(r'\^+', '^', regex)
    regex = re.sub(r'\$+', '$', regex)
    # 简化 \.\*\. 为 \..*\. (避免过度简化，保持语义)
    return regex


def classify_rule(raw):
    """
    智能分类 + 规范化，返回 (category, value)
    category: suffix | keyword | regex | domain | ip_cidr | geoip | skip
    """
    # 1. 预处理：规范化字符串
    rule = normalize_rule(raw)
    if not rule:
        return 'skip', None
    
    # 2. GEOIP
    if rule.lower().startswith('geoip:'):
        code = rule.split(':', 1)[1].strip().upper()
        return 'geoip', code
    
    # 3. IP-CIDR
    if re.match(r'^\d+\.\d+\.\d+\.\d+(/\d+)?$', rule):
        cidr = rule if '/' in rule else f"{rule}/32"
        return 'ip_cidr', cidr
    
    # 4. 含 * 通配符 → 转正则
    if '*' in rule:
        # *.xxx.com → domain_suffix (去掉 *.)
        if rule.startswith('*.') and '.' in rule[2:]:
            domain = rule[2:].lstrip('.')
            return 'suffix', domain
        # 其他含* → domain_regex
        else:
            # 转标准正则：. → \., * → .*
            reg = rule.replace('.', r'\.').replace('*', '.*')
            reg = f"^{reg}$"
            reg = simplify_regex(reg)            
            return 'regex', reg
    
    # 5. 以 . 开头 → domain_suffix
    if rule.startswith('.'):
        suffix = rule.lstrip('.')
        if suffix:  # 避免纯 "."
            return 'suffix', suffix
        return 'skip', None
    
    # 6. 纯域名判断（含点 + 有效 TLD）
    if re.match(r'^[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$', rule):
        return 'suffix', rule  # 默认当 suffix，符合 Surge 习惯
    
    # 7. 无点的关键词
    if '.' not in rule and len(rule) >= 2:
        return 'keyword', rule
    
    # 8. 其他 → 精确 domain
    return 'domain', rule


def optimize_rules(groups):
    """
    去重优化：
    - 如果某域名既在 suffix 又在 domain/keyword，只保留 suffix
    - 合并相似正则（简单启发式）
    """
    # 1. suffix 优先去重
    if 'suffix' in groups:
        suffix_set = groups['suffix']
        for cat in ['domain', 'keyword']:
            if cat in groups:
                groups[cat] = {v for v in groups[cat] if v not in suffix_set and not any(v.endswith(s) or v == s for s in suffix_set)}
                if not groups[cat]:
                    del groups[cat]
    
    # 2. 正则简化（可选：合并 time\d? 模式）
    if 'regex' in groups:
        regex_list = list(groups['regex'])
        # 合并 time*.com 和 ntp*.com 模式
        merged = set()
        for r in regex_list:
            # 简化 ^time\d?\..*\.com$ 和 ^time\..*\.com$ → ^time\..*\.com$
            r_simplified = re.sub(r'\\d\?\\\.', r'\\.', r)  # time\d?\. → time\.
            merged.add(r_simplified)
        groups['regex'] = merged
    
    return groups

def convert_rules(input_text):
    """主转换函数"""
    groups = defaultdict(set)
    
    for line in input_text.splitlines():
        if is_comment_or_empty(line):
            continue
        value = extract_rule_value(line)
        if not value:
            continue
        category, val = classify_rule(value)
        if category != 'skip' and val:
            groups[category].add(val)
    
    # 优化：去重 + 合并
    groups = optimize_rules(groups)
    
    # 构建输出
    result = {"version": 2, "rules": []}
    order = ['suffix', 'keyword', 'regex', 'domain', 'ip_cidr', 'geoip']
    field_map = {
        'suffix': 'domain_suffix',
        'keyword': 'domain_keyword',
        'regex': 'domain_regex',
        'domain': 'domain',
        'ip_cidr': 'ip_cidr',
        'geoip': 'geoip'
    }
    
    for cat in order:
        if cat in groups and groups[cat]:
            field = field_map[cat]
            result["rules"].append({field: sorted(groups[cat])})
    
    return json.dumps(result, indent=2, ensure_ascii=False)


def main():
    if len(sys.argv) > 1:
        with open(sys.argv[1], 'r', encoding='utf-8') as f:
            content = f.read()
    else:
        content = sys.stdin.read()
    
    print(convert_rules(content))


if __name__ == '__main__':
    main()