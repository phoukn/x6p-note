# x6p-note
玩机过程中的一些心得


find x6 pro回锁简要步骤
1，回原厂系统，或者确保分区无修改，用9008工具备份分区
2，9008刷一加ocdt
3，进入fastboot模式
4，输入回锁命令
5，9008刷回本机ocdt


vb校验禁用
fastboot --disable-verity --disable-verification flash vbmeta vbmeta.img

adb查看当前槽位
adb shell getprop ro.boot.slot_suffix
fastboot getvar current-slot

x6p引导被封锁，9008进不去，fastboot被屏蔽。刷机要谨慎再谨慎。现在只有fastbootd，用户空间的fastboot。每次大版本更新一定要保root，保证有官方init_boot.img。再获取root命令：
adb reboot fastboot
fastboot flash init_boot ....img


保root更新方法
系统更新先解压完，出现安装后到Magisk安装未使用的槽位开始完成后（不要在Magisk内重启）到系统更新点击安装


红米magisk降级方法，将降级的apk文件改为zip，以模块方式刷入，重启，再降级安装该zip。OPPO的不要乱搞，稳定版就行了。

救砖经历，如上给findx6p降级kitsune，结果无限第一屏。下载当前完整包，payload提取init_boot.img，欧加9008工具箱刷入指定分区选择该原厂镜像，init_boot_a然后init_boot_b都要刷。重新获取root。


alpha面具APP更新与其他面具APP更新不一样？安装更新APP后重启还是出现更新提示？
结论：更新magiskAPP后，可以进行直接安装操作、重启。


2025.5.18更新系统，等待解压，出现立即重启后，我进入magisk选择安装到未使用的槽位（OTA后），但我直接在面具里重启了（这时候已经深夜了，很困，大脑容易犯错），结果能加载一屏和二屏，然后黑屏，长按电源键出现原生菜单（有重启，关机，错误报告选项）。连接电脑，发现能够adb devices发现，也能进入fastbootd，进入fastbootd输入命令：fastboot getvar all 发现有一条security-patch-level：2025-05-01,这是5月的安全补丁，代表系统更新已完成。或许是init_boot不在正确槽位导致不开机？上酷安发现类似的，重启多次就会切换到正确槽位，也发现有系统更新未成功的案例。总之我不敢动，没bootloader，没fastboot，按键也进不了fastbootd，也没有9008，太难了，如履薄冰。我尝试多重启几次，发现能够开机，root还在，系统更新也已经完成，救砖模块多救了一次，也许是模块的问题。可能是这个新的相机解锁模块
花了很久久确定了，是模块的问题，是lsposed模块的问题，更新了就解决了。


系统生成的景深壁纸在/data/data/com.oplus.wallpapers/files/theme_resource/


小布识屏
adb shell am start-foreground-service -a oplus.intent.action.DIRECT_SIDEBAR_SERVICE -e extra_entrance_function full_screen_ocr -e triggered_app com.coloros.smartsidebar

为过Conventional Tests (4)，已删除/metadata/magisk这个目录



alpha面具的termux就算授权了su后，还是无法使用su命令，/debug_ramdisk/su -p能进入su环境，使用如下命令可替代正常使用su
echo "alias su='/debug_ramdisk/su -p'" >> ~/.bashrc
echo "alias tsu='/debug_ramdisk/su -p'" >> ~/.bashrc
source ~/.bashrc
或者到/data/data/com.termux/files/usr/bin/目录下将su的文件for p in /debug_ramdisk/su /sbin/su /system/sbin/su /system/bin/su /system/xbin/su /su/bin/su /magisk/.core/bin/su
for p in后加上/debug_ramdisk/su以及tsu的SU_BINARY_SEARCH=("/debug_ramdisk/su" "/system/xbin/su" "/system/bin/su")加上/debug_ramdisk/su



trickystore插件模块如果伪装过安全补丁信息的记得恢复才能系统更新，其他可伪装安全补丁日期的模块也记得卸载，要不然就一直安装失败。