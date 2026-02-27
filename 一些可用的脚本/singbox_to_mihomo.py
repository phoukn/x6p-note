#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""sing-box rule-set (v2) → mihomo/Clash classical 规则"""
import json, sys, argparse, re

def parse_rule(obj):
    if not isinstance(obj, dict): return None, None
    for f, t in [('domain_suffix','domain_suffix'),('domain_keyword','domain_keyword'),
                 ('domain_regex','domain_regex'),('domain','domain'),
                 ('ip_cidr','ip_cidr'),('ip_cidr6','ip_cidr'),('geoip','geoip')]:
        if f in obj:
            v = obj[f]
            return f, v if isinstance(v, list) else [v]
    return None, None

def norm_suffix(d):
    d = str(d).strip().lstrip('+')
    return ('.' + d) if d and not d.startswith('.') else (d if d and d != '.' else None)

def convert(rt, vals):
    out = []
    for v in map(str, vals):
        v = v.strip()
        if not v: continue
        if rt == 'domain_suffix':
            n = norm_suffix(v)
            if n: out.append(f"DOMAIN-SUFFIX,{n}")
        elif rt == 'domain_keyword': out.append(f"DOMAIN-KEYWORD,{v}")
        elif rt == 'domain_regex': out.append(f"DOMAIN-REGEX,{v}")
        elif rt == 'domain': out.append(f"DOMAIN,{v.lower()}")
        elif rt == 'ip_cidr':
            c = v if '/' in v else f"{v}/32" if ':' not in v else f"{v}/128"
            out.append(f"IP-CIDR,{c}")
        elif rt == 'geoip': out.append(f"GEOIP,{v.upper()}")
    return out

def main():
    p = argparse.ArgumentParser()
    p.add_argument('input', nargs='?')
    p.add_argument('-o', '--output')
    args = p.parse_args()
    
    content = open(args.input, 'r', encoding='utf-8').read() if args.input else sys.stdin.read()
    try: data = json.loads(content)
    except: return print("# Error: Invalid JSON", file=sys.stderr)
    
    rules, src = [], data.get('rules') or data.get('payload') or (data if isinstance(data, list) else [])
    for obj in (src if isinstance(src, list) else []):
        if isinstance(obj, str) and ',' in obj:
            parts = obj.strip().split(',', 1)
            if parts[0].upper() in ['DOMAIN-SUFFIX','DOMAIN-KEYWORD','DOMAIN','IP-CIDR','GEOIP']:
                rules.append(obj.strip())
            continue
        rt, vals = parse_rule(obj)
        if rt and vals: rules.extend(convert(rt, vals))
    
    # 去重
    seen, uniq = set(), []
    for r in rules:
        if r not in seen: seen.add(r); uniq.append(r)
    
    result = "# Generated from sing-box rule-set\n# Format: mihomo/Clash classical\n\n" + "\n".join(uniq)
    
    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f: f.write(result)
        print(f"✓ Converted {len(uniq)} rules → {args.output}", file=sys.stderr)
    else:
        if hasattr(sys.stdout, 'reconfigure'): sys.stdout.reconfigure(encoding='utf-8')
        print(result)

if __name__ == '__main__': main()