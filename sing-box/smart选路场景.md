# mihomo Smart Group 选路算法（algorithm）分场景推荐表

核心建议：日常使用直接选 auto，精细控制时按下方推荐。

| 场景                  | 推荐 algorithm                  | 理由说明                                                                 | 备选算法                          | 额外建议 |
|-----------------------|---------------------------------|--------------------------------------------------------------------------|-----------------------------------|----------|
| **分流媒体**<br>(Netflix / YouTube / Disney+ / 4K/8K 视频) | **fastest-recent** 或 **latency-banded** | 媒体对延迟 + 稳定性要求高，优先最近 ShortRTT 低的节点；latency-banded 按延迟分档（<50ms 优先），减少卡顿缓冲。 | weighted-random top-5<br>auto | 流量大时可配合 least-loaded 防过载；开启 LightGBM 让权重更准。 |
| **社交软件**<br>(Telegram / WhatsApp / Discord / IG / Twitter) | **sticky-session** 或 **weighted-random top-5** | 需要会话保持（登录态不掉、TLS 复用高）；sticky 最大化复用同一节点，weighted-random 兼顾稳定与防封。 | auto<br>strict-best | Telegram 特别推荐 sticky，避免随机 IP 导致问题。 |
| **游戏**<br>(原神、Valorant、LOL、FPS 等) | **fastest-recent** 或 **latency-banded** (<50ms 档优先) | 极度敏感延迟和抖动，fastest-recent 反应最快；latency-banded 确保只用低延迟节点。 | least-loaded (高并发多开时) | 建议单独准备低延迟节点池；收集数据后效果更好。 |
| **下载**<br>(BT / 大文件 / 高速下载) | **least-loaded** 或 **p2c** | 高并发、长连接场景，least-loaded 选最空闲节点；p2c 是理论最优负载均衡，能充分利用带宽。 | weighted-rr<br>round-robin | 配合 CDN/下载规则集，把大流量分到高带宽节点。 |
| **AI**<br>(ChatGPT / Claude / Gemini / Grok / DeepSeek 等) | **sticky-session** 或 **strict-best** | 对会话连续性要求高（上下文不中断），sticky 最大化 TLS 复用；strict-best 保证响应速度和稳定性。 | weighted-random top-5<br>auto | AI 流量常被针对，strict-best 可降低被封风险。 |

### 算法快速对照（所有可用 algorithm）

- **auto**：默认，系统智能选择（推荐大多数情况）
- **strict-best**：只选当前权重最高的最优节点（最保守）
- **weighted-random top-5**：权重前5内按权重随机抽样（分散流量）
- **least-loaded top-3**：前3内活跃连接最少的节点（高并发负载均衡）
- **fastest-recent top-5**：前5内最近 ShortRTT 最低的节点（低延迟优先）
- **sticky-session**：同一目标尽量保持上次节点（会话粘性强）
- **round-robin**：纯轮询
- **weighted-rr**：按权重比例轮询
- **p2c**：抽2比1，挑更优（理论最优负载均衡）
- **latency-banded**：按 <50 / 50-150 / >150ms 三档随机
