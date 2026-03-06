#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
hosts 转 sing-box JSON + mihomo YAML 双格式脚本
只转换 0.0.0.0 开头的广告屏蔽规则
输入文件默认无后缀：hosts / adblock / all
"""
import json
import re
import sys
from pathlib import Path

def parse_hosts_0000(content):
    """解析 hosts 内容，提取 0.0.0.0 开头的有效域名"""
    domains = set()
    for line in content.splitlines():
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        parts = line.split()
        if len(parts) < 2:
            continue
        ip, domain = parts[0].lower(), parts[1].lower()
        if ip != "0.0.0.0":
            continue
        # 过滤无效项
        if domain in ("localhost", "localhost.localdomain", "broadcasthost"):
            continue
        # 基础域名校验
        if re.match(r'^[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$', domain):
            domains.add(domain)
    return sorted(domains)

def generate_singbox_json(domains):
    """生成 sing-box classical 格式 JSON"""
    return {
        "version": 3,
        "rules": [
            {
                "domain_suffix": domains
            }
        ]
    }

def generate_mihomo_yaml(domains):
    """生成 mihomo rule-provider YAML 格式 (payload 列表)"""
    lines = ["payload:"]
    for d in domains:
        lines.append(f"  - DOMAIN-SUFFIX,{d}")
    return "\n".join(lines) + "\n" if domains else ""

def convert_hosts(input_file, output_base):
    # 读取输入（支持无后缀文件）
    try:
        content = Path(input_file).read_text(encoding="utf-8")
    except FileNotFoundError:
        print(f"❌ 文件不存在: {input_file}")
        sys.exit(1)
    
    domains = parse_hosts_0000(content)
    if not domains:
        print("⚠️ 未找到有效的 0.0.0.0 规则")
        return
    
    # 输出 sing-box JSON
    json_path = f"{output_base}.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(generate_singbox_json(domains), f, indent=2, ensure_ascii=False)
    print(f"✅ sing-box: {json_path} ({len(domains)} 条)")
    
    # 输出 mihomo YAML
    yaml_path = f"{output_base}.yaml"
    with open(yaml_path, "w", encoding="utf-8") as f:
        f.write(generate_mihomo_yaml(domains))
    print(f"✅ mihomo: {yaml_path} ({len(domains)} 条)")

if __name__ == "__main__":
    # 默认输入: hosts (无后缀), 默认输出前缀: adblock
    input_file = sys.argv[1] if len(sys.argv) > 1 else "hosts"
    output_base = sys.argv[2] if len(sys.argv) > 2 else "adblock"
    convert_hosts(input_file, output_base)