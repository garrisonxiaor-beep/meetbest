# 练有据

移动端优先的健身知识与工具网站：动作检索、训练计划、饮食计算、补剂科普。前端使用 React + TypeScript，Node.js 服务提供公开只读 API，SQLite 保存内容。视频教程通过来源链接打开对应平台。

首版已于 **2026-10-20** 部署，可通过 [IP 预览](http://47.108.251.149/) 访问。包含 36 个动作（15 个有真实外部视频、21 个暂为文字讲解）、8 类补剂科普与选择建议、每周三天／四天两套计划，以及成人饮食估算工具。补剂建议以成分和使用情境为主，未做具体商品排名。

公网首页和 API、服务重启后的内容持久化、首次数据库备份均已验证。域名按用户要求暂不接入；当前为 HTTP。详细验收与维护信息见 [DEPLOYMENT.md](DEPLOYMENT.md)。

部署目标是用户提供的阿里云轻量服务器 `47.108.251.149`（2 vCPU / 2 GiB / 40 GiB，Alibaba Cloud Linux 3.2104 U12）。镜像预装宝塔面板；本项目采用独立 Node 运行时、系统 Nginx 和 systemd 服务，宝塔面板配置保持独立。应用的实际部署与外网验收状态以验收记录为准。

| 运行组件 | 当前服务器路径 |
| --- | --- |
| Node.js 22.23.3 LTS | `/opt/fitness-runtime/current/bin/node` |
| Nginx 1.24.0 | `/usr/sbin/nginx`，由 `nginx.service` 管理 |
| Nginx 主配置 | `/etc/nginx/nginx.conf` |
| 本项目站点配置 | `/etc/nginx/conf.d/fitness-site.conf` |
| 应用当前版本 | `/opt/fitness-site/current` |
| SQLite 与备份 | `/var/lib/fitness-site/` |

Node 来自[官方 v22.23.3 发行包](https://nodejs.org/dist/v22.23.3/)，已按官方 `SHASUMS256.txt` 校验 Linux x64 包；校验记录保存在 `/opt/fitness-runtime/node-v22.23.3-linux-x64.sha256`。系统新增的包仅为 `nginx`、`nginx-filesystem`（均 `1.24.0-3.0.1.2.al8.1`）和 `alinux-logos-httpd`（`82.0-1.1.al8`），来自阿里云 Linux 软件源。

## 本地运行

需要 Node.js **22.13 或以上**，并提供内置 `node:sqlite`。开发依赖在本地安装；生产服务器只运行已构建文件。

```bash
npm ci
npm run check:content
npm test
bash deploy/check-release-pointer.sh
npm run build
npm start
```

打开 `http://127.0.0.1:3100`。第一次使用空数据库会导入 `content/seed.json`。修改内容文件后需要显式运行导入命令；已有数据库不会被每次启动覆盖。

需要前端热更新时，在第二个终端执行 `npm run dev`，打开 `http://127.0.0.1:5173`；API 请求代理到仍在运行的 `3100` 端口。

## 数据与内容

`content/seed.json` 是动作、视频来源、补剂文章、训练计划的结构化内容源。条目应保留真实来源和复核日期；尚未核验的视频不应伪造作品 ID。补剂文章应区分成分证据、使用情境和注意事项，具体商品推荐需要独立核验配方与规格。

```bash
npm run check:content
npm run db:import
npm run db:backup -- /tmp/fitness-backup.sqlite
```

导入器先校验，再在一个事务内按 ID 更新或新增记录，保留数据文件中未涉及的既有记录。运行中的 SQLite 使用一致性快照备份；不要只复制运行中的 `.db` 文件，因为 WAL 中可能还有未合并的数据。

生产配置位于 `/opt/fitness-site/shared/fitness.env`，初始模板在 `deploy/fitness.env.example`。生产数据库固定为 `/var/lib/fitness-site/fitness.db`，与代码版本分开保存。

公开 API 只读：

| 接口 | 用途 |
| --- | --- |
| `GET /api/health` | 服务和数据库健康检查、内容数量 |
| `GET /api/content` | 前端所需内容 |
| `GET /api/exercises` | 动作列表 |
| `GET /api/supplements` | 补剂列表 |

首版通过受信任的服务器命令导入内容，没有公开写入接口或在线管理员后台。数据库文件、配置文件和备份均放在网页可访问目录之外。

## 部署到服务器

先通过已有 SSH 密钥或云控制台授权登录；不要把密码、私钥或令牌提交到仓库。以下命令假定 SSH 已配置可用，用户名为 `root`；当前服务器已有用户授权的部署公钥。若实际使用其他具有 sudo 权限的用户，替换对应用户名。

在本地项目目录构建并打包：

```bash
npm ci
npm run check:content
npm test
npm run build
tar -czf /tmp/fitness-site.tar.gz package.json dist server scripts content deploy README.md
scp /tmp/fitness-site.tar.gz root@47.108.251.149:/tmp/fitness-site.tar.gz
```

登录服务器后，将压缩包解开到一个新的暂存目录：

```bash
fitness_stage=$(mktemp -d /tmp/fitness-site-stage.XXXXXX)
tar -xzf /tmp/fitness-site.tar.gz -C "$fitness_stage"
/opt/fitness-runtime/current/bin/node --version
```

当前服务器使用隔离安装的 Node，不依赖全局 `node` 命令。在其他服务器部署时，替换为满足版本要求的实际绝对路径；该路径需要能被普通服务账号访问，不能位于 `/root` 或 `/home` 下。

```bash
sudo env NODE_BIN=/opt/fitness-runtime/current/bin/node bash "$fitness_stage/deploy/install.sh" "$fitness_stage" --enable-backup-timer
curl --fail http://127.0.0.1:3100/api/health
sudo systemctl status fitness-site.service --no-pager
```

安装器会：

- 检查 Linux、systemd、Node/SQLite、端口和目录所有权；发现同名但不属于此项目的目录、账号或服务会退出。
- 创建 `fitness-site` 普通系统账号，将代码放到 `/opt/fitness-site/releases/`，通过 `current` 链接切换版本。
- 将数据库和备份放到 `/var/lib/fitness-site/`，服务仅监听 `127.0.0.1:3100`，并配置开机启动。
- 更新前制作数据库快照；健康检查失败时恢复上一个代码版本。显式内容导入不会随代码自动回退。
- 使用 `--enable-backup-timer` 时启用每日备份，并立即验证一次备份任务。

安装器不会安装或升级 Node、Nginx、宝塔，也不会修改 Nginx 主配置、宝塔已有网站、防火墙或证书。当前服务器的 Node 与系统 Nginx 已独立准备；其他服务器若前置软件缺失，按提示明确安装后再运行。

系统 Nginx 通过 `/etc/nginx/conf.d/fitness-site.conf` 将请求代理到 `http://127.0.0.1:3100`。当前服务器的配置源文件是 `deploy/nginx-site.conf`，包含 gzip、独立访问日志和错误日志；`deploy/nginx-site.example.conf` 保留通用参考。站点监听 IPv4/IPv6 的 80 端口，显式声明 `default_server`，`server_name` 为服务器公网 IP。发行版主配置原有默认站点没有 `default_server` 标记，两者可以并存；迁移到其他服务器前先检查是否已有显式默认站点。配置完成后先运行 `sudo nginx -t`，再启动或重载 `nginx.service`。

如未来改由宝塔管理 Nginx，应先迁移现有站点和服务，避免两套 Nginx 争用 80/443。已有宝塔站点仅参考模板中的 `location /`，保留该站点的证书与 ACME 配置。不要把 `/opt/fitness-site`、`/var/lib/fitness-site` 或备份目录设为网站根目录。

域名解析到 `47.108.251.149`，将已备案的域名加入此站点 `server_name`，再配置域名证书和 HTTPS。阿里云要求中国内地服务器对外提供网站服务前完成备案，详见[官方使用须知](https://www.alibabacloud.com/help/zh/simple-application-server/product-overview/usage-notes)。当前域名与 HTTPS 尚未配置，IP 地址仅用于部署验收，不能替代域名备案。

当前专用部署公钥禁止端口转发，不能用它建立 SSH 预览隧道。本地预览可按上面的本地运行步骤直接启动。

## 更新、备份与排查

更新代码时重新构建、上传到新的暂存目录，再执行安装器。已有内容保持不变；要同步最新 `content/seed.json`，显式添加 `--import-content`：

```bash
sudo env NODE_BIN=/opt/fitness-runtime/current/bin/node bash "$fitness_stage/deploy/install.sh" "$fitness_stage" --import-content --enable-backup-timer
sudo journalctl -u fitness-site.service -n 80 --no-pager
sudo systemctl list-timers fitness-site-backup.timer --no-pager
sudo systemctl start fitness-site-backup.service
sudo journalctl -u fitness-site-backup.service -n 30 --no-pager
```

每日任务按 **Asia/Shanghai 03:30** 触发，最多随机延迟 5 分钟；保留约 14 天的每日快照。更新前的 `predeploy-*` 快照和旧代码版本不会自动删除，需在确认新版本稳定后按需清理，避免占满 40 GiB 磁盘。

**定时任务目前只提供同机备份，异地目的地尚未配置。** 上线时应将生成的快照同步到另一个存储位置，再验证可恢复性。SQLite 快照是业务数据，不应放到可公开下载的 URL。

代码回退可将 `current` 指向一个已验证的旧版本，再重启服务；恢复数据库前先停止服务并保留当前数据库及 `-wal`、`-shm` 文件，确认目标快照后再操作。代码和数据库恢复分别处理，避免覆盖新产生的数据。

部署验收应实际完成：首页及详情可访问、API 健康、搜索/筛选/计算正常、服务重启后数据保留、备份文件可读取，以及 iOS/Android 真机的抖音链接跳转。桌面预览或链接存在不能替代真机跳转验证。
