 
#!/system/bin/sh

# 定义要检查的包名列表
pkg_list="com.xunmeng.pinduoduo com.heytap.market com.coloros.remoteguardservice com.coloros.sharescreen com.oplus.synergy com.heytap.accessory com.tencent.mobileqq com.taobao.taobao com.heytap.pictorial com.nearme.instant.platform com.oplus.upgradeguide com.heytap.health com.omarea.vtools com.oplus.owork com.oplus.linker com.oplus.ocar com.heytap.themestore"

# 读取当前白名单
whitelist=$(dumpsys deviceidle whitelist)

# 循环遍历包名列表
for pkg in $pkg_list; do
    # 检查包名是否在白名单中
    if echo "$whitelist" | grep -q "$pkg"; then
        # 如果在白名单中，则移除该包名
        dumpsys deviceidle whitelist "-$pkg"
    fi
done

exit 0